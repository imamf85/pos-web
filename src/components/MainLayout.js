import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import Header from './Header';
import Navigation from './Navigation';
import { kebabTheme } from '../styles/kebabTheme';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState('pos');

  // Map route paths to page names
  const pathToPage = {
    '/pos': 'pos',
    '/orders': 'orders',
    '/summary': 'summary',
    '/products': 'products',
    '/staff': 'staff'
  };

  // Update currentPage when route changes
  useEffect(() => {
    const page = pathToPage[location.pathname];
    if (page) {
      setCurrentPage(page);
    }
  }, [location.pathname]);

  // Handle navigation from Navigation component
  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`/${page}`);
  };

  const layoutStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: kebabTheme.colors.gradientBackground
    },
    content: {
      flex: 1,
      padding: kebabTheme.spacing.xl,
      overflow: 'auto'
    }
  };

  return (
    <div style={layoutStyles.container}>
      <Header user={userProfile} />
      
      <div style={layoutStyles.content}>
        <Outlet />
      </div>
      
      <Navigation
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        userRole={userProfile?.role}
      />
    </div>
  );
};

export default MainLayout;