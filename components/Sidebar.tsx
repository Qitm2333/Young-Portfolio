import React from 'react';
import { Language } from '../types';
import { Home, Briefcase, FileText, GraduationCap, Mail, Plus, Bot } from 'lucide-react';

// 自定义中英翻译图标
const TranslateIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    fill="currentColor"
    className={className}
  >
    <path d="M608 416h288c35.36 0 64 28.48 64 64v416c0 35.36-28.48 64-64 64H480c-35.36 0-64-28.48-64-64v-288H128c-35.36 0-64-28.48-64-64V128c0-35.36 28.48-64 64-64h416c35.36 0 64 28.48 64 64v288z m0 64v64c0 35.36-28.48 64-64 64h-64v256.032c0 17.664 14.304 31.968 31.968 31.968H864a31.968 31.968 0 0 0 31.968-31.968V512a31.968 31.968 0 0 0-31.968-31.968H608zM128 159.968V512c0 17.664 14.304 31.968 31.968 31.968H512a31.968 31.968 0 0 0 31.968-31.968V160A31.968 31.968 0 0 0 512.032 128H160A31.968 31.968 0 0 0 128 159.968z m64 244.288V243.36h112.736V176h46.752c6.4 0.928 9.632 1.824 9.632 2.752a10.56 10.56 0 0 1-1.376 4.128c-2.752 7.328-4.128 16.032-4.128 26.112v34.368h119.648v156.768h-50.88v-20.64h-68.768v118.272H306.112v-118.272H238.752v24.768H192z m46.72-122.368v60.48h67.392V281.92H238.752z m185.664 60.48V281.92h-68.768v60.48h68.768z m203.84 488H576L668.128 576h64.64l89.344 254.4h-54.976l-19.264-53.664h-100.384l-19.232 53.632z m33.024-96.256h72.864l-34.368-108.608h-1.376l-37.12 108.608zM896 320h-64a128 128 0 0 0-128-128V128a192 192 0 0 1 192 192zM128 704h64a128 128 0 0 0 128 128v64a192 192 0 0 1-192-192z" />
  </svg>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onNewProject?: () => void;
  onOpenAiChat?: () => void;
  editorMode?: boolean;
  onLogoClick?: () => void;
}

// 导航项配置
const NAV_ICONS = [
  { id: 'dashboard', icon: Home, labelZh: '主页', labelEn: 'Home' },
  { id: 'portfolio', icon: Briefcase, labelZh: '作品', labelEn: 'Work' },
  { id: 'articles', icon: FileText, labelZh: '文章', labelEn: 'Blog' },
  { id: 'about', icon: GraduationCap, labelZh: '教育', labelEn: 'About' },
  { id: 'contact', icon: Mail, labelZh: '联系', labelEn: 'Contact' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  language,
  toggleLanguage,
  onNewProject,
  onOpenAiChat,
  editorMode = false,
  onLogoClick,
}) => {
  return (
    <>
      {/* Desktop Sidebar - Narrow Icon Bar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-14 bg-cream border-r border-primary/10 flex-col items-center py-6 z-50">
        
        {/* Logo - 连续点击4次激活编辑模式 */}
        <div
          className={`cursor-pointer mb-8 transition-all select-none ${editorMode ? 'text-[#E63946]' : ''}`}
          onClick={() => onLogoClick?.()}
          title={editorMode ? (language === 'zh' ? '编辑模式已开启' : 'Editor Mode ON') : 'YOUNG'}
        >
          <span className={`text-sm font-black tracking-tighter leading-none select-none ${editorMode ? 'text-[#E63946]' : 'text-primary'}`}
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            YOUNG
          </span>
        </div>

        {/* Divider */}
        <div className="w-6 h-[1px] bg-primary/20 mb-6"></div>

        {/* Nav Icons */}
        <nav className="flex-1 flex flex-col items-center gap-1">
          {NAV_ICONS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-cream' 
                    : 'text-primary/40 hover:text-primary hover:bg-primary/5'}
                `}
                title={language === 'zh' ? item.labelZh : item.labelEn}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
        </nav>

        {/* Bottom Controls */}
        <div className="flex flex-col items-center gap-2">
          {/* AI Chat Button */}
          {onOpenAiChat && (
            <button
              onClick={onOpenAiChat}
              className="w-10 h-10 flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors group relative"
              title={language === 'zh' ? 'AI 助手' : 'AI Assistant'}
            >
              <Bot size={16} />
              {/* 小光点 */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#07C160] rounded-full" />
            </button>
          )}
          
          <button
            onClick={toggleLanguage}
            className="w-10 h-10 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
            title={language === 'zh' ? 'English' : '中文'}
          >
            <TranslateIcon size={16} />
          </button>
          {editorMode && onNewProject && (
            <button
              onClick={onNewProject}
              className="w-10 h-10 flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
              title={language === 'zh' ? '新建作品' : 'New Project'}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Tab Bar - 底部固定，类似 App */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream border-t border-primary/10 px-2 py-2 flex items-center justify-around">
        {NAV_ICONS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-1 transition-colors ${
                isActive ? 'text-primary' : 'text-primary/40'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] truncate ${isActive ? 'font-bold' : ''}`}>
                {language === 'zh' ? item.labelZh : item.labelEn}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
