'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  delay?: number;
}

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'primary',
  delay = 0,
}: MetricCardProps) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 border-primary/30',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/30',
    success: 'from-success/20 to-success/5 border-success/30',
    warning: 'from-warning/20 to-warning/5 border-warning/30',
  };

  const iconColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    warning: 'text-warning',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          {description && <p className="text-slate-400 text-sm">{description}</p>}
        </div>
        {Icon && (
          <div className={`${iconColorClasses[color]} opacity-80`}>
            <Icon size={32} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
