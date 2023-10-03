import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {db} from "./db";
import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Wordpress from "next-auth/providers/wordpress";
import { nanoid } from "nanoid";


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",    // Use JWTs instead of database sessions
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({    // Use Google OAuth for sign-in
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Wordpress({  // Use Wordpress OAuth for sign-in
            clientId: process.env.WORDPRESS_CLIENT_ID!,
            clientSecret: process.env.WORDPRESS_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
                session.user.username = token.username;
            }
            return session;
        },
        async jwt({ token, user }) {
            const dbUser = await db.user.findFirst({
                where: { email: token.email, },
            })
            if (!dbUser) {
                token.id = user!.id;
                return token;
            }
            if(!dbUser.username){
                await db.user.update({
                    where: { id: dbUser.id },
                    data: { username: nanoid(10) },
                })
            }
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image,
                username: dbUser.username,
            };
        },
        redirect() {
            return '/'
        }
    },
        
}

export const getAuthSession = () => getServerSession(authOptions)
