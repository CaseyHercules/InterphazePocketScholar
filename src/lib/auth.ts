import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

const requiredGoogleEnv = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;
const getEnv = (key: string) => (process.env[key] ?? "").trim();
if (process.env.NODE_ENV === "development") {
  const missingGoogleEnv = requiredGoogleEnv.filter(
    (key) => !process.env[key]
  );
  if (missingGoogleEnv.length > 0) {
    console.warn(
      `[auth] Missing env: ${missingGoogleEnv.join(
        ", "
      )}. Google OAuth will fail on localhost.`
    );
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
    {
      id: "wordpress",
      name: "WordPress",
      type: "oauth",
      token: `${process.env.WORDPRESS_API_URL!.replace(
        "/wp-json",
        ""
      )}/oauth/token`,
      userinfo: `${process.env.WORDPRESS_API_URL!}/wp/v2/users/me?context=edit`,
      clientId: process.env.WORDPRESS_CLIENT_ID,
      clientSecret: process.env.WORDPRESS_CLIENT_SECRET,
      authorization: {
        url: `${process.env.WORDPRESS_API_URL!.replace(
          "/wp-json",
          ""
        )}/oauth/authorize`,
        params: {
          scope: "basic email profile",
        },
      },
      async profile(profile: any) {
        // Extract email from OAuthProfile
        const email = profile.OAuthProfile?.email || profile.email;

        return {
          id: profile.id.toString(),
          name: profile.name || profile.slug,
          email: email || `${profile.slug}@interphaze.org`,
          image: profile.avatar_urls?.["96"] || null,
          role: Role.USER, // Set default role
        };
      },
      client: {
        token_endpoint_auth_method: "client_secret_basic",
      },
      checks: ["none"],
    } as OAuthConfig<any>,
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email || !account) {
        console.error("SignIn failed: Missing email or account", {
          user,
          account,
        });
        return false;
      }

      try {
        // Check if user exists with this email
        const existingUser = await db.user.findFirst({
          where: { email: user.email },
          include: {
            accounts: true,
          },
        });

        if (!existingUser) {
          // Create new user if doesn't exist
          try {
            const newUser = await db.user.create({
              data: {
                email: user.email,
                name: user.name ?? user.email.split("@")[0],
                image: user.image,
                username: nanoid(10),
                role: Role.USER,
                UnallocatedLevels: 0,
                UnrequestedSkills: 0,
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    refresh_token: account.refresh_token,
                  },
                },
              },
            });
            return true;
          } catch (error) {
            return false;
          }
        }

        // If user exists but no account with this provider
        const existingAccount = existingUser.accounts.find(
          (acc) => acc.provider === account.provider
        );

        if (!existingAccount) {
          // Link new provider to existing account
          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              refresh_token: account.refresh_token,
            },
          });
        }

        // Update user information
        await db.user.update({
          where: { id: existingUser.id },
          data: {
            name: user.name,
            image: user.image,
          },
        });

        return true;
      } catch (error) {
        return false;
      }
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.username = token.username;
        session.user.role = token.role || Role.USER; // Provide default role
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
        role: dbUser.role || Role.USER, // Provide default role
        isAdmin: dbUser.role === Role.ADMIN,
        isRoot: dbUser.role === Role.SUPERADMIN,
        isSpellWright: dbUser.role === Role.SPELLWRIGHT,
        isModerator: dbUser.role === Role.MODERATOR,
      };
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.NODE_ENV === "development") {
        // console.log("Sign in success:", { user, account, isNewUser });
      }
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
