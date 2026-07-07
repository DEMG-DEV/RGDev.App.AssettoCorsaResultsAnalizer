import React, { useState, useEffect, useCallback } from 'react';
import { resolveCarPreview, searchWikipediaImage } from '../../services/car-asset-service';
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
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [imageError, setImageError] = useState(false);

  const width = Math.round(size * 1.33); // 4:3 aspect ratio

  useEffect(() => {
    let cancelled = false;
    setImageError(false);
    resolveCarPreview(carId, skinName).then(images => {
      if (!cancelled) {
        setPreviewUrl(images.previewUrl);
        setFallbackUrl(images.fallbackUrl ?? null);
      }
    });
    return () => { cancelled = true; };
  }, [carId, skinName]);

  // When the primary image fails, try fallback or Wikipedia search
  const handleImageError = useCallback(async () => {
    // If we have a fallback URL and haven't used it yet, try it
    if (fallbackUrl && !imageError) {
      setImageError(true);
      setPreviewUrl(fallbackUrl);
      setFallbackUrl(null);
      return;
    }

    // Last resort: search Wikipedia directly
    if (!imageError) {
      setImageError(true);
      const carName = humanizeCarId(carId);
      const wikiUrl = await searchWikipediaImage(carName);
      if (wikiUrl) {
        setPreviewUrl(wikiUrl);
        return;
      }
    }

    // All sources failed — show placeholder
    setPreviewUrl(null);
  }, [carId, fallbackUrl, imageError]);

  const displayUrl = previewUrl;

  if (!displayUrl) {
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
        src={displayUrl}
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
        onError={handleImageError}
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
            src={displayUrl}
            alt={humanizeCarId(carId)}
            style={{ width: 320, height: 240, borderRadius: 'var(--radius-md)', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
};
