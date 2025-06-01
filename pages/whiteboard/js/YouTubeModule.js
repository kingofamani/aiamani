// YouTube 影片模組 - 繼承自 BaseControlModule
class YouTubeModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        // 配置選項
        const config = {
            defaultWidth: 320,
            defaultHeight: 180,
            minWidth: 160,
            minHeight: 90,
            moveButtonColor: '#3b82f6',
            deleteButtonColor: '#ef4444',
            resizeButtonColor: '#3b82f6',
            borderColor: '#3b82f6',
            toolName: 'YouTube影片'
        };
        
        super(canvasModule, backgroundModule, appInstance, config);
    }

    // 實現基礎類別要求的 createElement 方法
    createElement(x, y) {
        return this.createYouTubeVideo(x, y);
    }

    createYouTubeVideo(x, y) {
        // 彈出對話框讓使用者輸入 YouTube URL
        const url = prompt('請輸入 YouTube 影片網址:');
        if (!url) return;

        // 解析 YouTube URL 獲取影片 ID
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            alert('無效的 YouTube 網址，請確認網址格式正確');
            return;
        }

        // 建立影片容器
        const videoContainer = this.createVideoContainer(videoId, x, y);
        
        // 選中新建立的影片
        this.selectElement(videoContainer);
        
        console.log(`建立 YouTube 影片: ${videoId} 於位置 (${x}, ${y})`);
        return videoContainer;
    }

    extractVideoId(url) {
        // 支援多種 YouTube URL 格式
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    createVideoContainer(videoId, x, y) {
        const videoContainerId = `youtube-${this.nextId++}`;
        
        // 建立主容器
        const container = document.createElement('div');
        container.id = videoContainerId;
        container.className = 'youtube-video-container';
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

        // 建立 iframe
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            pointer-events: auto;
        `;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        container.appendChild(iframe);

        // 建立統一控制項（使用基礎類別的方法）
        this.createElementControls(container);

        // 儲存相關資料
        container.videoId = videoId;

        // 新增到頁面和陣列
        this.elements.push(container);
        document.body.appendChild(container);

        console.log('YouTube影片已建立:', videoContainerId);
        return container;
    }

    // 覆寫基礎類別的縮放處理
    handleResize(e) {
        const rect = this.selectedElement.getBoundingClientRect();
        const deltaX = e.clientX - rect.left;
        const deltaY = e.clientY - rect.top;
        
        // 保持 16:9 的比例
        const newWidth = Math.max(this.config.minWidth, deltaX);
        const newHeight = Math.max(this.config.minHeight, newWidth * 9 / 16); // 保持 16:9 比例
        
        this.selectedElement.style.width = newWidth + 'px';
        this.selectedElement.style.height = newHeight + 'px';
        
        this.updateControlPositions(this.selectedElement);
    }

    // 直接建立YouTube影片（用於app.js調用）
    createVideoDirectly(x, y) {
        return this.createYouTubeVideo(x, y);
    }

    // 清空所有影片
    clearAllVideos() {
        this.clearAllElements();
    }

    // 獲取影片資料
    getVideosData() {
        return this.elements.map(video => ({
            id: video.id,
            videoId: video.videoId,
            x: parseInt(video.style.left),
            y: parseInt(video.style.top),
            width: parseInt(video.style.width),
            height: parseInt(video.style.height)
        }));
    }

    // 載入影片資料
    loadVideosData(videosData) {
        this.clearAllVideos();
        videosData.forEach(data => {
            const container = this.createVideoContainer(data.videoId, data.x, data.y);
            if (container) {
                container.style.width = data.width + 'px';
                container.style.height = data.height + 'px';
            }
        });
    }

    // 獲取影片在指定位置（保持向後兼容）
    getVideoAtPosition(x, y) {
        return this.getElementAtPosition(x, y);
    }

    // 選中影片（保持向後兼容）
    selectVideo(videoContainer) {
        this.selectElement(videoContainer);
    }

    // 顯示/隱藏影片控制項（保持向後兼容）
    showVideoControls(videoContainer) {
        this.showElementControls(videoContainer);
    }

    hideVideoControls(videoContainer) {
        this.hideElementControls(videoContainer);
    }

    // 刪除影片（保持向後兼容）
    deleteVideo(videoContainer) {
        this.deleteElement(videoContainer);
    }

    deleteSelectedVideo() {
        this.deleteSelectedElement();
    }

    // 獲取所有影片（保持向後兼容）
    get youtubeVideos() {
        return this.elements;
    }

    get selectedVideo() {
        return this.selectedElement;
    }

    set selectedVideo(value) {
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
     * 覆寫：匯出 YouTube 影片資料
     */
    exportElementData(element) {
        const baseData = super.exportElementData(element);
        const iframe = element.querySelector('iframe');
        
        return {
            ...baseData,
            videoId: element.videoId || '',
            src: iframe ? iframe.src : ''
        };
    }

    /**
     * 覆寫：匯入 YouTube 影片資料
     */
    importElementData(elementData) {
        if (elementData.videoId) {
            const video = this.createVideoContainer(elementData.videoId, elementData.x, elementData.y);
            
            if (video && elementData.width && elementData.height) {
                video.style.width = elementData.width + 'px';
                video.style.height = elementData.height + 'px';
            }
            
            if (elementData.id) {
                video.id = elementData.id;
            }
        }
    }
} 