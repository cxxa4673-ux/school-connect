import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Play, Pause, Volume2, Maximize2 } from 'lucide-react';
import { ChatAttachment } from '../../types';

interface MediaLightboxModalProps {
  attachment: ChatAttachment;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({ attachment, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between py-3 px-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-3 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            {attachment.type === 'video' ? '🎥 Video Player' : '📷 Image Viewer'}
          </span>
          <span className="text-sm font-semibold truncate max-w-md">{attachment.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {attachment.type === 'image' && (
            <>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="w-full max-w-4xl flex-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-center p-4 overflow-hidden relative">
        {attachment.type === 'image' && (
          <img
            src={attachment.previewUrl || attachment.mediaUrl}
            alt={attachment.title}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-h-[70vh] max-w-full object-contain rounded-xl transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        )}

        {attachment.type === 'video' && (
          <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl flex flex-col items-center justify-center group">
            <img
              src={attachment.previewUrl || 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80'}
              alt={attachment.title}
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Play/Pause Center Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl transition transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-slate-950/80 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="font-mono text-indigo-400 font-bold">{isPlaying ? '00:45' : '00:00'}</span>
                <span className="text-slate-400">/</span>
                <span className="font-mono text-slate-400">{attachment.duration || '02:45'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                  HD 1080p
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Caption footer */}
      {attachment.content && (
        <div className="w-full max-w-4xl mt-2 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 text-center">
          {attachment.content}
        </div>
      )}
    </div>
  );
};
