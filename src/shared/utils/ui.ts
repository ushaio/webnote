// UI 工具类 - 用于组件样式和交互

import type { HighlightColor } from '../types';

// 颜色映射工具
export const getHighlightColorClass = (color: HighlightColor): string => {
  const colorMap = {
    yellow: 'bg-yellow-200 hover:bg-yellow-300',
    green: 'bg-green-200 hover:bg-green-300', 
    blue: 'bg-blue-200 hover:bg-blue-300',
    pink: 'bg-pink-200 hover:bg-pink-300',
    orange: 'bg-orange-200 hover:bg-orange-300',
    purple: 'bg-purple-200 hover:bg-purple-300',
    red: 'bg-red-200 hover:bg-red-300',
    gray: 'bg-gray-200 hover:bg-gray-300'
  };
  
  return colorMap[color] || colorMap.yellow;
};

// 获取颜色的十六进制值
export const getColorHex = (color: HighlightColor): string => {
  const colorMap = {
    yellow: '#FFEB3B',
    green: '#4CAF50',
    blue: '#2196F3', 
    pink: '#E91E63',
    orange: '#FF9800',
    purple: '#9C27B0',
    red: '#F44336',
    gray: '#9E9E9E'
  };
  
  return colorMap[color] || colorMap.yellow;
};

// Tailwind 按钮样式工具
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'danger' = 'primary'): string => {
  const baseClasses = 'px-3 py-2 rounded-md font-medium transition-colors duration-150';
  
  const variantMap = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  return `${baseClasses} ${variantMap[variant]}`;
};

// 输入框样式
export const getInputClasses = (): string => {
  return 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
};

// 卡片容器样式  
export const getCardClasses = (): string => {
  return 'bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-150';
};

// 颜色选择器按钮样式
export const getColorButtonClasses = (color: HighlightColor, isActive: boolean = false): string => {
  const baseClasses = 'w-6 h-6 rounded border-2 cursor-pointer transition-all duration-150';
  const activeClasses = isActive ? 'scale-110 border-gray-600' : 'border-white hover:scale-105';
  
  return `${baseClasses} ${activeClasses}`;
};

// 响应式网格类
export const getGridClasses = (cols: number = 1): string => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return `grid gap-4 ${colsMap[cols] || colsMap[1]}`;
};

// 文本截断样式
export const getTruncateClasses = (lines: number = 1): string => {
  if (lines === 1) {
    return 'truncate';
  }
  
  return `overflow-hidden display-webkit-box webkit-line-clamp-${lines} webkit-box-orient-vertical`;
};

// 加载状态样式
export const getLoadingClasses = (): string => {
  return 'animate-pulse bg-gray-200 rounded';
};

// 徽章样式
export const getBadgeClasses = (color: HighlightColor): string => {
  const colorMap = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800', 
    pink: 'bg-pink-100 text-pink-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  
  return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorMap[color]}`;
};

// 浮窗定位计算
export const calculatePopupPosition = (
  selectionRect: DOMRect,
  popupWidth: number = 200,
  popupHeight: number = 40
): { top: number; left: number } => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = selectionRect.top - popupHeight - 10;
  let left = selectionRect.left + (selectionRect.width / 2) - (popupWidth / 2);
  
  // 上边界检查
  if (top < 10) {
    top = selectionRect.bottom + 10;
  }
  
  // 左边界检查
  if (left < 10) {
    left = 10;
  }
  
  // 右边界检查
  if (left + popupWidth > viewportWidth - 10) {
    left = viewportWidth - popupWidth - 10;
  }
  
  // 下边界检查
  if (top + popupHeight > viewportHeight - 10) {
    top = viewportHeight - popupHeight - 10;
  }
  
  return { top, left };
};