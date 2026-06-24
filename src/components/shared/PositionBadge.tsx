import React from 'react';

interface Props {
  position: number;
  size?: number;
}

export const PositionBadge: React.FC<Props> = ({ position, size = 32 }) => {
  let className = 'position-badge other';
  if (position === 1) className = 'position-badge p1';
  else if (position === 2) className = 'position-badge p2';
  else if (position === 3) className = 'position-badge p3';

  return (
    <div className={className} style={{ width: size, height: size, fontSize: size * 0.28 }}>
      {position}
    </div>
  );
};
