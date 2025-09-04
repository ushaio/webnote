// 样式系统验证工具
const fs = require('fs');
const path = require('path');

// 检查 CSS 文件是否存在
function validateCSSFiles() {
  const requiredFiles = [
    'src/shared/styles/globals.css',
    'content.css',
    'tailwind.config.js',
    'postcss.config.js'
  ];
  
  let allExist = true;
  console.log('🎨 检查样式文件...\n');
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`❌ 缺失: ${file}`);
      allExist = false;
    }
  });
  
  return allExist;
}

// 验证 Tailwind 配置
function validateTailwindConfig() {
  try {
    const config = require('../tailwind.config.js');
    console.log('\n🔍 Tailwind 配置验证:');
    
    // 检查自定义颜色
    if (config.theme.extend.colors.highlight) {
      console.log('✅ 划线颜色配置正确');
      const colors = Object.keys(config.theme.extend.colors.highlight);
      console.log(`   支持颜色: ${colors.join(', ')}`);
    } else {
      console.log('❌ 缺少划线颜色配置');
      return false;
    }
    
    // 检查 Z-Index 配置
    if (config.theme.extend.zIndex) {
      console.log('✅ Z-Index 层级配置正确');
    } else {
      console.log('❌ 缺少 Z-Index 配置');
      return false;
    }
    
    // 检查自定义插件
    if (config.plugins && config.plugins.length > 0) {
      console.log('✅ 自定义插件配置正确');
    } else {
      console.log('⚠️  未发现自定义插件');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Tailwind 配置验证失败: ${error.message}`);
    return false;
  }
}

// 检查 UI 工具类
function validateUIUtilities() {
  const uiUtilsPath = 'src/shared/utils/ui.ts';
  
  console.log('\n🛠️  UI 工具类验证:');
  
  if (!fs.existsSync(uiUtilsPath)) {
    console.log('❌ UI 工具类文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(uiUtilsPath, 'utf-8');
  
  const requiredFunctions = [
    'getHighlightColorClass',
    'getColorHex',
    'getButtonClasses',
    'calculatePopupPosition'
  ];
  
  let allFunctionsExist = true;
  requiredFunctions.forEach(func => {
    if (content.includes(`export const ${func}`)) {
      console.log(`✅ ${func} 函数存在`);
    } else {
      console.log(`❌ 缺失函数: ${func}`);
      allFunctionsExist = false;
    }
  });
  
  return allFunctionsExist;
}

// 生成样式报告
function generateStyleReport() {
  const report = {
    timestamp: new Date().toISOString(),
    cssFiles: validateCSSFiles(),
    tailwindConfig: validateTailwindConfig(), 
    uiUtilities: validateUIUtilities(),
    status: 'UNKNOWN'
  };
  
  report.status = (report.cssFiles && report.tailwindConfig && report.uiUtilities) 
    ? 'READY' 
    : 'INCOMPLETE';
  
  // 保存报告
  fs.writeFileSync(
    'scripts/style-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📊 样式系统报告已生成: scripts/style-report.json');
  return report;
}

// 主函数
function main() {
  console.log('🎨 WebNote 样式系统验证\n');
  
  const report = generateStyleReport();
  
  if (report.status === 'READY') {
    console.log('\n✅ 样式系统配置完成！');
    console.log('🎯 Tailwind CSS 和 UI 工具已就绪');
    console.log('💄 可以开始开发用户界面组件');
  } else {
    console.log('\n❌ 样式系统配置不完整');
    console.log('💡 请检查缺失的文件和配置');
  }
  
  // 显示功能概览
  console.log('\n📋 可用功能:');
  console.log('   • 8种划线颜色支持');
  console.log('   • 高优先级 Z-Index 层级');
  console.log('   • 响应式设计支持');
  console.log('   • Content Script 样式隔离');
  console.log('   • UI 工具类和动画');
}

if (require.main === module) {
  main();
}

module.exports = {
  validateCSSFiles,
  validateTailwindConfig,
  validateUIUtilities,
  generateStyleReport
};