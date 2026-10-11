import React from 'react';
import { Presentation } from '../types';
import { generateShareLink } from '../utils/storage';
import { X, Copy, Check, ExternalLink, Mail, MessageCircle } from 'lucide-react';

interface Props {
  presentation: Presentation;
  onClose: () => void;
}

const ShareModal: React.FC<Props> = ({ presentation, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const shareLink = generateShareLink(presentation);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareLink;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Презентация: ${presentation.title}`);
    const body = encodeURIComponent(`Здравствуйте!\n\nНаправляю вам презентацию "${presentation.title}" от компании ${presentation.company}.\n\nПосмотреть: ${shareLink}\n\nС уважением`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(presentation.title)}`);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Презентация "${presentation.title}" от ${presentation.company}\n\n${shareLink}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: presentation.title,
          text: `Презентация "${presentation.title}" от ${presentation.company}`,
          url: shareLink,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const modalContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Поделиться презентацией</h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition touch-target flex items-center justify-center">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Native share button (mobile) */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition touch-target flex items-center justify-center gap-2 text-base"
          >
            <ExternalLink size={18} />
            Поделиться через...
          </button>
        )}

        {/* Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка для клиента</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-600 outline-none min-w-0"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 touch-target flex-shrink-0 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        </div>

        {/* Quick share */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Быстрая отправка</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handleEmail}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm font-medium touch-target"
            >
              <Mail size={16} />
              <span className="hidden sm:inline">Email</span>
              <span className="sm:hidden">📧</span>
            </button>
            <button
              onClick={handleTelegram}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm font-medium touch-target"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Telegram</span>
              <span className="sm:hidden">✈️</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm font-medium touch-target"
            >
              <span className="text-base">💬</span>
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </button>
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm font-medium touch-target"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Открыть</span>
              <span className="sm:hidden">🔗</span>
            </a>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-3 sm:p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">💡 Как это работает</p>
          <p className="opacity-80 text-xs sm:text-sm leading-relaxed">
            Ссылка содержит все данные презентации. Клиент сможет просмотреть её без установки.
            Данные хранятся прямо в ссылке — сервер не требуется.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 safe-bottom">
        <button onClick={onClose} className="w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition touch-target">
          Готово
        </button>
      </div>
    </>
  );

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto bottom-sheet" onClick={e => e.stopPropagation()}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          {modalContent}
        </div>
      </div>
    );
  }

  // Desktop: centered modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {modalContent}
      </div>
    </div>
  );
};

export default ShareModal;
