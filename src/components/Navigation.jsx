import React from 'react';
import { ShoppingCart, BarChart3, Settings, User, FileText } from 'lucide-react';
import { kebabTheme } from '../styles/kebabTheme';

const Navigation = ({ currentPage, setCurrentPage, userRole }) => {
    const navItems = [
        { id: 'pos', label: 'POS', icon: ShoppingCart, forAll: true },
        { id: 'orders', label: 'Pesanan', icon: FileText, forAll: true },
        { id: 'summary', label: 'Summary', icon: BarChart3, forAll: true },
        { id: 'products', label: 'Produk', icon: Settings, adminOnly: true },
        { id: 'staff', label: 'Staff', icon: User, adminOnly: true }
    ];

    const navStyles = {
        container: {
            background: kebabTheme.colors.white,
            borderTop: `1px solid ${kebabTheme.colors.bgSecondary}`,
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: `${kebabTheme.spacing.md} 0`
        },
        content: {
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto'
        },
        button: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: kebabTheme.spacing.xs,
            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.lg}`,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: kebabTheme.transitions.base,
            borderRadius: kebabTheme.borderRadius.md,
            position: 'relative',
            color: kebabTheme.colors.textPrimary,
            minWidth: '80px'
        },
        buttonActive: {
            color: kebabTheme.colors.primary
        },
        activeIndicator: {
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '3px',
            background: kebabTheme.colors.gradientPrimary,
            borderRadius: kebabTheme.borderRadius.full
        },
        icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: kebabTheme.borderRadius.md,
            transition: kebabTheme.transitions.base
        },
        iconActive: {
            background: `${kebabTheme.colors.primary}15`
        },
        label: {
            fontSize: kebabTheme.typography.fontSize.xs,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            transition: kebabTheme.transitions.base
        }
    };

    return (
        <div style={navStyles.container}>
            <div style={navStyles.content}>
                {navItems.map(item => {
                    if (item.adminOnly && userRole !== 'admin') return null;
                    if (!item.forAll && !item.adminOnly) return null;

                    const isActive = currentPage === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id)}
                            style={{
                                ...navStyles.button,
                                ...(isActive ? navStyles.buttonActive : {})
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = `${kebabTheme.colors.bgPrimary}50`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {isActive && <div style={navStyles.activeIndicator} />}
                            <div style={{
                                ...navStyles.icon,
                                ...(isActive ? navStyles.iconActive : {})
                            }}>
                                <Icon size={20} />
                            </div>
                            <span style={navStyles.label}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;