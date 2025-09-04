// WebNote Popup Script - 控制台界面交互逻辑
// 负责划线列表显示、搜索过滤、数据导出等功能

// 性能监控配置
const PERFORMANCE_CONFIG = {
  LOAD_TIME_TARGET: 200,  // 加载时间目标 < 200ms
  SEARCH_DEBOUNCE: 300,   // 搜索防抖延迟
  RENDER_BATCH_SIZE: 20,  // 渲染批次大小
  MAX_DISPLAY_ITEMS: 100  // 最大显示项目数
};

class WebNotePopup {
  constructor() {
    this.highlights = [];
    this.filteredHighlights = [];
    this.currentFilters = {
      search: '',
      timeRange: 'all',
      colors: new Set()
    };
    this.isLoading = false;
    this.renderOffset = 0;
    
    this.init();
  }

  async init() {
    console.log('🚀 WebNote Popup 初始化中...');
    const startTime = performance.now();

    try {
      // 绑定事件监听器
      this.bindEventListeners();
      
      // 加载数据
      await this.loadHighlights();
      
      // 初始渲染
      this.applyFilters();
      this.renderHighlights();
      
      // 更新统计信息
      this.updateStats();

      const initTime = performance.now() - startTime;
      console.log(`✅ Popup 初始化完成 (${initTime.toFixed(2)}ms)`);
      
      // 性能监控
      if (initTime > PERFORMANCE_CONFIG.LOAD_TIME_TARGET) {
        console.warn(`⚠️  Popup 加载时间超出目标 (${PERFORMANCE_CONFIG.LOAD_TIME_TARGET}ms)`);
      }

    } catch (error) {
      console.error('❌ Popup 初始化失败:', error);
      this.showError('初始化失败，请刷新重试');
    }
  }

