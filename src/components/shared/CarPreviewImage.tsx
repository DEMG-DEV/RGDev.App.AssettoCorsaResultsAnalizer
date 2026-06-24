import React, { useState, useEffect } from 'react';
import { resolveCarPreview } from '../../services/car-asset-service';
import { humanizeCarId } from '../../core/utils/car-name-humanizer';

interface Props {
  carId: string;
  skinName?: string;
  /** Height in px — width auto-scales to 4:3 */
  size?: number;
  showPopover?: boolean;
}

export const CarPreviewImage: React.FC<Props> = ({ carId, skinName, size = 40, showPopover = true }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  const width = Math.round(size * 1.33); // 4:3 aspect ratio

  useEffect(() => {
    let cancelled = false;
    resolveCarPreview(carId, skinName).then(images => {
      if (!cancelled) setPreviewUrl(images.previewUrl);
    });
    return () => { cancelled = true; };
  }, [carId, skinName]);

  if (!previewUrl) {
    // Placeholder with initials
    const initials = humanizeCarId(carId).slice(0, 3);
    return (
      <div
        className="car-preview-placeholder"
        style={{
          width,
          height: size,
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-racing)',
          color: 'white',
          fontSize: size * 0.25,
          fontWeight: 700,
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
        title={humanizeCarId(carId)}
      >
        {initials}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <img
        src={previewUrl}
        alt={humanizeCarId(carId)}
        style={{
          width,
          height: size,
          borderRadius: 'var(--radius-sm)',
          objectFit: 'cover',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card-hover)',
          display: 'block',
        }}
        onMouseEnter={() => showPopover && setShowFull(true)}
        onMouseLeave={() => setShowFull(false)}
      />
      {showFull && (
        <div style={{
          position: 'absolute',
          bottom: size + 8,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
          boxShadow: 'var(--shadow-card)',
          backdropFilter: 'blur(12px)',
        }}>
          <img
            src={previewUrl}
            alt={humanizeCarId(carId)}
            style={{ width: 320, height: 240, borderRadius: 'var(--radius-md)', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
};
