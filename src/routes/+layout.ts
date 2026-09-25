export const ssr = false;
export const prerender = true;

import { init, register, waitLocale } from 'svelte-i18n';
// 修正：改用「靜態匯入」直接把翻譯內容打包進主程式，
// 不再用動態 import 額外對本地伺服器發請求抓檔案，徹底避免 404 導致語言設定失敗、
// 進而讓 $t() 在畫面還沒掛載完成前就丟出例外、卡死啟動畫面的問題。
import en from '$lib/i18n/en.json';
import zhTW from '$lib/i18n/zh-TW.json';

const defaultLocale = 'en';

// loader 直接回傳已經匯入好的內容，不會再有「抓檔案失敗」這種可能性
register('en', () => Promise.resolve(en));
register('zh-TW', () => Promise.resolve(zhTW));

// 修正：initialLocale 統一用 defaultLocale 變數，避免跟下面 waitLocale 對不起來
export const load = async () => {
  // 保底：多包一層 try/catch，就算未來出現其他預期外的狀況，也不讓 load() 整個拋出去卡住畫面
  try {
    init({
      fallbackLocale: defaultLocale,
      initialLocale: defaultLocale,
    });

    await waitLocale(defaultLocale);
  } catch (e) {
    console.log('i18n init failed, continue booting the app anyway.', e);
  }
};