import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: string;
}

export const ProgressBar = ({ progress, label, color = 'var(--color-primary)' }: ProgressBarProps) => {
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
        <span>{label}</span>
        <span>{progress}%</span>
      </div>}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(Math.max(progress, 0), 100)}%`, backgroundColor: color, borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease-out' }} />
      </div>
    </div>
  );
};
