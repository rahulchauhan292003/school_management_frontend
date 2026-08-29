import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
}) => {
  const colorStyles = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
  };

  return (
    <Card className="flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl border ${colorStyles[color] || colorStyles.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </Card>
  );
};

export default Card;
