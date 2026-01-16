import React, { useState, useEffect } from 'react';
import { EDUCATION_DATA } from '../src/data/education';
import { Language } from '../types';
import { decryptData } from '../src/utils/decrypt';
import encryptedData from '../src/data/education.encrypted.json';
import { Bot } from 'lucide-react';

// 自定义中英翻译图标
const TranslateIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    fill="currentColor"
    className={className}
  >
    <path d="M608 416h288c35.36 0 64 28.48 64 64v416c0 35.36-28.48 64-64 64H480c-35.36 0-64-28.48-64-64v-288H128c-35.36 0-64-28.48-64-64V128c0-35.36 28.48-64 64-64h416c35.36 0 64 28.48 64 64v288z m0 64v64c0 35.36-28.48 64-64 64h-64v256.032c0 17.664 14.304 31.968 31.968 31.968H864a31.968 31.968 0 0 0 31.968-31.968V512a31.968 31.968 0 0 0-31.968-31.968H608zM128 159.968V512c0 17.664 14.304 31.968 31.968 31.968H512a31.968 31.968 0 0 0 31.968-31.968V160A31.968 31.968 0 0 0 512.032 128H160A31.968 31.968 0 0 0 128 159.968z m64 244.288V243.36h112.736V176h46.752c6.4 0.928 9.632 1.824 9.632 2.752a10.56 10.56 0 0 1-1.376 4.128c-2.752 7.328-4.128 16.032-4.128 26.112v34.368h119.648v156.768h-50.88v-20.64h-68.768v118.272H306.112v-118.272H238.752v24.768H192z m46.72-122.368v60.48h67.392V281.92H238.752z m185.664 60.48V281.92h-68.768v60.48h68.768z m203.84 488H576L668.128 576h64.64l89.344 254.4h-54.976l-19.264-53.664h-100.384l-19.232 53.632z m33.024-96.256h72.864l-34.368-108.608h-1.376l-37.12 108.608zM896 320h-64a128 128 0 0 0-128-128V128a192 192 0 0 1 192 192zM128 704h64a128 128 0 0 0 128 128v64a192 192 0 0 1-192-192z" />
  </svg>
);

interface SecretData {
  education: {
    school_zh: string;
    school_en: string;
    major_zh: string;
    major_en: string;
    period: string;
  };
  workExperiences: Array<{
    period: string;
    type_zh: string;
    type_en: string;
    company_zh: string;
    company_en: string;
    role_zh: string;
    role_en: string;
  }>;
  academicExperiences: Array<{
    period: string;
    institution_zh: string;
    institution_en: string;
    course_zh: string;
    course_en: string;
  }>;
}

