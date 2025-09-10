import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ChevronDown } from 'lucide-react';

const CustomerSelector = ({ selectedCustomer, onCustomerSelect, customerService, styles }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers);
        }
    }, [searchQuery, customers]);

    const loadCustomers = async () => {
        try {
            const data = await customerService.getCustomers();
            setCustomers(data);
            setFilteredCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim()) return;

        setIsLoading(true);
        try {
            const newCustomer = await customerService.addCustomer({
                name: newCustomerName.trim()
            });

            setCustomers(prev => [newCustomer, ...prev]);
            onCustomerSelect(newCustomer);
            setNewCustomerName('');
            setShowAddForm(false);
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding customer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomerSelect = (customer) => {
        onCustomerSelect(customer);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div style={styles.customerDropdown}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.customerButton}
            >
                <span style={{ color: selectedCustomer ? '#111827' : '#6b7280' }}>
                    {selectedCustomer ? selectedCustomer.name : 'Pilih Customer'}
                </span>
                <ChevronDown size={20} style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </button>

            {isOpen && (
                <div style={styles.customerDropdownMenu}>
                    <div style={styles.customerSearch}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }} />
                            <input
                                type="text"
                                placeholder="Cari customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.customerSearchInput}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e5e5' }}>
                        <button
                            onClick={() => setShowAddForm(true)}
                            style={{
                                ...styles.customerItem,
                                color: '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <UserPlus size={16} />
                            <span>Tambah Customer Baru</span>
                        </button>
                    </div>

                    <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleCustomerSelect(customer)}
                                    style={{
                                        ...styles.customerItem,
                                        ':hover': { backgroundColor: '#f9fafb' }
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ fontWeight: '500', color: '#111827' }}>{customer.name}</div>
                                    {customer.phone && (
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{customer.phone}</div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div style={{
                                padding: '1rem',
                                textAlign: 'center',
                                color: '#6b7280',
                                fontSize: '0.875rem'
                            }}>
                                {searchQuery ? 'Customer tidak ditemukan' : 'Belum ada customer'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAddForm && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modal, maxWidth: '24rem' }}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Tambah Customer Baru</h3>
                        </div>
                        <div style={styles.modalContent}>
                            <label style={styles.label}>Nama Customer</label>
                            <input
                                type="text"
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                style={styles.input}
                                placeholder="Masukkan nama customer"
                                autoFocus
                            />
                        </div>
                        <div style={{
                            ...styles.modalFooter,
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewCustomerName('');
                                }}
                                style={{
                                    ...styles.button,
                                    ...styles.buttonSecondary,
                                    flex: 1
                                }}
                                disabled={isLoading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddCustomer}
                                disabled={!newCustomerName.trim() || isLoading}
                                style={{
                                    ...styles.button,
                                    ...((!newCustomerName.trim() || isLoading) ? styles.buttonDisabled : styles.buttonPrimary),
                                    flex: 1
                                }}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSelector;