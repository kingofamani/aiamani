# Web 教學白板 - 程式架構圖

## 整體架構概覽

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                          │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │   Toolbar UI    │  │         Canvas Element          │   │
│  │                 │  │                                 │   │
│  │ [🖱️][P][E][T]   │  │                                 │   │
│  │ [N][QR][📺][🖼️] │  │        #whiteboard              │   │
│  │ [⏰][⏱][Clear]  │  │                                 │   │
│  │ [Color][Width]  │  │                                 │   │
│  │ [Background]    │  │                                 │   │
│  │ [Volume][Mic]   │  │                                 │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         app.js                             │
│                    (應用程式進入點)                          │
│                                                             │
│  • 初始化所有模組                                            │
│  • 綁定工具列事件                                            │
│  • 協調模組間通訊                                            │
│  • 管理工具切換狀態                                          │
│  • 專案管理整合 (計畫中)                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      核心模組架構                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  CanvasModule   │  │ BackgroundModule│                  │
│  │   (核心畫布)     │  │   (背景管理)     │                  │
│  │                 │  │                 │                  │
│  │ • 畫布初始化     │  │ • 背景類型管理   │                  │
│  │ • 繪圖事件處理   │  │ • 格線圖案生成   │                  │
│  │ • RWD 響應調整   │  │ • 背景重繪      │                  │
│  │ • 繪圖歷史管理   │  │ • 自訂顏色支援   │                  │
│  │ • 內容重繪機制   │  │                 │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ TextToolModule  │  │BaseControlModule│                  │
│  │   (文字工具)     │  │ (統一控制基類)   │ ⭐               │
│  │                 │  │                 │                  │
│  │ • 文字輸入面板   │  │ • 3按鈕控制系統  │                  │
│  │ • 畫布點擊處理   │  │ • 統一事件處理   │                  │
│  │ • 文字樣式設定   │  │ • 元素生命週期   │                  │
│  │ • 文字重繪邏輯   │  │ • 拖拽縮放邏輯   │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  繼承 BaseControlModule 的模組               │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  NotesModule    │  │ QRCodeModule    │                  │
│  │ (便條紙) [繼承]  │  │(QR code產生器)  │                  │
│  │                 │  │                 │                  │
│  │ • 便條紙新增     │  │ • QR輸入面板     │                  │
│  │ • 文字編輯功能   │  │ • QR code生成    │                  │
│  │ • 統一3按鈕控制  │  │ • 畫布放置功能   │                  │
│  │ • 自動縮放字體   │  │ • QR重繪機制     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ YouTubeModule   │  │  ImageModule    │                  │
│  │(YouTube嵌入)[繼承]│  │ (圖片插入)[繼承] │                  │
│  │                 │  │                 │                  │
│  │ • 影片URL解析    │  │ • 圖片上傳處理   │                  │
│  │ • iframe嵌入     │  │ • 統一3按鈕控制  │                  │
│  │ • 16:9比例縮放   │  │ • 多格式支援     │                  │
│  │ • 統一3按鈕控制  │  │ • 自由縮放功能   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │CountdownModule  │  │ StopwatchModule │                  │
│  │(倒數計時器)[繼承] │  │  (碼錶)[繼承]    │                  │
│  │                 │  │                 │                  │
│  │ • DOM計時器元素  │  │ • DOM碼錶元素    │                  │
│  │ • 聲音警報系統   │  │ • 百分秒精度     │                  │
│  │ • 統一3按鈕控制  │  │ • 統一3按鈕控制  │                  │
│  │ • 保持比例縮放   │  │ • 保持比例縮放   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐                                       │
│  │VolumeDetection  │                                       │
│  │Module (音量偵測) │                                       │
│  │                 │                                       │
│  │ • 麥克風權限管理 │                                       │
│  │ • 即時音量分析   │                                       │
│  │ • 警告系統      │                                       │
│  │ • Toast通知     │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    專案管理系統 (計畫中)                      │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ ProjectManager  │  │ SaveLoadModule  │                  │
│  │  (專案管理)      │  │  (儲存載入)      │                  │
│  │                 │  │                 │                  │
│  │ • 專案CRUD操作   │  │ • 資料收集整合   │                  │
│  │ • localStorage   │  │ • 模組狀態還原   │                  │
│  │ • 專案列表管理   │  │ • 縮圖生成      │                  │
│  │ • 狀態追蹤      │  │ • 資料壓縮      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐                                       │
│  │   ProjectUI     │                                       │
│  │  (專案介面)      │                                       │
│  │                 │                                       │
│  │ • 啟動畫面      │                                       │
│  │ • 專案選擇器     │                                       │
│  │ • 對話框管理     │                                       │
│  │ • 使用者互動     │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## 核心模組詳細說明

