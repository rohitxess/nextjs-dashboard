import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';

// providers is a function where we can list different type of login options including google and github 

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require'});

// function to get the user from the database

async function getUser(email: string): Promise<User | undefined> {
    try {
      const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
      return user[0];
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
  }
// authorize function to handle authentication logic 
// zod to validate email and password 
//

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
      Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ 
                email: z.string().email(),
                password: z.string().min(6) })
            .safeParse(credentials);

            if (parsedCredentials.success){
                const {email, password} = parsedCredentials.data;
                const user = await getUser(email);
                if (!user) return null;
                const passwordsMatch = await bcrypt.compare(password, user.password)

                if (passwordsMatch) return user;
            }
            console.log('Invalid credentials');
            return null;
        },
      }),
    ],
  });