class StopwatchModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        this.active = false;
        this.stopwatches = []; // 儲存所有碼錶DOM元素
        this.nextId = 1; // 碼錶 ID 計數器
        this.selectedStopwatch = null; // 當前選中的碼錶
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;

        // 預設設定
        this.defaultWidth = 320;
        this.defaultHeight = 100;
        this.minWidth = 240;
        this.minHeight = 70;

        // 綁定事件處理函數
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.bindEvents();
    }

    bindEvents() {
        // 監聽畫布點擊事件
        document.addEventListener('click', (e) => {
            if (this.active && (e.target.id === 'whiteboard' || e.target.id === 'testArea')) {
                this.handleCanvasClick(e);
            }
        });

        // 監聽鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (this.active && e.key === 'Delete' && this.selectedStopwatch) {
                this.deleteSelectedStopwatch();
            }
        });

        // 監聽滑鼠事件
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    activate() {
        this.active = true;
        this.canvas.style.cursor = 'crosshair';
        console.log('Stopwatch tool activated');
        
        // 顯示所有碼錶的控制項
        this.stopwatches.forEach(stopwatch => {
            this.updateControlPositions(stopwatch);
            this.showStopwatchControls(stopwatch);
        });
    }

    deactivate() {
        this.active = false;
        this.canvas.style.cursor = 'default';
        this.selectedStopwatch = null;
        this.isDragging = false;
        this.isResizing = false;
        console.log('Stopwatch tool deactivated');
        
        // 隱藏所有控制項
        this.stopwatches.forEach(stopwatch => {
            this.hideStopwatchControls(stopwatch);
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有碼錶上
        const clickedStopwatch = this.getStopwatchAtPosition(x, y);
        
        if (clickedStopwatch) {
            this.selectStopwatch(clickedStopwatch);
        } else {
            // 點擊空白區域，新增碼錶
            this.createStopwatch(x, y);
        }
    }

    createStopwatch(x, y) {
        const stopwatchId = `stopwatch-${this.nextId++}`;
        
        // 建立碼錶容器
        const stopwatchContainer = document.createElement('div');
        stopwatchContainer.id = stopwatchId;
        stopwatchContainer.className = 'stopwatch-container';
        stopwatchContainer.style.cssText = `
            position: absolute;
            left: ${x - this.defaultWidth / 2}px;
            top: ${y - this.defaultHeight / 2}px;
            width: ${this.defaultWidth}px;
            height: ${this.defaultHeight}px;
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            border: 3px solid #667eea;
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

        // 綁定按鈕事件
        this.bindStopwatchEvents(stopwatchContainer);

        // 建立控制項
        this.createStopwatchControls(stopwatchContainer);

        // 添加到陣列和頁面
        this.stopwatches.push(stopwatchContainer);
        document.body.appendChild(stopwatchContainer);

        // 選中新碼錶
        this.selectStopwatch(stopwatchContainer);

        console.log('碼錶已建立:', stopwatchId);
        return stopwatchContainer;
    }

    bindStopwatchEvents(stopwatchContainer) {
        const timerData = stopwatchContainer.timerData;
        const controlArea = stopwatchContainer.querySelector('.control-area');
        const playPauseBtn = controlArea.children[0];
        const resetBtn = controlArea.children[1];

        // 播放/暫停
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (timerData.isRunning) {
                this.pauseStopwatch(stopwatchContainer);
            } else {
                this.startStopwatch(stopwatchContainer);
            }
        });

        // 重置
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetStopwatch(stopwatchContainer);
        });

        // 懸停效果
        playPauseBtn.addEventListener('mouseenter', () => {
            playPauseBtn.style.background = '#5a67d8';
        });
        playPauseBtn.addEventListener('mouseleave', () => {
            playPauseBtn.style.background = '#667eea';
        });

        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
    }

    updateTimeDisplay(stopwatchContainer) {
        const timerData = stopwatchContainer.timerData;
        
        const totalMs = timerData.elapsedTime;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const centiseconds = Math.floor((totalMs % 1000) / 10);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        timerData.timeDisplay.textContent = timeString;
    }

    startStopwatch(stopwatchContainer) {
        const timerData = stopwatchContainer.timerData;
        
        timerData.isRunning = true;
        timerData.startTime = Date.now() - timerData.elapsedTime;
        timerData.playPauseBtn.innerHTML = '⏸';
        
        timerData.intervalId = setInterval(() => {
            timerData.elapsedTime = Date.now() - timerData.startTime;
            this.updateTimeDisplay(stopwatchContainer);
        }, 10); // 更新間隔10ms以顯示百分秒
    }

    pauseStopwatch(stopwatchContainer) {
        const timerData = stopwatchContainer.timerData;
        
        timerData.isRunning = false;
        timerData.playPauseBtn.innerHTML = '▶';
        
        if (timerData.intervalId) {
            clearInterval(timerData.intervalId);
            timerData.intervalId = null;
        }
    }

    resetStopwatch(stopwatchContainer) {
        const timerData = stopwatchContainer.timerData;
        
        this.pauseStopwatch(stopwatchContainer);
        timerData.elapsedTime = 0;
        timerData.startTime = 0;
        this.updateTimeDisplay(stopwatchContainer);
    }

    createStopwatchControls(stopwatchContainer) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = '移動碼錶';
        moveBtn.className = 'move-handle stopwatch-control-btn';
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #667eea;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            cursor: move;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.2s ease;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
        `;

        // 為移動按鈕添加拖曳事件
        moveBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.isDragging = true;
            this.selectedStopwatch = stopwatchContainer;
            this.selectStopwatch(stopwatchContainer);

            const rect = stopwatchContainer.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.preventDefault();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '刪除碼錶';
        deleteBtn.className = 'stopwatch-control-btn';
        deleteBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #ef4444;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.2s ease;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteStopwatch(stopwatchContainer);
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle stopwatch-control-btn';
        resizeHandle.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #10b981;
            border: 2px solid white;
            cursor: se-resize;
            border-radius: 50%;
            opacity: 0;
            transition: all 0.2s ease;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 在縮放控制點中新增箭頭圖示
        resizeHandle.innerHTML = `
            <div style="
                color: white;
                font-size: 10px;
                line-height: 1;
                transform: rotate(-45deg);
            ">↕</div>
        `;

        // 為縮放控制點添加縮放事件
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.isResizing = true;
            this.selectedStopwatch = stopwatchContainer;
            this.resizeHandle = resizeHandle;
            this.selectStopwatch(stopwatchContainer);
            e.preventDefault();
        });

        // 將控制項新增到 document.body
        document.body.appendChild(moveBtn);
        document.body.appendChild(deleteBtn);
        document.body.appendChild(resizeHandle);

        // 儲存控制項參考
        stopwatchContainer.moveBtn = moveBtn;
        stopwatchContainer.deleteBtn = deleteBtn;
        stopwatchContainer.resizeHandle = resizeHandle;

        // 初始位置更新
        this.updateControlPositions(stopwatchContainer);
    }

    updateControlPositions(stopwatchContainer) {
        if (!stopwatchContainer.moveBtn) return;

        const rect = stopwatchContainer.getBoundingClientRect();
        
        // 移動按鈕位置（左上角）
        stopwatchContainer.moveBtn.style.left = (rect.left - 15) + 'px';
        stopwatchContainer.moveBtn.style.top = (rect.top - 15) + 'px';
        
        // 刪除按鈕位置（右上角）
        stopwatchContainer.deleteBtn.style.left = (rect.right - 15) + 'px';
        stopwatchContainer.deleteBtn.style.top = (rect.top - 15) + 'px';
        
        // 縮放控制點位置（右下角）
        stopwatchContainer.resizeHandle.style.left = (rect.right - 15) + 'px';
        stopwatchContainer.resizeHandle.style.top = (rect.bottom - 15) + 'px';
    }

    selectStopwatch(stopwatchContainer) {
        // 取消之前的選擇
        if (this.selectedStopwatch && this.selectedStopwatch !== stopwatchContainer) {
            this.selectedStopwatch.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        }
        
        // 設定新的選擇
        this.selectedStopwatch = stopwatchContainer;
        stopwatchContainer.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
        
        // 更新控制項位置並顯示
        this.updateControlPositions(stopwatchContainer);
        this.showStopwatchControls(stopwatchContainer);
        
        console.log('碼錶已選中:', stopwatchContainer.id);
    }

    showStopwatchControls(stopwatchContainer) {
        if (!stopwatchContainer.moveBtn) return;
        
        stopwatchContainer.moveBtn.style.opacity = '1';
        stopwatchContainer.deleteBtn.style.opacity = '1';
        stopwatchContainer.resizeHandle.style.opacity = '1';
    }

    hideStopwatchControls(stopwatchContainer) {
        if (!stopwatchContainer.moveBtn) return;
        
        stopwatchContainer.moveBtn.style.opacity = '0';
        stopwatchContainer.deleteBtn.style.opacity = '0';
        stopwatchContainer.resizeHandle.style.opacity = '0';
    }

    getStopwatchAtPosition(x, y) {
        for (let i = this.stopwatches.length - 1; i >= 0; i--) {
            const stopwatch = this.stopwatches[i];
            const rect = stopwatch.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            // 轉換為相對於畫布的座標
            const relativeX = x + canvasRect.left;
            const relativeY = y + canvasRect.top;
            
            if (relativeX >= rect.left && relativeX <= rect.right &&
                relativeY >= rect.top && relativeY <= rect.bottom) {
                return stopwatch;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        // 處理控制按鈕的拖曳邏輯已在按鈕事件中處理
    }

    handleMouseMove(e) {
        if (!this.active) return;

        if (this.isDragging && this.selectedStopwatch) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            this.selectedStopwatch.style.left = newX + 'px';
            this.selectedStopwatch.style.top = newY + 'px';
            this.updateControlPositions(this.selectedStopwatch);
        } else if (this.isResizing && this.selectedStopwatch) {
            const rect = this.selectedStopwatch.getBoundingClientRect();
            const newWidth = Math.max(this.minWidth, e.clientX - rect.left);
            const newHeight = Math.max(this.minHeight, e.clientY - rect.top);
            
            this.selectedStopwatch.style.width = newWidth + 'px';
            this.selectedStopwatch.style.height = newHeight + 'px';
            
            // 調整字體大小
            const timeDisplay = this.selectedStopwatch.querySelector('.time-display');
            const scale = Math.min(newWidth / this.defaultWidth, newHeight / this.defaultHeight);
            const fontSize = Math.max(20, 32 * scale);
            timeDisplay.style.fontSize = fontSize + 'px';
            
            this.updateControlPositions(this.selectedStopwatch);
        }
    }

    handleMouseUp(e) {
        if (!this.active) return;

        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    deleteStopwatch(stopwatchContainer) {
        // 停止計時器
        if (stopwatchContainer.timerData.intervalId) {
            clearInterval(stopwatchContainer.timerData.intervalId);
        }

        // 從陣列中移除
        const index = this.stopwatches.findIndex(stopwatch => stopwatch === stopwatchContainer);
        if (index !== -1) {
            this.stopwatches.splice(index, 1);
        }

        // 移除控制按鈕
        if (stopwatchContainer.moveBtn && stopwatchContainer.moveBtn.parentNode) {
            stopwatchContainer.moveBtn.parentNode.removeChild(stopwatchContainer.moveBtn);
        }
        if (stopwatchContainer.deleteBtn && stopwatchContainer.deleteBtn.parentNode) {
            stopwatchContainer.deleteBtn.parentNode.removeChild(stopwatchContainer.deleteBtn);
        }
        if (stopwatchContainer.resizeHandle && stopwatchContainer.resizeHandle.parentNode) {
            stopwatchContainer.resizeHandle.parentNode.removeChild(stopwatchContainer.resizeHandle);
        }

        // 移除碼錶本身
        if (stopwatchContainer.parentNode) {
            stopwatchContainer.parentNode.removeChild(stopwatchContainer);
        }

        // 清除選擇
        if (this.selectedStopwatch === stopwatchContainer) {
            this.selectedStopwatch = null;
        }

        console.log('碼錶已刪除:', stopwatchContainer.id);
    }

    deleteSelectedStopwatch() {
        if (this.selectedStopwatch) {
            this.deleteStopwatch(this.selectedStopwatch);
        }
    }

    // 清空所有碼錶
    clearAllStopwatches() {
        [...this.stopwatches].forEach(stopwatch => {
            this.deleteStopwatch(stopwatch);
        });
        this.stopwatches = [];
    }

    // 直接建立碼錶（新增方法）
    createStopwatchDirectly(x, y) {
        // 直接建立碼錶
        const stopwatchContainer = this.createStopwatch(x, y);
        
        console.log('直接建立碼錶於位置:', x, y);
        return stopwatchContainer;
    }

    // 隱藏所有碼錶控制項（新增方法）
    hideAllControls() {
        this.stopwatches.forEach(stopwatch => {
            this.hideStopwatchControls(stopwatch);
        });
        this.selectedStopwatch = null;
    }
} 