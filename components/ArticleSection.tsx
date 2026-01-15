import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Language } from '../types';
import { Plus, Pencil, ArrowLeft } from 'lucide-react';
import { ArticleEditor, EditableArticle, createEmptyArticle } from './ArticleEditor';
import { toJsDelivr } from '../src/utils/cdn';
import { getArticles, getCategories, ArticleMeta, CategoryInfo } from '../src/utils/articleLoader';

// 动态文章类型（兼容旧 Article 接口）
interface Article extends ArticleMeta {
  link?: string;
}

interface ArticleSectionProps {
  language: Language;
  triggerNewArticle?: boolean;
}

export const ArticleSection: React.FC<ArticleSectionProps> = ({ language, triggerNewArticle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 动态获取文章和分类
  const allArticles = getArticles();
  const categories = getCategories();
  
  // 从 URL 解析分类和文章 ID
  const parseUrlParams = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'articles') {
      const urlCategory = pathParts[1];
      const urlArticleId = pathParts[2];
      return {
        category: urlCategory || null,
        articleId: urlArticleId || null
      };
    }
    return { category: null, articleId: null };
  };
  
  const urlParams = parseUrlParams();
  
  const [filter, setFilter] = useState<string | null>(() => {
    if (urlParams.articleId) {
      const article = allArticles.find(a => a.id === urlParams.articleId);
      return article?.category || urlParams.category;
    }
    return urlParams.category;
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (urlParams.articleId && urlParams.category) {
      return allArticles.find(a => a.id === urlParams.articleId && a.category === urlParams.category) || null;
    }
    return null;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<EditableArticle | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // 监听 URL 变化，更新状态
  useEffect(() => {
    const { category, articleId } = parseUrlParams();
    if (articleId && category) {
      const article = allArticles.find(a => a.id === articleId && a.category === category);
      if (article) {
        setSelectedArticle(article);
        setFilter(article.category);
      }
    } else if (category) {
      setFilter(category);
      setSelectedArticle(null);
    }
  }, [location.pathname]);
  
  // 从路由状态接收分类参数（兼容旧的跳转方式）
  useEffect(() => {
    if (location.state?.category) {
      setFilter(location.state.category);
      navigate(`/articles/${location.state.category}`, { replace: true });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 选择文章时更新 URL
  const handleSelectArticle = (article: Article | null) => {
    setSelectedArticle(article);
    if (article) {
      navigate(`/articles/${article.category}/${article.id}`);
    } else {
      if (filter) {
        navigate(`/articles/${filter}`);
      } else {
        navigate('/articles');
      }
    }
  };

  // 切换分类时更新 URL
  const handleFilterChange = (newFilter: string | null) => {
    setFilter(newFilter);
    setSelectedArticle(null);
    if (newFilter) {
      navigate(`/articles/${newFilter}`);
    } else {
      navigate('/articles');
    }
  };

  // 用于存储卡片元素的引用
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const filteredArticles = filter ? allArticles.filter(a => a.category === filter) : [];

  // 语言切换时更新 selectedArticle
  useEffect(() => {
    if (selectedArticle) {
      const updatedArticle = allArticles.find(a => a.id === selectedArticle.id && a.category === selectedArticle.category);
      if (updatedArticle) {
        setSelectedArticle(updatedArticle);
      }
    }
  }, [language]);

  // 点击文章卡片
  const handleArticleClick = (article: Article) => {
    // 优先显示详情页（即使内容为空也显示）
    handleSelectArticle(article);
  };

  // 点击时间轴节点 - 滚动到对应卡片并高亮
  const handleTimelineClick = (article: Article) => {
    const cardElement = cardRefs.current[article.id];
    if (cardElement) {
      // 滚动到卡片位置
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 设置高亮
      setHighlightedId(article.id);
      // 2秒后取消高亮
      setTimeout(() => setHighlightedId(null), 2000);
    }
  };

  // 将 Article 转换为 EditableArticle 格式
  const articleToEditable = (article: Article): EditableArticle => {
    return {
      id: article.id,
      common: {
        category: article.category as any,
        link: article.link,
        coverImage: article.coverImage || '',
        date: article.date,
      },
      zh: {
        title: article.title,
        content: article.content,
      },
      en: {
        title: article.title,
        content: article.content,
      },
    };
  };

  // 开始编辑现有文章
  const startEditing = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(articleToEditable(article));
    setIsNewArticle(false);
    setIsEditing(true);
  };

  // 创建新文章
  const startNewArticle = () => {
    const newId = `new_${Date.now()}`;
    setEditingArticle(createEmptyArticle(newId));
    setIsNewArticle(true);
    setIsEditing(true);
  };

  // 保存文章
  const handleSave = (article: EditableArticle) => {
    console.log('Article data:', article);
    alert(language === 'zh' ? '请点击"导出JSON"复制数据，然后发给开发者更新代码' : 'Please click "Export JSON" to copy data, then send to developer to update code');
    setIsEditing(false);
    setEditingArticle(null);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditingArticle(null);
  };

  // 响应外部触发新建文章
  React.useEffect(() => {
    if (triggerNewArticle) {
      startNewArticle();
    }
  }, [triggerNewArticle]);

  return (
    <>
      {/* 固定侧边栏 - Portal 到 body */}
      {createPortal(
        <aside className="hidden md:flex flex-col bg-cream border-r border-primary/10"
          style={{ position: 'fixed', top: 0, bottom: 0, left: 56, width: 176, zIndex: 35, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* 国际主义风格标题 - 高度与面包屑对齐 */}
          <div className="px-4 pt-6 pb-4 border-b border-primary/10">
            <h2 className="text-sm font-black text-primary tracking-tight">
              {language === 'zh' ? '项目分类' : 'Projects'}
            </h2>
          </div>
          
          {/* 分类列表 - 动态生成 */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {categories.map((cat) => {
              const isActive = filter === cat.id;
              return (
                <div key={cat.id}>
                  <button 
                    onClick={() => handleFilterChange(filter === cat.id ? null : cat.id)}
                    className="w-full flex items-center gap-2 py-2.5 text-left transition-colors group"
                  >
                    {/* 左侧符号 */}
                    <span className={`text-xs transition-colors ${isActive ? 'text-primary' : 'text-primary/30'}`}>
                      {isActive ? '●' : '○'}
                    </span>
                    {/* 分类名称 */}
                    <span className={`flex-1 text-sm tracking-tight transition-colors ${isActive ? 'font-bold text-primary' : 'text-primary/60 group-hover:text-primary'}`}>
                      {cat.label}
                    </span>
                    {/* 数量 */}
                    <span className={`text-xs tabular-nums transition-colors ${isActive ? 'text-primary' : 'text-primary/30'}`}>
                      {cat.count}
                    </span>
                  </button>
                  {/* 底部分割线 */}
                  <div className="h-[1px] bg-primary/10" />
                  {/* 展开的文章列表 */}
                  {isActive && (
                    <div className="py-1 pl-5 pb-2 animate-fade-in">
                      {filteredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleSelectArticle(article)}
                          className={`w-full text-left py-1.5 text-xs transition-colors truncate flex items-center gap-2 ${
                            selectedArticle?.id === article.id 
                              ? 'text-primary font-bold' 
                              : 'text-primary/50 hover:text-primary'
                          }`}
                          title={article.title}
                        >
                          <span className="text-[8px]">{selectedArticle?.id === article.id ? '▸' : '·'}</span>
                          {article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          {/* 底部统计 */}
          <div className="px-4 py-3 border-t border-primary/10 text-xs text-primary/40 font-medium tracking-wide">
            {allArticles.length} {language === 'zh' ? '篇日志' : 'Logs'}
          </div>
        </aside>,
        document.body
      )}

      {/* Mobile Filter */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-primary/10 z-40 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => handleFilterChange(cat.id)}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${filter === cat.id ? 'bg-primary text-cream' : 'bg-primary/5 text-primary/60'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 固定面包屑导航 - Portal 到 body */}
      {createPortal(
        <div className="hidden md:block fixed top-0 right-0 bg-cream z-20 px-6 pt-6 pb-4 border-b border-primary/10 transition-opacity duration-200"
          style={{ left: 232 }}>
          <div className="flex items-center justify-between h-5">
            <div className="flex items-center gap-2 text-sm">
              <button 
                onClick={() => { handleFilterChange(null); setIsEditing(false); }}
                className={`transition-colors ${filter || isEditing || selectedArticle ? 'text-primary/50 hover:text-primary' : 'text-primary font-bold'}`}
              >
                {language === 'zh' ? '开发日志' : 'Dev Log'}
              </button>
              {selectedArticle && !isEditing && (
                <>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold truncate max-w-[300px]">
                    {selectedArticle.title}
                  </span>
                </>
              )}
              {isEditing && (
                <>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold">
                    {isNewArticle ? (language === 'zh' ? '新建日志' : 'New Log') : (language === 'zh' ? '编辑日志' : 'Edit Log')}
                  </span>
                </>
              )}
              {!isEditing && !selectedArticle && filter && (
                <>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold">
                    {categories.find(c => c.id === filter)?.label || filter}
                  </span>
                  <span className="text-primary/30 ml-1">({filteredArticles.length})</span>
                </>
              )}
              {!isEditing && !selectedArticle && !filter && (
                <span className="text-primary/40 ml-1">{language === 'zh' ? '请选择项目' : 'Select a project'}</span>
              )}
            </div>
            {/* 新建按钮 */}
            {!isEditing && !selectedArticle && (
              <button
                onClick={startNewArticle}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus size={12} />
                {language === 'zh' ? '新建' : 'New'}
              </button>
            )}
            {/* 编辑按钮 - 查看文章详情时显示 */}
            {selectedArticle && !isEditing && (
              <button
                onClick={() => { setEditingArticle(articleToEditable(selectedArticle)); setIsNewArticle(false); setIsEditing(true); }}
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

      {/* Main Content */}
      <div className="bg-cream pb-20 md:ml-44 lg:mr-56 md:pt-16">
        {/* 内容区 */}
        <div className="p-6">
          {isEditing && editingArticle ? (
            <ArticleEditor
              article={editingArticle}
              language={language}
              onSave={handleSave}
              onCancel={handleCancel}
              isNew={isNewArticle}
            />
          ) : selectedArticle ? (
            /* 文章详情视图 */
            <div className="max-w-3xl">
              {/* 返回按钮 */}
              <button
                onClick={() => handleSelectArticle(null)}
                className="flex items-center gap-2 text-sm text-primary/60 hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft size={16} />
                {language === 'zh' ? '返回列表' : 'Back to list'}
              </button>
              
              {/* 文章头部 */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-primary/40 uppercase tracking-widest font-mono">
                    {categories.find(c => c.id === selectedArticle.category)?.label || selectedArticle.category}
                  </span>
                  <span className="text-xs text-primary/30 font-mono">{selectedArticle.date}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-primary leading-tight tracking-tight mb-4">
                  {selectedArticle.title}
                </h1>
              </div>
              
              {/* 封面图 */}
              {selectedArticle.coverImage && (
                <div className="mb-8 aspect-[2/1] bg-primary/5 overflow-hidden rounded-lg">
                  <img 
                    src={toJsDelivr(selectedArticle.coverImage)} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              
              {/* Markdown 内容 */}
              <article className="prose prose-primary max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-black text-primary mt-8 mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold text-primary mt-6 mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-bold text-primary mt-4 mb-2">{children}</h3>,
                    p: ({children}) => <p className="text-primary/80 leading-relaxed mb-4">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside text-primary/80 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside text-primary/80 mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-primary/80">{children}</li>,
                    code: ({children}) => <code className="bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-primary">{children}</code>,
                    pre: ({children}) => <pre className="bg-primary/5 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-primary/60 mb-4">{children}</blockquote>,
                    a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#E63946] hover:underline">{children}</a>,
                    img: ({src, alt}) => <img src={src} alt={alt} className="rounded-lg my-4 max-w-full" referrerPolicy="no-referrer" />,
                    hr: () => <hr className="border-primary/10 my-8" />,
                  }}
                >
                  {selectedArticle.content || ''}
                </ReactMarkdown>
                {/* 空内容占位 */}
                {!selectedArticle.content && (
                  <div className="py-12 text-center border-2 border-dashed border-primary/20 rounded-lg">
                    <p className="text-primary/40 text-sm">
                      {language === 'zh' ? '内容正在撰写中...' : 'Content coming soon...'}
                    </p>
                  </div>
                )}
              </article>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {filteredArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    ref={(el) => { cardRefs.current[article.id] = el; }}
                    className={`group cursor-pointer bg-cream border-2 transition-all duration-300 relative overflow-hidden animate-fade-in flex ${
                      highlightedId === article.id 
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/20' 
                        : 'border-primary/10 hover:border-primary'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleArticleClick(article)}
                    onMouseEnter={() => setHoveredId(article.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* 左侧编号 */}
                    <div className={`w-12 md:w-16 flex-shrink-0 flex items-center justify-center border-r-2 transition-colors ${
                      highlightedId === article.id 
                        ? 'bg-[#E63946] border-[#E63946]' 
                        : 'bg-primary/5 border-primary/10 group-hover:border-primary group-hover:bg-primary'
                    }`}>
                      <span className={`text-sm md:text-base font-mono font-bold transition-colors ${
                        highlightedId === article.id 
                          ? 'text-cream' 
                          : 'text-primary/40 group-hover:text-cream'
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    
                    {/* 中间内容区域 */}
                    <div className="flex-1 flex items-center px-4 md:px-6 py-4 md:py-5 min-w-0">
                      <div className="flex-1 min-w-0">
                        {/* 分类标签 */}
                        <span className="text-[10px] text-primary/40 uppercase tracking-widest font-mono">
                          {categories.find(c => c.id === article.category)?.label || article.category}
                        </span>
                        {/* 标题 */}
                        <h3 className="font-black text-primary text-base md:text-lg leading-tight tracking-tight group-hover:text-[#E63946] transition-colors truncate mt-1">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* 右侧日期、编辑按钮和箭头 */}
                    <div className="flex-shrink-0 flex items-center gap-3 md:gap-4 px-4 md:px-6 border-l-2 border-primary/10 group-hover:border-primary transition-colors">
                      <span className="text-xs text-primary/30 font-mono hidden sm:block">{article.date}</span>
                      {/* 编辑按钮 */}
                      <button
                        onClick={(e) => startEditing(article, e)}
                        className="p-1.5 bg-primary/10 text-primary/40 hover:bg-primary hover:text-cream opacity-0 group-hover:opacity-100 transition-all"
                        title={language === 'zh' ? '编辑' : 'Edit'}
                      >
                        <Pencil size={12} />
                      </button>
                      <span className="text-sm font-mono text-primary/20 group-hover:text-primary transition-colors">↗</span>
                    </div>
                  </div>
                ))}
              </div>
              {filteredArticles.length === 0 && (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-primary/20">
                  <p className="text-primary/40">
                    {filter 
                      ? (language === 'zh' ? '暂无日志' : 'No logs found')
                      : (language === 'zh' ? '请在左侧选择一个项目' : 'Please select a project from the left')
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 右侧时间轴 - 列表视图和详情页都显示，编辑模式隐藏 */}
      {!isEditing && createPortal(
        <aside className="hidden lg:flex flex-col bg-cream border-l border-primary/10"
          style={{ position: 'fixed', top: 57, bottom: 0, right: 0, width: 220, zIndex: 15, overflowY: 'auto' }}>
          
          {/* 标题 */}
          <div className="p-4 border-b border-primary/10">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest">
              {language === 'zh' ? '时间轴' : 'Timeline'}
            </h3>
            <p className="text-[10px] text-primary/40 mt-1 font-mono">
              {selectedArticle 
                ? categories.find(c => c.id === selectedArticle.category)?.label || selectedArticle.category
                : filter 
                  ? categories.find(c => c.id === filter)?.label || filter
                  : (language === 'zh' ? '请选择项目' : 'Select a project')
              }
            </p>
          </div>
          
          {/* 时间轴内容 */}
          <div className="flex-1 px-4 py-4 relative">
            {/* 垂直线 */}
            <div className="absolute left-[21px] top-0 bottom-0 w-[2px] bg-primary/15" />
            
            {/* 时间节点 - 详情页显示同分类文章，列表页显示筛选后文章 */}
            <div className="space-y-4">
              {(selectedArticle 
                ? allArticles.filter(a => a.category === selectedArticle.category)
                : filteredArticles
              ).map((article, index) => {
                const isCurrentArticle = selectedArticle?.id === article.id;
                // 详情页只看 isCurrentArticle，列表页看 highlightedId 和 hoveredId
                const isActive = selectedArticle 
                  ? isCurrentArticle 
                  : (highlightedId === article.id || hoveredId === article.id);
                return (
                  <div 
                    key={article.id} 
                    className="relative flex gap-3 group cursor-pointer"
                    onClick={() => {
                      if (selectedArticle) {
                        // 详情页：切换到其他日志
                        handleSelectArticle(article);
                      } else {
                        // 列表页：滚动到对应卡片
                        handleTimelineClick(article);
                      }
                    }}
                  >
                    {/* 节点圆点 */}
                    <div className="w-[12px] flex-shrink-0 flex justify-center pt-0.5">
                      <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                        isActive
                          ? 'bg-[#E63946] border-[#E63946]' 
                          : 'bg-cream border-primary/30 group-hover:bg-[#E63946] group-hover:border-[#E63946]'
                      }`} />
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 pb-4 border-b border-primary/5">
                      {/* 日期 */}
                      <div className="text-[10px] font-mono text-primary/40 mb-1">
                        {article.date}
                      </div>
                      {/* 标题 */}
                      <div className={`text-xs leading-tight transition-colors ${
                        isActive
                          ? 'text-primary font-bold' 
                          : 'text-primary/60 group-hover:text-primary'
                      }`}>
                        {article.title.length > 25 ? article.title.slice(0, 25) + '...' : article.title}
                      </div>
                      {/* 分类标签 */}
                      <div className="text-[9px] text-primary/30 uppercase tracking-wider mt-1 font-mono">
                        {categories.find(c => c.id === article.category)?.label || article.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 空状态 */}
            {filteredArticles.length === 0 && !selectedArticle && (
              <div className="text-center py-8 text-primary/30 text-xs">
                {language === 'zh' ? '暂无日志' : 'No logs'}
              </div>
            )}
          </div>
          
          {/* 底部统计 */}
          <div className="p-4 border-t border-primary/10">
            <div className="flex justify-between text-[10px] text-primary/40">
              <span>{language === 'zh' ? '共' : 'Total'}</span>
              <span className="font-mono font-bold text-primary">
                {selectedArticle 
                  ? allArticles.filter(a => a.category === selectedArticle.category).length
                  : filteredArticles.length
                }
              </span>
              <span>{language === 'zh' ? '篇日志' : 'logs'}</span>
            </div>
          </div>
        </aside>,
        document.body
      )}
    </>
  );
};
