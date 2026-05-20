import {NextResponse, type NextRequest} from "next/server";

const robotsHeader = "noindex, nofollow, noarchive, nosnippet";
const privateSessionCookie = "longqing_private_session";

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const isPrivatePage = pathname.startsWith("/en/private/");
  const isPrivateApi = pathname.startsWith("/api/private/");

  if (pathname === "/en/private/outreach" || pathname.startsWith("/en/private/outreach/")) {
    const response = NextResponse.redirect("https://mail.dk7world.pro/private/outreach/longqingtrade");
    response.headers.set("X-Robots-Tag", robotsHeader);
    return response;
  }

  if (!isPrivatePage && !isPrivateApi) {
    return NextResponse.next();
  }

  if (isPrivatePage && !pathname.startsWith("/en/private/auth")) {
    const hasSessionCookie = Boolean(request.cookies.get(privateSessionCookie)?.value);
    if (!hasSessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/en/private/auth";
      const response = NextResponse.redirect(url);
      response.headers.set("X-Robots-Tag", robotsHeader);
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", robotsHeader);
  return response;
}

export const config = {
  matcher: ["/en/private/:path*", "/api/private/:path*"]
};
