import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import orderService from '../services/orderService';
import { kebabTheme, commonStyles } from '../styles/kebabTheme';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [cashAmount, setCashAmount] = useState('');

    const ordersStyles = {
        container: {
            padding: kebabTheme.spacing.xl,
            maxWidth: '1400px',
            margin: '0 auto'
        },
        header: {
            ...commonStyles.card,
            padding: kebabTheme.spacing.xl,
            marginBottom: kebabTheme.spacing.xl
        },
        title: {
            ...commonStyles.heading.h2,
            margin: 0,
            marginBottom: kebabTheme.spacing.lg
        },
        filterSection: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: kebabTheme.spacing.md,
            alignItems: 'flex-end'
        },
        filterGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.sm
        },
        label: {
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.semibold,
            color: kebabTheme.colors.textPrimary
        },
        input: {
            padding: kebabTheme.spacing.md,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
            borderRadius: kebabTheme.borderRadius.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            outline: 'none',
            transition: kebabTheme.transitions.base
        },
        select: {
            padding: kebabTheme.spacing.md,
            border: `1px solid ${kebabTheme.colors.bgSecondary}`,
            borderRadius: kebabTheme.borderRadius.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            outline: 'none',
            cursor: 'pointer',
            background: kebabTheme.colors.white
        },
        searchButton: {
            ...commonStyles.button.base,
            ...commonStyles.button.primary,
            padding: `${kebabTheme.spacing.md} ${kebabTheme.spacing.xl}`,
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: kebabTheme.spacing.lg,
            marginBottom: kebabTheme.spacing.xl
        },
        statCard: {
            ...commonStyles.card,
            padding: kebabTheme.spacing.lg,
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.lg
        },
        statIcon: {
            width: '48px',
            height: '48px',
            borderRadius: kebabTheme.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        statInfo: {
            flex: 1
        },
        statLabel: {
            fontSize: kebabTheme.typography.fontSize.sm,
            color: kebabTheme.colors.textSecondary,
            marginBottom: kebabTheme.spacing.xs
        },
        statValue: {
            fontSize: kebabTheme.typography.fontSize['2xl'],
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.textPrimary
        },
        ordersTable: {
            ...commonStyles.card,
            overflow: 'hidden'
        },
        tableWrapper: {
            overflowX: 'auto'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            padding: kebabTheme.spacing.md,
            textAlign: 'left',
            fontWeight: kebabTheme.typography.fontWeight.semibold,
            fontSize: kebabTheme.typography.fontSize.sm,
            color: kebabTheme.colors.textSecondary,
            borderBottom: `2px solid ${kebabTheme.colors.bgSecondary}`,
            background: kebabTheme.colors.bgPrimary
        },
        td: {
            padding: kebabTheme.spacing.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            color: kebabTheme.colors.textPrimary,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.xs,
            padding: `${kebabTheme.spacing.xs} ${kebabTheme.spacing.md}`,
            borderRadius: kebabTheme.borderRadius.full,
            fontSize: kebabTheme.typography.fontSize.xs,
            fontWeight: kebabTheme.typography.fontWeight.semibold
        },
        statusPaid: {
            background: `${kebabTheme.colors.success}20`,
            color: kebabTheme.colors.success
        },
        statusUnpaid: {
            background: `${kebabTheme.colors.warning || '#ffa500'}20`,
            color: kebabTheme.colors.warning || '#ffa500'
        },
        statusPending: {
            background: `${kebabTheme.colors.info || '#3b82f6'}20`,
            color: kebabTheme.colors.info || '#3b82f6'
        },
        actionButton: {
            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
            borderRadius: kebabTheme.borderRadius.md,
            border: `1px solid ${kebabTheme.colors.primary}`,
            background: 'transparent',
            color: kebabTheme.colors.primary,
            fontSize: kebabTheme.typography.fontSize.xs,
            cursor: 'pointer',
            transition: kebabTheme.transitions.base
        },
        emptyState: {
            padding: kebabTheme.spacing['3xl'],
            textAlign: 'center',
            color: kebabTheme.colors.textSecondary
        },
        // Modal Styles
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
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const filters = {};

            if (dateFilter.from) {
                filters.date_from = new Date(dateFilter.from).toISOString();
            }
            if (dateFilter.to) {
                const toDate = new Date(dateFilter.to);
                toDate.setHours(23, 59, 59, 999);
                filters.date_to = toDate.toISOString();
            }

            const data = await orderService.getOrders(filters);
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadOrders();
    };

    const handleUpdatePaymentStatus = async (orderId, newStatus) => {
        try {
            await orderService.updatePaymentStatus(orderId, newStatus);
            loadOrders();
            alert('Status pembayaran berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('Gagal memperbarui status pembayaran.');
        }
    };

    const handlePayButtonClick = (order) => {
        setSelectedOrder(order);
        setShowPaymentModal(true);
        setCashAmount('');
        setSelectedPaymentMethod(null);
    };

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
        setShowPaymentModal(false);
        setShowPaymentConfirm(true);
    };

    const handleConfirmPayment = async () => {
        try {
            const totalAmount = selectedOrder.total_amount;
            const changeAmount = selectedPaymentMethod === 'cash' ? parseFloat(cashAmount) - totalAmount : 0;

            const updateData = {
                payment_status: 'paid',
                order_status: 'completed',
                payment_method: selectedPaymentMethod,
                notes: selectedOrder.notes + ` | Dibayar pada ${new Date().toLocaleString('id-ID')} - Metode: ${selectedPaymentMethod === 'cash' ? 'Tunai' : 'QRIS'}${selectedPaymentMethod === 'cash' && changeAmount > 0 ? ` - Uang: ${formatPrice(parseFloat(cashAmount))}, Kembalian: ${formatPrice(changeAmount)}` : ''}`
            };

            // Update payment status
            await orderService.updatePaymentStatus(selectedOrder.id, 'paid', updateData);

            // Show success message
            let successMessage = `Pembayaran berhasil!\nOrder: ${selectedOrder.order_number}\nCustomer: ${selectedOrder.customers?.name}\nTotal: ${formatPrice(totalAmount)}\nMetode: ${selectedPaymentMethod === 'cash' ? 'Tunai' : 'QRIS'}`;

            if (selectedPaymentMethod === 'cash' && changeAmount > 0) {
                successMessage += `\nUang Diterima: ${formatPrice(parseFloat(cashAmount))}\nKembalian: ${formatPrice(changeAmount)}`;
            }

            alert(successMessage);

            // Reset states
            setShowPaymentConfirm(false);
            setSelectedOrder(null);
            setSelectedPaymentMethod(null);
            setCashAmount('');

            // Reload orders
            loadOrders();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Gagal memproses pembayaran: ' + error.message);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter !== 'all' && order.payment_status !== filter) return false;
        if (searchTerm && !order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !order.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: filteredOrders.length,
        paid: filteredOrders.filter(o => o.payment_status === 'paid').length,
        unpaid: filteredOrders.filter(o => o.payment_status === 'unpaid').length,
        totalRevenue: filteredOrders
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + o.total_amount, 0)
    };

    const formatPrice = (price) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={ordersStyles.container}>
            {/* Header with Filters */}
            <div style={ordersStyles.header}>
                <h2 style={ordersStyles.title}>Daftar Pesanan</h2>

                <div style={ordersStyles.filterSection}>
                    <div style={ordersStyles.filterGroup}>
                        <label style={ordersStyles.label}>Cari Pesanan</label>
                        <input
                            type="text"
                            placeholder="No. Order atau Customer"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ ...ordersStyles.input, width: '200px' }}
                        />
                    </div>

                    <div style={ordersStyles.filterGroup}>
                        <label style={ordersStyles.label}>Status Pembayaran</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={ordersStyles.select}
                        >
                            <option value="all">Semua</option>
                            <option value="paid">Sudah Bayar</option>
                            <option value="pending">Belum Bayar</option>
                        </select>
                    </div>

                    <div style={ordersStyles.filterGroup}>
                        <label style={ordersStyles.label}>Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFilter.from}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                            style={ordersStyles.input}
                        />
                    </div>

                    <div style={ordersStyles.filterGroup}>
                        <label style={ordersStyles.label}>Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateFilter.to}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                            style={ordersStyles.input}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        style={ordersStyles.searchButton}
                    >
                        <Search size={16} />
                        Cari
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={ordersStyles.statsGrid}>
                <div style={ordersStyles.statCard}>
                    <div style={{
                        ...ordersStyles.statIcon,
                        background: `${kebabTheme.colors.primary}20`
                    }}>
                        <ShoppingCart size={24} color={kebabTheme.colors.primary} />
                    </div>
                    <div style={ordersStyles.statInfo}>
                        <div style={ordersStyles.statLabel}>Total Pesanan</div>
                        <div style={ordersStyles.statValue}>{stats.total}</div>
                    </div>
                </div>

                <div style={ordersStyles.statCard}>
                    <div style={{
                        ...ordersStyles.statIcon,
                        background: `${kebabTheme.colors.success}20`
                    }}>
                        <CheckCircle size={24} color={kebabTheme.colors.success} />
                    </div>
                    <div style={ordersStyles.statInfo}>
                        <div style={ordersStyles.statLabel}>Sudah Bayar</div>
                        <div style={ordersStyles.statValue}>{stats.paid}</div>
                    </div>
                </div>

                <div style={ordersStyles.statCard}>
                    <div style={{
                        ...ordersStyles.statIcon,
                        background: `${kebabTheme.colors.warning || '#ffa500'}20`
                    }}>
                        <Clock size={24} color={kebabTheme.colors.warning || '#ffa500'} />
                    </div>
                    <div style={ordersStyles.statInfo}>
                        <div style={ordersStyles.statLabel}>Belum Bayar</div>
                        <div style={ordersStyles.statValue}>{stats.unpaid}</div>
                    </div>
                </div>

                <div style={ordersStyles.statCard}>
                    <div style={{
                        ...ordersStyles.statIcon,
                        background: `${kebabTheme.colors.secondary}20`
                    }}>
                        <DollarSign size={24} color={kebabTheme.colors.secondary} />
                    </div>
                    <div style={ordersStyles.statInfo}>
                        <div style={ordersStyles.statLabel}>Total Pendapatan</div>
                        <div style={ordersStyles.statValue}>{formatPrice(stats.totalRevenue)}</div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div style={ordersStyles.ordersTable}>
                <div style={ordersStyles.tableWrapper}>
                    <table style={ordersStyles.table}>
                        <thead>
                            <tr>
                                <th style={ordersStyles.th}>No. Order</th>
                                <th style={ordersStyles.th}>Tanggal</th>
                                <th style={ordersStyles.th}>Customer</th>
                                <th style={ordersStyles.th}>Total</th>
                                <th style={ordersStyles.th}>Metode</th>
                                <th style={ordersStyles.th}>Status Bayar</th>
                                <th style={ordersStyles.th}>Status Order</th>
                                <th style={ordersStyles.th}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ ...ordersStyles.td, textAlign: 'center', padding: kebabTheme.spacing['3xl'] }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            border: `3px solid ${kebabTheme.colors.bgSecondary}`,
                                            borderTopColor: kebabTheme.colors.primary,
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            margin: '0 auto'
                                        }} />
                                        <p style={{ marginTop: kebabTheme.spacing.lg }}>Memuat pesanan...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={ordersStyles.emptyState}>
                                        Tidak ada pesanan ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td style={ordersStyles.td}>
                                            <strong>{order.order_number || `ORD-${order.id}`}</strong>
                                        </td>
                                        <td style={ordersStyles.td}>{formatDateTime(order.created_at)}</td>
                                        <td style={ordersStyles.td}>{order.customers?.name || '-'}</td>
                                        <td style={ordersStyles.td}>
                                            <strong>{formatPrice(order.total_amount)}</strong>
                                        </td>
                                        <td style={ordersStyles.td}>
                                            {order.payment_method === 'cash' ? 'Tunai' :
                                                order.payment_method === 'qris' ? 'QRIS' :
                                                    order.payment_method === 'unpaid' ? '-' : order.payment_method}
                                        </td>
                                        <td style={ordersStyles.td}>
                                            <span style={{
                                                ...ordersStyles.statusBadge,
                                                ...(order.payment_status === 'paid' ? ordersStyles.statusPaid : ordersStyles.statusUnpaid)
                                            }}>
                                                {order.payment_status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                                            </span>
                                        </td>
                                        <td style={ordersStyles.td}>
                                            <span style={{
                                                ...ordersStyles.statusBadge,
                                                ...(order.order_status === 'completed' ? ordersStyles.statusPaid : ordersStyles.statusPending)
                                            }}>
                                                {order.order_status === 'completed' ? 'Selesai' :
                                                    order.order_status === 'pending' ? 'Menunggu' :
                                                        order.order_status === 'preparing' ? 'Disiapkan' :
                                                            order.order_status}
                                            </span>
                                        </td>
                                        <td style={ordersStyles.td}>
                                            {(order.payment_status === 'pending' || order.payment_status === 'unpaid') && (
                                                <button
                                                    style={ordersStyles.actionButton}
                                                    onClick={() => handlePayButtonClick(order)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = kebabTheme.colors.primary;
                                                        e.currentTarget.style.color = kebabTheme.colors.white;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = kebabTheme.colors.primary;
                                                    }}
                                                >
                                                    Bayar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Payment Method Modal */}
            {showPaymentModal && selectedOrder && (
                <div style={ordersStyles.modalOverlay}>
                    <div style={ordersStyles.modal}>
                        <div style={ordersStyles.modalHeader}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={ordersStyles.modalTitle}>Pilih Metode Pembayaran</h3>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedOrder(null);
                                    }}
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

                        <div style={ordersStyles.modalContent}>
                            {/* Order Info */}
                            <div style={{
                                padding: kebabTheme.spacing.lg,
                                background: kebabTheme.colors.bgSecondary,
                                borderRadius: kebabTheme.borderRadius.md,
                                marginBottom: kebabTheme.spacing.xl
                            }}>
                                <p style={{ margin: 0, marginBottom: kebabTheme.spacing.sm }}>
                                    <strong>Order:</strong> {selectedOrder.order_number}
                                </p>
                                <p style={{ margin: 0, marginBottom: kebabTheme.spacing.sm }}>
                                    <strong>Customer:</strong> {selectedOrder.customers?.name}
                                </p>
                                <p style={{ margin: 0, fontSize: kebabTheme.typography.fontSize.xl }}>
                                    <strong>Total:</strong> {formatPrice(selectedOrder.total_amount)}
                                </p>
                            </div>

                            {/* Payment Method Options */}
                            <div style={{
                                display: 'grid',
                                gap: kebabTheme.spacing.md
                            }}>
                                {/* Cash Option */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('cash')}
                                    style={{
                                        ...ordersStyles.button,
                                        ...ordersStyles.buttonSecondary,
                                        padding: kebabTheme.spacing.xl,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: kebabTheme.spacing.md,
                                        fontSize: kebabTheme.typography.fontSize.lg,
                                        fontWeight: kebabTheme.typography.fontWeight.semibold,
                                        border: `2px solid ${kebabTheme.colors.bgSecondary}`,
                                        transition: kebabTheme.transitions.base
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = kebabTheme.colors.primary;
                                        e.currentTarget.style.background = `${kebabTheme.colors.primary}10`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = kebabTheme.colors.bgSecondary;
                                        e.currentTarget.style.background = kebabTheme.colors.white;
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>💵</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Cash / Tunai</div>
                                        <div style={{
                                            fontSize: kebabTheme.typography.fontSize.sm,
                                            color: kebabTheme.colors.textSecondary,
                                            fontWeight: kebabTheme.typography.fontWeight.normal
                                        }}>Pembayaran dengan uang tunai</div>
                                    </div>
                                </button>

                                {/* QRIS Option */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('qris')}
                                    style={{
                                        ...ordersStyles.button,
                                        ...ordersStyles.buttonSecondary,
                                        padding: kebabTheme.spacing.xl,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: kebabTheme.spacing.md,
                                        fontSize: kebabTheme.typography.fontSize.lg,
                                        fontWeight: kebabTheme.typography.fontWeight.semibold,
                                        border: `2px solid ${kebabTheme.colors.bgSecondary}`,
                                        transition: kebabTheme.transitions.base
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = kebabTheme.colors.primary;
                                        e.currentTarget.style.background = `${kebabTheme.colors.primary}10`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = kebabTheme.colors.bgSecondary;
                                        e.currentTarget.style.background = kebabTheme.colors.white;
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>📱</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>QRIS</div>
                                        <div style={{
                                            fontSize: kebabTheme.typography.fontSize.sm,
                                            color: kebabTheme.colors.textSecondary,
                                            fontWeight: kebabTheme.typography.fontWeight.normal
                                        }}>Pembayaran dengan scan QR code</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {showPaymentConfirm && selectedOrder && (
                <div style={ordersStyles.modalOverlay}>
                    <div style={ordersStyles.modal}>
                        <div style={ordersStyles.modalHeader}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={ordersStyles.modalTitle}>
                                    {selectedPaymentMethod === 'cash' ? 'Pembayaran Tunai' : 'Pembayaran QRIS'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowPaymentConfirm(false);
                                        setSelectedPaymentMethod(null);
                                        setCashAmount('');
                                        setSelectedOrder(null);
                                    }}
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

                        <div style={ordersStyles.modalContent}>
                            {selectedPaymentMethod === 'cash' ? (
                                // Cash Payment Interface
                                <>
                                    {/* Total Amount */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: kebabTheme.spacing.lg,
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
                                            fontSize: kebabTheme.typography.fontSize['2xl'],
                                            fontWeight: kebabTheme.typography.fontWeight.bold,
                                            color: kebabTheme.colors.primary
                                        }}>{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>

                                    {/* Cash Input */}
                                    <div style={{ marginBottom: kebabTheme.spacing.lg }}>
                                        <label style={{
                                            ...ordersStyles.label,
                                            marginBottom: kebabTheme.spacing.md
                                        }}>Jumlah Uang Diterima</label>
                                        <input
                                            type="number"
                                            value={cashAmount}
                                            onChange={(e) => setCashAmount(e.target.value)}
                                            placeholder="0"
                                            style={{
                                                ...ordersStyles.input,
                                                fontSize: kebabTheme.typography.fontSize.lg,
                                                fontWeight: kebabTheme.typography.fontWeight.semibold,
                                                textAlign: 'center',
                                                padding: kebabTheme.spacing.lg,
                                                width: '100%'
                                            }}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Change Calculation */}
                                    {cashAmount && !isNaN(parseFloat(cashAmount)) && parseFloat(cashAmount) >= selectedOrder.total_amount && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: kebabTheme.spacing.lg,
                                            background: `${kebabTheme.colors.secondary}20`,
                                            borderRadius: kebabTheme.borderRadius.md,
                                            marginBottom: kebabTheme.spacing.lg,
                                            border: `2px solid ${kebabTheme.colors.secondary}`
                                        }}>
                                            <span style={{
                                                fontSize: kebabTheme.typography.fontSize.lg,
                                                fontWeight: kebabTheme.typography.fontWeight.semibold,
                                                color: kebabTheme.colors.textPrimary
                                            }}>Kembalian</span>
                                            <span style={{
                                                fontSize: kebabTheme.typography.fontSize['2xl'],
                                                fontWeight: kebabTheme.typography.fontWeight.bold,
                                                color: kebabTheme.colors.secondary
                                            }}>{formatPrice(parseFloat(cashAmount) - selectedOrder.total_amount)}</span>
                                        </div>
                                    )}

                                    {/* Insufficient Cash Warning */}
                                    {cashAmount && !isNaN(parseFloat(cashAmount)) && parseFloat(cashAmount) < selectedOrder.total_amount && (
                                        <div style={{
                                            padding: kebabTheme.spacing.md,
                                            background: `${kebabTheme.colors.error}20`,
                                            borderRadius: kebabTheme.borderRadius.md,
                                            marginBottom: kebabTheme.spacing.lg,
                                            border: `1px solid ${kebabTheme.colors.error}`,
                                            textAlign: 'center'
                                        }}>
                                            <span style={{
                                                color: kebabTheme.colors.error,
                                                fontSize: kebabTheme.typography.fontSize.sm,
                                                fontWeight: kebabTheme.typography.fontWeight.medium
                                            }}>
                                                Uang tidak mencukupi. Kurang {formatPrice(selectedOrder.total_amount - parseFloat(cashAmount))}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // QRIS Payment Interface
                                <>
                                    {/* Total Amount */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: kebabTheme.spacing.lg,
                                        background: kebabTheme.colors.bgSecondary,
                                        borderRadius: kebabTheme.borderRadius.md,
                                        marginBottom: kebabTheme.spacing.xl
                                    }}>
                                        <span style={{
                                            fontSize: kebabTheme.typography.fontSize.lg,
                                            fontWeight: kebabTheme.typography.fontWeight.semibold,
                                            color: kebabTheme.colors.textPrimary
                                        }}>Total Pesanan</span>
                                        <span style={{
                                            fontSize: kebabTheme.typography.fontSize['2xl'],
                                            fontWeight: kebabTheme.typography.fontWeight.bold,
                                            color: kebabTheme.colors.primary
                                        }}>{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>

                                    {/* QR Code Placeholder */}
                                    <div style={{
                                        textAlign: 'center',
                                        padding: kebabTheme.spacing['3xl'],
                                        background: kebabTheme.colors.bgSecondary,
                                        borderRadius: kebabTheme.borderRadius.lg,
                                        marginBottom: kebabTheme.spacing.xl
                                    }}>
                                        <div style={{
                                            fontSize: '4rem',
                                            marginBottom: kebabTheme.spacing.md
                                        }}>📱</div>
                                        <h4 style={{
                                            margin: `0 0 ${kebabTheme.spacing.sm} 0`,
                                            color: kebabTheme.colors.textPrimary,
                                            fontSize: kebabTheme.typography.fontSize.lg,
                                            fontWeight: kebabTheme.typography.fontWeight.semibold
                                        }}>Scan QR Code</h4>
                                        <p style={{
                                            margin: 0,
                                            color: kebabTheme.colors.textSecondary,
                                            fontSize: kebabTheme.typography.fontSize.sm
                                        }}>Customer scan QR code untuk melakukan pembayaran</p>
                                    </div>

                                    {/* Payment Status */}
                                    <div style={{
                                        textAlign: 'center',
                                        marginBottom: kebabTheme.spacing.lg
                                    }}>
                                        <p style={{
                                            color: kebabTheme.colors.textSecondary,
                                            fontSize: kebabTheme.typography.fontSize.base,
                                            marginBottom: kebabTheme.spacing.md
                                        }}>Apakah customer sudah melakukan pembayaran?</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={ordersStyles.modalFooter}>
                            {selectedPaymentMethod === 'cash' ? (
                                <div style={{ display: 'flex', gap: kebabTheme.spacing.md }}>
                                    <button
                                        onClick={() => {
                                            setShowPaymentConfirm(false);
                                            setSelectedPaymentMethod(null);
                                            setCashAmount('');
                                        }}
                                        style={{
                                            ...ordersStyles.button,
                                            ...ordersStyles.buttonSecondary,
                                            flex: 1,
                                            padding: kebabTheme.spacing.md
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleConfirmPayment}
                                        disabled={!cashAmount || isNaN(parseFloat(cashAmount)) || parseFloat(cashAmount) < selectedOrder.total_amount}
                                        style={{
                                            ...ordersStyles.button,
                                            ...((!cashAmount || isNaN(parseFloat(cashAmount)) || parseFloat(cashAmount) < selectedOrder.total_amount)
                                                ? ordersStyles.buttonDisabled
                                                : ordersStyles.buttonPrimary),
                                            flex: 1,
                                            padding: kebabTheme.spacing.md
                                        }}
                                    >
                                        Konfirmasi Pembayaran
                                    </button>
                                </div>
                            ) : (
                                // QRIS Payment Buttons
                                <div style={{ display: 'flex', gap: kebabTheme.spacing.md }}>
                                    <button
                                        onClick={() => {
                                            setShowPaymentConfirm(false);
                                            setSelectedPaymentMethod(null);
                                        }}
                                        style={{
                                            ...ordersStyles.button,
                                            ...ordersStyles.buttonSecondary,
                                            flex: 1,
                                            padding: kebabTheme.spacing.md
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleConfirmPayment}
                                        style={{
                                            ...ordersStyles.button,
                                            ...ordersStyles.buttonPrimary,
                                            flex: 1,
                                            padding: kebabTheme.spacing.md
                                        }}
                                    >
                                        Sudah Bayar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;