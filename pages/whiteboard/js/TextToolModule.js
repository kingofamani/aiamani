class TextToolModule {
    constructor(canvasModule, backgroundModule, appInstance) {
        this.canvasModule = canvasModule;
        this.backgroundModule = backgroundModule;
        this.app = appInstance; // To access global app state if needed, like current color
        this.canvas = this.canvasModule.getCanvasElement();
        this.active = false;
        this.textarea = null;

        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleTextareaBlur = this.handleTextareaBlur.bind(this);
    }

    activate() {
        this.active = true;
        this.canvas.style.cursor = 'text';
        // Add a specific event listener for text tool clicks
        this.canvas.addEventListener('click', this.handleCanvasClick);
        console.log('Text tool activated');
    }

    deactivate() {
        this.active = false;
        this.canvas.style.cursor = 'crosshair'; // Or whatever the default cursor is
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        if (this.textarea) {
            document.body.removeChild(this.textarea);
            this.textarea = null;
        }
        console.log('Text tool deactivated');
    }

    handleCanvasClick(e) {
        if (!this.active) return;

        // If a textarea already exists, finalize it before creating a new one
        if (this.textarea) {
            this.finalizeText();
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.createTextarea(x, y);
    }

    createTextarea(x, y) {
        this.textarea = document.createElement('textarea');
        this.textarea.style.position = 'absolute';
        this.textarea.style.left = `${x + this.canvas.offsetLeft}px`;
        this.textarea.style.top = `${y + this.canvas.offsetTop}px`;
        this.textarea.style.border = '1px dashed #ccc';
        this.textarea.style.outline = 'none';
        this.textarea.style.padding = '2px';
        this.textarea.style.fontSize = '16px'; // Can be dynamic later
        this.textarea.style.fontFamily = 'Arial'; // Can be dynamic later
        this.textarea.style.color = this.canvasModule.currentColor; // Use current pen color for text
        this.textarea.style.background = 'transparent';
        this.textarea.style.zIndex = '100'; // Ensure it's above canvas
        this.textarea.style.resize = 'none'; // 防止調整大小
        this.textarea.style.overflow = 'hidden'; // 隱藏滾動條
        this.textarea.value = '';
        
        document.body.appendChild(this.textarea);
        this.textarea.focus();

        this.textarea.addEventListener('blur', this.handleTextareaBlur);
        
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 防止換行
                this.textarea.blur(); // 觸發 blur 事件，由 handleTextareaBlur 統一處理 finalizeText
            }
            if (e.key === 'Escape') {
                this.cancelText(); // Escape 直接取消
            }
        });

        // 自動調整 textarea 大小
        this.textarea.addEventListener('input', () => {
            this.textarea.style.height = 'auto';
            this.textarea.style.height = this.textarea.scrollHeight + 'px';
            this.textarea.style.width = 'auto';
            this.textarea.style.width = Math.max(100, this.textarea.scrollWidth) + 'px';
        });
    }

    handleTextareaBlur() {
        if (this.textarea) {
            this.finalizeText();
        }
    }

    finalizeText() {
        if (!this.textarea) {
            console.log('finalizeText: textarea is null, returning.');
            return;
        }

        const textValue = this.textarea.value;
        console.log('finalizeText: textarea value:', textValue);

        if (!textValue.trim()) {
            console.log('finalizeText: text value is empty, calling cancelText.');
            this.cancelText();
            return;
        }

        console.log('finalizeText: proceeding to add text to history.');

        const text = textValue;
        const textareaRect = this.textarea.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = textareaRect.left - canvasRect.left;
        const y = textareaRect.top - canvasRect.top;
        
        const color = this.canvasModule.currentColor;
        const fontSize = parseInt(this.textarea.style.fontSize, 10);
        const fontFamily = this.textarea.style.fontFamily.replace(/['"]/g, '');
        const font = `${fontSize}px ${fontFamily}`;
        const adjustedY = y + fontSize;

        console.log('Text details:', { text, x, y: adjustedY, color, font });

        this.canvasModule.addTextToHistory(text, x, adjustedY, color, font);
        console.log('Drawing history after addTextToHistory:', JSON.parse(JSON.stringify(this.canvasModule.drawingHistory))); // Deep copy for logging

        this.backgroundModule.drawBackground();
        console.log('finalizeText: Background drawn.');
        this.canvasModule.redrawAllContent();
        console.log('finalizeText: All content redrawn.');

        if (this.textarea && this.textarea.parentNode === document.body) {
            document.body.removeChild(this.textarea);
        }
        this.textarea = null;
    }
    
    cancelText() {
        if (!this.textarea) return;
        
        if (this.textarea.parentNode === document.body) {
            document.body.removeChild(this.textarea);
        }
        this.textarea = null;
    }
} 