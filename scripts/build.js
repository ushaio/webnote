// WebNote Chrome 扩展构建脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WebNoteBuildSystem {
  constructor() {
    this.buildDir = 'dist';
    this.sourceFiles = [
      'manifest.json',
      'content.js',
      'content.css',
      'background.js',
      'popup.html',
      'popup.js',
      'options.html',
      'options.js'
    ];
    this.assetDirs = ['assets'];
    this.buildStartTime = Date.now();
  }

  async build() {
    console.log('🚀 开始构建 WebNote Chrome 扩展...\n');

    try {
      // 1. 清理构建目录
      await this.cleanBuildDir();
      
      // 2. 创建构建目录
      await this.createBuildDir();
      
      // 3. 验证源文件
      await this.validateSourceFiles();
      
      // 4. 复制核心文件
      await this.copySourceFiles();
      
      // 5. 复制资源文件
      await this.copyAssets();
      
      // 6. 优化文件
      await this.optimizeFiles();
      
      // 7. 验证构建结果
      await this.validateBuild();
      
      // 8. 生成构建报告
      await this.generateBuildReport();
      
      // 9. 创建分发包
      await this.createDistributionPackage();
      
      const buildTime = Date.now() - this.buildStartTime;
      console.log(`\n✅ 构建完成！耗时: ${buildTime}ms`);
      console.log(`📦 构建产物位置: ${this.buildDir}/`);
      console.log(`🎯 可以加载到 Chrome 扩展程序中测试`);

    } catch (error) {
      console.error('\n❌ 构建失败:', error.message);
      process.exit(1);
    }
  }

  // 清理构建目录
  async cleanBuildDir() {
    console.log('🧹 清理构建目录...');
    
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
      console.log('   ✅ 旧构建文件已清理');
    }
  }

  // 创建构建目录
  async createBuildDir() {
    console.log('📁 创建构建目录...');
    
    fs.mkdirSync(this.buildDir, { recursive: true });
    console.log(`   ✅ 目录已创建: ${this.buildDir}/`);
  }

  // 验证源文件
  async validateSourceFiles() {
    console.log('🔍 验证源文件...');
    
    const missingFiles = [];
    
    for (const file of this.sourceFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      throw new Error(`缺少源文件: ${missingFiles.join(', ')}`);
    }
    
    // 验证 manifest.json
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
    if (!manifest.manifest_version || !manifest.name || !manifest.version) {
      throw new Error('manifest.json 格式错误');
    }
    
    console.log(`   ✅ 所有源文件验证通过 (${this.sourceFiles.length} 个文件)`);
  }

  // 复制源文件
  async copySourceFiles() {
    console.log('📋 复制核心文件...');
    
    for (const file of this.sourceFiles) {
      const destPath = path.join(this.buildDir, file);
      const destDir = path.dirname(destPath);
      
      // 确保目标目录存在
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(file, destPath);
      
      const stats = fs.statSync(file);
      console.log(`   ✅ ${file} (${this.formatBytes(stats.size)})`);
    }
  }

  // 复制资源文件
  async copyAssets() {
    console.log('🖼️  复制资源文件...');
    
    for (const assetDir of this.assetDirs) {
      if (fs.existsSync(assetDir)) {
        const destAssetDir = path.join(this.buildDir, assetDir);
        this.copyDirRecursive(assetDir, destAssetDir);
        console.log(`   ✅ ${assetDir}/ 已复制`);
      } else {
        console.log(`   ⚠️  ${assetDir}/ 不存在，跳过`);
      }
    }
  }

  // 优化文件
  async optimizeFiles() {
    console.log('⚡ 优化文件...');
    
    // 压缩 JSON 文件
    const manifestPath = path.join(this.buildDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 0));
    console.log('   ✅ manifest.json 已压缩');
    
    // 移除开发环境代码
    this.removeDevCode();
    
    // 优化 CSS
    this.optimizeCSS();
    
    console.log('   ✅ 文件优化完成');
  }

  // 移除开发环境代码
  removeDevCode() {
    const jsFiles = ['content.js', 'background.js', 'popup.js', 'options.js'];
    
    jsFiles.forEach(file => {
      const filePath = path.join(this.buildDir, file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // 移除 console.log 语句 - 临时禁用以进行调试
        // 移除简单的单行 console.log
        // content = content.replace(/^\s*console\.log\s*\([^)]*\);\s*$/gm, '');
        
        // 移除模板字符串形式的 console.log
        // content = content.replace(/^\s*console\.log\s*\(`[^`]*`\);\s*$/gm, '');
        
        // 移除多行模板字符串的 console.log (更谨慎的处理)
        // content = content.replace(/console\.log\s*\(`[\s\S]*?`\);\s*\n?/g, '');
        
        // 移除其他形式的 console 调用
        // content = content.replace(/^\s*console\.(warn|error|info)\s*\([^)]*\);\s*$/gm, '');
        
        // 移除由于console.log移除而产生的未使用变量
        // content = content.replace(/^\s*const\s+\w+Time\s*=\s*performance\.now\(\)\s*-\s*startTime;\s*$/gm, '');
        // content = content.replace(/^\s*const\s+\w+Time\s*=\s*Date\.now\(\)\s*-\s*\w+;\s*$/gm, '');
        
        // 移除开发环境注释
        content = content.replace(/\/\* DEV:.*?\*\//gs, '');
        content = content.replace(/\/\/ DEV:.*?\n/g, '');
        
        fs.writeFileSync(filePath, content);
      }
    });
  }

  // 优化 CSS
  optimizeCSS() {
    const cssFile = path.join(this.buildDir, 'content.css');
    if (fs.existsSync(cssFile)) {
      let content = fs.readFileSync(cssFile, 'utf-8');
      
      // 基本的 CSS 压缩（移除多余空白）
      content = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
        .replace(/\s+/g, ' ') // 压缩空白
        .replace(/;\s*}/g, '}') // 移除最后的分号
        .replace(/{\s+/g, '{') // 压缩大括号
        .replace(/}\s+/g, '}')
        .trim();
      
      fs.writeFileSync(cssFile, content);
    }
  }

  // 验证构建结果
  async validateBuild() {
    console.log('✅ 验证构建结果...');
    
    // 检查所有必需文件
    for (const file of this.sourceFiles) {
      const builtFile = path.join(this.buildDir, file);
      if (!fs.existsSync(builtFile)) {
        throw new Error(`构建文件缺失: ${file}`);
      }
    }
    
    // 验证 manifest.json 格式
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(this.buildDir, 'manifest.json'), 'utf-8'));
      if (!manifest.manifest_version) {
        throw new Error('manifest.json 格式无效');
      }
    } catch (error) {
      throw new Error(`manifest.json 解析错误: ${error.message}`);
    }
    
    console.log('   ✅ 构建结果验证通过');
  }

  // 生成构建报告
  async generateBuildReport() {
    console.log('📊 生成构建报告...');
    
    const report = {
      buildTime: new Date().toISOString(),
      version: JSON.parse(fs.readFileSync('manifest.json', 'utf-8')).version,
      files: {},
      totalSize: 0,
      optimization: {
        jsFiles: 0,
        cssFiles: 0,
        totalOptimized: 0
      }
    };
    
    // 统计文件信息
    const calculateDirSize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          size += calculateDirSize(filePath);
        } else {
          const relativePath = path.relative(this.buildDir, filePath);
          report.files[relativePath] = {
            size: stats.size,
            type: path.extname(file) || 'unknown'
          };
          size += stats.size;
        }
      }
      
      return size;
    };
    
    report.totalSize = calculateDirSize(this.buildDir);
    
    // 保存报告
    const reportPath = path.join(this.buildDir, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   ✅ 构建报告: ${reportPath}`);
    console.log(`   📊 总大小: ${this.formatBytes(report.totalSize)}`);
    console.log(`   📁 文件数: ${Object.keys(report.files).length} 个`);
  }

  // 创建分发包
  async createDistributionPackage() {
    console.log('📦 创建分发包...');
    
    try {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
      const packageName = `webnote-v${manifest.version}.zip`;
      
      // 检查是否有 zip 命令
      try {
        execSync('zip -v', { stdio: 'ignore' });
        
        // 创建 ZIP 包
        const zipCommand = `cd ${this.buildDir} && zip -r ../${packageName} . -x build-report.json`;
        execSync(zipCommand, { stdio: 'inherit' });
        
        const zipStats = fs.statSync(packageName);
        console.log(`   ✅ ZIP 包已创建: ${packageName} (${this.formatBytes(zipStats.size)})`);
        
      } catch (error) {
        console.log('   ⚠️  ZIP 命令不可用，跳过创建 ZIP 包');
        console.log('   💡 可以手动将 dist/ 目录压缩为 ZIP 文件');
      }
      
    } catch (error) {
      console.log(`   ⚠️  创建分发包失败: ${error.message}`);
    }
  }

  // 工具方法
  copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stats = fs.statSync(srcPath);
      
      if (stats.isDirectory()) {
        this.copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

// 主函数
async function main() {
  const builder = new WebNoteBuildSystem();
  await builder.build();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('构建失败:', error);
    process.exit(1);
  });
}

module.exports = WebNoteBuildSystem;