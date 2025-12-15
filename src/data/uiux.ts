import { Project } from '../../types';

export const UIUX_DATA: Project[] = [
  {
    id: 'd1',
    common: {
      category: 'UI Design',
      image: 'https',
      figmaUrl: 'https://www.figma.com/design/cRFVFLypB290MP6ImMgiPd/%E5%A4%A7%E5%B9%BF%E8%B5%9B-%7C-%E5%8D%B3%E6%97%B6%E8%AE%BE%E8%AE%A1-%E5%BE%81%E8%BE%B0%C2%B7HMI%E6%99%BA%E8%83%BD%E5%BA%A7%E8%88%B1%E8%AE%BE%E8%AE%A1?node-id=55-2&t=7dPgyLMJDD32pFp4-1',
      gallery: [
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=13'
      ]
    },
    zh: {
      title: '交互设计',
      subtitle: 'UI/UX 设计',
      description: '1',
      role: '1',
      concept: '。',
      roleDetail: '。'
    },
    en: {
      title: 'Journey HMI System',
      subtitle: 'UI/UX Design',
      description: 'HMI design for New Energy Vehicles (NEV). A "Visual Weight Reduction" system featuring glassmorphism and soft gradients.',
      role: 'UI Designer',
      tags: ['Automotive', 'HMI', 'Figma'],
      awards: ['Course Design Excellence Award'],
      concept: "I designed a 'Visual Weight Reduction' system: clearer information, fresher colors, improving driver comfort. I believed that in a car environment emphasizing immediate feedback, the interface needed strong visual feedback. Thus, glassmorphism and light skeuomorphism became my choice.",
      roleDetail: 'Independently completed the entire UI drawing and interaction logic from the central screen to the dashboard.'
    }
  }
];
