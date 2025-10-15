// // lib/auth.ts
// import { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// const allowedDomains = process.env.ALLOWED_DOMAINS?.split(",") || [];
// const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],



//   callbacks: {
//     async signIn({ user }) {
//       if (!user.email) return false;

//       const isAllowed = allowedDomains.some((d) => user.email!.endsWith(d));
//       if (!isAllowed) return "/signin?error=domain";

//       try {
//         await fetch(`${apiUrl}/api/user/sync`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(user),
//         });
//       } catch (err) {
//         console.error("Failed to sync user to backend:", err);
//       }

//       return true;
//     },

//     async session({ session }) {
//       try {
//         const email = session.user?.email;
//         if (email) {
//           const res = await fetch(`${apiUrl}/api/user/session?email=${email}`);
//           const data = await res.json();
//           session.user = { ...session.user, ...data };
//         }
//       } catch (err) {
//         console.warn("Could not enrich session:", err);
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/signin",
//     error: "/signin",
//   },

//   session: {
//     strategy: "jwt",
//   },
// };

// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const isAllowedDomain = allowedDomains.some((domain) =>
        user.email!.endsWith(domain)
      );

      if (!isAllowedDomain) {
        return '/signin?error=domain';
      }

      // Trigger image processing via API route instead of doing it here
      if (account?.provider === 'google' && user.image && user.id) {
        try {
          // Call our API route to handle image processing
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          
          await fetch(`${baseUrl}/api/user/profile/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // You'll need to pass authentication here
              // One approach is to use a server-side token or internal API key
            },
            body: JSON.stringify({
              imageUrl: user.image,
              userId: user.id,
              internal: true, // Flag to allow internal API calls
            }),
          });

          console.log('✅ Profile image processing triggered for:', user.email);
        } catch (error) {
          console.error('❌ Failed to trigger image processing:', error);
          // Don't block sign-in if image processing fails
        }
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role;
        session.user.profileComplete = (user as any).profileComplete;
        session.user.image = (user as any).image;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },

  events: {
    async createUser({ user }) {
      if (user.image && user.id && !(user as any).image.startsWith('avatars-')) {
        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

          await fetch(`${baseUrl}/api/user/profile/image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: user.image,
              userId: user.id,
              internal: true,
            }),
          });

          console.log('✅ createUser: Profile image processing triggered for:', user.email);
        } catch (error) {
          console.error('❌ createUser: Failed to trigger image processing:', error);
        }
      }
    },
  },

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  session: {
    strategy: 'database',
  },
};