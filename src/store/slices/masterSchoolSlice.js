import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMasterSchools = createAsyncThunk(
  'masterSchool/fetchMasterSchools',
  async (search = '', { rejectWithValue }) => {
    try {
      const res = await api.get(`/master/schools?search=${search}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMasterStats = createAsyncThunk(
  'masterSchool/fetchMasterStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/master/stats');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const provisionNewSchool = createAsyncThunk(
  'masterSchool/provisionNewSchool',
  async (schoolData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/master/schools', schoolData);
      dispatch(fetchMasterSchools(''));
      dispatch(fetchMasterStats());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSchoolStatus = createAsyncThunk(
  'masterSchool/updateSchoolStatus',
  async ({ schoolId, status }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/master/schools/${schoolId}/status`, { status });
      dispatch(fetchMasterSchools(''));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const masterSchoolSlice = createSlice({
  name: 'masterSchool',
  initialState: {
    schools: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterSchools.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMasterSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.schools = action.payload;
      })
      .addCase(fetchMasterSchools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMasterStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default masterSchoolSlice.reducer;
