import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import type { OAuthConfig } from "next-auth/providers/oauth";
import { autoAssignPassportsForEmail } from "@/lib/passport-claim";
import { canReviewSpells } from "@/lib/spell-queries";

const isProduction = process.env.NODE_ENV === "production";
const localAuthUrl = (process.env.NEXTAUTH_URL_LOCAL ?? "").trim();
if (!isProduction) {
  const configuredAuthUrl = (process.env.NEXTAUTH_URL ?? "").trim();
  if (localAuthUrl) {
    process.env.NEXTAUTH_URL = localAuthUrl;
  } else if (
    configuredAuthUrl &&
    !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredAuthUrl)
  ) {
    const fallbackAuthUrl = `http://localhost:${process.env.PORT || "3000"}`;
    console.warn(
      `[auth] NEXTAUTH_URL points to a non-local origin in development (${configuredAuthUrl}). Falling back to ${fallbackAuthUrl}. Set NEXTAUTH_URL_LOCAL to override.`
    );
    process.env.NEXTAUTH_URL = fallbackAuthUrl;
  }
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : null;
}

const getEnv = (key: string) => (process.env[key] ?? "").trim();

const requiredAuthEnv = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;
const requiredGoogleEnv = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;
const requiredWordPressEnv = [
  "WORDPRESS_API_URL",
  "WORDPRESS_CLIENT_ID",
  "WORDPRESS_CLIENT_SECRET",
] as const;
const AUTH_DEBUG_ENABLED =
  !isProduction || process.env.NEXTAUTH_DEBUG === "true";

function validateAuthEnv() {
  const missing = requiredAuthEnv.filter((k) => !getEnv(k));
  if (missing.length > 0) {
    const message = `[auth] Missing required env: ${missing.join(", ")}. OAuth callbacks may fail.`;
    if (isProduction) {
      throw new Error(message);
    }
    console.error(message);
  }
  const authUrlRaw = getEnv("NEXTAUTH_URL");
  if (!authUrlRaw) return;
  try {
    const parsed = new URL(authUrlRaw);
    if (isProduction && parsed.protocol !== "https:") {
      throw new Error("[auth] NEXTAUTH_URL must use https in production.");
    }
  } catch {
    throw new Error(`[auth] NEXTAUTH_URL is invalid: ${authUrlRaw}`);
  }
}

function validateGoogleEnv() {
  const googleId = getEnv("GOOGLE_CLIENT_ID");
  const googleSecret = getEnv("GOOGLE_CLIENT_SECRET");
  const hasPartial = Boolean(googleId) !== Boolean(googleSecret);
  if (hasPartial) {
    const message =
      "[auth] Incomplete Google env. Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.";
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(message);
  }
  const missing = requiredGoogleEnv.filter((k) => !getEnv(k));
  if (missing.length > 0) {
    console.warn(
      `[auth] Missing Google env: ${missing.join(", ")}. Google OAuth will not work.`
    );
  }
}

function getWordPressBaseUrl(): string {
  const url = getEnv("WORDPRESS_API_URL");
  if (!url) return "";
  return url.replace(/\/wp-json\/?$/i, "");
}

function validateWordPressEnv() {
  const wpValues = requiredWordPressEnv.map((k) => getEnv(k));
  const presentCount = wpValues.filter(Boolean).length;
  if (presentCount > 0 && presentCount < requiredWordPressEnv.length) {
    const message =
      "[auth] Incomplete WordPress env. Set WORDPRESS_API_URL, WORDPRESS_CLIENT_ID, and WORDPRESS_CLIENT_SECRET together.";
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(message);
  }
  const missing = requiredWordPressEnv.filter((k) => !getEnv(k));
  if (missing.length > 0) {
    console.warn(
      `[auth] Missing WordPress env: ${missing.join(", ")}. WordPress OAuth will not work.`
    );
  }
}

validateAuthEnv();
validateGoogleEnv();
validateWordPressEnv();

function createWordPressProvider(): OAuthConfig<any> | null {
  const wpBaseUrl = getWordPressBaseUrl();
  const clientId = getEnv("WORDPRESS_CLIENT_ID");
  const clientSecret = getEnv("WORDPRESS_CLIENT_SECRET");
  if (!wpBaseUrl || !clientId || !clientSecret) {
    return null;
  }
  const wpApiUrl = getEnv("WORDPRESS_API_URL") || wpBaseUrl + "/wp-json";
  return {
    id: "wordpress",
    name: "WordPress",
    type: "oauth",
    token: `${wpBaseUrl}/oauth/token`,
    userinfo: `${wpApiUrl}/wp/v2/users/me?context=edit`,
    clientId,
    clientSecret,
    authorization: {
      url: `${wpBaseUrl}/oauth/authorize`,
      params: { scope: "basic email profile" },
    },
    async profile(profile: any, _tokens: any) {
      const email = normalizeEmail(
        profile.OAuthProfile?.email ?? profile.email ?? null
      );
      if (!email) {
        console.error("[auth] WordPress profile missing valid email", {
          hasOAuthProfile: !!profile.OAuthProfile,
          hasEmail: !!profile.email,
          profileId: profile?.id ?? null,
        });
        return {
          id: String(profile.id),
          name: profile.name || profile.slug || "User",
          email: undefined,
          image: profile.avatar_urls?.["96"] || null,
          role: Role.USER,
        };
      }
      return {
        id: String(profile.id),
        name: profile.name || profile.slug || email.split("@")[0],
        email,
        image: profile.avatar_urls?.["96"] || null,
        role: Role.USER,
      };
    },
    client: {
      token_endpoint_auth_method: "client_secret_basic",
    },
    checks: ["state"],
  };
}

