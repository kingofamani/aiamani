# 📊 資料庫部署與遷移指南

## 6. Supabase PostgreSQL 資料庫部署 🚀

### 6.1 前置準備

1.  **註冊 Supabase 帳號**:
    *   前往 [supabase.com](https://supabase.com) 註冊免費帳號
    *   可以使用 GitHub、Google 或 Email 註冊
    *   **免費方案包含**：500MB 資料庫空間、50MB 檔案儲存、50,000 月活躍使用者

2.  **安裝 Supabase CLI** (可選，但推薦):
    *   **Windows (PowerShell)**:
        ```powershell
        # 安裝 Scoop (如果沒有的話)
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
        irm get.scoop.sh | iex
        
        # 安裝 Supabase CLI
        scoop install supabase
        ```
    *   **macOS**: `brew install supabase/tap/supabase`
    *   **Linux**: `npm install -g supabase`
    *   **使用 npm**: `npm install -g supabase`

### 6.2 建立 Supabase 專案

1.  **建立新專案**:
    *   登入 [Supabase Dashboard](https://app.supabase.com)
    *   點擊「New project」
    *   選擇組織（個人帳號會自動建立預設組織）

2.  **設定專案資訊**:
    *   **Name**: `starbaba-mvp` 或您喜歡的名稱
    *   **Database Password**: 設定一個強密碼（**請記住，稍後需要使用**）
    *   **Region**: 選擇最接近您用戶的區域（如 Southeast Asia (Singapore)）
    *   **Pricing Plan**: 選擇「Free」

3.  **等待專案建立**:
    *   通常需要 1-2 分鐘
    *   建立完成後會看到專案 Dashboard

### 6.3 ⚠️ 取得資料庫連線資訊 (重要步驟)

1.  **進入專案設定**:
    *   在 Supabase Dashboard 中，點擊左側選單的「Settings」
    *   選擇「Database」

2.  **🔥 重要：選擇正確的連線方式**:
    *   在「Connection string」區段，您會看到兩個選項：
        1. ❌**「Direct connection」** - 直接連接
        2. ✅**「Connection pooling」** - 連接池 ⭐

    *   **📢 請務必選擇第二項⭐「Connection pooling」！**
    
    **為什麼必須使用 Connection Pooling？**
    - ✅ **穩定性更好**：避免連接數超限問題
    - ✅ **效能更佳**：連接池管理，減少連接建立開銷
    - ✅ **適合生產環境**：Supabase 推薦的最佳實務
    - ❌ **Direct connection 問題**：容易遇到 DNS 解析失敗、連接超時等問題

3.  **複製 Connection pooling 連線字串**:
    *   選擇「Transaction pooler」模式
    *   複製類似以下格式的 URI：
        ```
        postgresql://postgres.xxxxxxxxxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
        ```
    
    **連線字串格式說明**:
    - **Host**: `aws-0-ap-southeast-1.pooler.supabase.com` (注意有 `.pooler`)
    - **Port**: `5432` (Transaction pooler) 或 `6543` (Session pooler)
    - **Database**: `postgres`
    - **Username**: `postgres.xxxxxxxxxxxx` (注意前綴格式)
    - **Password**: 您在建立專案時設定的密碼

### 6.4 設定本地環境

1.  **更新 `.env` 檔案**:
    ```env
    # Flask 設定
    SECRET_KEY=your-secret-key-here
    
    # 🔥 重要：使用 Connection pooling 連線字串
    DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
    
    # Supabase 額外資訊 (可選，未來擴展用)
    SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
    SUPABASE_ANON_KEY=your-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ```

2.  **取得 Supabase API 金鑰** (可選，未來擴展用):
    *   在 Supabase Dashboard > Settings > API
    *   複製「anon」和「service_role」金鑰

### 6.5 建立資料庫結構

#### 方法 A: 使用 Supabase SQL Editor (推薦)

### 6.6 資料遷移：使用 pgAdmin 操作 📋

#### 步驟 1: 從本地資料庫匯出資料

1.  **開啟 pgAdmin**:
    *   連接到您的本地 PostgreSQL 伺服器

2.  **選擇要備份的資料庫(包含資料表建立與資料轉移)**:
    *   在左側物件瀏覽器中，右鍵點擊包含 `app_settings` 和 `subscriptions` 資料表的資料庫
    *   選擇「Backup...」

3.  **在「Backup」對話方塊中設定**:
    
    **General (一般) 標籤頁**:
    - **Filename (檔案名稱)**: 指定匯出檔案位置，例如 `starbaba_backup.sql`
    - **Format (格式)**: 選擇「Plain」

    **Objects (物件) 標籤頁**:
    - 展開您的綱要 (通常是 `public`)
    - 在「Tables」清單中，**只勾選** `app_settings` 和 `subscriptions`
    - 確保其他資料表是未勾選狀態
    - **也要勾選✅「Sequences」** (用於 SERIAL 欄位)

    **Dump Options (傾印選項) 標籤頁**:
    - **Use Insert Commands**: ✅ 勾選
    - **Use Column Inserts**: ✅ 勾選 (推薦)
    - **Owner**: ❌ 取消勾選
    - **Privileges**: ❌ 取消勾選

4.  **執行備份**:
    *   點擊「Backup」按鈕
    *   等待匯出完成

#### 步驟 2: 修改 SQL 檔案

1.  **開啟匯出的 `.sql` 檔案**:
    *   使用文字編輯器（如 VS Code、Notepad++）開啟

2.  **移除 schema 前綴**:
    *   將檔案中所有的⭐ `public.` 字串刪除
    *   例如：將 `public.app_settings` 改為 `app_settings`

3.  **檢查並修正**:
    *   確認 SQL 語法正確
    *   移除不必要的 Owner 或 Grant 語句

#### 步驟 3: 匯入到 Supabase

1.  **回到 Supabase SQL Editor**:
    *   在 Supabase Dashboard 左側選單點擊「SQL Editor」
    *   複製修改後的 `.sql` 檔案內容

2.  **貼上並執行**:
    *   將 SQL 內容貼上到 SQL Editor 中
    *   點擊「Run」執行

3.  **驗證資料**:
    *   前往「Table Editor」
    *   檢查 `app_settings` 和 `subscriptions` 資料表
    *   確認資料已正確匯入

### 6.7 使用 Supabase CLI 初始化本地 Supabase 專案

1.  **初始化本地 Supabase 專案**:
    ```bash
    # 在專案根目錄執行
    supabase init
    ```
    *   會建立 `supabase/` 目錄和相關配置檔案
    *   選擇所有問題都回答 "N" (使用預設設定)

2.  **連結到遠端 Supabase 專案**:
    ```bash
    # 替換 your-project-ref 為您的專案 ID
    supabase link --project-ref your-project-ref
    ```
    *   專案 ID 可在 Supabase Dashboard > Settings > General 中找到
    *   會要求輸入資料庫密碼 (建立專案時設定的密碼)

3.  **修改 `supabase/config.toml` 配置檔案**:
    ```toml
    # 開啟檔案: supabase/config.toml
    
    [api]
    # 設定 API 版本
    enabled = true
    port = 54321
    
    [db]
    # 資料庫設定 (本地開發用)
    port = 54322
    major_version = 15
    
    [studio]
    # Supabase Studio 設定
    enabled = true
    port = 54323
    
    [auth]
    # 認證設定 (未來使用)
    enabled = true
    
    [storage]
    # 檔案儲存設定 (未來使用)
    enabled = false
    ```

4.  **檢查 Supabase 狀態**:
    ```bash
    supabase status
    ```
    *   顯示本地和遠端專案的連接狀態
    *   確認是否成功連結到遠端專案

### 6.8 測試連線

1.  **在本地測試連線**:
    *   要設定postgresql在Windows path環境變數，例如：`C:\Program Files\PostgreSQL\17\bin`
    *   開啟PowerShell測試
    ```
    psql postgresql://postgres.[supabase專案project_id]:[你的密碼]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
    ```

2.  **啟動應用程式測試**:
    ```bash
    python run.py
    ```
    *   訪問 `http://localhost:5000`
    *   測試 API 端點: `http://localhost:5000/api/settings`

---

## 7. Flask 應用程式部署到 Heroku 🌐

### 7.1 前置準備

1.  **註冊 Heroku 帳號**:
    *   前往 [heroku.com](https://heroku.com) 註冊免費帳號
    *   驗證電子信箱

2.  **安裝 Heroku CLI**:
    *   **Windows**: 下載並安裝 [Heroku CLI for Windows](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)
    *   **macOS**: `brew tap heroku/brew && brew install heroku`
    *   **Linux**: `curl https://cli-assets.heroku.com/install.sh | sh`

3.  **登入 Heroku CLI**:
    ```bash
    heroku login
    ```

### 7.2 準備部署檔案

1.  **確認 `Procfile` 存在** (專案根目錄):
    ```
    web: python run.py
    ```

2.  **確認 `requirements.txt` 完整**:
    ```bash
    pip freeze > requirements.txt
    ```

3.  **建立 `runtime.txt`** (可選):
    ```
    python-3.11.0
    ```

### 7.3 建立 Heroku 應用程式

1.  **建立應用程式**:
    ```bash
    heroku create your-starbaba-app
    ```

2.  **設定環境變數**:
    ```bash
    # 設定密鑰
    heroku config:set SECRET_KEY=your-secret-key
    
    # 🔥 重要：設定 Supabase 連線字串
    heroku config:set DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    ```

### 7.4 部署應用程式

1.  **確認 Git 提交**:
    ```bash
    git add .
    git commit -m "準備部署到 Heroku"
    ```

2.  **部署到 Heroku**:
    ```bash
    git push heroku main
    ```

3.  **查看應用程式**:
    ```bash
    heroku open
    ```

### 7.5 監控與維護

1.  **查看日誌**:
    ```bash
    heroku logs --tail
    ```

2.  **檢查應用程式狀態**:
    ```bash
    heroku ps
    ```

---

## 8. Supabase 進階功能與管理 ⚡

### 8.1 即時資料同步 (Real-time)

1.  **啟用資料表即時功能**:
    *   在 Supabase Dashboard > Database > Replication
    *   為 `subscriptions` 資料表開啟 Realtime

2.  **前端整合** (未來擴展):
    ```bash
    npm install @supabase/supabase-js
    ```

### 8.2 資料庫管理

1.  **查看使用量**:
    *   Supabase Dashboard > Settings > Usage

2.  **備份資料庫**:
    *   Settings > Database > Download backup

3.  **監控效能**:
    *   使用 SQL Editor 執行效能查詢

### 8.3 安全性設定

1.  **Row Level Security (RLS)**:
    ```sql
    -- 啟用 RLS (未來加入使用者認證時)
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
    ```

2.  **API 金鑰管理**:
    *   定期更換 service_role 金鑰
    *   限制 anon 金鑰權限

---

## 🎯 部署檢查清單

### Supabase 設定 ✅
- [ ] 已建立 Supabase 專案
- [ ] **已使用 Connection pooling 連線字串**
- [ ] 資料表結構已建立
- [ ] 資料已成功遷移
- [ ] 本地連線測試通過

### Heroku 部署 ✅
- [ ] Heroku 應用程式已建立
- [ ] 環境變數已設定
- [ ] 應用程式成功部署
- [ ] API 端點正常運作
- [ ] 前端頁面正常顯示

### 驗證測試 ✅
- [ ] 新增訂閱功能正常
- [ ] 編輯訂閱功能正常
- [ ] 刪除訂閱功能正常
- [ ] 統計計算正確顯示
- [ ] 響應時間在可接受範圍內

完成以上步驟後，您的 StarBaBa 應用程式就成功部署在 Heroku + Supabase 的雲端架構上了！🎉 