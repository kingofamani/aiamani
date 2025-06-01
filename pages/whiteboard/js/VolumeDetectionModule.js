class VolumeDetectionModule {
    constructor() {
        this.isActive = false;
        this.mediaStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.animationId = null;
        
        // UI 元素
        this.micButton = document.getElementById('micTool');
        this.volumeBar = document.getElementById('volumeBar');
        this.thresholdSlider = document.getElementById('volumeThreshold');
        this.thresholdValue = document.getElementById('thresholdValue');
        this.warningBell = document.getElementById('warningBell');
        this.warningCount = document.getElementById('warningCount');
        
        // 設定參數
        this.threshold = 70; // 預設閾值
        this.warningCounter = 0;
        this.lastWarningTime = 0;
        this.warningCooldown = 2000; // 2秒冷卻時間
        
        // 音量數據
        this.currentVolume = 0;
        this.maxVolume = 0;
        this.volumeHistory = [];
        this.historyLength = 10;
        
        this.bindEvents();
        this.createThresholdIndicator();
        this.updateThresholdDisplay(); // 初始化閾值顯示
    }

    bindEvents() {
        // 麥克風按鈕事件
        this.micButton.addEventListener('click', () => {
            if (this.isActive) {
                this.stopDetection();
            } else {
                this.startDetection();
            }
        });

        // 閾值滑桿事件
        this.thresholdSlider.addEventListener('input', (e) => {
            this.threshold = parseInt(e.target.value);
            this.updateThresholdIndicator();
            this.updateThresholdDisplay();
        });

        // 警告鈴鐺點擊重置計數器
        this.warningBell.addEventListener('click', () => {
            this.resetWarningCounter();
        });
        
        // 測試按鈕事件
        const testButton = document.getElementById('testToast');
        if (testButton) {
            testButton.addEventListener('click', () => {
                this.showToast('這是一個測試通知！', 'warning');
            });
        }
    }

    createThresholdIndicator() {
        // 在音量條容器中新增閾值指示線
        const volumeContainer = this.volumeBar.parentElement;
        volumeContainer.style.position = 'relative';
        
        this.thresholdIndicator = document.createElement('div');
        this.thresholdIndicator.className = 'threshold-indicator';
        volumeContainer.appendChild(this.thresholdIndicator);
        
        this.updateThresholdIndicator();
    }

    updateThresholdIndicator() {
        if (this.thresholdIndicator) {
            const position = (this.threshold / 100) * 100;
            this.thresholdIndicator.style.left = `${position}%`;
        }
    }

    async startDetection() {
        try {
            console.log('開始音量偵測...');
            
            // 請求麥克風權限
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });

            // 建立音頻分析器
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            // 設定分析器參數
            this.analyser.fftSize = 512;
            this.analyser.smoothingTimeConstant = 0.3;
            
            // 連接音頻節點
            this.microphone.connect(this.analyser);
            
            // 建立數據陣列
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // 更新狀態
            this.isActive = true;
            this.updateMicButtonState();
            
            // 顯示啟動成功的 Toast
            this.showToast('音量偵測已啟動', 'info');
            
            // 開始分析音量
            this.analyzeVolume();
            
            console.log('音量偵測已啟動');
            
        } catch (error) {
            console.error('無法啟動音量偵測:', error);
            this.showToast('無法存取麥克風，請檢查權限設定', 'error');
            this.stopDetection();
        }
    }

    stopDetection() {
        console.log('停止音量偵測...');
        
        // 停止動畫
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 關閉音頻資源
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 重置狀態
        this.isActive = false;
        this.currentVolume = 0;
        this.updateMicButtonState();
        this.updateVolumeBar(0);
        
        // 顯示停止通知
        this.showToast('音量偵測已停止', 'info');
        
        console.log('音量偵測已停止');
    }

    analyzeVolume() {
        if (!this.isActive || !this.analyser) return;
        
        // 獲取音頻數據
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // 計算音量 - 使用更敏感的方法
        let sum = 0;
        let max = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
            max = Math.max(max, this.dataArray[i]);
        }
        
        // 使用平均值和最大值的組合
        const average = sum / this.dataArray.length;
        const volume = Math.max(average, max * 0.7);
        
        // 轉換為百分比 (0-100)，增加敏感度
        this.currentVolume = Math.min(100, (volume / 255) * 100 * 1.5);
        
        // 更新音量歷史
        this.volumeHistory.push(this.currentVolume);
        if (this.volumeHistory.length > this.historyLength) {
            this.volumeHistory.shift();
        }
        
        // 計算平滑音量
        const smoothVolume = this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length;
        
        // 更新 UI
        this.updateVolumeBar(smoothVolume);
        
        // 檢查是否超過閾值
        this.checkThreshold(smoothVolume);
        
        // 繼續分析
        this.animationId = requestAnimationFrame(() => this.analyzeVolume());
    }

    updateVolumeBar(volume) {
        if (!this.volumeBar) return;
        
        // 更新音量條寬度
        this.volumeBar.style.width = `${volume}%`;
        
        // 根據音量等級改變顏色
        this.volumeBar.className = 'h-full transition-all duration-100';
        
        if (volume < 30) {
            this.volumeBar.style.backgroundColor = '#10b981'; // 綠色
        } else if (volume < 70) {
            this.volumeBar.style.backgroundColor = '#f59e0b'; // 黃色
        } else {
            this.volumeBar.style.backgroundColor = '#ef4444'; // 紅色
        }
        
        // 除錯：顯示當前音量
        console.log(`音量更新: ${Math.round(volume)}%`);
    }

    checkThreshold(volume) {
        const now = Date.now();
        
        // 如果音量超過閾值且不在冷卻時間內
        if (volume > this.threshold && (now - this.lastWarningTime) > this.warningCooldown) {
            this.triggerWarning(volume);
            this.lastWarningTime = now;
        }
    }

    triggerWarning(volume) {
        // 增加警告計數
        this.warningCounter++;
        this.updateWarningCounter();
        
        // 鈴鐺震動動畫
        this.warningBell.classList.add('warning-bell-shake');
        setTimeout(() => {
            this.warningBell.classList.remove('warning-bell-shake');
        }, 500);
        
        // 顯示 Toast 警告
        const message = `音量過大！當前: ${Math.round(volume)}% (閾值: ${this.threshold}%)`;
        this.showToast(message, 'warning');
        
        console.log(`音量警告: ${Math.round(volume)}% > ${this.threshold}%`);
    }

    updateWarningCounter() {
        if (this.warningCount) {
            this.warningCount.textContent = this.warningCounter;
            
            // 如果有警告，讓計數器更明顯
            if (this.warningCounter > 0) {
                this.warningCount.style.color = '#ef4444';
                this.warningCount.style.fontWeight = 'bold';
            }
        }
    }

    resetWarningCounter() {
        this.warningCounter = 0;
        this.updateWarningCounter();
        this.warningCount.style.color = '#6b7280';
        this.showToast('警告計數器已重置', 'info');
    }

    updateMicButtonState() {
        if (!this.micButton) return;
        
        if (this.isActive) {
            this.micButton.classList.add('mic-active');
            this.micButton.classList.remove('mic-inactive');
            this.micButton.title = '停止音量偵測';
        } else {
            this.micButton.classList.remove('mic-active');
            this.micButton.classList.add('mic-inactive');
            this.micButton.title = '開始音量偵測';
        }
    }

    showToast(message, type = 'info') {
        // 移除現有的 toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 建立新的 toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        // 根據類型設定樣式
        switch (type) {
            case 'warning':
                toast.style.backgroundColor = '#f59e0b';
                break;
            case 'error':
                toast.style.backgroundColor = '#ef4444';
                break;
            case 'info':
                toast.style.backgroundColor = '#3b82f6';
                break;
            default:
                toast.style.backgroundColor = '#6b7280';
        }
        
        toast.textContent = message;
        
        // 確保 toast 樣式正確
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        toast.style.zIndex = '1000';
        toast.style.fontWeight = '500';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'transform 0.3s ease-in-out';
        
        document.body.appendChild(toast);
        
        // 顯示動畫
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // 自動隱藏
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        console.log(`Toast 顯示: ${message}`);
    }

    // 獲取當前音量等級
    getCurrentVolume() {
        return this.currentVolume;
    }

    // 獲取是否正在偵測
    isDetecting() {
        return this.isActive;
    }

    // 設定閾值
    setThreshold(value) {
        this.threshold = Math.max(0, Math.min(100, value));
        this.thresholdSlider.value = this.threshold;
        this.updateThresholdIndicator();
        this.updateThresholdDisplay();
    }

    // 獲取警告次數
    getWarningCount() {
        return this.warningCounter;
    }

    // 清理資源
    destroy() {
        this.stopDetection();
        
        // 移除事件監聽器
        if (this.micButton) {
            this.micButton.removeEventListener('click', this.startDetection);
        }
        
        if (this.thresholdSlider) {
            this.thresholdSlider.removeEventListener('input', this.setThreshold);
        }
        
        if (this.warningBell) {
            this.warningBell.removeEventListener('click', this.resetWarningCounter);
        }
        
        // 移除閾值指示器
        if (this.thresholdIndicator && this.thresholdIndicator.parentNode) {
            this.thresholdIndicator.parentNode.removeChild(this.thresholdIndicator);
        }
    }

    updateThresholdDisplay() {
        if (this.thresholdValue) {
            this.thresholdValue.textContent = `${this.threshold}%`;
        }
    }
} 