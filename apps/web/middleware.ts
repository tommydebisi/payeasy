import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

/** Add request ID and request logging for API routes; then run auth/protection. */
export async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const { method, nextUrl } = request;
  const path = nextUrl.pathname;

  // Request logging (API routes only to reduce noise)
  if (path.startsWith("/api/")) {
    console.info(`[${requestId}] ${method} ${path}`);
  }

  // Pass request ID to downstream (API routes can read from headers)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const requestWithId = new NextRequest(request.url, {
    method: request.method,
    headers: requestHeaders,
    body: request.body,
  });

  let response = NextResponse.next({ request: requestWithId });

  // Set X-Request-ID on response for client/logging
  response.headers.set("X-Request-ID", requestId);

  // Supabase session refresh and dashboard protection only when Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: requestWithId });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          response.headers.set("X-Request-ID", requestId);
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && path.startsWith("/dashboard")) {
      const url = nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
