// WebNote Background Service Worker - 数据管理和消息处理
// 负责数据持久化、跨页面通信和上下文菜单集成

// 性能监控配置
const PERFORMANCE_CONFIG = {
  STORAGE_OPERATION_TIME: 50,  // 存储操作目标时间 < 50ms
  MESSAGE_RESPONSE_TIME: 30,   // 消息响应时间 < 30ms
  MAX_HIGHLIGHTS_PER_URL: 50,  // 单页面最大划线数
  MAX_TOTAL_HIGHLIGHTS: 1000,  // 总最大划线数
  CLEANUP_THRESHOLD: 900       // 清理阈值
};

// 数据存储键常量
const STORAGE_KEYS = {
  HIGHLIGHTS: 'webnote_highlights',
  SETTINGS: 'webnote_settings',
  STATS: 'webnote_stats'
};

// 默认设置
const DEFAULT_SETTINGS = {
  defaultColor: 'yellow',
  showNotifications: true,
  autoBackup: false,
  maxHighlights: 1000,
  enableContextMenu: true
};

class WebNoteBackground {
  constructor() {
    this.highlights = new Map();
    this.settings = DEFAULT_SETTINGS;
    this.stats = {
      totalHighlights: 0,
      totalNotes: 0,
      lastUpdate: Date.now()
    };
    this.init();
  }

  async init() {
    console.log('🚀 WebNote Background Service Worker 启动中...');
    
    const startTime = performance.now();
    
    try {
      await this.loadStoredData();
      this.setupEventListeners();
      this.setupContextMenus();
      
      const initTime = performance.now() - startTime;
      console.log(`✅ Background 初始化完成 (${initTime.toFixed(2)}ms)`);
      
      if (initTime > 100) {
        console.warn(`⚠️  初始化时间超出预期 (100ms 目标)`);
      }
      
    } catch (error) {
      console.error('❌ Background 初始化失败:', error);
    }
  }

