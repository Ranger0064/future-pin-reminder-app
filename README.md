# FuturePin


> Mark your future — and let the reminder find you right on time.
> 標記你的未來，讓提醒準時找上門。


A lightweight app focused on subscription management and long-term reminders. It's not a to-do list — it does one thing well: notify you right on time, whenever that future moment you set arrives.

一個專注於「訂閱管理」與「長期重要日期提醒」的輕量 App。不做代辦清單，只做一件事：在你設定好的未來某一刻，準時推播通知提醒你。

---
##

FuturePin is a reminder app built for scenarios like subscription renewals, warranty expirations, or document renewals — things that are **far in the future (days to over a year out)** but still need a timely heads-up. It is intentionally not a to-do list: no checkboxes, no progress tracking, just one job — notify you exactly when that moment arrives.

### Features

- **Quick period presets**: built-in shortcuts for 1 / 3 / 7 / 30 / 90 / 180 / 360 days, or pick any custom future date
- **Local system notifications**: reminders are delivered by the phone's native notification system — the app doesn't need to be open, and no internet connection is required
- **No account needed**: no sign-up, no login — all data lives only on your own device
- **No backend, zero servers**: the app never sends your data anywhere; your reminders are visible only to you
- **Export/import backup**: when switching phones, export your data to a file and transfer it however you like (cloud drive, email, USB, etc.), then import it on the new device — nothing gets lost
- **Notification permission prompt**: if notification permission is off, the app shows a banner with a one-tap re-check button
- **Bilingual UI**: switch between Traditional Chinese and English
- **Notification test**: a built-in "test in 10 seconds" option to quickly verify notifications work on your phone

### Privacy by design

The privacy principle here is simple: **your data belongs only to you.**

- No account system — there's no server that could ever access your data
- All reminder data is stored locally on your device (via Capacitor's Preferences)
- The only time your data leaves the phone is when you actively tap "Export" — and where it goes from there (cloud drive, email, etc.) is entirely your choice
- Import only reads and merges data locally on the device; it never touches any server either


##

FuturePin 是一個提醒型 App，設計給「訂閱續約」「保固到期」「證件更新」這類**時間跨度長（幾天到一年以上）、但需要提前被提醒**的場景使用。它不是待辦事項（To-do list）——沒有打勾、沒有進度追蹤，只有一件事：時間到了，推播通知你。

### 功能特色

- **快速設定週期**：內建常用天數快選（1 / 3 / 7 / 30 / 90 / 180 / 360 天），也可以自訂任一未來日期
- **本地系統通知**：時間到了由手機系統原生推播提醒，不需要 App 開著、也不需要網路連線
- **完全不需要帳號**：沒有註冊、沒有登入，所有資料只存在你自己的手機裡
- **無後端、零伺服器**：App 不會把任何資料傳到任何伺服器，你的提醒內容只有你自己看得到
- **匯出／匯入備份**：換手機時，可以把資料匯出成一個檔案，透過你自己選擇的方式（雲端硬碟、Email、傳輸線等）轉移到新手機再匯入，不會遺失資料
- **通知權限提示**：如果通知權限沒開啟，畫面上會提示你，並可以一鍵重新檢查
- **雙語介面**：介面文字支援繁體中文／English 切換
- **通知測試**：內建一個「10 秒後測試」選項，方便你確認手機的通知功能是否正常運作

### 隱私設計

這個 App 的隱私原則很單純：**你的資料只屬於你**。

- 不做帳號系統，沒有任何伺服器可以存取你的資料
- 所有提醒內容都存在裝置本機（透過 Capacitor 的 Preferences）
- 唯一會離開手機的時刻，是你自己主動按下「匯出」，而且匯出後要傳去哪裡（雲端硬碟、Email……）完全由你自己決定
- 匯入功能只在本機比對、合併資料，同樣不經過任何伺服器

