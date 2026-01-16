import React, { useState, useEffect, useRef } from 'react';
import { Language, Category } from '../types';
import { ArrowDown, RefreshCw, Bot, Globe } from 'lucide-react';
import { HOME_DATA } from '../src/data/home';
import { PROJECTS } from '../constants';
import { toJsDelivr } from '../src/utils/cdn';

interface HeroSectionProps {
  onNavigate: () => void;
  onCategorySelect: (category: Category) => void;
  onProjectSelect?: (projectId: string) => void;
  language: Language;
  onOpenAiChat?: () => void;
  onToggleLanguage?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onNavigate, 
  onCategorySelect, 
  onProjectSelect, 
  language,
  onOpenAiChat,
  onToggleLanguage
}) => {
  const data = HOME_DATA[language];
  
  // 获取所有有封面图的项目
  const projectsWithImage = PROJECTS['zh'].filter(p => p.image);
  
  // 当前显示的项目ID和上一个项目ID（用于交叉淡入淡出）
  const [currentProjectId, setCurrentProjectId] = useState(() => {
    return projectsWithImage[Math.floor(Math.random() * projectsWithImage.length)]?.id;
  });
  const [prevProjectId, setPrevProjectId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 控制旧图片的透明度
  const [prevOpacity, setPrevOpacity] = useState(1);
  
  // 刷新随机项目（交叉淡入淡出）
  const refreshProject = () => {
    const otherProjects = projectsWithImage.filter(p => p.id !== currentProjectId);
    if (otherProjects.length > 0 && !isTransitioning) {
      const randomIndex = Math.floor(Math.random() * otherProjects.length);
      const newProject = otherProjects[randomIndex];
      
      // 保存当前图片作为上一张，初始透明度为1
      setPrevProjectId(currentProjectId);
      setPrevOpacity(1);
      // 立即切换到新图片
      setCurrentProjectId(newProject.id);
      setIsTransitioning(true);
      
      // 下一帧开始渐隐动画
      requestAnimationFrame(() => {
        setPrevOpacity(0);
      });
      
      // 动画完成后清理
      setTimeout(() => {
        setPrevProjectId(null);
        setIsTransitioning(false);
      }, 1000);
    }
  };

  // 自动轮替，每5秒切换一次
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProject();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentProjectId, isTransitioning]);
  
  // 根据当前语言获取项目数据
  const currentProject = currentProjectId 
    ? PROJECTS[language].find(p => p.id === currentProjectId) 
    : null;
  const prevProject = prevProjectId 
    ? PROJECTS[language].find(p => p.id === prevProjectId) 
    : null;
  
  // 用于顶部标题栏显示的项目
  const randomProject = currentProject;

  // 计算右侧区域宽度，使图片区域保持正方形
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [rightColumnWidth, setRightColumnWidth] = useState<number | null>(null);

  useEffect(() => {
    const calculateWidth = () => {
      if (mainContentRef.current) {
        // 获取主内容区域的高度（减去底部标签区域的高度约70px）
        const availableHeight = mainContentRef.current.clientHeight - 70;
        if (availableHeight > 0) {
          setRightColumnWidth(availableHeight);
        }
      }
    };

    // 首次渲染后立即计算
    calculateWidth();
    
    // 使用 requestAnimationFrame 确保 DOM 完全渲染后再计算一次
    const rafId = requestAnimationFrame(() => {
      calculateWidth();
    });
    
    // 再延迟一帧确保布局稳定
    const timeoutId = setTimeout(calculateWidth, 100);

    window.addEventListener('resize', calculateWidth);
    return () => {
      window.removeEventListener('resize', calculateWidth);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] md:h-[100dvh] w-full bg-cream flex flex-col overflow-hidden relative">

      {/* Grid Overlay - 国际主义网格背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[50%] w-px h-full bg-primary/5" />
        <div className="absolute top-0 left-[25%] w-px h-full bg-primary/5 hidden lg:block" />
        <div className="absolute top-0 left-[75%] w-px h-full bg-primary/5 hidden lg:block" />
      </div>

      {/* Top Bar - 静态，无动画 */}
      <div className="flex border-b-2 border-primary relative z-10 flex-shrink-0">
        {/* 左侧 - 主页标题 */}
        <div className="flex-1 pt-4 pb-3 md:pt-6 md:pb-4 px-4 md:px-6 flex items-center justify-between">
          <span className="text-sm font-black text-primary tracking-tight uppercase">
            {language === 'zh' ? '主页' : 'Home'}
          </span>
          {/* 移动端右侧图标 */}
          <div className="md:hidden flex items-center gap-1 -mr-2">
            <button
              onClick={onOpenAiChat}
              className="w-8 h-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors relative"
            >
              <Bot size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#07C160] rounded-full" />
            </button>
            <button
              onClick={onToggleLanguage}
              className="w-8 h-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
            >
              <Globe size={16} />
            </button>
          </div>
        </div>
        {/* 右侧 - 项目标题栏（黑色，hover变红） */}
        <div 
          className="hidden md:flex bg-primary hover:bg-[#E63946] transition-colors px-4 py-4 items-center justify-between cursor-pointer group border-l-2 border-primary"
          style={{ width: rightColumnWidth ? `${rightColumnWidth}px` : '33.333%' }}
          onClick={() => randomProject && onProjectSelect?.(randomProject.id)}
        >
          <span className="text-cream text-sm font-bold truncate flex-1 mr-2">
            {randomProject?.title || 'Featured Work'}
          </span>
          <span className="text-cream text-lg font-mono group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
            ↗
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={mainContentRef} className="flex-1 flex flex-col md:flex-row relative z-10 min-h-0">
        
        {/* Left Column - Main Title */}
        <div className="flex-1 flex flex-col justify-between px-6 py-4 md:py-8 min-h-0">
          
          {/* Skills List - 移动端和桌面端都显示 */}
          <div className="space-y-1">
            {data.heroItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-baseline gap-2 animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <span className="text-[10px] font-mono text-primary/30 w-6">0{index + 1}</span>
                <span 
                  onClick={() => item.category && onCategorySelect(item.category)}
                  className={`text-sm md:text-base font-bold text-primary uppercase tracking-wide transition-colors ${item.category ? 'cursor-pointer hover:text-[#E63946]' : ''}`}
                >
                  {item.text}
                </span>
                <span className="text-[10px] text-primary/30 font-light hidden sm:inline">
                  {item.annotation}
                </span>
              </div>
            ))}
          </div>
          
          {/* Bottom - Main Title - 带淡入 */}
          <div className="mt-auto">
            <div className="flex items-end gap-4 mb-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-6 h-6 md:w-8 md:h-8 bg-[#E63946]" />
              <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">Creative Developer</span>
            </div>
            <h1 className="text-[18vw] md:text-[12vw] lg:text-[9vw] font-black text-primary leading-[0.85] tracking-tighter animate-fade-in" style={{ animationDelay: '0.4s' }}>
              YOUNG
            </h1>
            <div className="flex items-center gap-4 mt-2 md:mt-3">
              <div className="flex-1 h-px bg-primary/20" />
              <span className="text-[10px] font-mono text-primary/40">{data.years}</span>
            </div>
          </div>
        </div>
        
        {/* Right Column - Visual Block - 静态结构 */}
        <div 
          className="hidden md:flex flex-col border-l-2 border-primary"
          style={{ width: rightColumnWidth ? `${rightColumnWidth}px` : '33.333%' }}
        >
          
          {/* Project Cover Image - 填满可用空间 */}
          <div className="flex-1 bg-primary relative overflow-hidden group/cover">
            {/* 新图片（底层，始终显示） */}
            {currentProject?.image && (
              <img 
                src={toJsDelivr(currentProject.image)} 
                alt={currentProject.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              />
            )}
            {/* 旧图片（上层，渐隐） */}
            {prevProject?.image && (
              <img 
                src={toJsDelivr(prevProject.image)} 
                alt={prevProject.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                style={{ opacity: prevOpacity }}
              />
            )}
            {/* Refresh Button - 右下角贴边，hover时显示 */}
            <button
              onClick={refreshProject}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-cream flex items-center justify-center opacity-0 group-hover/cover:opacity-100 hover:bg-[#E63946] transition-all cursor-pointer"
              title={language === 'zh' ? '换一个' : 'Shuffle'}
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          {/* Bottom Info - 标签带淡入 */}
          <div className="p-4 border-t-2 border-primary bg-cream">
            <div className="text-[10px] font-mono text-primary/40 uppercase tracking-widest mb-2">
              {language === 'zh' ? '专注领域' : 'Focus Areas'}
            </div>
            <div className="flex flex-wrap gap-2">
              {['MEDIA', 'UI/UX', 'DEV'].map((tag, i) => (
                <span 
                  key={i} 
                  className="text-[10px] font-bold text-primary px-2 py-1 border border-primary/20 animate-fade-in"
                  style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - 静态结构 */}
      <div className="relative z-10 border-t-2 border-primary flex-shrink-0">
        
        {/* Info Row - 移动端隐藏 */}
        <div className="hidden md:flex justify-between items-center text-[10px] tracking-widest uppercase text-primary/40 px-6 py-2 md:py-3 border-b border-primary/10">
          <span className="font-mono">YOUNG—PORTFOLIO</span>
          <span className="hidden md:block">{language === 'zh' ? '设计 / 开发 / 创意' : 'DESIGN / DEV / CREATIVE'}</span>
          <span className="font-mono">©2025</span>
        </div>

        {/* Black CTA Bar - 带淡入 */}
        <div 
          onClick={onNavigate}
          className="bg-primary text-cream px-6 pt-5 pb-9 md:py-6 flex justify-between items-center cursor-pointer hover:bg-[#E63946] transition-colors group animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-cream/40 group-hover:text-cream/60">→</span>
            <span className="text-base md:text-xl font-black uppercase tracking-wide">
              {language === 'zh' ? '探索作品' : 'Explore Works'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-cream/40 hidden md:block">SCROLL</span>
            <ArrowDown size={20} className="group-hover:translate-y-1 transition-transform" />
          </div>
        </div>
        
        {/* 移动端底部导航栏占位 */}
        <div className="h-12 md:hidden bg-cream" />

      </div>
    </div>
  );
};