interface TimelineSectionProps {
  language: Language;
  onOpenAiChat?: () => void;
  onToggleLanguage?: () => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ 
  language,
  onOpenAiChat,
  onToggleLanguage
}) => {
  const content = EDUCATION_DATA[language];
  
  // 验证状态
  const [verified, setVerified] = useState(() => {
    return sessionStorage.getItem('timelineVerified') === 'true';
  });
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState(false);
  
  // 解密后的数据
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  const handleVerify = async () => {
    const input = verifyInput.trim();
    const inputLower = input.toLowerCase();
    if (input === '李阳' || inputLower === 'ly') {
      setVerified(true);
      sessionStorage.setItem('timelineVerified', 'true');
      setVerifyError(false);
      
      // 验证通过后解密数据
      setDecrypting(true);
      try {
        const data = await decryptData<SecretData>(encryptedData);
        setSecretData(data);
      } catch (e) {
        console.error('解密失败:', e);
      }
      setDecrypting(false);
    } else {
      setVerifyError(true);
      setTimeout(() => setVerifyError(false), 1500);
    }
  };

  // 如果已验证，自动解密
  useEffect(() => {
    if (verified && !secretData) {
      decryptData<SecretData>(encryptedData)
        .then(setSecretData)
        .catch(e => console.error('解密失败:', e));
    }
  }, [verified, secretData]);

  // 从解密数据生成显示用的数据
  const workExperiences = secretData?.workExperiences.map(exp => ({
    period: exp.period,
    type: language === 'zh' ? exp.type_zh : exp.type_en,
    company: language === 'zh' ? exp.company_zh : exp.company_en,
    role: language === 'zh' ? exp.role_zh : exp.role_en
  })) || [];

  const academicExperiences = secretData?.academicExperiences.map(exp => ({
    period: exp.period,
    institution: language === 'zh' ? exp.institution_zh : exp.institution_en,
    course: language === 'zh' ? exp.course_zh : exp.course_en
  })) || [];

  const education = secretData?.education;



  return (
    <div className="w-full h-[100dvh] bg-cream flex flex-col overflow-hidden">
      
      {/* 顶部信息条 */}
      <div className="border-b-2 border-primary px-4 md:px-6 pt-4 pb-3 md:pt-6 md:pb-4 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-black text-primary uppercase tracking-tight">
          {language === 'zh' ? '经历' : 'Experience'}
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
            <TranslateIcon size={16} />
          </button>
        </div>
        <span className="hidden md:block text-[10px] font-mono text-primary/40 uppercase tracking-widest">
          {language === 'zh' ? '简历' : 'Resume'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧固定区域 */}
        <div className="hidden lg:block w-1/3 border-r-2 border-primary overflow-hidden">
          <div className="p-8 h-full flex flex-col">
            {/* 大标题 */}
            <div className="flex-1 flex flex-col justify-center">
              <h1 
                className="text-6xl xl:text-7xl font-black text-primary leading-[0.9] tracking-tighter mb-6 animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                {content.title}
              </h1>
              <p 
                className="text-primary/50 text-base leading-relaxed mb-8 animate-fade-in"
                style={{ animationDelay: '0.3s' }}
              >
                {content.about}
              </p>
              
              {/* 状态标签 */}
              <div 
                className="inline-flex items-center gap-3 border-2 border-primary px-4 py-3 animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="w-2 h-2 bg-[#E63946] animate-pulse" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">
                  {content.openToWork}
                </span>
              </div>
            </div>

            {/* 底部信息 */}
            <div className="border-t border-primary/10 pt-4 mt-8">
              <div className="text-[10px] font-mono text-primary/30 uppercase tracking-widest">
                © 2025 YOUNG
              </div>
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col overflow-auto">
          
          {/* 移动端标题 */}
          <div className="lg:hidden p-6 border-b-2 border-primary">
            <h1 className="text-4xl font-black text-primary leading-tight tracking-tighter mb-4 animate-fade-in">
              {content.title}
            </h1>
            <p className="text-primary/50 text-sm leading-relaxed mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {content.about}
            </p>
            <div className="inline-flex items-center gap-2 border border-primary px-3 py-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-2 h-2 bg-[#E63946] animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase">{content.openToWork}</span>
            </div>
          </div>

          {/* 验证界面或内容区域 */}
          {!verified ? (
            <div className="flex-1 flex flex-col justify-center items-center px-8">
              <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                  <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">Verification Required</span>
                  <h2 className="text-2xl font-black text-primary mt-2">{language === 'zh' ? '我叫什么？' : "What's my name?"}</h2>
                  <p className="text-sm text-primary/50 mt-2">{language === 'zh' ? '请输入正确答案以查看详细经历' : 'Enter the correct answer to view details'}</p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder={language === 'zh' ? '输入答案...' : 'Enter answer...'}
                    className={`w-full px-4 py-3 border-2 ${verifyError ? 'border-[#E63946] bg-[#E63946]/5' : 'border-primary/20 focus:border-primary'} bg-transparent text-primary font-mono text-center text-lg outline-none transition-all`}
                  />
                  <button
                    onClick={handleVerify}
                    className="w-full bg-primary text-cream py-3 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors cursor-pointer"
                  >
                    {language === 'zh' ? '验证' : 'Verify'}
                  </button>
                  {verifyError && (
                    <p className="text-[#E63946] text-sm text-center font-mono animate-pulse">
                      {language === 'zh' ? '答案不正确，请重试' : 'Incorrect answer, try again'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
          /* 内容区域 */
          <div className="flex-1 p-6 lg:p-8 space-y-10 flex flex-col justify-center">
            
            {/* EDUCATION */}
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-black text-primary uppercase tracking-widest">{language === 'zh' ? '教育经历' : 'Education'}</h2>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              {education ? (
                <div className="flex items-start justify-between pl-4 border-l-2 border-primary/20">
                  <div>
                    <div className="text-lg font-bold text-primary mb-1">
                      {language === 'zh' ? education.school_zh : education.school_en}
                    </div>
                    <div className="text-sm text-[#E63946] font-medium">
                      {language === 'zh' ? education.major_zh : education.major_en}
                    </div>
                  </div>
                  <div className="text-sm font-mono text-primary/50 whitespace-nowrap ml-4">{education.period}</div>
                </div>
              ) : (
                <div className="text-primary/30 text-sm">加载中...</div>
              )}
            </section>

            {/* ALL MY WORK */}
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-black text-primary uppercase tracking-widest">
                  {language === 'zh' ? '工作经历' : 'All My Work'}
                </h2>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              <div className="space-y-4">
                {workExperiences.map((exp, index) => (
                  <div key={index} className="flex items-start justify-between pl-4 border-l-2 border-primary/20 hover:border-[#E63946] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-primary">{exp.company}</span>
                        <span className="text-xs font-mono text-primary/30">( {exp.type} )</span>
                      </div>
                      <div className="text-sm text-primary/50">{exp.role}</div>
                    </div>
                    <div className="text-sm font-mono text-primary/50 whitespace-nowrap ml-4">{exp.period}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Academic & Workshop */}
            <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-black text-primary uppercase tracking-widest">
                  {language === 'zh' ? '学术与工作坊' : 'Academic & Workshop'}
                </h2>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              <div className="space-y-4">
                {academicExperiences.map((exp, index) => (
                  <div key={index} className="flex items-start justify-between pl-4 border-l-2 border-primary/20 hover:border-[#E63946] transition-colors">
                    <div>
                      <div className="text-base font-bold text-primary">{exp.institution}</div>
                      <div className="text-sm text-primary/50">{exp.course}</div>
                    </div>
                    <div className="text-sm font-mono text-primary/50 whitespace-nowrap ml-4">{exp.period}</div>
                  </div>
                ))}
              </div>
            </section>



          </div>
          )}
        </div>
      </div>
    </div>
  );
};
