// 便條紙模組 - 繼承自 BaseControlModule
class NotesModule extends BaseControlModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        // 配置選項
        const config = {
            defaultWidth: 120,
            defaultHeight: 80,
            minWidth: 80,
            minHeight: 60,
            moveButtonColor: '#f59e0b',
            deleteButtonColor: '#ef4444',
            resizeButtonColor: '#3b82f6',
            borderColor: '#f59e0b',
            toolName: '便條紙'
        };
        
        super(canvasModule, backgroundModule, appInstance, config);
    }

    // 實現基礎類別要求的 createElement 方法
    createElement(x, y) {
        return this.createNote(x, y);
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
            width: ${this.config.defaultWidth}px;
            height: ${this.config.defaultHeight}px;
            background-color: #ffeb3b;
            border: 2px solid ${this.config.borderColor};
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
                this.deleteElement(noteContainer);
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

        // 建立統一控制項（使用基礎類別的方法）
        this.createElementControls(noteContainer);

        // 添加到陣列和頁面
        this.elements.push(noteContainer);
        document.body.appendChild(noteContainer);

        // 選中新便條紙並聚焦文字區域
        this.selectElement(noteContainer);
        setTimeout(() => {
            textarea.focus();
        }, 100);

        console.log('便條紙已建立:', noteId);
        return noteContainer;
    }

    // 覆寫基礎類別的縮放處理
    handleResize(e) {
        const rect = this.selectedElement.getBoundingClientRect();
        const deltaX = e.clientX - rect.left;
        const deltaY = e.clientY - rect.top;
        
        const newWidth = Math.max(this.config.minWidth, deltaX);
        const newHeight = Math.max(this.config.minHeight, deltaY);
        
        this.selectedElement.style.width = newWidth + 'px';
        this.selectedElement.style.height = newHeight + 'px';
        
        // 調整字體大小以適應新尺寸
        const textarea = this.selectedElement.querySelector('.note-text');
        const scaleFactor = Math.min(newWidth / this.config.defaultWidth, newHeight / this.config.defaultHeight);
        const newFontSize = Math.max(10, 12 * scaleFactor);
        textarea.style.fontSize = newFontSize + 'px';
        
        this.updateControlPositions(this.selectedElement);
    }

    // 直接建立便條紙（用於app.js調用）
    createNoteDirectly(x, y) {
        return this.createNote(x, y);
    }

    // 清空所有便條紙
    clearAllNotes() {
        this.clearAllElements();
    }

    // 獲取便條紙在指定位置（保持向後兼容）
    getNoteAtPosition(x, y) {
        return this.getElementAtPosition(x, y);
    }

    // 選中便條紙（保持向後兼容）
    selectNote(noteContainer) {
        this.selectElement(noteContainer);
    }

    // 顯示/隱藏便條紙控制項（保持向後兼容）
    showNoteControls(noteContainer) {
        this.showElementControls(noteContainer);
    }

    hideNoteControls(noteContainer) {
        this.hideElementControls(noteContainer);
    }

    // 刪除便條紙（保持向後兼容）
    deleteNote(noteContainer) {
        this.deleteElement(noteContainer);
    }

    deleteSelectedNote() {
        this.deleteSelectedElement();
    }

    // 獲取所有便條紙（保持向後兼容）
    get notes() {
        return this.elements;
    }

    get selectedNote() {
        return this.selectedElement;
    }

    set selectedNote(value) {
        this.selectedElement = value;
    }

    /**
     * 覆寫：匯出便條紙元素資料
     * @param {HTMLElement} element - 便條紙元素
     * @returns {Object} 便條紙資料
     */
    exportElementData(element) {
        const baseData = super.exportElementData(element);
        const textarea = element.querySelector('.note-text');
        
        return {
            ...baseData,
            text: textarea ? textarea.value : '',
            backgroundColor: element.style.backgroundColor || '#ffeb3b',
            fontSize: textarea ? parseInt(textarea.style.fontSize) || 12 : 12
        };
    }

    /**
     * 覆寫：匯入便條紙元素資料
     * @param {Object} elementData - 便條紙資料
     */
    importElementData(elementData) {
        const note = this.createNote(elementData.x, elementData.y);
        
        if (note && elementData) {
            // 設定尺寸
            if (elementData.width && elementData.height) {
                note.style.width = elementData.width + 'px';
                note.style.height = elementData.height + 'px';
            }
            
            // 設定背景顏色
            if (elementData.backgroundColor) {
                note.style.backgroundColor = elementData.backgroundColor;
            }
            
            // 設定文字內容和字體大小
            const textarea = note.querySelector('.note-text');
            if (textarea) {
                if (elementData.text) {
                    textarea.value = elementData.text;
                }
                if (elementData.fontSize) {
                    textarea.style.fontSize = elementData.fontSize + 'px';
                }
            }
            
            // 設定 ID
            if (elementData.id) {
                note.id = elementData.id;
            }
        }
    }
} 