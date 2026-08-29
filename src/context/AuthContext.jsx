import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTargetSchoolCode as setReduxTargetSchoolCode, logout as reduxLogout } from '../store/slices/authSlice';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetSchoolCode, setTargetSchoolCodeState] = useState(
    localStorage.getItem('targetSchoolCode') || ''
  );

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');

      if (token) {
        try {
          if (storedUserType === 'SUPER_ADMIN') {
            const res = await api.get('/master/auth/me');
            setUser(res.data);
          } else {
            const res = await api.get('/school/auth/me');
            setUser(res.data);
          }
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginSuperAdmin = async (email, password) => {
    const res = await api.post('/master/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'SUPER_ADMIN');
    setUser(user);
    return user;
  };

  const loginSchoolUser = async (schoolCode, email, password) => {
    const res = await api.post('/school/auth/login', { schoolCode, email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'SCHOOL_USER');
    localStorage.setItem('schoolCode', schoolCode);
    setUser(user);
    return user;
  };

  const setTargetSchool = (code) => {
    if (!code) {
      localStorage.removeItem('targetSchoolCode');
      setTargetSchoolCodeState('');
      dispatch(setReduxTargetSchoolCode(''));
    } else {
      localStorage.setItem('targetSchoolCode', code);
      setTargetSchoolCodeState(code);
      dispatch(setReduxTargetSchoolCode(code));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('schoolCode');
    localStorage.removeItem('targetSchoolCode');
    setUser(null);
    setTargetSchoolCodeState('');
    dispatch(reduxLogout());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        targetSchoolCode,
        loginSuperAdmin,
        loginSchoolUser,
        setTargetSchool,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
