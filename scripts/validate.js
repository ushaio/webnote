// 简单的开发构建脚本
const fs = require('fs');
const path = require('path');

// 检查 TypeScript 配置是否正确
function validateTypeScript() {
  try {
    const tsConfig = require('../tsconfig.json');
    console.log('✅ TypeScript 配置验证通过');
    return true;
  } catch (error) {
    console.error('❌ TypeScript 配置验证失败:', error.message);
    return false;
  }
}

// 检查项目结构
function validateProjectStructure() {
  const requiredDirs = [
    'src/shared/types',
    'src/shared/utils', 
    'src/shared/constants',
    'src/contents',
    'src/background',
    'src/popup',
    'src/options'
  ];
  
  let allExist = true;
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ 目录存在: ${dir}`);
    } else {
      console.log(`❌ 目录缺失: ${dir}`);
      allExist = false;
    }
  });
  
  return allExist;
}

// 验证关键文件
function validateFiles() {
  const requiredFiles = [
    'manifest.json',
    'src/shared/types/index.ts',
    'src/shared/types/messages.ts',
    'src/shared/constants/index.ts',
    'src/shared/utils/index.ts'
  ];
  
  let allExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ 文件存在: ${file}`);
    } else {
      console.log(`❌ 文件缺失: ${file}`);
      allExist = false;
    }
  });
  
  return allExist;
}

// 主验证函数
function main() {
  console.log('🔍 WebNote 项目验证开始...\n');
  
  const tsValid = validateTypeScript();
  const structureValid = validateProjectStructure();
  const filesValid = validateFiles();
  
  if (tsValid && structureValid && filesValid) {
    console.log('\n🎉 项目配置验证通过！');
    console.log('📁 项目结构正确');
    console.log('⚙️ TypeScript 配置正确');
    console.log('📄 核心文件已创建');
  } else {
    console.log('\n❌ 项目配置验证失败！');
    process.exit(1);
  }
}

main();