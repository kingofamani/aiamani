class BackgroundModule {
    constructor(canvasModule) {
        this.canvasModule = canvasModule;
        this.context = canvasModule.getContext();
        this.canvas = canvasModule.getCanvasElement();
        this.currentBackgroundType = 'white'; // 'white', 'lightgray', 'grid', 'customColor'
        this.customColor = '#ffffff';

        // Base64 encoded SVG for a simple grid. Light gray lines.
        this.gridImageDataUrl = `data:image/svg+xml;base64,${btoa(`
            <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
        `)}`;
        this.gridImage = new Image();
        this.gridImage.onload = () => {
            // 背景圖載入完成後，如果目前選的是格線，則重繪一次
            if (this.currentBackgroundType === 'grid') {
                this.drawBackground();
            }
        };
        this.gridImage.src = this.gridImageDataUrl;
    }

    setBackground(type, customColor = null) {
        this.currentBackgroundType = type;
        if (type === 'customColor' && customColor) {
            this.customColor = customColor;
        }
        // 立即繪製背景，然後重繪所有內容
        this.drawBackground();
        this.canvasModule.redrawAllContent(); // 通知 CanvasModule 重繪前景內容
    }

    drawBackground() {
        if (!this.context || !this.canvas) return;

        this.context.save(); // 保存當前繪圖狀態
        // 清除畫布時要確保使用 source-over，避免受目前工具 (如橡皮擦) 影響
        this.context.globalCompositeOperation = 'source-over'; 

        switch (this.currentBackgroundType) {
            case 'white':
                this.context.fillStyle = '#ffffff';
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            case 'lightgray':
                this.context.fillStyle = '#f0f0f0';
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            case 'grid':
                if (this.gridImage.complete && this.gridImage.naturalWidth > 0) { // 確保圖片已載入
                    this.context.fillStyle = this.context.createPattern(this.gridImage, 'repeat');
                    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                } else {
                    // 圖片未載入完成時，可以先畫一個替代背景，例如白色
                    this.context.fillStyle = '#ffffff';
                    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    // 並且由於 onload 中會重繪，這裡不需要重複調用 drawBackground
                }
                break;
            case 'customColor':
                this.context.fillStyle = this.customColor;
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
            default:
                this.context.fillStyle = '#ffffff';
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.context.restore(); // 恢復之前保存的繪圖狀態 (尤其是 globalCompositeOperation)
    }

    /**
     * 匯出背景設定資料
     * @returns {Object} 背景設定物件
     */
    exportData() {
        return {
            type: this.currentBackgroundType,
            customColor: this.customColor
        };
    }

    /**
     * 匯入背景設定資料
     * @param {Object} data - 背景設定物件
     */
    importData(data) {
        if (data && typeof data === 'object') {
            this.currentBackgroundType = data.type || 'white';
            this.customColor = data.customColor || '#ffffff';
            this.drawBackground();
            console.log('Background 設定載入完成');
        } else {
            console.warn('Background importData: 無效的資料格式');
        }
    }
} 