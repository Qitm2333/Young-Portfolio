import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ARTICLES, ARTICLE_LABELS } from '../constants';
import { ArticleCategory, Language, Article } from '../types';
import { BookOpen, Plus, Pencil } from 'lucide-react';
import { ArticleEditor, EditableArticle, createEmptyArticle } from './ArticleEditor';
import { toJsDelivr } from '../src/utils/cdn';

interface ArticleSectionProps {
  language: Language;
  triggerNewArticle?: boolean;
}

const FILTER_ITEMS = [
  { id: 'All', labelZh: '全部', labelEn: 'All' },
  { id: ArticleCategory.RANDOM, labelZh: '随便写写', labelEn: 'Random Writings' },
];

export const ArticleSection: React.FC<ArticleSectionProps> = ({ language, triggerNewArticle }) => {
  const [filter, setFilter] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<EditableArticle | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);

  const currentArticles = ARTICLES[language];
  const filteredArticles = filter === 'All' ? currentArticles : currentArticles.filter(a => a.category === filter);

  // 将 Article 转换为 EditableArticle 格式
  const articleToEditable = (article: Article): EditableArticle => {
    const otherLang = language === 'zh' ? 'en' : 'zh';
    const otherArticle = ARTICLES[otherLang].find(a => a.id === article.id);
    
    return {
      id: article.id,
      common: {
        category: article.category,
        link: article.link,
        coverImage: article.coverImage || '',
        date: article.date,
      },
      zh: {
        title: language === 'zh' ? article.title : (otherArticle?.title || ''),
      },
      en: {
        title: language === 'en' ? article.title : (otherArticle?.title || ''),
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
              {language === 'zh' ? '文章分类' : 'Categories'}
            </h2>
          </div>
          
          {/* 分类列表 - 国际主义风格 */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {FILTER_ITEMS.map((item) => {
              const isActive = filter === item.id;
              const categoryArticles = item.id === 'All' ? currentArticles : currentArticles.filter(a => a.category === item.id);
              const count = categoryArticles.length;
              return (
                <div key={item.id}>
                  <button 
                    onClick={() => setFilter(filter === item.id && item.id !== 'All' ? 'All' : item.id)}
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
                  {/* 展开的文章列表 */}
                  {isActive && item.id !== 'All' && (
                    <div className="py-1 pl-5 pb-2 animate-fade-in">
                      {categoryArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => window.open(article.link, '_blank')}
                          className="w-full text-left py-1.5 text-xs transition-colors truncate flex items-center gap-2 text-primary/50 hover:text-primary"
                          title={article.title}
                        >
                          <span className="text-[8px]">·</span>
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
            {currentArticles.length} {language === 'zh' ? '篇文章' : 'Articles'}
          </div>
        </aside>,
        document.body
      )}

      {/* Mobile Filter */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-primary/10 z-40 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${filter === item.id ? 'bg-primary text-cream' : 'bg-primary/5 text-primary/60'}`}>
              {language === 'zh' ? item.labelZh : item.labelEn}
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
                onClick={() => { setFilter('All'); setIsEditing(false); }}
                className={`transition-colors ${filter !== 'All' || isEditing ? 'text-primary/50 hover:text-primary' : 'text-primary font-bold'}`}
              >
                {language === 'zh' ? '文章' : 'Articles'}
              </button>
              {isEditing && (
                <>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold">
                    {isNewArticle ? (language === 'zh' ? '新建文章' : 'New Article') : (language === 'zh' ? '编辑文章' : 'Edit Article')}
                  </span>
                </>
              )}
              {!isEditing && filter !== 'All' && (
                <>
                  <span className="text-primary/30">/</span>
                  <span className="text-primary font-bold">
                    {FILTER_ITEMS.find(f => f.id === filter)?.[language === 'zh' ? 'labelZh' : 'labelEn']}
                  </span>
                  <span className="text-primary/30 ml-1">({filteredArticles.length})</span>
                </>
              )}
              {!isEditing && filter === 'All' && (
                <span className="text-primary/30 ml-1">({filteredArticles.length})</span>
              )}
            </div>
            {/* 新建按钮 */}
            {!isEditing && (
              <button
                onClick={startNewArticle}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus size={12} />
                {language === 'zh' ? '新建' : 'New'}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Main Content */}
      <div className="bg-cream pb-20 md:ml-44 md:pt-16">
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
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredArticles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="group cursor-pointer bg-cream border-2 border-primary/10 hover:border-primary transition-all duration-300 relative overflow-hidden animate-fade-in" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => window.open(article.link, '_blank')}
                  >
                    {/* 编号标签 */}
                    <div className="absolute top-0 left-0 z-10 bg-primary text-cream px-2 py-1 text-[10px] font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* 编辑按钮 */}
                    <button
                      onClick={(e) => startEditing(article, e)}
                      className="absolute top-0 right-0 z-10 bg-primary/80 text-cream p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={language === 'zh' ? '编辑' : 'Edit'}
                    >
                      <Pencil size={12} />
                    </button>
                    
                    {/* 图片区域 */}
                    <div className="aspect-[4/3] bg-primary/5 overflow-hidden relative">
                      {article.coverImage ? (
                        <img 
                          src={toJsDelivr(article.coverImage)} 
                          alt={article.title} 
                          loading="lazy" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/20">
                          <BookOpen size={48} />
                        </div>
                      )}
                      {/* 悬停遮罩 */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                    </div>
                    
                    {/* 信息区域 */}
                    <div className="p-4 border-t-2 border-primary/10 group-hover:border-primary transition-colors">
                      {/* 分类和日期 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-primary/40 uppercase tracking-widest font-mono">
                          {ARTICLE_LABELS[language][article.category]}
                        </span>
                        <span className="text-[10px] text-primary/30 font-mono">{article.date}</span>
                      </div>
                      {/* 标题 */}
                      <h3 className="font-black text-primary text-lg mb-2 leading-tight tracking-tight group-hover:text-[#E63946] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {/* 底部箭头 */}
                      <div className="flex justify-end mt-3 text-primary/20 group-hover:text-primary transition-colors">
                        <span className="text-xs font-mono">↗</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredArticles.length === 0 && (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-primary/20">
                  <p className="text-primary/40">{language === 'zh' ? '暂无文章' : 'No articles found'}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