### 1. CanvasModule (畫布核心模組)
**職責**: 管理 HTML5 Canvas 的核心功能

**主要方法**:
- `init()`: 初始化畫布和 2D 繪圖上下文
- `resizeCanvas()`: 響應式調整畫布尺寸
- `startDrawing(e)`: 開始繪圖 (滑鼠/觸控)
- `draw(e)`: 繪圖過程處理
- `stopDrawing()`: 結束繪圖
- `setTool(tool)`: 設定目前工具 (pen/eraser/text/notes/qrcode/youtube/image/countdown/stopwatch)
- `setColor(color)`: 設定繪圖顏色
- `setLineWidth(width)`: 設定線條粗細
- `clearCanvas()`: 清空畫布和歷史記錄
- `redrawAllContent()`: 重繪所有歷史內容
- `addTextToHistory()`: 新增文字到歷史記錄

**資料結構**:
```javascript
drawingHistory = [
  {
    tool: 'pen|eraser|text',
    points: [[x,y], ...],     // 畫筆/橡皮擦路徑
    color: '#000000',
    lineWidth: 5,
    text: 'content',          // 文字內容
    x: 100, y: 100,          // 位置
    font: '16px Arial'        // 文字樣式
  }
]
```

### 2. BackgroundModule (背景管理模組)
**職責**: 管理畫布背景樣式和繪製

**主要方法**:
- `setBackground(type, customColor)`: 設定背景類型
- `drawBackground()`: 繪製背景
- `createGridPattern()`: 建立格線 SVG 圖案

