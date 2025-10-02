// src/lib/auth.ts
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
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      const isAllowedDomain = allowedDomains.some(domain => 
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
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const user = await prisma.user.findFirst({
        where: { email: url.includes('email=') ? url.split('email=')[1] : '' },
      });
      
      if (user && !user.profileComplete) {
        return `${baseUrl}/profile-setup`;
      }
      
      return baseUrl;
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