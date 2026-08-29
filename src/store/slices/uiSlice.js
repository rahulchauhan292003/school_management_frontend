import { createSlice } from '@reduxjs/toolkit';

const applyThemeToDOM = (theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }
  }
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyThemeToDOM(theme);
  return theme;
};

const initialState = {
  theme: getInitialTheme(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      localStorage.setItem('theme', nextTheme);
      applyThemeToDOM(nextTheme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      applyThemeToDOM(action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
