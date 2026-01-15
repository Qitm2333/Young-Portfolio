import { Category, Project, Language } from './types';
import { PROJECT_DATA } from './src/data/projects';

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

export const PROJECTS: Record<Language, Project[]> = {
  zh: PROJECT_DATA.map(p => ({
    id: p.id,
    ...p.common,
    ...p.zh,
    bilingualTitle: {
      zh: p.zh.title,
      en: p.en.title
    }
  })),
  en: PROJECT_DATA.map(p => ({
    id: p.id,
    ...p.common,
    ...p.en,
    bilingualTitle: {
      zh: p.zh.title,
      en: p.en.title
    }
  }))
};
