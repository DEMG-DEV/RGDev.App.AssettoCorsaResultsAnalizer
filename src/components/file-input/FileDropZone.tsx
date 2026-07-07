import React, { useRef, useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useSessionStore } from '../../stores/session-store';
import { loadFiles } from '../../services/file-loader';
import { es } from '../../i18n/es';

export const FileDropZone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addResults, setLoading, setLoadingProgress } = useSessionStore();

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const results = await loadFiles(files, (current, total) => {
        setLoadingProgress(current, total);
      });
      addResults(results);
    } finally {
      setLoading(false);
    }
  }, [addResults, setLoading, setLoadingProgress]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    handleFiles(files);
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div className="animate-in">
      {/* Drop zone — always available for manual loading */}
      <div
        className={`drop-zone ${isDragOver ? 'active' : ''}`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        style={{ padding: 'var(--space-xl)' }}
      >
        <div className="icon">🏎️</div>
        <h3>{isDragOver ? es.home.dropZoneActive : es.home.dropZone}</h3>
        <p className="hint">.json, .zip — archivos de Content Manager o servidor AC</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.zip"
          multiple
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)', justifyContent: 'center' }}>
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} />
          {es.home.selectFiles}
        </button>
      </div>
    </div>
  );
};
