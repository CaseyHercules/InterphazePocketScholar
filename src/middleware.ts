import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";

// Add paths that require specific roles
const ADMIN_PATHS = ["/admin"];
const MODERATOR_PATHS = ["/moderate"];
const SPELLWRIGHT_PATHS = ["/spells/edit"];

// Add paths that should be publicly accessible
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/sign-up",
  "/auth",
  "/unauthorized",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/public",
  "/terms",
  "/privacy",
  "/assets",
  "/images",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the path is public
  if (
    PUBLIC_PATHS.some((path) => {
      // Exact match for root path
      if (path === "/" && pathname === "/") return true;
      // Prefix match for other paths
      if (path !== "/" && pathname.startsWith(path)) return true;
      return false;
    })
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  // For API routes, return appropriate status codes
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check role-based access for API routes
    if (
      ADMIN_PATHS.some((path) => pathname.includes(path)) &&
      !token.isAdmin &&
      !token.isRoot
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (
      MODERATOR_PATHS.some((path) => pathname.includes(path)) &&
      !token.isModerator &&
      !token.isAdmin &&
      !token.isRoot
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (
      SPELLWRIGHT_PATHS.some((path) => pathname.includes(path)) &&
      !token.isSpellWright &&
      !token.isAdmin &&
      !token.isRoot
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.next();
  }

  // Handle page routes
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for page routes
  if (
    ADMIN_PATHS.some((path) => pathname.startsWith(path)) &&
    !token.isAdmin &&
    !token.isRoot
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (
    MODERATOR_PATHS.some((path) => pathname.startsWith(path)) &&
    !token.isModerator &&
    !token.isAdmin &&
    !token.isRoot
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (
    SPELLWRIGHT_PATHS.some((path) => pathname.startsWith(path)) &&
    !token.isSpellWright &&
    !token.isAdmin &&
    !token.isRoot
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static assets (images, icons, etc)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|apple-touch-icon\\.png|favicon-\\d+x\\d+\\.png|logo\\.svg|public).*)",
  ],
};
