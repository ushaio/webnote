// WebNote Content Script - 网页划线核心功能
// 运行在每个网页中，负责文本选择、划线渲染和用户交互

// 常量定义 (本地化)
const HIGHLIGHT_COLORS = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  pink: '#E91E63',
  orange: '#FF9800',
  purple: '#9C27B0',
  red: '#F44336',
  gray: '#9E9E9E'
};

const PERFORMANCE_CONFIG = {
  HIGHLIGHT_RESPONSE_TIME: 100,
  POPUP_SHOW_DELAY: 50,
  MAX_TEXT_LENGTH: 500
};

const Z_INDEX = {
  HIGHLIGHT_POPUP: 2147483647,
  HIGHLIGHT_MARKER: 2147483646
};

// 工具函数
function generateId() {
  return `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

class WebNoteContentScript {
  constructor() {
    this.highlights = new Map();
    this.isSelecting = false;
    this.colorPopup = null;
    this.selectedRange = null;
    this.init();
  }
  
  init() {
    console.log('🎯 WebNote Content Script 初始化中...');
    
    const startTime = performance.now();
    
    this.loadExistingHighlights();
    this.setupEventListeners();
    this.setupMessageListener();
    
    const initTime = performance.now() - startTime;
    console.log(`✅ WebNote 初始化完成 (${initTime.toFixed(2)}ms)`);
    
    if (initTime > PERFORMANCE_CONFIG.HIGHLIGHT_RESPONSE_TIME) {
      console.warn(`⚠️  初始化时间超出目标 (${PERFORMANCE_CONFIG.HIGHLIGHT_RESPONSE_TIME}ms)`);
    }
  }
  
  async loadExistingHighlights() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HIGHLIGHTS_FOR_URL',
        url: window.location.href,
        timestamp: Date.now()
      });
      
      if (response && response.success && response.data) {
        response.data.forEach((highlight) => {
          this.renderHighlight(highlight);
        });
      }
    } catch (error) {
      console.error('❌ 加载划线数据失败:', error);
    }
  }
  
  setupEventListeners() {
    const handleSelection = throttle(() => {
      this.handleTextSelection();
    }, 50);
    
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        this.toggleQuickHighlight();
      }
    });
    
    // 页面滚动时隐藏弹窗
    document.addEventListener('scroll', debounce(() => {
      this.hideColorPopup();
    }, 100));
  }
  
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'HIGHLIGHT_CREATED':
          this.renderHighlight(message.data);
          break;
          
        case 'HIGHLIGHT_DELETED':
          this.removeHighlight(message.highlightId);
          break;
          
        case 'TOGGLE_HIGHLIGHT':
          this.toggleQuickHighlight();
          break;
      }
    });
  }
  
  handleTextSelection() {
    console.log('🖱️ handleTextSelection called'); // 临时调试
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('❌ No selection or no ranges'); // 临时调试
      this.hideColorPopup();
      return;
    }
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    console.log('📝 Selected text:', selectedText); // 临时调试
    
    if (selectedText.length === 0 || selectedText.length > PERFORMANCE_CONFIG.MAX_TEXT_LENGTH) {
      console.log('❌ Text length invalid:', selectedText.length); // 临时调试
      this.hideColorPopup();
      return;
    }
    
    // 检查是否点击了现有划线
    const clickedHighlight = this.getClickedHighlight(range);
    if (clickedHighlight) {
      console.log('🎯 Clicked existing highlight'); // 临时调试
      this.showHighlightOptions(clickedHighlight);
      return;
    }
    
    console.log('🚀 Calling showColorPopup'); // 临时调试
    this.showColorPopup(range, selectedText);
  }
  
  showColorPopup(range, text) {
    console.log('🎨 showColorPopup called with text:', text); // 临时调试
    
    this.hideColorPopup();
    this.selectedRange = range.cloneRange();
    
    const rect = range.getBoundingClientRect();
    console.log('📐 Range rect:', rect); // 临时调试
    
    if (rect.width === 0 && rect.height === 0) {
      console.log('⚠️ Range rect is empty, aborting'); // 临时调试
      return;
    }
    
    this.colorPopup = this.createColorPopup(rect, text);
    console.log('🔧 Created popup:', this.colorPopup); // 临时调试
    
    document.body.appendChild(this.colorPopup);
    console.log('✅ Popup appended to body'); // 临时调试
  }
  
  createColorPopup(rect, text) {
    const popup = document.createElement('div');
    popup.className = 'webnote-popup';
    
    const popupWidth = 200;
    const popupHeight = 40;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    
    let top = rect.top + scrollY - popupHeight - 10;
    let left = rect.left + scrollX + (rect.width / 2) - (popupWidth / 2);
    
    // 边界检查
    if (top < scrollY + 10) {
      top = rect.bottom + scrollY + 10;
    }
    if (left < 10) {
      left = 10;
    }
    if (left + popupWidth > window.innerWidth - 10) {
      left = window.innerWidth - popupWidth - 10;
    }
    
    popup.style.cssText = `
      position: absolute;
      top: ${top}px;
      left: ${left}px;
      z-index: ${Z_INDEX.HIGHLIGHT_POPUP};
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 8px;
      display: flex;
      gap: 4px;
      animation: webnote-fadeInUp 150ms ease;
    `;
    
    // 创建颜色按钮
    const colors = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple', 'red', 'gray'];
    
    colors.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'webnote-color-btn';
      btn.setAttribute('data-color', color);
      btn.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 150ms ease;
        background-color: ${HIGHLIGHT_COLORS[color]};
      `;
      
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.createHighlight(text, color);
      });
      
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.borderColor = 'rgba(0, 0, 0, 0.3)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.8)';
      });
      
      popup.appendChild(btn);
    });
    
    // 点击外部隐藏弹窗
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick.bind(this), true);
    }, 0);
    
    return popup;
  }
  
  handleOutsideClick(e) {
    if (this.colorPopup && !this.colorPopup.contains(e.target)) {
      this.hideColorPopup();
    }
  }
  
  hideColorPopup(clearSelection = false) {
    if (this.colorPopup) {
      document.removeEventListener('click', this.handleOutsideClick.bind(this), true);
      this.colorPopup.remove();
      this.colorPopup = null;
    }
    
    // 只在明确指示时清除选择，或者用户点击了颜色按钮后
    if (clearSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }
  }
  
  async createHighlight(text, color) {
    const startTime = performance.now();
    
    if (!this.selectedRange) return;
    
    try {
      const highlightData = {
        text: text,
        color: color,
        url: window.location.href,
        pageTitle: document.title,
        position: this.calculatePosition(this.selectedRange),
        note: ''
      };
      
      const message = {
        type: 'CREATE_HIGHLIGHT',
        data: highlightData,
        timestamp: Date.now()
      };
      
      const response = await chrome.runtime.sendMessage(message);
      
      if (response && response.success) {
        this.renderHighlightFromRange(this.selectedRange, response.data);
        console.log('✅ 划线创建成功');
      } else {
        console.error('❌ 划线创建失败:', response ? response.error : 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ 划线创建异常:', error);
    } finally {
      this.hideColorPopup(true); // 创建划线后清除选择
      
      const createTime = performance.now() - startTime;
      console.log(`🎯 划线创建完成 (${createTime.toFixed(2)}ms)`);
      
      if (createTime > PERFORMANCE_CONFIG.HIGHLIGHT_RESPONSE_TIME) {
        console.warn(`⚠️  划线创建时间超出目标 (${PERFORMANCE_CONFIG.HIGHLIGHT_RESPONSE_TIME}ms)`);
      }
    }
  }
  
  calculatePosition(range) {
    return {
      selector: this.generateCSSSelector(range.commonAncestorContainer),
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      textContent: range.toString(),
      xpath: this.generateXPath(range.commonAncestorContainer)
    };
  }
  
  generateCSSSelector(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return node.tagName.toLowerCase();
    }
    return 'text()';
  }
  
  generateXPath(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return `//${node.tagName.toLowerCase()}`;
    }
    return '//text()';
  }
  
  renderHighlightFromRange(range, highlight) {
    const span = document.createElement('span');
    span.className = 'webnote-highlight';
    span.setAttribute('data-highlight-id', highlight.id);
    span.setAttribute('data-color', highlight.color);
    span.style.backgroundColor = `${HIGHLIGHT_COLORS[highlight.color]}66`; // 40% 透明度
    span.style.cursor = 'pointer';
    span.style.borderRadius = '2px';
    
    try {
      range.surroundContents(span);
      this.highlights.set(highlight.id, highlight);
    } catch (error) {
      console.warn('⚠️  无法直接包裹内容，使用备用方法');
    }
  }
  
  renderHighlight(highlight) {
    console.log('🎨 渲染划线:', highlight);
    this.highlights.set(highlight.id, highlight);
  }
  
  removeHighlight(highlightId) {
    const element = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (element) {
      const parent = element.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(element.textContent || ''), element);
        parent.normalize();
      }
    }
    
    this.highlights.delete(highlightId);
    console.log('🗑️  划线已移除:', highlightId);
  }
  
  toggleQuickHighlight() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    if (text.length > 0) {
      this.selectedRange = range;
      this.createHighlight(text, 'yellow');
    }
  }
  
  getClickedHighlight(range) {
    const container = range.commonAncestorContainer;
    let element = container.nodeType === Node.ELEMENT_NODE 
      ? container 
      : container.parentElement;
    
    while (element) {
      if (element.classList && element.classList.contains('webnote-highlight')) {
        const id = element.getAttribute('data-highlight-id');
        return id ? this.highlights.get(id) || null : null;
      }
      element = element.parentElement;
    }
    
    return null;
  }
  
  showHighlightOptions(highlight) {
    console.log('📝 显示划线选项:', highlight);
    // TODO: 实现划线编辑/删除选项
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WebNoteContentScript();
  });
} else {
  new WebNoteContentScript();
}