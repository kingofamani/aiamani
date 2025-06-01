/**
 * ProjectUI - 專案管理使用者介面
 * 負責專案的啟動畫面、新增對話框、專案選擇器等介面
 */
class ProjectUI {
    constructor(projectManager, saveLoadModule) {
        this.projectManager = projectManager;
        this.saveLoadModule = saveLoadModule;
        this.currentModal = null;
        this.init();
    }

    init() {
        this.createStyles();
        this.createStartupScreen();
    }

    /**
     * 建立樣式
     */
    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .project-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .project-modal.show {
                opacity: 1;
            }

            .project-modal-content {
                background: white;
                border-radius: 12px;
                padding: 32px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }

            .project-modal.show .project-modal-content {
                transform: translateY(0);
            }

            .project-header {
                text-align: center;
                margin-bottom: 32px;
            }

            .project-title {
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 8px;
            }

            .project-subtitle {
                font-size: 16px;
                color: #6b7280;
            }

            .project-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 32px;
            }

            .project-btn {
                padding: 20px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
                font-size: 16px;
                font-weight: 500;
                color: #374151;
            }

            .project-btn:hover {
                border-color: #3b82f6;
                background: #f8fafc;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }

            .project-btn.primary {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }

            .project-btn.primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }

            .project-btn-icon {
                font-size: 24px;
                margin-bottom: 8px;
                display: block;
            }

            .project-list {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .project-item {
                padding: 16px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: background 0.2s ease;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .project-item:hover {
                background: #f8fafc;
            }

            .project-item:last-child {
                border-bottom: none;
            }

            .project-thumbnail {
                width: 60px;
                height: 40px;
                background: #f3f4f6;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                object-fit: cover;
            }

            .project-info {
                flex: 1;
            }

            .project-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .project-meta {
                font-size: 12px;
                color: #6b7280;
            }

            .project-actions {
                display: flex;
                gap: 8px;
            }

            .project-action-btn {
                padding: 6px 8px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .project-action-btn:hover {
                background: #f3f4f6;
            }

            .project-action-btn.delete {
                color: #dc2626;
                border-color: #dc2626;
            }

            .project-action-btn.delete:hover {
                background: #fef2f2;
            }

            .project-form {
                margin-bottom: 24px;
            }

            .project-form-group {
                margin-bottom: 20px;
            }

            .project-label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }

            .project-input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                font-size: 16px;
                transition: border-color 0.2s ease;
            }

            .project-input:focus {
                outline: none;
                border-color: #3b82f6;
            }

            .project-textarea {
                resize: vertical;
                min-height: 80px;
            }

            .project-form-buttons {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .project-cancel-btn {
                padding: 10px 20px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .project-cancel-btn:hover {
                background: #f3f4f6;
            }

            .project-save-btn {
                padding: 10px 20px;
                border: 2px solid #3b82f6;
                border-radius: 6px;
                background: #3b82f6;
                color: white;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .project-save-btn:hover {
                background: #2563eb;
                border-color: #2563eb;
            }

            .project-save-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .project-toolbar-info {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #6b7280;
            }

            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #6b7280;
            }

            .empty-state-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 建立啟動畫面
     */
    createStartupScreen() {
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
            <div class="project-modal-content">
                <div class="project-header">
                    <h1 class="project-title">Web 教學白板</h1>
                    <p class="project-subtitle">選擇或建立一個專案來開始使用</p>
                </div>
                
                <div class="project-buttons">
                    <button class="project-btn primary" onclick="projectUI.showNewProjectDialog()">
                        <span class="project-btn-icon">🆕</span>
                        新增專案
                    </button>
                    <button class="project-btn" onclick="projectUI.showProjectList()">
                        <span class="project-btn-icon">📁</span>
                        開啟專案
                    </button>
                    <button class="project-btn" onclick="projectUI.importProject()">
                        <span class="project-btn-icon">📂</span>
                        匯入專案
                    </button>
                    <button class="project-btn" onclick="projectUI.createQuickProject()">
                        <span class="project-btn-icon">⚡</span>
                        快速開始
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // 添加事件監聽器
        modal.addEventListener('click', (e) => {
            // 點擊背景不關閉啟動畫面，因為這是必要的選擇
            // 但可以添加一些視覺回饋
        });
        
        // 防止對話框內容區域點擊事件冒泡
        modal.querySelector('.project-modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 顯示動畫
        setTimeout(() => modal.classList.add('show'), 100);
    }

    /**
     * 顯示新增專案對話框
     */
    showNewProjectDialog() {
        this.hideCurrentModal();
        
        setTimeout(() => {
            const modal = document.createElement('div');
            modal.className = 'project-modal';
            modal.innerHTML = `
                <div class="project-modal-content">
                    <div class="project-header">
                        <h1 class="project-title">新增專案</h1>
                        <p class="project-subtitle">建立一個新的教學白板專案</p>
                    </div>
                    
                    <form class="project-form" onsubmit="projectUI.handleNewProject(event)">
                        <div class="project-form-group">
                            <label class="project-label" for="projectName">專案名稱</label>
                            <input 
                                type="text" 
                                id="projectName" 
                                class="project-input" 
                                placeholder="輸入專案名稱..."
                                required
                                maxlength="50"
                            >
                        </div>
                        
                        <div class="project-form-group">
                            <label class="project-label" for="projectDescription">專案描述</label>
                            <textarea 
                                id="projectDescription" 
                                class="project-input project-textarea" 
                                placeholder="輸入專案描述（選填）..."
                                maxlength="200"
                            ></textarea>
                        </div>
                        
                        <div class="project-form-buttons">
                            <button type="button" class="project-cancel-btn" onclick="projectUI.showStartupScreen()">
                                取消
                            </button>
                            <button type="submit" class="project-save-btn">
                                建立專案
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.currentModal = modal;
            
            // 添加事件監聽器
            modal.addEventListener('click', (e) => {
                // 點擊背景關閉對話框
                if (e.target === modal) {
                    this.showStartupScreen();
                }
            });
            
            // 防止對話框內容區域點擊事件冒泡
            modal.querySelector('.project-modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            setTimeout(() => {
                modal.classList.add('show');
                modal.querySelector('#projectName').focus();
            }, 100);
        }, 350); // 等待前一個模態框完全關閉
    }

    /**
     * 處理新增專案
     */
    handleNewProject(event) {
        event.preventDefault();
        
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        
        if (!name) {
            alert('請輸入專案名稱');
            return;
        }
        
        // 建立新專案
        const project = this.projectManager.createProject(name, description);
        if (project) {
            this.hideCurrentModal();
            this.startProject(project);
        }
    }

    /**
     * 顯示專案列表
     */
    showProjectList() {
        // 先隱藏當前模態框，等待動畫完成後再顯示新的
        this.hideCurrentModal();
        
        setTimeout(() => {
            const projects = this.projectManager.getProjectsList();
            console.log('載入專案列表:', projects); // 調試訊息
            
            const modal = document.createElement('div');
            modal.className = 'project-modal';
            modal.innerHTML = `
                <div class="project-modal-content">
                    <div class="project-header">
                        <h1 class="project-title">選擇專案</h1>
                        <p class="project-subtitle">從現有專案中選擇一個開啟</p>
                    </div>
                    
                    <div class="project-list">
                        ${projects.length > 0 ? 
                            projects.map(project => this.renderProjectItem(project)).join('') :
                            '<div class="empty-state"><div class="empty-state-icon">📝</div><p>尚無任何專案<br>請建立您的第一個專案</p></div>'
                        }
                    </div>
                    
                    <div class="project-form-buttons">
                        <button type="button" class="project-cancel-btn" onclick="projectUI.showStartupScreen()">
                            返回
                        </button>
                        <button type="button" class="project-save-btn" onclick="projectUI.showNewProjectDialog()">
                            新增專案
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.currentModal = modal;
            
            // 添加事件監聽器
            modal.addEventListener('click', (e) => {
                // 點擊背景關閉對話框
                if (e.target === modal) {
                    this.showStartupScreen();
                }
            });
            
            // 防止對話框內容區域點擊事件冒泡
            modal.querySelector('.project-modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // 顯示動畫
            setTimeout(() => {
                modal.classList.add('show');
                console.log('專案列表對話框已顯示'); // 調試訊息
            }, 100);
        }, 350); // 等待前一個模態框完全關閉
    }

    /**
     * 渲染專案項目
     */
    renderProjectItem(project) {
        const date = new Date(project.updatedAt).toLocaleDateString('zh-TW');
        const time = new Date(project.updatedAt).toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="project-item" onclick="projectUI.openProject('${project.id}')">
                ${project.thumbnail ? 
                    `<img src="${project.thumbnail}" class="project-thumbnail" alt="專案縮圖">` :
                    '<div class="project-thumbnail"></div>'
                }
                <div class="project-info">
                    <div class="project-name">${this.escapeHtml(project.name)}</div>
                    <div class="project-meta">
                        ${project.description ? this.escapeHtml(project.description) + ' • ' : ''}
                        ${date} ${time}
                    </div>
                </div>
                <div class="project-actions">
                    <button class="project-action-btn" onclick="event.stopPropagation(); projectUI.exportProject('${project.id}')" title="匯出">
                        📤
                    </button>
                    <button class="project-action-btn delete" onclick="event.stopPropagation(); projectUI.deleteProject('${project.id}')" title="刪除">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 開啟專案
     */
    openProject(projectId) {
        const project = this.projectManager.loadProject(projectId);
        if (project) {
            this.hideCurrentModal();
            this.startProject(project);
        }
    }

    /**
     * 刪除專案
     */
    deleteProject(projectId) {
        const project = this.projectManager.projects.find(p => p.id === projectId);
        if (project && confirm(`確定要刪除專案「${project.name}」嗎？此操作無法復原。`)) {
            this.projectManager.deleteProject(projectId);
            this.showProjectList(); // 重新整理列表
        }
    }

    /**
     * 匯出專案
     */
    exportProject(projectId) {
        const project = this.projectManager.projects.find(p => p.id === projectId);
        if (project) {
            const projectData = this.projectManager.exportProject(projectId);
            if (projectData) {
                this.saveLoadModule.exportToFile(project.name, JSON.parse(projectData));
            }
        }
    }

    /**
     * 匯入專案
     */
    importProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const projectData = await this.saveLoadModule.importFromFile(file);
                    if (this.projectManager.importProject(JSON.stringify(projectData))) {
                        alert('專案匯入成功！');
                        this.showProjectList();
                    } else {
                        alert('專案匯入失敗，請檢查檔案格式。');
                    }
                } catch (error) {
                    alert('專案匯入失敗：' + error.message);
                }
            }
        };
        
        input.click();
    }

    /**
     * 快速開始（建立臨時專案）
     */
    createQuickProject() {
        const project = this.projectManager.createProject('快速專案 ' + new Date().toLocaleString('zh-TW'));
        this.hideCurrentModal();
        this.startProject(project);
    }

    /**
     * 開始專案
     */
    startProject(project) {
        console.log('開始專案:', project);
        
        // 載入專案資料
        if (project.data) {
            this.saveLoadModule.importAllData(project.data);
        }
        
        // 顯示專案資訊到工具列
        this.showProjectInfo(project);
        
        // 啟動自動儲存
        this.projectManager.startAutoSave(() => {
            this.saveCurrentProject();
        });
        
        // 觸發專案開始事件（如果有需要）
        if (window.app && window.app.onProjectStarted) {
            window.app.onProjectStarted(project);
        }
    }

    /**
     * 儲存當前專案
     */
    saveCurrentProject() {
        const project = this.projectManager.getCurrentProject();
        if (project) {
            const projectData = this.saveLoadModule.exportAllData();
            const thumbnail = this.saveLoadModule.generateThumbnail();
            const success = this.projectManager.saveCurrentProject(projectData, thumbnail);
            
            // 顯示儲存結果 toast
            if (success) {
                this.showToast('專案儲存成功！', 'success');
            } else {
                this.showToast('專案儲存失敗，請重試', 'error');
            }
        }
    }

    /**
     * 顯示專案資訊
     */
    showProjectInfo(project) {
        // 檢查是否已經有專案資訊元素
        let projectInfo = document.getElementById('project-info');
        if (!projectInfo) {
            // 建立專案資訊元素
            projectInfo = document.createElement('div');
            projectInfo.id = 'project-info';
            projectInfo.className = 'project-toolbar-info';
            
            // 插入到工具列中（假設工具列在 #toolbar）
            const toolbar = document.getElementById('toolbar');
            if (toolbar) {
                toolbar.appendChild(projectInfo);
            } else {
                // 如果沒有找到工具列，建立一個簡單的顯示區域
                projectInfo.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 8px 12px;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                `;
                document.body.appendChild(projectInfo);
            }
        }
        
        projectInfo.innerHTML = `
            <span>📝 ${this.escapeHtml(project.name)}</span>
            <button onclick="projectUI.saveCurrentProject()" style="
                margin-left: 8px;
                padding: 4px 8px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-size: 12px;
            ">💾 儲存</button>
            <button onclick="projectUI.showStartupScreen()" style="
                margin-left: 4px;
                padding: 4px 8px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-size: 12px;
            ">📁 專案</button>
        `;
    }

    /**
     * 隱藏當前模態框
     */
    hideCurrentModal() {
        if (this.currentModal) {
            const modalToRemove = this.currentModal;
            this.currentModal = null; // 立即清空引用，避免競態條件
            
            modalToRemove.classList.remove('show');
            setTimeout(() => {
                if (modalToRemove.parentNode) {
                    modalToRemove.parentNode.removeChild(modalToRemove);
                }
            }, 300);
        }
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
     * 顯示啟動畫面（公開方法）
     */
    showStartupScreen() {
        this.hideCurrentModal();
        this.createStartupScreen();
    }

    /**
     * 顯示 Toast 通知
     * @param {string} message - 通知訊息
     * @param {string} type - 通知類型 ('success', 'error', 'warning', 'info')
     */
    showToast(message, type = 'info') {
        // 移除現有的 toast
        const existingToast = document.getElementById('project-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 建立 toast 元素
        const toast = document.createElement('div');
        toast.id = 'project-toast';
        toast.className = `project-toast ${type}`;
        
        // 根據類型設定顏色
        const colors = {
            success: '#10b981', // 綠色
            error: '#ef4444',   // 紅色
            warning: '#f59e0b', // 橙色
            info: '#3b82f6'     // 藍色
        };
        
        const bgColors = {
            success: '#f0fdf4', // 淺綠色
            error: '#fef2f2',   // 淺紅色
            warning: '#fffbeb', // 淺橙色
            info: '#eff6ff'     // 淺藍色
        };

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColors[type] || bgColors.info};
            color: ${colors[type] || colors.info};
            border: 1px solid ${colors[type] || colors.info};
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        toast.textContent = message;
        document.body.appendChild(toast);

        // 顯示動畫
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // 3秒後自動隱藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 匯出模組
window.ProjectUI = ProjectUI; 