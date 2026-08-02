// DEV MODE: auth() wrapper removed to avoid intermittent
// "adapterFn is not a function" error from NextAuth v5 + Turbopack HMR.
// Uncomment lines below when auth is needed:
//
// import { auth } from "@/lib/auth";
//
// function handler(req: any) {
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

import { NextResponse } from "next/server";

function handler() {
  const response = NextResponse.next();
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  return response;
}

export default handler;

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|privacy|terms|$).*)",
    "/stockfish-mv/:path*",
  ],
};
