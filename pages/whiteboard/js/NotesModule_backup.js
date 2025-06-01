class NotesModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance;
        this.canvas = this.canvasModule.getCanvasElement();
        this.active = false;
        this.notes = []; // 儲存所有便條紙DOM元素
        this.nextId = 1; // 便條紙 ID 計數器
        this.selectedNote = null; // 當前選中的便條紙
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;

        // 預設設定
        this.defaultWidth = 120;
        this.defaultHeight = 80;
        this.minWidth = 80;
        this.minHeight = 60;

        // 綁定事件處理函數
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.bindEvents();
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
            if (this.active && e.key === 'Delete' && this.selectedNote) {
                this.deleteSelectedNote();
            }
        });

        // 監聽滑鼠事件
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    activate() {
        this.active = true;
        this.canvas.style.cursor = 'crosshair';
        console.log('Notes tool activated');
        
        // 顯示所有便條紙的控制項
        this.notes.forEach(note => {
            this.updateControlPositions(note);
            this.showNoteControls(note);
        });
    }

    deactivate() {
        this.active = false;
        this.canvas.style.cursor = 'default';
        this.selectedNote = null;
        this.isDragging = false;
        this.isResizing = false;
        console.log('Notes tool deactivated');
        
        // 隱藏所有控制項
        this.notes.forEach(note => {
            this.hideNoteControls(note);
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 檢查是否點擊在現有便條紙上
        const clickedNote = this.getNoteAtPosition(x, y);
        
        if (clickedNote) {
            this.selectNote(clickedNote);
        } else {
            // 點擊空白區域，新增便條紙
            this.createNote(x, y);
        }
    }

    createNote(x, y) {
        const noteId = `note-${this.nextId++}`;
        
        // 建立便條紙容器
        const noteContainer = document.createElement('div');
        noteContainer.id = noteId;
        noteContainer.className = 'note-container';
        noteContainer.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${this.defaultWidth}px;
            height: ${this.defaultHeight}px;
            background-color: #ffeb3b;
            border: 2px solid #f59e0b;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            cursor: move;
            user-select: none;
            z-index: 50;
            font-family: Arial, sans-serif;
            font-size: 12px;
            padding: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        `;

        // 建立文字區域
        const textarea = document.createElement('textarea');
        textarea.className = 'note-text';
        textarea.placeholder = '輸入文字...';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            background: transparent;
            resize: none;
            font-family: inherit;
            font-size: inherit;
            text-align: center;
            overflow: hidden;
        `;

        // 設定文字區域事件
        textarea.addEventListener('blur', () => {
            if (!textarea.value.trim()) {
                this.deleteNote(noteContainer);
            }
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textarea.blur();
            }
            if (e.key === 'Escape') {
                textarea.blur();
            }
        });

        noteContainer.appendChild(textarea);

        // 建立控制項
        this.createNoteControls(noteContainer);

        // 添加到陣列和頁面
        this.notes.push(noteContainer);
        document.body.appendChild(noteContainer);

        // 選中新便條紙並聚焦文字區域
        this.selectNote(noteContainer);
        setTimeout(() => {
            textarea.focus();
        }, 100);

        console.log('便條紙已建立:', noteId);
        return noteContainer;
    }

    createNoteControls(noteContainer) {
        // 移動按鈕（左上角）
        const moveBtn = document.createElement('button');
        moveBtn.innerHTML = '✋';
        moveBtn.title = '移動便條紙';
        moveBtn.className = 'move-handle note-control-btn';
        moveBtn.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: #f59e0b;
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
            this.selectedNote = noteContainer;
            this.selectNote(noteContainer);

            const rect = noteContainer.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            e.preventDefault();
        });

        // 刪除按鈕（右上角）
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '刪除便條紙';
        deleteBtn.className = 'note-control-btn';
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
            this.deleteNote(noteContainer);
        });

        // 縮放控制點（右下角）
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle note-control-btn';
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
            this.selectedNote = noteContainer;
            this.resizeHandle = resizeHandle;
            this.selectNote(noteContainer);
            e.preventDefault();
        });

        // 將控制項新增到 document.body
        document.body.appendChild(moveBtn);
        document.body.appendChild(deleteBtn);
        document.body.appendChild(resizeHandle);

        // 儲存控制項參考
        noteContainer.moveBtn = moveBtn;
        noteContainer.deleteBtn = deleteBtn;
        noteContainer.resizeHandle = resizeHandle;

        // 初始位置更新
        this.updateControlPositions(noteContainer);
    }

    updateControlPositions(noteContainer) {
        if (!noteContainer.moveBtn) return;

        const rect = noteContainer.getBoundingClientRect();
        
        // 移動按鈕位置（左上角）
        noteContainer.moveBtn.style.left = (rect.left - 15) + 'px';
        noteContainer.moveBtn.style.top = (rect.top - 15) + 'px';
        
        // 刪除按鈕位置（右上角）
        noteContainer.deleteBtn.style.left = (rect.right - 15) + 'px';
        noteContainer.deleteBtn.style.top = (rect.top - 15) + 'px';
        
        // 縮放控制點位置（右下角）
        noteContainer.resizeHandle.style.left = (rect.right - 15) + 'px';
        noteContainer.resizeHandle.style.top = (rect.bottom - 15) + 'px';
    }

    selectNote(noteContainer) {
        // 取消之前的選擇
        if (this.selectedNote && this.selectedNote !== noteContainer) {
            this.selectedNote.style.border = '2px solid #f59e0b';
        }
        
        // 設定新的選擇
        this.selectedNote = noteContainer;
        noteContainer.style.border = '3px solid #ef4444';
        
        // 更新控制項位置並顯示
        this.updateControlPositions(noteContainer);
        this.showNoteControls(noteContainer);
        
        console.log('便條紙已選中:', noteContainer.id);
    }

    showNoteControls(noteContainer) {
        if (!noteContainer.moveBtn) return;
        
        noteContainer.moveBtn.style.opacity = '1';
        noteContainer.deleteBtn.style.opacity = '1';
        noteContainer.resizeHandle.style.opacity = '1';
    }

    hideNoteControls(noteContainer) {
        if (!noteContainer.moveBtn) return;
        
        noteContainer.moveBtn.style.opacity = '0';
        noteContainer.deleteBtn.style.opacity = '0';
        noteContainer.resizeHandle.style.opacity = '0';
    }

    getNoteAtPosition(x, y) {
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            const rect = note.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            // 轉換為相對於畫布的座標
            const relativeX = x + canvasRect.left;
            const relativeY = y + canvasRect.top;
            
            if (relativeX >= rect.left && relativeX <= rect.right &&
                relativeY >= rect.top && relativeY <= rect.bottom) {
                return note;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        // 處理控制按鈕的拖曳邏輯已在按鈕事件中處理
    }

    handleMouseMove(e) {
        if (!this.active) return;

        if (this.isDragging && this.selectedNote) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            this.selectedNote.style.left = newX + 'px';
            this.selectedNote.style.top = newY + 'px';
            this.updateControlPositions(this.selectedNote);
        } else if (this.isResizing && this.selectedNote) {
            const rect = this.selectedNote.getBoundingClientRect();
            const newWidth = Math.max(this.minWidth, e.clientX - rect.left);
            const newHeight = Math.max(this.minHeight, e.clientY - rect.top);
            
            this.selectedNote.style.width = newWidth + 'px';
            this.selectedNote.style.height = newHeight + 'px';
            this.updateControlPositions(this.selectedNote);
        }
    }

    handleMouseUp(e) {
        if (!this.active) return;

        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    deleteNote(noteContainer) {
        // 從陣列中移除
        const index = this.notes.findIndex(note => note === noteContainer);
        if (index !== -1) {
            this.notes.splice(index, 1);
        }

        // 移除控制按鈕
        if (noteContainer.moveBtn && noteContainer.moveBtn.parentNode) {
            noteContainer.moveBtn.parentNode.removeChild(noteContainer.moveBtn);
        }
        if (noteContainer.deleteBtn && noteContainer.deleteBtn.parentNode) {
            noteContainer.deleteBtn.parentNode.removeChild(noteContainer.deleteBtn);
        }
        if (noteContainer.resizeHandle && noteContainer.resizeHandle.parentNode) {
            noteContainer.resizeHandle.parentNode.removeChild(noteContainer.resizeHandle);
        }

        // 移除便條紙本身
        if (noteContainer.parentNode) {
            noteContainer.parentNode.removeChild(noteContainer);
        }

        // 清除選擇
        if (this.selectedNote === noteContainer) {
            this.selectedNote = null;
        }

        console.log('便條紙已刪除:', noteContainer.id);
    }

    deleteSelectedNote() {
        if (this.selectedNote) {
            this.deleteNote(this.selectedNote);
        }
    }

    // 清空所有便條紙
    clearAllNotes() {
        [...this.notes].forEach(note => {
            this.deleteNote(note);
        });
        this.notes = [];
    }

    // 直接建立便條紙（新增方法）
    createNoteDirectly(x, y) {
        // 直接建立便條紙
        const noteContainer = this.createNote(x, y);
        
        console.log('直接建立便條紙於位置:', x, y);
        return noteContainer;
    }

    // 隱藏所有便條紙控制項（新增方法）
    hideAllControls() {
        this.notes.forEach(note => {
            this.hideNoteControls(note);
        });
        this.selectedNote = null;
    }
} 