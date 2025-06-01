let canvasModule;
let backgroundModule;
let textToolModule;
let notesModule;
let qrCodeModule;
let youtubeModule;
let imageModule;
let countdownModule;
let stopwatchModule;
let linkModule;
let volumeDetectionModule;

// 專案管理系統
let projectManager;
let saveLoadModule;
let projectUI;

// 全域選中元素追蹤
let selectedElement = null;

document.addEventListener('DOMContentLoaded', () => {
    canvasModule = new CanvasModule('whiteboard');
    backgroundModule = new BackgroundModule(canvasModule);
    textToolModule = new TextToolModule(canvasModule, backgroundModule);
    
    // 建立 app 實例以便傳遞給所有需要的模組
    const app = {
        canvasModule,
        backgroundModule,
        textToolModule,
        setSelectedElement: (element) => {
            selectedElement = element;
        },
        getSelectedElement: () => selectedElement,
        hideAllControls: () => {
            // 隱藏所有模組的控制項
            notesModule.hideAllControls();
            qrCodeModule.hideAllControls();
            youtubeModule.hideAllControls();
            imageModule.hideAllControls();
            countdownModule.hideAllControls();
            stopwatchModule.hideAllControls();
            linkModule.hideAllControls();
        }
    };

    // 初始化所有需要app實例的模組
    notesModule = new NotesModule(canvasModule, backgroundModule, app);
    qrCodeModule = new QRCodeModule(canvasModule, backgroundModule, app);
    youtubeModule = new YouTubeModule(canvasModule, backgroundModule, app);
    imageModule = new ImageModule(canvasModule, backgroundModule, app);
    countdownModule = new CountdownModule(canvasModule, backgroundModule, app);
    stopwatchModule = new StopwatchModule(canvasModule, backgroundModule, app);
    linkModule = new LinkModule(canvasModule, backgroundModule, app);

    // 更新app實例以包含notesModule
    app.notesModule = notesModule;

    // 初始化音量偵測模組
    volumeDetectionModule = new VolumeDetectionModule();

    // 初始化專案管理系統
    projectManager = new ProjectManager();
    saveLoadModule = new SaveLoadModule(
        canvasModule, 
        backgroundModule, 
        textToolModule, 
        notesModule, 
        qrCodeModule, 
        youtubeModule, 
        imageModule, 
        countdownModule, 
        stopwatchModule,
        linkModule
    );
    
    // 建立專案UI（這會顯示啟動畫面）
    projectUI = new ProjectUI(projectManager, saveLoadModule);
    
    // 將專案UI設為全域變數供HTML onclick使用
    window.projectUI = projectUI;

    const canvas = canvasModule.getCanvasElement();
    const cursorTool = document.getElementById('cursorTool');
    const penTool = document.getElementById('penTool');
    const eraserTool = document.getElementById('eraserTool');
    const textToolBtn = document.getElementById('textTool');
    const notesToolBtn = document.getElementById('notesTool');
    const qrToolBtn = document.getElementById('qrTool');
    const youtubeToolBtn = document.getElementById('youtubeTool');
    const imageToolBtn = document.getElementById('imageTool');
    const countdownToolBtn = document.getElementById('countdownTool');
    const stopwatchToolBtn = document.getElementById('stopwatchTool');
    const linkToolBtn = document.getElementById('linkTool');
    const colorPicker = document.getElementById('colorPicker');
    const lineWidthSlider = document.getElementById('lineWidth');
    const lineWidthValue = document.getElementById('lineWidthValue');
    const clearCanvasBtn = document.getElementById('clearCanvas');
    const backgroundSelector = document.getElementById('backgroundSelector');
    const customBgColorPicker = document.getElementById('customBackgroundColorPicker');

    // 設定初始工具為選取工具（cursor）
    canvasModule.setTool('cursor');
    cursorTool.classList.add('ring-2', 'ring-offset-2', 'ring-cyan-700');
    let activeToolButton = cursorTool;

    function setActiveToolButton(newToolButton) {
        if (activeToolButton) {
            activeToolButton.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-700', 'ring-gray-700', 'ring-yellow-700', 'ring-orange-700', 'ring-green-700', 'ring-purple-700', 'ring-red-700', 'ring-indigo-700', 'ring-cyan-700');
        }
        let ringColorClass = '';
        if (newToolButton === cursorTool) ringColorClass = 'ring-cyan-700';
        else if (newToolButton === penTool) ringColorClass = 'ring-blue-700';
        else if (newToolButton === eraserTool) ringColorClass = 'ring-gray-700';
        else if (newToolButton === textToolBtn) ringColorClass = 'ring-yellow-700';

        newToolButton.classList.add('ring-2', 'ring-offset-2', ringColorClass);
        activeToolButton = newToolButton;
    }

    // 工具選擇
    cursorTool.addEventListener('click', () => {
        textToolModule.deactivate();
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
    });

    penTool.addEventListener('click', () => {
        textToolModule.deactivate();
        canvasModule.setTool('pen');
        setActiveToolButton(penTool);
        canvas.style.cursor = 'crosshair';
        app.hideAllControls();
        selectedElement = null;
    });

    eraserTool.addEventListener('click', () => {
        textToolModule.deactivate();
        canvasModule.setTool('eraser');
        setActiveToolButton(eraserTool);
        canvas.style.cursor = 'crosshair';
        app.hideAllControls();
        selectedElement = null;
    });

    textToolBtn.addEventListener('click', () => {
        canvasModule.setTool('text');
        textToolModule.activate();
        setActiveToolButton(textToolBtn);
        app.hideAllControls();
        selectedElement = null;
    });

    // 功能按鈕 - 直接建立內容，不設定工具狀態
    notesToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 直接建立便條紙
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        notesModule.createNoteDirectly(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    qrToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 直接建立QR code
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        qrCodeModule.createQRDirectly(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    youtubeToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 直接建立YouTube影片
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        youtubeModule.createVideoDirectly(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    imageToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 直接建立圖片
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        imageModule.createImageDirectly(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    countdownToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 直接建立倒數計時器
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        countdownModule.createCountdownDirectly(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    stopwatchToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 直接建立碼錶
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        stopwatchModule.createStopwatchDirectly(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    linkToolBtn.addEventListener('click', () => {
        // 保持cursor工具選中狀態
        canvasModule.setTool('cursor');
        setActiveToolButton(cursorTool);
        canvas.style.cursor = 'default';
        
        // 顯示超連結輸入對話框
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        linkModule.createElement(centerX, centerY);
        
        app.hideAllControls();
        selectedElement = null;
    });

    // 顏色選擇
    colorPicker.addEventListener('input', (e) => { // 'input' 事件即時響應
        canvasModule.setColor(e.target.value);
    });

    // 線條粗細
    lineWidthSlider.addEventListener('input', (e) => { // 'input' 事件即時響應
        const width = e.target.value;
        canvasModule.setLineWidth(width);
        lineWidthValue.textContent = width;
    });

    // 清空畫布
    clearCanvasBtn.addEventListener('click', () => {
        canvasModule.clearCanvas(); // 這會清除畫布和 drawingHistory
        notesModule.clearAllNotes(); // 清空便條紙DOM元素
        qrCodeModule.clearAllQRCodes(); // 清空 QR codes DOM元素
        youtubeModule.clearAllVideos(); // 清空 YouTube 影片
        imageModule.clearAllImages(); // 清空圖片
        countdownModule.clearAllCountdowns(); // 清空倒數計時器
        stopwatchModule.clearAllStopwatches(); // 清空碼錶
        linkModule.clearAllLinks(); // 清空超連結
        backgroundModule.drawBackground(); // 然後重繪背景
        // 此時前景是空的，不需要 redrawAllContent
    });

    // 背景選擇
    backgroundSelector.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        if (selectedType === 'customColor') {
            customBgColorPicker.classList.remove('hidden');
            customBgColorPicker.click(); // 模擬點擊以觸發顏色選擇器
            // 當 customBgColorPicker 值改變時，再設定背景
        } else {
            customBgColorPicker.classList.add('hidden');
            backgroundModule.setBackground(selectedType);
        }
    });

    customBgColorPicker.addEventListener('input', (e) => {
        if (backgroundSelector.value === 'customColor') {
            backgroundModule.setBackground('customColor', e.target.value);
            // backgroundModule.setBackground 內部會呼叫 drawBackground 和 canvasModule.redrawAllContent
        }
    });

    // 初始繪製背景
    backgroundModule.drawBackground();
    canvasModule.setDefaultStyles(); // 設定初始的畫筆樣式

    // 處理元素選擇的輔助函數，用於重置元素邊框
    function resetElementBorder(element) {
        if (!element) return;

        // 根據元素的類型重置其預設邊框
        // 注意：這裡的邊框樣式需要與各模組中未選中狀態的樣式一致
        if (notesModule.notes.includes(element)) {
            element.style.border = '2px solid #f59e0b'; // 便條紙預設邊框
        } else if (qrCodeModule.qrCodes.includes(element)) {
            element.style.border = '2px solid #10b981'; // QR Code 預設邊框
        } else if (youtubeModule.youtubeVideos.includes(element)) {
            element.style.border = '2px solid #3b82f6'; // YouTube 預設邊框
        } else if (imageModule.images.includes(element)) {
            element.style.border = '2px solid #6366f1'; // 圖片預設邊框
        } else if (countdownModule.countdowns.includes(element)) {
            // 倒數計時器的選中效果是 box-shadow，非選中也是 box-shadow
            element.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)'; 
        } else if (stopwatchModule.stopwatches.includes(element)) {
            // 碼錶的選中效果是 box-shadow，非選中也是 box-shadow
            element.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        } else if (linkModule.links.includes(element)) {
            element.style.border = '2px solid #e5e7eb'; // 超連結預設邊框
        }
        // 可以為其他模組添加更多 else if
    }

    // 畫布事件監聽 (滑鼠)
    canvas.addEventListener('mousedown', (e) => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.startDrawing(e);
        } else if (canvasModule.currentTool === 'cursor') {
            handleElementSelection(e);
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.draw(e);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.stopDrawing();
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.stopDrawing();
        }
    });

    // 畫布事件監聽 (觸控)
    canvas.addEventListener('touchstart', (e) => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.startDrawing(e);
        } else if (canvasModule.currentTool === 'text') {
            textToolModule.handleCanvasClick(e.touches[0]);
        } else if (canvasModule.currentTool === 'cursor') {
            // 處理觸控設備的元素選擇
            handleElementSelection(e.touches[0]);
        }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.draw(e);
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', () => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.stopDrawing();
        }
    });
    
    canvas.addEventListener('touchcancel', () => {
        if (canvasModule.currentTool === 'pen' || canvasModule.currentTool === 'eraser') {
            canvasModule.stopDrawing();
        }
    });

    // 處理元素選擇的函數
    function handleElementSelection(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let clickedElement = null;
        let eventTarget = e.target; // 實際被點擊的DOM元素

        console.log('[App.js] Original event target:', eventTarget, 'className:', eventTarget.className, 'id:', eventTarget.id);

        // 檢查事件目標是否為QR碼控制按鈕，如果是，則通過data-qr-id找到對應的容器
        if (eventTarget.classList.contains('qr-control-btn')) {
            const qrId = eventTarget.getAttribute('data-qr-id');
            if (qrId) {
                const qrContainer = document.getElementById(qrId);
                if (qrContainer && qrCodeModule.qrCodes.includes(qrContainer)) {
                    eventTarget = qrContainer; // 將事件目標視為QR容器本身
                    console.log('[App.js] Clicked QR control button, mapping to container:', qrId);
                }
            }
        }
        // 檢查是否點擊的是QR碼容器內部的元素（如img）
        else if (eventTarget.parentElement && qrCodeModule.qrCodes.includes(eventTarget.parentElement)) {
            eventTarget = eventTarget.parentElement;
            console.log('[App.js] Clicked QR inner element, mapping to parent container:', eventTarget.id);
        }
        // 檢查是否點擊的就是QR碼容器本身
        else if (qrCodeModule.qrCodes.includes(eventTarget)) {
            console.log('[App.js] Clicked QR container directly:', eventTarget.id);
        }

        // 檢查超連結模組的內部元素點擊
        // 檢查是否點擊超連結的開啟按鈕（不進行容器映射，讓按鈕功能正常運作）
        if (eventTarget.classList.contains('link-open-circle-btn')) {
            console.log('[App.js] Clicked link open button, not mapping to container');
            // 不修改 eventTarget，讓按鈕的點擊事件正常處理
        }
        // 檢查是否點擊超連結內部的其他元素（如圖片、文字等）
        else if (eventTarget.closest('.link-container')) {
            const linkContainer = eventTarget.closest('.link-container');
            if (linkModule.links.includes(linkContainer)) {
                eventTarget = linkContainer;
                console.log('[App.js] Clicked link inner element, mapping to parent container:', linkContainer.id);
            }
        }
        // 檢查是否點擊的就是超連結容器本身
        else if (linkModule.links.includes(eventTarget)) {
            console.log('[App.js] Clicked link container directly:', eventTarget.id);
        }

        // TODO: 為其他模組的控制按鈕和內部元素添加類似的邏輯
        // 例如：
        // if (eventTarget.classList.contains('note-control-btn')) {
        //     const noteId = eventTarget.getAttribute('data-note-id');
        //     if (noteId) {
        //         const noteContainer = document.getElementById(noteId);
        //         if (noteContainer && notesModule.notes.includes(noteContainer)) {
        //             eventTarget = noteContainer;
        //         }
        //     }
        // } else if (eventTarget.parentElement && notesModule.notes.includes(eventTarget.parentElement)) {
        //     eventTarget = eventTarget.parentElement;
        // }
        // ... 其他模組

        console.log('[App.js] Final event target:', eventTarget, 'className:', eventTarget.className, 'id:', eventTarget.id);

        // 如果點擊的是超連結開啟按鈕，不進行任何元素選擇操作
        if (eventTarget.classList.contains('link-open-circle-btn')) {
            console.log('[App.js] Clicked link open button, ignoring element selection');
            return; // 直接返回，不處理元素選擇
        }

        // 優先使用事件的直接目標 (可能已被修改為父容器) 來判斷是否為已知的可選元素
        if (notesModule.notes.includes(eventTarget)) {
            clickedElement = eventTarget;
        } else if (qrCodeModule.qrCodes.includes(eventTarget)) {
            clickedElement = eventTarget;
        } else if (youtubeModule.youtubeVideos.includes(eventTarget)) {
            clickedElement = eventTarget;
        } else if (imageModule.images.includes(eventTarget)) {
            clickedElement = eventTarget;
        } else if (countdownModule.countdowns.includes(eventTarget)) {
            clickedElement = eventTarget;
        } else if (stopwatchModule.stopwatches.includes(eventTarget)) {
            clickedElement = eventTarget;
        } else if (linkModule.links.includes(eventTarget)) {
            clickedElement = eventTarget;
        }

        console.log('[App.js] Clicked element found by target:', clickedElement ? clickedElement.id : 'null');

        // 如果直接目標不是已知元素 (或處理後仍然無法識別)，再使用位置判斷 (作為備用)
        if (!clickedElement) {
            console.log('[App.js] Did not find element by target, trying by position...');
            const note = notesModule.getNoteAtPosition(x, y);
            if (note) clickedElement = note;
        }
        if (!clickedElement) {
            const qr = qrCodeModule.getQRAtPosition(x, y);
            if (qr) clickedElement = qr;
        }
        if (!clickedElement) {
            const video = youtubeModule.getVideoAtPosition(x, y);
            if (video) clickedElement = video;
        }
        if (!clickedElement) {
            const image = imageModule.getImageAtPosition(x, y);
            if (image) clickedElement = image;
        }
        if (!clickedElement) { // Corrected from clickedPoint
            const countdown = countdownModule.getCountdownAtPosition(x, y);
            if (countdown) clickedElement = countdown;
        }
        if (!clickedElement) {
            const stopwatch = stopwatchModule.getStopwatchAtPosition(x, y);
            if (stopwatch) clickedElement = stopwatch;
        }
        if (!clickedElement) {
            const link = linkModule.getLinkAtPosition(x, y);
            if (link) clickedElement = link;
        }

        console.log('[App.js] Final clicked element:', clickedElement ? clickedElement.id : 'null');

        const previouslySelectedElement = selectedElement;

        if (clickedElement) {
            // 點擊到元素
            if (previouslySelectedElement && previouslySelectedElement !== clickedElement) {
                resetElementBorder(previouslySelectedElement);
            }

            // 設定全域選中元素
            selectedElement = clickedElement; 

            // 呼叫對應模組的選擇方法，這會自動隱藏所有其他元素的控制按鈕，然後顯示該元素的控制按鈕
            console.log('[App.js] Element clicked:', clickedElement.id);

            if (notesModule.notes.includes(clickedElement)) {
                notesModule.selectNote(clickedElement);
                console.log('[App.js] notesModule.selectNote called for:', clickedElement.id);
            } else if (qrCodeModule.qrCodes.includes(clickedElement)) {
                qrCodeModule.selectQR(clickedElement);
                console.log('[App.js] qrCodeModule.selectQR called for:', clickedElement.id);
            } else if (youtubeModule.youtubeVideos.includes(clickedElement)) {
                youtubeModule.selectVideo(clickedElement);
                console.log('[App.js] youtubeModule.selectVideo called for:', clickedElement.id);
            } else if (imageModule.images.includes(clickedElement)) {
                imageModule.selectImage(clickedElement);
                console.log('[App.js] imageModule.selectImage called for:', clickedElement.id);
            } else if (countdownModule.countdowns.includes(clickedElement)) {
                countdownModule.selectCountdown(clickedElement);
                console.log('[App.js] countdownModule.selectCountdown called for:', clickedElement.id);
            } else if (stopwatchModule.stopwatches.includes(clickedElement)) {
                stopwatchModule.selectStopwatch(clickedElement);
                console.log('[App.js] stopwatchModule.selectStopwatch called for:', clickedElement.id);
            } else if (linkModule.links.includes(clickedElement)) {
                linkModule.selectElement(clickedElement);
                console.log('[App.js] linkModule.selectElement called for:', clickedElement.id);
            }
        } else {
            // 點擊到空白處，隱藏所有按鈕
            app.hideAllControls();

            if (previouslySelectedElement) {
                resetElementBorder(previouslySelectedElement);
            }
            selectedElement = null;
        }
    }

    // 監聽 window resize 事件，以便在 CanvasModule 調整大小後重繪背景
    window.addEventListener('resize', () => {
        // 1. CanvasModule 更新內部畫布元素的寬高，但不做任何繪製
        canvasModule.resizeCanvas(); 
        // 2. BackgroundModule 根據新的畫布尺寸重繪背景
        backgroundModule.drawBackground();
        // 3. CanvasModule 根據新的畫布尺寸重繪前景內容
        canvasModule.redrawAllContent();
        // 4. 重新套用目前的工具樣式 (因為 redrawAllContent 可能會改變 context 的狀態)
        canvasModule.setDefaultStyles();
        // 確保橡皮擦模式在 resize 後仍然是橡皮擦模式
        if (canvasModule.currentTool === 'eraser') {
            canvasModule.setTool('eraser'); 
        }

    });

    console.log('App initialized, CanvasModule, BackgroundModule, TextToolModule, NotesModule, QRCodeModule, CountdownModule, StopwatchModule loaded, and toolbar events are set up.');
});