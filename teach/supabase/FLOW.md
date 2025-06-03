```mermaid
graph TD
    A["使用者進入網站 (index.html)"] --> B{"查看首頁內容"};
    B --> C1["點擊導覽列連結"];
    B --> C2["點擊 '開始學習' 按鈕"];
    B --> C3["瀏覽技術概覽"];
    B --> C4["瀏覽學習路徑"];

    C1 --> D["跳轉至對應頁面 (Supabase/Heroku/進階/檢查/FAQ)"];
    C2 --> D_Supabase["跳轉至 Supabase 教學頁面 (pages/supabase.html)"];

    D_Supabase --> E["瀏覽 Supabase 教學內容"];
    E --> E1["閱讀前置準備"];
    E --> E2["學習建立專案"];
    E --> E3["查看如何取得連線資訊"];
    E --> E4["(可選) 點擊側邊欄目錄跳轉"];
    E --> E5["(可選) 點擊 '上一步'/'下一步' 導航"];
    E5 --> E6["進度條更新"];
    E --> E7["(可選) 複製程式碼範例"];

    D_Heroku["跳轉至 Heroku 教學頁面 (pages/heroku.html)"] --> F["瀏覽 Heroku 教學內容"];
    F --> F1["閱讀前置準備"];
    F --> F2["學習準備部署檔案"];
    F --> F3["(類似 Supabase 頁面操作流程 E4-E7)"];

    D_Advanced["跳轉至進階功能頁面 (pages/advanced.html)"] --> G["瀏覽 Supabase 進階功能"];
    G --> G1["學習即時資料同步"];
    G --> G2["學習資料庫管理"];
    G --> G3["學習安全性設定"];
    G --> G4["(類似 Supabase 頁面操作流程 E4, E7)"];

    D_Checklist["跳轉至部署檢查頁面 (pages/checklist.html)"] --> H["瀏覽檢查清單"];
    H --> H1["勾選/取消勾選檢查項目"];
    H1 --> H2["狀態自動儲存 (localStorage)"];
    H --> H3["(可選) 點擊 '重置檢查清單'"];

    D_FAQ["跳轉至常見問題頁面 (pages/faq.html)"] --> I["瀏覽 FAQ"];
    I --> I1["點擊問題分類跳轉"];
    I --> I2["點擊問題標題展開/收合答案 (手風琴效果)"];

    subgraph JavaScript 互動 (assets/js/main.js)
        J1["導航欄滾動效果"];
        J2["漢堡菜單切換"];
        J3["代碼塊複製功能"];
        J4["手風琴效果"];
        J5["檢查清單狀態管理"];
        J6["平滑滾動"];
        J7["步驟導航與進度條"];
    end

    A --> J1;
    C1 --> J2;
    E7 --> J3;
    I2 --> J4;
    H1 --> J5;
    E4 --> J6;
    E5 --> J7;
```
