import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import masterSchoolReducer from './slices/masterSchoolSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    masterSchool: masterSchoolReducer,
    ui: uiReducer,
  },
});

export default store;
