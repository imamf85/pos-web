// Mock data untuk demo
export const mockProducts = [
    // Kebab category
    { id: 1, name: 'Kebab Signature', price: 25000, category: 'kebab', image: '/api/placeholder/180/120' },
    { id: 2, name: 'Kebab Original', price: 20000, category: 'kebab', image: '/api/placeholder/180/120' },
    { id: 3, name: 'Kebab Cheesy', price: 23000, category: 'kebab', image: '/api/placeholder/180/120' },
    { id: 4, name: 'Kebab Mixed Sauces', price: 24000, category: 'kebab', image: '/api/placeholder/180/120' },
    
    // Burger category
    { id: 5, name: 'Burger Beef Klasik', price: 30000, category: 'burger', image: '/api/placeholder/180/120' },
    { id: 6, name: 'Burger Beef Premium', price: 35000, category: 'burger', image: '/api/placeholder/180/120' },
    { id: 7, name: 'Burger Chicken', price: 28000, category: 'burger', image: '/api/placeholder/180/120' },
    
    // Ala carte category
    { id: 8, name: 'Kentang Goreng', price: 15000, category: 'alacarte', image: '/api/placeholder/180/120' },
    { id: 9, name: 'Teh Arab', price: 8000, category: 'alacarte', image: '/api/placeholder/180/120' }
];

// Mock customers data (will be replaced with Supabase)
export const mockCustomers = [
    { id: 1, name: 'Ahmad Rizki', phone: '08123456789' },
    { id: 2, name: 'Sari Dewi', phone: '08198765432' },
    { id: 3, name: 'Budi Santoso', phone: '08555123456' },
    { id: 4, name: 'Maya Sari', phone: '08777654321' },
    { id: 5, name: 'Doni Prasetyo', phone: '08333999888' }
];

export const mockUser = {
    name: 'Ahmad Rizki',
    role: 'admin',
    branch: 'Cabang Malang Kota'
};