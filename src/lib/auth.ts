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

function validateAuthEnv() {
  const missing = requiredAuthEnv.filter((k) => !getEnv(k));
  if (missing.length > 0) {
    console.error(
      `[auth] Missing required env: ${missing.join(", ")}. OAuth callbacks may fail.`
    );
  }
}

function validateGoogleEnv() {
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

const wpBaseUrl = getWordPressBaseUrl();
const wpApiUrl = getEnv("WORDPRESS_API_URL") || wpBaseUrl + "/wp-json";

const wordPressProvider: OAuthConfig<any> = {
  id: "wordpress",
  name: "WordPress",
  type: "oauth",
  token: `${wpBaseUrl}/oauth/token`,
  userinfo: `${wpApiUrl}/wp/v2/users/me?context=edit`,
  clientId: getEnv("WORDPRESS_CLIENT_ID") || undefined,
  clientSecret: getEnv("WORDPRESS_CLIENT_SECRET") || undefined,
  authorization: {
    url: `${wpBaseUrl}/oauth/authorize`,
    params: { scope: "basic email profile" },
  },
  async profile(profile: any, _tokens: any) {
    const email =
      profile.OAuthProfile?.email ?? profile.email ?? null;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.error("[auth] WordPress profile missing valid email", {
        hasOAuthProfile: !!profile.OAuthProfile,
        hasEmail: !!profile.email,
      });
      return {
        id: String(profile.id),
        name: profile.name || profile.slug || "User",
        email: "",
        image: profile.avatar_urls?.["96"] || null,
        role: Role.USER,
      };
    }
    return {
      id: String(profile.id),
      name: profile.name || profile.slug || email.split("@")[0],
      email: email.trim().toLowerCase(),
      image: profile.avatar_urls?.["96"] || null,
      role: Role.USER,
    };
  },
  client: {
    token_endpoint_auth_method: "client_secret_basic",
  },
  checks: ["state"],
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        const email = normalizeEmail(profile.email);
        return {
          id: profile.sub,
          name: profile.name,
          email: email ?? undefined,
          image: profile.picture,
          role: Role.USER,
        };
      },
    }),
    wordPressProvider,
  ],
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
    async jwt({ token, user }) {
      const email =
        normalizeEmail(user?.email as string | undefined) ??
        normalizeEmail(token.email as string | undefined);
      if (!email) {
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
