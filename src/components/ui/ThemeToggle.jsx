import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/slices/uiSlice';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      type="button"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center h-8 rounded-full w-14 p-1 transition-colors duration-300 focus:outline-none border shadow-inner ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-200 border-slate-300'
      } ${className}`}
    >
      <span
        className={`inline-block w-6 h-6 rounded-full transform transition-transform duration-300 flex items-center justify-center shadow-md ${
          isDark
            ? 'translate-x-6 bg-indigo-600 text-amber-300'
            : 'translate-x-0 bg-white text-amber-500'
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
};

export default ThemeToggle;
