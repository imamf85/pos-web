import React from 'react';
import { User, LogOut, UtensilsCrossed, Crown } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { kebabTheme } from '../styles/kebabTheme';

const Header = ({ user }) => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const headerStyles = {
        container: {
            background: kebabTheme.colors.gradientPrimary,
            padding: `${kebabTheme.spacing.lg} ${kebabTheme.spacing.xl}`,
            boxShadow: kebabTheme.shadows.lg,
            position: 'relative',
            overflow: 'hidden'
        },
        backgroundPattern: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
            `
        },
        content: {
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        logoSection: {
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.lg
        },
        logoWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm
        },
        logoIcon: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: kebabTheme.spacing.sm,
            borderRadius: kebabTheme.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        title: {
            fontSize: kebabTheme.typography.fontSize['2xl'],
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.white,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm
        },
        crownIcon: {
            color: kebabTheme.colors.secondaryLight
        },
        subtitle: {
            fontSize: kebabTheme.typography.fontSize.sm,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0
        },
        userSection: {
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.lg
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.lg}`,
            borderRadius: kebabTheme.borderRadius.xl,
            color: kebabTheme.colors.white
        },
        userName: {
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.medium
        },
        logoutButton: {
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: kebabTheme.colors.white,
            padding: kebabTheme.spacing.sm,
            borderRadius: kebabTheme.borderRadius.md,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: kebabTheme.transitions.base
        }
    };

    return (
        <div style={headerStyles.container}>
            <div style={headerStyles.backgroundPattern} />
            <div style={headerStyles.content}>
                <div style={headerStyles.logoSection}>
                    <div style={headerStyles.logoWrapper}>
                        <div style={headerStyles.logoIcon}>
                            <UtensilsCrossed size={24} color="white" />
                        </div>
                        <div>
                            <h1 style={headerStyles.title}>
                                Kebab AL Bewok
                                <Crown size={20} style={headerStyles.crownIcon} />
                            </h1>
                            <p style={headerStyles.subtitle}>{user?.branch || 'Cabang'}</p>
                        </div>
                    </div>
                </div>
                
                <div style={headerStyles.userSection}>
                    <div style={headerStyles.userInfo}>
                        <User size={18} />
                        <span style={headerStyles.userName}>{user?.name || 'User'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={headerStyles.logoutButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Keluar"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;