import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

function handler(req: any) {
  const url = req.nextUrl.pathname;
  const isStockfish = url.startsWith("/stockfish-mv/");
  const isVariant = url.startsWith("/variants/");
  const isEndgame = url.startsWith("/learn/endgames/");

  const needsCrossOrigin = isStockfish || isVariant || isEndgame;

  if (needsCrossOrigin) {
    const response = NextResponse.next();
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    if (isStockfish) return response;
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const proxy = auth(handler);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|privacy|terms|$).*)",
    "/stockfish-mv/:path*",
  ],
};
