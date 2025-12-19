// [...nextauth].ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  debug: true,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectDB();

        const identifier = credentials.identifier.toLowerCase();

        const user = await User.findOne(
          identifier.includes("@") ? { email: identifier } : { username: identifier }
        );

        if (!user) throw new Error("Invalid credentials");
        if (!user.emailVerified) throw new Error("Email not verified");

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
          image: user.profilePicture,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      if (account?.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const username = profile?.email.split("@")[0].toLowerCase();
          const newUser = await User.create({
            username,
            email: user.email,
            name: user.name,
            profilePicture: user.image, // Google profile image
            provider: "google",
            providerId: account.providerAccountId,
            emailVerified: true,
          });
          console.log("Google user created:", newUser);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      await connectDB();

      if (user) {
        const dbUser = await User.findOne({ email: user.email });

        token.id = dbUser?._id.toString() || user.id;
        token.role = dbUser?.role || user.role;
        token.username = dbUser?.username || user.username;
        token.image = dbUser?.profilePicture || user.image;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.username = token.username;
      session.user.image = token.image;
      return session;
    },
  },

  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
