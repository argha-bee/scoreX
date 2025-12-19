import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if ( !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({email});

    if (existingUser) {
      if (existingUser.verificationTokenExiry <= Date.now()) {
        await existingUser.deleteOne();
        return NextResponse.json(
          { message: "Token expired. Try signing up again." },
          { status: 400 }
        );
      }
      return NextResponse.json({ message: "User already exists. Go to login." }, { status: 400 });
    }

    const verificationToken = await bcrypt.hash(email, 10);
    const username = email.split("@")[0].toLowerCase();
    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpiry: Date.now() + 1000 * 60 * 60,
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}