**支援背景類型**:
- `white`: 純白色背景
- `lightgray`: 淺灰色背景 (#f5f5f5)
- `grid`: 格線背景 (SVG pattern)
- `customColor`: 自訂顏色背景

### 3. BaseControlModule (統一控制基類) ⭐
**職責**: 提供所有可放置內容的統一控制邏輯

**核心功能**:
- **統一3按鈕控制系統**:
  - 移動按鈕 (綠色手掌圖示，左上角)
  - 刪除按鈕 (紅色垃圾桶圖示，右上角)
  - 縮放按鈕 (藍色箭頭圖示，右下角)

**主要方法**:
- `activate()`: 啟用工具模式
- `deactivate()`: 停用工具並隱藏所有控制項
- `createElement(x, y)`: 抽象方法，子類實現具體元素創建
- `createElementControls(container)`: 建立統一的3按鈕控制項
- `selectElement(container)`: 選中元素並顯示控制項
- `updateControlPositions(container)`: 更新控制項位置
- `handleResize(e)`: 處理元素縮放邏輯
- `deleteElement(container)`: 刪除元素和清理資源

**事件處理**:
- 容器點擊事件: 只在 cursor 工具模式下響應
- 拖拽移動: 透過移動按鈕或直接拖拽容器
- 縮放調整: 透過縮放控制點
- 鍵盤刪除: Delete 鍵刪除選中元素

**配置選項**:
```javascript
config = {
  defaultWidth: 200,       // 預設寬度
  defaultHeight: 150,      // 預設高度
  minWidth: 100,          // 最小寬度
  minHeight: 100,         // 最小高度
  moveButtonColor: '#10b981',    // 移動按鈕顏色
  deleteButtonColor: '#ef4444',  // 刪除按鈕顏色
  resizeButtonColor: '#3b82f6',  // 縮放按鈕顏色
  borderColor: '#10b981',        // 邊框顏色
  toolName: 'Element'            // 工具名稱
}
```

### 4. TextToolModule (文字工具模組)
**職責**: 處理文字新增和編輯功能

**主要方法**:
- `activate()`: 啟用文字工具
- `deactivate()`: 停用文字工具
- `handleCanvasClick(e)`: 處理畫布點擊事件
- `createTextInput(x, y)`: 建立文字輸入框
- `addTextToCanvas(text, x, y)`: 新增文字到畫布

**功能特色**:
- 點擊畫布任意位置新增文字
- 動態建立文字輸入框
- 支援 Enter 鍵確認輸入
- 文字內容保存到繪圖歷史

### 5. NotesModule (便條紙模組) [繼承 BaseControlModule]
**職責**: 管理便條紙的新增、編輯和移動

**主要方法**:
- `createElement(x, y)`: 實現基類要求的元素創建
- `createNote(x, y)`: 建立便條紙
- `handleResize(e)`: 覆寫縮放處理，支援字體自動調整

**功能特色**:
- 統一3按鈕控制體驗
- 點擊內容區域顯示控制項
- 文字區域自動聚焦編輯
- 縮放時字體大小自動調整
- 空白內容自動刪除

**資料結構**:
```javascript
notes = [
  {
    id: 1,
    x: 100, y: 100,
    width: 120, height: 80,
    text: '便條內容',
    color: '#ffeb3b'
  }
]
```

### 6. QRCodeModule (QR Code 產生器模組)
**職責**: 生成和管理 QR Code

**主要方法**:
- `activate()`: 顯示 QR 設定面板
- `deactivate()`: 隱藏面板並清理狀態
- `createQRCodeOnCanvas(x, y, text, size)`: 建立 QR Code
- `generateQRCodeURL(text, size)`: 生成 QR Code API URL

**功能特色**:
- 真實 QR Code 生成 (qr-server.com API)
- 輸入面板即時預覽
- 可調整大小 (100-300px)
- 支援文字、網址、電話號碼
- 錯誤處理和備用方案
- 與 BaseControlModule 獨立運作 (保持原有邏輯)

### 7. YouTubeModule (YouTube 影片嵌入模組) [繼承 BaseControlModule]
**職責**: 處理 YouTube 影片的嵌入和管理

**主要方法**:
- `createElement(x, y)`: 實現基類要求的元素創建
- `extractVideoId(url)`: 解析 YouTube URL 獲取影片 ID
- `createVideoContainer(videoId, x, y)`: 建立影片容器
- `handleResize(e)`: 覆寫縮放處理，保持 16:9 比例

**功能特色**:
- 統一3按鈕控制體驗
- 支援多種 YouTube URL 格式
- 自動保持 16:9 比例縮放
- iframe 嵌入支援全螢幕播放

### 8. ImageModule (圖片插入模組) [繼承 BaseControlModule]
**職責**: 處理圖片的上傳、顯示和管理

**主要方法**:
- `createElement(x, y)`: 實現基類要求的元素創建
- `uploadImageFile(x, y)`: 處理圖片檔案上傳
- `inputImageURL(x, y)`: 處理圖片 URL 輸入
- `createImageContainer(src, x, y, name)`: 建立圖片容器

**功能特色**:
- 統一3按鈕控制體驗
- 支援檔案上傳和 URL 輸入
- 多格式支援 (JPG, PNG, GIF, WebP, SVG)
- Base64 編碼儲存
- 載入錯誤處理和佔位符

### 9. CountdownModule (倒數計時器模組) [繼承 BaseControlModule]
**職責**: 管理倒數計時器功能

**主要方法**:
- `createElement(x, y)`: 實現基類要求的元素創建
- `createCountdown(x, y)`: 建立倒數計時器
- `startCountdown()`: 開始倒數
- `onCountdownFinished()`: 計時結束處理
- `handleResize(e)`: 覆寫縮放處理，保持比例

**功能特色**:
- 統一3按鈕控制體驗
- 可調整分鐘/秒數設定
- 計時結束聲音警報
- Toast 通知和閃爍提醒
- Web Audio API 生成警報聲

### 10. StopwatchModule (碼錶模組) [繼承 BaseControlModule]
**職責**: 管理碼錶計時功能

**主要方法**:
- `createElement(x, y)`: 實現基類要求的元素創建
- `createStopwatch(x, y)`: 建立碼錶
- `startStopwatch()`: 開始計時
- `pauseStopwatch()`: 暫停計時
- `resetStopwatch()`: 重置計時
- `handleResize(e)`: 覆寫縮放處理，保持比例

**功能特色**:
- 統一3按鈕控制體驗
- 百分秒精度 (10ms 更新)
- 橫向佈局設計
- 播放/暫停/重置控制
- 字體隨縮放調整

### 11. VolumeDetectionModule (音量偵測模組)
**職責**: 監控麥克風音量並提供警告功能

**主要方法**:
- `startVolumeDetection()`: 開始音量監控
- `stopVolumeDetection()`: 停止音量監控
- `analyzeVolume()`: 分析音量資料
- `showWarningToast(message)`: 顯示警告 Toast

**功能特色**:
- 麥克風權限管理
- 即時音量視覺化
- 可調整閾值設定
- 警告計數和動畫
- 冷卻機制防止重複警告

## 專案管理系統 (開發中)

### 12. ProjectManager (專案管理器)
**職責**: 統一管理專案的 CRUD 操作

**主要方法** (計畫中):
- `createProject(name, description)`: 新增專案
- `loadProject(projectId)`: 載入專案
- `saveCurrentProject()`: 儲存當前專案
- `deleteProject(projectId)`: 刪除專案
- `getProjectList()`: 取得專案列表
- `getCurrentProject()`: 取得當前專案
- `renameProject(projectId, newName)`: 重新命名
- `generateThumbnail()`: 產生縮圖

### 13. SaveLoadModule (儲存載入模組)
**職責**: 協調各模組進行資料匯出和匯入

**主要方法** (計畫中):
- `collectAllData()`: 收集所有模組資料
- `restoreAllData(projectData)`: 還原所有模組狀態
- `exportCanvasAsImage()`: 匯出畫布縮圖
- `compressData(data)`: 資料壓縮
- `validateData(data)`: 資料驗證

### 14. ProjectUI (專案介面模組)
**職責**: 管理專案相關的使用者介面

**主要方法** (計畫中):
- `showWelcomeScreen()`: 顯示歡迎畫面
- `showProjectSelector()`: 顯示專案選擇器
- `showCreateProjectDialog()`: 顯示新增專案對話框
- `updateProjectInfo()`: 更新專案資訊顯示
- `handleProjectInteractions()`: 處理專案互動

## 模組間通訊機制

### 事件協調 (app.js)
```javascript
// 工具切換時的模組協調
penTool.addEventListener('click', () => {
    textToolModule.deactivate();
    notesModule.deactivate();
    qrCodeModule.deactivate();
    youtubeModule.deactivate();
    imageModule.deactivate();
    countdownModule.deactivate();
    stopwatchModule.deactivate();
    canvasModule.setTool('pen');
});

// 清空畫布時的資料同步
clearCanvasBtn.addEventListener('click', () => {
    canvasModule.clearCanvas();
    notesModule.clearAllNotes();
    qrCodeModule.clearAllQRCodes();
    youtubeModule.clearAllVideos();
    imageModule.clearAllImages();
    countdownModule.clearAllCountdowns();
    stopwatchModule.clearAllStopwatches();
    backgroundModule.drawBackground();
});
```

### 重繪機制協調
```javascript
// RWD 調整時的重繪順序
window.addEventListener('resize', () => {
    canvasModule.resizeCanvas();      // 1. 調整畫布尺寸
    backgroundModule.drawBackground(); // 2. 重繪背景
    canvasModule.redrawAllContent();  // 3. 重繪前景內容
    canvasModule.setDefaultStyles();  // 4. 恢復工具樣式
});
```

### 專案管理整合 (計畫中)
```javascript
// 專案儲存時的資料收集
saveBtn.addEventListener('click', () => {
    const projectData = saveLoadModule.collectAllData();
    projectManager.saveCurrentProject(projectData);
});

// 專案載入時的狀態還原
function loadProject(projectId) {
    const projectData = projectManager.loadProject(projectId);
    saveLoadModule.restoreAllData(projectData);
}
```

## 資料流向

```
使用者操作 → app.js 事件處理 → 對應模組方法 → CanvasModule/DOM 更新 → 更新資料結構
     ↑                                                                          ↓
專案管理 ← ProjectManager ← SaveLoadModule ← 各模組 exportData() ← 模組資料收集
     ↓                                                                          ↑
載入專案 → SaveLoadModule → 各模組 importData() → 還原模組狀態 → 重建使用者介面
```

## 技術特色

1. **模組化設計**: 每個功能獨立封裝，便於維護和擴展
2. **事件驅動**: 透過 app.js 統一管理事件和模組通訊  
3. **混合資料持久化**: 
   - Canvas 繪圖: drawingHistory 陣列
   - DOM 元素: 各模組獨立管理
   - 專案資料: localStorage 統一儲存
4. **響應式支援**: 自動調整畫布尺寸並保留內容
5. **工具狀態管理**: 統一的工具切換和狀態追蹤機制
6. **專案管理系統**: 支援多專案建立、儲存、載入 (開發中)
7. **資料匯出入架構**: 各模組提供標準化的資料處理介面 (開發中) 

## 工具開發流程與最佳實踐 ⭐

### 新增工具開發指南

#### 開發方式選擇

**方式一：繼承 BaseControlModule（推薦）**
適用於需要標準 3 按鈕控制的工具（移動、刪除、縮放）

**方式二：獨立實作**
適用於需要特殊控制邏輯的工具（如 QRCodeModule）

#### 方式一：繼承 BaseControlModule 開發流程

##### 1. 建立模組檔案 (js/XXXModule.js)
```javascript
class XXXModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        const config = {
            defaultWidth: 200,
            defaultHeight: 150,
            minWidth: 100,
            minHeight: 100,
            moveButtonColor: '#10b981',
            deleteButtonColor: '#ef4444', 
            resizeButtonColor: '#3b82f6',
            borderColor: '#10b981',
            toolName: '工具名稱'
        };
        super(canvasModule, backgroundModule, appInstance, config);
    }

    // 必須實作：建立元素
    createElement(x, y) {
        const elementId = `xxx-${this.nextId++}`;
        const container = document.createElement('div');
        container.id = elementId;
        container.className = 'xxx-container';
        
        // 設定容器樣式
        container.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${this.config.defaultWidth}px;
            height: ${this.config.defaultHeight}px;
            // 其他樣式...
        `;
        
        // 新增內容到容器
        // ...
        
        // 建立控制項
        this.createElementControls(container);
        
        // 新增到管理陣列和頁面
        this.elements.push(container);
        document.body.appendChild(container);
        
        return container;
    }

    // 建議實作：直接建立方法（供 app.js 呼叫）
    createXXXDirectly(x, y) {
        return this.createElement(x, y);
    }

    // 必須實作：匯出元素資料
    exportElementData(element) {
        const baseData = super.exportElementData(element);
        return {
            ...baseData,
            // 新增工具特定的資料屬性
            customProperty: element.customValue
        };
    }

    // 必須實作：匯入元素資料
    importElementData(elementData) {
        const element = this.createElement(elementData.x, elementData.y);
        
        // 設定元素特定屬性
        if (elementData.customProperty) {
            element.customValue = elementData.customProperty;
        }
        
        // 恢復尺寸
        if (elementData.width && elementData.height) {
            element.style.width = elementData.width + 'px';
            element.style.height = elementData.height + 'px';
        }
    }
}
```

##### 2. app.js 整合步驟

```javascript
// 1. 全域變數宣告
let xxxModule;

