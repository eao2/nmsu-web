// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { downloadAndSaveProfileImage } from './image-downloader'; // your existing helper

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
    async signIn({ user }) {
      if (!user.email) return false;

      const isAllowedDomain = allowedDomains.some((domain) =>
        user.email!.endsWith(domain)
      );

      if (!isAllowedDomain) {
        return '/signin?error=domain';
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role;
        session.user.profileComplete = (user as any).profileComplete;
        session.user.image = (user as any).image; // ensure DB image used
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },

  // 👇 Add the events here
  events: {
    // This runs right after a new user is created in the DB
    async createUser({ user }) {
      try {
        // If the user came from Google and has a picture, download it
        if (user.image && user.id) {
          console.log('Downloading Google profile image for new user:', user.email);
          const newImageUrl = await downloadAndSaveProfileImage(user.image, user.id);

          await prisma.user.update({
            where: { id: user.id },
            data: { image: newImageUrl },
          });

          console.log(`Profile image saved for new user: ${newImageUrl}`);
        }
      } catch (error) {
        console.error('❌ Failed to download image for new user:', user.id, error);
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
