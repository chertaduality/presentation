import { Presentation, Slide } from '../types';

const DEFAULT_SLIDE_HTML = `
<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; box-sizing: border-box; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <h1 style="font-size: 72px; font-weight: bold; margin: 0 0 20px 0; text-align: center;">Новый слайд</h1>
  <p style="font-size: 32px; margin: 0; opacity: 0.9; text-align: center;">Нажмите для редактирования</p>
</div>
`;

export const createDefaultSlide = (title: string = 'Новый слайд'): Slide => {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    htmlContent: DEFAULT_SLIDE_HTML,
  };
};

export const createDefaultPresentation = (): Presentation => {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Новая презентация',
    company: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slides: [
      createDefaultSlide('Титульный слайд'),
      createDefaultSlide('Слайд 2'),
      createDefaultSlide('Слайд 3'),
    ],
  };
};
