import React, { useRef, useState } from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onUploadFile: (file: File) => Promise<void>;
  onDownloadDemo: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  lang,
  onUploadFile,
  onDownloadDemo,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setError(null);
    if (file.size > 4 * 1024 * 1024) {
      setError('File exceeds maximum size of 4 MB.');
      return;
    }
    const valid = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!valid.includes(file.type)) {
      setError('Invalid file type. Please choose a PDF, PNG or JPG file.');
      return;
    }

    setIsUploading(true);
    try {
      await onUploadFile(file);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content upload-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{t.modalUploadTitle}</h4>
          <button className="btn-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div
          className="dropzone-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleProcessFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,image/png,image/jpeg,image/jpg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          <div className="dropzone-icon">📄</div>
          <strong>{t.dropzoneText}</strong>
          <p className="dropzone-hint">{t.fileLimits}</p>
          <span className="badge-synthetic">{t.syntheticNotice}</span>

          {isUploading && <p className="loading-text">⏳ {t.uploadingFile}</p>}
          {error && <p className="upload-error-text">⚠️ {error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onDownloadDemo}>
            {t.downloadDemo}
          </button>
          <button className="btn-text" onClick={onClose}>
            {t.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
};
