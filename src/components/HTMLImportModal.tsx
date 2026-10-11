import React from 'react';
import { Presentation } from '../types';
import { importHTMLPresentation } from '../utils/htmlParser';
import { Upload, X, Check, AlertCircle, FileText, Code } from 'lucide-react';

interface Props {
  onImport: (presentation: Presentation) => void;
  onClose: () => void;
}

const HTMLImportModal: React.FC<Props> = ({ onImport, onClose }) => {
  const [htmlContent, setHtmlContent] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [error, setError] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [previewReady, setPreviewReady] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setPreviewReady(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
      setPreviewReady(true);
    };
    reader.onerror = () => {
      setError('Ошибка чтения файла');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!htmlContent) {
      setError('Загрузите HTML-файл');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const presentation = await importHTMLPresentation(htmlContent, fileName.replace('.html', ''));
      onImport(presentation);
      onClose();
    } catch (err) {
      setError('Ошибка анализа HTML. Убедитесь, что файл корректен.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Импорт HTML-презентации</h3>
              <p className="text-xs text-gray-500">Сохранение 100% оригинальной вёрстки</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Upload area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Загрузите HTML-файл презентации
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="html-upload"
                />
                <label htmlFor="html-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    {fileName || 'Нажмите для выбора файла'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Поддерживаются файлы .html и .htm
                  </p>
                </label>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Preview */}
            {previewReady && htmlContent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Code size={16} />
                  Предпросмотр
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <iframe
                    srcDoc={htmlContent}
                    className="w-full border-0 bg-white"
                    style={{ height: '400px' }}
                    sandbox="allow-scripts allow-same-origin"
                    title="Preview"
                  />
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-medium mb-2 flex items-center gap-2">
                <FileText size={16} />
                Что будет сохранено:
              </p>
              <ul className="space-y-1 text-xs opacity-80">
                <li>✅ Вся оригинальная вёрстка и стили</li>
                <li>✅ Шрифты, цвета, размеры</li>
                <li>✅ Позиционирование и layout</li>
                <li>✅ Изображения и медиа</li>
                <li>✅ 100% оригинальный вид</li>
              </ul>
              <p className="text-xs mt-3 opacity-70">
                💡 После импорта вы сможете редактировать каждый слайд через визуальный редактор или HTML-код.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Отмена
          </button>
          <button
            onClick={handleImport}
            disabled={!htmlContent || isAnalyzing}
            className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Импортирую...
              </>
            ) : (
              <>
                <Check size={18} />
                Импортировать
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HTMLImportModal;
