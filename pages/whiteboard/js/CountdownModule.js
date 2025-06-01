// 倒數計時器模組 - 繼承自 BaseControlModule
class CountdownModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        // 配置選項
        const config = {
            defaultWidth: 280,
            defaultHeight: 120,
            minWidth: 200,
            minHeight: 80,
            moveButtonColor: '#e53e3e',
            deleteButtonColor: '#ef4444',
            resizeButtonColor: '#3b82f6',
            borderColor: '#e53e3e',
            toolName: '倒數計時器'
        };
        
        super(canvasModule, backgroundModule, appInstance, config);
        
        // 創建音效
        this.createAlarmSound();
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

    // 實現基礎類別要求的 createElement 方法
    createElement(x, y) {
        return this.createCountdown(x, y);
    }

    createCountdown(x, y) {
        const countdownId = `countdown-${this.nextId++}`;
        
        // 建立倒數計時器容器
        const countdownContainer = document.createElement('div');
        countdownContainer.id = countdownId;
        countdownContainer.className = 'countdown-container';
        countdownContainer.style.cssText = `
            position: absolute;
            left: ${x - this.config.defaultWidth / 2}px;
            top: ${y - this.config.defaultHeight / 2}px;
            width: ${this.config.defaultWidth}px;
            height: ${this.config.defaultHeight}px;
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            border: 3px solid ${this.config.borderColor};
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            cursor: move;
            user-select: none;
            z-index: 50;
            font-family: 'Arial', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            color: white;
        `;

        // 建立時間設定區域
        const timeSettingArea = document.createElement('div');
        timeSettingArea.className = 'time-setting-area';
        timeSettingArea.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;
        `;

        // 建立時間輸入欄位
        const minutesInput = document.createElement('input');
        minutesInput.type = 'number';
        minutesInput.min = '0';
        minutesInput.max = '59';
        minutesInput.value = '5';
        minutesInput.className = 'minutes-input';
        minutesInput.style.cssText = `
            width: 45px;
            padding: 4px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-align: center;
            font-size: 14px;
        `;

        const secondsInput = document.createElement('input');
        secondsInput.type = 'number';
        secondsInput.min = '0';
        secondsInput.max = '59';
        secondsInput.value = '0';
        secondsInput.className = 'seconds-input';
        secondsInput.style.cssText = minutesInput.style.cssText;

        timeSettingArea.innerHTML = '設定時間: ';
        timeSettingArea.appendChild(minutesInput);
        timeSettingArea.appendChild(document.createTextNode(' 分 '));
        timeSettingArea.appendChild(secondsInput);
        timeSettingArea.appendChild(document.createTextNode(' 秒'));

        // 建立時間顯示區域
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.style.cssText = `
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            margin-bottom: 8px;
            font-family: 'Courier New', monospace;
        `;
        timeDisplay.textContent = '05:00';

        // 建立控制按鈕區域
        const controlArea = document.createElement('div');
        controlArea.className = 'control-area';
        controlArea.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // 開始/暫停按鈕
        const startPauseBtn = document.createElement('button');
        startPauseBtn.innerHTML = '▶';
        startPauseBtn.className = 'start-pause-btn';
        startPauseBtn.style.cssText = `
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            color: white;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        // 停止按鈕
        const stopBtn = document.createElement('button');
        stopBtn.innerHTML = '⏹';
        stopBtn.className = 'stop-btn';
        stopBtn.style.cssText = `
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            color: white;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        // 組裝控制區域
        controlArea.appendChild(startPauseBtn);
        controlArea.appendChild(stopBtn);

        // 組裝容器
        countdownContainer.appendChild(timeSettingArea);
        countdownContainer.appendChild(timeDisplay);
        countdownContainer.appendChild(controlArea);

        // 儲存計時器狀態
        countdownContainer.timerData = {
            id: countdownId,
            totalTimeMs: 5 * 60 * 1000, // 5分鐘
            remainingTimeMs: 5 * 60 * 1000,
            isRunning: false,
            intervalId: null,
            timeDisplay: timeDisplay,
            startPauseBtn: startPauseBtn,
            minutesInput: minutesInput,
            secondsInput: secondsInput,
            timeSettingArea: timeSettingArea,
            isFinished: false
        };

        // 綁定倒數計時器功能事件
        this.bindCountdownEvents(countdownContainer);

        // 建立統一控制項（使用基礎類別的方法）
        this.createElementControls(countdownContainer);

        // 添加到陣列和頁面
        this.elements.push(countdownContainer);
        document.body.appendChild(countdownContainer);

        // 選中新建立的倒數計時器
        this.selectElement(countdownContainer);
        
        console.log('倒數計時器已建立:', countdownId);
        return countdownContainer;
    }

    bindCountdownEvents(countdownContainer) {
        const data = countdownContainer.timerData;
        
        // 時間輸入變更事件
        const updateTime = () => {
            if (!data.isRunning) {
                const minutes = parseInt(data.minutesInput.value) || 0;
                const seconds = parseInt(data.secondsInput.value) || 0;
                data.totalTimeMs = (minutes * 60 + seconds) * 1000;
                data.remainingTimeMs = data.totalTimeMs;
                data.isFinished = false;
                this.updateTimeDisplay(countdownContainer);
            }
        };

        data.minutesInput.addEventListener('change', updateTime);
        data.secondsInput.addEventListener('change', updateTime);

        // 開始/暫停按鈕事件
        data.startPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (data.isRunning) {
                this.pauseCountdown(countdownContainer);
            } else {
                this.startCountdown(countdownContainer);
            }
        });

        // 停止按鈕事件
        const stopBtn = countdownContainer.querySelector('.stop-btn');
        stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.stopCountdown(countdownContainer);
        });

        // 滑鼠懸停效果
        data.startPauseBtn.addEventListener('mouseenter', () => {
            data.startPauseBtn.style.transform = 'scale(1.1)';
            data.startPauseBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        data.startPauseBtn.addEventListener('mouseleave', () => {
            data.startPauseBtn.style.transform = 'scale(1)';
            data.startPauseBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        stopBtn.addEventListener('mouseenter', () => {
            stopBtn.style.transform = 'scale(1.1)';
            stopBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        stopBtn.addEventListener('mouseleave', () => {
            stopBtn.style.transform = 'scale(1)';
            stopBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    }

    updateTimeDisplay(countdownContainer) {
        const data = countdownContainer.timerData;
        const totalSeconds = Math.ceil(data.remainingTimeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        data.timeDisplay.textContent = formattedTime;
        
        // 更新容器外觀表示緊急程度
        if (totalSeconds <= 10 && totalSeconds > 0) {
            countdownContainer.style.border = '3px solid #ff6b6b';
            countdownContainer.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.5)';
            data.timeDisplay.style.color = '#ffebcd';
        } else if (totalSeconds === 0) {
            countdownContainer.style.border = '3px solid #ff0000';
            countdownContainer.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.7)';
            data.timeDisplay.style.color = '#fff';
        } else {
            countdownContainer.style.border = `3px solid ${this.config.borderColor}`;
            countdownContainer.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            data.timeDisplay.style.color = 'white';
        }
    }

    startCountdown(countdownContainer) {
        const data = countdownContainer.timerData;
        data.isRunning = true;
        data.startPauseBtn.innerHTML = '⏸';
        data.timeSettingArea.style.opacity = '0.5';
        data.minutesInput.disabled = true;
        data.secondsInput.disabled = true;
        
        data.intervalId = setInterval(() => {
            data.remainingTimeMs -= 1000;
            this.updateTimeDisplay(countdownContainer);
            
            if (data.remainingTimeMs <= 0) {
                this.onCountdownFinished(countdownContainer);
            }
        }, 1000);
    }

    pauseCountdown(countdownContainer) {
        const data = countdownContainer.timerData;
        data.isRunning = false;
        data.startPauseBtn.innerHTML = '▶';
        
        if (data.intervalId) {
            clearInterval(data.intervalId);
            data.intervalId = null;
        }
    }

    stopCountdown(countdownContainer) {
        const data = countdownContainer.timerData;
        this.pauseCountdown(countdownContainer);
        data.remainingTimeMs = data.totalTimeMs;
        data.isFinished = false;
        data.timeSettingArea.style.opacity = '1';
        data.minutesInput.disabled = false;
        data.secondsInput.disabled = false;
        this.updateTimeDisplay(countdownContainer);
    }

    onCountdownFinished(countdownContainer) {
        const data = countdownContainer.timerData;
        this.pauseCountdown(countdownContainer);
        data.isFinished = true;
        data.remainingTimeMs = 0;
        this.updateTimeDisplay(countdownContainer);
        
        // 播放鈴聲
        if (this.alarmSound) {
            this.alarmSound.play();
        }
        
        // 顯示通知
        this.showToast('⏰ 時間到了！', 5000);
        
        // 閃爍動畫
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            countdownContainer.style.opacity = countdownContainer.style.opacity === '0.5' ? '1' : '0.5';
            flashCount++;
            if (flashCount >= 10) { // 閃爍5次
                clearInterval(flashInterval);
                countdownContainer.style.opacity = '1';
            }
        }, 300);
        
        console.log('倒數計時器已完成:', data.id);
    }

    // 覆寫基礎類別的縮放處理
    handleResize(e) {
        const rect = this.selectedElement.getBoundingClientRect();
        const deltaX = e.clientX - rect.left;
        const deltaY = e.clientY - rect.top;
        
        // 保持倒數計時器的寬高比例
        const newWidth = Math.max(this.config.minWidth, deltaX);
        const newHeight = Math.max(this.config.minHeight, newWidth * 0.4286); // 保持 280:120 的比例
        
        this.selectedElement.style.width = newWidth + 'px';
        this.selectedElement.style.height = newHeight + 'px';
        
        // 調整字體大小
        const timeDisplay = this.selectedElement.querySelector('.time-display');
        const scaleFactor = newWidth / this.config.defaultWidth;
        timeDisplay.style.fontSize = (28 * scaleFactor) + 'px';
        
        this.updateControlPositions(this.selectedElement);
    }

    // 覆寫基礎類別的刪除回調
    onElementDeleted(countdownContainer) {
        // 停止倒數計時器並清理資源
        const data = countdownContainer.timerData;
        if (data && data.intervalId) {
            clearInterval(data.intervalId);
        }
    }

    // 直接建立倒數計時器（用於app.js調用）
    createCountdownDirectly(x, y) {
        return this.createCountdown(x, y);
    }

    // 清空所有倒數計時器
    clearAllCountdowns() {
        this.clearAllElements();
    }

    // 獲取倒數計時器在指定位置（保持向後兼容）
    getCountdownAtPosition(x, y) {
        return this.getElementAtPosition(x, y);
    }

    // 選中倒數計時器（保持向後兼容）
    selectCountdown(countdownContainer) {
        this.selectElement(countdownContainer);
    }

    // 顯示/隱藏倒數計時器控制項（保持向後兼容）
    showCountdownControls(countdownContainer) {
        this.showElementControls(countdownContainer);
    }

    hideCountdownControls(countdownContainer) {
        this.hideElementControls(countdownContainer);
    }

    // 刪除倒數計時器（保持向後兼容）
    deleteCountdown(countdownContainer) {
        this.deleteElement(countdownContainer);
    }

    deleteSelectedCountdown() {
        this.deleteSelectedElement();
    }

    // 獲取所有倒數計時器（保持向後兼容）
    get countdowns() {
        return this.elements;
    }

    get selectedCountdown() {
        return this.selectedElement;
    }

    set selectedCountdown(value) {
        this.selectedElement = value;
    }

    /**
     * 覆寫：匯出倒數計時器資料
     */
    exportElementData(element) {
        const baseData = super.exportElementData(element);
        const minutesInput = element.querySelector('.minutes-input');
        const secondsInput = element.querySelector('.seconds-input');
        
        return {
            ...baseData,
            minutes: minutesInput ? parseInt(minutesInput.value) || 0 : 5,
            seconds: secondsInput ? parseInt(secondsInput.value) || 0 : 0,
            isRunning: element.isRunning || false,
            remainingTime: element.remainingTime || 0
        };
    }

    /**
     * 覆寫：匯入倒數計時器資料
     */
    importElementData(elementData) {
        const countdown = this.createCountdown(elementData.x || 0, elementData.y || 0);
        
        if (countdown && elementData) {
            // 設定位置（確保位置正確）
            countdown.style.left = (elementData.x || 0) + 'px';
            countdown.style.top = (elementData.y || 0) + 'px';
            
            // 設定尺寸
            if (elementData.width && elementData.height) {
                countdown.style.width = elementData.width + 'px';
                countdown.style.height = elementData.height + 'px';
                
                // 調整字體大小
                const timeDisplay = countdown.querySelector('.time-display');
                if (timeDisplay) {
                    const scaleFactor = elementData.width / this.config.defaultWidth;
                    timeDisplay.style.fontSize = (28 * scaleFactor) + 'px';
                }
            }
            
            // 設定時間
            const minutesInput = countdown.querySelector('.minutes-input');
            const secondsInput = countdown.querySelector('.seconds-input');
            
            if (minutesInput && elementData.minutes !== undefined) {
                minutesInput.value = elementData.minutes;
            }
            if (secondsInput && elementData.seconds !== undefined) {
                secondsInput.value = elementData.seconds;
            }
            
            // 設定 ID
            if (elementData.id) {
                countdown.id = elementData.id;
            }
            
            // 如果有剩餘時間，設定為暫停狀態
            if (elementData.remainingTime > 0) {
                countdown.remainingTime = elementData.remainingTime;
                this.updateTimeDisplay(countdown);
            }
        }
        
        return countdown;
    }
} 