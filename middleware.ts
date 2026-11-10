import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLogin = req.nextUrl.pathname === "/admin/login";
  const loggedIn = !!req.auth;

  if (!loggedIn && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  if (loggedIn && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
