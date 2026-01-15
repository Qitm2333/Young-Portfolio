import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { PROJECTS, CATEGORY_LABELS } from '../constants';
import { Category, Language, Project, ContentSection } from '../types';

import { Pencil } from 'lucide-react';
import { ProjectEditor, EditableProject, createEmptyProject } from './ProjectEditor';
import { toJsDelivr } from '../src/utils/cdn';
import { PRACTICE_ITEMS, PRACTICE_LAYOUT } from '../src/data/practice';

// 带骨架屏的图片组件
interface SkeletonImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({ src, alt = '', className = '', style, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const maxRetries = 3;
  
  // 检查是否需要填满容器高度
  const isFillHeight = className.includes('h-full');

  // 处理加载错误，自动重试
  const handleError = () => {
    if (retryCount < maxRetries) {
      // 延迟重试
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1)); // 递增延迟：1s, 2s, 3s
    } else {
      setError(true);
    }
  };

  // 处理加载成功
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setLoaded(true);
  };

  // 生成带重试参数的 URL（强制刷新缓存）
  const imgSrc = retryCount > 0 ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount}` : src;

  // 计算骨架屏的 aspect-ratio（默认 16:9）
  const aspectRatio = imgNaturalSize 
    ? `${imgNaturalSize.width} / ${imgNaturalSize.height}` 
    : '16 / 9';

  return (
    <div 
      className={`relative overflow-hidden ${loaded ? '' : 'bg-primary/10'} ${className}`} 
      style={{ 
        ...style,
        // 未加载时使用 aspect-ratio 保持占位
        ...((!loaded && !isFillHeight) ? { aspectRatio } : {})
      }} 
      onClick={onClick}
    >
      {/* 骨架屏 - 更明显的闪烁效果 */}
      {!loaded && !error && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-primary/10" />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ 
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} 
          />
        </div>
      )}
      {/* 错误状态 - 可点击重试 */}
      {error && (
        <div 
          className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
          style={{ minHeight: '120px' }}
          onClick={(e) => { e.stopPropagation(); setError(false); setRetryCount(0); }}
        >
          <span className="text-primary/40 text-xs">加载失败</span>
          <span className="text-primary/30 text-[10px] mt-1">点击重试</span>
        </div>
      )}
      {/* 图片 */}
      <img
        key={retryCount} // 强制重新渲染
        src={imgSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full transition-opacity duration-300 rounded-lg ${isFillHeight ? 'h-full object-cover' : 'h-auto'} ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {/* 内联样式定义动画 */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

interface PortfolioSectionProps {
  language: Language;
  externalFilter?: string;
  triggerNewProject?: boolean;
  initialProjectId?: string | null;
  onProjectOpened?: () => void;
  editorMode?: boolean;
}

const FILTER_ITEMS = [
  { id: 'All', labelZh: '全部', labelEn: 'All', urlPath: 'all' },
  { id: Category.VIDEO, labelZh: '动态影像', labelEn: 'Media', urlPath: 'motion' },
  { id: Category.UI, labelZh: '交互设计', labelEn: 'UI/UX', urlPath: 'uiux' },
  { id: Category.GRAPHIC, labelZh: '平面设计', labelEn: 'Graphic', urlPath: 'graphic' },
  { id: Category.DEV, labelZh: '应用开发', labelEn: 'Dev', urlPath: 'dev' },
  { id: Category.PHOTO, labelZh: '静态摄影', labelEn: 'Photo', urlPath: 'photo' },
];

// URL 路径到分类的映射
const URL_TO_CATEGORY: Record<string, string> = {
  'all': 'All',
  'motion': Category.VIDEO,
  'uiux': Category.UI,
  'graphic': Category.GRAPHIC,
  'dev': Category.DEV,
  'photo': Category.PHOTO,
  'practice': Category.PRACTICE,
};

// 分类到 URL 路径的映射
const CATEGORY_TO_URL: Record<string, string> = {
  'All': 'all',
  [Category.VIDEO]: 'motion',
  [Category.UI]: 'uiux',
  [Category.GRAPHIC]: 'graphic',
  [Category.DEV]: 'dev',
  [Category.PHOTO]: 'photo',
  [Category.PRACTICE]: 'practice',
};

// 日常练习数据类型
interface PracticeItem {
  id: string;
  type: 'image' | 'video';
  url: string;
}

type PracticeLayout = 'grid-3' | 'grid-4' | 'grid-5';

// 日常练习展示组件
// 随机打乱数组
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 在模块级别缓存随机排序结果，避免每次组件挂载时重新随机
const cachedShuffledItems = shuffleArray(PRACTICE_ITEMS.map(item => ({ ...item, type: item.type as 'image' | 'video' })));

const PracticeGallery: React.FC<{ language: Language; editorMode?: boolean }> = ({ language, editorMode = false }) => {
  // 使用缓存的随机排序结果
  const [items, setItems] = useState<PracticeItem[]>(cachedShuffledItems);
  const [layout, setLayout] = useState<PracticeLayout>(PRACTICE_LAYOUT as PracticeLayout);
  const [isEditing, setIsEditing] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const addItems = () => {
    if (!newUrl.trim()) return;
    // 支持多行输入，每行一个 URL
    const urls = newUrl.split('\n').map(u => u.trim()).filter(u => u);
    const newItems: PracticeItem[] = urls.map((url, i) => ({
      id: `practice_${Date.now()}_${i}`,
      type: newType,
      url
    }));
    setItems([...items, ...newItems]);
    setNewUrl('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const exportJSON = () => {
    const data = { items, layout };
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json);
    alert(language === 'zh' ? 'JSON 已复制到剪贴板' : 'JSON copied to clipboard');
  };

  const getGridClass = () => {
    switch (layout) {
      case 'grid-3': return 'grid-cols-1 md:grid-cols-3';
      case 'grid-5': return 'grid-cols-2 md:grid-cols-5';
      default: return 'grid-cols-2 md:grid-cols-4';
    }
  };

  return (
    <div>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-primary">
          {language === 'zh' ? '日常练习' : 'Practice'}
        </h2>
        {editorMode && (
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={exportJSON}
                className="px-3 py-1.5 text-xs border border-primary/20 text-primary hover:bg-primary hover:text-cream transition-colors"
              >
                {language === 'zh' ? '导出JSON' : 'Export JSON'}
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Pencil size={12} />
              {isEditing ? (language === 'zh' ? '完成' : 'Done') : (language === 'zh' ? '编辑' : 'Edit')}
            </button>
          </div>
        )}
      </div>

      {/* 编辑面板 */}
      {isEditing && (
        <div className="mb-6 p-4 border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex gap-2 items-start">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'image' | 'video')}
              className="px-3 py-2 border border-primary/20 bg-cream text-sm"
            >
              <option value="image">{language === 'zh' ? '图片' : 'Image'}</option>
              <option value="video">{language === 'zh' ? '视频' : 'Video'}</option>
            </select>
            <textarea
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={language === 'zh' ? '输入URL，每行一个...' : 'Enter URLs, one per line...'}
              className="flex-1 px-3 py-2 border border-primary/20 bg-cream text-sm min-h-[80px] resize-y"
              rows={3}
            />
            <button
              onClick={addItems}
              className="px-4 py-2 bg-primary text-cream text-sm hover:bg-primary/80 transition-colors"
            >
              {language === 'zh' ? '添加' : 'Add'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary/60">{language === 'zh' ? '布局：' : 'Layout:'}</span>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as PracticeLayout)}
              className="px-3 py-1.5 border border-primary/20 bg-cream text-sm"
            >
              <option value="grid-3">{language === 'zh' ? '3列' : '3 Columns'}</option>
              <option value="grid-4">{language === 'zh' ? '4列' : '4 Columns'}</option>
              <option value="grid-5">{language === 'zh' ? '5列' : '5 Columns'}</option>
            </select>
          </div>
          <p className="text-xs text-primary/50">
            {language === 'zh' ? '支持 GitHub raw 链接，会自动转换为 CDN 链接' : 'Supports GitHub raw links, auto-converted to CDN'}
          </p>
        </div>
      )}

      {/* 内容网格 - 3列瀑布流 */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-primary/40">
          {language === 'zh' ? '暂无内容，点击编辑添加' : 'No content yet, click Edit to add'}
        </div>
      ) : (
        <div className="flex gap-4">
          {/* 分成3列 */}
          {[0, 1, 2].map(colIndex => (
            <div key={colIndex} className="flex-1 flex flex-col gap-4">
              {items.filter((_, i) => i % 3 === colIndex).map((item, index) => (
                <div 
                  key={item.id} 
                  className="relative group overflow-hidden rounded-lg"
                >
                  {item.type === 'image' ? (
                    <SkeletonImage
                      src={toJsDelivr(item.url)}
                      alt=""
                      className="w-full cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                      onClick={() => !isEditing && setLightboxIndex(items.indexOf(item))}
                    />
                  ) : (
                    <video
                      src={toJsDelivr(item.url)}
                      className="w-full h-auto rounded-lg bg-primary/5"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                  {/* 删除按钮 */}
                  {isEditing && (
                    <>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors rounded"
                      >
                        ×
                      </button>
                      {/* 显示 URL */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] p-2 truncate">
                        {item.url.split('/').pop()}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && items.length > 0 && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center cursor-pointer"
          onClick={() => setLightboxIndex(null)}
        >
          <img src={toJsDelivr(items[lightboxIndex]?.url || '')} className="max-w-full max-h-full" alt="" referrerPolicy="no-referrer" />
        </div>,
        document.body
      )}
    </div>
  );
};

export const PortfolioSection = React.memo<PortfolioSectionProps>(({ 
  language, 
  externalFilter, 
  triggerNewProject,
  initialProjectId,
  onProjectOpened,
  editorMode = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从 URL 解析分类和项目 ID
  const parseUrlParams = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // 格式: /portfolio 或 /portfolio/:category 或 /portfolio/:category/:id
    if (pathParts[0] === 'portfolio') {
      const urlCategory = pathParts[1];
      const urlProjectId = pathParts[2];
      return {
        category: urlCategory ? (URL_TO_CATEGORY[urlCategory] || 'All') : 'All',
        projectId: urlProjectId || null
      };
    }
    return { category: 'All', projectId: null };
  };
  
  const urlParams = parseUrlParams();
  
  const [filter, setFilter] = useState<string>(() => {
    // 优先从 URL 获取分类
    if (urlParams.projectId) {
      const project = PROJECTS[language].find(p => p.id === urlParams.projectId);
      return project?.category || urlParams.category;
    }
    if (urlParams.category !== 'All') {
      return urlParams.category;
    }
    // 如果有初始项目ID，直接设置对应的分类
    if (initialProjectId) {
      const project = PROJECTS[language].find(p => p.id === initialProjectId);
      return project?.category || 'All';
    }
    return 'All';
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(urlParams.projectId || initialProjectId || null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<EditableProject | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // 监听 URL 变化，更新状态
  useEffect(() => {
    const { category, projectId } = parseUrlParams();
    if (projectId) {
      const project = PROJECTS[language].find(p => p.id === projectId);
      if (project) {
        setSelectedProjectId(projectId);
        setFilter(project.category);
      }
    } else if (category !== 'All') {
      setFilter(category);
      setSelectedProjectId(null);
    }
  }, [location.pathname, language]);

  // 选择项目时更新 URL
  const handleSelectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      const project = PROJECTS[language].find(p => p.id === projectId);
      if (project) {
        const categoryUrl = CATEGORY_TO_URL[project.category] || 'all';
        navigate(`/portfolio/${categoryUrl}/${projectId}`);
      }
    } else {
      // 返回分类列表
      const categoryUrl = CATEGORY_TO_URL[filter] || 'all';
      if (filter === 'All') {
        navigate('/portfolio');
      } else {
        navigate(`/portfolio/${categoryUrl}`);
      }
    }
  };

  // 切换分类时更新 URL
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSelectedProjectId(null);
    if (newFilter === 'All') {
      navigate('/portfolio');
    } else {
      const categoryUrl = CATEGORY_TO_URL[newFilter] || 'all';
      navigate(`/portfolio/${categoryUrl}`);
    }
  };

  // 处理初始项目ID
  useEffect(() => {
    if (initialProjectId) {
      const project = PROJECTS[language].find(p => p.id === initialProjectId);
      if (project) {
        setSelectedProjectId(initialProjectId);
        setFilter(project.category);
      }
      onProjectOpened?.();
    }
  }, [initialProjectId, language, onProjectOpened]);

  useEffect(() => {
    if (externalFilter) setFilter(externalFilter);
  }, [externalFilter]);

  // 响应外部触发新建项目
  useEffect(() => {
    if (triggerNewProject) {
      startNewProject();
    }
  }, [triggerNewProject]);

  // 将 Project 转换为 EditableProject 格式
  const projectToEditable = (project: Project): EditableProject => {
    // 获取另一种语言的项目数据
    const otherLang = language === 'zh' ? 'en' : 'zh';
    const otherProject = PROJECTS[otherLang].find(p => p.id === project.id);
    
    return {
      id: project.id,
      common: {
        category: project.category,
        image: project.image,
        bilibiliId: project.bilibiliId,
        youtubeId: project.youtubeId,
        videoUrl: project.videoUrl,
        videoLinkUrl: project.videoLinkUrl,
        figmaUrl: project.figmaUrl,
        websiteUrl: project.websiteUrl,
        githubUrl: project.githubUrl,
        date: project.date,
        notes: project.notes,
      },
      zh: {
        title: language === 'zh' ? project.title : (otherProject?.title || ''),
        subtitle: language === 'zh' ? project.subtitle : (otherProject?.subtitle || ''),
        description: language === 'zh' ? project.description : (otherProject?.description || ''),
        role: language === 'zh' ? project.role : (otherProject?.role || ''),
        tags: language === 'zh' ? (project.tags || []) : (otherProject?.tags || []),
        awards: language === 'zh' ? (project.awards || []) : (otherProject?.awards || []),
        sections: language === 'zh' ? (project.sections || []) : (otherProject?.sections || []),
      },
      en: {
        title: language === 'en' ? project.title : (otherProject?.title || ''),
        subtitle: language === 'en' ? project.subtitle : (otherProject?.subtitle || ''),
        description: language === 'en' ? project.description : (otherProject?.description || ''),
        role: language === 'en' ? project.role : (otherProject?.role || ''),
        tags: language === 'en' ? (project.tags || []) : (otherProject?.tags || []),
        awards: language === 'en' ? (project.awards || []) : (otherProject?.awards || []),
        sections: language === 'en' ? (project.sections || []) : (otherProject?.sections || []),
      },
    };
  };

  // 开始编辑现有项目
  const startEditing = (project: Project) => {
    setEditingProject(projectToEditable(project));
    setIsNewProject(false);
    setIsEditing(true);
  };

  // 创建新项目
  const startNewProject = () => {
    const newId = `new_${Date.now()}`;
    setEditingProject(createEmptyProject(newId));
    setIsNewProject(true);
    setIsEditing(true);
    setSelectedProjectId(null);
  };

  // 保存项目（只是关闭编辑器，实际保存需要导出JSON）
  const handleSave = (project: EditableProject) => {
    console.log('Project data:', project);
    alert(language === 'zh' ? '请点击"导出JSON"复制数据，然后发给开发者更新代码' : 'Please click "Export JSON" to copy data, then send to developer to update code');
    setIsEditing(false);
    setEditingProject(null);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditingProject(null);
  };

  const currentProjects = PROJECTS[language];
  const filteredProjects = filter === 'All' ? currentProjects : currentProjects.filter(p => p.category === filter);
  
  // 根据 ID 从当前语言的项目列表中获取选中的项目（这样切换语言时会自动更新）
  const selectedProject = selectedProjectId ? currentProjects.find(p => p.id === selectedProjectId) || null : null;
  const currentGallery = selectedProject?.gallery || [];

  // 选择作品时滚动到顶部
  useEffect(() => {
    if (selectedProjectId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedProjectId]);

  // 作品详情页组件
  const ProjectDetail = ({ project }: { project: Project }) => (
    <div className="bg-cream flex gap-8">
      {/* 左侧主内容 */}
      <div className="flex-1 min-w-0">
        {/* 分类标签 */}
        <div className="text-xs text-primary/40 uppercase tracking-widest mb-3 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          {CATEGORY_LABELS[language][project.category]}
        </div>

        {/* 标题 - 国际主义风格大字 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {project.title}
        </h1>

        {/* 描述 */}
        <p className="text-primary/60 text-base leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {project.description}
        </p>

        {/* 信息列表 */}
        <div className="space-y-4 border-t border-primary/10 pt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {project.role && (
            <div className="flex">
              <span className="w-32 text-sm text-primary/40 flex-shrink-0">
                {language === 'zh' ? '担任角色' : 'Role'}
              </span>
              <span className="text-sm text-primary">{project.role}</span>
            </div>
          )}
          {project.awards && project.awards.length > 0 && (
            <div className="flex">
              <span className="w-32 text-sm text-primary/40 flex-shrink-0">
                {language === 'zh' ? '获奖情况' : 'Awards'}
              </span>
              <div className="flex flex-col gap-1">
                {project.awards.map((award, i) => (
                  <span key={i} className="text-sm text-primary">★ {award}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 设计理念（兼容旧数据） */}
        {project.concept && (
          <div className="border-t border-primary/10 pt-6 mt-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <h3 className="text-lg font-bold text-primary mb-3">
              {language === 'zh' ? '设计理念' : 'Concept'}
            </h3>
            <p className="text-primary/60 leading-relaxed">{project.concept}</p>
          </div>
        )}

        {/* 视频/媒体区域（兼容旧数据）- 放在内容块之前 */}
        {(project.videoUrl || project.bilibiliId || project.youtubeId) && (
          <div className="border-t border-primary/10 pt-6 mt-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <h3 className="text-lg font-bold text-primary mb-4">
              {language === 'zh' ? '作品视频' : 'Video'}
            </h3>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              {project.videoUrl ? (
                <video 
                  src={toJsDelivr(project.videoUrl)} 
                  controls 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  style={{ backgroundColor: '#000' }}
                />
              ) : project.youtubeId ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${project.youtubeId}`} 
                  className="w-full h-full" 
                  allowFullScreen 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : project.bilibiliId ? (
                <iframe 
                  src={`https://player.bilibili.com/player.html?bvid=${project.bilibiliId}&page=1&danmaku=0&high_quality=1`} 
                  className="w-full h-full" 
                  allowFullScreen 
                />
              ) : null}
            </div>
          </div>
        )}

        {/* 自定义内容块 */}
        {project.sections && project.sections.map((section: ContentSection, i: number) => (
          <div key={i} className={`${section.hideTitle ? '' : 'border-t border-primary/10 pt-6 mt-6'} animate-fade-in`} style={{ animationDelay: `${0.25 + i * 0.1}s` }}>
            {!section.hideTitle && <h3 className="text-lg font-bold text-primary mb-3">{section.title}</h3>}
            {section.type === 'text' && (
              <p className="text-primary leading-relaxed whitespace-pre-line">{section.content}</p>
            )}
            {section.type === 'gallery' && (
              <div className={`grid gap-3 ${
                section.layout === 'full' ? 'grid-cols-1' :
                section.layout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' :
                section.layout === 'grid-3' ? 'grid-cols-1 md:grid-cols-3' :
                section.layout === 'grid-5' ? 'grid-cols-2 md:grid-cols-5' :
                'grid-cols-2 md:grid-cols-4'
              }`}>
                {section.images.map((img: string, j: number) => (
                  <SkeletonImage 
                    key={j} 
                    src={toJsDelivr(img)} 
                    alt="" 
                    className="w-full rounded-lg cursor-pointer hover:opacity-80 transition-opacity animate-fade-in"
                    style={{ animationDelay: `${j * 0.05}s` }}
                    onClick={() => { setLightboxImages(section.images); setLightboxIndex(j); }} 
                  />
                ))}
              </div>
            )}
            {section.type === 'video' && (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                {section.videoUrl ? (
                  <video 
                    src={toJsDelivr(section.videoUrl)} 
                    controls 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    style={{ backgroundColor: '#000' }}
                  />
                ) : section.youtubeId ? (
                  <iframe 
                    src={`https://www.youtube.com/embed/${section.youtubeId}`} 
                    className="w-full h-full" 
                    allowFullScreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : section.bilibiliId ? (
                  <iframe 
                    src={`https://player.bilibili.com/player.html?bvid=${section.bilibiliId}&page=1&danmaku=0&high_quality=1`} 
                    className="w-full h-full" 
                    allowFullScreen 
                  />
                ) : null}
              </div>
            )}
          </div>
        ))}

        {/* 摄影作品图库（兼容旧数据） */}
        {project.category === Category.PHOTO && currentGallery.length > 0 && (
          <div className="border-t border-primary/10 pt-6 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-bold text-primary mb-4">
              {language === 'zh' ? '作品图库' : 'Gallery'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {currentGallery.map((img, i) => (
                <SkeletonImage 
                  key={i} 
                  src={toJsDelivr(img)} 
                  alt="" 
                  className="w-full cursor-pointer hover:opacity-80 transition-opacity animate-fade-in" 
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => { setLightboxImages(currentGallery); setLightboxIndex(i); }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxImages.length > 0 && createPortal(
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center cursor-pointer" 
          onClick={() => { setLightboxIndex(null); setLightboxImages([]); }}
        >
          <img src={toJsDelivr(lightboxImages[lightboxIndex])} className="max-w-full max-h-full" alt="" referrerPolicy="no-referrer" />
        </div>,
        document.body
      )}
    </div>
  );

  return (
    <>
      {/* 固定侧边栏 - Portal 到 body */}
      {createPortal(
        <aside className="hidden md:flex flex-col bg-cream border-r border-primary/10"
          style={{ position: 'fixed', top: 0, bottom: 0, left: 56, width: 176, zIndex: 35, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* 国际主义风格标题 - 高度与面包屑对齐 */}
          <div className="px-4 pt-6 pb-4 border-b border-primary/10">
            <h2 className="text-sm font-black text-primary tracking-tight">
              {language === 'zh' ? '作品分类' : 'Categories'}
            </h2>
          </div>
          
          {/* 分类列表 - 国际主义风格 */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {FILTER_ITEMS.map((item, index) => {
              const isActive = filter === item.id;
              const categoryProjects = item.id === 'All' ? currentProjects : currentProjects.filter(p => p.category === item.id);
              const count = categoryProjects.length;
              return (
                <div key={item.id}>
                  <button 
                    onClick={() => { handleFilterChange(filter === item.id && item.id !== 'All' ? 'All' : item.id); }}
                    className="w-full flex items-center gap-2 py-2.5 text-left transition-colors group"
                  >
                    {/* 左侧符号 */}
                    <span className={`text-xs transition-colors ${isActive ? 'text-primary' : 'text-primary/30'}`}>
                      {isActive ? '●' : '○'}
                    </span>
                    {/* 分类名称 */}
                    <span className={`flex-1 text-sm tracking-tight transition-colors ${isActive ? 'font-bold text-primary' : 'text-primary/60 group-hover:text-primary'}`}>
                      {language === 'zh' ? item.labelZh : item.labelEn}
                    </span>
                    {/* 数量 */}
                    <span className={`text-xs tabular-nums transition-colors ${isActive ? 'text-primary' : 'text-primary/30'}`}>
                      {count}
                    </span>
                  </button>
                  {/* 底部分割线 */}
                  <div className="h-[1px] bg-primary/10" />
                  {/* 展开的项目列表 */}
                  {isActive && item.id !== 'All' && (
                    <div className="py-1 pl-5 pb-2 animate-fade-in">
                      {categoryProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleSelectProject(project.id)}
                          className={`w-full text-left py-1.5 text-xs transition-colors truncate flex items-center gap-2 ${selectedProject?.id === project.id ? 'text-primary font-bold' : 'text-primary/50 hover:text-primary'}`}
                          title={project.title}
                        >
                          <span className="text-[8px]">{selectedProject?.id === project.id ? '▸' : '·'}</span>
                          {project.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          {/* 日常练习 - 置底 */}
          <div className="px-4 py-2 border-t border-primary/10">
            <button 
              onClick={() => { handleFilterChange(Category.PRACTICE); }}
              className="w-full flex items-center gap-2 py-2.5 text-left transition-colors group"
            >
              <span className={`text-xs transition-colors ${filter === Category.PRACTICE ? 'text-primary' : 'text-primary/30'}`}>
                {filter === Category.PRACTICE ? '●' : '○'}
              </span>
              <span className={`flex-1 text-sm tracking-tight transition-colors ${filter === Category.PRACTICE ? 'font-bold text-primary' : 'text-primary/60 group-hover:text-primary'}`}>
                {language === 'zh' ? '日常练习' : 'Practice'}
              </span>
              <span className={`text-xs tabular-nums transition-colors ${filter === Category.PRACTICE ? 'text-primary' : 'text-primary/30'}`}>
                {PRACTICE_ITEMS.length}
              </span>
            </button>
          </div>
          
          {/* 底部统计 */}
          <div className="px-4 py-3 border-t border-primary/10 text-xs text-primary/40 font-medium tracking-wide">
            {currentProjects.filter(p => p.category !== Category.PRACTICE).length} {language === 'zh' ? '个作品' : 'Works'}
          </div>
        </aside>,
        document.body
      )}

      {/* Mobile Filter */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-primary/10 z-40 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_ITEMS.map((item) => (
            <button key={item.id} onClick={() => { handleFilterChange(item.id); }}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${filter === item.id ? 'bg-primary text-cream' : 'bg-primary/5 text-primary/60'}`}>
              {language === 'zh' ? item.labelZh : item.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 固定面包屑导航 - Portal 到 body */}
      {createPortal(
        <div className="hidden md:block fixed top-0 right-0 bg-cream z-20 px-6 pt-6 pb-4 border-b border-primary/10"
          style={{ left: 232 }}>
          <div className="flex items-center justify-between h-5">
            <div className="flex items-center gap-2 text-sm">
              <button 
                onClick={() => { handleSelectProject(null); handleFilterChange('All'); }}
                className={`transition-colors ${selectedProject || filter !== 'All' ? 'text-primary/50 hover:text-primary' : 'text-primary font-bold'}`}
              >
                {language === 'zh' ? '作品集' : 'Portfolio'}
              </button>
              {selectedProject && (
                <>
                  <span className="text-primary/30">/</span>
                  <button 
                    onClick={() => handleSelectProject(null)}
                    className="text-primary/50 hover:text-primary transition-colors"
                  >
                    {FILTER_ITEMS.find(f => f.id === selectedProject.category)?.[language === 'zh' ? 'labelZh' : 'labelEn'] || CATEGORY_LABELS[language][selectedProject.category]}
                  </button>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold truncate max-w-[300px]">
                    {selectedProject.title}
                  </span>
                </>
              )}
              {!selectedProject && filter !== 'All' && (
                <>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold">
                    {filter === Category.PRACTICE 
                      ? (language === 'zh' ? '日常练习' : 'Practice')
                      : FILTER_ITEMS.find(f => f.id === filter)?.[language === 'zh' ? 'labelZh' : 'labelEn']}
                  </span>
                  <span className="text-primary/30 ml-1">
                    ({filter === Category.PRACTICE ? PRACTICE_ITEMS.length : filteredProjects.length})
                  </span>
                </>
              )}
              {!selectedProject && filter === 'All' && (
                <span className="text-primary/30 ml-1">({filteredProjects.length})</span>
              )}
            </div>
            {/* 编辑按钮 */}
            {selectedProject && !isEditing && editorMode && (
              <button
                onClick={() => startEditing(selectedProject)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Pencil size={12} />
                {language === 'zh' ? '编辑' : 'Edit'}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 右侧固定信息栏 - 只在选中作品且非编辑模式时显示 */}
      {selectedProject && !isEditing && createPortal(
        <aside className="hidden lg:flex flex-col bg-cream border-l border-primary/10"
          style={{ position: 'fixed', top: 57, bottom: 0, right: 0, width: 220, zIndex: 15, overflowY: 'auto' }}>
          
          {/* 封面图 */}
          <div className="aspect-[4/3] bg-primary/5 m-4 mb-0 overflow-hidden flex-shrink-0">
            {selectedProject.image && (
              <SkeletonImage 
                src={toJsDelivr(selectedProject.image)} 
                alt={selectedProject.title} 
                className="w-full h-full"
              />
            )}
          </div>
          
          {/* 信息行 */}
          <div className="space-y-2 text-sm p-4 flex-shrink-0">
            <div className="flex justify-between">
              <span className="text-primary/40">{language === 'zh' ? '分类' : 'Category'}</span>
              <span className="text-primary">{CATEGORY_LABELS[language][selectedProject.category]}</span>
            </div>
            {selectedProject.role && (
              <div className="flex justify-between">
                <span className="text-primary/40">{language === 'zh' ? '角色' : 'Role'}</span>
                <span className="text-primary text-right ml-2">{selectedProject.role}</span>
              </div>
            )}
            {selectedProject.tags && selectedProject.tags.length > 0 && (
              <div className="flex justify-between">
                <span className="text-primary/40">{language === 'zh' ? '标签' : 'Tags'}</span>
                <span className="text-primary text-right ml-2">{selectedProject.tags.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>
          
          {/* 链接按钮区域 */}
          {(selectedProject.figmaUrl || selectedProject.websiteUrl || selectedProject.githubUrl || selectedProject.videoLinkUrl || selectedProject.articleCategory) && (
            <>
              <div className="h-[1px] bg-primary/10 flex-shrink-0" />
              <div className="p-4 space-y-2 flex-shrink-0">
                <p className="text-xs font-medium text-primary/60 mb-3">{language === 'zh' ? '链接' : 'Links'}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.articleCategory && (
                    <button 
                      onClick={() => navigate('/articles', { state: { category: selectedProject.articleCategory } })}
                      className="px-3 py-1.5 text-xs border border-primary/20 text-primary/70 hover:bg-[#E63946] hover:border-[#E63946] hover:text-white transition-colors"
                    >
                      Dev Log →
                    </button>
                  )}
                  {selectedProject.figmaUrl && (
                    <a 
                      href={selectedProject.figmaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs border border-primary/20 text-primary/70 hover:bg-primary hover:text-cream transition-colors"
                    >
                      Figma →
                    </a>
                  )}
                  {selectedProject.websiteUrl && (
                    <a 
                      href={selectedProject.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs border border-primary/20 text-primary/70 hover:bg-primary hover:text-cream transition-colors"
                    >
                      {language === 'zh' ? '网站' : 'Website'} →
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a 
                      href={selectedProject.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs border border-primary/20 text-primary/70 hover:bg-primary hover:text-cream transition-colors"
                    >
                      GitHub →
                    </a>
                  )}
                  {selectedProject.videoLinkUrl && (
                    <a 
                      href={selectedProject.videoLinkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs border border-primary/20 text-primary/70 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-colors"
                    >
                      Video →
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* 细分割线 - 贯穿整个宽度 */}
          <div className="h-[1px] bg-primary/10 flex-shrink-0" />
          
          {/* 批注区域 */}
          <div className="flex-1 text-xs text-primary/50 space-y-2 p-4 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <p className="font-medium text-primary/60">{language === 'zh' ? '批注' : 'Notes'}</p>
            <p className="whitespace-pre-line">{selectedProject.notes || (language === 'zh' ? '暂无批注' : 'No notes')}</p>
          </div>
          
          {/* 底部分割线和日期/版权 - 贯穿整个宽度 */}
          <div className="h-[1px] bg-primary/10 flex-shrink-0" />
          <div className="text-xs text-primary/30 p-4 flex-shrink-0 flex justify-between">
            <span>{selectedProject.date || ''}</span>
            <span>© 2024 YOUNG</span>
          </div>
        </aside>,
        document.body
      )}

      {/* Main Content */}
      <div className={`bg-cream pb-20 md:ml-44 md:pt-16 ${selectedProject && !isEditing ? 'lg:mr-[220px]' : ''}`}>
        {/* 内容区 */}
        <div className="p-6">
          {isEditing && editingProject ? (
            <ProjectEditor
              project={editingProject}
              language={language}
              onSave={handleSave}
              onCancel={handleCancel}
              isNew={isNewProject}
            />
          ) : selectedProject ? (
            <ProjectDetail project={selectedProject} />
          ) : filter === Category.PRACTICE ? (
            /* 日常练习展示区 */
            <PracticeGallery language={language} editorMode={editorMode} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="group cursor-pointer bg-cream border-2 border-primary/10 hover:border-primary transition-all duration-300 relative overflow-hidden animate-fade-in" 
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleSelectProject(project.id)}
                >
                  {/* 编号标签 */}
                  <div className="absolute top-0 left-0 z-10 bg-primary text-cream px-2 py-1 text-[10px] font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* 图片区域 */}
                  <div className="aspect-[4/3] bg-primary/5 overflow-hidden relative">
                    {project.image ? (
                      <img 
                        src={toJsDelivr(project.image)} 
                        alt={project.title} 
                        loading="lazy" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/20 text-4xl font-black">
                        {project.title.charAt(0)}
                      </div>
                    )}
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                  </div>
                  
                  {/* 信息区域 */}
                  <div className="p-4 border-t-2 border-primary/10 group-hover:border-primary transition-colors">
                    {/* 分类标签 */}
                    <div className="text-[10px] text-primary/40 uppercase tracking-widest mb-2 font-mono">
                      {CATEGORY_LABELS[language][project.category]}
                    </div>
                    {/* 标题 */}
                    <h3 className="font-black text-primary text-lg leading-tight tracking-tight group-hover:text-[#E63946] transition-colors">
                      {project.title}
                    </h3>
                    {/* 副标题 */}
                    {project.subtitle && (
                      <p className="text-xs text-primary/50 mt-2">
                        {project.subtitle}
                      </p>
                    )}
                    {/* 底部箭头 */}
                    <div className="flex justify-end mt-3 text-primary/20 group-hover:text-primary transition-colors">
                      <span className="text-xs font-mono">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});
