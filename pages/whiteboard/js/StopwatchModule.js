// 碼錶模組 - 繼承自 BaseControlModule
class StopwatchModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        // 配置選項
        const config = {
            defaultWidth: 320,
            defaultHeight: 100,
            minWidth: 240,
            minHeight: 70,
            moveButtonColor: '#667eea',
            deleteButtonColor: '#ef4444',
            resizeButtonColor: '#3b82f6',
            toolName: '碼錶'
        };
        
        super(canvasModule, backgroundModule, appInstance, config);
    }

    // 實現基礎類別要求的 createElement 方法
    createElement(x, y) {
        return this.createStopwatch(x, y);
    }

    createStopwatch(x, y) {
        const stopwatchId = `stopwatch-${this.nextId++}`;
        
        // 建立碼錶容器
        const stopwatchContainer = document.createElement('div');
        stopwatchContainer.id = stopwatchId;
        stopwatchContainer.className = 'stopwatch-container';
        stopwatchContainer.style.cssText = `
            position: absolute;
            left: ${x - this.config.defaultWidth / 2}px;
            top: ${y - this.config.defaultHeight / 2}px;
            width: ${this.config.defaultWidth}px;
            height: ${this.config.defaultHeight}px;
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            border: 3px solid ${this.config.borderColor};
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            cursor: move;
            user-select: none;
            z-index: 50;
            font-family: 'Arial', sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            color: white;
        `;

        // 建立時間顯示區域
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.style.cssText = `
            font-size: 32px;
            font-weight: bold;
            text-align: left;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            font-family: 'Courier New', monospace;
            flex: 1;
        `;
        timeDisplay.textContent = '00:12.75';

        // 建立控制按鈕區域
        const controlArea = document.createElement('div');
        controlArea.className = 'control-area';
        controlArea.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            margin-left: 20px;
            flex-shrink: 0;
        `;

        // 播放/暫停按鈕
        const playPauseBtn = document.createElement('button');
        playPauseBtn.innerHTML = '▶';
        playPauseBtn.className = 'play-pause-btn';
        playPauseBtn.style.cssText = `
            width: 44px;
            height: 44px;
            background: #667eea;
            border: 2px solid rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        // 重置按鈕
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '↻';
        resetBtn.className = 'reset-btn';
        resetBtn.style.cssText = `
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            color: white;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        // 組裝控制區域
        controlArea.appendChild(playPauseBtn);
        controlArea.appendChild(resetBtn);

        // 組裝容器
        stopwatchContainer.appendChild(timeDisplay);
        stopwatchContainer.appendChild(controlArea);

        // 儲存計時器狀態
        stopwatchContainer.timerData = {
            id: stopwatchId,
            startTime: 0,
            elapsedTime: 12750, // 預設顯示 12.75 秒
            isRunning: false,
            intervalId: null,
            timeDisplay: timeDisplay,
            playPauseBtn: playPauseBtn
        };

        // 綁定碼錶功能事件
        this.bindStopwatchEvents(stopwatchContainer);

        // 建立統一控制項（使用基礎類別的方法）
        this.createElementControls(stopwatchContainer);

        // 添加到陣列和頁面
        this.elements.push(stopwatchContainer);
        document.body.appendChild(stopwatchContainer);

        // 選中新建立的碼錶
        this.selectElement(stopwatchContainer);
        
        console.log('碼錶已建立:', stopwatchId);
        return stopwatchContainer;
    }

    bindStopwatchEvents(stopwatchContainer) {
        const data = stopwatchContainer.timerData;
        
        // 播放/暫停按鈕事件
        data.playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (data.isRunning) {
                this.pauseStopwatch(stopwatchContainer);
            } else {
                this.startStopwatch(stopwatchContainer);
            }
        });

        // 重置按鈕事件
        const resetBtn = stopwatchContainer.querySelector('.reset-btn');
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetStopwatch(stopwatchContainer);
        });

        // 滑鼠懸停效果
        data.playPauseBtn.addEventListener('mouseenter', () => {
            data.playPauseBtn.style.transform = 'scale(1.1)';
            data.playPauseBtn.style.background = '#5a67d8';
        });

        data.playPauseBtn.addEventListener('mouseleave', () => {
            data.playPauseBtn.style.transform = 'scale(1)';
            data.playPauseBtn.style.background = '#667eea';
        });

        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.transform = 'scale(1.1)';
            resetBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.transform = 'scale(1)';
            resetBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
    }

    updateTimeDisplay(stopwatchContainer) {
        const data = stopwatchContainer.timerData;
        const totalSeconds = data.elapsedTime / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const centiseconds = Math.floor((data.elapsedTime % 1000) / 10);
        
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        data.timeDisplay.textContent = formattedTime;
    }

    startStopwatch(stopwatchContainer) {
        const data = stopwatchContainer.timerData;
        data.startTime = Date.now() - data.elapsedTime;
        data.isRunning = true;
        data.playPauseBtn.innerHTML = '⏸';
        
        data.intervalId = setInterval(() => {
            data.elapsedTime = Date.now() - data.startTime;
            this.updateTimeDisplay(stopwatchContainer);
        }, 10); // 更新頻率 10ms
    }

    pauseStopwatch(stopwatchContainer) {
        const data = stopwatchContainer.timerData;
        data.isRunning = false;
        data.playPauseBtn.innerHTML = '▶';
        
        if (data.intervalId) {
            clearInterval(data.intervalId);
            data.intervalId = null;
        }
    }

    resetStopwatch(stopwatchContainer) {
        const data = stopwatchContainer.timerData;
        this.pauseStopwatch(stopwatchContainer);
        data.elapsedTime = 0;
        this.updateTimeDisplay(stopwatchContainer);
    }

    // 覆寫基礎類別的縮放處理
    handleResize(e) {
        const rect = this.selectedElement.getBoundingClientRect();
        const deltaX = e.clientX - rect.left;
        const deltaY = e.clientY - rect.top;
        
        // 保持碼錶的寬高比例
        const newWidth = Math.max(this.config.minWidth, deltaX);
        const newHeight = Math.max(this.config.minHeight, newWidth * 0.3125); // 保持 320:100 的比例
        
        this.selectedElement.style.width = newWidth + 'px';
        this.selectedElement.style.height = newHeight + 'px';
        
        // 調整字體大小
        const timeDisplay = this.selectedElement.querySelector('.time-display');
        const scaleFactor = newWidth / this.config.defaultWidth;
        timeDisplay.style.fontSize = (32 * scaleFactor) + 'px';
        
        this.updateControlPositions(this.selectedElement);
    }

    // 覆寫基礎類別的刪除回調
    onElementDeleted(stopwatchContainer) {
        // 停止碼錶並清理資源
        const data = stopwatchContainer.timerData;
        if (data && data.intervalId) {
            clearInterval(data.intervalId);
        }
    }

    // 直接建立碼錶（用於app.js調用）
    createStopwatchDirectly(x, y) {
        return this.createStopwatch(x, y);
    }

    // 清空所有碼錶
    clearAllStopwatches() {
        this.clearAllElements();
    }

    // 獲取碼錶在指定位置（保持向後兼容）
    getStopwatchAtPosition(x, y) {
        return this.getElementAtPosition(x, y);
    }

    // 選中碼錶（保持向後兼容）
    selectStopwatch(stopwatchContainer) {
        this.selectElement(stopwatchContainer);
    }

    // 顯示/隱藏碼錶控制項（保持向後兼容）
    showStopwatchControls(stopwatchContainer) {
        this.showElementControls(stopwatchContainer);
    }

    hideStopwatchControls(stopwatchContainer) {
        this.hideElementControls(stopwatchContainer);
    }

    // 刪除碼錶（保持向後兼容）
    deleteStopwatch(stopwatchContainer) {
        this.deleteElement(stopwatchContainer);
    }

    deleteSelectedStopwatch() {
        this.deleteSelectedElement();
    }

    // 獲取所有碼錶（保持向後兼容）
    get stopwatches() {
        return this.elements;
    }

    get selectedStopwatch() {
        return this.selectedElement;
    }

    set selectedStopwatch(value) {
        this.selectedElement = value;
    }

    /**
     * 覆寫：匯出碼錶資料
     */
    exportElementData(element) {
        const baseData = super.exportElementData(element);
        const data = element.timerData;
        
        return {
            ...baseData,
            elapsedTime: data ? data.elapsedTime : 0,
            isRunning: data ? data.isRunning : false
        };
    }

    /**
     * 覆寫：匯入碼錶資料
     */
    importElementData(elementData) {
        const stopwatch = this.createStopwatch(elementData.x || 0, elementData.y || 0);
        
        if (stopwatch && elementData) {
            // 設定位置（確保位置正確）
            stopwatch.style.left = (elementData.x || 0) + 'px';
            stopwatch.style.top = (elementData.y || 0) + 'px';
            
            // 設定尺寸
            if (elementData.width && elementData.height) {
                stopwatch.style.width = elementData.width + 'px';
                stopwatch.style.height = elementData.height + 'px';
                
                // 調整字體大小
                const timeDisplay = stopwatch.querySelector('.time-display');
                if (timeDisplay) {
                    const scaleFactor = elementData.width / this.config.defaultWidth;
                    timeDisplay.style.fontSize = (32 * scaleFactor) + 'px';
                }
            }
            
            // 設定時間
            if (elementData.elapsedTime !== undefined && stopwatch.timerData) {
                stopwatch.timerData.elapsedTime = elementData.elapsedTime;
                this.updateTimeDisplay(stopwatch);
            }
            
            // 設定 ID
            if (elementData.id) {
                stopwatch.id = elementData.id;
            }
        }
        
        return stopwatch;
    }
} 