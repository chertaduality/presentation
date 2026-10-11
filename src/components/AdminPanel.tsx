import React from 'react';
import { Presentation, Slide } from '../types';
import { savePresentation, deletePresentation, getAllPresentations } from '../utils/storage';
import { createDefaultPresentation, createDefaultSlide } from '../utils/defaults';
import SlideEditor from './SlideEditor';
import ShareModal from './ShareModal';
import PresentationView from './PresentationView';
import HTMLImportModal from './HTMLImportModal';
import { Plus, Share2, Eye, FileText, Trash2, Download, Upload, Layout, HelpCircle, X, Terminal, Check, Code } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [presentations, setPresentations] = React.useState<Presentation[]>([]);
  const [activePresentation, setActivePresentation] = React.useState<Presentation | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'edit' | 'preview'>('list');
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showHTMLImport, setShowHTMLImport] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setPresentations(getAllPresentations());
  }, []);

  const handleCreate = () => {
    const newPres = createDefaultPresentation();
    savePresentation(newPres);
    setPresentations(getAllPresentations());
    setActivePresentation(newPres);
    setViewMode('edit');
  };

  const handleOpen = (pres: Presentation) => {
    setActivePresentation(pres);
    setViewMode('edit');
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить презентацию?')) {
      deletePresentation(id);
      setPresentations(getAllPresentations());
      if (activePresentation?.id === id) {
        setActivePresentation(null);
        setViewMode('list');
      }
    }
  };

  const handleSave = () => {
    if (activePresentation) {
      savePresentation(activePresentation);
      setPresentations(getAllPresentations());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    if (!activePresentation) return;
    const newSlides = activePresentation.slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    const updated = { ...activePresentation, slides: newSlides };
    setActivePresentation(updated);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!activePresentation) return;
    if (activePresentation.slides.length <= 1) return;
    const newSlides = activePresentation.slides.filter(s => s.id !== slideId);
    setActivePresentation({ ...activePresentation, slides: newSlides });
  };

  const handleDuplicateSlide = (slideId: string) => {
    if (!activePresentation) return;
    const slideIndex = activePresentation.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;
    const original = activePresentation.slides[slideIndex];
    const duplicate: Slide = { ...original, id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    const newSlides = [...activePresentation.slides];
    newSlides.splice(slideIndex + 1, 0, duplicate);
    setActivePresentation({ ...activePresentation, slides: newSlides });
  };

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    if (!activePresentation) return;
    const idx = activePresentation.slides.findIndex(s => s.id === slideId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= activePresentation.slides.length) return;
    const newSlides = [...activePresentation.slides];
    [newSlides[idx], newSlides[newIdx]] = [newSlides[newIdx], newSlides[idx]];
    setActivePresentation({ ...activePresentation, slides: newSlides });
  };

  const handleAddSlide = () => {
    if (!activePresentation) return;
    const newSlide = createDefaultSlide();
    setActivePresentation({ ...activePresentation, slides: [...activePresentation.slides, newSlide] });
  };

  const handleExport = () => {
    if (!activePresentation) return;
    const json = JSON.stringify(activePresentation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePresentation.title || 'presentation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as Presentation;
          data.id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          savePresentation(data);
          setPresentations(getAllPresentations());
          setActivePresentation(data);
          setViewMode('edit');
        } catch {
          alert('Ошибка импорта файла');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleHTMLImport = (presentation: Presentation) => {
    savePresentation(presentation);
    setPresentations(getAllPresentations());
    setActivePresentation(presentation);
    setViewMode('edit');
  };

  // Auto-save
  React.useEffect(() => {
    if (activePresentation && viewMode === 'edit') {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePresentation]);

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Layout size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">PresentaPro</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Конструктор презентаций</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button onClick={() => setShowHelpModal(true)} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center" title="Помощь">
                <HelpCircle size={18} className="text-gray-500" />
              </button>
              <button onClick={() => setShowHTMLImport(true)} className="px-2.5 sm:px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-50 transition touch-target flex items-center gap-1.5" title="Импорт HTML">
                <Code size={14} /> <span className="hidden sm:inline">HTML</span>
              </button>
              <button onClick={handleImport} className="px-2.5 sm:px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium hover:bg-gray-50 transition touch-target flex items-center gap-1.5" title="Импорт JSON">
                <Upload size={14} /> <span className="hidden sm:inline">JSON</span>
              </button>
              <button onClick={handleCreate} className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition touch-target flex items-center gap-1.5">
                <Plus size={14} /> <span className="hidden sm:inline">Новая</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {presentations.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Нет презентаций</h2>
              <p className="text-sm sm:text-base text-gray-500 mb-6 px-4">Создайте первую презентацию или импортируйте существующую</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
                <button onClick={handleCreate} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition touch-target">
                  Создать презентацию
                </button>
                <button onClick={() => setShowHTMLImport(true)} className="px-6 py-3 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition touch-target flex items-center justify-center gap-2">
                  <Code size={16} /> Импорт HTML
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {presentations.map(pres => (
                <div key={pres.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
                  <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-300">{pres.slides.length}</span>
                    <span className="text-xs sm:text-sm text-gray-400 ml-1">слайдов</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{pres.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{pres.company}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(pres.updatedAt).toLocaleDateString('ru-RU')}
                    </p>
                    <div className="flex gap-1.5 sm:gap-2 mt-3">
                      <button onClick={() => handleOpen(pres)} className="flex-1 py-2.5 rounded-lg bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium hover:bg-blue-100 transition touch-target flex items-center justify-center gap-1">
                        <FileText size={14} /> Редактировать
                      </button>
                      <button onClick={() => { setActivePresentation(pres); setViewMode('preview'); }} className="p-2.5 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center" title="Просмотр">
                        <Eye size={16} className="text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(pres.id)} className="p-2.5 rounded-lg hover:bg-red-50 transition touch-target flex items-center justify-center" title="Удалить">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* HTML Import Modal */}
        {showHTMLImport && (
          <HTMLImportModal
            onImport={handleHTMLImport}
            onClose={() => setShowHTMLImport(false)}
          />
        )}

        {/* Help Modal */}
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      </div>
    );
  }

  // PREVIEW VIEW
  if (viewMode === 'preview' && activePresentation) {
    return (
      <PresentationView
        presentation={activePresentation}
        onClose={() => setViewMode('edit')}
      />
    );
  }

  // EDIT VIEW
  if (!activePresentation) {
    setViewMode('list');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button onClick={() => { handleSave(); setViewMode('list'); }} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={activePresentation.title}
                  onChange={(e) => setActivePresentation({ ...activePresentation, title: e.target.value })}
                  className="text-sm sm:text-lg font-bold text-gray-900 bg-transparent border-none outline-none w-full truncate"
                  placeholder="Название"
                />
                <input
                  type="text"
                  value={activePresentation.company}
                  onChange={(e) => setActivePresentation({ ...activePresentation, company: e.target.value })}
                  className="text-xs text-gray-500 bg-transparent border-none outline-none w-full truncate"
                  placeholder="Компания"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {saved && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <Check size={12} /> <span className="hidden sm:inline">Сохранено</span>
                </span>
              )}
              <button onClick={handleExport} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target hidden sm:flex items-center justify-center" title="Экспорт">
                <Download size={18} className="text-gray-600" />
              </button>
              <button onClick={() => setViewMode('preview')} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center" title="Просмотр">
                <Eye size={18} className="text-gray-600" />
              </button>
              <button onClick={() => setShowShareModal(true)} className="px-2.5 sm:px-3 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition touch-target flex items-center gap-1">
                <Share2 size={14} /> <span className="hidden sm:inline">Поделиться</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-3 sm:space-y-4">
          {activePresentation.slides.map((slide, index) => (
            <SlideEditor
              key={slide.id}
              slide={slide}
              index={index}
              total={activePresentation.slides.length}
              onUpdate={handleUpdateSlide}
              onDelete={() => handleDeleteSlide(slide.id)}
              onDuplicate={() => handleDuplicateSlide(slide.id)}
              onMoveUp={() => handleMoveSlide(slide.id, 'up')}
              onMoveDown={() => handleMoveSlide(slide.id, 'down')}
            />
          ))}
        </div>

        {/* Add slide */}
        <div className="mt-4 sm:mt-6">
          <button
            onClick={handleAddSlide}
            className="w-full py-3 sm:py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition touch-target flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Добавить слайд
          </button>
        </div>
      </main>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-around sm:hidden z-30 safe-bottom">
        <button onClick={() => { handleSave(); setViewMode('list'); }} className="flex flex-col items-center gap-0.5 p-2 touch-target">
          <Layout size={20} className="text-gray-600" />
          <span className="text-[10px] text-gray-500">Список</span>
        </button>
        <button onClick={handleAddSlide} className="flex flex-col items-center gap-0.5 p-2 touch-target">
          <Plus size={20} className="text-blue-600" />
          <span className="text-[10px] text-blue-600">Добавить</span>
        </button>
        <button onClick={() => setViewMode('preview')} className="flex flex-col items-center gap-0.5 p-2 touch-target">
          <Eye size={20} className="text-gray-600" />
          <span className="text-[10px] text-gray-500">Просмотр</span>
        </button>
        <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center gap-0.5 p-2 touch-target">
          <Share2 size={20} className="text-gray-600" />
          <span className="text-[10px] text-gray-500">Поделиться</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          presentation={activePresentation}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* HTML Import Modal */}
      {showHTMLImport && (
        <HTMLImportModal
          onImport={handleHTMLImport}
          onClose={() => setShowHTMLImport(false)}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
};

// Help Modal Component
const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const content = (
    <>
      <div className="sticky top-0 bg-white flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 z-10">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle size={20} className="text-blue-600" />
          Как скачать и запустить
        </h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-sm">
        <div className="flex gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1">Установите Node.js</h4>
            <p className="text-gray-600 text-xs sm:text-sm mb-2">Версия <strong>18+</strong> с <a href="https://nodejs.org" target="_blank" className="text-blue-600 underline">nodejs.org</a></p>
            <div className="bg-gray-900 rounded-lg p-2.5 font-mono text-xs text-green-400 flex items-center gap-2">
              <Terminal size={12} className="flex-shrink-0" /> node --version
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1">Установите зависимости</h4>
            <div className="bg-gray-900 rounded-lg p-2.5 font-mono text-xs text-green-400 flex items-center gap-2">
              <Terminal size={12} className="flex-shrink-0" /> npm install
            </div>
            <p className="text-gray-500 text-xs mt-2">30-60 секунд</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1">Запустите!</h4>
            <div className="bg-gray-900 rounded-lg p-2.5 font-mono text-xs text-green-400 flex items-center gap-2">
              <Terminal size={12} className="flex-shrink-0" /> npm run dev
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              Откройте: <a href="http://localhost:3000" className="text-blue-600 underline font-medium">http://localhost:3000</a>
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 safe-bottom">
        <button onClick={onClose} className="w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition touch-target">
          Понятно
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto bottom-sheet" onClick={e => e.stopPropagation()}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
};

export default AdminPanel;
