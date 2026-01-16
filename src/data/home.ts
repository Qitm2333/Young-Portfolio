import { Language, Category } from '../../types';

export interface HeroItem {
  text: string;
  annotation: string;
  category: Category | null;
}

export interface HomeContent {
  heroItems: HeroItem[];
  intro: string;
  selectedWorks: string;
  years: string;
}

export const HOME_DATA: Record<Language, HomeContent> = {
  zh: {
    heroItems: [
      { text: "动态媒体", annotation: "（积累较多）", category: Category.VIDEO },
      { text: "交互设计", annotation: "（干起来体面）", category: Category.UI },
      { text: "应用开发", annotation: "（vibe coding）", category: Category.DEV },
      { text: "游戏设计", annotation: "（谁来带我）", category: null },
      { text: "音乐", annotation: "（已被AI肘飞）", category: null }
    ],
    intro: "不懂设计的摄影师不是一个好的产品经理。|边学边做，MVP生活，迈向全栈，但更看重实际价值。",
    selectedWorks: "精选作品",
    years: "[ 2021 — 2025 ]"
  },
  en: {
    heroItems: [
      { text: "Motion Media", annotation: "(Extensive Portfolio)", category: Category.VIDEO },
      { text: "UI/UX", annotation: "(Decent Career Path)", category: Category.UI },
      { text: "Development", annotation: "(Vibe Coding)", category: Category.DEV },
      { text: "Game Design", annotation: "(Looking for Mentor)", category: null },
      { text: "Music", annotation: "(Replaced by AI)", category: null }
    ],
    intro: "A photographer who doesn't understand design is not a good product manager. | Learning by doing, living the MVP life, aiming for full-stack, but valuing actual impact above all.",
    selectedWorks: "Selected Works",
    years: "[ 2021 — 2025 ]"
  }
};
