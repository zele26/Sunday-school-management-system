'use client';

import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, Check, RefreshCw, User, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiClient';

export const PhotoUploadField = ({
  value = '',
  onChange,
  label = 'ፎቶ ይጫኑ',
  helperText = 'የቅርብ ጊዜ ፎቶ (PNG, JPG, WebP — እስከ 5MB)',
  aspectRatio = 'square', // 'square', 'circle', 'card'
  placeholderIcon = 'user', // 'user', 'contact'
  className = '',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Sync internal preview when external value changes
  React.useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleFileProcess = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('እባክዎ ትክክለኛ የምስል ፋይል (JPG, PNG, WebP) ይምረጡ');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('የምስሉ መጠን ከ 8MB መብለጥ የለበትም');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    // 1. Generate instant local data URL for instantaneous UI feedback
    const reader = new FileReader();
    reader.onload = async (e) => {
      const localDataUri = e.target?.result;
      setPreviewUrl(localDataUri);

      // 2. Try upload to server
      try {
        const formData = new FormData();
        formData.append('file', file);

        const baseUrl = API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/upload/photo`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const serverUrl = data.url || localDataUri;
          setPreviewUrl(serverUrl);
          if (onChange) onChange(serverUrl);
        } else {
          // Fallback to data URI if server upload responds non-200
          if (onChange) onChange(localDataUri);
        }
      } catch (err) {
        console.warn('Upload network fallback to local data URI:', err);
        if (onChange) onChange(localDataUri);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError('ምስሉን ማንበብ አልተቻለም');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onChange) onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && fileInputRef.current) fileInputRef.current.click();
        }}
        className={`group relative flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
          isDragOver
            ? 'border-[#1657b8] bg-blue-50/80 dark:bg-blue-950/40 scale-[1.01]'
            : previewUrl
            ? 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-[#1657b8]'
            : 'border-slate-200 dark:border-slate-700 hover:border-[#1657b8]/60 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        {/* Avatar / Preview Thumbnail */}
        <div className="relative shrink-0">
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden flex items-center justify-center border transition-all ${
              previewUrl
                ? 'border-white dark:border-slate-800 shadow-md bg-white dark:bg-slate-900'
                : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 text-slate-400'
            }`}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Selected"
                className="w-full h-full object-cover"
              />
            ) : placeholderIcon === 'user' ? (
              <User className="w-8 h-8 text-[#1657b8] dark:text-blue-400 opacity-80" />
            ) : (
              <ImageIcon className="w-8 h-8 text-amber-500 opacity-80" />
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Mini Status Badge */}
          {previewUrl && !isUploading && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Text and Actions */}
        <div className="flex-1 min-w-0">
          {previewUrl ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  ✓ ፎቶ ተመርጧል
                </span>
                {isUploading && (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                    በመጫን ላይ...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                ለመቀየር እዚህ ይጫኑ ወይም አዲስ ምስል ይጎትቱ
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#1657b8] dark:text-blue-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#1657b8] transition-colors">
                  ፎቶ ለመምረጥ እዚህ ይጫኑ
                </span>
              </div>
              {helperText && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Remove Button if image selected */}
        {previewUrl && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-2xs cursor-pointer"
            title="ፎቶ አስወግድ"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {uploadError && (
        <p className="text-xs font-semibold text-rose-500 ml-1 animate-in fade-in">
          ⚠️ {uploadError}
        </p>
      )}
    </div>
  );
};

export default PhotoUploadField;
