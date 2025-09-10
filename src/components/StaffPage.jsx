import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX } from 'lucide-react';
import { kebabTheme, commonStyles, mergeStyles } from '../styles/kebabTheme';
import { supabase, supabaseService, isSupabaseAvailable } from '../lib/supabase';
import { useAuth } from '../contexts/FirebaseAuthContext';

const StaffPage = () => {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'staff',
        branch: '',
        is_active: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Check if user is admin
    if (userProfile?.role !== 'admin') {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: kebabTheme.colors.gradientBackground,
                padding: kebabTheme.spacing.xl
            }}>
                <div style={{
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    padding: kebabTheme.spacing['3xl'],
                    borderRadius: kebabTheme.borderRadius['2xl'],
                    boxShadow: kebabTheme.shadows['2xl'],
                    border: `1px solid ${kebabTheme.colors.bgSecondary}`
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: kebabTheme.colors.error + '20',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '32px'
                    }}>
                        🚫
                    </div>
                    <h2 style={{
                        fontSize: kebabTheme.typography.fontSize['2xl'],
                        fontWeight: kebabTheme.typography.fontWeight.bold,
                        color: kebabTheme.colors.error,
                        marginBottom: kebabTheme.spacing.lg
                    }}>
                        Akses Ditolak
                    </h2>
                    <p style={{
                        color: kebabTheme.colors.textSecondary,
                        marginBottom: kebabTheme.spacing.sm
                    }}>
                        Halaman Manajemen Staff hanya dapat diakses oleh Admin.
                    </p>
                    <p style={{
                        fontSize: kebabTheme.typography.fontSize.sm,
                        color: kebabTheme.colors.textPrimary
                    }}>
                        Role Anda: {userProfile?.role || 'Tidak diketahui'}
                    </p>
                </div>
            </div>
        );
    }

    const fetchUsers = async () => {
        if (!isSupabaseAvailable()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const client = supabaseService || supabase;
            const { data, error } = await client
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching users:', error);
                throw new Error(`Failed to fetch users: ${error.message}`);
            }

            setUsers(data || []);
        } catch (error) {
            console.error('Error in fetchUsers:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setCurrentUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'staff',
            branch: '',
            is_active: true
        });
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'staff',
            branch: user.branch || '',
            is_active: user.is_active
        });
        setShowModal(true);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${userName}"?`)) {
            return;
        }

        if (!isSupabaseAvailable()) {
            alert('Database tidak tersedia');
            return;
        }

        try {
            const client = supabaseService || supabase;
            const { error } = await client
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('Error deleting user:', error);
                throw new Error(`Failed to delete user: ${error.message}`);
            }

            alert('User berhasil dihapus');
            fetchUsers();
        } catch (error) {
            console.error('Error in handleDeleteUser:', error);
            alert(error.message);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        if (!isSupabaseAvailable()) {
            alert('Database tidak tersedia');
            return;
        }

        try {
            const client = supabaseService || supabase;
            const { error } = await client
                .from('users')
                .update({ is_active: !currentStatus })
                .eq('id', userId);

            if (error) {
                console.error('Error updating user status:', error);
                throw new Error(`Failed to update user status: ${error.message}`);
            }

            fetchUsers();
        } catch (error) {
            console.error('Error in handleToggleActive:', error);
            alert(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Nama harus diisi');
            return;
        }

        if (!isSupabaseAvailable()) {
            alert('Database tidak tersedia');
            return;
        }

        try {
            const client = supabaseService || supabase;
            
            if (currentUser) {
                const { error } = await client
                    .from('users')
                    .update({
                        name: formData.name,
                        email: formData.email || null,
                        role: formData.role,
                        branch: formData.branch || null,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentUser.id);

                if (error) {
                    console.error('Error updating user:', error);
                    throw new Error(`Failed to update user: ${error.message}`);
                }

                alert('User berhasil diupdate');
            } else {
                const { error } = await client
                    .from('users')
                    .insert([{
                        name: formData.name,
                        email: formData.email || null,
                        role: formData.role,
                        branch: formData.branch || null,
                        is_active: formData.is_active
                    }]);

                if (error) {
                    console.error('Error creating user:', error);
                    throw new Error(`Failed to create user: ${error.message}`);
                }

                alert('User berhasil ditambahkan');
            }

            setShowModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            alert(error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.branch?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: {
            flex: 1,
            padding: kebabTheme.spacing.xl,
            background: kebabTheme.colors.gradientBackground,
            minHeight: '100vh'
        },
        header: {
            marginBottom: kebabTheme.spacing['2xl']
        },
        title: {
            ...commonStyles.heading.h2,
            marginBottom: kebabTheme.spacing.lg
        },
        controls: {
            display: 'flex',
            gap: kebabTheme.spacing.lg,
            marginBottom: kebabTheme.spacing.xl,
            flexWrap: 'wrap',
            alignItems: 'center'
        },
        searchContainer: {
            position: 'relative',
            flex: '1',
            minWidth: '200px'
        },
        searchInput: {
            ...commonStyles.input,
            paddingLeft: '40px'
        },
        searchIcon: {
            position: 'absolute',
            left: kebabTheme.spacing.md,
            top: '50%',
            transform: 'translateY(-50%)',
            color: kebabTheme.colors.textSecondary
        },
        addButton: {
            ...commonStyles.button.base,
            ...commonStyles.button.primary
        },
        card: {
            ...commonStyles.card,
            padding: 0,
            overflow: 'hidden'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            padding: kebabTheme.spacing.lg,
            textAlign: 'left',
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`,
            backgroundColor: kebabTheme.colors.bgPrimary,
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.semibold,
            color: kebabTheme.colors.textPrimary
        },
        td: {
            padding: kebabTheme.spacing.lg,
            borderBottom: `1px solid ${kebabTheme.colors.bgSecondary}`,
            fontSize: kebabTheme.typography.fontSize.sm
        },
        actions: {
            display: 'flex',
            gap: kebabTheme.spacing.sm
        },
        actionButton: {
            padding: kebabTheme.spacing.sm,
            borderRadius: kebabTheme.borderRadius.md,
            border: 'none',
            cursor: 'pointer',
            transition: kebabTheme.transitions.base,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        editButton: {
            backgroundColor: kebabTheme.colors.info + '20',
            color: kebabTheme.colors.info
        },
        deleteButton: {
            backgroundColor: kebabTheme.colors.error + '20',
            color: kebabTheme.colors.error
        },
        toggleButton: {
            backgroundColor: kebabTheme.colors.success + '20',
            color: kebabTheme.colors.success
        },
        badge: {
            padding: `${kebabTheme.spacing.xs} ${kebabTheme.spacing.sm}`,
            borderRadius: kebabTheme.borderRadius.full,
            fontSize: kebabTheme.typography.fontSize.xs,
            fontWeight: kebabTheme.typography.fontWeight.medium
        },
        roleBadge: {
            admin: {
                backgroundColor: kebabTheme.colors.error + '20',
                color: kebabTheme.colors.error
            },
            staff: {
                backgroundColor: kebabTheme.colors.info + '20',
                color: kebabTheme.colors.info
            },
            cashier: {
                backgroundColor: kebabTheme.colors.warning + '20',
                color: kebabTheme.colors.warning
            }
        },
        statusBadge: {
            active: {
                backgroundColor: kebabTheme.colors.success + '20',
                color: kebabTheme.colors.success
            },
            inactive: {
                backgroundColor: kebabTheme.colors.error + '20',
                color: kebabTheme.colors.error
            }
        },
        modal: {
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
            padding: kebabTheme.spacing.lg
        },
        modalContent: {
            ...commonStyles.card,
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
        },
        modalHeader: {
            marginBottom: kebabTheme.spacing.xl
        },
        modalTitle: {
            ...commonStyles.heading.h3,
            marginBottom: kebabTheme.spacing.sm
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.lg
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: kebabTheme.spacing.sm
        },
        label: {
            fontSize: kebabTheme.typography.fontSize.sm,
            fontWeight: kebabTheme.typography.fontWeight.medium,
            color: kebabTheme.colors.textPrimary
        },
        select: {
            ...commonStyles.input,
            cursor: 'pointer'
        },
        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: kebabTheme.spacing.sm
        },
        modalActions: {
            display: 'flex',
            gap: kebabTheme.spacing.lg,
            marginTop: kebabTheme.spacing.xl,
            justifyContent: 'flex-end'
        },
        cancelButton: {
            ...commonStyles.button.base,
            ...commonStyles.button.secondary
        },
        submitButton: {
            ...commonStyles.button.base,
            ...commonStyles.button.primary
        },
        loading: {
            textAlign: 'center',
            padding: kebabTheme.spacing['3xl'],
            color: kebabTheme.colors.textSecondary
        },
        emptyState: {
            textAlign: 'center',
            padding: kebabTheme.spacing['3xl'],
            color: kebabTheme.colors.textSecondary
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Manajemen Staff</h2>
                
                <div style={styles.controls}>
                    <div style={styles.searchContainer}>
                        <Search size={16} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <button 
                        onClick={handleAddUser}
                        style={styles.addButton}
                    >
                        <Plus size={16} />
                        Tambah User
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                {loading ? (
                    <div style={styles.loading}>Loading...</div>
                ) : filteredUsers.length === 0 ? (
                    <div style={styles.emptyState}>
                        {searchTerm ? 'Tidak ada user yang sesuai dengan pencarian' : 'Belum ada user'}
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Nama</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Role</th>
                                <th style={styles.th}>Cabang</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: kebabTheme.typography.fontWeight.medium }}>
                                            {user.name}
                                        </div>
                                        <div style={{ 
                                            fontSize: kebabTheme.typography.fontSize.xs,
                                            color: kebabTheme.colors.textSecondary,
                                            marginTop: '2px'
                                        }}>
                                            ID: {user.id}
                                        </div>
                                    </td>
                                    <td style={styles.td}>{user.email || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            ...styles.roleBadge[user.role] || styles.roleBadge.staff
                                        }}>
                                            {user.role || 'staff'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{user.branch || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            ...styles.statusBadge[user.is_active ? 'active' : 'inactive']
                                        }}>
                                            {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                style={{
                                                    ...styles.actionButton,
                                                    ...styles.editButton
                                                }}
                                                title="Edit user"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(user.id, user.is_active)}
                                                style={{
                                                    ...styles.actionButton,
                                                    ...styles.toggleButton
                                                }}
                                                title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            >
                                                {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                                style={{
                                                    ...styles.actionButton,
                                                    ...styles.deleteButton
                                                }}
                                                title="Hapus user"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div style={styles.modal} onClick={(e) => {
                    if (e.target === e.currentTarget) setShowModal(false);
                }}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {currentUser ? 'Edit User' : 'Tambah User'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nama *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={commonStyles.input}
                                    placeholder="Masukkan nama"
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={commonStyles.input}
                                    placeholder="Masukkan email (opsional)"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={styles.select}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Cabang</label>
                                <input
                                    type="text"
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    style={commonStyles.input}
                                    placeholder="Masukkan nama cabang (opsional)"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span style={styles.label}>User Aktif</span>
                                </label>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={styles.cancelButton}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                >
                                    {currentUser ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;