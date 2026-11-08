import { NextRequest, NextResponse } from "next/server";
import {
  authConfigurationError,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/health"
  ) {
    return NextResponse.next();
  }

  if (authConfigurationError()) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentification non configurée. Consultez le README." },
        { status: 503 },
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
