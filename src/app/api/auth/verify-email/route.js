import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const NEXT_APP_URL = process.env.NEXTAUTH_URL;

export async function GET(req) {
  try {
    await connectDB();
    const url = req.url;
    const { searchParams } = new URL(url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token is missing" }, { status: 400 });
    }

    const user = await User.findOne({
      verificationToken: token,
    });
    if (!user) {
      return NextResponse.json({ message: "Invalid token." }, { status: 400 });
    }

    if (user.verificationTokenExpiry <= Date.now()) {
      await user.deleteOne();
      return NextResponse.json(
        { message: "Token expired. Try signing up again." },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({ message: "Email verified. goto login" });
    // return NextResponse.redirect(new URL("/login", NEXT_APP_URL));
  } catch (err) {
    console.log("Email verification error: ", err);
    return NextResponse.json({ message: "Email Verification Error." }, { status: 500 });
  }
}
