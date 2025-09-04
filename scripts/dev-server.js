// WebNote 开发服务器 - 支持热重载和实时调试
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class WebNoteDevServer {
  constructor() {
    this.watchers = [];
    this.isWatching = false;
    this.reloadDelay = 1000; // 重载延迟
    this.reloadTimer = null;
    
    // 监听的文件和目录
    this.watchPaths = [
      'manifest.json',
      'content.js',
      'content.css', 
      'background.js',
      'popup.html',
      'popup.js',
      'options.html',
      'options.js',
      'src/**/*.ts',
      'src/**/*.js',
      'assets/**/*'
    ];
  }

  async start() {
    console.log('🚀 WebNote 开发服务器启动中...\n');
    
    try {
      // 1. 验证开发环境
      this.validateDevEnvironment();
      
      // 2. 初始构建
      await this.initialBuild();
      
      // 3. 启动文件监听
      this.startFileWatching();
      
      // 4. 显示开发信息
      this.showDevInfo();
      
      console.log('✅ 开发服务器启动成功！\n');
      console.log('📝 使用说明:');
      console.log('   • 修改源文件后会自动重新构建');
      console.log('   • 在 Chrome 扩展页面点击"重新加载"按钮');
      console.log('   • 按 Ctrl+C 停止开发服务器');
      console.log('\n🔄 开始监听文件变化...\n');
      
    } catch (error) {
      console.error('❌ 开发服务器启动失败:', error.message);
      process.exit(1);
    }
  }

  // 验证开发环境
  validateDevEnvironment() {
    console.log('🔍 验证开发环境...');
    
    // 检查必需文件
    const requiredFiles = ['manifest.json', 'content.js', 'background.js'];
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`缺少必需文件: ${missingFiles.join(', ')}`);
    }
    
    console.log('   ✅ 开发环境验证通过');
  }

  // 初始构建
  async initialBuild() {
    console.log('🔨 执行初始构建...');
    
    const { execSync } = require('child_process');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('   ✅ 初始构建完成');
    } catch (error) {
      throw new Error('初始构建失败');
    }
  }

  // 启动文件监听
  startFileWatching() {
    console.log('👁️  启动文件监听...');
    
    // 创建监听器
    const watcher = chokidar.watch(this.watchPaths, {
      ignored: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '**/*.log',
        '**/*.tmp'
      ],
      persistent: true,
      ignoreInitial: true
    });

    // 绑定事件
    watcher
      .on('change', (filePath) => {
        this.handleFileChange('changed', filePath);
      })
      .on('add', (filePath) => {
        this.handleFileChange('added', filePath);
      })
      .on('unlink', (filePath) => {
        this.handleFileChange('deleted', filePath);
      })
      .on('error', (error) => {
        console.error('👁️  文件监听错误:', error);
      });

    this.watchers.push(watcher);
    this.isWatching = true;
    
    console.log(`   ✅ 正在监听 ${this.watchPaths.length} 个路径`);
  }

  // 处理文件变化
  handleFileChange(event, filePath) {
    const timestamp = new Date().toLocaleTimeString();
    const eventEmoji = {
      changed: '📝',
      added: '➕', 
      deleted: '➖'
    };
    
    console.log(`${eventEmoji[event] || '📁'} [${timestamp}] ${event}: ${filePath}`);
    
    // 延迟重新构建以避免频繁触发
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    
    this.reloadTimer = setTimeout(() => {
      this.rebuild();
    }, this.reloadDelay);
  }

  // 重新构建
  async rebuild() {
    console.log('\n🔄 检测到文件变化，重新构建中...');
    
    const startTime = Date.now();
    
    try {
      const { execSync } = require('child_process');
      execSync('npm run build', { stdio: 'pipe' });
      
      const buildTime = Date.now() - startTime;
      console.log(`✅ 重新构建完成 (${buildTime}ms)`);
      console.log('💡 请在 Chrome 扩展页面点击"重新加载"按钮\n');
      
    } catch (error) {
      console.error('❌ 重新构建失败:', error.message);
      console.log('🔄 继续监听文件变化...\n');
    }
  }

  // 显示开发信息
  showDevInfo() {
    console.log('📊 开发环境信息:');
    
    // 读取项目信息
    const packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
    
    console.log(`   📦 项目名称: ${packageInfo.name}`);
    console.log(`   🏷️  版本号: ${manifest.version}`);
    console.log(`   🎯 扩展名称: ${manifest.name}`);
    console.log(`   📱 Manifest 版本: V${manifest.manifest_version}`);
    
    // 显示有用的链接
    console.log('\n🔗 有用链接:');
    console.log('   • Chrome 扩展页面: chrome://extensions/');
    console.log('   • 开发者工具: chrome://extensions/?developer=true');
    console.log('   • 扩展调试: 右键扩展图标 > 检查弹出内容');
  }

  // 停止开发服务器
  stop() {
    console.log('\n🛑 停止开发服务器...');
    
    // 清理监听器
    this.watchers.forEach(watcher => {
      watcher.close();
    });
    
    // 清理定时器
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    
    this.isWatching = false;
    console.log('✅ 开发服务器已停止');
  }
}

// 主函数
async function main() {
  const devServer = new WebNoteDevServer();
  
  // 处理进程退出
  process.on('SIGINT', () => {
    devServer.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    devServer.stop();
    process.exit(0);
  });
  
  await devServer.start();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('开发服务器错误:', error);
    process.exit(1);
  });
}

module.exports = WebNoteDevServer;