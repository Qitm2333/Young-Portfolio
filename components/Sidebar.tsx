import React from 'react';
import { Language } from '../types';
import { Globe, Home, Briefcase, FileText, GraduationCap, Mail, Menu, X, Plus, Bot } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onTriggerGravity: () => void;
  onNewProject?: () => void;
  onOpenAiChat?: () => void;
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
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Sidebar - Narrow Icon Bar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-14 bg-cream border-r border-primary/10 flex-col items-center py-6 z-50">
        
        {/* Logo */}
        <div
          className="cursor-pointer mb-8"
          onClick={() => setActiveTab('dashboard')}
          title="YOUNG"
        >
          <span className="text-sm font-black tracking-tighter text-primary leading-none"
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
            <Globe size={16} />
          </button>
          {onNewProject && (
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

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-cream border-b border-primary/10 px-4 py-3 flex items-center justify-between">
        <span
          className="text-base font-black tracking-tighter uppercase text-primary cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          YOUNG
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-primary"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed top-12 left-0 right-0 bottom-0 bg-cream z-40 px-6 py-8">
          <nav className="flex flex-col gap-2">
            {NAV_ICONS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    flex items-center gap-4 px-4 py-3 text-left transition-colors
                    ${isActive ? 'bg-primary text-cream' : 'text-primary/60 hover:bg-primary/5'}
                  `}
                >
                  <Icon size={20} />
                  <span className="text-lg font-bold">
                    {language === 'zh' ? item.labelZh : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>
          <button
            onClick={toggleLanguage}
            className="mt-8 flex items-center gap-3 text-primary/50 px-4"
          >
            <Globe size={18} />
            <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
          </button>
          
          {/* Mobile AI Chat Button */}
          {onOpenAiChat && (
            <button
              onClick={() => {
                onOpenAiChat();
                setMobileOpen(false);
              }}
              className="mt-4 flex items-center gap-3 px-4 py-3 bg-[#E63946] text-cream mx-4"
            >
              <Bot size={18} />
              <span className="font-bold">{language === 'zh' ? 'AI 助手' : 'AI Assistant'}</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};
