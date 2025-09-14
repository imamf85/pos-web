import React, { useState, useEffect, Fragment } from 'react';
import { ShoppingCart, Search, Filter, DollarSign, Clock, CheckCircle, XCircle, Eye, X, Trash2, Printer } from 'lucide-react';
import orderService from '../services/orderService';
import bluetoothPrinter from '../services/bluetoothPrinter';
import receiptFormatter from '../services/receiptFormatter';
import useResponsive from '../hooks/useResponsive';
import { kebabTheme, commonStyles } from '../styles/kebabTheme';
import { useAuth } from '../contexts/FirebaseAuthContext';

const OrdersPage = () => {
    const { isMobile } = useResponsive();
    const { userProfile } = useAuth();
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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // New states for mobile-first design
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null);
    const [printerConnected, setPrinterConnected] = useState(false);
    const [connectingPrinter, setConnectingPrinter] = useState(false);
    const [printerDeviceName, setPrinterDeviceName] = useState('');
    const [isAutoReconnecting, setIsAutoReconnecting] = useState(false);

    const ordersStyles = {
        container: {
            padding: isMobile ? kebabTheme.spacing.md : kebabTheme.spacing.xl,
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
        },

        // Mobile-specific styles
        mobileOrderList: {
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.md
        },
        mobileOrderCard: {
            ...commonStyles.card,
            padding: kebabTheme.spacing.lg,
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.md
        },
        mobileOrderHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: kebabTheme.spacing.sm
        },
        orderNumber: {
            fontSize: kebabTheme.typography.fontSize.lg,
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.primary
        },
        orderDate: {
            fontSize: kebabTheme.typography.fontSize.sm,
            color: kebabTheme.colors.textSecondary
        },
        mobileOrderInfo: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: kebabTheme.spacing.md
        },
        customerName: {
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            color: kebabTheme.colors.textPrimary
        },
        orderAmount: {
            fontSize: kebabTheme.typography.fontSize.lg,
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.primary
        },
        mobileButtonGroup: {
            display: 'flex',
            gap: kebabTheme.spacing.sm,
            flexWrap: 'wrap'
        },
        statusButton: {
            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
            borderRadius: kebabTheme.borderRadius.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            border: 'none',
            cursor: 'pointer',
            transition: kebabTheme.transitions.base,
            minWidth: '80px',
            textAlign: 'center'
        },
        statusCompleted: {
            background: `${kebabTheme.colors.success}20`,
            color: kebabTheme.colors.success,
            border: `1px solid ${kebabTheme.colors.success}40`
        },
        statusPending: {
            background: `${kebabTheme.colors.warning}20`,
            color: kebabTheme.colors.warning,
            border: `1px solid ${kebabTheme.colors.warning}40`
        },
        statusPaid: {
            background: `${kebabTheme.colors.success}20`,
            color: kebabTheme.colors.success,
            border: `1px solid ${kebabTheme.colors.success}40`
        },
        statusUnpaid: {
            background: `${kebabTheme.colors.warning}20`,
            color: kebabTheme.colors.warning,
            border: `1px solid ${kebabTheme.colors.warning}40`
        },
        detailsButton: {
            background: `${kebabTheme.colors.primary}20`,
            color: kebabTheme.colors.primary,
            border: `1px solid ${kebabTheme.colors.primary}40`,
            padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
            borderRadius: kebabTheme.borderRadius.md,
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: kebabTheme.transitions.base,
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm
        },

        // Modal styles
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
            zIndex: 1000,
            padding: kebabTheme.spacing.md
        },
        modal: {
            backgroundColor: kebabTheme.colors.white,
            borderRadius: kebabTheme.borderRadius.lg,
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: kebabTheme.shadows.xl
        },
        modalHeader: {
            padding: kebabTheme.spacing.lg,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        modalTitle: {
            fontSize: kebabTheme.typography.fontSize.lg,
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.textPrimary,
            margin: 0
        },
        modalCloseButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: kebabTheme.colors.textSecondary,
            padding: kebabTheme.spacing.sm,
            borderRadius: kebabTheme.borderRadius.md,
            transition: kebabTheme.transitions.base
        },
        modalContent: {
            padding: kebabTheme.spacing.lg
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: kebabTheme.spacing.md,
            paddingBottom: kebabTheme.spacing.md,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`
        },
        detailLabel: {
            fontSize: kebabTheme.typography.fontSize.sm,
            color: kebabTheme.colors.textSecondary,
            fontWeight: kebabTheme.typography.fontWeight.medium
        },
        detailValue: {
            fontSize: kebabTheme.typography.fontSize.base,
            color: kebabTheme.colors.textPrimary,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            textAlign: 'right',
            flex: 1,
            marginLeft: kebabTheme.spacing.md
        },
        itemsList: {
            marginTop: kebabTheme.spacing.lg
        },
        itemsTitle: {
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.bold,
            color: kebabTheme.colors.textPrimary,
            marginBottom: kebabTheme.spacing.md
        },
        orderItem: {
            padding: kebabTheme.spacing.md,
            backgroundColor: kebabTheme.colors.bgSecondary + '40',
            borderRadius: kebabTheme.borderRadius.md,
            marginBottom: kebabTheme.spacing.sm
        },
        itemName: {
            fontSize: kebabTheme.typography.fontSize.base,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            color: kebabTheme.colors.textPrimary,
            marginBottom: kebabTheme.spacing.xs
        },
        itemDetails: {
            fontSize: kebabTheme.typography.fontSize.sm,
            color: kebabTheme.colors.textSecondary,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }
    };

    useEffect(() => {
        loadOrders();
        checkPrinterStatus();

        // Check printer status periodically
        const printerInterval = setInterval(checkPrinterStatus, 2000);

        return () => clearInterval(printerInterval);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, dateFilter]);

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

    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const stats = {
        total: filteredOrders.length,
        paid: filteredOrders.filter(o => o.payment_status === 'paid').length,
        unpaid: filteredOrders.filter(o => o.payment_status === 'pending').length,
        totalRevenue: filteredOrders
            .filter(o => o.payment_status === 'paid')
            .reduce((sum, o) => sum + o.total_amount, 0)
    };

    // Mobile-specific handlers
    const handleOrderStatusToggle = async (order) => {
        try {
            const newStatus = order.order_status === 'completed' ? 'pending' : 'completed';
            const success = await orderService.updateOrderStatus(order.id, newStatus);

            if (success) {
                setOrders(prevOrders =>
                    prevOrders.map(o =>
                        o.id === order.id
                            ? { ...o, order_status: newStatus }
                            : o
                    )
                );
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Gagal memperbarui status pesanan');
        }
    };

    const handlePaymentStatusToggle = async (order) => {
        try {
            const newStatus = order.payment_status === 'paid' ? 'pending' : 'paid';
            const success = await orderService.updatePaymentStatus(order.id, newStatus);

            if (success) {
                setOrders(prevOrders =>
                    prevOrders.map(o =>
                        o.id === order.id
                            ? { ...o, payment_status: newStatus }
                            : o
                    )
                );
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('Gagal memperbarui status pembayaran');
        }
    };

    const handleShowDetails = (order) => {
        setSelectedOrderDetails(order);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedOrderDetails(null);
    };

    // Check printer connection status
    const checkPrinterStatus = () => {
        try {
            const connectionInfo = bluetoothPrinter.getConnectionInfo();
            setPrinterConnected(connectionInfo.isConnected);
            setPrinterDeviceName(connectionInfo.deviceName);
            setIsAutoReconnecting(connectionInfo.reconnectAttempts > 0 && connectionInfo.reconnectAttempts < connectionInfo.maxReconnectAttempts);
        } catch (error) {
            console.error('Error checking printer status:', error);
        }
    };

    const handlePrintReceipt = async (order, type = 'customer') => {
        if (!printerConnected) {
            alert('Printer belum terhubung. Silakan hubungkan printer terlebih dahulu.');
            return;
        }

        try {
            const orderData = {
                ...order,
                customer_name: order.customers?.name || 'Walk-in Customer',
                cashier: userProfile?.name || 'Admin'
            };

            // Convert order_items to cart format for receipt formatter
            const cartItems = order.order_items?.map(item => ({
                productId: item.product_id,
                name: item.products?.name || 'Item',
                price: item.total_price,
                unitPrice: item.unit_price,
                quantity: item.quantity,
                options: item.options || {},
                notes: item.notes
            })) || [];

            let receiptText;
            if (type === 'kitchen') {
                receiptText = receiptFormatter.generateKitchenReceipt(orderData, cartItems);
            } else {
                const paymentMethod = order.payment_method || 'cash';
                const cashAmount = paymentMethod === 'cash' ? order.total_amount : 0;
                receiptText = receiptFormatter.generateCustomerReceipt(orderData, cartItems, paymentMethod, cashAmount);
            }

            await bluetoothPrinter.print(receiptText);
            alert(`Struk ${type === 'kitchen' ? 'dapur' : 'customer'} berhasil dicetak!`);
        } catch (error) {
            console.error('Error printing receipt:', error);
            alert('Gagal mencetak struk: ' + error.message);
        }
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
            {!isMobile && <div style={ordersStyles.statsGrid}>
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
            </div>}

            {/* Orders List - Mobile/Desktop Conditional */}
            {isMobile ? (
                // Mobile Card List View
                <div style={ordersStyles.mobileOrderList}>
                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: kebabTheme.spacing['3xl'],
                            background: kebabTheme.colors.white,
                            borderRadius: kebabTheme.borderRadius.lg,
                            boxShadow: kebabTheme.shadows.md
                        }}>
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
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: kebabTheme.spacing['3xl'],
                            background: kebabTheme.colors.white,
                            borderRadius: kebabTheme.borderRadius.lg,
                            boxShadow: kebabTheme.shadows.md,
                            color: kebabTheme.colors.textSecondary
                        }}>
                            Tidak ada pesanan ditemukan
                        </div>
                    ) : (
                        paginatedOrders.map(order => (
                            <div key={order.id} style={ordersStyles.mobileOrderCard}>
                                {/* Order Header */}
                                <div style={ordersStyles.mobileOrderHeader}>
                                    <div>
                                        <div style={ordersStyles.orderNumber}>
                                            {order.order_number || `ORD-${order.id}`}
                                        </div>
                                        <div style={ordersStyles.orderDate}>
                                            {formatDateTime(order.created_at)}
                                        </div>
                                    </div>
                                </div>

                                {/* Customer & Amount */}
                                <div style={ordersStyles.mobileOrderInfo}>
                                    <div style={ordersStyles.customerName}>
                                        {order.customers?.name || 'Walk-in Customer'}
                                    </div>
                                    <div style={ordersStyles.orderAmount}>
                                        {formatPrice(order.total_amount)}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={ordersStyles.mobileButtonGroup}>
                                    {/* Order Status Button */}
                                    <button
                                        style={{
                                            ...ordersStyles.statusButton,
                                            ...(order.order_status === 'completed'
                                                ? ordersStyles.statusCompleted
                                                : ordersStyles.statusPending)
                                        }}
                                        onClick={() => handleOrderStatusToggle(order)}
                                    >
                                        {order.order_status === 'completed' ? '✓ Selesai' : '⏳ Pending'}
                                    </button>

                                    {/* Payment Status Button */}
                                    <button
                                        style={{
                                            ...ordersStyles.statusButton,
                                            ...(order.payment_status === 'paid'
                                                ? ordersStyles.statusPaid
                                                : ordersStyles.statusUnpaid)
                                        }}
                                        onClick={() => {
                                            if (order.payment_status === 'pending' || order.payment_status === 'unpaid') {
                                                handlePayButtonClick(order);
                                            } else {
                                                handlePaymentStatusToggle(order);
                                            }
                                        }}
                                    >
                                        {order.payment_status === 'paid' ? '💰 Lunas' : '💸 Belum'}
                                    </button>

                                    {/* Details Button */}
                                    <button
                                        style={ordersStyles.detailsButton}
                                        onClick={() => handleShowDetails(order)}
                                    >
                                        <Eye size={16} />
                                        Detail
                                    </button>

                                    {/* Print Button */}
                                    <button
                                        style={{
                                            ...ordersStyles.detailsButton,
                                            background: `${kebabTheme.colors.info || '#3b82f6'}20`,
                                            color: kebabTheme.colors.info || '#3b82f6',
                                            border: `1px solid ${(kebabTheme.colors.info || '#3b82f6') + '40'}`
                                        }}
                                        onClick={() => {
                                            setSelectedPrintOrder(order);
                                            setShowPrintModal(true);
                                        }}
                                    >
                                        <Printer size={16} />
                                        Print
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        style={{
                                            ...ordersStyles.detailsButton,
                                            background: `${kebabTheme.colors.error}20`,
                                            color: kebabTheme.colors.error,
                                            border: `1px solid ${kebabTheme.colors.error}40`
                                        }}
                                        onClick={() => {
                                            setSelectedDeleteOrder(order);
                                            setShowDeleteConfirm(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Mobile Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: kebabTheme.spacing.sm,
                            padding: kebabTheme.spacing.lg,
                            marginTop: kebabTheme.spacing.md
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                                    border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                                    borderRadius: kebabTheme.borderRadius.md,
                                    background: currentPage === 1 ? kebabTheme.colors.bgSecondary : kebabTheme.colors.white,
                                    color: currentPage === 1 ? kebabTheme.colors.textSecondary : kebabTheme.colors.textPrimary,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: kebabTheme.transitions.base,
                                    fontSize: kebabTheme.typography.fontSize.sm,
                                    minWidth: '60px'
                                }}
                            >
                                ←
                            </button>

                            <div style={{
                                padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                                background: kebabTheme.colors.bgSecondary,
                                borderRadius: kebabTheme.borderRadius.md,
                                fontSize: kebabTheme.typography.fontSize.sm,
                                color: kebabTheme.colors.textPrimary,
                                fontWeight: kebabTheme.typography.fontWeight.medium,
                                minWidth: '80px',
                                textAlign: 'center'
                            }}>
                                {currentPage} / {totalPages}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                                    border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                                    borderRadius: kebabTheme.borderRadius.md,
                                    background: currentPage === totalPages ? kebabTheme.colors.bgSecondary : kebabTheme.colors.white,
                                    color: currentPage === totalPages ? kebabTheme.colors.textSecondary : kebabTheme.colors.textPrimary,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    transition: kebabTheme.transitions.base,
                                    fontSize: kebabTheme.typography.fontSize.sm,
                                    minWidth: '60px'
                                }}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Desktop Table View
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
                                    paginatedOrders.map(order => (
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: kebabTheme.spacing.lg,
                            borderTop: `1px solid ${kebabTheme.colors.bgSecondary}`
                        }}>
                            <div style={{
                                fontSize: kebabTheme.typography.fontSize.sm,
                                color: kebabTheme.colors.textSecondary
                            }}>
                                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} dari {filteredOrders.length} pesanan
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: kebabTheme.spacing.sm
                            }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                                        border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                                        borderRadius: kebabTheme.borderRadius.md,
                                        background: currentPage === 1 ? kebabTheme.colors.bgSecondary : kebabTheme.colors.white,
                                        color: currentPage === 1 ? kebabTheme.colors.textSecondary : kebabTheme.colors.textPrimary,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        transition: kebabTheme.transitions.base,
                                        fontSize: kebabTheme.typography.fontSize.sm
                                    }}
                                >
                                    Sebelumnya
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        if (totalPages <= 7) return true;
                                        if (page === 1 || page === totalPages) return true;
                                        if (Math.abs(page - currentPage) <= 1) return true;
                                        if (currentPage <= 3 && page <= 5) return true;
                                        if (currentPage >= totalPages - 2 && page >= totalPages - 4) return true;
                                        return false;
                                    })
                                    .map((page, index, array) => {
                                        const prevPage = array[index - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <Fragment key={page}>
                                                {showEllipsis && (
                                                    <span style={{
                                                        padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.xs}`,
                                                        color: kebabTheme.colors.textSecondary
                                                    }}>...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    style={{
                                                        padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                                                        minWidth: '40px',
                                                        border: `1px solid ${page === currentPage ? kebabTheme.colors.primary : kebabTheme.colors.bgSecondary}`,
                                                        borderRadius: kebabTheme.borderRadius.md,
                                                        background: page === currentPage ? kebabTheme.colors.primary : kebabTheme.colors.white,
                                                        color: page === currentPage ? kebabTheme.colors.white : kebabTheme.colors.textPrimary,
                                                        cursor: 'pointer',
                                                        transition: kebabTheme.transitions.base,
                                                        fontSize: kebabTheme.typography.fontSize.sm,
                                                        fontWeight: page === currentPage ? kebabTheme.typography.fontWeight.semibold : kebabTheme.typography.fontWeight.normal
                                                    }}
                                                >
                                                    {page}
                                                </button>
                                            </Fragment>
                                        );
                                    })
                                }

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: `${kebabTheme.spacing.sm} ${kebabTheme.spacing.md}`,
                                        border: `1px solid ${kebabTheme.colors.bgSecondary}`,
                                        borderRadius: kebabTheme.borderRadius.md,
                                        background: currentPage === totalPages ? kebabTheme.colors.bgSecondary : kebabTheme.colors.white,
                                        color: currentPage === totalPages ? kebabTheme.colors.textSecondary : kebabTheme.colors.textPrimary,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        transition: kebabTheme.transitions.base,
                                        fontSize: kebabTheme.typography.fontSize.sm
                                    }}
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                                        <img
                                            src='https://ocourlauakdvfyxcvlgq.supabase.co/storage/v1/object/public/albewok/QRMerchantBCA-14092025-130832.png'
                                            alt='albewok-qris'
                                            style={{
                                                maxWidth: '100%',
                                                width: '300px',
                                                height: 'auto',
                                                borderRadius: kebabTheme.borderRadius.md,
                                                display: 'block',
                                                margin: '0 auto'
                                            }}
                                        />
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

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrderDetails && (
                <div style={ordersStyles.modalOverlay} onClick={handleCloseDetailsModal}>
                    <div style={ordersStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={ordersStyles.modalHeader}>
                            <h3 style={ordersStyles.modalTitle}>
                                Detail Pesanan
                            </h3>
                            <button
                                onClick={handleCloseDetailsModal}
                                style={ordersStyles.modalCloseButton}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={ordersStyles.modalContent}>
                            {/* Order Information */}
                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>No. Pesanan</span>
                                <span style={ordersStyles.detailValue}>
                                    {selectedOrderDetails.order_number || `ORD-${selectedOrderDetails.id}`}
                                </span>
                            </div>

                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>Tanggal & Waktu</span>
                                <span style={ordersStyles.detailValue}>
                                    {formatDateTime(selectedOrderDetails.created_at)}
                                </span>
                            </div>

                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>Customer</span>
                                <span style={ordersStyles.detailValue}>
                                    {selectedOrderDetails.customers?.name || 'Walk-in Customer'}
                                </span>
                            </div>

                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>Metode Pembayaran</span>
                                <span style={ordersStyles.detailValue}>
                                    {selectedOrderDetails.payment_method === 'cash' ? 'Tunai' :
                                        selectedOrderDetails.payment_method === 'qris' ? 'QRIS' :
                                            selectedOrderDetails.payment_method || '-'}
                                </span>
                            </div>

                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>Status Pembayaran</span>
                                <span style={{
                                    ...ordersStyles.detailValue,
                                    color: selectedOrderDetails.payment_status === 'paid'
                                        ? kebabTheme.colors.success
                                        : kebabTheme.colors.warning,
                                    fontWeight: kebabTheme.typography.fontWeight.bold
                                }}>
                                    {selectedOrderDetails.payment_status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                                </span>
                            </div>

                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>Status Pesanan</span>
                                <span style={{
                                    ...ordersStyles.detailValue,
                                    color: selectedOrderDetails.order_status === 'completed'
                                        ? kebabTheme.colors.success
                                        : kebabTheme.colors.warning,
                                    fontWeight: kebabTheme.typography.fontWeight.bold
                                }}>
                                    {selectedOrderDetails.order_status === 'completed' ? 'Selesai' :
                                        selectedOrderDetails.order_status === 'pending' ? 'Menunggu' :
                                            selectedOrderDetails.order_status === 'preparing' ? 'Disiapkan' :
                                                selectedOrderDetails.order_status}
                                </span>
                            </div>

                            <div style={ordersStyles.detailRow}>
                                <span style={ordersStyles.detailLabel}>Total Biaya</span>
                                <span style={{
                                    ...ordersStyles.detailValue,
                                    color: kebabTheme.colors.primary,
                                    fontSize: kebabTheme.typography.fontSize.lg,
                                    fontWeight: kebabTheme.typography.fontWeight.bold
                                }}>
                                    {formatPrice(selectedOrderDetails.total_amount)}
                                </span>
                            </div>

                            {/* Order Items */}
                            {selectedOrderDetails.order_items && selectedOrderDetails.order_items.length > 0 && (
                                <div style={ordersStyles.itemsList}>
                                    <h4 style={ordersStyles.itemsTitle}>Item Pesanan:</h4>
                                    {selectedOrderDetails.order_items.map((item, index) => (
                                        <div key={index} style={ordersStyles.orderItem}>
                                            <div style={ordersStyles.itemName}>
                                                {item.products?.name || 'Item'}
                                            </div>
                                            <div style={ordersStyles.itemDetails}>
                                                <span>
                                                    {item.quantity}x @ {formatPrice(item.unit_price)}
                                                </span>
                                                <strong>{formatPrice(item.total_price)}</strong>
                                            </div>
                                            {item.notes && (
                                                <div style={{
                                                    fontSize: kebabTheme.typography.fontSize.sm,
                                                    color: kebabTheme.colors.textSecondary,
                                                    marginTop: kebabTheme.spacing.xs,
                                                    fontStyle: 'italic'
                                                }}>
                                                    Note: {item.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Order Notes */}
                            {selectedOrderDetails.notes && (
                                <div style={{
                                    marginTop: kebabTheme.spacing.lg,
                                    padding: kebabTheme.spacing.md,
                                    backgroundColor: kebabTheme.colors.bgSecondary + '40',
                                    borderRadius: kebabTheme.borderRadius.md
                                }}>
                                    <div style={{
                                        fontSize: kebabTheme.typography.fontSize.sm,
                                        color: kebabTheme.colors.textSecondary,
                                        fontWeight: kebabTheme.typography.fontWeight.medium,
                                        marginBottom: kebabTheme.spacing.sm
                                    }}>
                                        Catatan:
                                    </div>
                                    <div style={{
                                        fontSize: kebabTheme.typography.fontSize.base,
                                        color: kebabTheme.colors.textPrimary
                                    }}>
                                        {selectedOrderDetails.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Print Type Selection Modal */}
            {showPrintModal && selectedPrintOrder && (
                <div style={ordersStyles.modalOverlay} onClick={() => setShowPrintModal(false)}>
                    <div style={ordersStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={ordersStyles.modalHeader}>
                            <h3 style={ordersStyles.modalTitle}>Pilih Tipe Print</h3>
                            <button
                                onClick={() => setShowPrintModal(false)}
                                style={ordersStyles.modalCloseButton}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={ordersStyles.modalContent}>
                            <div style={{
                                padding: kebabTheme.spacing.lg,
                                background: kebabTheme.colors.bgSecondary,
                                borderRadius: kebabTheme.borderRadius.md,
                                marginBottom: kebabTheme.spacing.xl
                            }}>
                                <p style={{ margin: 0, marginBottom: kebabTheme.spacing.sm }}>
                                    <strong>Order:</strong> {selectedPrintOrder.order_number}
                                </p>
                                <p style={{ margin: 0, marginBottom: kebabTheme.spacing.sm }}>
                                    <strong>Customer:</strong> {selectedPrintOrder.customers?.name || 'Walk-in Customer'}
                                </p>
                                <p style={{ margin: 0, fontSize: kebabTheme.typography.fontSize.xl }}>
                                    <strong>Total:</strong> {formatPrice(selectedPrintOrder.total_amount)}
                                </p>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: kebabTheme.spacing.md
                            }}>
                                {/* Customer Print Option */}
                                <button
                                    onClick={async () => {
                                        await handlePrintReceipt(selectedPrintOrder, 'customer');
                                        setShowPrintModal(false);
                                    }}
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
                                    <span style={{ fontSize: '2rem' }}>🧾</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Print untuk Customer</div>
                                        <div style={{
                                            fontSize: kebabTheme.typography.fontSize.sm,
                                            color: kebabTheme.colors.textSecondary,
                                            fontWeight: kebabTheme.typography.fontWeight.normal
                                        }}>Struk dengan detail harga</div>
                                    </div>
                                </button>

                                <button
                                    onClick={async () => {
                                        await handlePrintReceipt(selectedPrintOrder, 'kitchen');
                                        setShowPrintModal(false);
                                    }}
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
                                        e.currentTarget.style.borderColor = kebabTheme.colors.secondary;
                                        e.currentTarget.style.background = `${kebabTheme.colors.secondary}10`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = kebabTheme.colors.bgSecondary;
                                        e.currentTarget.style.background = kebabTheme.colors.white;
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>👨‍🍳</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Print untuk Kitchen</div>
                                        <div style={{
                                            fontSize: kebabTheme.typography.fontSize.sm,
                                            color: kebabTheme.colors.textSecondary,
                                            fontWeight: kebabTheme.typography.fontWeight.normal
                                        }}>Hanya item pesanan</div>
                                    </div>
                                </button>
                            </div>

                            {/* Printer Status Section */}
                            <div style={{
                                marginTop: kebabTheme.spacing.xl,
                                padding: kebabTheme.spacing.lg,
                                background: kebabTheme.colors.bgSecondary,
                                borderRadius: kebabTheme.borderRadius.md
                            }}>
                                <h4 style={{
                                    margin: `0 0 ${kebabTheme.spacing.md} 0`,
                                    fontSize: kebabTheme.typography.fontSize.base,
                                    fontWeight: kebabTheme.typography.fontWeight.semibold,
                                    color: kebabTheme.colors.textPrimary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: kebabTheme.spacing.sm
                                }}>
                                    <Printer size={18} />
                                    Status Printer
                                </h4>

                                {!printerConnected ? (
                                    <div>
                                        {isAutoReconnecting && (
                                            <div style={{
                                                padding: kebabTheme.spacing.sm,
                                                background: `${kebabTheme.colors.warning}20`,
                                                borderRadius: kebabTheme.borderRadius.md,
                                                color: kebabTheme.colors.warning,
                                                fontSize: kebabTheme.typography.fontSize.sm,
                                                textAlign: 'center',
                                                marginBottom: kebabTheme.spacing.sm,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: kebabTheme.spacing.sm
                                            }}>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: `2px solid ${kebabTheme.colors.warning}`,
                                                    borderTopColor: 'transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }} />
                                                Menghubungkan ulang ke {printerDeviceName}...
                                            </div>
                                        )}
                                        <button
                                            onClick={async () => {
                                                setConnectingPrinter(true);
                                                try {
                                                    await bluetoothPrinter.connect();
                                                    checkPrinterStatus();
                                                    alert('Printer berhasil terhubung!');
                                                } catch (error) {
                                                    alert('Gagal menghubungkan printer: ' + error.message);
                                                } finally {
                                                    setConnectingPrinter(false);
                                                }
                                            }}
                                            disabled={connectingPrinter || isAutoReconnecting}
                                            style={{
                                                ...ordersStyles.button,
                                                ...ordersStyles.buttonSecondary,
                                                width: '100%',
                                                padding: kebabTheme.spacing.md,
                                                opacity: (connectingPrinter || isAutoReconnecting) ? 0.6 : 1,
                                                cursor: (connectingPrinter || isAutoReconnecting) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {connectingPrinter ? 'Menghubungkan...' :
                                                isAutoReconnecting ? 'Menghubungkan Ulang...' :
                                                    bluetoothPrinter.getSavedDeviceInfo() ? `Hubungkan ke ${printerDeviceName}` : 'Hubungkan Printer'}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: kebabTheme.spacing.sm,
                                        background: `${kebabTheme.colors.success}20`,
                                        borderRadius: kebabTheme.borderRadius.md,
                                        color: kebabTheme.colors.success,
                                        fontSize: kebabTheme.typography.fontSize.sm,
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: kebabTheme.spacing.sm
                                    }}>
                                        <span>✓</span>
                                        <div>
                                            <div>Printer Terhubung</div>
                                            <div style={{
                                                fontSize: kebabTheme.typography.fontSize.xs,
                                                opacity: 0.8
                                            }}>{printerDeviceName}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedDeleteOrder && (
                <div style={ordersStyles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
                    <div style={ordersStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={ordersStyles.modalHeader}>
                            <h3 style={ordersStyles.modalTitle}>Konfirmasi Hapus Pesanan</h3>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={ordersStyles.modalCloseButton}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={ordersStyles.modalContent}>
                            <div style={{
                                padding: kebabTheme.spacing.lg,
                                background: `${kebabTheme.colors.error}10`,
                                borderRadius: kebabTheme.borderRadius.md,
                                marginBottom: kebabTheme.spacing.xl,
                                border: `1px solid ${kebabTheme.colors.error}30`
                            }}>
                                <p style={{
                                    margin: 0,
                                    color: kebabTheme.colors.error,
                                    fontSize: kebabTheme.typography.fontSize.base,
                                    fontWeight: kebabTheme.typography.fontWeight.medium
                                }}>
                                    ⚠️ Perhatian: Tindakan ini tidak dapat dibatalkan!
                                </p>
                            </div>

                            <div style={{
                                marginBottom: kebabTheme.spacing.xl
                            }}>
                                <p style={{ marginBottom: kebabTheme.spacing.md }}>
                                    Apakah Anda yakin ingin menghapus pesanan berikut?
                                </p>
                                <div style={{
                                    padding: kebabTheme.spacing.md,
                                    background: kebabTheme.colors.bgSecondary,
                                    borderRadius: kebabTheme.borderRadius.md
                                }}>
                                    <p style={{ margin: 0, marginBottom: kebabTheme.spacing.sm }}>
                                        <strong>Order:</strong> {selectedDeleteOrder.order_number}
                                    </p>
                                    <p style={{ margin: 0, marginBottom: kebabTheme.spacing.sm }}>
                                        <strong>Customer:</strong> {selectedDeleteOrder.customers?.name || 'Walk-in Customer'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                        <strong>Total:</strong> {formatPrice(selectedDeleteOrder.total_amount)}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: kebabTheme.spacing.md
                            }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
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
                                    onClick={async () => {
                                        try {
                                            await orderService.deleteOrder(selectedDeleteOrder.id);
                                            alert('Pesanan berhasil dihapus!');
                                            setShowDeleteConfirm(false);
                                            loadOrders();
                                        } catch (error) {
                                            console.error('Error deleting order:', error);
                                            alert('Gagal menghapus pesanan: ' + error.message);
                                        }
                                    }}
                                    style={{
                                        ...ordersStyles.button,
                                        ...ordersStyles.buttonPrimary,
                                        background: kebabTheme.colors.error,
                                        flex: 1,
                                        padding: kebabTheme.spacing.md
                                    }}
                                >
                                    Hapus Pesanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animation for loading spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default OrdersPage;