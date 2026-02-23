import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function middleware(request) {
  const token = (await cookies()).get("token")?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/live", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/live/:path*", "/sell/:path*"],
};
