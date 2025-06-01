```mermaid
graph TD
    A["使用者開啟網頁"] --> B{"初始化應用程式"};
    B --> B1["檢查 localStorage 專案資料"];
    B1 --> B2{"是否有現有專案?"};
    B2 -->|是| B3["載入上次專案或顯示專案選擇器"];
    B2 -->|否| B4["顯示歡迎畫面"];
    B3 --> C{"等待使用者操作"};
    B4 --> B5["引導建立第一個專案"];
    B5 --> C;

    %% 專案管理流程
    C --> PM["專案管理"];
    PM --> PM1["新增專案"];
    PM1 --> PM2["輸入專案名稱和描述"];
    PM2 --> PM3["建立空白畫布"];
    PM3 --> C;
    
    PM --> PM4["開啟專案"];
    PM4 --> PM5["顯示專案選擇器"];
    PM5 --> PM6["選擇專案"];
    PM6 --> PM7["載入專案內容"];
    PM7 --> C;
    
    PM --> PM8["儲存專案"];
    PM8 --> PM9["收集所有模組資料"];
    PM9 --> PM10["生成畫布縮圖"];
    PM10 --> PM11["儲存到 localStorage"];
    PM11 --> C;

    %% 工具選擇流程
    C --> D{"選擇工具"};
    D -- "游標工具" --> D0["啟用選擇模式"];
    D0 --> D01["隱藏所有控制項"];
    D01 --> D02["等待點擊內容"];
    D02 --> D03{"點擊內容?"};
    D03 -->|是| D04["顯示該內容的3按鈕控制項"];
    D03 -->|否| D05["隱藏所有控制項"];
    D04 --> D06["可進行移動/縮放/刪除操作"];
    D05 --> D02;
    D06 --> C;
    
    D -- "畫筆" --> E["設定畫筆顏色/粗細"];
    E --> F["在畫布上繪製"];
    F --> C;

    D -- "橡皮擦" --> G["在畫布上擦除"];
    G --> C;

    D -- "文字工具" --> H["點擊畫布新增文字框"];
    H --> I["輸入文字內容"];
    I --> C;

    %% 統一控制邏輯流程 (BaseControlModule)
    D -- "便條紙" --> UC["統一控制邏輯"];
    D -- "YouTube" --> UC;
    D -- "圖片" --> UC;
    D -- "倒數計時器" --> UC;
    D -- "碼錶" --> UC;
    
    UC --> UC1["點擊畫布位置"];
    UC1 --> UC2["呼叫 createElement(x, y)"];
    UC2 --> UC3["建立對應元素容器"];
    UC3 --> UC4["建立統一3按鈕控制項"];
    UC4 --> UC5["移動按鈕 (左上角)"];
    UC4 --> UC6["刪除按鈕 (右上角)"];
    UC4 --> UC7["縮放按鈕 (右下角)"];
    UC5 --> UC8["自動選中新元素"];
    UC6 --> UC8;
    UC7 --> UC8;
    UC8 --> UC9["顯示控制項"];
    UC9 --> UCO["使用者可進行操作"];
    
    %% 統一控制操作流程
    UCO --> UCO1{"操作類型"};
    UCO1 -- "拖拽移動" --> UCO2["更新元素位置"];
    UCO1 -- "縮放調整" --> UCO3["更新元素尺寸"];
    UCO1 -- "點擊刪除" --> UCO4["移除元素和控制項"];
    UCO1 -- "按Delete鍵" --> UCO4;
    UCO1 -- "點擊其他位置" --> UCO5["隱藏控制項"];
    UCO2 --> UCO6["更新控制項位置"];
    UCO3 --> UCO6;
    UCO4 --> C;
    UCO5 --> C;
    UCO6 --> UCO;

    D -- "QR Code" --> QR["QR Code 產生器"];

    %% 背景管理
    C --> L{"背景管理"};
    L --> M["選擇背景類型"];
    M --> N["更新畫布背景"];
    N --> C;

    %% 清空功能
    C --> S{"點擊清空畫布"};
    S --> T["清除所有內容"];
    T --> U["重繪背景"];
    U --> C;

    %% RWD 響應
    V["瀏覽器視窗大小改變"] --> W["調整畫布與介面佈局"];
    W --> X["重繪所有內容"];
    X --> Y["更新所有控制項位置"];
    Y --> C;

    %% QR Code 流程
    QR --> QR1["開啟 QR 面板"];
    QR1 --> QR2["輸入文字內容"];
    QR2 --> QR3["即時預覽 QR code"];
    QR3 --> QR4["調整大小設定"];
    QR4 --> QR5["點擊產生按鈕"];
    QR5 --> QR6["點擊畫布放置"];
    QR6 --> QR7["生成並顯示 QR code"];
    QR7 --> QR8["使用原有控制邏輯"];
    QR8 --> C;

    %% 音量偵測流程
    MIC["音量偵測"] --> MIC1["點擊麥克風按鈕"];
    MIC1 --> MIC2["請求麥克風權限"];
    MIC2 --> MIC3{"權限獲取成功?"};
    MIC3 -->|是| MIC4["初始化音頻分析器"];
    MIC3 -->|否| MIC5["顯示錯誤提示"];
    MIC4 --> MIC6["開始音量分析"];
    MIC6 --> MIC7["更新音量條顯示"];
    MIC7 --> MIC8{"音量超過閾值?"};
    MIC8 -->|是| MIC9["觸發警告"];
    MIC8 -->|否| MIC6;
    MIC9 --> MIC10["增加警告計數"];
    MIC10 --> MIC11["鈴鐺震動動畫"];
    MIC11 --> MIC12["顯示 Toast 警告"];
    MIC12 --> MIC6;
    
    %% 閾值調整流程
    THRESHOLD["閾值調整"] --> TH1["拖拽閾值滑桿"];
    TH1 --> TH2["更新閾值數值"];
    TH2 --> TH3["移動指示線位置"];
    TH3 --> C;
    
    %% 警告重置流程
    RESET["重置警告"] --> RS1["點擊鈴鐺圖示"];
    RS1 --> RS2["重置警告計數器"];
    RS2 --> RS3["顯示重置提示"];
    RS3 --> C;

    %% 工具切換時的統一控制處理
    SWITCH["工具切換"] --> SW1["停用目前工具"];
    SW1 --> SW2["呼叫所有模組的 deactivate()"];
    SW2 --> SW3["隱藏所有控制項"];
    SW3 --> SW4["啟用新工具"];
    SW4 --> C;

    %% 專案自動儲存
    AUTO["自動儲存機制"] --> AUTO1["定時檢查變更"];
    AUTO1 --> AUTO2{"內容有變更?"};
    AUTO2 -->|是| AUTO3["自動儲存專案"];
    AUTO2 -->|否| AUTO1;
    AUTO3 --> AUTO1;

    %% 瀏覽器關閉提醒
    CLOSE["瀏覽器關閉"] --> CLOSE1{"有未儲存變更?"};
    CLOSE1 -->|是| CLOSE2["顯示儲存提醒"];
    CLOSE1 -->|否| CLOSE3["正常關閉"];
    CLOSE2 --> CLOSE4["使用者選擇"];
    CLOSE4 -->|儲存| PM8;
    CLOSE4 -->|不儲存| CLOSE3;

    %% ===========================================
    %% 新增工具開發流程 (詳細程式設計指南)
    %% ===========================================
    
    NEWTOOL["新增工具開發"] --> NT1{"選擇開發方式"};
    NT1 -->|繼承BaseControlModule| NT_BASE["方式一: 繼承BaseControlModule"];
    NT1 -->|獨立實作| NT_INDEP["方式二: 獨立實作"];

    %% 方式一: 繼承BaseControlModule
    NT_BASE --> NTB1["建立 XXXModule.js"];
    NTB1 --> NTB2["class XXXModule extends BaseControlModule"];
    NTB2 --> NTB3["定義 constructor(canvasModule, backgroundModule, appInstance)"];
    NTB3 --> NTB4["設定 config 物件"];
    NTB4 --> NTB5["呼叫 super(canvasModule, backgroundModule, appInstance, config)"];
    NTB5 --> NTB6["實作 createElement(x, y) 方法"];
    NTB6 --> NTB7["建立 DOM 元素容器"];
    NTB7 --> NTB8["設定容器樣式和內容"];
    NTB8 --> NTB9["呼叫 this.createElementControls(container)"];
    NTB9 --> NTB10["this.elements.push(container)"];
    NTB10 --> NTB11["document.body.appendChild(container)"];
    NTB11 --> NTB12["return container"];
    NTB12 --> NTB13["實作 createXXXDirectly(x, y) 方法"];
    NTB13 --> NTB14["return this.createElement(x, y)"];
    NTB14 --> NTB15["實作 exportElementData(element) 方法"];
    NTB15 --> NTB16["const baseData = super.exportElementData(element)"];
    NTB16 --> NTB17["新增特定資料屬性"];
    NTB17 --> NTB18["return {...baseData, 特定屬性}"];
    NTB18 --> NTB19["實作 importElementData(elementData) 方法"];
    NTB19 --> NTB20["const element = this.createElement(x, y)"];
    NTB20 --> NTB21["設定元素特定屬性"];
    NTB21 --> NTB22["更新到 app.js"];

    %% 方式二: 獨立實作 (如QRCodeModule)
    NT_INDEP --> NTI1["建立 XXXModule.js"];
    NTI1 --> NTI2["class XXXModule"];
    NTI2 --> NTI3["定義 constructor(canvasModule, backgroundModule, appInstance)"];
    NTI3 --> NTI4["儲存 this.app = appInstance"];
    NTI4 --> NTI5["初始化 this.elements = []"];
    NTI5 --> NTI6["實作自訂控制項建立方法"];
    NTI6 --> NTI7["實作 selectXXX(element) 方法"];
    NTI7 --> NTI8["在 selectXXX 開始呼叫 this.app.hideAllControls()"];
    NTI8 --> NTI9["實作 hideAllControls() 方法"];
    NTI9 --> NTI10["實作 exportData() 和 importData() 方法"];
    NTI10 --> NTI11["更新到 app.js"];

    %% app.js 更新流程
    NTB22 --> APP_UPDATE["app.js 更新流程"];
    NTI11 --> APP_UPDATE;
    
    APP_UPDATE --> AU1["在全域變數宣告新模組"];
    AU1 --> AU2["在 app 物件的 hideAllControls 中新增"];
    AU2 --> AU3["xxxModule.hideAllControls()"];
    AU3 --> AU4["在模組初始化區域新增"];
    AU4 --> AU5["xxxModule = new XXXModule(canvasModule, backgroundModule, app)"];
    AU5 --> AU6["在 HTML 中新增工具按鈕"];
    AU6 --> AU7["新增按鈕事件監聽器"];
    AU7 --> AU8["在 handleElementSelection 中新增判斷"];
    AU8 --> AU9["else if (xxxModule.elements.includes(clickedElement))"];
    AU9 --> AU10["xxxModule.selectXXX(clickedElement)"];
    AU10 --> AU11["在 clearCanvas 事件中新增"];
    AU11 --> AU12["xxxModule.clearAllXXX()"];
    AU12 --> AU13["在 SaveLoadModule 中新增"];
    AU13 --> AU14["constructor 參數和 exportData/importData 整合"];
    AU14 --> DEPLOY["部署測試"];

    %% 關鍵注意事項流程
    DEPLOY --> KEY["關鍵注意事項"];
    KEY --> KEY1["確保模組初始化順序正確"];
    KEY1 --> KEY2["app 物件必須在所有模組初始化前建立"];
    KEY2 --> KEY3["所有模組都要接收 appInstance 參數"];
    KEY3 --> KEY4["selectXXX 方法必須先呼叫 app.hideAllControls()"];
    KEY4 --> KEY5["exportData/importData 使用 style 屬性座標"];
    KEY5 --> KEY6["控制按鈕 class 需包含識別符"];
    KEY6 --> KEY7["BaseControlModule: 'element-control-btn'"];
    KEY7 --> KEY8["QRCodeModule: 'qr-control-btn'"];
    KEY8 --> KEY9["測試三種場景"];
    KEY9 --> KEY10["1. 點擊元素只顯示該元素按鈕"];
    KEY10 --> KEY11["2. 點擊空白處隱藏所有按鈕"];
    KEY11 --> KEY12["3. 儲存載入功能正常"];
    KEY12 --> COMPLETE["開發完成"];

    %% 除錯流程
    DEBUG["常見問題除錯"] --> DBG1["按鈕顯示異常"];
    DBG1 --> DBG2["檢查 app 實例是否正確傳遞"];
    DBG2 --> DBG3["檢查 hideAllControls 是否包含新模組"];
    DBG3 --> DBG4["檢查 selectXXX 是否呼叫 app.hideAllControls()"];
    DBG4 --> DBG5["儲存載入失敗"];
    DBG5 --> DBG6["檢查 exportElementData 實作"];
    DBG6 --> DBG7["檢查座標使用 style 屬性而非 getBoundingClientRect"];
    DBG7 --> DBG8["檢查 SaveLoadModule 是否包含新模組"];
    DBG8 --> COMPLETE;
```

