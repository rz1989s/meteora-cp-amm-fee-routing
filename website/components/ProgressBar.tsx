'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  showLabel = true,
  label,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-slate-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]} rounded-full`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
