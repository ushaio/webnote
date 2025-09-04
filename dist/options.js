// WebNote Options Script - 设置页面交互逻辑
// 负责用户设置管理、数据导入导出、统计信息显示等功能

// 颜色配置
const COLORS = [
  { name: 'yellow', label: '黄色', value: '#FFEB3B' },
  { name: 'green', label: '绿色', value: '#4CAF50' },
  { name: 'blue', label: '蓝色', value: '#2196F3' },
  { name: 'pink', label: '粉色', value: '#E91E63' },
  { name: 'orange', label: '橙色', value: '#FF9800' },
  { name: 'purple', label: '紫色', value: '#9C27B0' },
  { name: 'red', label: '红色', value: '#F44336' },
  { name: 'gray', label: '灰色', value: '#9E9E9E' }
];

// 默认设置
const DEFAULT_SETTINGS = {
  defaultColor: 'yellow',
  autoBackup: false,
  showNotifications: true,
  showShortcuts: true,
  popupDelay: 200,
  maxHighlights: 1000,
  enableContextMenu: true,
  performanceMode: false,
  theme: 'auto'
};

class WebNoteOptions {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.stats = null;
    this.init();
  }

  async init() {
    console.log('⚙️  WebNote Options 初始化中...');

    try {
      // 初始化颜色选择器
      this.initColorPicker();
      
      // 绑定事件监听器
      this.bindEventListeners();
      
      // 加载设置和统计信息
      await this.loadSettings();
      await this.loadStats();
      
      // 渲染界面
      this.renderSettings();
      this.renderStats();

      console.log('✅ Options 初始化完成');

    } catch (error) {
      console.error('❌ Options 初始化失败:', error);
      this.showAlert('初始化失败，请刷新页面重试', 'error');
    }
  }

  // 初始化颜色选择器
  initColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    
    COLORS.forEach(color => {
      const option = document.createElement('div');
      option.className = 'color-option';
      option.dataset.color = color.name;
      
      option.innerHTML = `
        <div class="color-circle" style="background: ${color.value};"></div>
        <div class="color-name">${color.label}</div>
      `;
      
      option.addEventListener('click', () => {
        this.selectColor(color.name);
      });
      
      colorPicker.appendChild(option);
    });
  }

  // 绑定事件监听器
  bindEventListeners() {
    // 范围输入控件
    const popupDelaySlider = document.getElementById('popupDelay');
    const maxHighlightsSlider = document.getElementById('maxHighlights');
    
    popupDelaySlider.addEventListener('input', (e) => {
      document.getElementById('popupDelayValue').textContent = `${e.target.value}ms`;
    });
    
    maxHighlightsSlider.addEventListener('input', (e) => {
      document.getElementById('maxHighlightsValue').textContent = e.target.value;
    });

    // 保存设置按钮
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveSettings();
    });

    // 重置设置按钮
    document.getElementById('resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });

    // 导出数据按钮
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    // 导入数据按钮
    document.getElementById('importData').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });

    // 文件选择处理
    document.getElementById('fileInput').addEventListener('change', (e) => {
      this.handleFileImport(e.target.files[0]);
    });

    // 清空数据按钮
    document.getElementById('clearAllData').addEventListener('click', () => {
      this.confirmClearData();
    });
  }

  // 加载设置
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SETTINGS',
        timestamp: Date.now()
      });

      if (response && response.success) {
        this.settings = { ...DEFAULT_SETTINGS, ...response.data.settings };
        console.log('⚙️  设置加载完成:', this.settings);
      } else {
        console.warn('⚠️  使用默认设置');
      }

    } catch (error) {
      console.error('❌ 设置加载失败:', error);
    }
  }

  // 加载统计信息
  async loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_STATS',
        timestamp: Date.now()
      });

      if (response && response.success) {
        this.stats = response.data.stats;
        console.log('📊 统计信息加载完成:', this.stats);
      } else {
        console.warn('⚠️  无统计信息');
        this.stats = {
          totalHighlights: 0,
          totalNotes: 0,
          colorUsage: {},
          urlStats: {},
          dailyActivity: {},
          lastUpdate: Date.now()
        };
      }

    } catch (error) {
      console.error('❌ 统计信息加载失败:', error);
      this.stats = {
        totalHighlights: 0,
        totalNotes: 0,
        colorUsage: {},
        urlStats: {},
        dailyActivity: {},
        lastUpdate: Date.now()
      };
    }
  }

  // 渲染设置
  renderSettings() {
    // 设置默认颜色选择
    this.selectColor(this.settings.defaultColor);

    // 设置滑块值
    document.getElementById('popupDelay').value = this.settings.popupDelay;
    document.getElementById('popupDelayValue').textContent = `${this.settings.popupDelay}ms`;
    
    document.getElementById('maxHighlights').value = this.settings.maxHighlights;
    document.getElementById('maxHighlightsValue').textContent = this.settings.maxHighlights;

    // 设置复选框
    document.getElementById('showNotifications').checked = this.settings.showNotifications;
    document.getElementById('enableContextMenu').checked = this.settings.enableContextMenu;
    document.getElementById('showShortcuts').checked = this.settings.showShortcuts;
    document.getElementById('performanceMode').checked = this.settings.performanceMode;
    document.getElementById('autoBackup').checked = this.settings.autoBackup;

    // 设置主题选择
    document.getElementById('theme').value = this.settings.theme;
  }

  // 渲染统计信息
  renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    
    // 计算最常用的颜色
    const mostUsedColor = Object.keys(this.stats.colorUsage || {}).reduce((a, b) => 
      (this.stats.colorUsage[a] || 0) > (this.stats.colorUsage[b] || 0) ? a : b, 'yellow');
    
    // 计算划线最多的网站
    const topUrl = Object.keys(this.stats.urlStats || {}).reduce((a, b) => 
      (this.stats.urlStats[a] || 0) > (this.stats.urlStats[b] || 0) ? a : b, '');

    // 计算最近活跃天数
    const recentDays = Object.keys(this.stats.dailyActivity || {})
      .filter(date => {
        const dayTime = new Date(date).getTime();
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return dayTime >= weekAgo;
      }).length;

    const statsData = [
      {
        label: '总划线数',
        value: this.stats.totalHighlights || 0,
        icon: '📝'
      },
      {
        label: '总笔记数',
        value: this.stats.totalNotes || 0,
        icon: '📋'
      },
      {
        label: '最常用颜色',
        value: this.getColorLabel(mostUsedColor),
        icon: '🎨'
      },
      {
        label: '最近活跃天数',
        value: recentDays,
        icon: '📅'
      }
    ];

    statsGrid.innerHTML = '';
    
    statsData.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      
      card.innerHTML = `
        <div class="stat-value">${stat.icon} ${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      `;
      
      statsGrid.appendChild(card);
    });
  }

  // 选择颜色
  selectColor(colorName) {
    // 更新UI状态
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`[data-color="${colorName}"]`);
    if (selectedOption) {
      selectedOption.classList.add('active');
    }

    // 更新设置
    this.settings.defaultColor = colorName;
  }

  // 保存设置
  async saveSettings() {
    try {
      // 收集表单数据
      const formData = {
        defaultColor: this.settings.defaultColor,
        popupDelay: parseInt(document.getElementById('popupDelay').value),
        maxHighlights: parseInt(document.getElementById('maxHighlights').value),
        showNotifications: document.getElementById('showNotifications').checked,
        enableContextMenu: document.getElementById('enableContextMenu').checked,
        showShortcuts: document.getElementById('showShortcuts').checked,
        performanceMode: document.getElementById('performanceMode').checked,
        autoBackup: document.getElementById('autoBackup').checked,
        theme: document.getElementById('theme').value
      };

      // 发送保存请求
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: formData,
        timestamp: Date.now()
      });

      if (response && response.success) {
        this.settings = { ...this.settings, ...formData };
        this.showAlert('设置保存成功！', 'success');
        console.log('✅ 设置保存成功');
      } else {
        throw new Error(response?.error || '保存失败');
      }

    } catch (error) {
      console.error('❌ 设置保存失败:', error);
      this.showAlert(`设置保存失败：${error.message}`, 'error');
    }
  }

  // 重置设置
  resetSettings() {
    if (confirm('确定要重置所有设置为默认值吗？这个操作不可撤销。')) {
      this.settings = { ...DEFAULT_SETTINGS };
      this.renderSettings();
      this.showAlert('设置已重置为默认值', 'success');
    }
  }

  // 导出数据
  async exportData() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXPORT_DATA',
        format: 'json',
        timestamp: Date.now()
      });

      if (response && response.success) {
        // 创建下载链接
        const blob = new Blob([response.data.data], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showAlert('数据导出成功！', 'success');
        console.log('✅ 数据导出成功');

      } else {
        throw new Error(response?.error || '导出失败');
      }

    } catch (error) {
      console.error('❌ 数据导出失败:', error);
      this.showAlert(`数据导出失败：${error.message}`, 'error');
    }
  }

  // 处理文件导入
  async handleFileImport(file) {
    if (!file) return;

    try {
      const text = await this.readFileAsText(file);
      const data = JSON.parse(text);

      // 基本验证
      if (!data.highlights || !Array.isArray(data.highlights)) {
        throw new Error('无效的数据格式');
      }

      const response = await chrome.runtime.sendMessage({
        type: 'IMPORT_DATA',
        data: data,
        merge: true, // 合并现有数据
        timestamp: Date.now()
      });

      if (response && response.success) {
        this.showAlert(`数据导入成功！导入了 ${data.highlights.length} 条划线记录。`, 'success');
        // 重新加载统计信息
        await this.loadStats();
        this.renderStats();
      } else {
        throw new Error(response?.error || '导入失败');
      }

    } catch (error) {
      console.error('❌ 数据导入失败:', error);
      this.showAlert(`数据导入失败：${error.message}`, 'error');
    }

    // 清空文件输入
    document.getElementById('fileInput').value = '';
  }

  // 确认清空数据
  confirmClearData() {
    const confirmText = '确定要清空所有数据吗？这个操作不可撤销！\n\n建议先导出数据备份。';
    
    if (confirm(confirmText)) {
      const secondConfirm = '请再次确认：真的要删除所有划线和设置吗？';
      
      if (confirm(secondConfirm)) {
        this.clearAllData();
      }
    }
  }

  // 清空所有数据
  async clearAllData() {
    try {
      const confirmToken = Date.now().toString();
      
      const response = await chrome.runtime.sendMessage({
        type: 'CLEAR_DATA',
        confirmToken: confirmToken,
        timestamp: Date.now()
      });

      if (response && response.success) {
        this.showAlert('所有数据已清空！', 'success');
        
        // 重新加载统计信息
        await this.loadStats();
        this.renderStats();
        
        console.log('✅ 数据清空完成');
      } else {
        throw new Error(response?.error || '清空失败');
      }

    } catch (error) {
      console.error('❌ 数据清空失败:', error);
      this.showAlert(`数据清空失败：${error.message}`, 'error');
    }
  }

  // 显示提示信息
  showAlert(message, type = 'success') {
    const alertElement = document.getElementById('alertMessage');
    
    alertElement.textContent = message;
    alertElement.className = `alert alert-${type}`;
    alertElement.classList.remove('hidden');

    // 3秒后自动隐藏
    setTimeout(() => {
      alertElement.classList.add('hidden');
    }, 3000);
  }

  // 工具方法
  getColorLabel(colorName) {
    const color = COLORS.find(c => c.name === colorName);
    return color ? color.label : colorName;
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new WebNoteOptions();
});

console.log('⚙️  WebNote Options 脚本加载完成');