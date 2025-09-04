// Chrome 扩展消息传递类型定义

import type { HighlightData, SearchFilters, UserSettings, AppStats, PerformanceEntry } from './index';

// 基础消息接口
export interface BaseMessage {
  type: string;
  tabId?: number;
  timestamp: number;
  requestId?: string; // 用于追踪请求响应
}

// Content Script -> Background Script 消息
export interface CreateHighlightMessage extends BaseMessage {
  type: 'CREATE_HIGHLIGHT';
  data: Omit<HighlightData, 'id' | 'timestamp' | 'createdAt'>;
}

export interface DeleteHighlightMessage extends BaseMessage {
  type: 'DELETE_HIGHLIGHT';
  highlightId: string;
}

export interface UpdateHighlightMessage extends BaseMessage {
  type: 'UPDATE_HIGHLIGHT';
  highlightId: string;
  updates: Partial<HighlightData>;
}

export interface GetHighlightsForUrlMessage extends BaseMessage {
  type: 'GET_HIGHLIGHTS_FOR_URL';
  url: string;
}

export interface QuickHighlightMessage extends BaseMessage {
  type: 'QUICK_HIGHLIGHT';
  text: string;
  color: string;
}

export interface ToggleHighlightMessage extends BaseMessage {
  type: 'TOGGLE_HIGHLIGHT';
}

// Background Script -> Content Script 消息
export interface HighlightCreatedMessage extends BaseMessage {
  type: 'HIGHLIGHT_CREATED';
  data: HighlightData;
}

export interface HighlightDeletedMessage extends BaseMessage {
  type: 'HIGHLIGHT_DELETED';
  highlightId: string;
}

export interface HighlightUpdatedMessage extends BaseMessage {
  type: 'HIGHLIGHT_UPDATED';
  data: HighlightData;
}

// Popup -> Background Script 消息
export interface GetAllHighlightsMessage extends BaseMessage {
  type: 'GET_ALL_HIGHLIGHTS';
  filters?: SearchFilters;
}

export interface GetStatsMessage extends BaseMessage {
  type: 'GET_STATS';
}

export interface UpdateSettingsMessage extends BaseMessage {
  type: 'UPDATE_SETTINGS';
  settings: Partial<UserSettings>;
}

export interface GetSettingsMessage extends BaseMessage {
  type: 'GET_SETTINGS';
}

export interface ExportDataMessage extends BaseMessage {
  type: 'EXPORT_DATA';
  format?: 'json' | 'csv' | 'html'; // 导出格式
}

export interface ImportDataMessage extends BaseMessage {
  type: 'IMPORT_DATA';
  data: any;
  merge?: boolean; // 是否合并现有数据
}

export interface ClearDataMessage extends BaseMessage {
  type: 'CLEAR_DATA';
  confirmToken: string; // 安全确认令牌
}

export interface BackupDataMessage extends BaseMessage {
  type: 'BACKUP_DATA';
  destination?: 'local' | 'export';
}

export interface SearchHighlightsMessage extends BaseMessage {
  type: 'SEARCH_HIGHLIGHTS';
  query: string;
  filters?: SearchFilters;
}

// 性能监控消息
export interface ReportPerformanceMessage extends BaseMessage {
  type: 'REPORT_PERFORMANCE';
  entry: PerformanceEntry;
}

export interface GetPerformanceStatsMessage extends BaseMessage {
  type: 'GET_PERFORMANCE_STATS';
}

// 错误报告消息
export interface ReportErrorMessage extends BaseMessage {
  type: 'REPORT_ERROR';
  error: {
    message: string;
    stack?: string;
    component: 'content' | 'background' | 'popup';
    operation?: string;
    userAgent?: string;
  };
}

// 响应消息接口
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: number;
  requestId?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: number;
  requestId?: string;
  errorCode?: string;
}

export type MessageResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// 特定响应类型
export interface HighlightsResponse {
  highlights: HighlightData[];
  total: number;
  hasMore?: boolean;
}

export interface StatsResponse {
  stats: AppStats;
  lastUpdate: number;
}

export interface SettingsResponse {
  settings: UserSettings;
}

export interface ExportResponse {
  data: string; // JSON 或 CSV 格式的字符串
  format: 'json' | 'csv' | 'html';
  filename: string;
  size: number; // 字节数
}

// 批量操作消息
export interface BatchOperationMessage extends BaseMessage {
  type: 'BATCH_OPERATION';
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    id?: string;
    data?: any;
  }>;
}

// 同步消息 (未来扩展用)
export interface SyncMessage extends BaseMessage {
  type: 'SYNC_REQUEST' | 'SYNC_RESPONSE';
  syncData?: {
    lastSyncTime: number;
    changes: HighlightData[];
    deleted: string[];
  };
}

// 消息联合类型
export type ContentToBackgroundMessage = 
  | CreateHighlightMessage
  | DeleteHighlightMessage  
  | UpdateHighlightMessage
  | GetHighlightsForUrlMessage
  | ReportPerformanceMessage
  | ReportErrorMessage;

export type BackgroundToContentMessage = 
  | HighlightCreatedMessage
  | HighlightDeletedMessage
  | HighlightUpdatedMessage
  | QuickHighlightMessage
  | ToggleHighlightMessage;

export type PopupToBackgroundMessage = 
  | GetAllHighlightsMessage
  | GetStatsMessage
  | UpdateSettingsMessage
  | GetSettingsMessage
  | ExportDataMessage
  | ImportDataMessage
  | ClearDataMessage
  | BackupDataMessage
  | SearchHighlightsMessage
  | GetPerformanceStatsMessage;

export type BackgroundToPopupMessage = 
  | MessageResponse<HighlightsResponse>
  | MessageResponse<StatsResponse>
  | MessageResponse<SettingsResponse>
  | MessageResponse<ExportResponse>;

// 所有消息的联合类型
export type AllMessages = 
  | ContentToBackgroundMessage
  | BackgroundToContentMessage
  | PopupToBackgroundMessage
  | BatchOperationMessage
  | SyncMessage;