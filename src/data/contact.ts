import { Language } from '../../types';

export interface SocialLinks {
  wechat: string;
  xiaohongshu: string;
  bilibili: string;
  px500: string;
  liblib: string;
}

export interface ContactContent {
  baseLabel: string;
  locationValue: string;
  contactLabel: string;
  emailMeLabel: string;
  email: string;
  hello: string;
  intro: string;
  socials: SocialLinks;
  tooltip?: string;
  githubLabel: string;
  footerDesign: string;
}

export const CONTACT_DATA: Record<Language, ContactContent> = {
  zh: {
    baseLabel: "BASE",
    locationValue: "广东，珠海",
    contactLabel: "取得联系",
    emailMeLabel: "邮箱",
    email: "young@126.com",
    hello: "你好 ;-)",
    intro: "欢迎探讨与合作。",
    socials: {
      wechat: "Young的实验房",
      xiaohongshu: "Young",
      bilibili: "Young",
      px500: "Young",
      liblib: "QM_L"
    },
    githubLabel: "GitHub",
    footerDesign: "Powered by Gemini 3 Pro"
  },
  en: {
    baseLabel: "BASE",
    locationValue: "Zhuhai, Guangdong",
    contactLabel: "Get in touch",
    emailMeLabel: "Email Me",
    email: "young@126.com",
    hello: "Hello ;-)",
    intro: "Welcome to discuss & cooperate.",
    socials: {
      wechat: "Young's Lab",
      xiaohongshu: "Young",
      bilibili: "Young",
      px500: "Young",
      liblib: "QM_L"
    },
    githubLabel: "GitHub",
    footerDesign: "Powered by Gemini 3 Pro"
  }
};
