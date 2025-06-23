import NextAuth, {
  NextAuthConfig,
  User as NextAuthUser,
  Session,
} from "next-auth";
import GitHub from "next-auth/providers/github";

// Extend the User type to include 'role'
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user?: User;
  }
}

const adminEmails = ["iceesar@live.com"];

export const config = {
  providers: [GitHub],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email && adminEmails.includes(user.email)) {
        token.role = "admin"; // Adiciona a role 'admin' ao token
      }
      return token;
    },
    async session({ session, token }) {
      // Adicionamos a role do token para o objeto de sessão.
      if (session?.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
