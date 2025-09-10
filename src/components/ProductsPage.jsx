import React from 'react';

// Products Page - simplified
const ProductsPage = ({ styles }) => {
    return (
        <div style={{ ...styles.flexOne, padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Manajemen Produk</h2>
            <div style={styles.card}>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                    Fitur manajemen produk akan diimplementasikan di sini
                </p>
            </div>
        </div>
    );
};

export default ProductsPage;