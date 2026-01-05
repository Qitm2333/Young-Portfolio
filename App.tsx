
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Matter from 'matter-js';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ArticleSection } from './components/ArticleSection';
import { TimelineSection } from './components/TimelineSection';
import { Mail, RotateCcw, Github } from 'lucide-react';
import { NAV_ITEMS } from './src/data/navigation';
import { CONTACT_DATA } from './src/data/contact';
import { PROJECTS } from './constants';
import { toJsDelivr } from './src/utils/cdn';

import { PORTFOLIO_PAGE_DATA } from './src/data/portfolioPage';
import { Language, Category } from './types';

interface ExplodedElementData {
  element: HTMLElement;
  originalStyle: string;
}

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
  
  const [portfolioCategory, setPortfolioCategory] = useState<string>('All');
  const [triggerNewProject, setTriggerNewProject] = useState(false);
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);

  // 处理新建作品
  const handleNewProject = () => {
    setActiveTab('portfolio');
    setTriggerNewProject(true);
    // 重置触发器
    setTimeout(() => setTriggerNewProject(false), 100);
  };
  
  const [gravityActive, setGravityActive] = useState(false);
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
  const engineRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  const explodedElementsRef = useRef<ExplodedElementData[]>([]);
  const dissipatedElementsRef = useRef<ExplodedElementData[]>([]);
  const scrollPositionRef = useRef<number>(0);

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
  
  // -------------------------
  // GRAVITY EXPLOSION LOGIC
  // -------------------------
  
  const handleInteraction = (event: MouseEvent) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const bodies = Matter.Composite.allBodies(engine.world);
    
    bodies.forEach((body: any) => {
      if (body.isStatic) return;

      // Add force on click
      if (event.type === 'mousedown') {
          const bodyX = body.position.x;
          const bodyY = body.position.y;
          const distance = Math.sqrt(Math.pow(mouseX - bodyX, 2) + Math.pow(mouseY - bodyY, 2));
          
          if (distance < 500) {
            const forceMagnitude = 0.8 * (1 - distance / 500); 
            const angle = Math.atan2(bodyY - mouseY, bodyX - mouseX);
            
            Matter.Body.applyForce(body, body.position, {
              x: Math.cos(angle) * forceMagnitude,
              y: Math.sin(angle) * forceMagnitude
            });
          }
      }
    });
  };

  const triggerGravity = () => {
    if (gravityActive) return;
    
    if (!Matter) return;

    scrollPositionRef.current = window.scrollY;
    // Lock body height to current scroll height to prevent layout jump
    document.body.style.height = `${document.documentElement.scrollHeight}px`; 
    document.body.style.overflow = 'hidden'; 
    
    setGravityActive(true);

    const Engine = Matter.Engine,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    const engine = Engine.create({
      positionIterations: 12,
      velocityIterations: 8,
      constraintIterations: 4
    });
    const world = engine.world;
    engineRef.current = engine;

    // Dissipate large images
    const largeComponents = Array.from(document.querySelectorAll('main img, .aspect-\\[4\\/3\\]')) as HTMLElement[];
    const dissipatedData: ExplodedElementData[] = [];
    
    largeComponents.forEach(el => {
      dissipatedData.push({
        element: el,
        originalStyle: el.getAttribute('style') || ''
      });
      el.style.transition = 'all 0.5s ease-out';
      el.style.transform = 'scale(0.8)';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });
    dissipatedElementsRef.current = dissipatedData;

    // Selector: Target individual visible elements, avoid layout wrappers
    const selector = `
      nav h1, nav button, nav span,
      footer p,
      .rounded-\\[2rem\\]:not(.aspect-\\[4\\/3\\]),
      main h1, main h2, main h3, main h4, main p, main span, 
      main svg, main button, main a, 
      main li,
      div[class*="border-b-2"], 
      div[class*="h-[1px]"],
      div[class*="h-[2px]"]
    `;
    
    const candidates = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    
    const visibleCandidates = candidates.filter(el => {
       const rect = el.getBoundingClientRect();
       if (rect.width < 5 || rect.height < 5) return false;
       if (window.getComputedStyle(el).display === 'none') return false;
       if (window.getComputedStyle(el).opacity === '0') return false;
       if (largeComponents.includes(el)) return false;
       return true;
    });

    // Containment check to prevent overlapping physics bodies
    const validElements = visibleCandidates.filter(el => {
      return !visibleCandidates.some(parent => parent !== el && parent.contains(el));
    });

    const bodies: any[] = [];
    const explodedData: ExplodedElementData[] = [];

    validElements.forEach(el => {
      explodedData.push({
        element: el,
        originalStyle: el.getAttribute('style') || ''
      });

      const rect = el.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      const centerX = rect.left + rect.width / 2 + scrollX;
      const centerY = rect.top + rect.height / 2 + scrollY;

      const body = Bodies.rectangle(centerX, centerY, rect.width, rect.height, {
        restitution: 0.2, 
        friction: 0.5,    
        frictionAir: 0.05, 
        density: 0.002,
        chamfer: { radius: Math.min(rect.width, rect.height) * 0.1 }, 
        angle: (Math.random() - 0.5) * 0.05
      });
      (body as any).domElement = el;
      bodies.push(body);

      // Lock Visuals
      el.style.boxSizing = 'border-box';
      el.style.position = 'absolute';
      el.style.left = `${rect.left + scrollX}px`;
      el.style.top = `${rect.top + scrollY}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = '0'; 
      el.style.transform = 'translate(0, 0) rotate(0deg)';
      el.style.zIndex = '1000';
      el.style.pointerEvents = 'none'; 
      el.style.transition = 'none';
    });

    explodedElementsRef.current = explodedData;

    const totalHeight = document.documentElement.scrollHeight;

    // Add floor
    const floor = Bodies.rectangle(
        window.innerWidth / 2, 
        totalHeight + 500, // Place floor well below content
        window.innerWidth, 
        1000, 
        { isStatic: true, render: { visible: false } }
    );

    // Add walls
    const wallLeft = Bodies.rectangle(
        -500, 
        totalHeight / 2, 
        1000, 
        totalHeight * 2, 
        { isStatic: true, render: { visible: false } }
    );
    const wallRight = Bodies.rectangle(
        window.innerWidth + 500, 
        totalHeight / 2, 
        1000, 
        totalHeight * 2, 
        { isStatic: true, render: { visible: false } }
    );

    Composite.add(world, [floor, wallLeft, wallRight, ...bodies]);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    const update = () => {
      if (!engineRef.current) return;

      bodies.forEach(body => {
        const el = (body as any).domElement;
        if (el) {
          const { x, y } = body.position;
          const angle = body.angle;
          
          const initialLeft = parseFloat(el.style.left);
          const initialTop = parseFloat(el.style.top);
          const w = parseFloat(el.style.width);
          const h = parseFloat(el.style.height);

          const initialCenterX = initialLeft + w / 2;
          const initialCenterY = initialTop + h / 2;

          const dx = x - initialCenterX;
          const dy = y - initialCenterY;

          el.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}rad)`;
        }
      });

      requestRef.current = requestAnimationFrame(update);
    };
    
    update();

    setTimeout(() => {
        window.addEventListener('mousedown', handleInteraction);
    }, 50);
  };

  const resetGravity = () => {
    window.removeEventListener('mousedown', handleInteraction);

    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    engineRef.current = null;
    runnerRef.current = null;

    const explodedData = explodedElementsRef.current;
    
    explodedData.forEach(({ element }) => {
      // FORCE REFLOW: Critical for smooth transition from chaos to order
      void element.offsetWidth; 
      
      // Use specific transition property to avoid conflicts
      element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1)';
      // Reset transform to identity (relative to fixed start position)
      element.style.transform = 'translate(0, 0) rotate(0deg)';
    });

    const dissipatedData = dissipatedElementsRef.current;
    dissipatedData.forEach(({ element }) => {
      element.style.transition = 'all 1s ease';
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    });

    setTimeout(() => {
      explodedData.forEach(({ element, originalStyle }) => {
        element.setAttribute('style', originalStyle);
      });
      dissipatedData.forEach(({ element, originalStyle }) => {
         element.setAttribute('style', originalStyle);
      });

      explodedElementsRef.current = [];
      dissipatedElementsRef.current = [];
      
      document.body.style.height = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPositionRef.current);
      
      setGravityActive(false);
    }, 1000); // Matches transition duration
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
          />
        );
      case 'articles':
        return (
          <ArticleSection language={language} />
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
        onTriggerGravity={triggerGravity}
        onNewProject={handleNewProject}
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
      
      {/* Floating Reset Button for Gravity - Fixed Centering Wrapper */}
      {gravityActive && (
        <div className="fixed bottom-8 left-0 w-full flex justify-center z-[1001] pointer-events-none">
          <button 
            onClick={resetGravity}
            className="pointer-events-auto bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-xl shadow-2xl animate-fade-in hover:scale-110 transition-transform flex items-center gap-3 cursor-pointer"
          >
            <RotateCcw size={24} />
            {language === 'zh' ? '恢复秩序' : 'Restore Order'}
          </button>
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
