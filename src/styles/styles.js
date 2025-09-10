const styles = {
    // Layout
    appContainer: {
        height: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100%',
        overflow: 'hidden'
    },
    flexOne: {
        flex: 1
    },
    overflowHidden: {
        overflow: 'hidden'
    },
    overflowYAuto: {
        overflowY: 'auto'
    },
    flexCol: {
        display: 'flex',
        flexDirection: 'column'
    },
    flexRow: {
        display: 'flex',
        flexDirection: 'row'
    },
    itemsCenter: {
        alignItems: 'center'
    },
    justifyBetween: {
        justifyContent: 'space-between'
    },
    justifyCenter: {
        justifyContent: 'center'
    },
    justifyAround: {
        justifyContent: 'space-around'
    },
    gap2: {
        gap: '0.5rem'
    },
    gap3: {
        gap: '0.75rem'
    },
    gap4: {
        gap: '1rem'
    },

    // Header
    header: {
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '0.75rem 1rem'
    },
    headerTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        margin: 0
    },
    headerSubtitle: {
        fontSize: '0.875rem',
        opacity: 0.9,
        margin: 0
    },
    headerUser: {
        fontSize: '0.875rem'
    },

    // Navigation
    navigation: {
        backgroundColor: 'white',
        borderTop: '1px solid #e5e5e5',
        padding: '0.25rem 0.5rem'
    },
    navButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.5rem',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '0.5rem',
        minWidth: '0',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    navButtonActive: {
        backgroundColor: '#fee2e2',
        color: '#dc2626'
    },
    navButtonInactive: {
        color: '#6b7280'
    },
    navLabel: {
        fontSize: '0.75rem',
        marginTop: '0.25rem'
    },

    // Common Elements
    container: {
        backgroundColor: 'white',
        padding: '1rem',
        borderBottom: '1px solid #e5e5e5'
    },
    card: {
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e5e5'
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '1rem'
    },
    button: {
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    buttonPrimary: {
        backgroundColor: '#dc2626',
        color: 'white'
    },
    buttonSecondary: {
        backgroundColor: '#e5e7eb',
        color: '#374151'
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
        color: 'white',
        cursor: 'not-allowed'
    },

    // Customer Selector
    customerDropdown: {
        position: 'relative'
    },
    customerButton: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'left',
        cursor: 'pointer'
    },
    customerDropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '0.25rem',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        maxHeight: '320px',
        overflow: 'hidden'
    },
    customerSearch: {
        padding: '0.75rem',
        borderBottom: '1px solid #e5e5e5'
    },
    customerSearchInput: {
        width: '100%',
        paddingLeft: '2.25rem',
        paddingRight: '1rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '0.875rem'
    },
    customerItem: {
        width: '100%',
        padding: '0.75rem',
        textAlign: 'left',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        borderBottom: '1px solid #f3f4f6'
    },

    // POS Specific
    orderInfo: {
        backgroundColor: 'white',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e5e5'
    },
    orderNumber: {
        fontSize: '0.75rem',
        color: '#6b7280',
        margin: 0
    },
    orderNumberValue: {
        fontSize: '1.125rem',
        fontWeight: 'bold',
        margin: 0
    },
    categoryTabs: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e5e5'
    },
    categoryTab: {
        flex: 1,
        padding: '0.75rem 0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer'
    },
    categoryTabActive: {
        backgroundColor: '#dc2626',
        color: 'white'
    },
    categoryTabInactive: {
        backgroundColor: '#f3f4f6',
        color: '#374151'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        padding: '0.75rem 1rem'
    },
    productCard: {
        backgroundColor: 'white',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e5e5',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color 0.2s'
    },
    productName: {
        fontWeight: '600',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        margin: 0
    },
    productPrice: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        margin: 0
    },

    // Cart
    cartSidebar: {
        width: '320px',
        backgroundColor: '#f9fafb',
        borderLeft: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column'
    },
    cartHeader: {
        padding: '1rem',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: 'white'
    },
    cartItems: {
        flex: 1,
        overflowY: 'auto',
        padding: '1rem'
    },
    cartItem: {
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        marginBottom: '0.75rem'
    },
    cartItemName: {
        fontWeight: '500',
        fontSize: '0.875rem',
        margin: 0
    },
    cartItemOptions: {
        fontSize: '0.75rem',
        color: '#6b7280',
        marginBottom: '0.5rem'
    },
    cartTotal: {
        padding: '1rem',
        borderTop: '1px solid #e5e5e5',
        backgroundColor: 'white'
    },

    // Mobile Cart
    mobileCartButton: {
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        width: '100%'
    },
    mobileCartOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column'
    },

    // Modal
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
        padding: '1rem',
        zIndex: 50
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '448px',
        maxHeight: '90vh',
        overflowY: 'auto'
    },
    modalMobile: {
        borderRadius: '0.75rem 0.75rem 0 0',
        alignSelf: 'flex-end',
        maxHeight: '90vh'
    },
    modalHeader: {
        padding: '1rem',
        borderBottom: '1px solid #e5e5e5',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white'
    },
    modalTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        margin: 0
    },
    modalCloseButton: {
        border: 'none',
        backgroundColor: 'transparent',
        color: '#6b7280',
        fontSize: '1.5rem',
        padding: '0.25rem',
        cursor: 'pointer'
    },
    modalContent: {
        padding: '1rem'
    },
    modalFooter: {
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e5e5',
        padding: '1rem'
    },

    // Form Elements
    formGroup: {
        marginBottom: '1rem'
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginBottom: '0.75rem'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem'
    },
    optionsGridTwo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.5rem'
    },
    optionButton: {
        padding: '0.75rem',
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        textTransform: 'capitalize'
    },
    optionButtonActive: {
        backgroundColor: '#dc2626',
        color: 'white'
    },
    optionButtonInactive: {
        backgroundColor: '#f3f4f6',
        color: '#374151'
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        resize: 'none'
    },

    // Quantity Controls
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
    },
    quantityButton: {
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        border: 'none',
        cursor: 'pointer'
    },
    quantityButtonActive: {
        backgroundColor: '#dc2626',
        color: 'white'
    },
    quantityValue: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        width: '3rem',
        textAlign: 'center'
    },

    // Price Display
    totalPrice: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '1.125rem',
        fontWeight: '600'
    },
    totalPriceValue: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#dc2626'
    },

    // Payment
    paymentMethods: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem'
    },
    paymentMethod: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '2px solid #d1d5db',
        backgroundColor: 'transparent',
        cursor: 'pointer'
    },
    paymentMethodActive: {
        borderColor: '#dc2626',
        backgroundColor: '#fee2e2'
    },

    // Responsive helpers
    hiddenMobile: {
        display: 'none'
    },
    hiddenDesktop: {
        display: 'block'
    },

    // Media queries will be applied programmatically
    '@media (min-width: 640px)': {
        hiddenMobile: {
            display: 'block'
        },
        hiddenDesktop: {
            display: 'none'
        },
        productsGrid: {
            gridTemplateColumns: 'repeat(3, 1fr)'
        }
    }
};

export default styles;