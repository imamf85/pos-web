import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';
import productService from '../services/productService';

const ProductOptionsModal = ({ product, category, isOpen, onClose, onAddToCart, styles }) => {
    const { isMobile } = useResponsive();
    const [options, setOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [productOptions, setProductOptions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && product?.id) {
            loadProductOptions();
        }
    }, [isOpen, product?.id]);

    if (!isOpen) return null;

    const loadProductOptions = async () => {
        setLoading(true);
        try {
            const optionsData = await productService.getProductOptions(product.category_id);
            setProductOptions(optionsData);

            const defaultOptions = {};
            Object.keys(optionsData).forEach(optionType => {
                if (optionType === 'topping') {
                    defaultOptions[optionType] = [];
                } else if (optionsData[optionType]?.length > 0) {
                    const defaultValue = optionsData[optionType].find(opt =>
                        opt.value === 'regular' || opt.value === 'tidak pedas' || opt.value === 'ayam'
                    )?.value || optionsData[optionType][0].value;
                    defaultOptions[optionType] = defaultValue;
                }
            });
            defaultOptions.specialNote = '';
            setOptions(defaultOptions);
        } catch (error) {
            console.error('Error loading product options:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        let basePrice = product.price;
        let additionalPrice = 0;

        Object.keys(options).forEach(optionType => {
            if (optionType === 'topping' && Array.isArray(options[optionType])) {
                // Handle multiple toppings
                options[optionType].forEach(toppingValue => {
                    const topping = productOptions.topping?.find(t => t.value === toppingValue);
                    if (topping) {
                        additionalPrice += topping.additionalPrice || 0;
                    }
                });
            } else if (optionType !== 'specialNote' && options[optionType]) {
                // Handle single selection options
                const optionData = productOptions[optionType]?.find(opt => opt.value === options[optionType]);
                if (optionData) {
                    additionalPrice += optionData.additionalPrice || 0;
                }
            }
        });

        return Math.round((basePrice + additionalPrice) * quantity);
    };

    const handleToppingToggle = (topping) => {
        setOptions(prev => ({
            ...prev,
            topping: prev.topping?.includes(topping)
                ? prev.topping.filter(t => t !== topping)
                : [...(prev.topping || []), topping]
        }));
    };

    const handleAddToCart = () => {
        const totalPrice = calculatePrice();
        const unitPrice = totalPrice / quantity;

        const cartItem = {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            category,
            quantity,
            price: totalPrice,
            unitPrice: unitPrice,
            options: { ...options }
        };
        onAddToCart(cartItem);
        onClose();
        setQuantity(1);

        const defaultOptions = {};
        Object.keys(productOptions).forEach(optionType => {
            if (optionType === 'topping') {
                defaultOptions[optionType] = [];
            } else if (productOptions[optionType]?.length > 0) {
                const defaultValue = productOptions[optionType].find(opt =>
                    opt.value === 'regular' || opt.value === 'tidak pedas' || opt.value === 'ayam'
                )?.value || productOptions[optionType][0].value;
                defaultOptions[optionType] = defaultValue;
            }
        });
        defaultOptions.specialNote = '';
        setOptions(defaultOptions);
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={{
                ...styles.modal,
                ...(isMobile ? styles.modalMobile : {})
            }}>
                <div style={styles.modalHeader}>
                    <div style={{ ...styles.flexRow, ...styles.justifyBetween, ...styles.itemsCenter }}>
                        <h3 style={styles.modalTitle}>{product.name}</h3>
                        <button onClick={onClose} style={styles.modalCloseButton}>×</button>
                    </div>
                </div>

                <div style={styles.modalContent}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #f3f4f6',
                                borderTopColor: '#3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 1rem'
                            }} />
                            <p>Memuat opsi produk...</p>
                        </div>
                    ) : (
                        <>
                            {/* Quantity */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Jumlah</label>
                                <div style={styles.quantityControl}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={styles.quantityButton}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span style={styles.quantityValue}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        style={{ ...styles.quantityButton, ...styles.quantityButtonActive }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {Object.keys(productOptions).map(optionType => {
                                if (optionType === 'topping') {
                                    return (
                                        <div key={optionType} style={styles.formGroup}>
                                            <label style={styles.label}>
                                                Topping
                                                {productOptions[optionType].some(opt => opt.additionalPrice > 0) &&
                                                    ` (mulai dari +Rp ${Math.min(...productOptions[optionType].map(opt => opt.additionalPrice)).toLocaleString()})`
                                                }
                                            </label>
                                            <div style={styles.optionsGridTwo}>
                                                {productOptions[optionType].map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleToppingToggle(option.value)}
                                                        style={{
                                                            ...styles.optionButton,
                                                            ...(options.topping?.includes(option.value) ? styles.optionButtonActive : styles.optionButtonInactive)
                                                        }}
                                                    >
                                                        {option.value}
                                                        {option.additionalPrice !== 0 && (
                                                            <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                                                                {option.additionalPrice > 0 ? ` +${option.additionalPrice.toLocaleString()}` : ` ${option.additionalPrice.toLocaleString()}`}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const optionLabels = {
                                        spice_level: 'Tingkat Kepedasan',
                                        meat_type: 'Tipe Daging',
                                        size: 'Ukuran'
                                    };

                                    return (
                                        <div key={optionType} style={styles.formGroup}>
                                            <label style={styles.label}>{optionLabels[optionType] || optionType}</label>
                                            <div style={styles.optionsGrid}>
                                                {productOptions[optionType].map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setOptions(prev => ({ ...prev, [optionType]: option.value }))}
                                                        style={{
                                                            ...styles.optionButton,
                                                            ...(options[optionType] === option.value ? styles.optionButtonActive : styles.optionButtonInactive)
                                                        }}
                                                    >
                                                        {option.value}
                                                        {option.additionalPrice !== 0 && (
                                                            <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                                                                {option.additionalPrice > 0 ? ` +${option.additionalPrice.toLocaleString()}` : ` ${option.additionalPrice.toLocaleString()}`}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                            })}

                            {/* Special Note */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Catatan Khusus</label>
                                <textarea
                                    value={options.specialNote || ''}
                                    onChange={(e) => setOptions(prev => ({ ...prev, specialNote: e.target.value }))}
                                    style={styles.textarea}
                                    rows="3"
                                    placeholder="Catatan khusus untuk produk ini..."
                                />
                            </div>
                        </>
                    )}
                </div>

                <div style={styles.modalFooter}>
                    <div style={{ ...styles.totalPrice, marginBottom: '1rem' }}>
                        <span>Total:</span>
                        <span style={styles.totalPriceValue}>Rp {calculatePrice().toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        style={{
                            ...styles.button,
                            ...styles.buttonPrimary,
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.125rem'
                        }}
                    >
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductOptionsModal;