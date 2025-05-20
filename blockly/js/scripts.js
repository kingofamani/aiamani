// 程式碼區塊高亮與複製功能
document.addEventListener('DOMContentLoaded', function() {
  // 為所有程式碼區塊添加複製按鈕
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(function(codeBlock) {
    // 創建複製按鈕
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = '複製';
    
    // 獲取程式碼區塊的父元素
    const pre = codeBlock.parentNode;
    pre.style.position = 'relative';
    
    // 添加複製按鈕到程式碼區塊
    pre.appendChild(copyButton);
    
    // 添加語言標籤
    const language = codeBlock.className.split('-')[1];
    if (language) {
      const languageTag = document.createElement('span');
      languageTag.className = 'code-language';
      languageTag.textContent = language;
      pre.appendChild(languageTag);
    }
    
    // 添加複製功能
    copyButton.addEventListener('click', function() {
      const code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(function() {
        // 複製成功
        copyButton.textContent = '已複製！';
        setTimeout(function() {
          copyButton.textContent = '複製';
        }, 2000);
      }, function() {
        // 複製失敗
        copyButton.textContent = '複製失敗';
        setTimeout(function() {
          copyButton.textContent = '複製';
        }, 2000);
      });
    });
  });
  
  // 滾動到頂部按鈕
  const backToTopButton = document.createElement('a');
  backToTopButton.href = '#';
  backToTopButton.className = 'back-to-top';
  backToTopButton.innerHTML = '&uarr;';
  document.body.appendChild(backToTopButton);
  
  // 顯示/隱藏滾動到頂部按鈕
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });
  
  // 滾動到頂部功能
  backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // 導航欄高亮當前頁面
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
  
  // 章節導航高亮當前章節
  const chapterLinks = document.querySelectorAll('.chapter-nav-link');
  const sections = document.querySelectorAll('.chapter-content h2, .chapter-content h3');
  
  if (sections.length > 0 && chapterLinks.length > 0) {
    window.addEventListener('scroll', function() {
      let currentSection = '';
      
      sections.forEach(function(section) {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 100) {
          currentSection = section.getAttribute('id');
        }
      });
      
      chapterLinks.forEach(function(link) {
        link.classList.remove('active');
        const href = link.getAttribute('href').split('#')[1];
        if (href === currentSection) {
          link.classList.add('active');
        }
      });
    });
  }
  
  // 互動示範區初始化
  const demoWorkspace = document.getElementById('blocklyDemo');
  if (demoWorkspace) {
    // 定義工具箱
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: '邏輯',
          colour: '%{BKY_LOGIC_HUE}',
          contents: [
            { kind: 'block', type: 'controls_if' },
            { kind: 'block', type: 'logic_compare' },
            { kind: 'block', type: 'logic_operation' },
            { kind: 'block', type: 'logic_negate' },
            { kind: 'block', type: 'logic_boolean' }
          ]
        },
        {
          kind: 'category',
          name: '迴圈',
          colour: '%{BKY_LOOPS_HUE}',
          contents: [
            { kind: 'block', type: 'controls_repeat_ext' },
            { kind: 'block', type: 'controls_whileUntil' }
          ]
        },
        {
          kind: 'category',
          name: '數學',
          colour: '%{BKY_MATH_HUE}',
          contents: [
            { kind: 'block', type: 'math_number' },
            { kind: 'block', type: 'math_arithmetic' }
          ]
        }
      ]
    };
    
    // 初始化 Blockly 工作區
    const workspace = Blockly.inject('blocklyDemo', {
      toolbox: toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true
    });
    
    // 監聽工作區變化事件
    workspace.addChangeListener(function(event) {
      if (event.type === Blockly.Events.BLOCK_CHANGE || 
          event.type === Blockly.Events.BLOCK_CREATE || 
          event.type === Blockly.Events.BLOCK_DELETE || 
          event.type === Blockly.Events.BLOCK_MOVE) {
        
        // 生成 JavaScript 程式碼
        const jsCode = Blockly.JavaScript.workspaceToCode(workspace);
        document.getElementById('jsOutput').textContent = jsCode || '// 沒有積木';
        
        // 生成 Python 程式碼
        const pythonCode = Blockly.Python.workspaceToCode(workspace);
        document.getElementById('pythonOutput').textContent = pythonCode || '# 沒有積木';
      }
    });
  }
});
