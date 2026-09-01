import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Public paths a logged-out visitor may reach. Everything else redirects to /login.
// The landing page is now a free, no-login game review tool; the rest of the app
// (play, puzzles, learn, analysis, dashboard, stats) requires a real account.
const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/privacy",
  "/terms",
  "/credits",
  "/demo",
  "/review",
  "/stockfish",
  "/stockfish-mv",
  "/wasm",
  "/badges",
  "/puzzle_shards",
  "/_next",
];

function isPublic(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return PUBLIC_PREFIXES.some((p) => {
    if (p === "/") return clean === "/";
    return clean === p || clean.startsWith(`${p}/`);
  });
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://tablebase.lichess.ovh",
  ];
  if (isDev) connectSrc.push("ws://localhost:* http://localhost:*");

  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' blob: data: https://lh3.googleusercontent.com https://nowpayments.io;
    connect-src ${connectSrc.join(" ")};
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? "" : "upgrade-insecure-requests;"}
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applySecurityHeaders(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
}

async function handler(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const pathname = request.nextUrl.pathname;

  // Gate the app behind login (guest accounts removed — an authenticated
  // Google/GitHub session is required). The landing page + public assets stay free.
  if (!isPublic(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redirect = NextResponse.redirect(url);
      applySecurityHeaders(redirect, csp);
      return redirect;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  applySecurityHeaders(response, csp);

  return response;
}

export default handler;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
