class QRCodeModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        this.active = false;
        this.qrCodes = []; // 儲存所有 QR code DOM元素
        this.nextId = 1; // QR code ID 計數器
        this.selectedQR = null; // 當前選中的QR code
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        this.qrPanel = null;
        this.isVisible = false;
        this.pendingPosition = null; // 儲存待建立QR code的位置

        // 預設設定
        this.defaultSize = 150;
        this.minSize = 80;

        // 綁定事件處理函數
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        
        this.createQRPanel();
        this.bindEvents();
    }

    createQRPanel() {
        // 建立 QR code 產生器面板
        this.qrPanel = document.createElement('div');
        this.qrPanel.id = 'qrPanel';
        this.qrPanel.className = 'fixed top-20 left-4 bg-white shadow-lg rounded-lg p-4 z-20 border border-gray-300';
        this.qrPanel.style.display = 'none';
        this.qrPanel.style.minWidth = '300px';

        this.qrPanel.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold text-gray-800">QR Code 產生器</h3>
                <button id="closeQR" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            
            <!-- 輸入區域 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">輸入內容</label>
                <textarea id="qrTextInput" placeholder="輸入文字、網址或其他內容..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" 
                    rows="3"></textarea>
            </div>
            
            <!-- 設定選項 -->
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-700">QR Code 大小</label>
                    <span id="qrSizeValue" class="text-sm text-gray-600">150px</span>
                </div>
                <input type="range" id="qrSizeSlider" min="100" max="300" value="150" 
                    class="w-full cursor-pointer">
            </div>
            
            <!-- 預覽區域 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">預覽</label>
                <div id="qrPreview" class="border border-gray-300 rounded-md p-4 text-center bg-gray-50 min-h-[150px] flex items-center justify-center">
                    <span class="text-gray-500 text-sm">輸入內容後將顯示 QR Code 預覽</span>
                </div>
            </div>
            
            <!-- 操作按鈕 -->
            <div class="flex space-x-2">
                <button id="generateQR" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm" disabled>
                    產生 QR Code
                </button>
                <button id="clearQRInput" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">
                    清空
                </button>
            </div>
            
            <!-- 說明 -->
            <div class="mt-3 text-xs text-gray-500">
                <p>• 輸入文字後點擊「產生 QR Code」</p>
                <p>• 然後在畫布上點擊要放置的位置</p>
                <p>• 支援文字、網址、電話號碼等內容</p>
            </div>
        `;

        document.body.appendChild(this.qrPanel);
        this.bindPanelEvents();
    }

    bindPanelEvents() {
        // 關閉按鈕
        document.getElementById('closeQR').addEventListener('click', () => {
            this.hide();
        });

        // 文字輸入
        const textInput = document.getElementById('qrTextInput');
        textInput.addEventListener('input', () => {
            this.updatePreview();
            this.updateGenerateButton();
        });

        // 大小滑桿
        const sizeSlider = document.getElementById('qrSizeSlider');
        sizeSlider.addEventListener('input', (e) => {
            const size = e.target.value;
            document.getElementById('qrSizeValue').textContent = `${size}px`;
            this.updatePreview();
        });

        // 產生按鈕
        document.getElementById('generateQR').addEventListener('click', () => {
            this.prepareForPlacement();
        });

        // 清空按鈕
        document.getElementById('clearQRInput').addEventListener('click', () => {
            textInput.value = '';
            this.clearPreview();
            this.updateGenerateButton();
        });
    }

    activate() {
        this.active = true;
        this.show();
        console.log('QR Code tool activated');
        
        // 顯示所有QR code的控制項
        this.qrCodes.forEach(qr => {
            this.updateControlPositions(qr);
            this.showQRControls(qr);
        });
    }

    deactivate() {
        this.active = false;
        this.hide();
        this.canvas.style.cursor = 'crosshair';
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        this.selectedQR = null;
        this.isDragging = false;
        this.isResizing = false;
        console.log('QR Code tool deactivated');
        
        // 隱藏所有控制項
        this.qrCodes.forEach(qr => {
            this.hideQRControls(qr);
        });
    }

    show() {
        this.isVisible = true;
        this.qrPanel.style.display = 'block';
    }

    hide() {
        this.isVisible = false;
        this.qrPanel.style.display = 'none';
        this.canvas.removeEventListener('click', this.handleCanvasClick);
    }

    updatePreview() {
        const text = document.getElementById('qrTextInput').value.trim();
        const size = parseInt(document.getElementById('qrSizeSlider').value);
        const previewDiv = document.getElementById('qrPreview');

        if (!text) {
            this.clearPreview();
            return;
        }

        // 使用真正的 QR code API 生成預覽
        try {
            const qrImageUrl = this.generateQRCodeURL(text, size);
            previewDiv.innerHTML = `<img src="${qrImageUrl}" alt="QR Code Preview" style="max-width: 100%; max-height: 150px;" />`;
        } catch (error) {
            previewDiv.innerHTML = '<span class="text-red-500 text-sm">QR Code 生成失敗</span>';
            console.error('QR Code generation error:', error);
        }
    }

    clearPreview() {
        const previewDiv = document.getElementById('qrPreview');
        previewDiv.innerHTML = '<span class="text-gray-500 text-sm">輸入內容後將顯示 QR Code 預覽</span>';
    }

    updateGenerateButton() {
        const text = document.getElementById('qrTextInput').value.trim();
        const generateBtn = document.getElementById('generateQR');
        generateBtn.disabled = !text;
    }

    prepareForPlacement() {
        const text = document.getElementById('qrTextInput').value.trim();
        if (!text) return;

        // 檢查是否有待建立的位置
        if (this.pendingPosition) {
            // 直接在指定位置建立QR Code
            const size = parseInt(document.getElementById('qrSizeSlider').value);
            this.createQRCodeOnCanvas(this.pendingPosition.x, this.pendingPosition.y, text, size);
            
            // 清除待建立位置
            this.pendingPosition = null;
            
            // 隱藏面板
            this.hide();
        } else {
            // 原本的邏輯：準備在畫布上放置 QR code
            this.canvas.style.cursor = 'crosshair';
            this.canvas.addEventListener('click', this.handleCanvasClick);
            
            // 更新按鈕文字提示
            const generateBtn = document.getElementById('generateQR');
            const originalText = generateBtn.textContent;
            generateBtn.textContent = '點擊畫布放置 QR Code';
            generateBtn.disabled = true;

            // 3秒後恢復按鈕狀態
            setTimeout(() => {
                generateBtn.textContent = originalText;
                generateBtn.disabled = false;
            }, 3000);
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有QR code上
        const clickedQR = this.getQRAtPosition(x, y);
        
        if (clickedQR) {
            this.selectQR(clickedQR);
        } else {
            const text = document.getElementById('qrTextInput').value.trim();
            const size = parseInt(document.getElementById('qrSizeSlider').value);

            if (text) {
                this.createQRCodeOnCanvas(x, y, text, size);
                // 移除點擊監聽器
                this.canvas.removeEventListener('click', this.handleCanvasClick);
                this.canvas.style.cursor = 'default';
            }
        }
    }

    async createQRCodeOnCanvas(x, y, text, size) {
        const qrCodeId = `qr-${this.nextId++}`;
        
        try {
            // 顯示載入狀態
            this.showLoadingMessage('正在生成 QR Code...');
            
            // 建立QR Code容器
            const qrContainer = document.createElement('div');
            qrContainer.id = qrCodeId;
            qrContainer.className = 'qr-container';
            qrContainer.style.cssText = `
                position: absolute;
                left: ${x - size / 2}px;
                top: ${y - size / 2}px;
                width: ${size}px;
                height: ${size}px;
                border: 2px solid #10b981;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                cursor: move;
                user-select: none;
                z-index: 50;
                background: white;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            `;

            // 建立QR Code圖片
            const qrImage = document.createElement('img');
            qrImage.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
            `;

            // 產生QR Code
            const qrImageUrl = this.generateQRCodeURL(text, size - 8); // 減去padding
            
            // 處理圖片載入
            qrImage.onload = () => {
                this.hideLoadingMessage();
                console.log('QR Code loaded successfully');
            };
            
            qrImage.onerror = () => {
                console.error('QR Code loading failed');
                // 顯示錯誤佔位符
                qrContainer.innerHTML = `
                    <div style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #f3f4f6;
                        color: #6b7280;
                        font-size: 12px;
                        text-align: center;
                        padding: 8px;
                        box-sizing: border-box;
                    ">
                        <div>QR Code</div>
                        <div style="font-size: 10px; margin-top: 4px;">${text.length > 20 ? text.substring(0, 20) + '...' : text}</div>
                    </div>
                `;
                this.hideLoadingMessage();
            };
            
            qrImage.src = qrImageUrl;
            qrImage.alt = `QR Code: ${text}`;
            qrContainer.appendChild(qrImage);

            // 建立控制項
            this.createQRControls(qrContainer);

            // 儲存相關資料
            qrContainer.qrData = {
                id: qrCodeId,
                text: text,
                size: size,
                originalSize: size
            };
            
            // 同時也設定 dataset 屬性以供匯出使用
            qrContainer.dataset.qrText = text;
            


            // 為QR碼容器添加點擊事件監聽器
            qrContainer.addEventListener('mousedown', (e) => {
                // 只有在cursor工具模式下才處理
                if (this.canvasModule.currentTool === 'cursor') {
                    this.selectQR(qrContainer);
                    console.log('[QRCodeModule.js] QR container clicked directly:', qrContainer.id);
                }
            });

            // 添加到陣列和頁面
            this.qrCodes.push(qrContainer);
            document.body.appendChild(qrContainer);

            // 選中新建立的QR code
            this.selectQR(qrContainer);
            
            this.hideLoadingMessage();
            console.log('QR Code 已建立:', qrCodeId);
            return qrContainer;

        } catch (error) {
            this.hideLoadingMessage();
            console.error('建立 QR Code 時發生錯誤:', error);
            this.showErrorMessage('QR Code 建立失敗，請重試');
        }
    }

    showLoadingMessage(message) {
        // 在面板中顯示載入訊息
        const generateBtn = document.getElementById('generateQR');
        if (generateBtn) {
            generateBtn.textContent = message;
            generateBtn.disabled = true;
        }
    }

    hideLoadingMessage() {
        // 恢復按鈕狀態
        const generateBtn = document.getElementById('generateQR');
        if (generateBtn) {
            generateBtn.textContent = '產生 QR Code';
            generateBtn.disabled = false;
        }
    }

    showErrorMessage(message) {
        // 顯示錯誤訊息
        const previewDiv = document.getElementById('qrPreview');
        if (previewDiv) {
            previewDiv.innerHTML = `<span class="text-orange-500 text-sm">${message}</span>`;
        }
        
        // 3秒後清除錯誤訊息
        setTimeout(() => {
            this.clearPreview();
        }, 3000);
    }

    generateQRCodeURL(text, size) {
        // 使用 qr-server.com API 生成真正的 QR code
        const encodedText = encodeURIComponent(text);
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&format=png&margin=10`;
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
            if (this.active && e.key === 'Delete' && this.selectedQR) {
                this.deleteSelectedQR();
            }
        });

        // 監聽滑鼠事件
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(e) {
        // 處理控制按鈕的拖曳邏輯已在按鈕事件中處理
    }

    handleMouseMove(e) {
        if (this.isDragging && this.selectedQR) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            this.selectedQR.style.left = newX + 'px';
            this.selectedQR.style.top = newY + 'px';
            this.updateControlPositions(this.selectedQR);
        } else if (this.isResizing && this.selectedQR) {
            const rect = this.selectedQR.getBoundingClientRect();
            const deltaX = e.clientX - rect.left;
            const deltaY = e.clientY - rect.top;
            const avgDelta = (deltaX + deltaY) / 2; // 保持方形比例
            const newSize = Math.max(this.minSize, avgDelta);
            
            this.selectedQR.style.width = newSize + 'px';
            this.selectedQR.style.height = newSize + 'px';
            
            // 更新QR Code圖片大小
            if (this.selectedQR.qrData) {
                this.selectedQR.qrData.size = newSize;
                const qrImage = this.selectedQR.querySelector('img');
                if (qrImage) {
                    const newImageSize = newSize - 8; // 減去padding
                    qrImage.src = this.generateQRCodeURL(this.selectedQR.qrData.text, newImageSize);
                }
            }
            
            this.updateControlPositions(this.selectedQR);
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    deleteSelectedQR() {
        if (this.selectedQR) {
            this.deleteQR(this.selectedQR);
        }
    }

    createQRControls(qrContainer) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = '移動QR Code';
        moveBtn.className = 'move-handle qr-control-btn';
        moveBtn.setAttribute('data-qr-id', qrContainer.id);
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #10b981;
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
            this.isDragging = true;
            this.selectedQR = qrContainer;
            this.selectQR(qrContainer);

            const rect = qrContainer.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.preventDefault();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '刪除QR Code';
        deleteBtn.className = 'qr-control-btn';
        deleteBtn.setAttribute('data-qr-id', qrContainer.id);
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
            this.deleteQR(qrContainer);
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle qr-control-btn';
        resizeHandle.setAttribute('data-qr-id', qrContainer.id);
        resizeHandle.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #3b82f6;
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
            this.isResizing = true;
            this.selectedQR = qrContainer;
            this.resizeHandle = resizeHandle;
            this.selectQR(qrContainer);
            e.preventDefault();
        });

        // 將控制項新增到 document.body
        document.body.appendChild(moveBtn);
        document.body.appendChild(deleteBtn);
        document.body.appendChild(resizeHandle);

        // 儲存控制項參考
        qrContainer.moveBtn = moveBtn;
        qrContainer.deleteBtn = deleteBtn;
        qrContainer.resizeHandle = resizeHandle;

        // 初始位置更新
        this.updateControlPositions(qrContainer);
    }

    updateControlPositions(qrContainer) {
        if (!qrContainer.moveBtn) return;

        const rect = qrContainer.getBoundingClientRect();
        
        // 移動按鈕位置（左上角）
        qrContainer.moveBtn.style.left = (rect.left - 15) + 'px';
        qrContainer.moveBtn.style.top = (rect.top - 15) + 'px';
        
        // 刪除按鈕位置（右上角）
        qrContainer.deleteBtn.style.left = (rect.right - 15) + 'px';
        qrContainer.deleteBtn.style.top = (rect.top - 15) + 'px';
        
        // 縮放控制點位置（右下角）
        qrContainer.resizeHandle.style.left = (rect.right - 15) + 'px';
        qrContainer.resizeHandle.style.top = (rect.bottom - 15) + 'px';
    }

    selectQR(qrContainer) {
        if (!qrContainer) return;

        // 先隱藏所有模組的控制項（如果有app實例）
        if (this.app && this.app.hideAllControls) {
            this.app.hideAllControls();
        }

        this.selectedQR = qrContainer;
        this.updateControlPositions(qrContainer);
        this.showQRControls(qrContainer);
        
        // 由 app.js 處理邊框高亮
        // qrContainer.style.border = '3px dashed #0ea5e9'; // 範例：天藍色虛線邊框
        // qrContainer.style.boxShadow = '0 0 15px rgba(14, 165, 233, 0.7)';

        console.log('[QRCodeModule.js] QR Code已選中:', qrContainer.id);
    }

    showQRControls(qrContainer) {
        if (!qrContainer.moveBtn) return;
        
        console.log('[QRCodeModule.js] showQRControls called for:', qrContainer.id);
        console.log('[QRCodeModule.js] Move Btn current opacity:', qrContainer.moveBtn.style.opacity);
        console.log('[QRCodeModule.js] Move Btn current display:', window.getComputedStyle(qrContainer.moveBtn).display);
        console.log('[QRCodeModule.js] Move Btn current visibility:', window.getComputedStyle(qrContainer.moveBtn).visibility);

        qrContainer.moveBtn.style.opacity = '1';
        qrContainer.deleteBtn.style.opacity = '1';
        qrContainer.resizeHandle.style.opacity = '1';
        
        console.log('[QRCodeModule.js] Move Btn new opacity:', qrContainer.moveBtn.style.opacity);
    }

    hideQRControls(qrContainer) {
        if (!qrContainer.moveBtn) return;
        
        qrContainer.moveBtn.style.opacity = '0';
        qrContainer.deleteBtn.style.opacity = '0';
        qrContainer.resizeHandle.style.opacity = '0';
    }

    getQRAtPosition(x, y) {
        for (let i = this.qrCodes.length - 1; i >= 0; i--) {
            const qr = this.qrCodes[i];
            const rect = qr.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            // 轉換為相對於畫布的座標
            const relativeX = x + canvasRect.left;
            const relativeY = y + canvasRect.top;
            
            if (relativeX >= rect.left && relativeX <= rect.right &&
                relativeY >= rect.top && relativeY <= rect.bottom) {
                return qr;
            }
        }
        return null;
    }

    deleteQR(qrContainer) {
        // 從陣列中移除
        const index = this.qrCodes.findIndex(qr => qr === qrContainer);
        if (index !== -1) {
            this.qrCodes.splice(index, 1);
        }

        // 移除控制按鈕
        if (qrContainer.moveBtn && qrContainer.moveBtn.parentNode) {
            qrContainer.moveBtn.parentNode.removeChild(qrContainer.moveBtn);
        }
        if (qrContainer.deleteBtn && qrContainer.deleteBtn.parentNode) {
            qrContainer.deleteBtn.parentNode.removeChild(qrContainer.deleteBtn);
        }
        if (qrContainer.resizeHandle && qrContainer.resizeHandle.parentNode) {
            qrContainer.resizeHandle.parentNode.removeChild(qrContainer.resizeHandle);
        }

        // 移除QR Code本身
        if (qrContainer.parentNode) {
            qrContainer.parentNode.removeChild(qrContainer);
        }

        // 清除選擇
        if (this.selectedQR === qrContainer) {
            this.selectedQR = null;
        }

        console.log('QR Code已刪除:', qrContainer.id);
    }

    // 清空所有QR Code
    clearAllQRCodes() {
        [...this.qrCodes].forEach(qr => {
            this.deleteQR(qr);
        });
        this.qrCodes = [];
    }

    // 直接建立QR Code（新增方法）
    createQRDirectly(x, y) {
        // 儲存位置以供後續使用
        this.pendingPosition = { x, y };
        
        // 顯示QR code設定面板
        this.show();
        
        // 清空之前的輸入
        const textInput = document.getElementById('qrTextInput');
        textInput.value = '';
        textInput.focus();
        
        // 重置預覽和按鈕狀態
        this.clearPreview();
        this.updateGenerateButton();
        
        console.log('顯示QR Code設定面板，準備建立於位置:', x, y);
    }

    // 隱藏所有QR Code控制項（新增方法）
    hideAllControls() {
        this.qrCodes.forEach(qr => {
            this.hideQRControls(qr);
        });
        this.selectedQR = null;
    }

    /**
     * 匯出所有 QR Code 資料
     * @returns {Array} QR Code 資料陣列
     */
    exportData() {
        console.log('QRCodeModule.exportData() 被調用');
        console.log('當前 QR 碼數量:', this.qrCodes.length);
        
        const exportedData = this.qrCodes.map(qr => {
            // 使用 style 屬性中的座標而不是 getBoundingClientRect
            const x = parseInt(qr.style.left) || 0;
            const y = parseInt(qr.style.top) || 0;
            const width = parseInt(qr.style.width) || 150;
            const height = parseInt(qr.style.height) || 150;
            const img = qr.querySelector('img');
            

            
            const qrData = {
                id: qr.id,
                x: x,
                y: y,
                width: width,
                height: height,
                text: qr.dataset.qrText || (qr.qrData && qr.qrData.text) || '',
                dataURL: img ? img.src : '',
                timestamp: Date.now()
            };
            
            console.log('匯出 QR Code 資料:', qrData);
            return qrData;
        });
        
        console.log('QRCodeModule.exportData() 完成，匯出了', exportedData.length, '個 QR 碼');
        return exportedData;
    }

    /**
     * 匯入 QR Code 資料
     * @param {Array} data - QR Code 資料陣列
     */
    importData(data) {
        console.log('QRCodeModule.importData() 被調用，資料:', data);
        
        if (!Array.isArray(data)) {
            console.warn('QRCode importData: 無效的資料格式');
            return;
        }

        console.log('準備匯入', data.length, '個 QR 碼');

        // 清空現有 QR Code
        this.clearAll();

        // 重建 QR Code
        data.forEach((qrData, index) => {
            console.log(`匯入第 ${index + 1} 個 QR 碼:`, qrData);
            this.importQRData(qrData);
        });

        // 確保所有匯入的 QR 碼在需要時能顯示控制項
        setTimeout(() => {
            this.qrCodes.forEach(qr => {
                this.updateControlPositions(qr);
                // 如果目前是作用中狀態，顯示控制項
                if (this.active) {
                    this.showQRControls(qr);
                }
            });
        }, 100);

        console.log('QR Code 資料載入完成:', data.length, '個 QR Code');
    }

    /**
     * 匯入單個 QR Code 資料
     * @param {Object} qrData - QR Code 資料
     */
    importQRData(qrData) {
        if (!qrData.text) {
            console.warn('QRCode importQRData: 缺少文字資料');
            return;
        }

        // 直接建立 QR Code DOM 元素（不透過面板）
        const qrId = qrData.id || `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const qrContainer = document.createElement('div');
        qrContainer.id = qrId;
        qrContainer.className = 'qr-container';
        
        // 設定樣式，與 createQRCodeOnCanvas 保持一致
        qrContainer.style.cssText = `
            position: absolute;
            left: ${qrData.x}px;
            top: ${qrData.y}px;
            width: ${qrData.width || 150}px;
            height: ${qrData.height || 150}px;
            border: 2px solid #10b981;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: move;
            user-select: none;
            z-index: 50;
            background: white;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        `;

        // 建立圖片元素
        const img = document.createElement('img');
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
        `;
        img.alt = `QR Code: ${qrData.text}`;
        
        if (qrData.dataURL) {
            img.src = qrData.dataURL;
        } else {
            // 重新生成 QR Code
            img.src = this.generateQRCodeURL(qrData.text, Math.min(qrData.width, qrData.height) || 150);
        }

        qrContainer.appendChild(img);

        // 建立控制項
        this.createQRControls(qrContainer);

        // 儲存相關資料 - 重要！與 createQRCodeOnCanvas 保持一致
        qrContainer.qrData = {
            id: qrId,
            text: qrData.text,
            size: qrData.width || 150,
            originalSize: qrData.width || 150
        };
        
        // 設定 dataset 屬性
        qrContainer.dataset.qrText = qrData.text;

        // 為QR碼容器添加點擊事件監聽器 - 重要！
        qrContainer.addEventListener('mousedown', (e) => {
            // 只有在cursor工具模式下才處理
            if (this.canvasModule.currentTool === 'cursor') {
                this.selectQR(qrContainer);
                console.log('[QRCodeModule.js] QR container clicked directly:', qrContainer.id);
            }
        });

        // 添加到陣列和頁面
        this.qrCodes.push(qrContainer);
        document.body.appendChild(qrContainer);

        console.log('QR Code 已匯入:', qrId, '文字:', qrData.text);
    }

    /**
     * 清空所有 QR Code（別名方法）
     */
    clearAll() {
        this.clearAllQRCodes();
    }
} 