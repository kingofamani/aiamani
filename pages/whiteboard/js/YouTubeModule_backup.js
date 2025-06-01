class YouTubeModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        this.isActive = false;
        this.youtubeVideos = []; // 儲存所有 YouTube 影片
        this.selectedVideo = null; // 當前選中的影片
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        
        // 預設設定
        this.defaultWidth = 320;
        this.defaultHeight = 180;
        this.minWidth = 160;
        this.minHeight = 90;
        
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
            if (this.isActive && e.key === 'Delete' && this.selectedVideo) {
                this.deleteSelectedVideo();
            }
        });

        // 監聽滑鼠事件
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    activate() {
        this.isActive = true;
        console.log('YouTube 工具已啟動');
        
        // 更新並顯示所有 YouTube 影片的控制項
        this.youtubeVideos.forEach(video => {
            this.updateControlPositions(video);
            this.showVideoControls(video);
        });
    }

    deactivate() {
        this.isActive = false;
        this.selectedVideo = null;
        console.log('YouTube 工具已停用');
        
        // 隱藏所有控制項
        this.youtubeVideos.forEach(video => {
            this.hideVideoControls(video);
        });
    }

    handleCanvasClick(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有影片上
        const clickedVideo = this.getVideoAtPosition(x, y);
        
        if (clickedVideo) {
            this.selectVideo(clickedVideo);
        } else {
            // 在空白處點擊，建立新的 YouTube 影片
            this.createYouTubeVideo(x, y);
        }
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
        this.youtubeVideos.push(videoContainer);
        
        // 選中新建立的影片
        this.selectVideo(videoContainer);
        
        console.log(`建立 YouTube 影片: ${videoId} 於位置 (${x}, ${y})`);
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
        // 建立主容器
        const container = document.createElement('div');
        container.className = 'youtube-video-container';
        container.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${this.defaultWidth}px;
            height: ${this.defaultHeight}px;
            border: 2px solid #3b82f6;
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

        // 建立控制項
        this.createVideoControls(container);

        // 儲存相關資料
        container.videoId = videoId;

        // 新增到頁面
        document.body.appendChild(container);

        return container;
    }

    createVideoControls(container) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = '移動影片';
        moveBtn.className = 'move-handle youtube-control-btn';
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #3b82f6;
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
            this.selectedVideo = container;
            this.selectVideo(container);

            const rect = container.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // 暫時禁用 iframe 的指標事件以便拖曳
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'none';
            }
            e.preventDefault();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '刪除影片';
        deleteBtn.className = 'youtube-control-btn';
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
            this.deleteVideo(container);
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle youtube-control-btn';
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
            this.selectedVideo = container;
            this.resizeHandle = resizeHandle;
            this.selectVideo(container);
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

    selectVideo(video) {
        // 取消之前的選擇
        if (this.selectedVideo) {
            this.selectedVideo.style.border = '2px solid #3b82f6';
        }

        // 選中新影片
        this.selectedVideo = video;
        video.style.border = '2px solid #ef4444';
        
        // 更新控制項位置並顯示
        this.updateControlPositions(video);
        this.showVideoControls(video);
    }

    showVideoControls(video) {
        if (video.moveBtn) video.moveBtn.style.opacity = '1';
        if (video.deleteBtn) video.deleteBtn.style.opacity = '1';
        if (video.resizeHandle) video.resizeHandle.style.opacity = '1';
    }

    hideVideoControls(video) {
        if (video.moveBtn) video.moveBtn.style.opacity = '0';
        if (video.deleteBtn) video.deleteBtn.style.opacity = '0';
        if (video.resizeHandle) video.resizeHandle.style.opacity = '0';
    }

    deleteVideo(video) {
        const index = this.youtubeVideos.indexOf(video);
        if (index > -1) {
            this.youtubeVideos.splice(index, 1);
        }

        if (this.selectedVideo === video) {
            this.selectedVideo = null;
        }

        // 刪除控制項
        if (video.moveBtn) video.moveBtn.remove();
        if (video.deleteBtn) video.deleteBtn.remove();
        if (video.resizeHandle) video.resizeHandle.remove();

        // 刪除影片容器
        video.remove();
        console.log('YouTube 影片已刪除');
    }

    deleteSelectedVideo() {
        if (this.selectedVideo) {
            this.deleteVideo(this.selectedVideo);
        }
    }

    getVideoAtPosition(x, y) {
        for (const video of this.youtubeVideos) {
            const rect = video.getBoundingClientRect();
            const canvasRect = document.getElementById('whiteboard').getBoundingClientRect();
            
            const videoX = rect.left - canvasRect.left;
            const videoY = rect.top - canvasRect.top;
            const videoRight = videoX + rect.width;
            const videoBottom = videoY + rect.height;

            if (x >= videoX && x <= videoRight && y >= videoY && y <= videoBottom) {
                return video;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        if (!this.isActive) return;

        const target = e.target;
        
        // 如果點擊的是 YouTube 控制按鈕，讓按鈕自己的事件處理器處理
        if (target.classList.contains('youtube-control-btn')) {
            return;
        }

        // 檢查是否點擊刪除按鈕
        if (target.title === '刪除影片') {
            return; // 讓按鈕事件正常處理
        }

        // 檢查是否點擊影片容器（用於選中）
        const videoContainer = target.closest('.youtube-video-container');
        if (videoContainer && this.youtubeVideos.includes(videoContainer)) {
            // 只是選中影片，不開始拖曳（拖曳由移動按鈕處理）
            this.selectVideo(videoContainer);
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (!this.isActive) return;

        if (this.isResizing && this.selectedVideo) {
            const rect = this.selectedVideo.getBoundingClientRect();
            const canvasRect = document.getElementById('whiteboard').getBoundingClientRect();
            
            // 計算相對於畫布的新尺寸
            const newWidth = Math.max(this.minWidth, e.clientX - rect.left);
            const newHeight = Math.max(this.minHeight, e.clientY - rect.top);

            this.selectedVideo.style.width = newWidth + 'px';
            this.selectedVideo.style.height = newHeight + 'px';
            
            // 更新控制項位置
            this.updateControlPositions(this.selectedVideo);
            
        } else if (this.isDragging && this.selectedVideo) {
            const canvasRect = document.getElementById('whiteboard').getBoundingClientRect();
            const newX = e.clientX - canvasRect.left - this.dragOffset.x;
            const newY = e.clientY - canvasRect.top - this.dragOffset.y;

            this.selectedVideo.style.left = Math.max(0, newX) + 'px';
            this.selectedVideo.style.top = Math.max(0, newY) + 'px';
            
            // 更新控制項位置
            this.updateControlPositions(this.selectedVideo);
        }
    }

    handleMouseUp(e) {
        if (this.isDragging && this.selectedVideo) {
            // 重新啟用 iframe 的指標事件
            const iframe = this.selectedVideo.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'auto';
            }
        }

        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    // 清理所有 YouTube 影片
    clearAllVideos() {
        this.youtubeVideos.forEach(video => {
            // 刪除控制項
            if (video.moveBtn) video.moveBtn.remove();
            if (video.deleteBtn) video.deleteBtn.remove();
            if (video.resizeHandle) video.resizeHandle.remove();
            // 刪除影片容器
            video.remove();
        });
        this.youtubeVideos = [];
        this.selectedVideo = null;
    }

    // 獲取所有影片資料（用於儲存/載入）
    getVideosData() {
        return this.youtubeVideos.map(video => ({
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
            container.style.width = data.width + 'px';
            container.style.height = data.height + 'px';
        });
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

    // 直接建立YouTube影片（新增方法）
    createVideoDirectly(x, y) {
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
        this.youtubeVideos.push(videoContainer);
        
        console.log(`直接建立 YouTube 影片: ${videoId} 於位置 (${x}, ${y})`);
        return videoContainer;
    }

    // 隱藏所有YouTube影片控制項（新增方法）
    hideAllControls() {
        this.youtubeVideos.forEach(video => {
            this.hideVideoControls(video);
        });
        this.selectedVideo = null;
    }
} 