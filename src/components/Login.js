import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { LogIn, UtensilsCrossed, Crown } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle, user, userProfile } = useAuth();
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (user && userProfile && !loading) {
      console.log('👤 User already logged in, redirecting to POS...');
      navigate('/', { replace: true });
    }
  }, [user, userProfile, loading, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // Firebase handles redirect automatically, just set loading to false
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box'
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
      opacity: 0.2,
      '@media (max-width: 768px)': {
        top: '20px',
        left: '20px'
      }
    },
    decorativeUtensils: {
      position: 'absolute',
      bottom: '80px',
      right: '64px',
      color: '#fb923c',
      opacity: 0.2,
      '@media (max-width: 768px)': {
        bottom: '40px',
        right: '20px'
      }
    },
    decorativeCircle: {
      position: 'absolute',
      top: '33%',
      right: '32px',
      width: '64px',
      height: '64px',
      border: '4px solid #fca5a5',
      borderRadius: '50%',
      opacity: 0.2,
      '@media (max-width: 768px)': {
        right: '16px',
        width: '48px',
        height: '48px'
      }
    },
    decorativeDot: {
      position: 'absolute',
      bottom: '25%',
      left: '48px',
      width: '32px',
      height: '32px',
      backgroundColor: '#fbbf24',
      borderRadius: '50%',
      opacity: 0.2,
      '@media (max-width: 768px)': {
        left: '16px',
        width: '24px',
        height: '24px'
      }
    },
    mainContent: {
      position: 'relative',
      zIndex: 10,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      width: '100%'
    },
    card: {
      width: '100%',
      maxWidth: '448px',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(254,243,199,0.95) 100%)',
      backdropFilter: 'blur(8px)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '32px',
      border: '1px solid #fed7aa',
      margin: '0 auto',
      boxSizing: 'border-box'
    },
    logoContainer: {
      textAlign: 'center',
      marginBottom: '32px'
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
      fontSize: '36px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #b45309, #ea580c, #dc2626)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px'
    },
    tagline: {
      color: '#92400e',
      fontWeight: '500',
      fontSize: '18px',
      marginBottom: '4px'
    },
    subtitle: {
      color: '#ea580c',
      fontSize: '14px'
    },
    errorBox: {
      background: 'linear-gradient(to right, #fef2f2, #fce7f3)',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '16px',
      borderRadius: '16px',
      fontSize: '14px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    errorContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    errorDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#ef4444',
      borderRadius: '50%'
    },
    googleButton: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: loading ? 'linear-gradient(to right, #d97706, #dc2626)' : 'linear-gradient(to right, #fbbf24, #f97316, #ef4444)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '16px',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      transform: loading ? 'scale(1)' : 'scale(1)',
      opacity: loading ? 0.7 : 1,
      cursor: loading ? 'not-allowed' : 'pointer',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    buttonOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to right, rgba(255,255,255,0.2), transparent)',
      opacity: 0,
      transition: 'opacity 0.3s ease'
    },
    buttonContent: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '2px solid transparent',
      borderBottomColor: 'white'
    },
    infoSection: {
      textAlign: 'center',
      marginTop: '24px'
    },
    infoText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: '#92400e',
      marginBottom: '8px'
    },
    infoDot: {
      width: '4px',
      height: '4px',
      backgroundColor: '#92400e',
      borderRadius: '50%'
    },
    helpText: {
      fontSize: '12px',
      color: '#ea580c'
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
    dot1: {
      width: '8px',
      height: '8px',
      backgroundColor: '#fcd34d',
      borderRadius: '50%'
    },
    dot2: {
      width: '8px',
      height: '8px',
      backgroundColor: '#fb923c',
      borderRadius: '50%'
    },
    dot3: {
      width: '8px',
      height: '8px',
      backgroundColor: '#f87171',
      borderRadius: '50%'
    },
    footer: {
      textAlign: 'center',
      marginTop: '24px'
    },
    footerText: {
      color: '#92400e',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const responsiveCSS = `
    @media (max-width: 768px) {
      .login-card {
        padding: 24px !important;
        margin: 16px !important;
        max-width: calc(100% - 32px) !important;
      }
      .decorative-element {
        display: none;
      }
    }
    
    @media (max-width: 480px) {
      .login-card {
        padding: 20px !important;
        margin: 12px !important;
        border-radius: 16px !important;
      }
    }
    
    * {
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      overflow-x: hidden;
    }
  `;

  return (
    <>
      <style>{spinKeyframes}{responsiveCSS}</style>
      <div style={styles.container}>
        {/* Background with Middle Eastern pattern */}
        <div style={styles.background} />
        
        {/* Decorative elements */}
        <div className="decorative-element" style={styles.decorativeCrown}>
          <Crown size={64} />
        </div>
        <div className="decorative-element" style={styles.decorativeUtensils}>
          <UtensilsCrossed size={48} />
        </div>
        <div className="decorative-element" style={styles.decorativeCircle} />
        <div className="decorative-element" style={styles.decorativeDot} />

        {/* Main content */}
        <div style={styles.mainContent}>
          <div style={{ width: '100%', maxWidth: '448px' }}>
            <div className="login-card" style={styles.card}>
              {/* Header dengan logo dan nama brand */}
              <div style={styles.logoContainer}>
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
                <p style={styles.tagline}>
                  ✨ Cita Rasa Timur Tengah Asli ✨
                </p>
                <p style={styles.subtitle}>
                  Masuk ke sistem Point of Sale
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div style={styles.errorBox}>
                  <div style={styles.errorContent}>
                    <div style={styles.errorDot} />
                    {error}
                  </div>
                </div>
              )}

              {/* Login button */}
              <div>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={styles.googleButton}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.querySelector('.overlay').style.opacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.querySelector('.overlay').style.opacity = '0';
                    }
                  }}
                >
                  <div className="overlay" style={styles.buttonOverlay} />
                  <div style={styles.buttonContent}>
                    {loading ? (
                      <>
                        <div style={styles.spinner} />
                        <span>Menghubungkan...</span>
                      </>
                    ) : (
                      <>
                        <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
                          <path
                            fill="#ffffff"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#ffffff"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#ffffff"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#ffffff"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Masuk dengan Google</span>
                        <LogIn size={20} />
                      </>
                    )}
                  </div>
                </button>

                {/* Info text */}
                <div style={styles.infoSection}>
                  <div style={styles.infoText}>
                    <div style={styles.infoDot} />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Hanya email terdaftar yang dapat masuk</span>
                    <div style={styles.infoDot} />
                  </div>
                  <p style={styles.helpText}>
                    Hubungi administrator untuk mendaftarkan akun baru
                  </p>
                </div>
                
                {/* Decorative divider */}
                <div style={styles.divider}>
                  <div style={styles.dividerDots}>
                    <div style={styles.dot1} />
                    <div style={styles.dot2} />
                    <div style={styles.dot3} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={styles.footer}>
              <p style={styles.footerText}>
                🏺 Kelezatan Tradisional, Teknologi Modern 🏺
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;