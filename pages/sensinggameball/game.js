// 遊戲主類別
class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameMessage = document.getElementById('gameMessage');
        this.sensorStatus = document.getElementById('sensorStatus');
        this.tiltX = document.getElementById('tiltX');
        this.tiltY = document.getElementById('tiltY');
        this.screenOrientationDisplay = document.getElementById('screenOrientation');
        this.messageArea = document.getElementById('messageArea');
        
        // 遊戲狀態
        this.gameState = 'waiting'; // waiting, playing, victory
        this.animationId = null;
        this.isManualOrientation = false; // 新增手動方向標誌
        
        // 感測器數據
        this.sensorData = {
            gamma: 0, // 左右傾斜 (-90 到 90)
            beta: 0,  // 前後傾斜 (-180 到 180)
            isActive: false
        };
        
        // 螢幕方向
        this.screenOrientation = 0; // 0=豎屏, 90=左轉, -90=右轉, 180=倒轉
        
        // 小球屬性
        this.ball = {
            x: 30,
            y: 30,
            radius: 8,
            vx: 0,
            vy: 0,
            maxSpeed: 3,
            friction: 0.95
        };
        
        // 迷宮設計 (1=牆壁, 0=路徑, 2=終點)
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
            [1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
            [1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.cellSize = 25; // 每個迷宮格子的大小
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        this.drawGame();
        
        // 檢查設備支援
        this.checkDeviceSupport();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 手動方向校正按鈕
        document.getElementById('orientationPortrait').addEventListener('click', () => this.setManualOrientation(0));
        document.getElementById('orientationLandscapeLeft').addEventListener('click', () => this.setManualOrientation(90));
        document.getElementById('orientationLandscapeRight').addEventListener('click', () => this.setManualOrientation(-90));
        document.getElementById('orientationPortraitUpsideDown').addEventListener('click', () => this.setManualOrientation(180));
        
        // 視窗大小改變時重新調整畫布
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // 視窗大小改變時也檢查方向
            this.updateScreenOrientation();
        });
        
        // 監聽螢幕方向變化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateScreenOrientation();
                this.resizeCanvas();
            }, 100);
        });
        
        // 監聽 screen.orientation 變化 (現代瀏覽器)
        if (screen.orientation && screen.orientation.addEventListener) {
            screen.orientation.addEventListener('change', () => {
                this.updateScreenOrientation();
            });
        }
        
        // 初始化螢幕方向
        this.updateScreenOrientation();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 40, 400);
        const maxHeight = Math.min(window.innerHeight * 0.6, 400);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // 重新計算格子大小
        this.cellSize = Math.min(maxWidth / this.maze[0].length, maxHeight / this.maze.length);
        
        this.drawGame();
    }
    
    updateScreenOrientation() {
        if (this.isManualOrientation) {
            // 如果是手動模式，則不進行自動偵測
            this.updateOrientationButtons(); // 確保按鈕狀態正確
            return;
        }

        let orientation = 0;
        let orientationText = '豎屏';
        
        // 方法1: 使用 screen.orientation (現代瀏覽器)
        if (screen.orientation && screen.orientation.angle !== undefined) {
            orientation = screen.orientation.angle;
        }
        // 方法2: 使用 window.orientation (較舊的API)
        else if (window.orientation !== undefined) {
            orientation = window.orientation;
        }
        // 方法3: 使用視窗尺寸判斷 (備用方案)
        else {
            const width = window.innerWidth;
            const height = window.innerHeight;
            if (width > height) {
                // 橫屏，但無法確定是左轉還是右轉，預設為右轉
                orientation = -90;
            } else {
                orientation = 0;
            }
        }
        
        // 標準化角度值
        switch (orientation) {
            case 0:
                orientationText = '豎屏';
                break;
            case 90:
                orientationText = '左轉橫屏';
                break;
            case -90:
            case 270:
                orientation = -90; // 統一為 -90
                orientationText = '右轉橫屏';
                break;
            case 180:
                orientationText = '倒轉豎屏';
                break;
            default:
                orientationText = `未知(${orientation}°)`;
        }
        
        this.screenOrientation = orientation;
        
        // 更新顯示
        if (this.screenOrientationDisplay) {
            this.screenOrientationDisplay.textContent = `${orientation}° (${orientationText})`;
        }
        
        console.log('螢幕方向偵測:', {
            angle: orientation,
            text: orientationText,
            screenOrientation: screen.orientation,
            windowOrientation: window.orientation,
            windowSize: `${window.innerWidth}x${window.innerHeight}`
        });
        
        // 更新按鈕狀態
        this.updateOrientationButtons();
    }
    
    setManualOrientation(angle) {
        this.isManualOrientation = true; // 設定為手動模式
        this.screenOrientation = angle;
        
        let orientationText;
        switch (angle) {
            case 0: orientationText = '豎屏'; break;
            case 90: orientationText = '左轉橫屏'; break;
            case -90: orientationText = '右轉橫屏'; break;
            case 180: orientationText = '倒轉豎屏'; break;
        }
        
        // 更新顯示
        if (this.screenOrientationDisplay) {
            this.screenOrientationDisplay.textContent = `${angle}° (${orientationText}) [手動]`;
        }
        
        // 更新按鈕狀態
        this.updateOrientationButtons();
        
        console.log('手動設定螢幕方向:', angle, orientationText);
    }
    
    updateOrientationButtons() {
        // 移除所有按鈕的 active 狀態
        document.querySelectorAll('.btn-small').forEach(btn => btn.classList.remove('active'));
        
        // 根據當前方向設定對應按鈕為 active
        let activeButtonId;
        switch (this.screenOrientation) {
            case 0: activeButtonId = 'orientationPortrait'; break;
            case 90: activeButtonId = 'orientationLandscapeLeft'; break;
            case -90: activeButtonId = 'orientationLandscapeRight'; break;
            case 180: activeButtonId = 'orientationPortraitUpsideDown'; break;
        }
        
        if (activeButtonId) {
            const activeButton = document.getElementById(activeButtonId);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }
    }
    
    checkDeviceSupport() {
        if (typeof DeviceMotionEvent !== 'undefined') {
            this.updateMessage('設備支援感測器，點擊開始遊戲！');
        } else {
            this.updateMessage('此設備不支援動作感測器，請使用支援的平板或手機');
            this.startBtn.disabled = true;
        }
    }
    
    async startGame() {
        try {
            this.updateMessage('正在啟動感測器...');
            this.startBtn.disabled = true;
            
            // 請求感測器權限
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const permission = await DeviceMotionEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('感測器權限被拒絕');
                }
            }
            
            // 啟動感測器監聽
            this.startSensorListening();
            
            // 重置遊戲狀態
            this.resetBall();
            this.gameState = 'playing';
            this.updateMessage('遊戲開始！傾斜設備來控制小球移動');
            this.messageArea.classList.remove('victory');
            
            // 開始遊戲循環
            this.gameLoop();
            
        } catch (error) {
            console.error('啟動遊戲失敗:', error);
            this.updateMessage('無法啟動感測器，請確認設備支援並允許權限');
            this.startBtn.disabled = false;
        }
    }
    
    startSensorListening() {
        window.addEventListener('deviceorientation', (event) => {
            this.sensorData.gamma = event.gamma || 0; // 左右傾斜
            this.sensorData.beta = event.beta || 0;   // 前後傾斜
            this.sensorData.isActive = true;
            
            // 更新顯示
            this.sensorStatus.textContent = '已啟動';
            this.tiltX.textContent = Math.round(this.sensorData.gamma);
            this.tiltY.textContent = Math.round(this.sensorData.beta);
        });
        
        // 備用：使用 devicemotion 事件
        window.addEventListener('devicemotion', (event) => {
            if (event.accelerationIncludingGravity) {
                const acc = event.accelerationIncludingGravity;
                // 將加速度轉換為傾斜角度（簡化計算）
                this.sensorData.gamma = Math.atan2(acc.x, acc.z) * (180 / Math.PI);
                this.sensorData.beta = Math.atan2(acc.y, acc.z) * (180 / Math.PI);
                this.sensorData.isActive = true;
            }
        });
    }
    
    restartGame() {
        this.resetBall();
        this.gameState = 'playing';
        this.updateMessage('遊戲重新開始！');
        this.messageArea.classList.remove('victory');
        
        if (!this.animationId) {
            this.gameLoop();
        }
    }
    
    resetBall() {
        this.ball.x = 30;
        this.ball.y = 30;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.updateBall();
            this.checkCollisions();
            this.checkVictory();
        }
        
        this.drawGame();
        
        if (this.gameState === 'playing') {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        } else {
            this.animationId = null;
        }
    }
    
    updateBall() {
        if (!this.sensorData.isActive) return;
        
        // 將感測器數據轉換為移動力量，並根據螢幕方向調整
        const sensitivity = 0.15;
        let forceX, forceY;
        
        // 根據螢幕方向調整控制方向
        switch (this.screenOrientation) {
            case 0: // 豎屏
                forceX = this.sensorData.gamma * sensitivity;
                forceY = this.sensorData.beta * sensitivity;
                break;
            case 90: // 左轉橫屏
                forceX = -this.sensorData.beta * sensitivity;
                forceY = this.sensorData.gamma * sensitivity;
                break;
            case -90: // 右轉橫屏
                forceX = this.sensorData.beta * sensitivity;
                forceY = -this.sensorData.gamma * sensitivity;
                break;
            case 180: // 倒轉豎屏
                forceX = -this.sensorData.gamma * sensitivity;
                forceY = -this.sensorData.beta * sensitivity;
                break;
            default: // 預設豎屏
                forceX = this.sensorData.gamma * sensitivity;
                forceY = this.sensorData.beta * sensitivity;
        }
        
        // 更新速度
        this.ball.vx += forceX;
        this.ball.vy += forceY;
        
        // 限制最大速度
        this.ball.vx = Math.max(-this.ball.maxSpeed, Math.min(this.ball.maxSpeed, this.ball.vx));
        this.ball.vy = Math.max(-this.ball.maxSpeed, Math.min(this.ball.maxSpeed, this.ball.vy));
        
        // 應用摩擦力
        this.ball.vx *= this.ball.friction;
        this.ball.vy *= this.ball.friction;
        
        // 更新位置
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
    }
    
    checkCollisions() {
        // 計算小球的下一個位置
        const nextX = this.ball.x + this.ball.vx;
        const nextY = this.ball.y + this.ball.vy;
        
        // 分別檢查 X 和 Y 方向的碰撞
        const canMoveX = this.canMoveTo(nextX, this.ball.y);
        const canMoveY = this.canMoveTo(this.ball.x, nextY);
        
        // 如果 X 方向碰撞，停止 X 方向移動
        if (!canMoveX) {
            this.ball.vx = 0;
        }
        
        // 如果 Y 方向碰撞，停止 Y 方向移動
        if (!canMoveY) {
            this.ball.vy = 0;
        }
        
        // 檢查邊界碰撞
        this.checkBoundaryCollisions();
    }
    
    canMoveTo(x, y) {
        const ballLeft = x - this.ball.radius;
        const ballRight = x + this.ball.radius;
        const ballTop = y - this.ball.radius;
        const ballBottom = y + this.ball.radius;
        
        // 轉換為迷宮座標
        const leftCol = Math.floor(ballLeft / this.cellSize);
        const rightCol = Math.floor(ballRight / this.cellSize);
        const topRow = Math.floor(ballTop / this.cellSize);
        const bottomRow = Math.floor(ballBottom / this.cellSize);
        
        // 檢查邊界
        if (leftCol < 0 || rightCol >= this.maze[0].length || 
            topRow < 0 || bottomRow >= this.maze.length) {
            return false;
        }
        
        // 檢查牆壁碰撞
        for (let row = topRow; row <= bottomRow; row++) {
            for (let col = leftCol; col <= rightCol; col++) {
                if (row >= 0 && row < this.maze.length && 
                    col >= 0 && col < this.maze[0].length &&
                    this.maze[row][col] === 1) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    checkBoundaryCollisions() {
        const minX = this.ball.radius;
        const maxX = this.canvas.width - this.ball.radius;
        const minY = this.ball.radius;
        const maxY = this.canvas.height - this.ball.radius;
        
        // 邊界碰撞處理
        if (this.ball.x <= minX) {
            this.ball.x = minX;
            this.ball.vx = Math.abs(this.ball.vx) * 0.3; // 輕微反彈
        }
        if (this.ball.x >= maxX) {
            this.ball.x = maxX;
            this.ball.vx = -Math.abs(this.ball.vx) * 0.3; // 輕微反彈
        }
        if (this.ball.y <= minY) {
            this.ball.y = minY;
            this.ball.vy = Math.abs(this.ball.vy) * 0.3; // 輕微反彈
        }
        if (this.ball.y >= maxY) {
            this.ball.y = maxY;
            this.ball.vy = -Math.abs(this.ball.vy) * 0.3; // 輕微反彈
        }
    }
    
    checkVictory() {
        const ballCenterCol = Math.floor(this.ball.x / this.cellSize);
        const ballCenterRow = Math.floor(this.ball.y / this.cellSize);
        
        if (this.maze[ballCenterRow] && this.maze[ballCenterRow][ballCenterCol] === 2) {
            this.gameState = 'victory';
            this.updateMessage('🎉 恭喜！您成功完成迷宮挑戰！');
            this.messageArea.classList.add('victory');
            this.startBtn.disabled = false;
        }
    }
    
    drawGame() {
        // 清除畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製迷宮
        this.drawMaze();
        
        // 繪製小球
        this.drawBall();
    }
    
    drawMaze() {
        for (let row = 0; row < this.maze.length; row++) {
            for (let col = 0; col < this.maze[row].length; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                if (this.maze[row][col] === 1) {
                    // 繪製牆壁
                    this.ctx.fillStyle = '#2d3748';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    
                    // 添加邊框效果
                    this.ctx.strokeStyle = '#4a5568';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                } else if (this.maze[row][col] === 2) {
                    // 繪製終點
                    this.ctx.fillStyle = '#48bb78';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    
                    // 添加終點標記
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = `${this.cellSize * 0.6}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('🏁', x + this.cellSize/2, y + this.cellSize/2);
                }
            }
        }
    }
    
    drawBall() {
        // 繪製小球陰影
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x + 2, this.ball.y + 2, this.ball.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();
        
        // 繪製小球主體
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, 2 * Math.PI);
        
        // 創建漸層效果
        const gradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ee5a52');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 添加邊框
        this.ctx.strokeStyle = '#c53030';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 添加高光效果
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 2, this.ball.y - 2, this.ball.radius * 0.3, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
    }
    
    updateMessage(message) {
        this.gameMessage.textContent = message;
    }
}

// 當頁面載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    const game = new MazeGame();
});

// 處理頁面可見性變化（當用戶切換分頁時暫停遊戲）
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 頁面隱藏時可以暫停遊戲
        console.log('遊戲暫停');
    } else {
        // 頁面重新可見時恢復遊戲
        console.log('遊戲恢復');
    }
}); 