import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { generateToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken({ id: user._id });

    // Create the response object
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });

    // Set the token as an HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
