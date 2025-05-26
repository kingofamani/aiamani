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
        this.messageArea = document.getElementById('messageArea');
        
        // 遊戲狀態
        this.gameState = 'waiting'; // waiting, playing, victory
        this.animationId = null;
        
        // 感測器數據
        this.sensorData = {
            gamma: 0, // 左右傾斜 (-90 到 90)
            beta: 0,  // 前後傾斜 (-180 到 180)
            isActive: false
        };
        
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
        this.updateMessage('請將設備橫放並鎖定螢幕方向，然後點擊「開始遊戲」。');
        
        // 檢查設備支援
        this.checkDeviceSupport();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 視窗大小改變時重新調整畫布
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
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
            this.checkBoundaryCollisions();
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
        
        // 固定為橫屏操作 (左轉橫屏模式)
        // beta 控制左右 (X軸)，-gamma 控制上下 (Y軸)
        const sensitivity = 0.15;
        let forceX = this.sensorData.beta * sensitivity;  // beta 的值對應 X 軸
        let forceY = -this.sensorData.gamma * sensitivity; // gamma 的負值對應 Y 軸
        
        // 更新速度
        this.ball.vx += forceX;
        this.ball.vy += forceY;
        
        // 應用摩擦力
        this.ball.vx *= this.ball.friction;
        this.ball.vy *= this.ball.friction;
        
        // 限制最大速度
        this.ball.vx = Math.max(-this.ball.maxSpeed, Math.min(this.ball.maxSpeed, this.ball.vx));
        this.ball.vy = Math.max(-this.ball.maxSpeed, Math.min(this.ball.maxSpeed, this.ball.vy));
        
        // 潛在的下一步位置
        let potentialX = this.ball.x + this.ball.vx;
        let potentialY = this.ball.y + this.ball.vy;
        
        // 檢查 X 軸移動和碰撞
        if (this.canMoveTo(potentialX, this.ball.y)) {
            this.ball.x = potentialX;
        } else {
            this.ball.vx = 0; // 撞牆則停止 X 軸速度
        }
        
        // 檢查 Y 軸移動和碰撞 (使用更新後的 X 軸位置 this.ball.x)
        if (this.canMoveTo(this.ball.x, potentialY)) {
            this.ball.y = potentialY;
        } else {
            this.ball.vy = 0; // 撞牆則停止 Y 軸速度
        }
    }
    
    canMoveTo(x, y) {
        const epsilon = 0.001; // 用於處理浮點數邊界問題
        const ballLeft = x - this.ball.radius;
        const ballRight = x + this.ball.radius - epsilon; // 減去 epsilon
        const ballTop = y - this.ball.radius;
        const ballBottom = y + this.ball.radius - epsilon; // 減去 epsilon
        
        // 轉換為迷宮座標
        const leftCol = Math.floor(ballLeft / this.cellSize);
        const rightCol = Math.floor(ballRight / this.cellSize);
        const topRow = Math.floor(ballTop / this.cellSize);
        const bottomRow = Math.floor(ballBottom / this.cellSize);
        
        // 檢查是否超出迷宮陣列邊界
        if (leftCol < 0 || rightCol >= this.maze[0].length || 
            topRow < 0 || bottomRow >= this.maze.length) {
            // 如果預期移動位置會使球的任何部分超出迷宮格子定義範圍，則視為不可移動
            // 這可以防止球進入未定義的迷宮區域，效果類似於邊界牆
            return false; 
        }
        
        // 檢查牆壁碰撞
        for (let row = topRow; row <= bottomRow; row++) {
            for (let col = leftCol; col <= rightCol; col++) {
                // 再次確認 row 和 col 在迷宮範圍內 (雖然上面的檢查應該已經涵蓋)
                if (row >= 0 && row < this.maze.length && 
                    col >= 0 && col < this.maze[0].length &&
                    this.maze[row][col] === 1) { // 1 代表牆壁
                    return false; // 撞到牆壁
                }
            }
        }
        
        return true; // 此路徑沒有牆壁
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