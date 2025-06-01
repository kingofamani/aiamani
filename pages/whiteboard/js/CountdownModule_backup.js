class CountdownModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        this.active = false;
        this.countdowns = []; // 儲存所有倒數計時器DOM元素
        this.nextId = 1; // 倒數計時器 ID 計數器
        this.selectedCountdown = null; // 當前選中的倒數計時器
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;

        // 預設設定
        this.defaultWidth = 280;
        this.defaultHeight = 120;
        this.minWidth = 200;
        this.minHeight = 80;

        // 創建音效
        this.createAlarmSound();

        // 綁定事件處理函數
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.bindEvents();
    }

    createAlarmSound() {
        // 創建音效 - 使用Web Audio API生成鈴聲
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.alarmSound = this.generateAlarmSound();
        } catch (e) {
            console.warn('Web Audio API not supported, using fallback beep');
            this.alarmSound = null;
        }
    }

    generateAlarmSound() {
        // 生成鈴聲音效
        const audioContext = this.audioContext;
        const duration = 0.3; // 每個音符持續時間
        const frequency1 = 800; // 第一個音符頻率
        const frequency2 = 1000; // 第二個音符頻率
        
        return {
            play: () => {
                if (!audioContext) return;
                
                // 播放兩個音符的鈴聲
                this.playBeep(frequency1, duration, 0);
                this.playBeep(frequency2, duration, 0.4);
                this.playBeep(frequency1, duration, 0.8);
                this.playBeep(frequency2, duration, 1.2);
            }
        };
    }

    playBeep(frequency, duration, startTime) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // 設定音量包絡
        const now = this.audioContext.currentTime + startTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    showToast(message, duration = 3000) {
        // 創建Toast通知
        const toast = document.createElement('div');
        toast.className = 'countdown-toast';
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
            border: 3px solid white;
            min-width: 200px;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="font-size: 24px;">⏰</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 顯示動畫
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, -50%) scale(1.05)';
        }, 10);
        
        // 脈衝動畫
        setTimeout(() => {
            toast.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 200);
        
        // 移除Toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        return toast;
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
            if (this.active && e.key === 'Delete' && this.selectedCountdown) {
                this.deleteSelectedCountdown();
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
        console.log('Countdown tool activated');
        
        // 顯示所有倒數計時器的控制項
        this.countdowns.forEach(countdown => {
            this.updateControlPositions(countdown);
            this.showCountdownControls(countdown);
        });
    }

    deactivate() {
        this.active = false;
        this.canvas.style.cursor = 'default';
        this.selectedCountdown = null;
        this.isDragging = false;
        this.isResizing = false;
        console.log('Countdown tool deactivated');
        
        // 隱藏所有控制項
        this.countdowns.forEach(countdown => {
            this.hideCountdownControls(countdown);
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有倒數計時器上
        const clickedCountdown = this.getCountdownAtPosition(x, y);
        
        if (clickedCountdown) {
            this.selectCountdown(clickedCountdown);
        } else {
            // 點擊空白區域，新增倒數計時器
            this.createCountdown(x, y);
        }
    }

    createCountdown(x, y) {
        const countdownId = `countdown-${this.nextId++}`;
        
        // 建立倒數計時器容器
        const countdownContainer = document.createElement('div');
        countdownContainer.id = countdownId;
        countdownContainer.className = 'countdown-container';
        countdownContainer.style.cssText = `
            position: absolute;
            left: ${x - this.defaultWidth / 2}px;
            top: ${y - this.defaultHeight / 2}px;
            width: ${this.defaultWidth}px;
            height: ${this.defaultHeight}px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 3px solid #5a67d8;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            cursor: move;
            user-select: none;
            z-index: 50;
            font-family: 'Arial', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            color: white;
        `;

        // 建立時間顯示區域
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.style.cssText = `
            font-size: 36px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
        `;
        timeDisplay.textContent = '10:00';

        // 建立控制按鈕區域
        const controlArea = document.createElement('div');
        controlArea.className = 'control-area';
        controlArea.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 8px;
            width: 100%;
        `;

        // 時間調整區域
        const timeAdjustArea = document.createElement('div');
        timeAdjustArea.className = 'time-adjust-area';
        timeAdjustArea.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            width: 100%;
        `;

        // 分鐘調整區域
        const minuteArea = document.createElement('div');
        minuteArea.className = 'minute-area';
        minuteArea.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        `;

        const minuteLabel = document.createElement('div');
        minuteLabel.textContent = '分鐘';
        minuteLabel.style.cssText = `
            font-size: 10px;
            color: rgba(255, 255, 255, 0.8);
        `;

        const minuteControls = document.createElement('div');
        minuteControls.style.cssText = `
            display: flex;
            gap: 4px;
        `;

        // 分鐘調整按鈕
        const minuteMinusBtn = document.createElement('button');
        minuteMinusBtn.innerHTML = '−';
        minuteMinusBtn.className = 'time-adjust-btn minute-minus';
        minuteMinusBtn.style.cssText = `
            width: 28px;
            height: 28px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        const minutePlusBtn = document.createElement('button');
        minutePlusBtn.innerHTML = '+';
        minutePlusBtn.className = 'time-adjust-btn minute-plus';
        minutePlusBtn.style.cssText = minuteMinusBtn.style.cssText;

        minuteControls.appendChild(minuteMinusBtn);
        minuteControls.appendChild(minutePlusBtn);
        minuteArea.appendChild(minuteLabel);
        minuteArea.appendChild(minuteControls);

        // 秒數調整區域
        const secondArea = document.createElement('div');
        secondArea.className = 'second-area';
        secondArea.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        `;

        const secondLabel = document.createElement('div');
        secondLabel.textContent = '秒數';
        secondLabel.style.cssText = `
            font-size: 10px;
            color: rgba(255, 255, 255, 0.8);
        `;

        const secondControls = document.createElement('div');
        secondControls.style.cssText = `
            display: flex;
            gap: 4px;
        `;

        // 秒數調整按鈕
        const secondMinusBtn = document.createElement('button');
        secondMinusBtn.innerHTML = '−';
        secondMinusBtn.className = 'time-adjust-btn second-minus';
        secondMinusBtn.style.cssText = `
            width: 28px;
            height: 28px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        const secondPlusBtn = document.createElement('button');
        secondPlusBtn.innerHTML = '+';
        secondPlusBtn.className = 'time-adjust-btn second-plus';
        secondPlusBtn.style.cssText = secondMinusBtn.style.cssText;

        secondControls.appendChild(secondMinusBtn);
        secondControls.appendChild(secondPlusBtn);
        secondArea.appendChild(secondLabel);
        secondArea.appendChild(secondControls);

        // 播放控制區域
        const playControlArea = document.createElement('div');
        playControlArea.className = 'play-control-area';
        playControlArea.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        `;

        // 播放/暫停按鈕
        const playPauseBtn = document.createElement('button');
        playPauseBtn.innerHTML = '▶';
        playPauseBtn.className = 'play-pause-btn';
        playPauseBtn.style.cssText = `
            width: 48px;
            height: 48px;
            background: #e53e3e;
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        // 停止按鈕
        const stopBtn = document.createElement('button');
        stopBtn.innerHTML = '⏹';
        stopBtn.className = 'stop-btn';
        stopBtn.style.cssText = `
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        // 組裝時間調整區域
        timeAdjustArea.appendChild(minuteArea);
        timeAdjustArea.appendChild(secondArea);

        // 組裝播放控制區域
        playControlArea.appendChild(playPauseBtn);
        playControlArea.appendChild(stopBtn);

        // 組裝控制區域
        controlArea.appendChild(timeAdjustArea);
        controlArea.appendChild(playControlArea);

        // 組裝容器
        countdownContainer.appendChild(timeDisplay);
        countdownContainer.appendChild(controlArea);

        // 儲存計時器狀態
        countdownContainer.timerData = {
            id: countdownId,
            minutes: 10,
            seconds: 0,
            totalSeconds: 10 * 60, // 預設 10:00
            isRunning: false,
            intervalId: null,
            timeDisplay: timeDisplay,
            playPauseBtn: playPauseBtn
        };

        // 綁定按鈕事件
        this.bindCountdownEvents(countdownContainer);

        // 建立控制項
        this.createCountdownControls(countdownContainer);

        // 添加到陣列和頁面
        this.countdowns.push(countdownContainer);
        document.body.appendChild(countdownContainer);

        // 選中新倒數計時器
        this.selectCountdown(countdownContainer);

        console.log('倒數計時器已建立:', countdownId);
        return countdownContainer;
    }

    bindCountdownEvents(countdownContainer) {
        const timerData = countdownContainer.timerData;
        const timeAdjustArea = countdownContainer.querySelector('.time-adjust-area');
        const playControlArea = countdownContainer.querySelector('.play-control-area');
        
        // 分鐘調整按鈕
        const minuteMinusBtn = timeAdjustArea.querySelector('.minute-minus');
        const minutePlusBtn = timeAdjustArea.querySelector('.minute-plus');
        
        // 秒數調整按鈕
        const secondMinusBtn = timeAdjustArea.querySelector('.second-minus');
        const secondPlusBtn = timeAdjustArea.querySelector('.second-plus');
        
        // 播放控制按鈕
        const playPauseBtn = playControlArea.querySelector('.play-pause-btn');
        const stopBtn = playControlArea.querySelector('.stop-btn');

        // 減少分鐘
        minuteMinusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!timerData.isRunning) {
                timerData.totalSeconds = Math.max(0, timerData.totalSeconds - 60);
                this.updateTimeDisplay(countdownContainer);
            }
        });

        // 增加分鐘
        minutePlusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!timerData.isRunning) {
                timerData.totalSeconds = Math.min(99 * 60 + 59, timerData.totalSeconds + 60);
                this.updateTimeDisplay(countdownContainer);
            }
        });

        // 減少秒數 (每次10秒)
        secondMinusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!timerData.isRunning) {
                timerData.totalSeconds = Math.max(0, timerData.totalSeconds - 10);
                this.updateTimeDisplay(countdownContainer);
            }
        });

        // 增加秒數 (每次10秒)
        secondPlusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!timerData.isRunning) {
                timerData.totalSeconds = Math.min(99 * 60 + 59, timerData.totalSeconds + 10);
                this.updateTimeDisplay(countdownContainer);
            }
        });

        // 播放/暫停
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (timerData.isRunning) {
                this.pauseCountdown(countdownContainer);
            } else {
                this.startCountdown(countdownContainer);
            }
        });

        // 停止
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.stopCountdown(countdownContainer);
        });

        // 懸停效果 - 分鐘按鈕
        [minuteMinusBtn, minutePlusBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
            });
        });

        // 懸停效果 - 秒數按鈕
        [secondMinusBtn, secondPlusBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
            });
        });

        // 懸停效果 - 停止按鈕
        stopBtn.addEventListener('mouseenter', () => {
            stopBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        stopBtn.addEventListener('mouseleave', () => {
            stopBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        // 懸停效果 - 播放暫停按鈕
        playPauseBtn.addEventListener('mouseenter', () => {
            playPauseBtn.style.background = '#c53030';
        });
        playPauseBtn.addEventListener('mouseleave', () => {
            playPauseBtn.style.background = '#e53e3e';
        });
    }

    updateTimeDisplay(countdownContainer) {
        const timerData = countdownContainer.timerData;
        const minutes = Math.floor(timerData.totalSeconds / 60);
        const seconds = timerData.totalSeconds % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerData.timeDisplay.textContent = timeString;
        
        // 時間不足時的警告效果
        if (timerData.totalSeconds <= 60 && timerData.totalSeconds > 0) {
            countdownContainer.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
            if (timerData.totalSeconds <= 10) {
                timerData.timeDisplay.style.animation = 'pulse 0.5s infinite';
            }
        } else {
            countdownContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            timerData.timeDisplay.style.animation = 'none';
        }
    }

    startCountdown(countdownContainer) {
        const timerData = countdownContainer.timerData;
        
        if (timerData.totalSeconds <= 0) return;
        
        // 確保音頻上下文已初始化（瀏覽器安全政策要求用戶互動後才能播放音頻）
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        timerData.isRunning = true;
        timerData.playPauseBtn.innerHTML = '⏸';
        
        timerData.intervalId = setInterval(() => {
            timerData.totalSeconds--;
            this.updateTimeDisplay(countdownContainer);
            
            if (timerData.totalSeconds <= 0) {
                this.onCountdownFinished(countdownContainer);
            }
        }, 1000);
    }

    pauseCountdown(countdownContainer) {
        const timerData = countdownContainer.timerData;
        
        timerData.isRunning = false;
        timerData.playPauseBtn.innerHTML = '▶';
        
        if (timerData.intervalId) {
            clearInterval(timerData.intervalId);
            timerData.intervalId = null;
        }
    }

    stopCountdown(countdownContainer) {
        const timerData = countdownContainer.timerData;
        
        this.pauseCountdown(countdownContainer);
        // 重置到初始設定值 (10分鐘)
        timerData.totalSeconds = timerData.minutes * 60 + timerData.seconds;
        this.updateTimeDisplay(countdownContainer);
    }

    onCountdownFinished(countdownContainer) {
        const timerData = countdownContainer.timerData;
        
        this.pauseCountdown(countdownContainer);
        
        // 播放鈴聲
        if (this.alarmSound) {
            // 確保音頻上下文已啟動 (瀏覽器安全政策要求)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this.alarmSound.play();
                });
            } else {
                this.alarmSound.play();
            }
        }
        
        // 顯示Toast通知
        this.showToast('⏰ 倒數計時結束！', 4000);
        
        // 閃爍效果
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            countdownContainer.style.background = blinkCount % 2 === 0 ? 
                'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' : 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            blinkCount++;
            
            if (blinkCount >= 8) { // 增加閃爍次數
                clearInterval(blinkInterval);
                countdownContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        }, 300);
        
        // 顯示完成通知
        timerData.timeDisplay.textContent = '00:00';
        timerData.timeDisplay.style.animation = 'none'; // 停止脈衝動畫
        
        console.log('倒數計時結束！Toast通知已顯示，鈴聲已播放');
    }

    createCountdownControls(countdownContainer) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = '移動倒數計時器';
        moveBtn.className = 'move-handle countdown-control-btn';
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #5a67d8;
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
            this.selectedCountdown = countdownContainer;
            this.selectCountdown(countdownContainer);

            const rect = countdownContainer.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.preventDefault();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '刪除倒數計時器';
        deleteBtn.className = 'countdown-control-btn';
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
            this.deleteCountdown(countdownContainer);
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle countdown-control-btn';
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
            this.selectedCountdown = countdownContainer;
            this.resizeHandle = resizeHandle;
            this.selectCountdown(countdownContainer);
            e.preventDefault();
        });

        // 將控制項新增到 document.body
        document.body.appendChild(moveBtn);
        document.body.appendChild(deleteBtn);
        document.body.appendChild(resizeHandle);

        // 儲存控制項參考
        countdownContainer.moveBtn = moveBtn;
        countdownContainer.deleteBtn = deleteBtn;
        countdownContainer.resizeHandle = resizeHandle;

        // 初始位置更新
        this.updateControlPositions(countdownContainer);
    }

    updateControlPositions(countdownContainer) {
        if (!countdownContainer.moveBtn) return;

        const rect = countdownContainer.getBoundingClientRect();
        
        // 移動按鈕位置（左上角）
        countdownContainer.moveBtn.style.left = (rect.left - 15) + 'px';
        countdownContainer.moveBtn.style.top = (rect.top - 15) + 'px';
        
        // 刪除按鈕位置（右上角）
        countdownContainer.deleteBtn.style.left = (rect.right - 15) + 'px';
        countdownContainer.deleteBtn.style.top = (rect.top - 15) + 'px';
        
        // 縮放控制點位置（右下角）
        countdownContainer.resizeHandle.style.left = (rect.right - 15) + 'px';
        countdownContainer.resizeHandle.style.top = (rect.bottom - 15) + 'px';
    }

    selectCountdown(countdownContainer) {
        // 取消之前的選擇
        if (this.selectedCountdown && this.selectedCountdown !== countdownContainer) {
            this.selectedCountdown.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
        }
        
        // 設定新的選擇
        this.selectedCountdown = countdownContainer;
        countdownContainer.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.5)';
        
        // 更新控制項位置並顯示
        this.updateControlPositions(countdownContainer);
        this.showCountdownControls(countdownContainer);
        
        console.log('倒數計時器已選中:', countdownContainer.id);
    }

    showCountdownControls(countdownContainer) {
        if (!countdownContainer.moveBtn) return;
        
        countdownContainer.moveBtn.style.opacity = '1';
        countdownContainer.deleteBtn.style.opacity = '1';
        countdownContainer.resizeHandle.style.opacity = '1';
    }

    hideCountdownControls(countdownContainer) {
        if (!countdownContainer.moveBtn) return;
        
        countdownContainer.moveBtn.style.opacity = '0';
        countdownContainer.deleteBtn.style.opacity = '0';
        countdownContainer.resizeHandle.style.opacity = '0';
    }

    getCountdownAtPosition(x, y) {
        for (let i = this.countdowns.length - 1; i >= 0; i--) {
            const countdown = this.countdowns[i];
            const rect = countdown.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            // 轉換為相對於畫布的座標
            const relativeX = x + canvasRect.left;
            const relativeY = y + canvasRect.top;
            
            if (relativeX >= rect.left && relativeX <= rect.right &&
                relativeY >= rect.top && relativeY <= rect.bottom) {
                return countdown;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        // 處理控制按鈕的拖曳邏輯已在按鈕事件中處理
    }

    handleMouseMove(e) {
        if (!this.active) return;

        if (this.isDragging && this.selectedCountdown) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            this.selectedCountdown.style.left = newX + 'px';
            this.selectedCountdown.style.top = newY + 'px';
            this.updateControlPositions(this.selectedCountdown);
        } else if (this.isResizing && this.selectedCountdown) {
            const rect = this.selectedCountdown.getBoundingClientRect();
            const newWidth = Math.max(this.minWidth, e.clientX - rect.left);
            const newHeight = Math.max(this.minHeight, e.clientY - rect.top);
            
            this.selectedCountdown.style.width = newWidth + 'px';
            this.selectedCountdown.style.height = newHeight + 'px';
            
            // 調整字體大小
            const timeDisplay = this.selectedCountdown.querySelector('.time-display');
            const scale = Math.min(newWidth / this.defaultWidth, newHeight / this.defaultHeight);
            const fontSize = Math.max(24, 36 * scale);
            timeDisplay.style.fontSize = fontSize + 'px';
            
            this.updateControlPositions(this.selectedCountdown);
        }
    }

    handleMouseUp(e) {
        if (!this.active) return;

        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    deleteCountdown(countdownContainer) {
        // 停止計時器
        if (countdownContainer.timerData.intervalId) {
            clearInterval(countdownContainer.timerData.intervalId);
        }

        // 從陣列中移除
        const index = this.countdowns.findIndex(countdown => countdown === countdownContainer);
        if (index !== -1) {
            this.countdowns.splice(index, 1);
        }

        // 移除控制按鈕
        if (countdownContainer.moveBtn && countdownContainer.moveBtn.parentNode) {
            countdownContainer.moveBtn.parentNode.removeChild(countdownContainer.moveBtn);
        }
        if (countdownContainer.deleteBtn && countdownContainer.deleteBtn.parentNode) {
            countdownContainer.deleteBtn.parentNode.removeChild(countdownContainer.deleteBtn);
        }
        if (countdownContainer.resizeHandle && countdownContainer.resizeHandle.parentNode) {
            countdownContainer.resizeHandle.parentNode.removeChild(countdownContainer.resizeHandle);
        }

        // 移除倒數計時器本身
        if (countdownContainer.parentNode) {
            countdownContainer.parentNode.removeChild(countdownContainer);
        }

        // 清除選擇
        if (this.selectedCountdown === countdownContainer) {
            this.selectedCountdown = null;
        }

        console.log('倒數計時器已刪除:', countdownContainer.id);
    }

    deleteSelectedCountdown() {
        if (this.selectedCountdown) {
            this.deleteCountdown(this.selectedCountdown);
        }
    }

    // 清空所有倒數計時器
    clearAllCountdowns() {
        [...this.countdowns].forEach(countdown => {
            this.deleteCountdown(countdown);
        });
        this.countdowns = [];
    }

    // 直接建立倒數計時器（新增方法）
    createCountdownDirectly(x, y) {
        // 直接建立倒數計時器
        const countdownContainer = this.createCountdown(x, y);
        
        console.log('直接建立倒數計時器於位置:', x, y);
        return countdownContainer;
    }

    // 隱藏所有倒數計時器控制項（新增方法）
    hideAllControls() {
        this.countdowns.forEach(countdown => {
            this.hideCountdownControls(countdown);
        });
        this.selectedCountdown = null;
    }
} 