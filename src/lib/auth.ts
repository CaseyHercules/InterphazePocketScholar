import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import type { OAuthConfig } from "next-auth/providers";
import { autoAssignPassportsForEmail } from "@/lib/passport-claim";

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
    }),
    wordPressProvider,
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) {
        console.error("[auth] signIn: missing account");
        return false;
      }
      if (!user.email || typeof user.email !== "string" || !user.email.includes("@")) {
        console.error("[auth] signIn: missing or invalid email", {
          provider: account.provider,
          hasEmail: !!user.email,
        });
        return false;
      }
      if (account.provider === "wordpress" && user.email.endsWith("@interphaze.org")) {
        console.error("[auth] signIn: WordPress returned placeholder email; userinfo may not include email scope");
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
        session.user.role = token.role || Role.USER;
        session.user.isAdmin = token.isAdmin;
        session.user.isRoot = token.isRoot;
        session.user.isSpellWright = token.isSpellWright;
        session.user.isModerator = token.isModerator;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (!token.email) return token;

      const dbUser = await db.user.findFirst({
        where: { email: token.email },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        username: dbUser.username,
        role: dbUser.role || Role.USER,
        isAdmin: dbUser.role === Role.ADMIN,
        isRoot: dbUser.role === Role.SUPERADMIN,
        isSpellWright: dbUser.role === Role.SPELLWRIGHT,
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
