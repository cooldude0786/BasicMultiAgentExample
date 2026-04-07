import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
    };
  }

  interface User {
    role: string;
    approved: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
