import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginSuperAdmin = createAsyncThunk(
  'auth/loginSuperAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/master/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'SUPER_ADMIN');
      return user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginSchoolUser = createAsyncThunk(
  'auth/loginSchoolUser',
  async ({ schoolCode, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/school/auth/login', { schoolCode, email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'SCHOOL_USER');
      localStorage.setItem('schoolCode', schoolCode);
      return user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token) return null;

    try {
      if (userType === 'SUPER_ADMIN') {
        const res = await api.get('/master/auth/me');
        return res.data;
      } else {
        const res = await api.get('/school/auth/me');
        return res.data;
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('schoolCode');
      localStorage.removeItem('targetSchoolCode');
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  loading: true,
  error: null,
  targetSchoolCode: localStorage.getItem('targetSchoolCode') || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTargetSchoolCode: (state, action) => {
      state.targetSchoolCode = action.payload;
      if (action.payload) {
        localStorage.setItem('targetSchoolCode', action.payload);
      } else {
        localStorage.removeItem('targetSchoolCode');
      }
    },
    logout: (state) => {
      state.user = null;
      state.targetSchoolCode = '';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('schoolCode');
      localStorage.removeItem('targetSchoolCode');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginSchoolUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSchoolUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginSchoolUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  },
});

export const { setTargetSchoolCode, logout } = authSlice.actions;
export default authSlice.reducer;
