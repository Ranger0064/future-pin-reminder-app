import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunnyive.futurepin',
  appName: 'FuturePin',
  webDir: 'build',
  plugins: {
    // 手動控制啟動畫面關閉時機，蓋住 WebView 載入時的白屏空窗期
    // 需搭配 +page.svelte 的 onMount 裡呼叫 SplashScreen.hide()
    SplashScreen: {
      launchAutoHide: false, // 關閉「系統自動」隱藏，改成等資料/畫面準備好才手動關閉
      backgroundColor: '#ffffffff',
      showSpinner: false
    }
  }
};

export default config;
