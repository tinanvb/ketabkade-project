import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { emailRegex, phoneNumberRegex } from "@/app/utils/regex";
import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { hashOtp } from "@/app/utils/hashOtp";

export const authOptions = {
  providers: [
    CredentialProvider({
      id: "credentials",
      name: "Credentials",
      async authorize(credentials) {
        await connectToDatabase();
        const { identifier, password, otpCode } = credentials;
        let user = null;

        if (emailRegex.test(identifier)) {
          user = await User.findOne({ email: identifier });
        } else if (phoneNumberRegex.test(identifier)) {
          user = await User.findOne({ phoneNumber: identifier });
        }

        if (!user) throw new Error("اطلاعات وارد شده درست نمی‌باشد");

        if (password) {
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) throw new Error("اطلاعات وارد شده درست نمی‌باشد");
          if (!user.isActive) throw new Error("ACCOUNT_NOT_ACTIVE");
          return user;
        }

        // اگر کد OTP داده بود: ورود با کد
        if (otpCode) {
          const hashedOtp = hashOtp(otpCode);
          const Otp = (await import("@/models/Otp")).default;
          const otp = await Otp.findOne({
            identifier: user.phoneNumber,
            code: hashedOtp,
          });

          if (!otp) throw new Error("کد وارد شده صحیح نیست");
          if (otp.expiresAt < new Date()) throw new Error("کد منقضی شده است");

          await Otp.deleteOne({ _id: otp._id });
          return user;
        }

        throw new Error("اطلاعات وارد شده درست نمی‌باشد");
      },
    }),
  ],
  pages: {
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.phoneNumber = user.phoneNumber;
        token.email = user.email;
        token.role = user.role;
        token.isActive = user.isActive;
        token.avatar = user.avatar;
        token.balance = user.balance;
      }
      if (trigger === "update" && session?.avatar) {
        token.avatar = session.avatar; // آواتار جدید
      }

      if (trigger === "update" && session?.user) {
        token.firstname = session.user.firstname;
        token.lastname = session.user.lastname;
        token.phoneNumber = session.user.phoneNumber;
        token.email = session.user.email;
        token.balance = session.user.balance;
      }

      return token;
    },
    async session({ session, token, trigger }) {
      await connectToDatabase();
      // خواندن balance مستقیماً از دیتابیس
      const dbUser = await User.findById(token.id).select(
        "balance firstname lastname phoneNumber email role isActive avatar"
      );
      if (dbUser) {
        session.user = {
          id: token.id,
          firstname: dbUser.firstname || token.firstname,
          lastname: dbUser.lastname || token.lastname,
          phoneNumber: dbUser.phoneNumber || token.phoneNumber,
          email: dbUser.email || token.email,
          role: dbUser.role || token.role,
          isActive: dbUser.isActive ?? token.isActive,
          avatar: dbUser.avatar || token.avatar,
          balance: dbUser.balance ?? token.balance, // اولویت با دیتابیس
        };
      } else {
        // در صورت عدم وجود کاربر در دیتابیس، از توکن استفاده شود
        session.user = {
          id: token.id,
          firstname: token.firstname,
          lastname: token.lastname,
          phoneNumber: token.phoneNumber,
          email: token.email,
          role: token.role,
          isActive: token.isActive,
          avatar: token.avatar,
          balance: token.balance,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
