import React from 'react';
import { Mail, Briefcase } from 'lucide-react';
import { Language } from '../../types';

interface ProfileWidgetProps {
  language: Language;
  onCopyEmail?: () => void;
}

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({ language, onCopyEmail }) => {
  const content = {
    zh: {
      title: '个人名片',
      name: 'Young',
      status: '自由职业设计师',
      education: '东北林业大学 · 工业设计',
      email: '邮箱',
      copyBtn: '复制',
    },
    en: {
      title: 'Profile Card',
      name: 'Young',
      status: 'Freelance Designer',
      education: 'NEFU · Industrial Design',
      email: 'Email',
      copyBtn: 'Copy',
    },
  };

  const t = content[language];

  return (
    <div className="border-2 border-primary bg-cream my-2 animate-fade-in">
      {/* Header */}
      <div className="px-3 py-2 border-b-2 border-primary bg-primary/5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-primary/60 uppercase tracking-wider">{t.title}</span>
        <div className="w-4 h-4 bg-[#E63946]" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name & Status */}
        <div>
          <h3 className="text-lg font-black text-primary mb-1">{t.name}</h3>
          <div className="flex items-center gap-2">
            <Briefcase size={12} className="text-primary/40" />
            <span className="text-xs text-primary/60">{t.status}</span>
          </div>
        </div>

        {/* Education */}
        <div className="text-xs text-primary/50 font-mono">
          {t.education}
        </div>

        {/* Email */}
        <div 
          className="flex items-center justify-between px-3 py-2 bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors group"
          onClick={onCopyEmail}
        >
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-primary/40 group-hover:text-primary" />
            <span className="text-xs text-primary/60 group-hover:text-primary font-mono">leeyoung0821@163.com</span>
          </div>
          <span className="text-[10px] text-primary/30 group-hover:text-primary uppercase">{t.copyBtn}</span>
        </div>
      </div>
    </div>
  );
};
