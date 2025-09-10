import React from 'react';

// Summary Page - simplified
const SummaryPage = ({ styles }) => {
    return (
        <div style={{ ...styles.flexOne, padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Summary Penjualan</h2>
            <div style={styles.card}>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                    Fitur summary akan diimplementasikan dengan charts dan analytics
                </p>
            </div>
        </div>
    );
};

export default SummaryPage;