## 工具開發詳細程式設計流程說明

### 方式一：繼承 BaseControlModule（推薦）
適用於需要標準 3 按鈕控制的工具（移動、刪除、縮放）

#### 1. 建立模組檔案
```javascript
class XXXModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        const config = {
            defaultWidth: 200,
            defaultHeight: 150,
            toolName: '工具名稱'
        };
        super(canvasModule, backgroundModule, appInstance, config);
    }
}
```

#### 2. 核心方法實作
- `createElement(x, y)`: 建立元素 DOM
- `exportElementData(element)`: 匯出元素資料
- `importElementData(elementData)`: 匯入元素資料

### 方式二：獨立實作
適用於需要特殊控制邏輯的工具（如 QRCodeModule）

#### 關鍵要求：
1. 建構函數必須接收 `appInstance`
2. `selectXXX` 方法開始要呼叫 `this.app.hideAllControls()`
3. 實作 `hideAllControls()` 方法
4. 座標使用 `style.left/top` 而非 `getBoundingClientRect()`

### app.js 整合步驟
1. 全域變數宣告
2. hideAllControls 方法新增
3. 模組初始化（確保在 app 物件建立後）
4. HTML 按鈕和事件監聽器
5. handleElementSelection 新增判斷
6. clearCanvas 整合
7. SaveLoadModule 整合
``` 