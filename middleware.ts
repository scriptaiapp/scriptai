import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let res = NextResponse.next({
    request
  })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          res = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Session:", session)

  // Check auth condition
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Redirect if user is not authenticated
    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is signed in and the current path is /login or /signup, redirect to /dashboard
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
