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
        },
        // Customer Selector Styles
        customerDropdown: {
            position: 'relative',
            marginBottom: kebabTheme.spacing.lg
        },
        customerButton: {
            ...commonStyles.card,
            width: '100%',
            padding: kebabTheme.spacing.lg,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            border: `2px solid ${kebabTheme.colors.bgSecondary}`,
            background: kebabTheme.colors.white,
            borderRadius: kebabTheme.borderRadius.lg,
            transition: kebabTheme.transitions.base,
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.medium
        },
        customerDropdownMenu: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: kebabTheme.colors.white,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
            borderRadius: kebabTheme.borderRadius.lg,
            boxShadow: kebabTheme.shadows.xl,
            zIndex: 1000,
            marginTop: kebabTheme.spacing.xs
        },
        customerSearch: {
            padding: kebabTheme.spacing.md,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        customerSearchInput: {
            width: '100%',
            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.lg} ${kebabTheme.spacing.sm} 2.5rem`,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
            borderRadius: kebabTheme.borderRadius.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            outline: 'none'
        },
        customerItem: {
            width: '100%',
            padding: kebabTheme.spacing.md,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            transition: kebabTheme.transitions.base,
            borderRadius: kebabTheme.borderRadius.sm
        },
        // Modal Styles for CustomerSelector
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modal: {
            backgroundColor: kebabTheme.colors.white,
            borderRadius: kebabTheme.borderRadius.lg,
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: kebabTheme.shadows.xl
        },
        modalHeader: {
            padding: kebabTheme.spacing.lg,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        modalTitle: {
            ...commonStyles.heading.h3,
            margin: 0,
            color: kebabTheme.colors.textPrimary
        },
        modalContent: {
            padding: kebabTheme.spacing.lg
        },
        modalFooter: {
            padding: kebabTheme.spacing.lg,
            borderTop: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        label: {
            display: 'block',
            marginBottom: kebabTheme.spacing.sm,
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.semibold,
            color: kebabTheme.colors.textPrimary
        },
        input: {
            width: '100%',
            padding: kebabTheme.spacing.md,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
            borderRadius: kebabTheme.borderRadius.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            outline: 'none',
            transition: kebabTheme.transitions.base
        },
        button: {
            ...commonStyles.button.base
        },
        buttonPrimary: {
            ...commonStyles.button.primary
        },
        buttonSecondary: {
            ...commonStyles.button.base,
            background: kebabTheme.colors.white,
            color: kebabTheme.colors.textPrimary,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        buttonDisabled: {
            ...commonStyles.button.base,
            background: kebabTheme.colors.bgSecondary,
            color: kebabTheme.colors.textSecondary,
            cursor: 'not-allowed',
            opacity: 0.6
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

    const handleConfirmOrder = async () => {
        try {
            const orderData = {
                customer_id: selectedCustomer.id,
                customer_name: selectedCustomer.name,
                items: cart,
                total_amount: getTotalAmount(),
                order_number: `ORD-${Date.now()}`,
                status: 'pending'
            };

            // If orderService is available, save the order
            if (orderService && typeof orderService.createOrder === 'function') {
                await orderService.createOrder(orderData);
            }

            // Show success message
            alert(`Pesanan berhasil dibuat!\nNomor Pesanan: ${orderData.order_number}\nCustomer: ${selectedCustomer.name}\nTotal: ${formatPrice(getTotalAmount())}`);

            // Reset state
            setCart([]);
            setSelectedCustomer(null);
            setShowPayment(false);
            setOrderNumber(prev => prev + 1);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Gagal membuat pesanan. Silakan coba lagi.');
        }
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product => product.category === selectedCategory)
        : [];

    return (
        <div style={posStyles.container}>
            <div style={posStyles.mainSection}>
                {/* Mobile Customer Selector */}
                {isMobile && (
                    <CustomerSelector
                        selectedCustomer={selectedCustomer}
                        onCustomerSelect={setSelectedCustomer}
                        customerService={customerService}
                        styles={posStyles}
                    />
                )}

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
                    category={selectedProduct.category}
                    isOpen={true}
                    onAddToCart={addToCart}
                    onClose={() => setSelectedProduct(null)}
                    styles={{
                        modalOverlay: {
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        },
                        modal: {
                            backgroundColor: kebabTheme.colors.white,
                            borderRadius: kebabTheme.borderRadius.lg,
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: kebabTheme.shadows.xl
                        },
                        modalMobile: {
                            width: '95%',
                            maxHeight: '95vh'
                        },
                        modalHeader: {
                            padding: kebabTheme.spacing.lg,
                            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`
                        },
                        modalTitle: {
                            ...commonStyles.heading.h3,
                            margin: 0,
                            color: kebabTheme.colors.textPrimary
                        },
                        modalCloseButton: {
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: kebabTheme.colors.textSecondary,
                            padding: kebabTheme.spacing.sm
                        },
                        modalContent: {
                            padding: kebabTheme.spacing.lg
                        },
                        formGroup: {
                            marginBottom: kebabTheme.spacing.lg
                        },
                        label: {
                            display: 'block',
                            marginBottom: kebabTheme.spacing.sm,
                            fontSize: kebabTheme.typography.fontSize.sm,
                            fontWeight: kebabTheme.typography.fontWeight.semibold,
                            color: kebabTheme.colors.textPrimary
                        },
                        quantityControl: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: kebabTheme.spacing.md
                        },
                        quantityButton: {
                            width: '40px',
                            height: '40px',
                            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                            borderRadius: kebabTheme.borderRadius.md,
                            background: kebabTheme.colors.white,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: kebabTheme.colors.textPrimary
                        },
                        quantityButtonActive: {
                            background: kebabTheme.colors.primary,
                            borderColor: kebabTheme.colors.primary,
                            color: kebabTheme.colors.white
                        },
                        quantityValue: {
                            fontSize: kebabTheme.typography.fontSize.lg,
                            fontWeight: kebabTheme.typography.fontWeight.semibold,
                            minWidth: '40px',
                            textAlign: 'center'
                        },
                        optionsGrid: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: kebabTheme.spacing.sm
                        },
                        optionsGridTwo: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: kebabTheme.spacing.sm
                        },
                        optionButton: {
                            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                            borderRadius: kebabTheme.borderRadius.md,
                            background: kebabTheme.colors.white,
                            cursor: 'pointer',
                            fontSize: kebabTheme.typography.fontSize.sm,
                            transition: kebabTheme.transitions.base
                        },
                        optionButtonActive: {
                            background: kebabTheme.colors.primary,
                            borderColor: kebabTheme.colors.primary,
                            color: kebabTheme.colors.white
                        },
                        optionButtonInactive: {
                            background: kebabTheme.colors.white,
                            borderColor: kebabTheme.colors.bgSecondary,
                            color: kebabTheme.colors.textPrimary
                        },
                        textarea: {
                            width: '100%',
                            padding: kebabTheme.spacing.md,
                            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                            borderRadius: kebabTheme.borderRadius.md,
                            fontSize: kebabTheme.typography.fontSize.sm,
                            resize: 'vertical',
                            minHeight: '80px'
                        },
                        modalFooter: {
                            padding: kebabTheme.spacing.lg,
                            borderTop: `1px solid ${kebabTheme.colors.bgSecondary}`
                        },
                        totalPrice: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: kebabTheme.typography.fontSize.lg,
                            fontWeight: kebabTheme.typography.fontWeight.semibold
                        },
                        totalPriceValue: {
                            color: kebabTheme.colors.primary,
                            fontSize: kebabTheme.typography.fontSize.xl,
                            fontWeight: kebabTheme.typography.fontWeight.bold
                        },
                        button: {
                            ...commonStyles.button.base
                        },
                        buttonPrimary: {
                            ...commonStyles.button.primary
                        },
                        flexRow: {
                            display: 'flex'
                        },
                        justifyBetween: {
                            justifyContent: 'space-between'
                        },
                        itemsCenter: {
                            alignItems: 'center'
                        }
                    }}
                />
            )}

            {/* Payment Confirmation Modal */}
            {showPayment && (
                <div style={posStyles.modalOverlay}>
                    <div style={posStyles.modal}>
                        <div style={posStyles.modalHeader}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={posStyles.modalTitle}>Konfirmasi Pesanan</h3>
                                <button 
                                    onClick={() => setShowPayment(false)} 
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: kebabTheme.colors.textSecondary,
                                        padding: kebabTheme.spacing.sm
                                    }}
                                >×</button>
                            </div>
                        </div>
                        
                        <div style={posStyles.modalContent}>
                            {/* Customer Info */}
                            <div style={{ marginBottom: kebabTheme.spacing.lg }}>
                                <h4 style={{ 
                                    margin: `0 0 ${kebabTheme.spacing.sm} 0`,
                                    color: kebabTheme.colors.textPrimary,
                                    fontSize: kebabTheme.typography.fontSize.base,
                                    fontWeight: kebabTheme.typography.fontWeight.semibold
                                }}>Customer</h4>
                                <p style={{ 
                                    margin: 0,
                                    color: kebabTheme.colors.textSecondary,
                                    fontSize: kebabTheme.typography.fontSize.sm
                                }}>{selectedCustomer?.name}</p>
                            </div>

                            {/* Order Items */}
                            <div style={{ marginBottom: kebabTheme.spacing.lg }}>
                                <h4 style={{ 
                                    margin: `0 0 ${kebabTheme.spacing.sm} 0`,
                                    color: kebabTheme.colors.textPrimary,
                                    fontSize: kebabTheme.typography.fontSize.base,
                                    fontWeight: kebabTheme.typography.fontWeight.semibold
                                }}>Detail Pesanan</h4>
                                
                                <div style={{ 
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                                    borderRadius: kebabTheme.borderRadius.md,
                                    padding: kebabTheme.spacing.sm
                                }}>
                                    {cart.map((item, index) => (
                                        <div key={`${item.id}-${index}`} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            padding: kebabTheme.spacing.sm,
                                            borderBottom: index < cart.length - 1 ? `1px solid ${kebabTheme.colors.bgSecondary}` : 'none'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontSize: kebabTheme.typography.fontSize.sm,
                                                    fontWeight: kebabTheme.typography.fontWeight.medium,
                                                    color: kebabTheme.colors.textPrimary
                                                }}>{item.name} x {item.quantity}</div>
                                                {item.options && Object.keys(item.options).length > 0 && (
                                                    <div style={{ 
                                                        fontSize: kebabTheme.typography.fontSize.xs,
                                                        color: kebabTheme.colors.textSecondary,
                                                        marginTop: '2px'
                                                    }}>
                                                        {Object.entries(item.options)
                                                            .filter(([key, value]) => key !== 'specialNote' && value && 
                                                                (Array.isArray(value) ? value.length > 0 : true))
                                                            .map(([key, value]) => 
                                                                Array.isArray(value) ? value.join(', ') : value
                                                            ).join(' • ')}
                                                        {item.options.specialNote && (
                                                            <div>Note: {item.options.specialNote}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ 
                                                fontSize: kebabTheme.typography.fontSize.sm,
                                                fontWeight: kebabTheme.typography.fontWeight.semibold,
                                                color: kebabTheme.colors.primary
                                            }}>{formatPrice(item.price)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: kebabTheme.spacing.md,
                                background: kebabTheme.colors.bgSecondary,
                                borderRadius: kebabTheme.borderRadius.md,
                                marginBottom: kebabTheme.spacing.lg
                            }}>
                                <span style={{
                                    fontSize: kebabTheme.typography.fontSize.lg,
                                    fontWeight: kebabTheme.typography.fontWeight.semibold,
                                    color: kebabTheme.colors.textPrimary
                                }}>Total Pesanan</span>
                                <span style={{
                                    fontSize: kebabTheme.typography.fontSize.xl,
                                    fontWeight: kebabTheme.typography.fontWeight.bold,
                                    color: kebabTheme.colors.primary
                                }}>{formatPrice(getTotalAmount())}</span>
                            </div>
                        </div>

                        <div style={posStyles.modalFooter}>
                            <div style={{ display: 'flex', gap: kebabTheme.spacing.md }}>
                                <button
                                    onClick={() => setShowPayment(false)}
                                    style={{
                                        ...posStyles.button,
                                        ...posStyles.buttonSecondary,
                                        flex: 1,
                                        padding: kebabTheme.spacing.md
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmOrder}
                                    style={{
                                        ...posStyles.button,
                                        ...posStyles.buttonPrimary,
                                        flex: 1,
                                        padding: kebabTheme.spacing.md
                                    }}
                                >
                                    Konfirmasi Pesanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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