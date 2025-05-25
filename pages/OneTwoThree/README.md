# 「一二三木頭人」網頁遊戲

這是一個使用 HTML, CSS, JavaScript 和 MQTT 實現的即時多人網頁遊戲「一二三木頭人」。

## 專案介紹

本專案旨在模擬經典的「一二三木頭人」遊戲，玩家可以選擇扮演「老師」或「學生」。

*   **老師端**：可以控制遊戲的開始、結束，以及「回頭看」和「背對」的狀態。老師可以看到所有加入遊戲的學生，並在「回頭看」時抓捕移動的學生。
*   **學生端**：需要輸入暱稱加入遊戲。在老師背對時，學生可以點擊「向前移動」按鈕來前進。目標是在不被老師抓到的情況下抵達終點線。

## 技術棧

*   **前端**：HTML5, CSS3, JavaScript (ES6+)
*   **即時通訊**：MQTT (Message Queuing Telemetry Transport)
    *   **MQTT Broker**：使用公共的 `broker.emqx.io`
    *   **MQTT 客戶端庫**：`mqtt.js` (透過 CDN 引入)
*   **核心通訊協定**：基於 JSON 的自訂訊息格式，透過 MQTT 的特定主題 (`onetwothree/all`) 進行發布和訂閱。

## 主要功能

*   **角色選擇**：玩家可以在初始頁面選擇扮演老師或學生。
*   **即時同步**：遊戲狀態、老師動作、學生加入/離開/移動/被抓/過關等事件透過 MQTT 即時同步給所有客戶端。
*   **老師端控制**：
    *   開始/結束遊戲。
    *   控制「看」與「背對」的狀態。
    *   視覺化學生列表及學生進度。
    *   在「看」的狀態下，自動抓捕移動的學生。
    *   手動點擊學生圖示旁的按鈕抓捕學生（作為輔助）。
    *   遊戲結束後可重置狀態，開始新回合。
*   **學生端互動**：
    *   輸入暱稱加入遊戲。
    *   視覺化頭像及遊戲狀態（安全、危險、被抓、過關）。
    *   點擊按鈕向前移動。
    *   抵達終點線則判定為過關。
    *   被抓或遊戲結束後，等待老師開始新回合。
*   **動態 UI 更新**：
    *   老師端：學生圖示的動態添加、移除、移動、狀態變化（被抓、過關）。Toast 通知遊戲事件。右側邊欄顯示學生詳細狀態。
    *   學生端：根據遊戲和老師狀態，更新自身狀態顯示、圖示和背景。

## 如何執行

1.  確保你的網路可以存取 `broker.emqx.io` (MQTT Broker)。
2.  將專案檔案放置在一個網頁伺服器環境中（例如使用Cursor、 VS Code 的 Live Server 擴充功能，或任何支援靜態檔案服務的伺服器），開啟Terminal輸入` python -m http.server 8080`，接著在瀏覽器中開啟 `http://localhost:8080/index.html`。
3.  也可以直接到檔案總管，在專案目錄下`index.html`直接用瀏覽器中開啟(路徑就是本機儲存路徑例如: `file:///C:/index.html`) 。
4.  選擇角色：
    *   開啟一個瀏覽器分頁作為「老師端」。
    *   開啟一個或多個瀏覽器分頁作為「學生端」。
5.  在學生端輸入暱稱加入遊戲。
6.  老師端點擊「開始遊戲」即可開始。

## 檔案結構

```
.
├── css/
│   └── style.css           # 主要樣式表
├── js/
│   ├── common.js           # MQTT 連線和通用函式
│   ├── student.js          # 學生端邏輯
│   └── teacher.js          # 老師端邏輯
├── index.html              # 角色選擇頁面
├── student.html            # 學生端遊戲頁面
├── teacher.html            # 老師端遊戲頁面
├── README.md               # 專案說明 (本檔案)
├── TODO.md                 # 待辦事項與開發記錄
└── .gitignore              # Git 忽略檔案配置 (將會生成)
```

## MQTT 訊息協定範例

所有訊息均為 JSON 格式，並包含 `type`, `senderId`, `role`, `timestamp` 等基本欄位。

*   學生加入：`{ "type": "PLAYER_JOIN", "senderId": "student_xxx", "role": "student", "name": "小明", "clientId": "student_xxx", ... }`
*   遊戲開始：`{ "type": "GAME_START", "senderId": "teacher_yyy", "role": "teacher", ... }`
*   老師回頭：`{ "type": "TEACHER_LOOK_BACK", "senderId": "teacher_yyy", "role": "teacher", ... }`
*   學生移動：`{ "type": "PLAYER_MOVE", "senderId": "student_xxx", "role": "student", "playerId": "student_xxx", ... }`
*   學生被抓：`{ "type": "PLAYER_CAUGHT", "senderId": "teacher_yyy", "role": "teacher", "playerId": "student_xxx", ... }`
*   學生過關：`{ "type": "PLAYER_FINISHED", "senderId": "teacher_yyy", "role": "teacher", "playerId": "student_xxx", ... }`
*   遊戲結束：`{ "type": "GAME_END", "senderId": "teacher_yyy", "role": "teacher", ... }`
*   學生離開：`{ "type": "PLAYER_LEAVE", "senderId": "student_xxx", "role": "student", "clientId": "student_xxx", ... }`

## 未來展望

請參考 `TODO.md` 中的「待辦事項 / 未來可改進」部分。

---

祝您遊戲愉快！ 