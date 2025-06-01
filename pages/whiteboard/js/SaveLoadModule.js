/**
 * SaveLoadModule - 儲存載入模組
 * 負責收集所有模組的資料並進行儲存/載入操作
 */
class SaveLoadModule {
    constructor(canvasModule, backgroundModule, textToolModule, notesModule, qrCodeModule, youtubeModule, imageModule, countdownModule, stopwatchModule, linkModule) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.textToolModule = textToolModule;
        this.notesModule = notesModule;
        this.qrCodeModule = qrCodeModule;
        this.youtubeModule = youtubeModule;
        this.imageModule = imageModule;
        this.countdownModule = countdownModule;
        this.stopwatchModule = stopwatchModule;
        this.linkModule = linkModule;
    }

    /**
     * 收集所有模組的資料
     * @returns {Object} 完整的專案資料
     */
    exportAllData() {
        const projectData = {
            // 畫布繪圖歷史
            drawingHistory: this.canvasModule.exportData(),
            
            // 背景設定
            background: this.backgroundModule.exportData(),
            
            // 文字工具資料 (包含在 drawingHistory 中)
            
            // 便條紙資料
            notes: this.notesModule.exportData(),
            
            // QR Code 資料
            qrCodes: this.qrCodeModule.exportData(),
            
            // YouTube 影片資料
            youtubeVideos: this.youtubeModule.exportData(),
            
            // 圖片資料
            images: this.imageModule.exportData(),
            
            // 倒數計時器資料
            countdowns: this.countdownModule.exportData(),
            
            // 碼錶資料
            stopwatches: this.stopwatchModule.exportData(),
            
            // 超連結資料
            links: this.linkModule.exportData(),
            
            // 時間戳記
            exportedAt: new Date().toISOString()
        };

        console.log('資料匯出完成:', projectData);
        return projectData;
    }

    /**
     * 載入所有模組的資料
     * @param {Object} projectData - 專案資料
     * @returns {boolean} 載入成功與否
     */
    importAllData(projectData) {
        try {
            console.log('開始載入專案資料:', projectData);

            // 清空現有內容
            this.clearAllContent();

            // 載入背景設定
            if (projectData.background) {
                this.backgroundModule.importData(projectData.background);
            }

            // 載入畫布繪圖歷史
            if (projectData.drawingHistory) {
                this.canvasModule.importData(projectData.drawingHistory);
            }

            // 載入便條紙
            if (projectData.notes && Array.isArray(projectData.notes)) {
                this.notesModule.importData(projectData.notes);
            }

            // 載入 QR Code
            if (projectData.qrCodes && Array.isArray(projectData.qrCodes)) {
                this.qrCodeModule.importData(projectData.qrCodes);
            }

            // 載入 YouTube 影片
            if (projectData.youtubeVideos && Array.isArray(projectData.youtubeVideos)) {
                this.youtubeModule.importData(projectData.youtubeVideos);
            }

            // 載入圖片
            if (projectData.images && Array.isArray(projectData.images)) {
                this.imageModule.importData(projectData.images);
            }

            // 載入倒數計時器
            if (projectData.countdowns && Array.isArray(projectData.countdowns)) {
                this.countdownModule.importData(projectData.countdowns);
            }

            // 載入碼錶
            if (projectData.stopwatches && Array.isArray(projectData.stopwatches)) {
                this.stopwatchModule.importData(projectData.stopwatches);
            }

            // 載入超連結
            if (projectData.links && Array.isArray(projectData.links)) {
                this.linkModule.importData(projectData.links);
            }

            // 重繪所有內容
            this.canvasModule.redrawAllContent();

            console.log('專案資料載入完成');
            return true;

        } catch (error) {
            console.error('載入專案資料失敗:', error);
            return false;
        }
    }

    /**
     * 清空所有內容
     */
    clearAllContent() {
        // 清空畫布和繪圖歷史
        this.canvasModule.clearCanvas();
        
        // 清空各模組的內容
        this.notesModule.clearAll();
        this.qrCodeModule.clearAll();
        this.youtubeModule.clearAll();
        this.imageModule.clearAll();
        this.countdownModule.clearAll();
        this.stopwatchModule.clearAll();
        this.linkModule.clearAll();
        
        // 重設背景為預設
        this.backgroundModule.setBackground('white');
        
        console.log('所有內容已清空');
    }

    /**
     * 生成畫布縮圖
     * @param {number} width - 縮圖寬度
     * @param {number} height - 縮圖高度
     * @returns {string} Base64 編碼的縮圖
     */
    generateThumbnail(width = 200, height = 150) {
        try {
            const canvas = this.canvasModule.getCanvasElement();
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = width;
            tempCanvas.height = height;
            
            // 繪製縮放後的畫布內容
            tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
            
            // 轉換為 base64
            const thumbnail = tempCanvas.toDataURL('image/jpeg', 0.7);
            console.log('縮圖生成完成');
            return thumbnail;
        } catch (error) {
            console.error('生成縮圖失敗:', error);
            return null;
        }
    }

    /**
     * 壓縮專案資料
     * @param {Object} projectData - 原始專案資料
     * @returns {Object} 壓縮後的專案資料
     */
    compressData(projectData) {
        const compressed = { ...projectData };
        
        try {
            // 壓縮繪圖歷史 - 移除非必要的屬性
            if (compressed.drawingHistory && Array.isArray(compressed.drawingHistory)) {
                compressed.drawingHistory = compressed.drawingHistory.map(item => {
                    const compressedItem = { ...item };
                    
                    // 移除空的或預設的屬性
                    if (compressedItem.lineWidth === 5) delete compressedItem.lineWidth;
                    if (compressedItem.color === '#000000') delete compressedItem.color;
                    
                    return compressedItem;
                });
            }

            // 壓縮圖片資料 - 降低 base64 圖片品質
            if (compressed.images && Array.isArray(compressed.images)) {
                compressed.images = compressed.images.map(image => {
                    if (image.data && image.data.startsWith('data:image/')) {
                        // 這裡可以實作圖片壓縮邏輯
                        // 暫時保持原樣
                    }
                    return image;
                });
            }

            console.log('資料壓縮完成');
            return compressed;
        } catch (error) {
            console.error('資料壓縮失敗:', error);
            return projectData; // 回傳原始資料
        }
    }

    /**
     * 取得資料大小 (估算)
     * @param {Object} data - 資料物件
     * @returns {number} 資料大小 (bytes)
     */
    getDataSize(data) {
        try {
            return JSON.stringify(data).length;
        } catch (error) {
            console.error('計算資料大小失敗:', error);
            return 0;
        }
    }

    /**
     * 驗證專案資料結構
     * @param {Object} projectData - 專案資料
     * @returns {boolean} 資料結構是否有效
     */
    validateProjectData(projectData) {
        if (!projectData || typeof projectData !== 'object') {
            return false;
        }

        const requiredFields = ['drawingHistory', 'background'];
        const optionalFields = ['notes', 'qrCodes', 'youtubeVideos', 'images', 'countdowns', 'stopwatches'];

        // 檢查必要欄位
        for (const field of requiredFields) {
            if (!(field in projectData)) {
                console.warn(`缺少必要欄位: ${field}`);
                return false;
            }
        }

        // 檢查陣列欄位的格式
        for (const field of optionalFields) {
            if (field in projectData && !Array.isArray(projectData[field])) {
                console.warn(`欄位 ${field} 應該是陣列格式`);
                return false;
            }
        }

        return true;
    }

    /**
     * 匯出專案為 JSON 檔案
     * @param {string} projectName - 專案名稱
     * @param {Object} projectData - 專案資料
     */
    exportToFile(projectName, projectData) {
        try {
            const jsonString = JSON.stringify(projectData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('專案檔案匯出完成');
        } catch (error) {
            console.error('匯出檔案失敗:', error);
        }
    }

    /**
     * 從檔案匯入專案
     * @param {File} file - 專案檔案
     * @returns {Promise<Object|null>} 專案資料或 null
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || file.type !== 'application/json') {
                reject(new Error('請選擇有效的 JSON 檔案'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);
                    if (this.validateProjectData(projectData)) {
                        console.log('專案檔案載入完成');
                        resolve(projectData);
                    } else {
                        reject(new Error('無效的專案檔案格式'));
                    }
                } catch (error) {
                    reject(new Error('專案檔案解析失敗'));
                }
            };
            reader.onerror = () => reject(new Error('檔案讀取失敗'));
            reader.readAsText(file);
        });
    }
}

// 匯出模組
window.SaveLoadModule = SaveLoadModule; 