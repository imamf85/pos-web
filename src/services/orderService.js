import { supabase, handleSupabaseError, isSupabaseAvailable } from '../lib/supabase';

const orderService = {
    async createOrder(orderData) {
        if (!isSupabaseAvailable()) {
            // Mock implementation
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockOrder = {
                        id: Date.now(),
                        order_number: `ORD-${Date.now()}`,
                        ...orderData,
                        created_at: new Date().toISOString()
                    };
                    resolve(mockOrder);
                }, 500);
            });
        }

        try {
            // Start transaction
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    customer_id: orderData.customer_id,
                    user_id: orderData.user_id,
                    total_amount: orderData.total_amount,
                    payment_method: orderData.payment_method || 'cash',
                    payment_status: 'paid',
                    order_status: 'completed',
                    notes: orderData.notes
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                options: item.options || {},
                notes: item.notes
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            return order;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async getOrders(filters = {}) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => resolve([]), 300);
            });
        }

        try {
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    customers(name, phone),
                    users(name),
                    order_items(
                        *,
                        products(name)
                    )
                `)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.date_from) {
                query = query.gte('created_at', filters.date_from);
            }
            if (filters.date_to) {
                query = query.lte('created_at', filters.date_to);
            }
            if (filters.customer_id) {
                query = query.eq('customer_id', filters.customer_id);
            }
            if (filters.status) {
                query = query.eq('order_status', filters.status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async getOrderById(id) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(null), 300);
            });
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    customers(name, phone, address),
                    users(name),
                    order_items(
                        *,
                        products(name)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async updateOrderStatus(id, status) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(true), 300);
            });
        }

        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: status })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async getDailySummary(date = new Date()) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => resolve({
                    total_orders: 0,
                    total_revenue: 0,
                    top_products: []
                }), 300);
            });
        }

        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Get total orders and revenue
            const { data: summaryData, error: summaryError } = await supabase
                .from('orders')
                .select('total_amount')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .eq('payment_status', 'paid');

            if (summaryError) throw summaryError;

            const totalOrders = summaryData.length;
            const totalRevenue = summaryData.reduce((sum, order) => sum + order.total_amount, 0);

            // Get top products
            const { data: topProducts, error: topProductsError } = await supabase
                .from('order_items')
                .select(`
                    product_id,
                    quantity,
                    products(name),
                    orders!inner(created_at, payment_status)
                `)
                .gte('orders.created_at', startOfDay.toISOString())
                .lte('orders.created_at', endOfDay.toISOString())
                .eq('orders.payment_status', 'paid');

            if (topProductsError) throw topProductsError;

            // Group and calculate top products
            const productSummary = topProducts.reduce((acc, item) => {
                const productId = item.product_id;
                if (!acc[productId]) {
                    acc[productId] = {
                        name: item.products.name,
                        total_quantity: 0
                    };
                }
                acc[productId].total_quantity += item.quantity;
                return acc;
            }, {});

            const topProductsList = Object.values(productSummary)
                .sort((a, b) => b.total_quantity - a.total_quantity)
                .slice(0, 5);

            return {
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                top_products: topProductsList
            };
        } catch (error) {
            handleSupabaseError(error);
        }
    }
};

export default orderService;