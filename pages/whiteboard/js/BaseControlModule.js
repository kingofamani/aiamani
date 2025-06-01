// 基礎控制項模組 - 提供統一的3顆按鈕控制邏輯
class BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance, config = {}) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        
        // 配置選項
        this.config = {
            // 預設尺寸
            defaultWidth: config.defaultWidth || 200,
            defaultHeight: config.defaultHeight || 150,
            minWidth: config.minWidth || 100,
            minHeight: config.minHeight || 100,
            
            // 控制項顏色
            moveButtonColor: config.moveButtonColor || '#10b981',
            deleteButtonColor: config.deleteButtonColor || '#ef4444',
            resizeButtonColor: config.resizeButtonColor || '#3b82f6',
            
            // 邊框顏色
            borderColor: config.borderColor || '#10b981',
            selectedBorderColor: config.selectedBorderColor || '#0ea5e9',
            
            // 工具名稱（用於日誌）
            toolName: config.toolName || 'Element',
            
            ...config
        };
        
        // 狀態變數
        this.active = false;
        this.elements = []; // 儲存所有元素
        this.nextId = 1; // 元素 ID 計數器
        this.selectedElement = null; // 當前選中的元素
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        
        // 綁定事件處理函數
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.bindEvents();
    }
    
    // 基礎事件綁定
    bindEvents() {
        // 監聽畫布點擊事件
        document.addEventListener('click', (e) => {
            if (this.active && (e.target.id === 'whiteboard' || e.target.id === 'testArea')) {
                this.handleCanvasClick(e);
            }
        });

        // 監聽鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (this.active && e.key === 'Delete' && this.selectedElement) {
                this.deleteSelectedElement();
            }
        });

        // 監聽滑鼠事件
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    // 啟動工具
    activate() {
        this.active = true;
        this.canvas.style.cursor = 'crosshair';
        console.log(`${this.config.toolName} tool activated`);
        
        // 顯示所有元素的控制項
        this.elements.forEach(element => {
            this.updateControlPositions(element);
            this.showElementControls(element);
        });
    }
    
    // 停用工具
    deactivate() {
        this.active = false;
        this.canvas.style.cursor = 'default';
        this.selectedElement = null;
        this.isDragging = false;
        this.isResizing = false;
        console.log(`${this.config.toolName} tool deactivated`);
        
        // 隱藏所有控制項
        this.elements.forEach(element => {
            this.hideElementControls(element);
        });
    }
    
    // 處理畫布點擊事件
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有元素上
        const clickedElement = this.getElementAtPosition(x, y);
        
        if (clickedElement) {
            this.selectElement(clickedElement);
        } else {
            // 點擊空白區域，呼叫子類的建立方法
            this.createElement(x, y);
        }
    }
    
    // 建立統一的控制項（3顆按鈕）
    createElementControls(container) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = `移動${this.config.toolName}`;
        moveBtn.className = 'move-handle element-control-btn';
        moveBtn.setAttribute('data-element-id', container.id);
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: ${this.config.moveButtonColor};
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
            this.selectedElement = container;
            this.selectElement(container);

            const rect = container.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.preventDefault();
            e.stopPropagation();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = `刪除${this.config.toolName}`;
        deleteBtn.className = 'element-control-btn';
        deleteBtn.setAttribute('data-element-id', container.id);
        deleteBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: ${this.config.deleteButtonColor};
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
            this.deleteElement(container);
            e.stopPropagation();
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle element-control-btn';
        resizeHandle.setAttribute('data-element-id', container.id);
        resizeHandle.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: ${this.config.resizeButtonColor};
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
            this.selectedElement = container;
            this.resizeHandle = resizeHandle;
            this.selectElement(container);
            e.preventDefault();
            e.stopPropagation();
        });

        // 將控制項新增到 document.body
        document.body.appendChild(moveBtn);
        document.body.appendChild(deleteBtn);
        document.body.appendChild(resizeHandle);

        // 儲存控制項參考
        container.moveBtn = moveBtn;
        container.deleteBtn = deleteBtn;
        container.resizeHandle = resizeHandle;

        // 為容器添加點擊事件監聽器，用於選中元素
        container.addEventListener('mousedown', (e) => {
            // 只有在cursor工具模式下才處理
            if (this.canvasModule.currentTool === 'cursor') {
                this.selectElement(container);
                console.log(`[${this.config.toolName}Module] 容器被直接點擊:`, container.id);
                e.stopPropagation(); // 防止事件冒泡
            }
        });

        // 初始位置更新
        this.updateControlPositions(container);
    }
    
    // 更新控制項位置
    updateControlPositions(container) {
        if (!container.moveBtn) return;

        const rect = container.getBoundingClientRect();
        
        // 移動按鈕位置（左上角）
        container.moveBtn.style.left = (rect.left - 15) + 'px';
        container.moveBtn.style.top = (rect.top - 15) + 'px';
        
        // 刪除按鈕位置（右上角）
        container.deleteBtn.style.left = (rect.right - 15) + 'px';
        container.deleteBtn.style.top = (rect.top - 15) + 'px';
        
        // 縮放控制點位置（右下角）
        container.resizeHandle.style.left = (rect.right - 15) + 'px';
        container.resizeHandle.style.top = (rect.bottom - 15) + 'px';
    }
    
    // 選中元素
    selectElement(container) {
        if (!container) return;

        // 先隱藏所有模組的控制項（如果有app實例）
        if (this.app && this.app.hideAllControls) {
            this.app.hideAllControls();
        }

        this.selectedElement = container;
        this.updateControlPositions(container);
        this.showElementControls(container);

        console.log(`[${this.config.toolName}Module] 元素已選中:`, container.id);
    }
    
    // 顯示元素控制項
    showElementControls(container) {
        if (!container.moveBtn) return;
        
        container.moveBtn.style.opacity = '1';
        container.deleteBtn.style.opacity = '1';
        container.resizeHandle.style.opacity = '1';
    }
    
    // 隱藏元素控制項
    hideElementControls(container) {
        if (!container.moveBtn) return;
        
        container.moveBtn.style.opacity = '0';
        container.deleteBtn.style.opacity = '0';
        container.resizeHandle.style.opacity = '0';
    }
    
    // 獲取指定位置的元素
    getElementAtPosition(x, y) {
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            const rect = element.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            // 轉換為相對於畫布的座標
            const relativeX = x + canvasRect.left;
            const relativeY = y + canvasRect.top;
            
            if (relativeX >= rect.left && relativeX <= rect.right &&
                relativeY >= rect.top && relativeY <= rect.bottom) {
                return element;
            }
        }
        return null;
    }
    
    // 滑鼠事件處理
    handleMouseDown(e) {
        // 控制按鈕的拖曳邏輯已在按鈕事件中處理
    }

    handleMouseMove(e) {
        if (this.isDragging && this.selectedElement) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            this.selectedElement.style.left = newX + 'px';
            this.selectedElement.style.top = newY + 'px';
            this.updateControlPositions(this.selectedElement);
        } else if (this.isResizing && this.selectedElement) {
            this.handleResize(e);
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }
    
    // 處理縮放邏輯（子類可覆寫以自訂縮放行為）
    handleResize(e) {
        const rect = this.selectedElement.getBoundingClientRect();
        const deltaX = e.clientX - rect.left;
        const deltaY = e.clientY - rect.top;
        const avgDelta = (deltaX + deltaY) / 2; // 保持比例
        const newWidth = Math.max(this.config.minWidth, deltaX);
        const newHeight = Math.max(this.config.minHeight, deltaY);
        
        this.selectedElement.style.width = newWidth + 'px';
        this.selectedElement.style.height = newHeight + 'px';
        
        this.updateControlPositions(this.selectedElement);
        
        // 通知子類元素已縮放
        if (this.onElementResized) {
            this.onElementResized(this.selectedElement, newWidth, newHeight);
        }
    }
    
    // 刪除元素
    deleteElement(container) {
        // 從陣列中移除
        const index = this.elements.findIndex(element => element === container);
        if (index !== -1) {
            this.elements.splice(index, 1);
        }

        // 移除控制按鈕
        if (container.moveBtn && container.moveBtn.parentNode) {
            container.moveBtn.parentNode.removeChild(container.moveBtn);
        }
        if (container.deleteBtn && container.deleteBtn.parentNode) {
            container.deleteBtn.parentNode.removeChild(container.deleteBtn);
        }
        if (container.resizeHandle && container.resizeHandle.parentNode) {
            container.resizeHandle.parentNode.removeChild(container.resizeHandle);
        }

        // 移除元素本身
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }

        // 清除選擇
        if (this.selectedElement === container) {
            this.selectedElement = null;
        }

        console.log(`${this.config.toolName}已刪除:`, container.id);
        
        // 通知子類元素已刪除
        if (this.onElementDeleted) {
            this.onElementDeleted(container);
        }
    }
    
    // 刪除選中的元素
    deleteSelectedElement() {
        if (this.selectedElement) {
            this.deleteElement(this.selectedElement);
        }
    }
    
    // 清空所有元素
    clearAllElements() {
        [...this.elements].forEach(element => {
            this.deleteElement(element);
        });
        this.elements = [];
    }
    
    // 隱藏所有控制項
    hideAllControls() {
        this.elements.forEach(element => {
            this.hideElementControls(element);
        });
        this.selectedElement = null;
    }
    
    // 以下方法需要子類實現
    createElement(x, y) {
        throw new Error('createElement method must be implemented by subclass');
    }
    
    // 直接建立元素（可選，子類可實現）
    createElementDirectly(x, y) {
        return this.createElement(x, y);
    }
    
    // 元素縮放回調（子類可實現）
    onElementResized(element, newWidth, newHeight) {
        // 子類可覆寫此方法來處理縮放後的邏輯
    }
    
    // 元素刪除回調（子類可實現）
    onElementDeleted(element) {
        // 子類可覆寫此方法來處理刪除後的清理邏輯
    }

    /**
     * 匯出所有元素資料（基礎方法，子類應覆寫）
     * @returns {Array} 元素資料陣列
     */
    exportData() {
        return this.elements.map(element => this.exportElementData(element));
    }

    /**
     * 匯出單個元素資料（子類應覆寫）
     * @param {HTMLElement} element - 元素
     * @returns {Object} 元素資料
     */
    exportElementData(element) {
        // 使用 style 屬性中的座標而不是 getBoundingClientRect
        const x = parseInt(element.style.left) || 0;
        const y = parseInt(element.style.top) || 0;
        const width = parseInt(element.style.width) || this.config.defaultWidth;
        const height = parseInt(element.style.height) || this.config.defaultHeight;
        
        return {
            id: element.id,
            x: x,
            y: y,
            width: width,
            height: height,
            timestamp: Date.now()
        };
    }

    /**
     * 匯入所有元素資料（基礎方法，子類應覆寫）
     * @param {Array} data - 元素資料陣列
     */
    importData(data) {
        if (!Array.isArray(data)) {
            console.warn(`${this.config.toolName} importData: 無效的資料格式`);
            return;
        }

        // 清空現有元素
        this.clearAll();

        // 重建元素
        data.forEach(elementData => {
            this.importElementData(elementData);
        });

        console.log(`${this.config.toolName} 資料載入完成:`, data.length, '個元素');
    }

    /**
     * 匯入單個元素資料（子類應覆寫）
     * @param {Object} elementData - 元素資料
     */
    importElementData(elementData) {
        // 基礎實現：僅建立空元素
        const element = this.createElement(elementData.x, elementData.y);
        if (element && elementData.width && elementData.height) {
            element.style.width = elementData.width + 'px';
            element.style.height = elementData.height + 'px';
        }
    }

    /**
     * 清空所有元素（別名方法）
     */
    clearAll() {
        this.clearAllElements();
    }
} 