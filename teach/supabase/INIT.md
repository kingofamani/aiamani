# 專案初始化總結

此專案是一個靜態教學網站，旨在指導網頁開發者如何部署 Supabase PostgreSQL 資料庫和 Heroku Flask 應用程式。

**主要技術棧：** HTML, CSS, JavaScript (用於前端互動)。

**專案結構：**
*   `index.html`: 網站首頁，提供技術概覽和學習路徑。
*   `assets/`: 存放靜態資源。
    *   `css/style.css`: 定義網站的整體視覺風格，採用極簡設計。
    *   `js/main.js`: 實現網站的各種互動功能，如導覽列效果、代碼複製、手風琴、檢查清單、平滑滾動、步驟導航等。
    *   `images/`: 目前為空資料夾。
*   `pages/`: 存放各個教學內容頁面。
    *   `supabase.html`: Supabase PostgreSQL 資料庫部署教學。
    *   `heroku.html`: Flask 應用程式部署到 Heroku 的教學。
    *   `advanced.html`: Supabase 進階功能與管理教學。
    *   `checklist.html`: 部署檢查清單，幫助使用者追蹤進度。
    *   `faq.html`: 常見問題解答。

**特點：**
*   內容豐富，涵蓋了從環境準備到進階功能的完整教學。
*   注重使用者體驗，提供了程式碼複製、進度指示、步驟導航等互動功能。
*   設計風格簡潔現代。
*   強調了 Supabase Connection pooling 的重要性。
