/**
 * 文章加载器 - 自动扫描 content/articles 目录下的 markdown 文件
 * 
 * 文件夹名即为项目分类（自动生成）
 * 文件命名规则: {category}/DAY{序号}-{标题}-{日期YYYYMMDD}.md
 * 例如: ruralit/DAY01-项目逻辑梳理-20251111.md
 */

// 使用 Vite 的 glob 导入
const articleModules = import.meta.glob('/content/articles/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export interface ArticleMeta {
  id: string;
  category: string; // 直接用文件夹名作为分类
  title: string;
  date: string;
  coverImage?: string;
  content: string;
}

export interface CategoryInfo {
  id: string; // 文件夹名（小写）
  label: string; // 显示名称（首字母大写）
  count: number;
}

// 从文件名解析信息
// 格式: DAY01-项目逻辑梳理-20251111.md
function parseFileName(
  fileName: string
): { id: string; title: string; date: string } | null {
  const name = fileName.replace(/\.md$/, '');
  const match = name.match(/^(DAY\d+)-(.+)-(\d{8})$/);
  if (!match) return null;

  const [, dayPart, titlePart, datePart] = match;
  const date = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
  const title = `${dayPart} - ${titlePart}`;
  const id = dayPart.toLowerCase();

  return { id, title, date };
}

// 从文件路径解析分类
function parseFilePath(
  path: string
): { category: string; fileName: string } | null {
  const match = path.match(/\/content\/articles\/([^/]+)\/([^/]+\.md)$/);
  if (!match) return null;

  const [, category, fileName] = match;
  return { category: category.toLowerCase(), fileName };
}

// 格式化分类名称（首字母大写，支持驼峰转空格）
function formatCategoryLabel(category: string): string {
  // 特殊处理一些名称
  const specialNames: Record<string, string> = {
    'traces': 'Traces of Presence',
    'tracesofpresence': 'Traces of Presence',
  };
  
  if (specialNames[category]) {
    return specialNames[category];
  }
  
  // 首字母大写
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// 加载所有文章
function loadAllArticles(): { articles: ArticleMeta[]; categories: CategoryInfo[] } {
  const articles: ArticleMeta[] = [];
  const categorySet = new Set<string>();

  for (const [path, rawContent] of Object.entries(articleModules)) {
    const pathInfo = parseFilePath(path);
    if (!pathInfo) continue;

    const fileInfo = parseFileName(pathInfo.fileName);
    if (!fileInfo) continue;

    const content = (rawContent as string).trim();
    categorySet.add(pathInfo.category);

    articles.push({
      id: fileInfo.id,
      category: pathInfo.category,
      title: fileInfo.title,
      date: fileInfo.date,
      content,
    });
  }

  // 按日期正序排列
  articles.sort((a, b) => a.date.localeCompare(b.date));

  // 生成分类列表
  const categories: CategoryInfo[] = Array.from(categorySet)
    .sort()
    .map((cat) => ({
      id: cat,
      label: formatCategoryLabel(cat),
      count: articles.filter((a) => a.category === cat).length,
    }));

  return { articles, categories };
}

// 缓存
let cache: { articles: ArticleMeta[]; categories: CategoryInfo[] } | null = null;

function getCache() {
  if (!cache) {
    cache = loadAllArticles();
  }
  return cache;
}

export function getArticles(): ArticleMeta[] {
  return getCache().articles;
}

export function getCategories(): CategoryInfo[] {
  return getCache().categories;
}

// 兼容旧接口
export function getArticlesByLanguage() {
  const articles = getArticles();
  return { zh: articles, en: articles };
}
