import React from 'react';
import { Calendar, Award, ArrowRight } from 'lucide-react';
import { Language, Project } from '../../types';
import { toJsDelivr } from '../../src/utils/cdn';

interface ProjectDetailWidgetProps {
  language: Language;
  project: Project;
  onViewProject?: () => void;
}

export const ProjectDetailWidget: React.FC<ProjectDetailWidgetProps> = ({ 
  language, 
  project,
  onViewProject 
}) => {
  const content = {
    zh: {
      title: '作品详情',
      viewDetail: '查看完整项目',
    },
    en: {
      title: 'Project Detail',
      viewDetail: 'View Full Project',
    },
  };

  const t = content[language];

  // v2 - 优化布局：标签右对齐，信息同行显示
  return (
    <div className="border-2 border-primary bg-cream my-2 animate-fade-in">
      {/* Header */}
      <div className="px-3 py-2 border-b-2 border-primary bg-primary/5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-primary/60 uppercase tracking-wider">{t.title}</span>
        <div className="w-4 h-4 bg-[#E63946]" />
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex gap-3">
          {/* Left: Title & Subtitle & Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-primary leading-tight mb-1">
                {project.title}
              </h3>
              <p className="text-[10px] text-primary/50 leading-relaxed">
                {project.subtitle}
              </p>
            </div>
            
            {/* Info Row: Role + Date/Awards + Tags + Category */}
            <div className="flex items-center gap-2 flex-wrap text-[10px]">
              {/* Role */}
              {project.role && (
                <>
                  <div className="flex items-center gap-1 text-primary/60">
                    <span className="w-1 h-1 bg-primary/40 rounded-full flex-shrink-0" />
                    <span>{project.role}</span>
                  </div>
                  <span className="text-primary/20">|</span>
                </>
              )}

              {/* Date */}
              {project.date && (
                <>
                  <div className="flex items-center gap-1 text-primary/50">
                    <Calendar size={9} className="flex-shrink-0" />
                    <span className="font-mono">{project.date}</span>
                  </div>
                  <span className="text-primary/20">|</span>
                </>
              )}

              {/* Awards */}
              {project.awards && project.awards.length > 0 && (
                <>
                  <div className="flex items-center gap-1 text-primary/50">
                    <Award size={9} className="text-[#FFD700] flex-shrink-0" />
                    <span className="line-clamp-1">{project.awards[0]}</span>
                  </div>
                  <span className="text-primary/20">|</span>
                </>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <>
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i}
                      className="text-[8px] px-1.5 py-0.5 border border-primary/20 text-primary/60 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-primary/20">|</span>
                </>
              )}

              {/* Category */}
              <div className="px-1.5 py-0.5 bg-primary/10 text-[8px] text-primary/60 font-mono">
                {project.category}
              </div>
            </div>
          </div>
          
          {/* Right: Icon - 自动填充高度 */}
          {project.image && (
            <div className="w-20 h-20 flex-shrink-0 bg-primary/10 border border-primary/20 overflow-hidden">
              <img 
                src={toJsDelivr(project.image)} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer - View Full Project */}
      {onViewProject && (
        <div 
          className="px-3 py-2 border-t-2 border-primary bg-primary text-cream cursor-pointer hover:bg-[#E63946] transition-colors flex items-center justify-between group"
          onClick={onViewProject}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide">{t.viewDetail}</span>
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );
};
