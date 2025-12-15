const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 密钥 - 用于加密
const PASSWORD = 'ly-young-2024';

const plaintextPath = path.join(process.cwd(), 'src', 'data', 'education.secret.json');
const outPath = path.join(process.cwd(), 'src', 'data', 'education.encrypted.json');

if (!fs.existsSync(plaintextPath)) {
  console.error('❌ 找不到明文文件:', plaintextPath);
  console.error('请先创建 src/data/education.secret.json 并填写你的信息');
  process.exit(1);
}

const data = fs.readFileSync(plaintextPath, 'utf8');

// 验证 JSON 格式
try {
  JSON.parse(data);
} catch (e) {
  console.error('❌ JSON 格式错误:', e.message);
  process.exit(1);
}

// 加密
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(Buffer.from(PASSWORD, 'utf8'), salt, 250000, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ctPart = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const ct = Buffer.concat([ctPart, tag]);

const payload = {
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ct: ct.toString('base64'),
  _generated: new Date().toISOString()
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log('✅ 加密完成！');
console.log('   输入:', plaintextPath);
console.log('   输出:', outPath);
