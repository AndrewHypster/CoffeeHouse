import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { eq } from "drizzle-orm";

import { db } from "./db";
import { users } from "./db/schema";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // async signIn({ user }) {
    //   if (!user.email) return false;

    //   const existingUser = await db.query.users.findFirst({
    //     where: eq(users.mail, user.email),
    //   });

    //   if (!existingUser) {
    //     await db.insert(users).values({
    //       name: user.name,
    //       mail: user.email,
    //       role: "user",
    //     });
    //   }

    //   return true;
    // },

    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await db.query.users.findFirst({
        where: eq(users.mail, user.email),
      });

      if (existing) return true;

      return `/link-account?email=${encodeURIComponent(user.email)}`;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.mail, user.email),
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
