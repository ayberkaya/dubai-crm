import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/login"]
const protectedRoutes = ["/", "/leads", "/settings"]

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const sessionCookie = request.cookies.get("rcrm_session")

    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

    // If accessing a protected route without a session, redirect to login
    if (isProtectedRoute && !sessionCookie) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // If accessing login page with a session, redirect to home
    if (isPublicRoute && pathname === "/login" && sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
