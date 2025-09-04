// WebNote 应用常量

import type { HighlightColor, UserSettings } from '../types';

// 颜色配置
export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#FFEB3B',
  green: '#4CAF50', 
  blue: '#2196F3',
  pink: '#E91E63',
  orange: '#FF9800',
  purple: '#9C27B0',
  red: '#F44336',
  gray: '#9E9E9E'
} as const;

// 颜色透明度版本 (用于 CSS)
export const HIGHLIGHT_COLORS_ALPHA: Record<HighlightColor, string> = {
  yellow: 'rgba(255, 235, 59, 0.4)',
  green: 'rgba(76, 175, 80, 0.4)', 
  blue: 'rgba(33, 150, 243, 0.4)',
  pink: 'rgba(233, 30, 99, 0.4)',
  orange: 'rgba(255, 152, 0, 0.4)',
  purple: 'rgba(156, 39, 176, 0.4)',
  red: 'rgba(244, 67, 54, 0.4)',
  gray: 'rgba(158, 158, 158, 0.4)'
} as const;

// 性能配置
export const PERFORMANCE_CONFIG = {
  // 响应时间目标
  HIGHLIGHT_RESPONSE_TIME: 100, // 划线响应时间 (ms)
  POPUP_SHOW_DELAY: 50, // 弹窗显示延迟 (ms)
  CONSOLE_LOAD_TIME: 200, // 控制台加载时间 (ms)
  SEARCH_DEBOUNCE: 300, // 搜索防抖延迟 (ms)
  STORAGE_OPERATION_TIME: 50, // 存储操作时间 (ms)
  MESSAGE_RESPONSE_TIME: 30, // 消息响应时间 (ms)

  // 容量限制
  MAX_HIGHLIGHTS: 1000, // 最大划线数量
  MAX_HIGHLIGHTS_PER_URL: 50, // 单页面最大划线数量
  MAX_TEXT_LENGTH: 500, // 划线文本长度限制
  MAX_NOTE_LENGTH: 1000, // 笔记长度限制
  MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 总存储限制 (10MB)
  
  // 资源限制
  MAX_MEMORY_USAGE: 50 * 1024 * 1024, // 最大内存使用 (50MB)
  MAX_CPU_USAGE: 5, // 最大CPU使用率 (%)
  MAX_WRITE_FREQUENCY: 10, // 最大写入频率 (/秒)
  
  // 清理阈值
  CLEANUP_THRESHOLD: 900, // 数据清理阈值 (90% of MAX_HIGHLIGHTS)
  PERFORMANCE_SAMPLE_SIZE: 100, // 性能指标采样大小
  ERROR_THRESHOLD: 10 // 错误阈值
} as const;

// 存储键名
export const STORAGE_KEYS = {
  HIGHLIGHTS: 'webnote_highlights',
  SETTINGS: 'webnote_settings', 
  STATS: 'webnote_stats',
  BACKUP: 'webnote_backup',
  PERFORMANCE: 'webnote_performance',
  VERSION: 'webnote_version'
} as const;

// CSS 类名
export const CSS_CLASSES = {
  HIGHLIGHT_MARKER: 'webnote-highlight',
  POPUP_CONTAINER: 'webnote-popup',
  POPUP_OVERLAY: 'webnote-overlay',
  COLOR_BUTTON: 'webnote-color-btn',
  TOOLTIP: 'webnote-tooltip',
  CREATING: 'webnote-creating',
  SELECTED: 'webnote-selected',
  VISIBLE: 'webnote-visible'
} as const;

// Z-Index 层级
export const Z_INDEX = {
  HIGHLIGHT_MARKER: 2147483646,
  POPUP_CONTAINER: 2147483647,
  TOOLTIP: 2147483645,
  OVERLAY: 2147483644
} as const;

// 默认设置
export const DEFAULT_SETTINGS: UserSettings = {
  defaultColor: 'yellow',
  autoBackup: false,
  showNotifications: true,
  showShortcuts: true,
  popupDelay: 200,
  maxHighlights: 1000,
  enableContextMenu: true,
  performanceMode: false,
  theme: 'auto'
} as const;

// 应用信息
export const APP_INFO = {
  NAME: 'WebNote - 网页划线笔记',
  VERSION: '0.1.0',
  AUTHOR: 'WebNote Team',
  WEBSITE: 'https://github.com/webnote/extension',
  PRIVACY_POLICY: 'https://webnote.com/privacy',
  SUPPORT_EMAIL: 'support@webnote.com'
} as const;

// 错误代码
export const ERROR_CODES = {
  STORAGE_FULL: 'STORAGE_FULL',
  INVALID_SELECTION: 'INVALID_SELECTION',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  HIGHLIGHT_LIMIT_EXCEEDED: 'HIGHLIGHT_LIMIT_EXCEEDED',
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
  CONTENT_SCRIPT_ERROR: 'CONTENT_SCRIPT_ERROR',
  BACKGROUND_SCRIPT_ERROR: 'BACKGROUND_SCRIPT_ERROR'
} as const;

// 错误消息
export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  STORAGE_FULL: '存储空间已满，请清理数据或导出备份',
  INVALID_SELECTION: '无效的文本选择，请选择有效的文本内容',
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  PERMISSION_DENIED: '权限被拒绝，请检查扩展权限设置',
  HIGHLIGHT_LIMIT_EXCEEDED: '划线数量已达上限，请删除部分划线或增加限制',
  INVALID_DATA_FORMAT: '数据格式错误，无法导入',
  OPERATION_TIMEOUT: '操作超时，请稍后重试',
  CONTENT_SCRIPT_ERROR: '页面脚本执行错误',
  BACKGROUND_SCRIPT_ERROR: '后台脚本执行错误'
} as const;

// 快捷键映射
export const SHORTCUTS = {
  QUICK_HIGHLIGHT: 'Ctrl+Shift+H',
  OPEN_POPUP: 'Ctrl+Shift+N',
  QUICK_HIGHLIGHT_MAC: 'Command+Shift+H',
  OPEN_POPUP_MAC: 'Command+Shift+N'
} as const;

// 动画持续时间
export const ANIMATIONS = {
  FADE_IN: 150, // ms
  FADE_OUT: 100, // ms
  SCALE_TRANSITION: 150, // ms
  SHIMMER_DURATION: 1500, // ms
  PULSE_DURATION: 200 // ms
} as const;

// 事件名称
export const EVENTS = {
  HIGHLIGHT_CREATED: 'highlight_created',
  HIGHLIGHT_DELETED: 'highlight_deleted',
  HIGHLIGHT_UPDATED: 'highlight_updated',
  SETTINGS_CHANGED: 'settings_changed',
  DATA_IMPORTED: 'data_imported',
  DATA_EXPORTED: 'data_exported',
  ERROR_OCCURRED: 'error_occurred'
} as const;

// 文件导出配置
export const EXPORT_CONFIG = {
  JSON: {
    extension: '.json',
    mimeType: 'application/json',
    name: 'WebNote导出数据'
  },
  CSV: {
    extension: '.csv',
    mimeType: 'text/csv',
    name: 'WebNote划线数据'
  },
  HTML: {
    extension: '.html',
    mimeType: 'text/html',
    name: 'WebNote划线报告'
  }
} as const;

// 性能监控配置
export const PERFORMANCE_MONITORING = {
  ENABLED: true,
  SAMPLE_RATE: 0.1, // 10% 采样率
  MAX_ENTRIES: 1000,
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24小时
  METRICS_RETENTION: 7 * 24 * 60 * 60 * 1000 // 7天
} as const;

// 正则表达式常量
export const REGEX_PATTERNS = {
  URL_VALIDATION: /^https?:\/\/.+/,
  EMAIL_VALIDATION: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  WHITESPACE_ONLY: /^\s*$/,
  HTML_TAGS: /<[^>]*>/g
} as const;