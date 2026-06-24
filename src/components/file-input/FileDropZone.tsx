import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSessionStore } from '../../stores/session-store';
import { loadFiles } from '../../services/file-loader';
import { checkLocalStatus, type LocalStatus } from '../../services/auto-setup';
import { es } from '../../i18n/es';

export const FileDropZone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localStatus, setLocalStatus] = useState<LocalStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addResults, setLoading, setLoadingProgress } = useSessionStore();

  // Check local status on mount
  useEffect(() => {
    checkLocalStatus().then(setLocalStatus);
  }, []);

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
      {/* Auto-detection status */}
      {localStatus && (
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          {/* CM Status */}
          <div className="card" style={{
            flex: 1,
            minWidth: 280,
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            borderColor: localStatus.cmFound ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)',
          }}>
            {localStatus.cmFound
              ? <CheckCircle size={22} style={{ color: 'var(--color-finished)', flexShrink: 0 }} />
              : <AlertTriangle size={22} style={{ color: '#FF9800', flexShrink: 0 }} />
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {localStatus.cmFound ? '✅ Content Manager detectado' : '⚠️ Content Manager no encontrado'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {localStatus.cmFound
                  ? localStatus.cmPath
                  : 'Selecciona archivos manualmente abajo'}
              </div>
            </div>
          </div>

          {/* AC Status */}
          <div className="card" style={{
            flex: 1,
            minWidth: 280,
            padding: 'var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            borderColor: localStatus.acFound ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)',
          }}>
            {localStatus.acFound
              ? <CheckCircle size={22} style={{ color: 'var(--color-finished)', flexShrink: 0 }} />
              : <AlertTriangle size={22} style={{ color: '#FF9800', flexShrink: 0 }} />
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {localStatus.acFound ? '✅ Assetto Corsa detectado' : '⚠️ Assetto Corsa no encontrado'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {localStatus.acFound
                  ? `${localStatus.acPath} (imágenes habilitadas)`
                  : 'Las imágenes de autos no se mostrarán'}
              </div>
            </div>
          </div>
        </div>
      )}

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
        <p className="hint">.json, .zip — también puedes agregar archivos adicionales</p>

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