  // 加载存储的数据
  async loadStoredData() {
    const loadStartTime = performance.now();
    
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.HIGHLIGHTS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.STATS
      ]);
      
      // 加载划线数据
      if (result[STORAGE_KEYS.HIGHLIGHTS]) {
        const highlightsData = result[STORAGE_KEYS.HIGHLIGHTS];
        this.highlights = new Map(Object.entries(highlightsData));
        console.log(`📚 已加载 ${this.highlights.size} 条划线记录`);
      }
      
      // 加载设置
      if (result[STORAGE_KEYS.SETTINGS]) {
        this.settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
      }
      
      // 加载统计数据
      if (result[STORAGE_KEYS.STATS]) {
        this.stats = { ...this.stats, ...result[STORAGE_KEYS.STATS] };
      }
      
      const loadTime = performance.now() - loadStartTime;
      console.log(`💾 数据加载完成 (${loadTime.toFixed(2)}ms)`);
      
      if (loadTime > PERFORMANCE_CONFIG.STORAGE_OPERATION_TIME) {
        console.warn(`⚠️  数据加载时间超出目标 (${PERFORMANCE_CONFIG.STORAGE_OPERATION_TIME}ms)`);
      }
      
    } catch (error) {
      console.error('❌ 数据加载失败:', error);
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 消息处理
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // 保持消息通道开放用于异步响应
    });

    // 扩展安装和更新
    chrome.runtime.onInstalled.addListener(async (details) => {
      if (details.reason === 'install') {
        console.log('🎉 WebNote 首次安装');
        await this.initializeFirstRun();
      } else if (details.reason === 'update') {
        console.log('🔄 WebNote 更新完成');
        await this.handleUpdate(details.previousVersion);
      }
    });

    // 标签页更新监听
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.injectContentScript(tabId, tab.url);
      }
    });

    // 快捷键监听
    chrome.commands.onCommand.addListener(async (command) => {
      await this.handleCommand(command);
    });
  }

  // 处理消息
  async handleMessage(message, sender, sendResponse) {
    const startTime = performance.now();
    
    try {
      let response = { success: false, error: '未知消息类型' };
      
      switch (message.type) {
        case 'CREATE_HIGHLIGHT':
          response = await this.createHighlight(message.data);
          break;
          
        case 'GET_HIGHLIGHTS_FOR_URL':
          response = await this.getHighlightsForUrl(message.url);
          break;
          
        case 'DELETE_HIGHLIGHT':
          response = await this.deleteHighlight(message.highlightId);
          break;
          
        case 'UPDATE_HIGHLIGHT':
          response = await this.updateHighlight(message.highlightId, message.updates);
          break;
          
        case 'GET_ALL_HIGHLIGHTS':
          response = await this.getAllHighlights(message.filters);
          break;
          
        case 'GET_STATS':
          response = await this.getStats();
          break;
          
        case 'UPDATE_SETTINGS':
          response = await this.updateSettings(message.settings);
          break;
          
        case 'GET_SETTINGS':
          response = await this.getSettings();
          break;
          
        case 'EXPORT_DATA':
          response = await this.exportData(message.format);
          break;
          
        case 'IMPORT_DATA':
          response = await this.importData(message.data, message.merge);
          break;
          
        case 'CLEAR_DATA':
          response = await this.clearData(message.confirmToken);
          break;
          
        case 'SEARCH_HIGHLIGHTS':
          response = await this.searchHighlights(message.query, message.filters);
          break;
          
        case 'EXPORT_DATA':
          response = await this.exportData();
          break;
          
        case 'IMPORT_DATA':
          response = await this.importData(message.data);
          break;
          
        case 'GET_STATS':
          response = await this.getStats();
          break;
          
        case 'UPDATE_SETTINGS':
          response = await this.updateSettings(message.settings);
          break;

        default:
          console.warn('⚠️  未处理的消息类型:', message.type);
      }
      
      const responseTime = performance.now() - startTime;
      console.log(`📬 消息处理完成: ${message.type} (${responseTime.toFixed(2)}ms)`);
      
      if (responseTime > PERFORMANCE_CONFIG.MESSAGE_RESPONSE_TIME) {
        console.warn(`⚠️  消息响应时间超出目标 (${PERFORMANCE_CONFIG.MESSAGE_RESPONSE_TIME}ms)`);
      }
      
      sendResponse(response);
      
    } catch (error) {
      console.error('❌ 消息处理错误:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // 创建划线
  async createHighlight(highlightData) {
    const startTime = performance.now();
    
    try {
      // 生成唯一 ID
      const id = this.generateId();
      const highlight = {
        id,
        ...highlightData,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      // 检查容量限制
      if (this.highlights.size >= PERFORMANCE_CONFIG.MAX_TOTAL_HIGHLIGHTS) {
        return { success: false, error: '已达到最大划线数量限制' };
      }
      
      // 检查单页面限制
      const urlHighlights = Array.from(this.highlights.values())
        .filter(h => h.url === highlightData.url);
      
      if (urlHighlights.length >= PERFORMANCE_CONFIG.MAX_HIGHLIGHTS_PER_URL) {
        return { success: false, error: '单页面划线数量已达上限' };
      }
      
      // 存储划线
      this.highlights.set(id, highlight);
      await this.saveHighlights();
      
      // 更新统计
      this.stats.totalHighlights++;
      this.stats.lastUpdate = Date.now();
      await this.saveStats();
      
      // 通知其他标签页
      this.notifyHighlightCreated(highlight);
      
      const createTime = performance.now() - startTime;
      console.log(`✨ 划线创建完成: ${id} (${createTime.toFixed(2)}ms)`);
      
      return { success: true, data: highlight };
      
    } catch (error) {
      console.error('❌ 划线创建失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取指定 URL 的划线
  async getHighlightsForUrl(url) {
    const startTime = performance.now();
    
    try {
      const highlights = Array.from(this.highlights.values())
        .filter(highlight => highlight.url === url)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const queryTime = performance.now() - startTime;
      console.log(`🔍 URL 划线查询完成: ${url} (${highlights.length} 条, ${queryTime.toFixed(2)}ms)`);
      
      return { success: true, data: highlights };
      
    } catch (error) {
      console.error('❌ URL 划线查询失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 更新划线
  async updateHighlight(highlightId, updates) {
    const startTime = performance.now();
    
    try {
      if (!this.highlights.has(highlightId)) {
        return { success: false, error: '划线不存在' };
      }
      
      const currentHighlight = this.highlights.get(highlightId);
      const updatedHighlight = {
        ...currentHighlight,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      this.highlights.set(highlightId, updatedHighlight);
      await this.saveHighlights();
      
      // 通知其他标签页
      this.notifyHighlightUpdated(updatedHighlight);
      
      const updateTime = performance.now() - startTime;
      console.log(`✏️  划线更新完成: ${highlightId} (${updateTime.toFixed(2)}ms)`);
      
      return { success: true, data: updatedHighlight };
      
    } catch (error) {
      console.error('❌ 划线更新失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取所有划线
  async getAllHighlights(filters = {}) {
    const startTime = performance.now();
    
    try {
      let highlights = Array.from(this.highlights.values());
      
      // 应用过滤器
      if (filters.color) {
        highlights = highlights.filter(h => h.color === filters.color);
      }
      
      if (filters.url) {
        highlights = highlights.filter(h => h.url.includes(filters.url));
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        highlights = highlights.filter(h => 
          h.text.toLowerCase().includes(keyword) ||
          h.pageTitle.toLowerCase().includes(keyword)
        );
      }
      
      if (filters.dateRange) {
        highlights = highlights.filter(h => 
          h.timestamp >= filters.dateRange.start &&
          h.timestamp <= filters.dateRange.end
        );
      }
      
      // 排序和分页
      highlights.sort((a, b) => b.timestamp - a.timestamp);
      
      if (filters.limit) {
        const offset = filters.offset || 0;
        highlights = highlights.slice(offset, offset + filters.limit);
      }
      
      const queryTime = performance.now() - startTime;
      console.log(`🔍 划线查询完成: ${highlights.length} 条 (${queryTime.toFixed(2)}ms)`);
      
      return { 
        success: true, 
        data: {
          highlights,
          total: this.highlights.size,
          hasMore: filters.limit && (filters.offset || 0) + highlights.length < this.highlights.size
        }
      };
      
    } catch (error) {
      console.error('❌ 划线查询失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取统计信息
  async getStats() {
    try {
      return { success: true, data: { stats: this.stats } };
    } catch (error) {
      console.error('❌ 统计信息获取失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 更新设置
  async updateSettings(newSettings) {
    const startTime = performance.now();
    
    try {
      this.settings = { ...this.settings, ...newSettings };
      
      await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: this.settings
      });
      
      const updateTime = performance.now() - startTime;
      console.log(`⚙️  设置更新完成 (${updateTime.toFixed(2)}ms)`);
      
      return { success: true, data: { settings: this.settings } };
      
    } catch (error) {
      console.error('❌ 设置更新失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取设置
  async getSettings() {
    try {
      return { success: true, data: { settings: this.settings } };
    } catch (error) {
      console.error('❌ 设置获取失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 导出数据
  async exportData(format = 'json') {
    const startTime = performance.now();
    
    try {
      const exportData = {
        version: '0.1.0',
        timestamp: Date.now(),
        highlights: Object.fromEntries(this.highlights),
        settings: this.settings,
        stats: this.stats
      };
      
      let data, filename, mimeType;
      
      switch (format) {
        case 'json':
          data = JSON.stringify(exportData, null, 2);
          filename = `webnote-backup-${this.formatDate(new Date())}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          data = this.convertToCSV(Array.from(this.highlights.values()));
          filename = `webnote-highlights-${this.formatDate(new Date())}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'html':
          data = this.convertToHTML(Array.from(this.highlights.values()));
          filename = `webnote-report-${this.formatDate(new Date())}.html`;
          mimeType = 'text/html';
          break;
          
        default:
          throw new Error('不支持的导出格式');
      }
      
      const exportTime = performance.now() - startTime;
      console.log(`📤 数据导出完成: ${format} (${exportTime.toFixed(2)}ms)`);
      
      return {
        success: true,
        data: {
          data,
          format,
          filename,
          size: data.length
        }
      };
      
    } catch (error) {
      console.error('❌ 数据导出失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 导入数据
  async importData(importData, merge = false) {
    const startTime = performance.now();
    
    try {
      // 验证数据格式
      if (!importData.highlights) {
        throw new Error('无效的数据格式：缺少划线数据');
      }
      
      let importedCount = 0;
      
      if (!merge) {
        // 清空现有数据
        this.highlights.clear();
      }
      
      // 导入划线数据
      const highlightsData = Array.isArray(importData.highlights) 
        ? importData.highlights 
        : Object.values(importData.highlights);
      
      highlightsData.forEach(highlight => {
        if (highlight.id && highlight.text && highlight.url) {
          this.highlights.set(highlight.id, {
            ...highlight,
            timestamp: highlight.timestamp || Date.now(),
            createdAt: highlight.createdAt || new Date().toISOString()
          });
          importedCount++;
        }
      });
      
      // 导入设置（如果存在）
      if (importData.settings && !merge) {
        this.settings = { ...DEFAULT_SETTINGS, ...importData.settings };
      }
      
      // 保存数据
      await this.saveHighlights();
      await this.saveSettings();
      
      // 更新统计
      this.stats.totalHighlights = this.highlights.size;
      this.stats.lastUpdate = Date.now();
      await this.saveStats();
      
      const importTime = performance.now() - startTime;
      console.log(`📥 数据导入完成: ${importedCount} 条 (${importTime.toFixed(2)}ms)`);
      
      return {
        success: true,
        data: {
          imported: importedCount,
          total: this.highlights.size
        }
      };
      
    } catch (error) {
      console.error('❌ 数据导入失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 清空所有数据
  async clearData(confirmToken) {
    const startTime = performance.now();
    
    try {
      // 简单的确认机制
      if (!confirmToken) {
        throw new Error('需要确认令牌');
      }
      
      // 清空数据
      this.highlights.clear();
      this.settings = { ...DEFAULT_SETTINGS };
      this.stats = {
        totalHighlights: 0,
        totalNotes: 0,
        colorUsage: {},
        urlStats: {},
        dailyActivity: {},
        lastUpdate: Date.now(),
        performanceMetrics: {
          averageHighlightTime: 0,
          averagePopupShowTime: 0,
          averageStorageTime: 0,
          memoryUsage: 0,
          errorCount: 0,
          successRate: 1,
          lastMeasurement: Date.now()
        }
      };
      
      // 清空存储
      await chrome.storage.local.clear();
      
      // 保存默认数据
      await this.initializeFirstRun();
      
      const clearTime = performance.now() - startTime;
      console.log(`🗑️  数据清空完成 (${clearTime.toFixed(2)}ms)`);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ 数据清空失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 搜索划线
  async searchHighlights(query, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        keyword: query
      };
      
      return await this.getAllHighlights(searchFilters);
      
    } catch (error) {
      console.error('❌ 搜索失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 保存设置
  async saveSettings() {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: this.settings
      });
    } catch (error) {
      console.error('❌ 设置保存失败:', error);
      throw error;
    }
  }

  // 保存划线数据
  async saveHighlights() {
    const startTime = performance.now();
    
    try {
      const highlightsObject = Object.fromEntries(this.highlights);
      await chrome.storage.local.set({
        [STORAGE_KEYS.HIGHLIGHTS]: highlightsObject
      });
      
      const saveTime = performance.now() - startTime;
      console.log(`💾 划线数据保存完成 (${saveTime.toFixed(2)}ms)`);
      
      if (saveTime > PERFORMANCE_CONFIG.STORAGE_OPERATION_TIME) {
        console.warn(`⚠️  存储操作时间超出目标 (${PERFORMANCE_CONFIG.STORAGE_OPERATION_TIME}ms)`);
      }
      
    } catch (error) {
      console.error('❌ 划线数据保存失败:', error);
      throw error;
    }
  }

  // 保存统计数据
  async saveStats() {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.STATS]: this.stats
      });
    } catch (error) {
      console.error('❌ 统计数据保存失败:', error);
    }
  }

  // 设置上下文菜单
  async setupContextMenus() {
    if (!this.settings.enableContextMenu) return;
    
    try {
      chrome.contextMenus.removeAll();
      
      chrome.contextMenus.create({
        id: 'webnote-highlight',
        title: '划线标注',
        contexts: ['selection']
      });
      
      chrome.contextMenus.create({
        id: 'webnote-quick-yellow',
        title: '快速黄色划线',
        contexts: ['selection'],
        parentId: 'webnote-highlight'
      });
      
      chrome.contextMenus.create({
        id: 'webnote-color-menu',
        title: '选择颜色...',
        contexts: ['selection'],
        parentId: 'webnote-highlight'
      });
      
      chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        await this.handleContextMenuClick(info, tab);
      });
      
      console.log('📋 上下文菜单设置完成');
      
    } catch (error) {
      console.error('❌ 上下文菜单设置失败:', error);
    }
  }

  // 处理上下文菜单点击
  async handleContextMenuClick(info, tab) {
    if (info.menuItemId === 'webnote-quick-yellow' && info.selectionText) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'QUICK_HIGHLIGHT',
          text: info.selectionText,
          color: 'yellow'
        });
      } catch (error) {
        console.error('❌ 快速划线失败:', error);
      }
    }
  }

  // 注入 Content Script
  async injectContentScript(tabId, url) {
    // 跳过扩展页面和特殊协议
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || 
        url.startsWith('edge://') || url.startsWith('about:')) {
      return;
    }
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      
      console.log(`📄 Content Script 注入完成: ${url}`);
      
    } catch (error) {
      console.warn('⚠️  Content Script 注入失败:', error.message);
    }
  }

  // 处理快捷键命令
  async handleCommand(command) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) return;
      
      const activeTab = tabs[0];
      
      switch (command) {
        case 'toggle-highlight':
          await chrome.tabs.sendMessage(activeTab.id, {
            type: 'TOGGLE_HIGHLIGHT'
          });
          break;
          
        case 'open-popup':
          await chrome.action.openPopup();
          break;
      }
      
    } catch (error) {
      console.error('❌ 快捷键处理失败:', error);
    }
  }

  // 通知划线创建
  notifyHighlightCreated(highlight) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url === highlight.url) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'HIGHLIGHT_CREATED',
            data: highlight
          }).catch(error => {
            // 忽略无法发送消息的标签页
          });
        }
      });
    });
  }

  // 通知划线更新
  notifyHighlightUpdated(highlight) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url === highlight.url) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'HIGHLIGHT_UPDATED',
            data: highlight
          }).catch(error => {
            // 忽略无法发送消息的标签页
          });
        }
      });
    });
  }

  // 格式化日期
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // 转换为 CSV 格式
  convertToCSV(highlights) {
    const headers = ['ID', '文本', '颜色', '网址', '页面标题', '创建时间'];
    const rows = highlights.map(h => [
      h.id,
      `"${h.text.replace(/"/g, '""')}"`,
      h.color,
      h.url,
      `"${h.pageTitle.replace(/"/g, '""')}"`,
      new Date(h.timestamp).toLocaleString('zh-CN')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // 转换为 HTML 格式
  convertToHTML(highlights) {
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const highlightsList = highlights.map(h => `
      <div class="highlight-item" style="margin: 16px 0; padding: 12px; border-left: 4px solid ${this.getColorValue(h.color)}; background: #f9f9f9;">
        <div class="highlight-text" style="font-size: 14px; line-height: 1.5; margin-bottom: 8px;">
          ${escapeHtml(h.text)}
        </div>
        <div class="highlight-meta" style="font-size: 12px; color: #666;">
          <span>来源：<a href="${h.url}" target="_blank">${escapeHtml(h.pageTitle)}</a></span>
          <span style="margin-left: 16px;">颜色：${this.getColorName(h.color)}</span>
          <span style="margin-left: 16px;">时间：${new Date(h.timestamp).toLocaleString('zh-CN')}</span>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <title>WebNote 划线报告</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .stats { background: #f0f0f0; padding: 16px; border-radius: 8px; margin-bottom: 32px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WebNote 划线报告</h1>
          <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
        <div class="stats">
          <p><strong>总划线数：</strong>${highlights.length} 条</p>
        </div>
        <div class="highlights">
          ${highlightsList}
        </div>
      </body>
      </html>
    `;
  }

  // 获取颜色值
  getColorValue(colorName) {
    const colors = {
      yellow: '#FFEB3B',
      green: '#4CAF50',
      blue: '#2196F3',
      pink: '#E91E63',
      orange: '#FF9800',
      purple: '#9C27B0',
      red: '#F44336',
      gray: '#9E9E9E'
    };
    return colors[colorName] || '#9E9E9E';
  }

  // 获取颜色名称
  getColorName(colorName) {
    const names = {
      yellow: '黄色',
      green: '绿色',
      blue: '蓝色',
      pink: '粉色',
      orange: '橙色',
      purple: '紫色',
      red: '红色',
      gray: '灰色'
    };
    return names[colorName] || colorName;
  }
}

  // 生成唯一 ID
  generateId() {
    return `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 首次运行初始化
  async initializeFirstRun() {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: this.settings,
        [STORAGE_KEYS.STATS]: this.stats
      });
      
      console.log('🌟 首次运行初始化完成');
      
    } catch (error) {
      console.error('❌ 首次运行初始化失败:', error);
    }
  }

  // 处理扩展更新
  async handleUpdate(previousVersion) {
    console.log(`🔄 从版本 ${previousVersion} 更新`);
    // 这里可以添加数据迁移逻辑
  }
}

// 启动 Background Service Worker
console.log('🎯 启动 WebNote Background Service Worker');
new WebNoteBackground();

// 添加 CSS 动画支持
const ANIMATIONS_CSS = `
@keyframes webnote-fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes webnote-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.webnote-highlight {
  animation: webnote-pulse 200ms ease-out;
}

.webnote-popup {
  animation: webnote-fadeInUp 150ms ease-out;
}
`;

// 动态注入样式到各个页面
chrome.scripting.registerContentScripts([{
  id: 'webnote-animations',
  matches: ['https://*/*', 'http://*/*'],
  css: [ANIMATIONS_CSS],
  runAt: 'document_start'
}]).catch(error => {
  console.warn('⚠️  动画样式注册失败:', error);
});