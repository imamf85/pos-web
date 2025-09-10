import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';

const ProductOptionsModal = ({ product, category, isOpen, onClose, onAddToCart, styles }) => {
    const { isMobile } = useResponsive();
    const [options, setOptions] = useState({
        spiceLevel: 'tidak pedas',
        meatType: 'ayam',
        size: 'regular',
        additionalToppings: [],
        specialNote: ''
    });

    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const spiceLevels = ['tidak pedas', 'sedang', 'pedas'];
    const meatTypes = ['ayam', 'daging', 'mixed'];
    const sizes = ['small', 'regular', 'jumbo'];

    const kebabToppings = ['Keju', 'Extra Chicken', 'Extra Daging', 'Extra Lettuce', 'Extra Bombay', 'Extra Nanas'];
    const burgerToppings = ['Extra Beef', 'Keju', 'Extra Lettuce'];

    const sizeMultiplier = { small: 0.8, regular: 1, jumbo: 1.3 };
    const toppingPrice = 5000;

    const calculatePrice = () => {
        let basePrice = product.price * sizeMultiplier[options.size];
        let toppingsPrice = options.additionalToppings.length * toppingPrice;
        return Math.round((basePrice + toppingsPrice) * quantity);
    };

    const handleToppingToggle = (topping) => {
        setOptions(prev => ({
            ...prev,
            additionalToppings: prev.additionalToppings.includes(topping)
                ? prev.additionalToppings.filter(t => t !== topping)
                : [...prev.additionalToppings, topping]
        }));
    };

    const handleAddToCart = () => {
        const cartItem = {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            category,
            quantity,
            price: calculatePrice(),
            unitPrice: Math.round(product.price * sizeMultiplier[options.size] + options.additionalToppings.length * toppingPrice),
            options: { ...options }
        };
        onAddToCart(cartItem);
        onClose();
        setQuantity(1);
        setOptions({
            spiceLevel: 'tidak pedas',
            meatType: 'ayam',
            size: 'regular',
            additionalToppings: [],
            specialNote: ''
        });
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

                    {/* Opsi untuk Kebab */}
                    {category === 'kebab' && (
                        <>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tingkat Kepedasan</label>
                                <div style={styles.optionsGrid}>
                                    {spiceLevels.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setOptions(prev => ({ ...prev, spiceLevel: level }))}
                                            style={{
                                                ...styles.optionButton,
                                                ...(options.spiceLevel === level ? styles.optionButtonActive : styles.optionButtonInactive)
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipe Daging</label>
                                <div style={styles.optionsGrid}>
                                    {meatTypes.map(meat => (
                                        <button
                                            key={meat}
                                            onClick={() => setOptions(prev => ({ ...prev, meatType: meat }))}
                                            style={{
                                                ...styles.optionButton,
                                                ...(options.meatType === meat ? styles.optionButtonActive : styles.optionButtonInactive)
                                            }}
                                        >
                                            {meat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Ukuran</label>
                                <div style={styles.optionsGrid}>
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setOptions(prev => ({ ...prev, size }))}
                                            style={{
                                                ...styles.optionButton,
                                                ...(options.size === size ? styles.optionButtonActive : styles.optionButtonInactive)
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Additional Topping (+Rp 5.000 each)</label>
                                <div style={styles.optionsGridTwo}>
                                    {kebabToppings.map(topping => (
                                        <button
                                            key={topping}
                                            onClick={() => handleToppingToggle(topping)}
                                            style={{
                                                ...styles.optionButton,
                                                ...(options.additionalToppings.includes(topping) ? styles.optionButtonActive : styles.optionButtonInactive)
                                            }}
                                        >
                                            {topping}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Opsi untuk Burger */}
                    {category === 'burger' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Additional Topping (+Rp 5.000 each)</label>
                            <div style={styles.optionsGridTwo}>
                                {burgerToppings.map(topping => (
                                    <button
                                        key={topping}
                                        onClick={() => handleToppingToggle(topping)}
                                        style={{
                                            ...styles.optionButton,
                                            ...(options.additionalToppings.includes(topping) ? styles.optionButtonActive : styles.optionButtonInactive)
                                        }}
                                    >
                                        {topping}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Special Note */}
                    {(category === 'kebab' || category === 'burger') && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Special Note</label>
                            <textarea
                                value={options.specialNote}
                                onChange={(e) => setOptions(prev => ({ ...prev, specialNote: e.target.value }))}
                                style={styles.textarea}
                                rows="3"
                                placeholder="Catatan khusus..."
                            />
                        </div>
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