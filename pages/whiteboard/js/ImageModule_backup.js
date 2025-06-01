class ImageModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        this.isActive = false;
        this.images = []; // 儲存所有圖片
        this.selectedImage = null; // 當前選中的圖片
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        
        // 預設設定
        this.defaultWidth = 300;
        this.defaultHeight = 200;
        this.minWidth = 100;
        this.minHeight = 100;
        
        this.bindEvents();
    }

    bindEvents() {
        // 監聽畫布點擊事件
        document.addEventListener('click', (e) => {
            if (this.isActive && (e.target.id === 'whiteboard' || e.target.id === 'testArea')) {
                this.handleCanvasClick(e);
            }
        });

        // 監聽鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (this.isActive && e.key === 'Delete' && this.selectedImage) {
                this.deleteSelectedImage();
            }
        });

        // 監聽滑鼠事件
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    activate() {
        this.isActive = true;
        console.log('圖片工具已啟動');
        
        // 更新並顯示所有圖片的控制項
        this.images.forEach(image => {
            this.updateControlPositions(image);
            this.showImageControls(image);
        });
    }

    deactivate() {
        this.isActive = false;
        this.selectedImage = null;
        console.log('圖片工具已停用');
        
        // 隱藏所有控制項
        this.images.forEach(image => {
            this.hideImageControls(image);
        });
    }

    handleCanvasClick(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有圖片上
        const clickedImage = this.getImageAtPosition(x, y);
        
        if (clickedImage) {
            this.selectImage(clickedImage);
        } else {
            // 在空白處點擊，插入新圖片
            this.createImage(x, y);
        }
    }

    createImage(x, y) {
        // 彈出對話框讓使用者選擇圖片來源
        const choice = confirm('點擊「確定」上傳圖片檔案\n點擊「取消」輸入圖片網址');
        
        if (choice) {
            // 上傳檔案
            this.uploadImageFile(x, y);
        } else {
            // 輸入 URL
            this.inputImageURL(x, y);
        }
    }

    uploadImageFile(x, y) {
        // 建立檔案輸入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.createImageContainer(event.target.result, x, y, file.name);
                };
                reader.readAsDataURL(file);
            }
            // 清理檔案輸入元素
            document.body.removeChild(fileInput);
        });
        
        // 暫時新增到 DOM 並觸發點擊
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    inputImageURL(x, y) {
        const url = prompt('請輸入圖片網址:');
        if (!url) return;

        // 簡單驗證圖片 URL
        if (!this.isValidImageURL(url)) {
            alert('無效的圖片網址格式');
            return;
        }

        this.createImageContainer(url, x, y, '網路圖片');
    }

    isValidImageURL(url) {
        // 檢查是否為有效的 URL 格式
        try {
            new URL(url);
            return true;
        } catch {
            // 檢查是否以常見圖片格式結尾
            return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url);
        }
    }

    createImageContainer(src, x, y, name) {
        // 建立主容器
        const container = document.createElement('div');
        container.className = 'image-container';
        container.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${this.defaultWidth}px;
            height: ${this.defaultHeight}px;
            border: 2px solid #6366f1;
            border-radius: 8px;
            overflow: hidden;
            cursor: move;
            z-index: 50;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        // 建立圖片元素
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: auto;
        `;
        
        // 處理圖片載入錯誤
        img.onerror = () => {
            console.error('圖片載入失敗:', src);
            // 顯示錯誤佔位符
            container.innerHTML = `
                <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f3f4f6;
                    color: #6b7280;
                    font-size: 14px;
                ">圖片載入失敗</div>
            `;
        };

        container.appendChild(img);

        // 建立控制項
        this.createImageControls(container);

        // 儲存相關資料
        container.imageSrc = src;
        container.imageName = name;

        // 新增到頁面和陣列
        document.body.appendChild(container);
        this.images.push(container);
        
        // 選中新建立的圖片
        this.selectImage(container);
        
        console.log(`建立圖片: ${name} 於位置 (${x}, ${y})`);
    }

    createImageControls(container) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = '移動圖片';
        moveBtn.className = 'move-handle image-control-btn';
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #6366f1;
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
            this.selectedImage = container;
            this.selectImage(container);

            const rect = container.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // 暫時禁用圖片的指標事件以便拖曳
            const img = container.querySelector('img');
            if (img) {
                img.style.pointerEvents = 'none';
            }
            e.preventDefault();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '刪除圖片';
        deleteBtn.className = 'image-control-btn';
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
            this.deleteImage(container);
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle image-control-btn';
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
            this.selectedImage = container;
            this.resizeHandle = resizeHandle;
            this.selectImage(container);
            e.preventDefault();
        });

        // 將控制項新增到 document.body（不是容器內部）
        document.body.appendChild(moveBtn);
        document.body.appendChild(deleteBtn);
        document.body.appendChild(resizeHandle);

        // 儲存控制項參考（用於顯示/隱藏和位置更新）
        container.moveBtn = moveBtn;
        container.deleteBtn = deleteBtn;
        container.resizeHandle = resizeHandle;

        // 初始位置更新
        this.updateControlPositions(container);
    }

    updateControlPositions(container) {
        if (!container.moveBtn || !container.deleteBtn || !container.resizeHandle) return;

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

    selectImage(image) {
        // 取消之前的選擇
        if (this.selectedImage) {
            this.selectedImage.style.border = '2px solid #6366f1';
        }

        // 選中新圖片
        this.selectedImage = image;
        image.style.border = '2px solid #ef4444';
        
        // 更新控制項位置並顯示
        this.updateControlPositions(image);
        this.showImageControls(image);
    }

    showImageControls(image) {
        if (image.moveBtn) image.moveBtn.style.opacity = '1';
        if (image.deleteBtn) image.deleteBtn.style.opacity = '1';
        if (image.resizeHandle) image.resizeHandle.style.opacity = '1';
    }

    hideImageControls(image) {
        if (image.moveBtn) image.moveBtn.style.opacity = '0';
        if (image.deleteBtn) image.deleteBtn.style.opacity = '0';
        if (image.resizeHandle) image.resizeHandle.style.opacity = '0';
    }

    getImageAtPosition(x, y) {
        for (const image of this.images) {
            const rect = image.getBoundingClientRect();
            const canvasRect = document.getElementById('whiteboard').getBoundingClientRect();
            
            const imageX = rect.left - canvasRect.left;
            const imageY = rect.top - canvasRect.top;
            const imageRight = imageX + rect.width;
            const imageBottom = imageY + rect.height;

            if (x >= imageX && x <= imageRight && y >= imageY && y <= imageBottom) {
                return image;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        if (!this.isActive) return;

        const target = e.target;
        
        // 如果點擊的是圖片控制按鈕，讓按鈕自己的事件處理器處理
        if (target.classList.contains('image-control-btn')) {
            return;
        }

        // 檢查是否點擊刪除按鈕
        if (target.title === '刪除圖片') {
            return; // 讓按鈕事件正常處理
        }

        // 檢查是否點擊圖片容器（用於選中）
        const imageContainer = target.closest('.image-container');
        if (imageContainer && this.images.includes(imageContainer)) {
            // 只是選中圖片，不開始拖曳（拖曳由移動按鈕處理）
            this.selectImage(imageContainer);
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (!this.isActive) return;

        if (this.isResizing && this.selectedImage) {
            const rect = this.selectedImage.getBoundingClientRect();
            const canvasRect = document.getElementById('whiteboard').getBoundingClientRect();
            
            // 計算相對於畫布的新尺寸
            const newWidth = Math.max(this.minWidth, e.clientX - rect.left);
            const newHeight = Math.max(this.minHeight, e.clientY - rect.top);

            this.selectedImage.style.width = newWidth + 'px';
            this.selectedImage.style.height = newHeight + 'px';
            
            // 更新控制項位置
            this.updateControlPositions(this.selectedImage);
            
        } else if (this.isDragging && this.selectedImage) {
            const canvasRect = document.getElementById('whiteboard').getBoundingClientRect();
            const newX = e.clientX - canvasRect.left - this.dragOffset.x;
            const newY = e.clientY - canvasRect.top - this.dragOffset.y;

            this.selectedImage.style.left = Math.max(0, newX) + 'px';
            this.selectedImage.style.top = Math.max(0, newY) + 'px';
            
            // 更新控制項位置
            this.updateControlPositions(this.selectedImage);
        }
    }

    handleMouseUp(e) {
        if (this.isDragging && this.selectedImage) {
            // 重新啟用圖片的指標事件
            const img = this.selectedImage.querySelector('img');
            if (img) {
                img.style.pointerEvents = 'auto';
            }
        }

        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    deleteImage(image) {
        const index = this.images.indexOf(image);
        if (index > -1) {
            this.images.splice(index, 1);
        }

        if (this.selectedImage === image) {
            this.selectedImage = null;
        }

        // 刪除控制項
        if (image.moveBtn) image.moveBtn.remove();
        if (image.deleteBtn) image.deleteBtn.remove();
        if (image.resizeHandle) image.resizeHandle.remove();

        // 刪除圖片容器
        image.remove();
        console.log('圖片已刪除');
    }

    deleteSelectedImage() {
        if (this.selectedImage) {
            this.deleteImage(this.selectedImage);
        }
    }

    // 清理所有圖片
    clearAllImages() {
        this.images.forEach(image => {
            // 刪除控制項
            if (image.moveBtn) image.moveBtn.remove();
            if (image.deleteBtn) image.deleteBtn.remove();
            if (image.resizeHandle) image.resizeHandle.remove();
            // 刪除圖片容器
            image.remove();
        });
        this.images = [];
        this.selectedImage = null;
    }

    // 獲取所有圖片資料（用於儲存/載入）
    getImagesData() {
        return this.images.map(image => ({
            src: image.imageSrc,
            name: image.imageName,
            x: parseInt(image.style.left),
            y: parseInt(image.style.top),
            width: parseInt(image.style.width),
            height: parseInt(image.style.height)
        }));
    }

    // 載入圖片資料
    loadImagesData(imagesData) {
        this.clearAllImages();
        
        imagesData.forEach(data => {
            const container = this.createImageContainer(data.src, data.x, data.y, data.name);
            container.style.width = data.width + 'px';
            container.style.height = data.height + 'px';
        });
    }

    // 直接建立圖片（新增方法）
    createImageDirectly(x, y) {
        // 彈出對話框讓使用者選擇圖片來源
        const choice = confirm('點擊「確定」上傳圖片檔案\n點擊「取消」輸入圖片網址');
        
        if (choice) {
            // 上傳檔案
            this.uploadImageFile(x, y);
        } else {
            // 輸入 URL
            this.inputImageURL(x, y);
        }
        
        console.log('直接建立圖片於位置:', x, y);
    }

    // 隱藏所有圖片控制項（新增方法）
    hideAllControls() {
        this.images.forEach(image => {
            this.hideImageControls(image);
        });
        this.selectedImage = null;
    }
} 