class CanvasModule {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with id "${canvasId}" not found.`);
            return;
        }
        this.context = this.canvas.getContext('2d');
        this.drawing = false;
        this.currentTool = 'pen'; // 'pen' or 'eraser'
        this.currentColor = '#000000';
        this.currentLineWidth = 5;
        this.lastX = 0;
        this.lastY = 0;
        this.drawingHistory = []; // 用於儲存繪圖操作
        this.currentPath = null; // 用於儲存當前繪製的路徑

        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.init();
    }

    init() {
        this.resizeCanvas(); // 初始設定畫布大小
        window.addEventListener('resize', this.resizeCanvas);
    }

    resizeCanvas() {
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // 背景由 app.js 中的 backgroundModule.drawBackground() 處理
        // 前景重繪也由 app.js 中的 window.resize 事件處理器協調 canvasModule.redrawAllContent()
        // setDefaultStyles 也由 app.js 中的 window.resize 事件處理器協調

        console.log(`Canvas resized from ${oldWidth}x${oldHeight} to: ${this.canvas.width}x${this.canvas.height}`);
        // this.setDefaultStyles(); // 移至 app.js 的 resize 處理器
        // this.redrawAllContent(); // 移至 app.js 的 resize 處理器
    }

    setDefaultStyles() {
        if (this.context) {
            this.context.strokeStyle = this.currentColor;
            this.context.lineWidth = this.currentLineWidth;
            this.context.lineCap = 'round'; // 讓線條頭尾更圓滑
            this.context.lineJoin = 'round'; // 讓線條連接處更圓滑
            // 如果是橡皮擦模式，恢復為繪圖模式的合成操作
            if (this.currentTool === 'pen') {
                 this.context.globalCompositeOperation = 'source-over';
            }
        }
    }

    startDrawing(e) {
        this.drawing = true;
        [this.lastX, this.lastY] = this.getMousePosition(e);
        // this.context.beginPath(); // 開始新路徑，避免連接到舊路徑
        // this.context.moveTo(this.lastX, this.lastY);
        // 改為記錄操作，而不是立即開始路徑，這樣 redrawAllContent 更方便
        this.currentPath = {
            tool: this.currentTool,
            color: this.currentTool === 'pen' ? this.currentColor : null, // 橡皮擦不需要顏色
            lineWidth: this.currentLineWidth,
            points: [[this.lastX, this.lastY]],
            compositeOperation: this.context.globalCompositeOperation // 儲存當時的合成操作
        };
    }

    draw(e) {
        if (!this.drawing) return;
        const [x, y] = this.getMousePosition(e);
        
        // 即時繪製
        this.context.beginPath();
        this.context.moveTo(this.lastX, this.lastY);
        this.context.lineTo(x, y);
        this.context.stroke(); // 這裡 stroke 會使用 setDefaultStyles 設定的樣式
        
        [this.lastX, this.lastY] = [x, y];
        if (this.currentPath) {
            this.currentPath.points.push([x,y]);
        }
    }

    stopDrawing() {
        if (!this.drawing) return;
        // this.context.closePath(); // 關閉目前路徑
        this.drawing = false;
        if (this.currentPath && this.currentPath.points.length > 1) {
            this.drawingHistory.push(this.currentPath);
        }
        this.currentPath = null;
    }

    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return [x, y];
    }

    clearCanvas() {
        this.drawingHistory = []; // 清空繪圖歷史
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 背景的重繪將由 app.js -> backgroundModule 協調
    }

    redrawAllContent() {
        // 由 app.js 呼叫 backgroundModule.drawBackground() 來繪製背景
        // 此方法只負責重繪前景 (drawingHistory)
        // 因此不應該在此處清除整個畫布 this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const originalGlobalCompositeOperation = this.context.globalCompositeOperation;
        const originalStrokeStyle = this.context.strokeStyle;
        const originalFillStyle = this.context.fillStyle;
        const originalFont = this.context.font;
        const originalTextAlign = this.context.textAlign;
        const originalTextBaseline = this.context.textBaseline;

        this.drawingHistory.forEach(path => {
            if (path.tool === 'text') {
                // 處理文字重繪
                console.log('Redrawing text:', path);
                this.context.globalCompositeOperation = 'source-over';
                this.context.fillStyle = path.color;
                this.context.font = path.font;
                this.context.textAlign = 'left';
                this.context.textBaseline = 'alphabetic';
                console.log(`Drawing text "${path.text}" at x=${path.x}, y=${path.y} with font=${path.font}, color=${path.color}`);
                this.context.fillText(path.text, path.x, path.y);
                return;
            }

            if (path.tool === 'note') {
                // 處理便條紙重繪
                console.log('Redrawing note:', path);
                this.context.globalCompositeOperation = 'source-over';
                
                // 繪製便條紙背景
                this.context.fillStyle = path.color;
                this.context.fillRect(path.x, path.y, path.width, path.height);
                
                // 繪製邊框
                this.context.strokeStyle = '#ddd';
                this.context.lineWidth = 1;
                this.context.strokeRect(path.x, path.y, path.width, path.height);
                
                // 繪製文字
                if (path.text) {
                    this.context.fillStyle = path.textColor;
                    this.context.font = `${path.fontSize}px ${path.fontFamily}`;
                    this.context.textAlign = 'left';
                    this.context.textBaseline = 'top';
                    
                    // 文字換行處理
                    const words = path.text.split(' ');
                    const lineHeight = path.fontSize + 2;
                    const maxWidth = path.width - 10;
                    let line = '';
                    let y = path.y + 5;
                    
                    for (let i = 0; i < words.length; i++) {
                        const testLine = line + words[i] + ' ';
                        const metrics = this.context.measureText(testLine);
                        const testWidth = metrics.width;
                        
                        if (testWidth > maxWidth && i > 0) {
                            this.context.fillText(line, path.x + 5, y);
                            line = words[i] + ' ';
                            y += lineHeight;
                            
                            // 檢查是否超出便條紙高度
                            if (y + lineHeight > path.y + path.height - 5) {
                                break;
                            }
                        } else {
                            line = testLine;
                        }
                    }
                    
                    // 繪製最後一行
                    if (line.trim() && y + lineHeight <= path.y + path.height - 5) {
                        this.context.fillText(line, path.x + 5, y);
                    }
                }
                return;
            }

            if (path.tool === 'qrcode') {
                // 處理 QR code 重繪
                console.log('Redrawing QR code:', path);
                this.context.globalCompositeOperation = 'source-over';
                
                if (path.dataURL) {
                    const img = new Image();
                    img.onload = () => {
                        this.context.drawImage(img, path.x, path.y, path.width, path.height);
                    };
                    img.src = path.dataURL;
                } else {
                    // 備用繪製方法
                    this.context.fillStyle = '#ffffff';
                    this.context.fillRect(path.x, path.y, path.width, path.height);
                    
                    this.context.strokeStyle = '#000000';
                    this.context.lineWidth = 2;
                    this.context.strokeRect(path.x, path.y, path.width, path.height);
                    
                    this.context.fillStyle = '#000000';
                    this.context.font = '14px Arial';
                    this.context.textAlign = 'center';
                    this.context.textBaseline = 'middle';
                    this.context.fillText('QR Code', path.x + path.width / 2, path.y + path.height / 2 - 10);
                    
                    const shortText = path.text.length > 10 ? path.text.substring(0, 10) + '...' : path.text;
                    this.context.font = '10px Arial';
                    this.context.fillText(shortText, path.x + path.width / 2, path.y + path.height / 2 + 10);
                }
                return;
            }

            // 處理畫筆和橡皮擦重繪
            if (!path.points || path.points.length < 2) return;

            this.context.beginPath();
            this.context.moveTo(path.points[0][0], path.points[0][1]);
            
            this.context.lineWidth = path.lineWidth;
            this.context.lineCap = 'round';
            this.context.lineJoin = 'round';
            
            if (path.tool === 'pen') {
                this.context.strokeStyle = path.color;
                this.context.globalCompositeOperation = 'source-over';
            } else if (path.tool === 'eraser') {
                this.context.globalCompositeOperation = 'destination-out';
            }

            for (let i = 1; i < path.points.length; i++) {
                this.context.lineTo(path.points[i][0], path.points[i][1]);
            }
            this.context.stroke();
        });
        
        // 恢復到目前的工具設定
        this.context.strokeStyle = originalStrokeStyle;
        this.context.fillStyle = originalFillStyle;
        this.context.font = originalFont;
        this.context.textAlign = originalTextAlign;
        this.context.textBaseline = originalTextBaseline;
        this.context.globalCompositeOperation = originalGlobalCompositeOperation;
    }

    setTool(tool) {
        this.currentTool = tool;
        if (this.context) {
            if (tool === 'eraser') {
                this.context.globalCompositeOperation = 'destination-out';
            } else {
                this.context.globalCompositeOperation = 'source-over';
                this.context.strokeStyle = this.currentColor; // 切回畫筆時，確保顏色正確
            }
            this.context.lineWidth = this.currentLineWidth; // 無論何種工具，線寬保持設定
        }
    }

    setColor(color) {
        this.currentColor = color;
        if (this.context && this.currentTool === 'pen') { // 只有畫筆模式才即時改變strokeStyle
            this.context.strokeStyle = color;
        }
    }

    setLineWidth(width) {
        this.currentLineWidth = width;
        if (this.context) {
            this.context.lineWidth = width;
        }
    }

    // 事件綁定移至 app.js 或由 app.js 調用
    // removeEventListeners() {
    //     window.removeEventListener('resize', this.resizeCanvas);
    //     this.canvas.removeEventListener('mousedown', this.startDrawing.bind(this));
    //     this.canvas.removeEventListener('mousemove', this.draw.bind(this));
    //     this.canvas.removeEventListener('mouseup', this.stopDrawing.bind(this));
    //     this.canvas.removeEventListener('mouseleave', this.stopDrawing.bind(this)); // 避免滑鼠移出未放開持續繪製

    //     this.canvas.removeEventListener('touchstart', this.startDrawing.bind(this));
    //     this.canvas.removeEventListener('touchmove', this.draw.bind(this));
    //     this.canvas.removeEventListener('touchend', this.stopDrawing.bind(this));
    // }

    getContext() {
        return this.context;
    }

    getCanvasElement() {
        return this.canvas;
    }

    addTextToHistory(text, x, y, color, font) {
        this.drawingHistory.push({
            tool: 'text',
            text: text,
            x: x,
            y: y,
            color: color,
            font: font
        });
        // 不需要立即重繪，TextToolModule 會調用 redrawAllContent

        // TEMPORARY TEST: Directly draw the text to see if it appears at all
        // console.log('Temporary direct draw of text:', { text, x, y, color, font });
        // const ctx = this.getContext();
        // const oldFillStyle = ctx.fillStyle;
        // const oldFont = ctx.font;
        // const oldCompositeOp = ctx.globalCompositeOperation;
        // ctx.fillStyle = color;
        // ctx.font = font;
        // ctx.textAlign = 'left';
        // ctx.textBaseline = 'alphabetic';
        // ctx.globalCompositeOperation = 'source-over';
        // ctx.fillText(text, x, y); 
        // ctx.fillStyle = oldFillStyle;
        // ctx.font = oldFont;
        // ctx.globalCompositeOperation = oldCompositeOp;
        // console.log('Temporary direct draw complete.');
    }

    /**
     * 匯出繪圖歷史資料
     * @returns {Array} 繪圖歷史陣列
     */
    exportData() {
        return [...this.drawingHistory];
    }

    /**
     * 匯入繪圖歷史資料
     * @param {Array} data - 繪圖歷史陣列
     */
    importData(data) {
        if (Array.isArray(data)) {
            this.drawingHistory = [...data];
            this.redrawAllContent();
            console.log('Canvas 繪圖歷史載入完成');
        } else {
            console.warn('Canvas importData: 無效的資料格式');
        }
    }
} 