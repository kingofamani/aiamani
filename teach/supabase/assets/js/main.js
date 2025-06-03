/**
 * Supabase + Heroku 部署教學網站
 * 風格參考：Bang & Olufsen 官網
 * 特點：極簡風格、大量留白、極簡字體、清晰產品展示
 */

document.addEventListener('DOMContentLoaded', function() {
    // 導航欄滾動效果
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // 漢堡菜單切換
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }

    // 代碼塊複製功能
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const codeBlock = this.previousElementSibling;
            const textArea = document.createElement('textarea');
            textArea.value = codeBlock.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // 顯示複製成功提示
            const originalText = this.textContent;
            this.textContent = '已複製！';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        });
    });

    // 手風琴效果
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            content.classList.toggle('active');
            
            // 更新箭頭圖標
            const arrow = this.querySelector('.accordion-arrow');
            if (arrow) {
                arrow.textContent = content.classList.contains('active') ? '−' : '+';
            }
        });
    });

    // 檢查清單功能
    const checklistItems = document.querySelectorAll('.checklist-checkbox');
    
    checklistItems.forEach(item => {
        item.addEventListener('change', function() {
            const listItem = this.parentElement;
            if (this.checked) {
                listItem.classList.add('completed');
                // 儲存狀態到本地存儲
                saveChecklistState();
            } else {
                listItem.classList.remove('completed');
                saveChecklistState();
            }
        });
    });

    // 載入檢查清單狀態
    loadChecklistState();

    // 平滑滾動
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default jump for all hash links
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Avoid issues with href="#"
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // If the target is a step-content, manage visibility
                if (targetElement.classList.contains('step-content')) {
                    // Ensure we are in the main content area where steps are managed
                    const mainContentArea = targetElement.closest('.col-8'); 
                    if (mainContentArea) {
                        const allStepContents = mainContentArea.querySelectorAll('.step-content');
                        allStepContents.forEach(content => {
                            // Show the target step, hide others
                            content.style.display = (content.id === targetElement.id) ? 'block' : 'none';
                        });
                    } else {
                        // Fallback: if not in .col-8 or structure is different,
                        // just ensure the clicked target itself is visible.
                        targetElement.style.display = 'block';
                    }

                    // Update progress bar if the function exists
                    if (typeof updateProgressBar === 'function') {
                        updateProgressBar();
                    }
                }
                
                // Use a minimal timeout to allow the browser to re-render after display change.
                // This helps ensure offsetTop is calculated correctly for the now-visible element.
                setTimeout(() => {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // 80 is navbar height offset
                        behavior: 'smooth'
                    });
                }, 0); // A 0ms timeout defers execution until after the current call stack clears

                // Close mobile menu if open
                // navbarMenu is defined in the outer scope of DOMContentLoaded
                if (window.innerWidth < 768 && navbarMenu && navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                }
            }
            // If targetElement is not found, default browser behavior is prevented,
            // and nothing else happens. This is generally acceptable for broken # links.
        });
    });

    // 步驟導航
    const prevButtons = document.querySelectorAll('.prev-step');
    const nextButtons = document.querySelectorAll('.next-step');
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.step-content');
            const prevStep = currentStep.previousElementSibling;
            
            if (prevStep && prevStep.classList.contains('step-content')) {
                currentStep.style.display = 'none';
                prevStep.style.display = 'block';
                updateProgressBar();
            }
        });
    });
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.step-content');
            const nextStep = currentStep.nextElementSibling;
            
            if (nextStep && nextStep.classList.contains('step-content')) {
                currentStep.style.display = 'none';
                nextStep.style.display = 'block';
                updateProgressBar();
            }
        });
    });

    // 更新進度條
    function updateProgressBar() {
        const steps = document.querySelectorAll('.step-content');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        steps.forEach((step, index) => {
            if (step.style.display !== 'none') {
                // 更新當前步驟
                progressSteps.forEach((progressStep, progressIndex) => {
                    if (progressIndex < index) {
                        progressStep.classList.add('completed');
                        progressStep.classList.remove('active');
                    } else if (progressIndex === index) {
                        progressStep.classList.add('active');
                        progressStep.classList.remove('completed');
                    } else {
                        progressStep.classList.remove('active');
                        progressStep.classList.remove('completed');
                    }
                });
            }
        });
    }

    // 儲存檢查清單狀態
    function saveChecklistState() {
        const checklistItems = document.querySelectorAll('.checklist-item');
        const state = {};
        
        checklistItems.forEach((item, index) => {
            const checkbox = item.querySelector('.checklist-checkbox');
            state[index] = checkbox.checked;
        });
        
        localStorage.setItem('checklistState', JSON.stringify(state));
    }

    // 載入檢查清單狀態
    function loadChecklistState() {
        const savedState = localStorage.getItem('checklistState');
        if (savedState) {
            const state = JSON.parse(savedState);
            const checklistItems = document.querySelectorAll('.checklist-item');
            
            checklistItems.forEach((item, index) => {
                const checkbox = item.querySelector('.checklist-checkbox');
                if (state[index]) {
                    checkbox.checked = true;
                    item.classList.add('completed');
                }
            });
        }
    }

    // 初始化頁面
    updateProgressBar();
});
