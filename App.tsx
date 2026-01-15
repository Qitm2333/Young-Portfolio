
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ArticleSection } from './components/ArticleSection';
import { TimelineSection } from './components/TimelineSection';
import { AiChat } from './components/AiChat';
import { Mail, Github } from 'lucide-react';
import { CONTACT_DATA } from './src/data/contact';
import { PROJECTS } from './constants';
import { toJsDelivr } from './src/utils/cdn';

import { Language, Category } from './types';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据路由路径获取当前 tab
  const getTabFromPath = (pathname: string) => {
    if (pathname === '/home' || pathname === '/') return 'dashboard';
    if (pathname.startsWith('/portfolio')) return 'portfolio';
    if (pathname.startsWith('/articles')) return 'articles';
    if (pathname === '/about') return 'about';
    if (pathname === '/contact') return 'contact';
    return 'dashboard';
  };
  
  const activeTab = getTabFromPath(location.pathname);
  
  const setActiveTab = (tab: string) => {
    const pathMap: Record<string, string> = {
      'dashboard': '/home',
      'portfolio': '/portfolio',
      'articles': '/articles',
      'about': '/about',
      'contact': '/contact'
    };
    navigate(pathMap[tab] || '/home');
  };
  
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // 编辑模式：连续点击4次 YOUNG logo 激活
  const [editorMode, setEditorMode] = useState(false);
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    
    // 清除之前的计时器
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }
    
    // 如果达到4次点击，切换编辑模式
    if (logoClickCountRef.current >= 4) {
      setEditorMode(prev => !prev);
      logoClickCountRef.current = 0;
      return;
    }
    
    // 1.5秒内没有继续点击则重置计数
    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 1500);
  };
  
  const [portfolioCategory, setPortfolioCategory] = useState<string>('All');
  const [triggerNewProject, setTriggerNewProject] = useState(false);
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  
  // 首次访问引导提示
  const [showGuide, setShowGuide] = useState(true);
  
  const dismissGuide = () => {
    setShowGuide(false);
  };

  // 处理新建作品
  const handleNewProject = () => {
    setActiveTab('portfolio');
    setTriggerNewProject(true);
    // 重置触发器
    setTimeout(() => setTriggerNewProject(false), 100);
  };
  
  const [copySuccess, setCopySuccess] = useState(false);

  // 复制邮箱并显示反馈
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('1445531071@qq.com');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const startViewTransition = (update: () => void) => {
    // 直接执行更新，避免View Transitions API导致的闪烁
    update();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } 
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // 预加载作品封面图
  useEffect(() => {
    const preloadImages = () => {
      const allProjects = PROJECTS['zh'];
      allProjects.forEach(project => {
        if (project.image) {
          const img = new Image();
          img.src = toJsDelivr(project.image);
        }
      });
    };
    // 延迟执行，不阻塞首屏渲染
    const timer = setTimeout(preloadImages, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const handleHeroNavigation = (category: Category) => {
    startViewTransition(() => {
      setPortfolioCategory(category);
      setActiveTab('portfolio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleNavigateToPortfolio = () => {
    startViewTransition(() => {
      setPortfolioCategory('All');
      setActiveTab('portfolio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const content = CONTACT_DATA[language];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <HeroSection 
            onNavigate={handleNavigateToPortfolio} 
            onCategorySelect={handleHeroNavigation}
            onProjectSelect={(projectId) => {
              setInitialProjectId(projectId);
              setActiveTab('portfolio');
            }}
            language={language} 
          />
        );
      case 'portfolio':
        return (
          <PortfolioSection 
            language={language} 
            externalFilter={portfolioCategory} 
            triggerNewProject={triggerNewProject}
            initialProjectId={initialProjectId}
            onProjectOpened={() => setInitialProjectId(null)}
            editorMode={editorMode}
          />
        );
      case 'articles':
        return (
          <ArticleSection language={language} editorMode={editorMode} />
        );
      case 'about':
        return (
          <TimelineSection language={language} />
        );
      case 'contact':
        return (
          <div className="h-[100dvh] w-full bg-cream flex flex-col overflow-hidden relative">
            {/* Grid Overlay - 国际主义网格背景 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-[50%] w-px h-full bg-primary/5" />
              <div className="absolute top-0 left-[25%] w-px h-full bg-primary/5 hidden lg:block" />
              <div className="absolute top-0 left-[75%] w-px h-full bg-primary/5 hidden lg:block" />
            </div>

            {/* Top Bar */}
            <div className="pt-6 pb-4 flex justify-between items-start border-b-2 border-primary px-6 relative z-10">
              <span className="text-sm font-black text-primary tracking-tight uppercase">
                {language === 'zh' ? '联系' : 'Contact'}
              </span>

            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative z-10">
              {/* Left Column - Main Title */}
              <div className="flex-1 flex flex-col justify-between px-6 py-8">
                <div />
                
                {/* Bottom - Main Title */}
                <div>
                  <div className="flex items-end gap-4 mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="w-8 h-8 bg-[#E63946]" />
                    <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">Get In Touch</span>
                  </div>
                  <h1 className="text-[15vw] md:text-[12vw] lg:text-[9vw] font-black text-primary leading-[0.85] tracking-tighter animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {language === 'zh' ? '联系' : 'CONTACT'}
                  </h1>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 h-px bg-primary/20" />
                    <span className="text-[10px] font-mono text-primary/40">©2025</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact List */}
              <div className="hidden md:flex flex-col w-1/2 lg:w-2/5 border-l-2 border-primary">
                {/* Contact Items */}
                <div className="flex-1 flex flex-col justify-center">
                  {/* 01 - Email */}
                  <div 
                    className={`group border-b border-primary/10 py-5 px-8 flex items-center justify-between cursor-pointer transition-all duration-300 animate-fade-in ${copySuccess ? 'bg-[#07C160]/10' : 'hover:bg-[#E63946]/5'}`}
                    style={{ animationDelay: '0.2s' }}
                    onClick={handleCopyEmail}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-primary/30">01</span>
                      <Mail size={18} className={`transition-colors ${copySuccess ? 'text-[#07C160]' : 'text-primary/40 group-hover:text-[#E63946]'}`} />
                      <div>
                        <h3 className={`font-bold transition-colors ${copySuccess ? 'text-[#07C160]' : 'text-primary group-hover:text-[#E63946]'}`}>{language === 'zh' ? '邮箱' : 'Email'}</h3>
                        <p className="font-mono text-xs text-primary/40">1445531071@qq.com</p>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] transition-colors ${copySuccess ? 'text-[#07C160]' : 'text-primary/30 group-hover:text-[#E63946]'}`}>
                      {copySuccess ? '✓' : (language === 'zh' ? '复制' : 'COPY')}
                    </span>
                  </div>

                  {/* 02 - 小红书 */}
                  <div 
                    className="group border-b border-primary/10 py-5 px-8 flex items-center justify-between cursor-pointer hover:bg-[#EC4048]/5 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: '0.3s' }}
                    onClick={() => window.open('https://www.xiaohongshu.com/user/profile/60d4557f00000000010083bc', '_blank')}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-primary/30">02</span>
                      <svg className="w-[18px] h-[18px] text-primary/40 group-hover:text-[#EC4048] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                      </svg>
                      <div>
                        <h3 className="font-bold text-primary group-hover:text-[#EC4048] transition-colors">{language === 'zh' ? '小红书' : 'RED'}</h3>
                        <p className="font-mono text-xs text-primary/40">@off-key</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-primary/30 group-hover:text-[#EC4048] transition-colors">→</span>
                  </div>

                  {/* 03 - GitHub */}
                  <div 
                    className="group border-b border-primary/10 py-5 px-8 flex items-center justify-between cursor-pointer hover:bg-[#E63946]/5 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: '0.4s' }}
                    onClick={() => window.open('https://github.com/Qitm2333', '_blank')}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-primary/30">03</span>
                      <Github size={18} className="text-primary/40 group-hover:text-[#E63946] transition-colors" />
                      <div>
                        <h3 className="font-bold text-primary group-hover:text-[#E63946] transition-colors">GitHub</h3>
                        <p className="font-mono text-xs text-primary/40">@Qitm2333</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-primary/30 group-hover:text-[#E63946] transition-colors">→</span>
                  </div>

                  {/* 04 - 网易云音乐 */}
                  <div 
                    className="group border-b border-primary/10 py-5 px-8 flex items-center justify-between cursor-pointer hover:bg-[#C20C0C]/5 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: '0.5s' }}
                    onClick={() => window.open('https://y.music.163.com/m/user?id=95054416', '_blank')}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-primary/30">04</span>
                      <svg className="w-[18px] h-[18px] text-primary/40 group-hover:text-[#C20C0C] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                      </svg>
                      <div>
                        <h3 className="font-bold text-primary group-hover:text-[#C20C0C] transition-colors">{language === 'zh' ? '网易云音乐' : 'NetEase'}</h3>
                        <p className="font-mono text-xs text-primary/40">@Qitm</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-primary/30 group-hover:text-[#C20C0C] transition-colors">→</span>
                  </div>

                  {/* 05 - LibLib */}
                  <div 
                    className="group py-5 px-8 flex items-center justify-between cursor-pointer hover:bg-[#E63946]/5 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: '0.6s' }}
                    onClick={() => window.open('https://www.liblib.art/userpage/4b7bd42292f840e2a3aca5a90c8fbf8f/publish', '_blank')}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-primary/30">05</span>
                      <svg className="w-[18px] h-[18px] text-primary/40 group-hover:text-[#E63946] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      <div>
                        <h3 className="font-bold text-primary group-hover:text-[#E63946] transition-colors">LibLib</h3>
                        <p className="font-mono text-xs text-primary/40">@QM_L</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-primary/30 group-hover:text-[#E63946] transition-colors">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 border-t-2 border-primary">
              <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-primary/40 px-6 py-3 border-b border-primary/10">
                <span className="font-mono">YOUNG—CONTACT</span>
                <span className="hidden md:block">{language === 'zh' ? '邮箱 / 社交 / 音乐' : 'EMAIL / SOCIAL / MUSIC'}</span>
                <span className="font-mono">©2025</span>
              </div>

              {/* Black CTA Bar */}
              <div 
                onClick={handleCopyEmail}
                className={`${copySuccess ? 'bg-[#07C160]' : 'bg-primary hover:bg-[#E63946]'} text-cream px-6 py-5 md:py-6 flex justify-between items-center cursor-pointer transition-colors group animate-fade-in`}
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-cream/40 group-hover:text-cream/60">{copySuccess ? '✓' : '→'}</span>
                  <span className="text-lg md:text-xl font-black uppercase tracking-wide">
                    {copySuccess 
                      ? (language === 'zh' ? '已复制到剪贴板' : 'Copied to Clipboard')
                      : (language === 'zh' ? '复制邮箱地址' : 'Copy Email Address')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-cream/40 hidden md:block">1445531071@qq.com</span>
                  <Mail size={20} className="group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <>
            <HeroSection 
              onNavigate={handleNavigateToPortfolio} 
              onCategorySelect={handleHeroNavigation}
              language={language} 
            />
            <PortfolioSection language={language} externalFilter={portfolioCategory} />
          </>
        );
    }
  };

  return (
    <div className="min-h-full bg-cream text-primary font-sans selection:bg-primary selection:text-cream transition-colors duration-300">
      
      {/* Dynamic Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => startViewTransition(() => setActiveTab(tab))} 
        language={language}
        toggleLanguage={toggleLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        onNewProject={handleNewProject}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        editorMode={editorMode}
        onLogoClick={handleLogoClick}
      />

      {/* AI Chat Modal */}
      <AiChat 
        isOpen={isAiChatOpen} 
        onClose={() => setIsAiChatOpen(false)} 
        language={language} 
      />

      {/* 固定背景层 - 防止Portal渲染时闪烁 */}
      {(activeTab === 'portfolio' || activeTab === 'articles') && (
        <>
          {/* 侧边栏背景 */}
          <div 
            className="hidden md:block fixed bg-cream border-r border-primary/10"
            style={{ top: 0, bottom: 0, left: 56, width: 176, zIndex: 30 }}
          />
          {/* 面包屑背景 */}
          <div 
            className="hidden md:block fixed top-0 right-0 bg-cream border-b border-primary/10"
            style={{ left: 232, height: 57, zIndex: 15 }}
          />
        </>
      )}

      {/* Main Content Area - Offset for narrow left sidebar on desktop */}
      <main className="w-full md:pl-14 pt-12 md:pt-0 vt-page">
         <div key={activeTab}>
           {renderContent()}
         </div>
      </main>

      {/* 首次访问引导气泡 */}
      {showGuide && (
        <div 
          className="hidden md:block fixed z-[60] animate-fade-in cursor-pointer group"
          style={{ left: 62, bottom: 33 }}
          onClick={dismissGuide}
        >
          <div className="bg-[#E63946] text-cream px-5 py-4 w-[180px] border-2 border-primary">
            <div className="text-sm font-bold tracking-wide mb-1">
              <span className="group-hover:hidden">AI / 中英</span>
              <span className="hidden group-hover:inline">GOT IT</span>
            </div>
            <div className="text-xs text-cream/70">
              <span className="group-hover:hidden">{language === 'zh' ? '左下角可切换' : 'Bottom left to switch'}</span>
              <span className="hidden group-hover:inline">{language === 'zh' ? '点击关闭' : 'Click to close'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </HashRouter>
  );
}
