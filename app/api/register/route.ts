import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();
    await connectToDatabase();

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true, user: { id: newUser._id, name: newUser.name } });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
