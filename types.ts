
export type Language = 'zh' | 'en';

export enum Category {
  ALL = 'All',
  VIDEO = 'Motion',
  UI = 'UI Design',
  GRAPHIC = 'Graphic Design',
  PHOTO = 'Photography',
  DEV = 'Development',
  PRACTICE = 'Practice',
  ARTICLE = 'Article'
}

export enum ArticleCategory {
  QUALITY = 'Quality',
  RURALIT = 'Ruralit',
  TRACES = 'TracesOfPresence',
  CUBTHARSIS = 'Cubtharsis',
}

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  link?: string; // WeChat Official Account Link (optional now)
  content?: string; // Markdown content for internal articles
  coverImage?: string; // Optional, will fallback if not provided
  date?: string;
}

// 自定义内容块类型
export type SectionType = 'text' | 'gallery' | 'video';

export interface TextSection {
  type: 'text';
  title: string;
  content: string;
  hideTitle?: boolean; // 隐藏标题，直接展示内容
}

export interface GallerySection {
  type: 'gallery';
  title: string;
  images: string[];
  layout?: 'grid-5' | 'grid-4' | 'grid-3' | 'grid-2' | 'full'; // 默认 grid-4，full 表示单张填满
  hideTitle?: boolean; // 隐藏标题，直接展示图片
}

export interface VideoSection {
  type: 'video';
  title: string;
  bilibiliId?: string;
  youtubeId?: string; // YouTube Video ID (e.g. JWq0vW7Y26Y)
  videoUrl?: string;
  hideTitle?: boolean; // 隐藏标题，直接展示视频
}

export type ContentSection = TextSection | GallerySection | VideoSection;

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  description: string;
  role: string;
  image: string; // URL placeholder (Cover/Thumbnail)
  videoUrl?: string; // URL to .mp4 file
  bilibiliId?: string; // Bilibili Video ID (e.g. BV1xx...)
  youtubeId?: string; // YouTube Video ID (e.g. JWq0vW7Y26Y)
  videoLinkUrl?: string; // External video link (YouTube, Bilibili page, etc.)
  figmaUrl?: string; // Figma File URL
  gallery?: string[]; // Additional images (URLs)
  externalLink?: string; // External link (e.g. Bilibili, Behance)
  tags: string[];
  // New detailed fields
  concept?: string;
  roleDetail?: string;
  awards?: string[]; // Array of award strings
  
  // Special field for placeholder UI
  bilingualTitle?: {
    zh: string;
    en: string;
  };

  websiteUrl?: string; // Online preview URL
  githubUrl?: string; // GitHub repository URL
  icon?: string; // Icon name for Dev projects
  
  // 新增字段
  date?: string; // 日期
  notes?: string; // 批注
  sections?: ContentSection[]; // 自定义内容块
  articleCategory?: ArticleCategory; // 关联的开发日志分类
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  institution: string;
  description: string;
  type: 'education' | 'work';
}

export interface Skill {
  name: string;
  level: number; // 0-100
  icon?: string;
}

export interface CompetitionGroup {
  level: string;
  awards: string[];
}

export interface HonorsData {
  scholarships: string[];
  titles: string[];
  competitions: CompetitionGroup[];
}
