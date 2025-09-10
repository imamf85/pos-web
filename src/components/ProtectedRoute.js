import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userProfile, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute:', {
    hasUser: !!user,
    hasProfile: !!userProfile,
    loading,
    userEmail: user?.email,
    userRole: userProfile?.role,
    requiredRole
  });

  const styles = {
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa, #fecaca)'
    },
    loadingContent: {
      textAlign: 'center'
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      border: '4px solid #fed7aa',
      borderTopColor: '#f97316',
      margin: '0 auto'
    },
    loadingText: {
      marginTop: '24px',
      color: '#92400e',
      fontWeight: '500',
      fontSize: '18px'
    },
    brandText: {
      color: '#ea580c',
      fontSize: '14px',
      marginTop: '4px'
    },
    accessDeniedContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #fef2f2, #fed7aa)'
    },
    accessDeniedCard: {
      textAlign: 'center',
      background: 'rgba(255,255,255,0.9)',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid #fecaca'
    },
    iconCircle: {
      width: '64px',
      height: '64px',
      backgroundColor: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      fontSize: '32px'
    },
    deniedTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#dc2626',
      marginBottom: '16px'
    },
    deniedMessage: {
      color: '#6b7280'
    },
    roleInfo: {
      fontSize: '14px',
      color: '#ea580c',
      marginTop: '8px'
    }
  };

  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{spinKeyframes}</style>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Memuat...</p>
            <p style={styles.brandText}>Kebab AL Bewok</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard}>
          <div style={styles.iconCircle}>
            <span>🚫</span>
          </div>
          <h2 style={styles.deniedTitle}>Akses Ditolak</h2>
          <p style={styles.deniedMessage}>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <p style={styles.roleInfo}>Role Anda: {userProfile?.role || 'Tidak diketahui'}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;