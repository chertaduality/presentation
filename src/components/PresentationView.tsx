import React from 'react';
import { Presentation } from '../types';
import { ChevronLeft, ChevronRight, X, Download, Share2, Maximize2, FileText } from 'lucide-react';
import { exportToPDF, exportToPPTX } from '../utils/htmlParser';

interface Props {
  presentation: Presentation;
  onClose?: () => void;
  isShared?: boolean;
}

const PresentationView: React.FC<Props> = ({ presentation, onClose, isShared }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const goNext = () => setCurrentSlide(s => Math.min(s + 1, presentation.slides.length - 1));
  const goPrev = () => setCurrentSlide(s => Math.max(s - 1, 0));

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleExport = () => {
    const json = JSON.stringify(presentation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title || 'presentation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(presentation);
    } catch (e) {
      alert('Ошибка экспорта в PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
      await exportToPPTX(presentation);
    } catch (e) {
      alert('Ошибка экспорта в PowerPoint');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: presentation.title,
          text: `Презентация "${presentation.title}" от ${presentation.company}`,
          url: window.location.href,
        });
      } catch {}
    }
  };

  if (isFullscreen) {
    const slide = presentation.slides[currentSlide];
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-full h-full relative">
          <iframe
            srcDoc={slide.htmlContent}
            className="w-full h-full border-0"
            title={`Slide ${currentSlide + 1}`}
          />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent safe-top">
            <button onClick={() => setIsFullscreen(false)} className="p-2.5 rounded-full bg-black/40 text-white touch-target flex items-center justify-center">
              <X size={20} />
            </button>
            <span className="text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">
              {currentSlide + 1} / {presentation.slides.length}
            </span>
          </div>
          <button onClick={goPrev} disabled={currentSlide === 0} className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-20 transition touch-target items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          <button onClick={goNext} disabled={currentSlide === presentation.slides.length - 1} className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-20 transition touch-target items-center justify-center">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 safe-top">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {onClose && (
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center flex-shrink-0">
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg truncate text-gray-900">{presentation.title}</h1>
              <p className="text-xs truncate text-gray-500">{presentation.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {isShared && (
              <span className="hidden sm:inline px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                🔗 Общий доступ
              </span>
            )}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button onClick={handleNativeShare} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center" title="Поделиться">
                <Share2 size={18} className="text-gray-600" />
              </button>
            )}
            <button onClick={handleExportPDF} disabled={isExporting} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target hidden sm:flex items-center justify-center disabled:opacity-50" title="Экспорт в PDF">
              <FileText size={18} className="text-gray-600" />
            </button>
            <button onClick={handleExportPPTX} disabled={isExporting} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target hidden sm:flex items-center justify-center disabled:opacity-50" title="Экспорт в PowerPoint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </button>
            <button onClick={handleExport} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target hidden sm:flex items-center justify-center" title="Экспорт JSON">
              <Download size={18} className="text-gray-600" />
            </button>
            <button onClick={() => setIsFullscreen(true)} className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition touch-target flex items-center gap-1.5">
              <Maximize2 size={16} className="hidden sm:inline" />
              <span className="hidden sm:inline">▶ Презентация</span>
              <span className="sm:hidden">▶</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {presentation.slides.map((slide, index) => (
            <div key={slide.id} className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 relative" style={{ height: '600px' }}>
              <iframe
                srcDoc={slide.htmlContent}
                className="absolute inset-0 w-full h-full border-0"
                title={`Slide ${index + 1}`}
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded z-10">
                {index + 1} / {presentation.slides.length}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-4 sm:py-6 text-xs sm:text-sm safe-bottom text-gray-400">
        Создано с PresentaPro • {presentation.slides.length} слайдов
      </footer>
    </div>
  );
};

export default PresentationView;
