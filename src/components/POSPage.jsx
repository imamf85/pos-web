import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Check } from 'lucide-react';
import CustomerSelector from './CustomerSelector';
import ProductOptionsModal from './ProductOptionsModal';
import useResponsive from '../hooks/useResponsive';
import productService from '../services/productService';
import orderService from '../services/orderService';
import { kebabTheme, commonStyles } from '../styles/kebabTheme';

const POSPage = ({ mockProducts, customerService }) => {
    const { isMobile } = useResponsive();
    const [selectedCategory, setSelectedCategory] = useState('kebab');
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [orderNumber, setOrderNumber] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [products, setProducts] = useState(Array.isArray(mockProducts) ? mockProducts : []);
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: 'kebab', label: 'Kebab', emoji: '🥙' },
        { id: 'burger', label: 'Burger', emoji: '🍔' },
        { id: 'alacarte', label: 'Ala Carte', emoji: '🍽️' }
    ];

    const posStyles = {
        container: {
            display: 'flex',
            height: 'calc(100vh - 160px)',
            gap: kebabTheme.spacing.xl,
            maxWidth: '1400px',
            margin: '0 auto'
        },
        mainSection: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.lg
        },
        categoriesContainer: {
            ...commonStyles.card,
            padding: kebabTheme.spacing.lg,
            display: 'flex',
            gap: kebabTheme.spacing.md
        },
        categoryButton: {
            flex: 1,
            padding: `${kebabTheme.spacing.md} ${kebabTheme.spacing.lg}`,
            borderRadius: kebabTheme.borderRadius.lg,
            border: `2px solid ${kebabTheme.colors.bgSecondary}`,
            background: kebabTheme.colors.white,
            cursor: 'pointer',
            transition: kebabTheme.transitions.base,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: kebabTheme.spacing.sm,
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.semibold
        },
        categoryActive: {
            background: kebabTheme.colors.gradientPrimary,
            color: kebabTheme.colors.white,
            border: `2px solid transparent`
        },
        productsGrid: {
            ...commonStyles.card,
            flex: 1,
            padding: kebabTheme.spacing.lg,
            overflowY: 'auto'
        },
        productGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: kebabTheme.spacing.md
        },
        productCard: {
            background: kebabTheme.colors.white,
            borderRadius: kebabTheme.borderRadius.lg,
            padding: kebabTheme.spacing.md,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
            cursor: 'pointer',
            transition: kebabTheme.transitions.base,
            textAlign: 'center'
        },
        productImage: {
            width: '100%',
            height: '120px',
            objectFit: 'cover',
            borderRadius: kebabTheme.borderRadius.md,
            marginBottom: kebabTheme.spacing.sm
        },
        productName: {
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.semibold,
            color: kebabTheme.colors.textPrimary,
            marginBottom: kebabTheme.spacing.xs
        },
        productPrice: {
            fontSize: kebabTheme.typography.fontSize.lg,
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.primary
        },
        cartSection: {
            width: isMobile ? '100%' : '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.lg
        },
        cartContainer: {
            ...commonStyles.card,
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        cartHeader: {
            padding: `${kebabTheme.spacing.lg} ${kebabTheme.spacing.lg} ${kebabTheme.spacing.md}`,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        cartTitle: {
            ...commonStyles.heading.h3,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm
        },
        cartItems: {
            flex: 1,
            padding: kebabTheme.spacing.lg,
            overflowY: 'auto'
        },
        cartEmpty: {
            textAlign: 'center',
            padding: kebabTheme.spacing['3xl'],
            color: kebabTheme.colors.textPrimary,
            opacity: 0.6
        },
        cartItem: {
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.md,
            padding: kebabTheme.spacing.md,
            borderRadius: kebabTheme.borderRadius.md,
            background: kebabTheme.colors.white,
            marginBottom: kebabTheme.spacing.sm,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        cartItemInfo: {
            flex: 1
        },
        cartItemName: {
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.semibold,
            color: kebabTheme.colors.textPrimary
        },
        cartItemOptions: {
            fontSize: kebabTheme.typography.fontSize.xs,
            color: kebabTheme.colors.textSecondary
        },
        cartItemPrice: {
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.primary
        },
        removeButton: {
            padding: kebabTheme.spacing.sm,
            borderRadius: kebabTheme.borderRadius.md,
            background: `${kebabTheme.colors.error}15`,
            color: kebabTheme.colors.error,
            border: 'none',
            cursor: 'pointer',
            transition: kebabTheme.transitions.base
        },
        cartFooter: {
            padding: kebabTheme.spacing.lg,
            borderTop: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        totalRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: kebabTheme.spacing.lg
        },
        totalLabel: {
            fontSize: kebabTheme.typography.fontSize.lg,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            color: kebabTheme.colors.textPrimary
        },
        totalAmount: {
            fontSize: kebabTheme.typography.fontSize['2xl'],
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.primary
        },
        checkoutButton: {
            ...commonStyles.button.base,
            ...commonStyles.button.primary,
            width: '100%',
            padding: kebabTheme.spacing.lg,
            fontSize: kebabTheme.typography.fontSize.lg
        },
        mobileCartButton: {
            position: 'fixed',
            bottom: '80px',
            right: kebabTheme.spacing.xl,
            width: '60px',
            height: '60px',
            borderRadius: kebabTheme.borderRadius.full,
            background: kebabTheme.colors.gradientPrimary,
            color: kebabTheme.colors.white,
            border: 'none',
            boxShadow: kebabTheme.shadows.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
        },
        badge: {
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: kebabTheme.colors.secondary,
            color: kebabTheme.colors.textDark,
            width: '24px',
            height: '24px',
            borderRadius: kebabTheme.borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: kebabTheme.typography.fontSize.xs,
            fontWeight: kebabTheme.typography.fontWeight.bold
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const productsData = await productService.getProducts();
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Error loading products:', error);
            const fallbackProducts = Array.isArray(mockProducts) ? mockProducts : [];
            setProducts(fallbackProducts);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCart(prev => [...prev, item]);
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    const formatPrice = (price) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            alert('Pilih customer terlebih dahulu!');
            return;
        }

        if (cart.length === 0) {
            alert('Keranjang masih kosong!');
            return;
        }

        setShowPayment(true);
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product => product.category === selectedCategory)
        : [];

    return (
        <div style={posStyles.container}>
            <div style={posStyles.mainSection}>
                {/* Categories */}
                <div style={posStyles.categoriesContainer}>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{
                                ...posStyles.categoryButton,
                                ...(selectedCategory === category.id ? posStyles.categoryActive : {})
                            }}
                            onMouseEnter={(e) => {
                                if (selectedCategory !== category.id) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = kebabTheme.shadows.lg;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedCategory !== category.id) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{category.emoji}</span>
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div style={posStyles.productsGrid}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: kebabTheme.spacing['3xl'] }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                border: `3px solid ${kebabTheme.colors.bgSecondary}`,
                                borderTopColor: kebabTheme.colors.primary,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }} />
                            <p style={{ marginTop: kebabTheme.spacing.lg, color: kebabTheme.colors.textPrimary }}>Memuat produk...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div style={posStyles.productGrid}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    style={posStyles.productCard}
                                    onClick={() => setSelectedProduct(product)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = kebabTheme.shadows.lg;
                                        e.currentTarget.style.borderColor = kebabTheme.colors.primary;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = kebabTheme.colors.bgSecondary;
                                    }}
                                >
                                    <h4 style={posStyles.productName}>{product.name}</h4>
                                    <p style={posStyles.productPrice}>{formatPrice(product.price)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: kebabTheme.spacing['3xl'] }}>
                            <p style={{ color: kebabTheme.colors.textSecondary, fontSize: kebabTheme.typography.fontSize.lg }}>
                                Tidak ada produk untuk kategori {selectedCategory}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Section - Desktop */}
            {!isMobile && (
                <div style={posStyles.cartSection}>
                    {/* Customer Selector */}
                    <CustomerSelector
                        selectedCustomer={selectedCustomer}
                        onCustomerSelect={setSelectedCustomer}
                        customerService={customerService}
                        styles={posStyles}
                    />

                    {/* Cart */}
                    <div style={posStyles.cartContainer}>
                        <div style={posStyles.cartHeader}>
                            <h3 style={posStyles.cartTitle}>
                                <ShoppingCart size={24} />
                                Keranjang
                            </h3>
                        </div>

                        <div style={posStyles.cartItems}>
                            {cart.length === 0 ? (
                                <div style={posStyles.cartEmpty}>
                                    <p>Keranjang kosong</p>
                                    <p style={{ fontSize: kebabTheme.typography.fontSize.sm }}>Tambahkan produk untuk memulai</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={`${item.id}-${index}`} style={posStyles.cartItem}>
                                        <div style={posStyles.cartItemInfo}>
                                            <div style={posStyles.cartItemName}>{item.name}</div>
                                            {item.options && (
                                                <div style={posStyles.cartItemOptions}>
                                                    {Object.entries(item.options).map(([key, value]) => (
                                                        <span key={key}>{value}, </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={posStyles.cartItemPrice}>{formatPrice(item.price)}</div>
                                        </div>
                                        <button
                                            style={posStyles.removeButton}
                                            onClick={() => removeFromCart(item.id)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = `${kebabTheme.colors.error}25`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = `${kebabTheme.colors.error}15`;
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={posStyles.cartFooter}>
                            <div style={posStyles.totalRow}>
                                <span style={posStyles.totalLabel}>Total</span>
                                <span style={posStyles.totalAmount}>{formatPrice(getTotalAmount())}</span>
                            </div>
                            <button
                                style={{
                                    ...posStyles.checkoutButton,
                                    opacity: cart.length === 0 ? 0.5 : 1,
                                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                                }}
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                onMouseEnter={(e) => {
                                    if (cart.length > 0) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = kebabTheme.shadows.xl;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = kebabTheme.shadows.lg;
                                }}
                            >
                                <Check size={20} />
                                Proses Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Cart Button */}
            {isMobile && (
                <button
                    style={posStyles.mobileCartButton}
                    onClick={() => setShowCart(!showCart)}
                >
                    <ShoppingCart size={24} />
                    {cart.length > 0 && (
                        <span style={posStyles.badge}>{cart.length}</span>
                    )}
                </button>
            )}

            {/* Product Options Modal */}
            {selectedProduct && (
                <ProductOptionsModal
                    product={selectedProduct}
                    onAddToCart={addToCart}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default POSPage;