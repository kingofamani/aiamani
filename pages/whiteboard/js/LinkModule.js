/**
 * LinkModule - 超連結模組
 * 繼承 BaseControlModule，提供超連結的建立、編輯和管理功能
 */
class LinkModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        super(canvasModule, backgroundModule, appInstance, {
            defaultWidth: 280,
            defaultHeight: 120,
            minWidth: 200,
            minHeight: 80
        });
        
        this.moduleName = 'LinkModule';
        this.selectedLink = null;
        this.isActive = false;
        this.linkIdCounter = 0;
        
        this.init();
    }

    /**
     * 初始化模組
     */
    init() {
        this.createLinkInputModal();
    }

    /**
     * 建立超連結輸入對話框
     */
    createLinkInputModal() {
        // 檢查是否已存在
        if (document.getElementById('link-input-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'link-input-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: translateY(20px);
                transition: transform 0.3s ease;
            ">
                <h2 style="
                    margin: 0 0 24px 0;
                    color: #1f2937;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                ">🔗 新增超連結</h2>
                
                <div style="margin-bottom: 20px;">
                    <label style="
                        display: block;
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 8px;
                    ">網址 (URL)</label>
                    <input type="url" id="link-url-input" placeholder="https://example.com" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e5e7eb;
                        border-radius: 6px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div style="margin-bottom: 24px;">
                    <label style="
                        display: block;
                        font-weight: 600;
                        color: #374151;
                        margin-bottom: 8px;
                    ">標題 (選填)</label>
                    <input type="text" id="link-title-input" placeholder="自動偵測或自訂標題" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e5e7eb;
                        border-radius: 6px;
                        font-size: 16px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="link-cancel-btn" style="
                        padding: 10px 20px;
                        border: 2px solid #e5e7eb;
                        border-radius: 6px;
                        background: white;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">取消</button>
                    <button id="link-create-btn" style="
                        padding: 10px 20px;
                        border: 2px solid #3b82f6;
                        border-radius: 6px;
                        background: #3b82f6;
                        color: white;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">建立連結</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 綁定事件
        const urlInput = modal.querySelector('#link-url-input');
        const titleInput = modal.querySelector('#link-title-input');
        const cancelBtn = modal.querySelector('#link-cancel-btn');
        const createBtn = modal.querySelector('#link-create-btn');

        // URL 自動偵測標題
        urlInput.addEventListener('blur', () => {
            const url = urlInput.value.trim();
            if (url && !titleInput.value.trim()) {
                this.detectWebsiteTitle(url).then(title => {
                    if (title) {
                        titleInput.value = title;
                    }
                });
            }
        });

        cancelBtn.addEventListener('click', () => {
            this.hideLinkInputModal();
        });

        createBtn.addEventListener('click', () => {
            this.handleCreateLink();
        });

        // 按 Escape 關閉
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLinkInputModal();
            }
        });

        // 按 Enter 創建
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target === urlInput || e.target === titleInput)) {
                this.handleCreateLink();
            }
        });

        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLinkInputModal();
            }
        });
    }

    /**
     * 偵測網站標題
     */
    async detectWebsiteTitle(url) {
        try {
            // 嘗試從 URL 中提取域名作為標題
            const urlObj = new URL(url);
            let title = urlObj.hostname.replace('www.', '');
            
            // 將域名首字母大寫
            title = title.charAt(0).toUpperCase() + title.slice(1);
            
            return title;
        } catch (error) {
            console.log('無法偵測網站標題:', error);
            return null;
        }
    }

    /**
     * 顯示超連結輸入對話框
     */
    showLinkInputModal(x, y) {
        this.pendingPosition = { x, y };
        const modal = document.getElementById('link-input-modal');
        const urlInput = modal.querySelector('#link-url-input');
        const titleInput = modal.querySelector('#link-title-input');
        
        // 清空輸入框
        urlInput.value = '';
        titleInput.value = '';
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('div').style.transform = 'translateY(0)';
            urlInput.focus();
        }, 100);
    }

    /**
     * 隱藏超連結輸入對話框
     */
    hideLinkInputModal() {
        const modal = document.getElementById('link-input-modal');
        modal.style.opacity = '0';
        modal.querySelector('div').style.transform = 'translateY(20px)';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    /**
     * 處理建立超連結
     */
    handleCreateLink() {
        const modal = document.getElementById('link-input-modal');
        const url = modal.querySelector('#link-url-input').value.trim();
        const title = modal.querySelector('#link-title-input').value.trim();

        if (!url) {
            alert('請輸入網址');
            return;
        }

        // 驗證 URL 格式
        try {
            new URL(url);
        } catch (error) {
            alert('請輸入有效的網址');
            return;
        }

        // 建立超連結
        this.createLinkElement(this.pendingPosition.x, this.pendingPosition.y, url, title || url);
        this.hideLinkInputModal();
    }

    /**
     * 創建元素（覆寫父類方法）
     */
    createElement(x, y) {
        this.showLinkInputModal(x, y);
    }

    /**
     * 建立超連結元素
     */
    createLinkElement(x, y, url, title) {
        // 確保座標正確，如果座標為 0 或無效，使用畫布中央
        const canvas = this.canvasModule.getCanvasElement();
        const finalX = (x && x > 0) ? x : canvas.offsetWidth / 2;
        const finalY = (y && y > 0) ? y : canvas.offsetHeight / 2;
        
        // 將座標置中（減去元素寬高的一半）
        const centeredX = finalX - (this.config.defaultWidth / 2);
        const centeredY = finalY - (this.config.defaultHeight / 2);
        
        console.log('建立超連結座標:', { originalX: x, originalY: y, finalX, finalY, centeredX, centeredY });
        
        const linkContainer = document.createElement('div');
        linkContainer.className = 'link-container';
        linkContainer.style.cssText = `
            position: absolute;
            left: ${centeredX}px;
            top: ${centeredY}px;
            width: ${this.config.defaultWidth}px;
            height: ${this.config.defaultHeight}px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            cursor: move;
            user-select: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.2s ease;
            z-index: 100;
        `;

        // 生成唯一 ID
        const linkId = `link-${Date.now()}-${this.linkIdCounter++}`;
        linkContainer.id = linkId;

        // 儲存連結資料
        linkContainer.linkData = {
            url: url,
            title: title,
            createdAt: Date.now()
        };

        // 建立連結內容
        this.createLinkContent(linkContainer, url, title);

        // 添加到頁面
        document.body.appendChild(linkContainer);

        // 建立控制按鈕（使用父類方法）
        this.createElementControls(linkContainer);

        // 綁定事件
        this.bindLinkEvents(linkContainer);

        // 添加到元素陣列（重要！）
        this.elements.push(linkContainer);

        // 選中該元素
        this.selectElement(linkContainer);

        console.log('超連結建立完成:', { url, title, id: linkId });
        return linkContainer;
    }

    /**
     * 建立超連結內容
     */
    createLinkContent(container, url, title) {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        container.innerHTML = `
            <div style="
                flex: 1;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                position: relative;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                ">
                    <img src="${favicon}" alt="網站圖示" style="
                        width: 20px;
                        height: 20px;
                        border-radius: 4px;
                    " onerror="this.style.display='none'">
                    <span style="
                        font-size: 12px;
                        color: #6b7280;
                        font-weight: 500;
                    ">${domain}</span>
                </div>
                
                <h3 style="
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1f2937;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                ">${this.escapeHtml(title)}</h3>
                
                <p style="
                    margin: 0;
                    font-size: 14px;
                    color: #6b7280;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                ">${this.escapeHtml(url)}</p>
                
                <!-- 圓形開啟連結按鈕 -->
                <button class="link-open-circle-btn" style="
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 16px;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                    transition: all 0.2s ease;
                    z-index: 10;
                " onmouseover="this.style.background='#2563eb'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#3b82f6'; this.style.transform='scale(1)'" title="開啟連結">
                    ↗
                </button>
            </div>
        `;
    }

    /**
     * 綁定超連結事件
     */
    bindLinkEvents(linkContainer) {
        const openCircleBtn = linkContainer.querySelector('.link-open-circle-btn');
        
        openCircleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = linkContainer.linkData.url;
            window.open(url, '_blank', 'noopener,noreferrer');
        });

        // 雙擊編輯
        linkContainer.addEventListener('dblclick', (e) => {
            if (e.target === openCircleBtn) return;
            e.stopPropagation();
            this.editLink(linkContainer);
        });
    }

    /**
     * 編輯超連結
     */
    editLink(linkContainer) {
        const linkData = linkContainer.linkData;
        const modal = document.getElementById('link-input-modal');
        const urlInput = modal.querySelector('#link-url-input');
        const titleInput = modal.querySelector('#link-title-input');
        
        // 填入現有資料
        urlInput.value = linkData.url;
        titleInput.value = linkData.title;
        
        // 暫存要編輯的元素
        this.editingLink = linkContainer;
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('div').style.transform = 'translateY(0)';
            urlInput.focus();
        }, 100);

        // 修改建立按鈕文字
        const createBtn = modal.querySelector('#link-create-btn');
        const originalText = createBtn.textContent;
        createBtn.textContent = '更新連結';
        
        // 修改標題
        const title = modal.querySelector('h2');
        const originalTitle = title.textContent;
        title.textContent = '🔗 編輯超連結';
        
        // 修改處理函數
        const originalHandler = this.handleCreateLink;
        this.handleCreateLink = () => {
            const url = urlInput.value.trim();
            const newTitle = titleInput.value.trim();

            if (!url) {
                alert('請輸入網址');
                return;
            }

            try {
                new URL(url);
            } catch (error) {
                alert('請輸入有效的網址');
                return;
            }

            // 更新連結資料
            this.editingLink.linkData.url = url;
            this.editingLink.linkData.title = newTitle || url;
            
            // 重新建立內容
            this.createLinkContent(this.editingLink, url, newTitle || url);
            
            // 重新綁定事件
            this.bindLinkEvents(this.editingLink);
            
            this.hideLinkInputModal();
            
            // 恢復原始狀態
            createBtn.textContent = originalText;
            title.textContent = originalTitle;
            this.handleCreateLink = originalHandler;
            this.editingLink = null;
        };
    }

    /**
     * 處理元素大小調整
     */
    handleResize(e) {
        const container = e.target.closest('.link-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;

        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newWidth = Math.max(this.config.minWidth, startWidth + deltaX);
            const newHeight = Math.max(this.config.minHeight, startHeight + deltaY);
            
            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
            
            this.updateControlPositions(container);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    /**
     * 刪除元素時的清理
     */
    onElementDeleted(linkContainer) {
        if (this.selectedLink === linkContainer) {
            this.selectedLink = null;
        }
        
        console.log('超連結已刪除:', linkContainer.linkData);
    }

    /**
     * 匯出元素資料
     */
    exportElementData(element) {
        if (!element.linkData) return null;

        const x = parseInt(element.style.left) || 0;
        const y = parseInt(element.style.top) || 0;
        const width = parseInt(element.style.width) || this.config.defaultWidth;
        const height = parseInt(element.style.height) || this.config.defaultHeight;

        console.log('匯出超連結座標:', { id: element.id, x, y, width, height });

        return {
            type: 'link',
            id: element.id,
            linkData: element.linkData,
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    /**
     * 匯入元素資料
     */
    importElementData(elementData) {
        if (elementData.type !== 'link') return null;

        // 直接使用儲存的座標建立容器，不經過 createLinkElement 的置中處理
        const linkContainer = document.createElement('div');
        linkContainer.className = 'link-container';
        linkContainer.id = elementData.id;
        linkContainer.style.cssText = `
            position: absolute;
            left: ${elementData.x}px;
            top: ${elementData.y}px;
            width: ${elementData.width}px;
            height: ${elementData.height}px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            cursor: move;
            user-select: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.2s ease;
            z-index: 100;
        `;

        // 儲存連結資料
        linkContainer.linkData = elementData.linkData;

        // 建立連結內容
        this.createLinkContent(linkContainer, elementData.linkData.url, elementData.linkData.title);

        // 添加到頁面
        document.body.appendChild(linkContainer);

        // 建立控制按鈕
        this.createElementControls(linkContainer);

        // 綁定事件
        this.bindLinkEvents(linkContainer);

        // 添加到元素陣列（重要！）
        this.elements.push(linkContainer);

        console.log('超連結匯入完成:', { id: elementData.id, x: elementData.x, y: elementData.y });
        return linkContainer;
    }

    /**
     * HTML 轉義
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 取得所有超連結
     */
    get links() {
        return this.elements; // 使用父類的 elements 陣列
    }

    /**
     * 取得選中的超連結
     */
    get selectedLink() {
        return this._selectedLink || null;
    }

    set selectedLink(value) {
        this._selectedLink = value;
    }

    /**
     * 清除所有超連結
     */
    clearAllLinks() {
        this.clearAllElements(); // 使用父類方法
        this.selectedLink = null;
    }

    /**
     * 取得指定位置的超連結
     */
    getLinkAtPosition(x, y) {
        return this.getElementAtPosition(x, y); // 使用父類方法
    }
}

// 匯出模組
window.LinkModule = LinkModule; 