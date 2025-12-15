// 解密工具 - 在浏览器端解密数据

const PASSWORD = 'ly-young-2024';

interface EncryptedPayload {
  salt: string;
  iv: string;
  ct: string;
}

export async function decryptData<T>(encrypted: EncryptedPayload): Promise<T> {
  const salt = Uint8Array.from(atob(encrypted.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(encrypted.ct), c => c.charCodeAt(0));

  // 导入密码
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PASSWORD),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // 派生密钥
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 250000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 解密
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ct
  );

  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}
