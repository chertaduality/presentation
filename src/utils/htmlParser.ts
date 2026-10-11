import { Presentation, Slide } from '../types';
import html2canvas from 'html2canvas';

// ==========================================
// ИМПОРТ HTML: Разбиение на слайды
// ==========================================

export const importHTMLPresentation = async (
  htmlContent: string,
  title: string = 'Импортированная презентация'
): Promise<Presentation> => {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1280px;height:720px;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) {
      document.body.removeChild(iframe);
      resolve(createFallbackPresentation(title));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    const waitForResources = () => {
      return new Promise<void>((res) => {
        if (iframeDoc.fonts?.ready) {
          iframeDoc.fonts.ready.then(() => setTimeout(res, 500));
        } else {
          setTimeout(res, 1500);
        }
      });
    };

    waitForResources().then(async () => {
      try {
        const titleEl = iframeDoc.querySelector('title, h1');
        const extractedTitle = titleEl?.textContent?.trim() || title;

        console.log('Starting HTML import...');
        console.log('HTML length:', htmlContent.length);

        // Находим все слайды в HTML
        const slideElements = findSlideElements(iframeDoc);
        console.log('Total slides found:', slideElements.length);

        const slides: Slide[] = [];

        // Для каждого слайда создаём полный HTML
        for (let i = 0; i < slideElements.length; i++) {
          const slideEl = slideElements[i];

          console.log(`Processing slide ${i + 1}:`, slideEl.tagName, slideEl.className);

          const headingEl = slideEl.querySelector('h1, h2, h3');
          const slideTitle = headingEl?.textContent?.trim() || `Слайд ${i + 1}`;

          // Создаём HTML для этого слайда
          const slideHtmlContent = createSlideHTML(htmlContent, slideEl);

          console.log(`Slide ${i + 1} HTML length:`, slideHtmlContent.length);

          // Создаём слайд
          const slide: Slide = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${i}`,
            title: slideTitle,
            htmlContent: slideHtmlContent,
          };

          slides.push(slide);
        }

        console.log(`Created ${slides.length} slides total`);

        // Если не нашли слайды — берём весь HTML как один слайд
        if (slides.length === 0) {
          slides.push({
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            title: extractedTitle,
            htmlContent: htmlContent,
          });
        }

        document.body.removeChild(iframe);

        resolve({
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          title: extractedTitle,
          company: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slides: slides,
        });
      } catch (e) {
        document.body.removeChild(iframe);
        resolve(createFallbackPresentation(title));
      }
    });
  });
};

// Создаём HTML для конкретного слайда
const createSlideHTML = (
  originalHTML: string,
  slideEl: Element
): string => {
  // Парсим оригинальный HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalHTML, 'text/html');

  // Извлекаем все стили из <head>
  const styles = Array.from(doc.head.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  // Извлекаем контент слайда
  const slideContent = slideEl.outerHTML;

  // Создаём минимальный HTML только для этого слайда
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${styles}
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Масштабируем контент под размер */
    body > * {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
    }
  </style>
</head>
<body>
  ${slideContent}
</body>
</html>`;
};

const findSlideElements = (doc: Document): Element[] => {
  console.log('Finding slide elements...');

  // Пробуем разные селекторы в порядке приоритета
  const selectors = [
    '.slide',
    '.slides > section',
    '.slides section',
    'section.slide',
    '.page',
    '[data-slide]',
    '.reveal .slides > section',
    '.step',
    '[id^="slide"]',
    'section',
    'article',
  ];

  for (const selector of selectors) {
    try {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        const result = Array.from(elements);
        console.log(`Found ${result.length} slides with selector: ${selector}`);
        return result;
      }
    } catch (e) {
      console.log(`Selector failed: ${selector}`, e);
    }
  }

  console.log('No slides found with selectors, trying to find blocks with headings...');

  // Если не нашли по селекторам, ищем блоки с заголовками
  const candidates = doc.querySelectorAll('div, article, section');
  const blocks = Array.from(candidates).filter(el => {
    const hasHeading = el.querySelector('h1, h2, h3');
    const text = el.textContent || '';
    return hasHeading && text.length > 10;
  });

  console.log(`Found ${blocks.length} blocks with headings`);

  // Убираем вложенные блоки (оставляем только верхнеуровневые)
  const topLevel: Element[] = [];
  for (const block of blocks) {
    const parent = block.parentElement;
    // Если родитель - body или у родителя нет заголовков, это верхнеуровневый блок
    if (!parent || parent === doc.body || !parent.querySelector('h1, h2, h3')) {
      topLevel.push(block);
    }
  }

  console.log(`Found ${topLevel.length} top-level blocks`);

  // Если нашли верхнеуровневые блоки, используем их
  if (topLevel.length > 0) {
    return topLevel.slice(0, 50);
  }

  // В крайнем случае, используем все блоки с заголовками
  console.log(`Using all ${blocks.length} blocks with headings`);
  return blocks.slice(0, 50);
};

const createFallbackPresentation = (title: string): Presentation => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
  title,
  company: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slides: [{
    id: 'fallback-1',
    title: title,
    htmlContent: '<div style="padding: 40px; text-align: center;"><h1>Не удалось импортировать HTML</h1></div>',
  }],
});

// Экспорт презентации в PDF
export const exportToPDF = async (presentation: Presentation): Promise<void> => {
  // Создаём iframe для рендеринга
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1280px;height:720px;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  try {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1280, 720],
    });

    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];

      // Рендерим HTML слайда
      iframeDoc.open();
      iframeDoc.write(slide.htmlContent);
      iframeDoc.close();

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(iframeDoc.body, {
        width: 1280,
        height: 720,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      if (i > 0) pdf.addPage([1280, 720], 'landscape');
      pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
    }

    pdf.save(`${presentation.title || 'presentation'}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
};

// Экспорт презентации в PowerPoint
export const exportToPPTX = async (presentation: Presentation): Promise<void> => {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1280px;height:720px;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  try {
    const PptxGenJS = (await import('pptxgenjs')).default;
    const pptx = new PptxGenJS();

    pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 });
    pptx.layout = 'CUSTOM';

    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];
      const pptxSlide = pptx.addSlide();

      // Рендерим HTML слайда
      iframeDoc.open();
      iframeDoc.write(slide.htmlContent);
      iframeDoc.close();

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(iframeDoc.body, {
        width: 1280,
        height: 720,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      pptxSlide.addImage({
        data: imgData,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }

    await pptx.writeFile({ fileName: `${presentation.title || 'presentation'}.pptx` });
  } finally {
    document.body.removeChild(iframe);
  }
};
