import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { UtensilsCrossed, Crown } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Memproses login...');
  const { user, userProfile, loading } = useAuth();

  // Firebase doesn't need auth callback handling, just redirect based on auth state

  useEffect(() => {
    console.log(`cek user: ${user}`)
    if (!loading) {
      if (user && userProfile) {
        setMessage('Login berhasil! Mengarahkan...');
        const timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
        return () => clearTimeout(timer);
      } else if (!loading && !user) {
        setMessage('Sesi tidak ditemukan. Mengarahkan ke login...');
        const timer = setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, userProfile, loading, navigate]);

  const styles = {
    container: {
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    },
    background: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa, #fecaca)',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(251, 146, 60, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
        linear-gradient(45deg, transparent 49%, rgba(251, 191, 36, 0.05) 50%, transparent 51%)
      `
    },
    decorativeCrown: {
      position: 'absolute',
      top: '40px',
      left: '40px',
      color: '#fcd34d',
      opacity: 0.2
    },
    decorativeUtensils: {
      position: 'absolute',
      bottom: '80px',
      right: '64px',
      color: '#fb923c',
      opacity: 0.2
    },
    mainContent: {
      position: 'relative',
      zIndex: 10,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      width: '100%',
      boxSizing: 'border-box'
    },
    card: {
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(254,243,199,0.95) 100%)',
      backdropFilter: 'blur(8px)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '32px',
      border: '1px solid #fed7aa',
      textAlign: 'center',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      boxSizing: 'border-box'
    },
    logoWrapper: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: '24px'
    },
    logoCircle: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(to bottom right, #fbbf24, #f97316)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    },
    crownBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '32px',
      height: '32px',
      background: 'linear-gradient(to bottom right, #facc15, #fbbf24)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    brandTitle: {
      fontSize: '30px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #b45309, #ea580c, #dc2626)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '16px'
    },
    spinnerContainer: {
      marginBottom: '24px'
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
    message: {
      color: '#92400e',
      fontWeight: '500',
      fontSize: '18px',
      marginBottom: '8px'
    },
    subMessage: {
      color: '#ea580c',
      fontSize: '14px'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '24px'
    },
    dividerDots: {
      display: 'flex',
      gap: '4px'
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      animation: 'pulse 1.5s ease-in-out infinite'
    },
    dot1: {
      backgroundColor: '#fcd34d',
      animationDelay: '0s'
    },
    dot2: {
      backgroundColor: '#fb923c',
      animationDelay: '0.2s'
    },
    dot3: {
      backgroundColor: '#f87171',
      animationDelay: '0.4s'
    }
  };

  const keyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0.3; transform: scale(0.8); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Background with Middle Eastern pattern */}
        <div style={styles.background} />

        {/* Decorative elements */}
        <div style={styles.decorativeCrown}>
          <Crown size={64} />
        </div>
        <div style={styles.decorativeUtensils}>
          <UtensilsCrossed size={48} />
        </div>

        {/* Main content */}
        <div style={styles.mainContent}>
          <div style={styles.card}>
            {/* Logo */}
            <div style={styles.logoWrapper}>
              <div style={styles.logoCircle}>
                <UtensilsCrossed size={40} color="white" />
              </div>
              <div style={styles.crownBadge}>
                <Crown size={16} color="white" />
              </div>
            </div>

            <h1 style={styles.brandTitle}>
              Kebab AL Bewok
            </h1>

            {/* Loading spinner */}
            <div style={styles.spinnerContainer}>
              <div style={styles.spinner} />
            </div>

            {/* Message */}
            <p style={styles.message}>{message}</p>
            <p style={styles.subMessage}>Mohon tunggu sebentar...</p>

            {/* Decorative divider */}
            <div style={styles.divider}>
              <div style={styles.dividerDots}>
                <div style={{ ...styles.dot, ...styles.dot1 }} />
                <div style={{ ...styles.dot, ...styles.dot2 }} />
                <div style={{ ...styles.dot, ...styles.dot3 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthCallback;