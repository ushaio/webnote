// WebNote 核心数据类型定义

// 核心数据接口
export interface HighlightData {
  id: string;
  text: string;
  color: HighlightColor;
  url: string;
  timestamp: number;
  pageTitle: string;
  position: HighlightPosition;
  note?: string;
  createdAt: string; // ISO 字符串
  updatedAt?: string; // ISO 字符串
  tags?: string[]; // 标签数组
  userId?: string; // 用户标识
}

export interface HighlightPosition {
  selector: string;
  startOffset: number;
  endOffset: number;
  textContent: string;
  xpath: string;
  // 增强的位置信息
  containerTagName?: string;
  containerClassName?: string;
  containerIndex?: number; // 同类型元素的索引
  rangeData?: {
    startContainer: string;
    endContainer: string;
    commonAncestorSelector: string;
  };
}

export type HighlightColor = 
  | 'yellow'
  | 'green' 
  | 'blue'
  | 'pink'
  | 'orange'
  | 'purple'
  | 'red'
  | 'gray';

// 搜索和过滤接口
export interface SearchFilters {
  color?: HighlightColor;
  url?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  keyword?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// 存储数据接口
export interface StorageData {
  highlights: Record<string, HighlightData>; // 使用 Map 结构提高性能
  settings: UserSettings;
  stats: AppStats;
  lastBackup?: number;
  version: string; // 数据版本，用于迁移
}

// 用户设置接口
export interface UserSettings {
  defaultColor: HighlightColor;
  autoBackup: boolean;
  showNotifications: boolean;
  showShortcuts: boolean;
  popupDelay: number; // 弹窗显示延迟(毫秒)
  maxHighlights: number; // 最大划线数量限制
  enableContextMenu: boolean; // 是否启用右键菜单
  performanceMode: boolean; // 性能模式
  theme: 'auto' | 'light' | 'dark'; // 主题设置
}

// 应用统计接口
export interface AppStats {
  totalHighlights: number;
  totalNotes: number;
  colorUsage: Record<HighlightColor, number>; // 各颜色使用次数
  urlStats: Record<string, number>; // 各网站划线数量
  dailyActivity: Record<string, number>; // 按日期的活动统计
  lastUpdate: number;
  performanceMetrics: PerformanceMetrics;
}

// 性能指标接口
export interface PerformanceMetrics {
  averageHighlightTime: number; // 平均划线时间
  averagePopupShowTime: number; // 平均弹窗显示时间
  averageStorageTime: number; // 平均存储操作时间
  memoryUsage: number; // 内存使用量(MB)
  errorCount: number; // 错误次数
  successRate: number; // 成功率 (0-1)
  lastMeasurement: number; // 最后测量时间
}

// 性能监控数据
export interface PerformanceEntry {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}