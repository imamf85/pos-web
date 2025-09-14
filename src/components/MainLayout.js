import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import Header from './Header';
import Navigation from './Navigation';
import { kebabTheme } from '../styles/kebabTheme';
import useResponsive from '../hooks/useResponsive';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const { isMobile } = useResponsive();
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
    header: {
      position: isMobile ? 'relative' : 'sticky', // Non-sticky on mobile
      top: 0,
      zIndex: 1000
    },
    content: {
      flex: 1,
      padding: kebabTheme.spacing.xl,
      overflow: 'auto',
      paddingBottom: '100px' // Add space for sticky footer on desktop only
    },
    navigation: {
      position: isMobile ? 'relative' : 'sticky', // Non-sticky on mobile
      bottom: 0,
      zIndex: 1000
    }
  };

  return (
    <div style={layoutStyles.container}>
      <div style={layoutStyles.header}>
        <Header user={userProfile} />
      </div>
      
      <div style={layoutStyles.content}>
        <Outlet />
      </div>
      
      <div style={layoutStyles.navigation}>
        <Navigation
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          userRole={userProfile?.role}
        />
      </div>
    </div>
  );
};

export default MainLayout;