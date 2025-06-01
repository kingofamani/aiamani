/**
 * ProjectManager - 專案管理模組
 * 負責專案的建立、讀取、更新、刪除操作
 * 使用 localStorage 進行資料持久化
 */
class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.projects = this.loadProjectsList();
        this.autoSaveInterval = null;
        this.autoSaveDelay = 30000; // 30秒自動儲存
    }

    /**
     * 建立新專案
     * @param {string} name - 專案名稱
     * @param {string} description - 專案描述
     * @returns {Object} 新建立的專案物件
     */
    createProject(name, description = '') {
        const project = {
            id: this.generateProjectId(),
            name: name.trim(),
            description: description.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            thumbnail: null,
            data: {
                drawingHistory: [],
                background: { type: 'white', customColor: '#ffffff' },
                notes: [],
                qrCodes: [],
                youtubeVideos: [],
                images: [],
                countdowns: [],
                stopwatches: []
            }
        };

        this.projects.push(project);
        this.saveProjectsList();
        this.currentProject = project;
        
        console.log(`專案 "${name}" 建立成功`, project);
        return project;
    }

    /**
     * 載入專案
     * @param {string} projectId - 專案 ID
     * @returns {Object|null} 專案物件或 null
     */
    loadProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.currentProject = project;
            console.log(`專案 "${project.name}" 載入成功`, project);
            return project;
        }
        console.warn(`找不到專案 ID: ${projectId}`);
        return null;
    }

    /**
     * 儲存當前專案
     * @param {Object} projectData - 專案資料
     * @param {string} thumbnail - 縮圖 base64 字串
     * @returns {boolean} 儲存成功與否
     */
    saveCurrentProject(projectData, thumbnail = null) {
        if (!this.currentProject) {
            console.warn('沒有當前專案可以儲存');
            return false;
        }

        try {
            this.currentProject.data = projectData;
            this.currentProject.updatedAt = new Date().toISOString();
            
            if (thumbnail) {
                this.currentProject.thumbnail = thumbnail;
            }

            this.saveProjectsList();
            console.log(`專案 "${this.currentProject.name}" 儲存成功`);
            return true;
        } catch (error) {
            console.error('儲存專案失敗:', error);
            return false;
        }
    }

    /**
     * 刪除專案
     * @param {string} projectId - 專案 ID
     * @returns {boolean} 刪除成功與否
     */
    deleteProject(projectId) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            const deletedProject = this.projects.splice(index, 1)[0];
            this.saveProjectsList();
            
            if (this.currentProject && this.currentProject.id === projectId) {
                this.currentProject = null;
            }
            
            console.log(`專案 "${deletedProject.name}" 刪除成功`);
            return true;
        }
        console.warn(`找不到要刪除的專案 ID: ${projectId}`);
        return false;
    }

    /**
     * 重新命名專案
     * @param {string} projectId - 專案 ID
     * @param {string} newName - 新名稱
     * @param {string} newDescription - 新描述
     * @returns {boolean} 重新命名成功與否
     */
    renameProject(projectId, newName, newDescription = null) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.name = newName.trim();
            if (newDescription !== null) {
                project.description = newDescription.trim();
            }
            project.updatedAt = new Date().toISOString();
            this.saveProjectsList();
            
            console.log(`專案重新命名為 "${newName}"`);
            return true;
        }
        console.warn(`找不到要重新命名的專案 ID: ${projectId}`);
        return false;
    }

    /**
     * 取得所有專案列表
     * @returns {Array} 專案列表
     */
    getProjectsList() {
        return [...this.projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    /**
     * 取得當前專案
     * @returns {Object|null} 當前專案或 null
     */
    getCurrentProject() {
        return this.currentProject;
    }

    /**
     * 開始自動儲存
     * @param {Function} saveCallback - 儲存回調函數
     */
    startAutoSave(saveCallback) {
        this.stopAutoSave();
        this.autoSaveInterval = setInterval(() => {
            if (this.currentProject && typeof saveCallback === 'function') {
                saveCallback();
                console.log('自動儲存執行');
            }
        }, this.autoSaveDelay);
        console.log('自動儲存已啟動');
    }

    /**
     * 停止自動儲存
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('自動儲存已停止');
        }
    }

    /**
     * 產生唯一專案 ID
     * @returns {string} 專案 ID
     */
    generateProjectId() {
        return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 從 localStorage 載入專案列表
     * @returns {Array} 專案列表
     */
    loadProjectsList() {
        try {
            const projectsData = localStorage.getItem('whiteboard_projects');
            return projectsData ? JSON.parse(projectsData) : [];
        } catch (error) {
            console.error('載入專案列表失敗:', error);
            return [];
        }
    }

    /**
     * 儲存專案列表到 localStorage
     */
    saveProjectsList() {
        try {
            localStorage.setItem('whiteboard_projects', JSON.stringify(this.projects));
        } catch (error) {
            console.error('儲存專案列表失敗:', error);
            
            // 如果儲存失敗，可能是 localStorage 空間不足
            if (error.name === 'QuotaExceededError') {
                this.showStorageQuotaWarning();
            }
        }
    }

    /**
     * 顯示儲存空間不足警告
     */
    showStorageQuotaWarning() {
        alert('儲存空間不足！請考慮刪除一些舊專案或清理瀏覽器資料。');
    }

    /**
     * 取得 localStorage 使用情況
     * @returns {Object} 使用情況統計
     */
    getStorageUsage() {
        let totalSize = 0;
        let projectsSize = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const itemSize = localStorage.getItem(key).length;
                totalSize += itemSize;
                
                if (key === 'whiteboard_projects') {
                    projectsSize = itemSize;
                }
            }
        }

        return {
            total: totalSize,
            projects: projectsSize,
            projectCount: this.projects.length,
            averageProjectSize: this.projects.length > 0 ? Math.round(projectsSize / this.projects.length) : 0
        };
    }

    /**
     * 匯出專案資料 (JSON 格式)
     * @param {string} projectId - 專案 ID
     * @returns {string|null} JSON 字串或 null
     */
    exportProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            return JSON.stringify(project, null, 2);
        }
        return null;
    }

    /**
     * 匯入專案資料
     * @param {string} jsonData - JSON 格式的專案資料
     * @returns {boolean} 匯入成功與否
     */
    importProject(jsonData) {
        try {
            const project = JSON.parse(jsonData);
            
            // 驗證專案資料結構
            if (!project.id || !project.name || !project.data) {
                throw new Error('無效的專案資料格式');
            }

            // 檢查是否已存在相同 ID 的專案
            const existingIndex = this.projects.findIndex(p => p.id === project.id);
            if (existingIndex !== -1) {
                project.id = this.generateProjectId(); // 產生新 ID
                project.name += ' (匯入)';
            }

            project.updatedAt = new Date().toISOString();
            this.projects.push(project);
            this.saveProjectsList();
            
            console.log(`專案 "${project.name}" 匯入成功`);
            return true;
        } catch (error) {
            console.error('匯入專案失敗:', error);
            return false;
        }
    }

    /**
     * 清理舊專案 (保留最新的 N 個專案)
     * @param {number} keepCount - 保留的專案數量
     */
    cleanupOldProjects(keepCount = 10) {
        if (this.projects.length <= keepCount) {
            return;
        }

        const sortedProjects = this.getProjectsList();
        const projectsToDelete = sortedProjects.slice(keepCount);
        
        projectsToDelete.forEach(project => {
            this.deleteProject(project.id);
        });

        console.log(`清理了 ${projectsToDelete.length} 個舊專案`);
    }
}

// 匯出模組
window.ProjectManager = ProjectManager; 