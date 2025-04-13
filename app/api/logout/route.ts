import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ success: true });

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // Expire the cookie
  });

  return response;
}
