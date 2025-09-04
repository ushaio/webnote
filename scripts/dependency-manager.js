// WebNote 项目依赖管理器
const fs = require('fs');
const path = require('path');

// 核心依赖和开发依赖列表
const projectDependencies = {
  core: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0', 
    'zustand': '^4.4.0'
  },
  dev: {
    '@types/chrome': '^0.0.246',
    '@types/react': '^18.2.37',
    '@types/react-dom': '^18.2.15',
    'typescript': '^5.3.0'
  },
  optional: {
    'plasmo': '^0.84.0' // 可选，如果环境支持
  }
};

// 检查依赖状态
function checkDependencies() {
  console.log('📦 检查项目依赖状态...\n');
  
  const packageJson = require('../package.json');
  const currentDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  let allGood = true;
  
  // 检查核心依赖
  console.log('🔍 核心依赖检查:');
  Object.entries(projectDependencies.core).forEach(([name, version]) => {
    if (currentDeps[name]) {
      console.log(`✅ ${name}: ${currentDeps[name]}`);
    } else {
      console.log(`❌ 缺失: ${name}`);
      allGood = false;
    }
  });
  
  // 检查开发依赖
  console.log('\n🔍 开发依赖检查:');
  Object.entries(projectDependencies.dev).forEach(([name, version]) => {
    if (currentDeps[name]) {
      console.log(`✅ ${name}: ${currentDeps[name]}`);
    } else {
      console.log(`❌ 缺失: ${name}`);
      allGood = false;
    }
  });
  
  return allGood;
}

// 生成依赖报告
function generateDependencyReport() {
  const report = {
    timestamp: new Date().toISOString(),
    status: checkDependencies() ? 'READY' : 'MISSING_DEPS',
    structure: {
      'src/shared/types': fs.existsSync('src/shared/types'),
      'src/shared/utils': fs.existsSync('src/shared/utils'),
      'src/shared/constants': fs.existsSync('src/shared/constants'),
      'src/contents': fs.existsSync('src/contents'),
      'src/background': fs.existsSync('src/background'),
      'src/popup': fs.existsSync('src/popup'),
      'src/options': fs.existsSync('src/options')
    }
  };
  
  // 写入报告
  fs.writeFileSync(
    'scripts/dependency-report.json', 
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📊 依赖报告已生成: scripts/dependency-report.json');
  return report;
}

// 主函数
function main() {
  console.log('🚀 WebNote 依赖管理器\n');
  
  const report = generateDependencyReport();
  
  if (report.status === 'READY') {
    console.log('\n✅ 项目依赖检查完成 - 状态良好');
    console.log('🎯 可以继续核心功能开发');
  } else {
    console.log('\n⚠️  存在依赖问题，但项目可以继续');
    console.log('💡 建议：在生产部署前安装完整依赖');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkDependencies,
  generateDependencyReport,
  projectDependencies
};