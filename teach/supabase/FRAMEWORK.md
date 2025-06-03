# 專案框架

## 概述
本專案是一個靜態教學網站，旨在提供 Supabase 和 Heroku 部署的全面指南。網站採用 HTML、CSS 和 JavaScript 建構，注重簡潔的設計和良好的使用者互動體驗。

## 技術棧
- **前端：**
    - HTML5
    - CSS3 (自訂樣式，風格參考 Bang & Olufsen)
    - JavaScript (原生 JS，用於 DOM 操作和互動功能)
- **字體圖標：** Font Awesome
- **部署平台 (教學目標)：**
    - Supabase (PostgreSQL 資料庫)
    - Heroku (Flask 應用程式托管)

## 專案結構
```
.
├── assets
│   ├── css
│   │   └── style.css         # 主要樣式檔案
│   ├── images                # 圖片資源 (目前為空)
│   └── js
│       └── main.js           # 主要 JavaScript 檔案
├── index.html                # 網站首頁
└── pages
    ├── advanced.html         # Supabase 進階功能教學
    ├── checklist.html        # 部署檢查清單
    ├── faq.html              # 常見問題解答
    ├── heroku.html           # Heroku 部署教學
    └── supabase.html         # Supabase 部署教學
```

## 主要功能模組 (JavaScript - `assets/js/main.js`)
- **導航欄效果：** 滾動時樣式變更，漢堡菜單切換。
- **代碼塊複製：** 一鍵複製程式碼範例。
- **手風琴效果：** 用於 FAQ 等內容的展開/收合。
- **檢查清單：** 互動式檢查清單，狀態儲存於 localStorage。
- **平滑滾動：** 頁面內錨點連結的平滑滾動。
- **步驟導航：** 教學頁面中的上一步/下一步功能。
- **進度條更新：** 配合步驟導航更新進度顯示。

## CSS (`assets/css/style.css`)
- **基礎重置與變數定義：** 統一基本樣式，定義顏色、字體大小、間距等 CSS 變數。
- **排版與容器：** 設定全域字體、行高、容器寬度等。
- **元件樣式：**
    - 導航欄 (Navbar)
    - 按鈕 (Buttons)
    - 英雄區塊 (Hero section)
    - 特性區塊 (Features)
    - 步驟區塊 (Steps)
    - 提示框 (Alerts)
    - 頁腳 (Footer)
    - 程式碼區塊 (Code blocks)
    - 手風琴 (Accordion)
    - 檢查清單 (Checklist)
    - 進度條 (Progress bar)
- **響應式設計：** 透過 `@media` 查詢確保在不同裝置上的顯示效果 (雖然目前 CSS 中未明確展示，但通常會包含)。

## 設計理念
- **極簡風格：** 參考 Bang & Olufsen 官網，強調簡潔、清晰。
- **使用者友善：** 提供清晰的導航和互動元素，方便學習。
- **內容導向：** 以教學內容為核心，輔以必要的視覺設計。
