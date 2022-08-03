import NextAuth, { type NextAuthOptions } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { routes } from "../../../constants/routes";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub; // user id
      }

      return session;
    },
  },
  pages: {
    signIn: routes.AUTH.LOGIN,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john.doe@pastecode.app",
          value: "",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "**************",
          value: "",
        },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });

        return user;
      },
    }),
  ],
};

export default NextAuth(authOptions);
