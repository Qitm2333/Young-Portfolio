import React, { useState } from 'react';
import { ArticleCategory, Language } from '../types';
import { X, Copy, Check, Trash2 } from 'lucide-react';
import { toJsDelivr } from '../src/utils/cdn';

// 编辑器使用的文章数据结构（双语）
export interface EditableArticle {
  id: string;
  common: {
    category: string;
    link: string;
    coverImage: string;
    date: string;
  };
  zh: {
    title: string;
  };
  en: {
    title: string;
  };
}

interface ArticleEditorProps {
  article: EditableArticle;
  language: Language;
  onSave: (article: EditableArticle) => void;
  onCancel: () => void;
  isNew?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: ArticleCategory.RANDOM, labelZh: '随便写写', labelEn: 'Random Writings' },
];

// 创建空白文章模板
export const createEmptyArticle = (id: string): EditableArticle => ({
  id,
  common: {
    category: ArticleCategory.RANDOM,
    link: 'https://mp.weixin.qq.com/s/',
    coverImage: '',
    date: new Date().toISOString().slice(0, 10),
  },
  zh: {
    title: '新文章标题',
  },
  en: {
    title: 'New Article Title',
  },
});

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article: initialArticle,
  language,
  onSave,
  onCancel,
  isNew = false,
}) => {
  const [article, setArticle] = useState<EditableArticle>(initialArticle);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh');

  // 更新通用字段
  const updateCommon = (field: string, value: string) => {
    setArticle(prev => ({
      ...prev,
      common: { ...prev.common, [field]: value }
    }));
  };

  // 更新语言特定字段
  const updateLang = (lang: 'zh' | 'en', field: string, value: string) => {
    setArticle(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  // 导出 JSON
  const exportJSON = () => {
    const json = JSON.stringify(article, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 删除文章（导出删除指令）
  const handleDelete = () => {
    const confirmMsg = language === 'zh' 
      ? `确定要删除文章「${article.zh.title}」吗？\n\n删除指令将复制到剪贴板，请发给开发者处理。`
      : `Are you sure you want to delete "${article.en.title}"?\n\nDelete instruction will be copied to clipboard.`;
    
    if (confirm(confirmMsg)) {
      const deleteInstruction = `【删除文章请求】\nID: ${article.id}\n中文标题: ${article.zh.title}\n英文标题: ${article.en.title}\n分类: ${article.common.category}`;
      navigator.clipboard.writeText(deleteInstruction);
      alert(language === 'zh' ? '删除指令已复制，请发给开发者处理！' : 'Delete instruction copied! Please send to developer.');
      onCancel();
    }
  };

  return (
    <div className="bg-cream">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-10 bg-cream border-b border-primary/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">
            {isNew ? (language === 'zh' ? '新建文章' : 'New Article') : (language === 'zh' ? '编辑文章' : 'Edit Article')}
          </span>
          <span className="text-xs text-primary/40">ID: {article.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 删除按钮 - 只在编辑现有文章时显示 */}
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              {language === 'zh' ? '删除' : 'Delete'}
            </button>
          )}
          <button
            onClick={exportJSON}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? (language === 'zh' ? '已复制' : 'Copied') : (language === 'zh' ? '导出JSON' : 'Export JSON')}
          </button>
          <button
            onClick={() => onSave(article)}
            className="px-3 py-1.5 text-sm bg-primary text-cream hover:bg-primary/90 transition-colors"
          >
            {language === 'zh' ? '保存' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 text-primary/60 hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 通用信息 */}
        <div className="bg-white border border-primary/10 p-4">
          <h3 className="font-bold text-primary mb-4">{language === 'zh' ? '通用信息' : 'Common Info'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-primary/60 mb-1">{language === 'zh' ? '分类' : 'Category'}</label>
              <select
                value={article.common.category}
                onChange={(e) => updateCommon('category', e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 bg-cream text-sm"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'zh' ? opt.labelZh : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-primary/60 mb-1">{language === 'zh' ? '日期' : 'Date'}</label>
              <input
                type="date"
                value={article.common.date}
                onChange={(e) => updateCommon('date', e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 bg-cream text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-primary/60 mb-1">{language === 'zh' ? '文章链接' : 'Article Link'}</label>
              <input
                type="text"
                value={article.common.link}
                onChange={(e) => updateCommon('link', e.target.value)}
                placeholder="https://mp.weixin.qq.com/s/xxxxx"
                className="w-full px-3 py-2 border border-primary/20 bg-cream text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-primary/60 mb-1">{language === 'zh' ? '封面图URL' : 'Cover Image URL'}</label>
              <input
                type="text"
                value={article.common.coverImage}
                onChange={(e) => updateCommon('coverImage', e.target.value)}
                placeholder="https://mmbiz.qpic.cn/..."
                className="w-full px-3 py-2 border border-primary/20 bg-cream text-sm"
              />
              <p className="text-[10px] text-primary/40 mt-1">
                {language === 'zh' ? '提示：支持GIF动图，直接粘贴微信图片链接即可' : 'Tip: GIF supported, paste WeChat image URL directly'}
              </p>
            </div>
          </div>
        </div>

        {/* 封面预览 */}
        {article.common.coverImage && (
          <div className="bg-white border border-primary/10 p-4">
            <h3 className="font-bold text-primary mb-4">{language === 'zh' ? '封面预览' : 'Cover Preview'}</h3>
            <div className="aspect-[4/3] bg-primary/5 overflow-hidden max-w-md">
              <img 
                src={toJsDelivr(article.common.coverImage)} 
                alt="Cover preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* 语言切换标签 */}
        <div className="flex border-b border-primary/20">
          <button
            onClick={() => setActiveTab('zh')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'zh' ? 'text-primary border-b-2 border-primary' : 'text-primary/50'}`}
          >
            中文
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'en' ? 'text-primary border-b-2 border-primary' : 'text-primary/50'}`}
          >
            English
          </button>
        </div>

        {/* 语言特定内容 */}
        <div className="bg-white border border-primary/10 p-4">
          <h3 className="font-bold text-primary mb-4">{activeTab === 'zh' ? '中文内容' : 'English Content'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-primary/60 mb-1">{language === 'zh' ? '标题' : 'Title'}</label>
              <input
                type="text"
                value={article[activeTab].title}
                onChange={(e) => updateLang(activeTab, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-primary/20 bg-cream text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
