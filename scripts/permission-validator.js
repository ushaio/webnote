// Chrome 扩展权限验证工具
const fs = require('fs');

// 验证 manifest.json 结构和权限配置
function validateManifest() {
  console.log('🔐 Chrome 扩展权限验证\n');
  
  try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
    
    // 基础信息检查
    console.log('📋 基础信息检查:');
    const requiredFields = ['manifest_version', 'name', 'version', 'description'];
    let basicInfoValid = true;
    
    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`✅ ${field}: ${manifest[field]}`);
      } else {
        console.log(`❌ 缺失: ${field}`);
        basicInfoValid = false;
      }
    });
    
    // Manifest V3 检查
    console.log('\n🔍 Manifest 版本检查:');
    if (manifest.manifest_version === 3) {
      console.log('✅ 使用 Manifest V3 (推荐)');
    } else {
      console.log('⚠️  建议使用 Manifest V3');
    }
    
    // 权限检查
    console.log('\n🔐 权限配置检查:');
    const permissions = manifest.permissions || [];
    const hostPermissions = manifest.host_permissions || [];
    
    console.log(`✅ 基础权限: ${permissions.join(', ')}`);
    console.log(`✅ 主机权限: ${hostPermissions.join(', ')}`);
    
    // 关键权限验证
    const requiredPermissions = ['storage', 'activeTab', 'scripting'];
    const missingPermissions = requiredPermissions.filter(p => !permissions.includes(p));
    
    if (missingPermissions.length === 0) {
      console.log('✅ 所有必需权限已配置');
    } else {
      console.log(`❌ 缺失权限: ${missingPermissions.join(', ')}`);
    }
    
    // Content Scripts 检查
    console.log('\n📜 Content Scripts 检查:');
    if (manifest.content_scripts && manifest.content_scripts.length > 0) {
      const cs = manifest.content_scripts[0];
      console.log(`✅ 匹配模式: ${cs.matches.join(', ')}`);
      console.log(`✅ JavaScript 文件: ${cs.js.join(', ')}`);
      console.log(`✅ CSS 文件: ${cs.css.join(', ')}`);
      console.log(`✅ 运行时机: ${cs.run_at}`);
    } else {
      console.log('❌ 未配置 Content Scripts');
    }
    
    // Background Script 检查
    console.log('\n🔧 Background Script 检查:');
    if (manifest.background) {
      if (manifest.background.service_worker) {
        console.log(`✅ Service Worker: ${manifest.background.service_worker}`);
        console.log(`✅ 类型: ${manifest.background.type || 'classic'}`);
      } else {
        console.log('❌ 未配置 Service Worker');
      }
    } else {
      console.log('❌ 未配置 Background Script');
    }
    
    // Action 配置检查
    console.log('\n🎯 Action 配置检查:');
    if (manifest.action) {
      console.log(`✅ 弹窗页面: ${manifest.action.default_popup}`);
      console.log(`✅ 标题: ${manifest.action.default_title}`);
      
      if (manifest.action.default_icon) {
        const iconSizes = Object.keys(manifest.action.default_icon);
        console.log(`✅ Action 图标: ${iconSizes.join(', ')}`);
      }
    } else {
      console.log('❌ 未配置 Action');
    }
    
    // 图标检查
    console.log('\n🖼️  图标配置检查:');
    if (manifest.icons) {
      const iconSizes = Object.keys(manifest.icons);
      console.log(`✅ 扩展图标: ${iconSizes.join(', ')}`);
      
      // 检查推荐的图标尺寸
      const recommendedSizes = ['16', '32', '48', '128'];
      const missingSizes = recommendedSizes.filter(size => !iconSizes.includes(size));
      
      if (missingSizes.length === 0) {
        console.log('✅ 所有推荐图标尺寸已配置');
      } else {
        console.log(`⚠️  建议添加图标尺寸: ${missingSizes.join(', ')}`);
      }
    }
    
    // Web Accessible Resources 检查
    console.log('\n🌐 Web Accessible Resources 检查:');
    if (manifest.web_accessible_resources) {
      const resources = manifest.web_accessible_resources[0];
      console.log(`✅ 可访问资源: ${resources.resources.join(', ')}`);
      console.log(`✅ 匹配模式: ${resources.matches.join(', ')}`);
    } else {
      console.log('⚠️  未配置 Web Accessible Resources');
    }
    
    // 快捷键检查
    console.log('\n⌨️  快捷键配置检查:');
    if (manifest.commands) {
      const commands = Object.keys(manifest.commands);
      console.log(`✅ 配置的快捷键: ${commands.join(', ')}`);
      
      commands.forEach(cmd => {
        const command = manifest.commands[cmd];
        if (command.suggested_key) {
          console.log(`   ${cmd}: ${command.suggested_key.default} (${command.description})`);
        }
      });
    } else {
      console.log('⚠️  未配置快捷键');
    }
    
    // CSP 检查
    console.log('\n🛡️  内容安全策略检查:');
    if (manifest.content_security_policy) {
      console.log(`✅ CSP 已配置: ${manifest.content_security_policy.extension_pages}`);
    } else {
      console.log('⚠️  未配置内容安全策略');
    }
    
    return {
      valid: basicInfoValid,
      manifest: manifest,
      permissions: permissions,
      hostPermissions: hostPermissions
    };
    
  } catch (error) {
    console.log(`❌ Manifest 解析失败: ${error.message}`);
    return { valid: false };
  }
}

// 生成权限报告
function generatePermissionReport() {
  const result = validateManifest();
  
  const report = {
    timestamp: new Date().toISOString(),
    manifestValid: result.valid,
    permissions: result.permissions || [],
    hostPermissions: result.hostPermissions || [],
    securityLevel: 'STANDARD',
    recommendations: []
  };
  
  // 安全级别评估
  if (result.permissions && result.permissions.includes('downloads')) {
    report.securityLevel = 'ELEVATED';
    report.recommendations.push('包含文件下载权限，确保仅用于导出功能');
  }
  
  if (result.hostPermissions && result.hostPermissions.includes('https://*/*')) {
    report.recommendations.push('具有所有 HTTPS 站点访问权限，确保内容脚本安全');
  }
  
  // 保存报告
  fs.writeFileSync(
    'scripts/permission-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📊 权限报告已生成: scripts/permission-report.json');
  return report;
}

// 主函数
function main() {
  const report = generatePermissionReport();
  
  if (report.manifestValid) {
    console.log('\n✅ Manifest 配置验证通过！');
    console.log(`🔐 权限级别: ${report.securityLevel}`);
    console.log('🎯 准备配置 Content Scripts');
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 安全建议:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
  } else {
    console.log('\n❌ Manifest 配置存在问题');
    console.log('🔧 请检查并修复配置错误');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateManifest,
  generatePermissionReport
};