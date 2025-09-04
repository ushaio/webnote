// 创建临时 PNG 图标文件的脚本
const fs = require('fs');
const path = require('path');

function createTempPNGIcon(size, outputPath) {
  // 创建一个最小的有效 PNG 文件 (1x1 透明像素)
  const width = size;
  const height = size;
  
  // PNG 文件头
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrCRC = calculateCRC(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // length
    Buffer.from('IHDR'),
    ihdrData,
    ihdrCRC
  ]);
  
  // 创建一个简单的蓝色正方形图像数据
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    pixelData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      // RGBA: 蓝色图标
      pixelData.push(0x66, 0x7e, 0xea, 0xff); // 蓝色不透明
    }
  }
  
  // 使用 zlib 压缩 (简化版)
  const rawData = Buffer.from(pixelData);
  
  // 简化的 IDAT chunk (未压缩)
  const idatData = rawData;
  const idatCRC = calculateCRC(Buffer.concat([Buffer.from('IDAT'), idatData]));
  const idat = Buffer.concat([
    Buffer.alloc(4), // length placeholder
    Buffer.from('IDAT'),
    idatData,
    idatCRC
  ]);
  idat.writeUInt32BE(idatData.length, 0);
  
  // IEND chunk
  const iendCRC = calculateCRC(Buffer.from('IEND'));
  const iend = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // length
    Buffer.from('IEND'),
    iendCRC
  ]);
  
  // 组合 PNG 文件
  const png = Buffer.concat([signature, ihdr, idat, iend]);
  
  fs.writeFileSync(outputPath, png);
}

function calculateCRC(data) {
  // 简化的 CRC32 实现
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  const result = Buffer.alloc(4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 0);
  return result;
}

// 创建所有尺寸的图标
const sizes = [16, 32, 48, 128];
const assetsDir = 'assets';

console.log('🎨 创建临时 PNG 图标文件...\n');

sizes.forEach(size => {
  const outputPath = path.join(assetsDir, `icon-${size}.png`);
  try {
    createTempPNGIcon(size, outputPath);
    console.log(`✅ 已创建: ${outputPath}`);
  } catch (error) {
    console.error(`❌ 创建失败 ${outputPath}:`, error.message);
  }
});

console.log('\n🎯 图标文件创建完成！');
console.log('💡 这些是临时的简单图标，建议后续使用专业工具创建更美观的图标');