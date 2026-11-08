// 頁面層的登入檢查：沒登入就導去 /login。
// 這只是讓使用者體驗順一點；真正的權限檢查在每支 API 裡（getCurrentUser）。
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// 首頁是介紹頁，誰都能看
const PUBLIC_PAGES = ["/"];
// 登入 / 註冊頁：已登入的人直接進練習
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_PAGES.includes(pathname)) return NextResponse.next();

  const userId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!userId && !isAuthPage) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL("/practice", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // API 自己會驗證；靜態檔案不用檢查
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
