// 深色 / 淺色 / 跟隨系統。偏好存在這台瀏覽器的 localStorage（只是個人顯示偏好）。
export type ThemePref = "light" | "dark" | "system";

export const THEME_KEY = "ai-english-tutor:theme";
export const THEME_EVENT = "ai-english-tutor:theme-change";

/**
 * 放在 <head> 最前面、在畫面出來之前執行，避免閃一下錯的主題。
 * 也負責「跟隨系統」時，系統切換深淺色會即時跟著變。
 */
export const themeInitScript = `(function(){
  var K=${JSON.stringify(THEME_KEY)};
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  function pref(){try{return localStorage.getItem(K)||'system'}catch(e){return 'system'}}
  function apply(){
    var p=pref();var dark=p==='dark'||(p==='system'&&mq.matches);
    var r=document.documentElement;r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';
  }
  apply();
  window.__applyTheme=apply;
  mq.addEventListener('change',function(){if(pref()==='system')apply()});
})();`;

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function setThemePref(pref: ThemePref) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // 無痕模式等情況存不了，就只套用這一次
  }
  const root = document.documentElement;
  root.classList.add("theme-switching");
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  window.setTimeout(() => root.classList.remove("theme-switching"), 300);
  window.dispatchEvent(new Event(THEME_EVENT));
}
