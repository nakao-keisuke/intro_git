// biome-ignore lint/correctness/noUnusedImports: module augmentation requires this import
import type NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    pass?: string;
    token?: string;
    ip?: string;
    isLogout?: boolean;
    isFirstRegister?: boolean;
    phone?: string;
    googleAccountId?: string;
    lineId?: string;
    applicationId?: string;
    scFlag?: boolean;
  }
  interface JWT {
    id: string;
    email: string;
    pass: string;
    token: string;
    name: string;
    ip: string;
    lastWebLoginTime: number;
    isLogout: boolean;
    isFirstRegister: boolean;
    phone?: string;
    googleAccountId?: string;
    lineId?: string;
    applicationId?: string;
    scFlag?: boolean;
  }
}