function buildOAuthProviders(): NextAuthOptions["providers"] {
  const list: NextAuthOptions["providers"] = [];

  const googleId = getEnv("GOOGLE_CLIENT_ID");
  const googleSecret = getEnv("GOOGLE_CLIENT_SECRET");
  if (googleId && googleSecret) {
    list.push(
      GoogleProvider({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
        profile(profile) {
          const email = normalizeEmail(profile.email);
          if (!email) {
            console.error("[auth] Google profile missing valid email", {
              profileSub: profile?.sub ?? null,
              hasEmail: !!profile?.email,
            });
          }
          return {
            id: profile.sub,
            name: profile.name,
            email: email ?? undefined,
            image: profile.picture,
            role: Role.USER,
          };
        },
      })
    );
  }

  const wp = createWordPressProvider();
  if (wp) {
    list.push(wp);
  }

  return list;
}

const oauthProviders = buildOAuthProviders();
if (oauthProviders.length === 0) {
  const message =
    "[auth] No OAuth providers are configured; set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and/or WordPress OAuth env vars.";
  if (isProduction) {
    throw new Error(message);
  }
  console.error(message);
}

export function getEnabledOAuthProviders(): {
  google: boolean;
  wordpress: boolean;
} {
  return {
    google: Boolean(
      getEnv("GOOGLE_CLIENT_ID") && getEnv("GOOGLE_CLIENT_SECRET")
    ),
    wordpress: Boolean(
      getWordPressBaseUrl() &&
        getEnv("WORDPRESS_CLIENT_ID") &&
        getEnv("WORDPRESS_CLIENT_SECRET")
    ),
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  debug: AUTH_DEBUG_ENABLED,
  logger: {
    error(code, metadata) {
      console.error("[next-auth:error]", code, metadata ?? "");
    },
    warn(code) {
      console.warn("[next-auth:warn]", code);
    },
    debug(code, metadata) {
      if (AUTH_DEBUG_ENABLED) {
        console.log("[next-auth:debug]", code, metadata ?? "");
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/login",
  },
  providers: oauthProviders,
  callbacks: {
    async signIn({ user, account }) {
      if (!account) {
        console.error("[auth] signIn: missing account");
        return false;
      }
      const email = normalizeEmail(user.email);
      if (!email) {
        console.error("[auth] signIn: missing or invalid email", {
          provider: account.provider,
          hasEmail: !!user.email,
          userId: user.id ?? null,
        });
        return false;
      }
      return true;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.username = token.username;
        const role = token.role || Role.USER;
        session.user.role = role;
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.isRoot = Boolean(token.isRoot);
        session.user.isSpellWright = Boolean(token.isSpellWright);
        session.user.canReviewSpells =
          token.canReviewSpells ?? canReviewSpells(role);
        session.user.isModerator = Boolean(token.isModerator);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      const email =
        normalizeEmail(user?.email as string | undefined) ??
        normalizeEmail(token.email as string | undefined);
      if (!email) {
        if (user || account) {
          console.error("[auth] jwt: missing normalized email on auth flow", {
            provider: account?.provider ?? null,
            hasUser: Boolean(user),
            hasTokenEmail: Boolean(token.email),
          });
        }
        return token;
      }
      token.email = email;

      const dbUser = await db.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

      if (!dbUser) {
        if (user?.id) {
          token.id = user.id;
        }
        token.role = Role.USER;
        token.isAdmin = false;
        token.isRoot = false;
        token.isSpellWright = false;
        token.canReviewSpells = false;
        token.isModerator = false;
        return token;
      }

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email ?? email,
        picture: dbUser.image,
        username: dbUser.username,
        role: dbUser.role || Role.USER,
        isAdmin: dbUser.role === Role.ADMIN,
        isRoot: dbUser.role === Role.SUPERADMIN,
        isSpellWright: dbUser.role === Role.SPELLWRIGHT,
        canReviewSpells: canReviewSpells(dbUser.role),
        isModerator: dbUser.role === Role.MODERATOR,
      };
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        console.warn("[auth] redirect: invalid url", url);
      }
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      let username = nanoid(10);
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: {
              username,
              UnallocatedLevels: 0,
              UnrequestedSkills: 0,
              role: Role.USER,
            },
          });
          return;
        } catch (err: any) {
          if (err?.code === "P2002" && err?.meta?.target?.includes("username")) {
            username = nanoid(10);
            continue;
          }
          console.error("[auth] createUser: failed to set username/role", err);
          return;
        }
      }
      console.error("[auth] createUser: username collision after retries");
    },
    async signIn({ user }) {
      if (user?.id && user?.email) {
        autoAssignPassportsForEmail(user.id, user.email).catch((err) =>
          console.error("[auth] autoAssignPassportsForEmail failed", err)
        );
      }
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