// 2. 在 app 物件的 hideAllControls 方法中新增
hideAllControls: () => {
    // 其他模組...
    xxxModule.hideAllControls();
}

// 3. 模組初始化（確保在 app 物件建立後）
xxxModule = new XXXModule(canvasModule, backgroundModule, app);

// 4. 工具按鈕事件監聽器
xxxToolBtn.addEventListener('click', () => {
    canvasModule.setTool('cursor');
    setActiveToolButton(cursorTool);
    canvas.style.cursor = 'default';
    
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    xxxModule.createXXXDirectly(centerX, centerY);
    
    app.hideAllControls();
    selectedElement = null;
});

// 5. handleElementSelection 中新增判斷
else if (xxxModule.elements.includes(clickedElement)) {
    xxxModule.selectElement(clickedElement);
    console.log('[App.js] xxxModule.selectElement called for:', clickedElement.id);
}

// 6. clearCanvas 事件中新增
xxxModule.clearAllElements();

// 7. SaveLoadModule 整合
new SaveLoadModule(
    // 其他模組...
    xxxModule
);
```

#### 方式二：獨立實作開發流程

##### 關鍵要求
1. 建構函數必須接收 `appInstance` 並儲存為 `this.app`
2. 實作 `selectXXX(element)` 方法，開始時必須呼叫 `this.app.hideAllControls()`
3. 實作 `hideAllControls()` 方法
4. 實作 `exportData()` 和 `importData()` 方法
5. 座標儲存使用 `style.left/top` 而非 `getBoundingClientRect()`

##### 核心實作模式
```javascript
class XXXModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.app = appInstance; // 關鍵：儲存 app 實例
        this.elements = [];
        // 其他初始化...
    }

    selectXXX(element) {
        // 關鍵：先隱藏所有控制項
        if (this.app && this.app.hideAllControls) {
            this.app.hideAllControls();
        }
        
        // 然後顯示當前元素控制項
        this.showControls(element);
    }

    hideAllControls() {
        this.elements.forEach(element => {
            this.hideControls(element);
        });
    }
}
```

### 開發檢查清單

#### 開發前準備
- [ ] 確定工具功能需求
- [ ] 選擇合適的開發方式（繼承 vs 獨立）
- [ ] 設計工具的視覺樣式和互動行為

#### 模組開發
- [ ] 建立模組檔案並實作核心方法
- [ ] 確保 app 實例正確傳遞和儲存
- [ ] 實作 select 方法並確保先呼叫 `app.hideAllControls()`
- [ ] 實作 `hideAllControls()` 方法
- [ ] 實作 `exportData/importData` 方法
- [ ] 座標使用 `style` 屬性而非 `getBoundingClientRect()`

#### app.js 整合
- [ ] 全域變數宣告
- [ ] `app.hideAllControls` 方法更新
- [ ] 模組初始化（在 app 物件建立後）
- [ ] HTML 按鈕新增
- [ ] 按鈕事件監聽器新增
- [ ] `handleElementSelection` 判斷邏輯新增
- [ ] `clearCanvas` 事件整合
- [ ] `SaveLoadModule` 建構函數參數新增

#### 測試驗證
- [ ] 點擊工具建立元素正常
- [ ] 點擊元素只顯示該元素的 3 按鈕
- [ ] 點擊其他元素會隱藏前一個元素的按鈕
- [ ] 點擊空白處隱藏所有按鈕
- [ ] 3 按鈕功能正常（移動、縮放、刪除）
- [ ] 儲存專案功能正常
- [ ] 載入專案功能正常
- [ ] 清空畫布功能正常

### 常見問題除錯

#### 按鈕顯示異常
1. 檢查 app 實例是否正確傳遞到模組
2. 檢查 `app.hideAllControls()` 是否包含新模組
3. 檢查 `selectXXX` 方法是否在開始時呼叫 `app.hideAllControls()`
4. 檢查模組初始化順序是否正確

#### 儲存載入失敗
1. 檢查 `exportElementData` 方法實作
2. 確保座標使用 `style.left/top` 屬性
3. 檢查 `SaveLoadModule` 建構函數是否包含新模組
4. 驗證 `importElementData` 方法正確恢復元素狀態

#### 控制項位置錯誤
1. 確保容器使用 `position: absolute`
2. 檢查 `updateControlPositions` 方法實作
3. 驗證元素 `getBoundingClientRect()` 回傳值正確

### 效能最佳化建議

1. **記憶體管理**：確保元素刪除時清理所有事件監聽器
2. **DOM 操作**：批次更新 DOM 屬性減少重繪
3. **事件節流**：拖拽和縮放事件使用 throttle 減少計算頻率
4. **資料壓縮**：匯出資料時移除不必要的屬性
5. **懶加載**：大量元素時考慮虛擬滾動或分頁載入

### 程式碼品質標準

1. **命名規範**：使用語義化的變數和方法名稱
2. **註解文檔**：為複雜邏輯新增詳細註解
3. **錯誤處理**：新增適當的錯誤處理和使用者提示
4. **類型檢查**：參數驗證和類型檢查
5. **測試覆蓋**：確保核心功能有測試驗證

這個開發指南確保所有新工具都能與現有系統完美整合，提供一致的使用者體驗。 