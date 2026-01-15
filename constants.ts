import { Category, Project, Experience, Skill, Language, HonorsData, Article, ArticleCategory } from './types';
import { Sparkles, Image, History, Send } from 'lucide-react';
import { PROJECT_DATA } from './src/data/projects';
import { getArticlesByLanguage } from './src/utils/articleLoader';

export const CATEGORY_LABELS: Record<Language, Record<string, string>> = {
  zh: {
    'All': '全部',
    'Motion': '动态影像',
    'UI Design': '交互设计',
    'Graphic Design': '平面设计',
    'Photography': '静态摄影',
    'Development': '应用开发',
    'Practice': '日常练习'
  },
  en: {
    'All': 'All',
    'Motion': 'Media',
    'UI Design': 'UI/UX',
    'Graphic Design': 'Graphic Design',
    'Photography': 'Photography',
    'Development': 'Development',
    'Practice': 'Practice'
  }
};

export const ARTICLE_LABELS: Record<Language, Record<string, string>> = {
  zh: {
    'All': '全部',
    [ArticleCategory.QUALITY]: 'Quality',
    [ArticleCategory.RURALIT]: 'Ruralit',
    [ArticleCategory.TRACES]: 'Traces of Presence',
    [ArticleCategory.CUBTHARSIS]: 'Cubtharsis',
  },
  en: {
    'All': 'All',
    [ArticleCategory.QUALITY]: 'Quality',
    [ArticleCategory.RURALIT]: 'Ruralit',
    [ArticleCategory.TRACES]: 'Traces of Presence',
    [ArticleCategory.CUBTHARSIS]: 'Cubtharsis',
  }
};

export const PROJECTS: Record<Language, Project[]> = {
  zh: PROJECT_DATA.map(p => ({
    id: p.id,
    ...p.common,
    ...p.zh,
    // Inject bilingual title for fallback UI
    bilingualTitle: {
      zh: p.zh.title,
      en: p.en.title
    }
  })),
  en: PROJECT_DATA.map(p => ({
    id: p.id,
    ...p.common,
    ...p.en,
    // Inject bilingual title for fallback UI
    bilingualTitle: {
      zh: p.zh.title,
      en: p.en.title
    }
  }))
};

// 从 markdown 文件自动加载文章
const loadedArticles = getArticlesByLanguage();

export const ARTICLES: Record<Language, Article[]> = {
  zh: loadedArticles.zh,
  en: loadedArticles.en
};
