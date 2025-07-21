import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          },
          include: {
            role: true,
          },
        });
        if (user.status !== "ACTIVE") {
          throw new Error(
            "Your account is not active. Please complete your profile."
          );
        }
        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          // Return user object with all needed fields
          return {
            id: user.id,
            name: user.firstname,
            email: user.email,
            role: user.role.name,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user's info to the token
      if (user) {
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Make the role, name, and email available in the session
      if (token) {
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
