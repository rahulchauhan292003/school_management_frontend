import React, { useState, useEffect } from 'react';
import SchoolAdminLogin from './SchoolAdminLogin';
import SuperAdminLogin from './SuperAdminLogin';

const Login = () => {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (hash === '#superadmin' || path.includes('/superadmin')) {
      return 'SUPER_ADMIN';
    }
    return 'SCHOOL_USER';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#superadmin' || path.includes('/superadmin')) {
        setCurrentRoute('SUPER_ADMIN');
      } else {
        setCurrentRoute('SCHOOL_USER');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentRoute === 'SUPER_ADMIN') {
    return (
      <SuperAdminLogin 
        onSwitchToSchoolAdmin={() => {
          window.location.hash = '#school';
          setCurrentRoute('SCHOOL_USER');
        }} 
      />
    );
  }

  return (
    <SchoolAdminLogin 
      onSwitchToSuperAdmin={() => {
        window.location.hash = '#superadmin';
        setCurrentRoute('SUPER_ADMIN');
      }} 
    />
  );
};

export default Login;
