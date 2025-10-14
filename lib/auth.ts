// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedDomains = process.env.ALLOWED_DOMAINS?.split(",") || [];
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const isAllowed = allowedDomains.some((d) => user.email!.endsWith(d));
      if (!isAllowed) return "/signin?error=domain";

      try {
        await fetch(`${apiUrl}/api/user/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
      } catch (err) {
        console.error("Failed to sync user to backend:", err);
      }

      return true;
    },

    async session({ session }) {
      try {
        const email = session.user?.email;
        if (email) {
          const res = await fetch(`${apiUrl}/api/user/session?email=${email}`);
          const data = await res.json();
          session.user = { ...session.user, ...data };
        }
      } catch (err) {
        console.warn("Could not enrich session:", err);
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  session: {
    strategy: "jwt",
  },
};