  // 绑定事件监听器
  bindEventListeners() {
    // 搜索输入框
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', this.debounce((e) => {
      this.handleSearch(e.target.value);
    }, PERFORMANCE_CONFIG.SEARCH_DEBOUNCE));

    // 时间过滤器
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleTimeFilter(e.target.dataset.filter);
      });
    });

    // 颜色过滤器
    document.querySelectorAll('.color-filter').forEach(filter => {
      filter.addEventListener('click', (e) => {
        this.handleColorFilter(e.target.dataset.color);
      });
    });

    // 工具栏按钮
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.handleExport();
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshData();
    });

    // 滚动加载更多
    const mainContent = document.querySelector('.main-content');
    mainContent.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
    }, 100));
  }

  // 加载划线数据
  async loadHighlights() {
    const startTime = performance.now();
    this.setLoadingState(true);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_ALL_HIGHLIGHTS',
        timestamp: Date.now()
      });

      if (response && response.success) {
        this.highlights = response.data.highlights || [];
        console.log(`📚 已加载 ${this.highlights.length} 条划线记录`);
      } else {
        console.error('❌ 加载划线数据失败:', response?.error);
        this.highlights = [];
      }

      const loadTime = performance.now() - startTime;
      console.log(`💾 数据加载完成 (${loadTime.toFixed(2)}ms)`);

    } catch (error) {
      console.error('❌ 数据加载异常:', error);
      this.highlights = [];
    } finally {
      this.setLoadingState(false);
    }
  }

  // 应用过滤器
  applyFilters() {
    const startTime = performance.now();

    let filtered = [...this.highlights];

    // 搜索过滤
    if (this.currentFilters.search) {
      const searchLower = this.currentFilters.search.toLowerCase();
      filtered = filtered.filter(highlight => 
        highlight.text.toLowerCase().includes(searchLower) ||
        highlight.pageTitle.toLowerCase().includes(searchLower) ||
        highlight.url.toLowerCase().includes(searchLower)
      );
    }

    // 时间范围过滤
    const now = Date.now();
    switch (this.currentFilters.timeRange) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(highlight => highlight.timestamp >= today.getTime());
        break;
      case 'week':
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(highlight => highlight.timestamp >= weekAgo);
        break;
    }

    // 颜色过滤
    if (this.currentFilters.colors.size > 0) {
      filtered = filtered.filter(highlight => 
        this.currentFilters.colors.has(highlight.color)
      );
    }

    // 按时间排序 (最新的在前面)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    this.filteredHighlights = filtered;
    this.renderOffset = 0;

    const filterTime = performance.now() - startTime;
    console.log(`🔍 过滤完成: ${filtered.length}/${this.highlights.length} (${filterTime.toFixed(2)}ms)`);
  }

  // 渲染划线列表
  renderHighlights() {
    const startTime = performance.now();
    const listContainer = document.getElementById('highlightsList');
    const emptyState = document.getElementById('emptyState');

    if (this.filteredHighlights.length === 0) {
      listContainer.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    listContainer.style.display = 'block';
    emptyState.style.display = 'none';

    // 批量渲染
    const endIndex = Math.min(
      this.renderOffset + PERFORMANCE_CONFIG.RENDER_BATCH_SIZE,
      this.filteredHighlights.length,
      PERFORMANCE_CONFIG.MAX_DISPLAY_ITEMS
    );

    if (this.renderOffset === 0) {
      listContainer.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();

    for (let i = this.renderOffset; i < endIndex; i++) {
      const highlight = this.filteredHighlights[i];
      const item = this.createHighlightItem(highlight);
      fragment.appendChild(item);
    }

    listContainer.appendChild(fragment);
    this.renderOffset = endIndex;

    const renderTime = performance.now() - startTime;
    console.log(`🎨 渲染完成: ${endIndex}/${this.filteredHighlights.length} (${renderTime.toFixed(2)}ms)`);
  }

  // 创建划线项元素
  createHighlightItem(highlight) {
    const item = document.createElement('div');
    item.className = 'highlight-item';
    item.dataset.color = highlight.color;
    item.dataset.highlightId = highlight.id;

    // 限制文本长度
    const displayText = highlight.text.length > 120 
      ? highlight.text.substring(0, 120) + '...' 
      : highlight.text;

    // 格式化时间
    const timeStr = this.formatTime(highlight.timestamp);
    
    // 提取域名
    const domain = this.extractDomain(highlight.url);

    item.innerHTML = `
      <div class="highlight-text">${this.escapeHtml(displayText)}</div>
      <div class="highlight-meta">
        <span class="highlight-url" title="${this.escapeHtml(highlight.url)}">
          ${this.escapeHtml(domain)} - ${this.escapeHtml(highlight.pageTitle)}
        </span>
        <span class="highlight-time">${timeStr}</span>
      </div>
    `;

    // 点击事件 - 跳转到原页面
    item.addEventListener('click', () => {
      this.navigateToHighlight(highlight);
    });

    // 右键菜单
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, highlight);
    });

    return item;
  }

  // 处理搜索
  handleSearch(query) {
    this.currentFilters.search = query.trim();
    this.applyFilters();
    this.renderHighlights();
    this.updateStats();
  }

  // 处理时间过滤
  handleTimeFilter(timeRange) {
    // 更新按钮状态
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${timeRange}"]`).classList.add('active');

    this.currentFilters.timeRange = timeRange;
    this.applyFilters();
    this.renderHighlights();
    this.updateStats();
  }

  // 处理颜色过滤
  handleColorFilter(color) {
    const filterElement = document.querySelector(`[data-color="${color}"]`);
    
    if (this.currentFilters.colors.has(color)) {
      this.currentFilters.colors.delete(color);
      filterElement.classList.remove('active');
    } else {
      this.currentFilters.colors.add(color);
      filterElement.classList.add('active');
    }

    this.applyFilters();
    this.renderHighlights();
    this.updateStats();
  }

  // 处理滚动加载
  handleScroll() {
    const mainContent = document.querySelector('.main-content');
    const { scrollTop, scrollHeight, clientHeight } = mainContent;

    // 检查是否需要加载更多
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      if (this.renderOffset < this.filteredHighlights.length && 
          this.renderOffset < PERFORMANCE_CONFIG.MAX_DISPLAY_ITEMS) {
        this.renderHighlights();
      }
    }
  }

  // 跳转到划线位置
  async navigateToHighlight(highlight) {
    try {
      // 查找或创建标签页
      const tabs = await chrome.tabs.query({ url: highlight.url });
      
      if (tabs.length > 0) {
        // 切换到现有标签页
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        // 创建新标签页
        await chrome.tabs.create({ url: highlight.url, active: true });
      }

      // 关闭弹窗
      window.close();

    } catch (error) {
      console.error('❌ 导航失败:', error);
      this.showError('无法打开页面');
    }
  }

  // 处理数据导出
  async handleExport() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXPORT_DATA',
        format: 'json',
        timestamp: Date.now()
      });

      if (response && response.success) {
        // 下载文件
        const blob = new Blob([response.data.data], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        a.click();
        URL.revokeObjectURL(url);

        console.log('✅ 数据导出成功');
      } else {
        this.showError('导出失败: ' + (response?.error || '未知错误'));
      }

    } catch (error) {
      console.error('❌ 导出失败:', error);
      this.showError('导出失败');
    }
  }

  // 刷新数据
  async refreshData() {
    await this.loadHighlights();
    this.applyFilters();
    this.renderHighlights();
    this.updateStats();
  }

  // 打开设置页面
  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  // 更新统计信息
  updateStats() {
    const countElement = document.getElementById('highlightCount');
    countElement.textContent = this.filteredHighlights.length;
  }

  // 设置加载状态
  setLoadingState(loading) {
    const loadingState = document.getElementById('loadingState');
    const mainContent = document.querySelector('.main-content');
    
    if (loading) {
      loadingState.style.display = 'flex';
      this.isLoading = true;
    } else {
      loadingState.style.display = 'none';
      this.isLoading = false;
    }
  }

  // 显示错误信息
  showError(message) {
    // 简单的错误显示，可以后续改进为更好的 UI
    console.error('UI Error:', message);
    // TODO: 实现更好的错误提示 UI
  }

  // 工具方法
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) { // 7天内
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 防抖函数
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // 节流函数
  throttle(func, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  // 右键菜单 (未来扩展)
  showContextMenu(event, highlight) {
    // TODO: 实现右键菜单功能
    console.log('右键菜单:', highlight);
  }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new WebNotePopup();
});

// 监听来自 Background Script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'HIGHLIGHTS_UPDATED') {
    // 重新加载数据
    if (window.webNotePopup) {
      window.webNotePopup.refreshData();
    }
  }
});

console.log('📱 WebNote Popup 脚本加载完成');