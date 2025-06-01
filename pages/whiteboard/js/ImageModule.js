// 圖片模組 - 繼承自 BaseControlModule
class ImageModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        // 配置選項
        const config = {
            defaultWidth: 300,
            defaultHeight: 200,
            minWidth: 100,
            minHeight: 100,
            moveButtonColor: '#6366f1',
            deleteButtonColor: '#ef4444',
            resizeButtonColor: '#3b82f6',
            borderColor: '#6366f1',
            toolName: '圖片'
        };
        
        super(canvasModule, backgroundModule, appInstance, config);
    }

    // 實現基礎類別要求的 createElement 方法
    createElement(x, y) {
        return this.createImage(x, y);
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
        const imageId = `image-${this.nextId++}`;
        
        // 建立主容器
        const container = document.createElement('div');
        container.id = imageId;
        container.className = 'image-container';
        container.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${this.config.defaultWidth}px;
            height: ${this.config.defaultHeight}px;
            border: 2px solid ${this.config.borderColor};
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

        // 建立統一控制項（使用基礎類別的方法）
        this.createElementControls(container);

        // 儲存相關資料
        container.imageSrc = src;
        container.imageName = name;

        // 新增到頁面和陣列
        this.elements.push(container);
        document.body.appendChild(container);

        // 選中新建立的圖片
        this.selectElement(container);
        
        console.log('圖片已建立:', imageId);
        return container;
    }

    // 覆寫基礎類別的縮放處理
    handleResize(e) {
        const rect = this.selectedElement.getBoundingClientRect();
        const deltaX = e.clientX - rect.left;
        const deltaY = e.clientY - rect.top;
        
        // 保持圖片比例或自由縮放
        const newWidth = Math.max(this.config.minWidth, deltaX);
        const newHeight = Math.max(this.config.minHeight, deltaY);
        
        this.selectedElement.style.width = newWidth + 'px';
        this.selectedElement.style.height = newHeight + 'px';
        
        this.updateControlPositions(this.selectedElement);
    }

    // 直接建立圖片（用於app.js調用）
    createImageDirectly(x, y) {
        return this.createImage(x, y);
    }

    // 清空所有圖片
    clearAllImages() {
        this.clearAllElements();
    }

    // 獲取圖片資料
    getImagesData() {
        return this.elements.map(image => ({
            id: image.id,
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
            this.createImageContainer(data.src, data.x, data.y, data.name);
            const lastImage = this.elements[this.elements.length - 1];
            if (lastImage) {
                lastImage.style.width = data.width + 'px';
                lastImage.style.height = data.height + 'px';
            }
        });
    }

    // 獲取圖片在指定位置（保持向後兼容）
    getImageAtPosition(x, y) {
        return this.getElementAtPosition(x, y);
    }

    // 選中圖片（保持向後兼容）
    selectImage(imageContainer) {
        this.selectElement(imageContainer);
    }

    // 顯示/隱藏圖片控制項（保持向後兼容）
    showImageControls(imageContainer) {
        this.showElementControls(imageContainer);
    }

    hideImageControls(imageContainer) {
        this.hideElementControls(imageContainer);
    }

    // 刪除圖片（保持向後兼容）
    deleteImage(imageContainer) {
        this.deleteElement(imageContainer);
    }

    deleteSelectedImage() {
        this.deleteSelectedElement();
    }

    // 獲取所有圖片（保持向後兼容）
    get images() {
        return this.elements;
    }

    get selectedImage() {
        return this.selectedElement;
    }

    set selectedImage(value) {
        this.selectedElement = value;
    }

    // 保持向後兼容的屬性名稱
    get isActive() {
        return this.active;
    }

    set isActive(value) {
        this.active = value;
    }

    /**
     * 覆寫：匯出圖片資料
     */
    exportElementData(element) {
        const baseData = super.exportElementData(element);
        const img = element.querySelector('img');
        
        return {
            ...baseData,
            src: element.imageSrc || (img ? img.src : ''),
            name: element.imageName || '圖片',
            data: img ? img.src : '' // Base64 或 URL
        };
    }

    /**
     * 覆寫：匯入圖片資料
     */
    importElementData(elementData) {
        if (elementData.src || elementData.data) {
            const image = this.createImageContainer(
                elementData.src || elementData.data, 
                elementData.x, 
                elementData.y, 
                elementData.name || '圖片'
            );
            
            if (image && elementData.width && elementData.height) {
                image.style.width = elementData.width + 'px';
                image.style.height = elementData.height + 'px';
            }
            
            if (elementData.id) {
                image.id = elementData.id;
            }
        }
    }
} 