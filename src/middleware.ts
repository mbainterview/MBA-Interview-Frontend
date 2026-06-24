import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/(app)", "/onboarding", "/admin"];

// Routes only accessible when NOT authenticated
const AUTH_ROUTES = ["/sign-in"];

// Public routes within otherwise protected prefixes
const PUBLIC_EXCEPTIONS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has("access_token");

  // Allow public exceptions (like admin login)
  const isPublicException = PUBLIC_EXCEPTIONS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if the path is a protected route
  const isProtected =
    !isPublicException &&
    (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    // (app) group routes render without the prefix in the URL
    [
      "/dashboard",
      "/analytics",
      "/billing",
      "/history",
      "/settings",
      "/mock-interview",
      "/kira",
    ].some((route) => pathname.startsWith(route)));

  // Check if the path is an auth-only route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Not logged in → redirect to sign-in
  if (isProtected && !hasToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Already logged in → redirect away from auth pages
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/billing/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/mock-interview/:path*",
    "/kira/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/sign-in",
    "/sign-in/:path*",
  ],
};
