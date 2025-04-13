import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/app/lib/jwt";

export function middleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/secure/:path*"],
};
