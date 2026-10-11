import React from 'react';
import { Slide } from '../types';
import { Trash2, GripVertical, Copy, ChevronUp, ChevronDown, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon, Palette } from 'lucide-react';

interface Props {
  slide: Slide;
  index: number;
  total: number;
  onUpdate: (slide: Slide) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const SlideEditor: React.FC<Props> = ({ slide, index, total, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = React.useState(false);
  const editableRef = React.useRef<HTMLDivElement>(null);

  const update = (changes: Partial<Slide>) => {
    onUpdate({ ...slide, ...changes });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editableRef.current) {
      update({ htmlContent: editableRef.current.innerHTML });
    }
  };

  const handleContentChange = () => {
    if (editableRef.current) {
      update({ htmlContent: editableRef.current.innerHTML });
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    update({ htmlContent: e.target.value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <GripVertical size={16} className="text-gray-400 hidden sm:block" />
        <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
        <input
          type="text"
          value={slide.title}
          onChange={(e) => update({ title: e.target.value })}
          className="text-sm font-medium bg-transparent border-none text-gray-700 flex-1 outline-none"
          placeholder="Название слайда"
        />
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30">
            <ChevronDown size={14} />
          </button>
          <button onClick={onDuplicate} className="p-2 rounded hover:bg-gray-200" title="Дублировать">
            <Copy size={14} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded transition ${showDeleteConfirm ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-red-400'}`}
          >
            <Trash2 size={14} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded hover:bg-gray-200">
            <span className={`text-xs transition-transform inline-block ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Toolbar */}
          <div className="flex gap-1 flex-wrap border border-gray-200 rounded-lg p-2 bg-gray-50">
            <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Жирный">
              <Bold size={16} />
            </button>
            <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Курсив">
              <Italic size={16} />
            </button>
            <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Подчёркнутый">
              <Underline size={16} />
            </button>
            <div className="w-px bg-gray-300 mx-1" />
            <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded" title="По левому краю">
              <AlignLeft size={16} />
            </button>
            <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded" title="По центру">
              <AlignCenter size={16} />
            </button>
            <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded" title="По правому краю">
              <AlignRight size={16} />
            </button>
            <div className="w-px bg-gray-300 mx-1" />
            <button onClick={() => {
              const color = prompt('Введите цвет (например, #ff0000 или red):');
              if (color) execCommand('foreColor', color);
            }} className="p-2 hover:bg-gray-200 rounded" title="Цвет текста">
              <Palette size={16} />
            </button>
            <select
              onChange={(e) => {
                if (e.target.value) execCommand('fontSize', e.target.value);
                e.target.value = '';
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              defaultValue=""
            >
              <option value="" disabled>Размер</option>
              <option value="1">Мелкий</option>
              <option value="3">Обычный</option>
              <option value="5">Большой</option>
              <option value="7">Огромный</option>
            </select>
            <select
              onChange={(e) => {
                if (e.target.value) execCommand('formatBlock', e.target.value);
                e.target.value = '';
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              defaultValue=""
            >
              <option value="" disabled>Формат</option>
              <option value="h1">Заголовок 1</option>
              <option value="h2">Заголовок 2</option>
              <option value="h3">Заголовок 3</option>
              <option value="p">Параграф</option>
            </select>
            <button
              onClick={() => {
                const url = prompt('Введите URL изображения:');
                if (url) execCommand('insertImage', url);
              }}
              className="p-2 hover:bg-gray-200 rounded"
              title="Вставить изображение"
            >
              <ImageIcon size={16} />
            </button>
            <div className="w-px bg-gray-300 mx-1" />
            <button
              onClick={() => setShowHtmlEditor(!showHtmlEditor)}
              className={`px-3 py-1 rounded text-sm ${showHtmlEditor ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              HTML
            </button>
          </div>

          {/* Editable area */}
          {!showHtmlEditor ? (
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentChange}
              dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
              className="w-full min-h-[400px] border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
              style={{ aspectRatio: '16/9' }}
            />
          ) : (
            <textarea
              value={slide.htmlContent}
              onChange={handleHtmlChange}
              rows={20}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="HTML-код слайда"
            />
          )}

          <p className="text-xs text-gray-400">
            💡 Редактируйте контент прямо на слайде. Используйте панель инструментов для форматирования. Переключайтесь в режим HTML для точной настройки.
          </p>
        </div>
      )}
    </div>
  );
};

export default SlideEditor;
