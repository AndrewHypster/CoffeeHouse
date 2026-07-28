import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.mail, user.email),
        });

        if (!existingUser) {
          await db.insert(users).values({
            name: user.name,
            mail: user.email,
            role: "user",
          });
        }
      } catch (err) {
        // If DB query fails (schema mismatch or connection issue),
        // don't block authentication — log and allow sign-in to continue.
        console.error("Auth signIn DB error:", err);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.mail, user.email),
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (err) {
          console.error("Auth jwt DB error:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

export const handlers = {
  GET: handler,
  POST: handler,
};

export default handler;
