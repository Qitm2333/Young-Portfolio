/**
 * 将 GitHub 链接转换为 CDN 加速链接
 * 
 * 支持的输入格式：
 * - https://github.com/user/repo/blob/main/path/file.mp4
 * - https://raw.githubusercontent.com/user/repo/main/path/file.mp4
 * - github.com/user/repo/blob/main/path/file.mp4
 * 
 * 输出格式（按优先级）：
 * - https://gcore.jsdelivr.net/gh/user/repo/path/file.mp4 (Gcore全球CDN，国内较快)
 * - https://cdn.jsdelivr.net/gh/user/repo/path/file.mp4 (备用)
 * 
 * 注意：jsDelivr 单文件限制 20MB
 */

// 使用 Gcore CDN（对国内更友好）
const CDN_BASE = 'https://gcore.jsdelivr.net/gh';

export function toJsDelivr(url: string): string {
  if (!url) return url;
  
  let cleanUrl = url.trim();
  
  // 移除协议前缀
  cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
  
  // 处理 raw.githubusercontent.com 格式
  if (cleanUrl.startsWith('raw.githubusercontent.com/')) {
    const parts = cleanUrl.replace('raw.githubusercontent.com/', '').split('/');
    const user = parts[0];
    const repo = parts[1];
    const path = parts.slice(3).join('/');
    return `${CDN_BASE}/${user}/${repo}/${path}`;
  }
  
  // 处理 github.com 格式
  if (cleanUrl.startsWith('github.com/')) {
    const parts = cleanUrl.replace('github.com/', '').split('/');
    const user = parts[0];
    const repo = parts[1];
    const path = parts.slice(4).join('/');
    return `${CDN_BASE}/${user}/${repo}/${path}`;
  }
  
  // 已经是 jsDelivr 或其他链接，直接返回
  return url.startsWith('http') ? url : `https://${url}`;
}
