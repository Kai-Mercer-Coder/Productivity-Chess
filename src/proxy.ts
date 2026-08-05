import { type NextRequest, NextResponse } from "next/server";

// DEV MODE: auth() wrapper removed to avoid intermittent
// "adapterFn is not a function" error from NextAuth v5 + Turbopack HMR.
// Uncomment lines below when auth is needed:
//
// import { auth } from "@/lib/auth";
//
// function handler(req: NextRequest) {
//   const url = req.nextUrl.pathname;
//   const isStockfish = url.startsWith("/stockfish-mv/");
//   const isVariant = url.startsWith("/variants/");
//   const isEndgame = url.startsWith("/learn/endgames/");
//   const needsCrossOrigin = isStockfish || isVariant || isEndgame;
//
//   if (needsCrossOrigin) {
//     if (!req.auth) {
//       const response = NextResponse.redirect(new URL("/login", req.url));
//       response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
//       response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
//       return response;
//     }
//     const response = NextResponse.next();
//     response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
//     response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
//     return response;
//   }
//
//   if (!req.auth) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
//   return NextResponse.next();
// }
//
// export default auth(handler);

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://chess-api.com",
    "https://tablebase.lichess.ovh",
    "https://lichess.org",
    "https://www.chessdb.cn",
    "https://clonicalcloner-aasopd-stockfish-depth-18.hf.space",
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

function handler(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless");

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
