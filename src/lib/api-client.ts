// 前端呼叫自己 API 用的小工具：統一處理錯誤，401 時導回登入頁
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !url.startsWith("/api/auth/")) {
    const next = window.location.pathname + window.location.search;
    // 這裡不在 React 元件裡拿不到 router；登入過期時整頁重新載入也剛好清掉舊狀態
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
    throw new Error("請先登入");
  }
  if (!res.ok) throw new Error(data.error || "發生錯誤，請稍後再試");
  return data as T;
}
