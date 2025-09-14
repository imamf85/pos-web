// Fixed orderService.js with proper error handling and data validation
import { supabase, supabaseService, handleSupabaseError, isSupabaseAvailable } from '../lib/supabase';

const sanitizeData = (obj, depth = 0, maxDepth = 10) => {
    // Prevent deep recursion
    if (depth > maxDepth) {
        console.warn('Max depth reached in sanitizeData');
        return '[Max Depth Reached]';
    }

    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeData(item, depth + 1, maxDepth));
    }

    // Handle Objects
    const sanitized = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
        // Skip functions and undefined values
        if (typeof obj[key] === 'function' || obj[key] === undefined) {
            continue;
        }

        // Skip React internal properties and circular references
        if (key.startsWith('_') || key.startsWith('$$')) {
            continue;
        }

        try {
            sanitized[key] = sanitizeData(obj[key], depth + 1, maxDepth);
        } catch (error) {
            console.warn(`Error sanitizing key ${key}:`, error);
            sanitized[key] = '[Error Sanitizing]';
        }
    }

    return sanitized;
};

const generateOrderNumber = async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format

    try {
        if (!isSupabaseAvailable()) {
            return `ORD-${dateStr}-${String(Date.now()).slice(-4)}`;
        }

        const client = supabaseService || supabase;

        // Get today's start and end timestamps
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: todayOrders, error } = await client
            .from('orders')
            .select('order_number')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
            .like('order_number', `ORD-${dateStr}-%`)
            .order('order_number', { ascending: false })
            .limit(1);

        if (error) {
            console.warn('Error fetching today orders for numbering:', error);
            return `ORD-${dateStr}-${String(Date.now()).slice(-4)}`;
        }

        let nextSequence = 1;

        if (todayOrders && todayOrders.length > 0) {
            // Extract sequence number from the latest order
            const latestOrderNumber = todayOrders[0].order_number;
            const sequencePart = latestOrderNumber.split('-')[2]; // Get the NNNN part

            if (sequencePart && !isNaN(sequencePart)) {
                nextSequence = parseInt(sequencePart) + 1;
            }
        }

        // Format sequence as 4-digit number with leading zeros
        const sequenceStr = String(nextSequence).padStart(4, '0');

        return `ORD-${dateStr}-${sequenceStr}`;

    } catch (error) {
        console.error('Error generating order number:', error);
        // Fallback to timestamp-based numbering
        return `ORD-${dateStr}-${String(Date.now()).slice(-4)}`;
    }
};

const orderService = {
    async createOrder(orderData) {
        if (!isSupabaseAvailable()) {
            return new Promise(async (resolve) => {
                setTimeout(async () => {
                    const orderNumber = await generateOrderNumber();
                    const mockOrder = {
                        id: Date.now(),
                        order_number: orderNumber,
                        ...orderData,
                        payment_status: orderData.payment_status || 'paid',
                        order_status: orderData.payment_status === 'pending' ? 'pending' : 'completed',
                        created_at: new Date().toISOString()
                    };
                    resolve(mockOrder);
                }, 500);
            });
        }

        try {
            const cleanOrderData = {
                customer_id: orderData.customer_id,
                user_id: orderData.user_id,
                total_amount: orderData.total_amount,
                payment_method: orderData.payment_method,
                payment_status: orderData.payment_status,
                order_status: orderData.order_status,
                notes: orderData.notes,
                items: orderData.items ? orderData.items.map(item => ({
                    product_id: item.product_id,
                    productId: item.productId, // Handle both naming conventions
                    quantity: item.quantity || 1,
                    unit_price: item.unit_price || item.price,
                    total_price: item.total_price || item.price,
                    options: item.options || {},
                    notes: item.notes || item.options?.specialNote || null
                })) : []
            };

            try {
                const safeData = JSON.parse(JSON.stringify(cleanOrderData));
                Object.assign(cleanOrderData, safeData);
            } catch (e) {
                console.error('Failed to stringify order data:', e);
                // Continue with cleanOrderData as is
            }

            console.log('Clean order data:', cleanOrderData);

            // Validate required fields
            if (!cleanOrderData.customer_id) {
                throw new Error('Customer ID is required');
            }

            if (cleanOrderData.user_id) {
                const userIdInt = parseInt(cleanOrderData.user_id);
                cleanOrderData.user_id = isNaN(userIdInt) ? null : userIdInt;
            } else {
                cleanOrderData.user_id = null;
            }

            // Validate and convert total_amount
            if (!cleanOrderData.total_amount || cleanOrderData.total_amount <= 0) {
                throw new Error('Valid total amount is required');
            }
            cleanOrderData.total_amount = Math.round(cleanOrderData.total_amount);

            // Validate items
            if (!Array.isArray(cleanOrderData.items) || cleanOrderData.items.length === 0) {
                throw new Error('Order items are required');
            }

            // Fix payment_status for 'unpaid' -> 'pending'
            if (cleanOrderData.payment_method === 'pending' || cleanOrderData.payment_method === 'unpaid') {
                cleanOrderData.payment_method = 'cash'; // Default payment method
                cleanOrderData.payment_status = 'pending';
            }

            // Validate payment_status
            const validPaymentStatuses = ['pending', 'paid', 'refunded'];
            if (!validPaymentStatuses.includes(cleanOrderData.payment_status)) {
                console.warn(`Invalid payment_status: ${cleanOrderData.payment_status}, defaulting to 'paid'`);
                cleanOrderData.payment_status = 'paid';
            }

            // Validate order_status
            const validOrderStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
            if (!validOrderStatuses.includes(cleanOrderData.order_status)) {
                console.warn(`Invalid order_status: ${cleanOrderData.order_status}, defaulting to 'completed'`);
                cleanOrderData.order_status = 'completed';
            }

            // Prepare order insert data (let database trigger generate order_number)
            const orderInsertData = {
                customer_id: cleanOrderData.customer_id,
                user_id: cleanOrderData.user_id,
                total_amount: cleanOrderData.total_amount,
                payment_method: cleanOrderData.payment_method || 'cash',
                payment_status: cleanOrderData.payment_status,
                order_status: cleanOrderData.order_status,
                notes: cleanOrderData.notes || null
            };

            const client = supabaseService || supabase;

            // Insert order
            const { data: order, error: orderError } = await client
                .from('orders')
                .insert([orderInsertData])
                .select('*, order_number')
                .single();

            if (orderError) {
                console.error('Order insert error:', orderError);
                throw new Error(`Failed to create order: ${orderError.message}`);
            }

            if (!order || !order.id) {
                throw new Error('Order created but no ID returned');
            }

            console.log('Order created:', order);

            // Prepare order items
            const orderItems = cleanOrderData.items.map((item, index) => {
                // Validate each item
                if (!item.product_id) {
                    throw new Error(`Item ${index + 1}: product_id is required`);
                }

                const quantity = parseInt(item.quantity) || 1;
                const unitPrice = Math.round(item.unit_price || item.price || 0);
                const totalPrice = Math.round(item.total_price || item.price || (unitPrice * quantity));

                if (quantity <= 0) {
                    throw new Error(`Item ${index + 1}: invalid quantity`);
                }
                if (unitPrice <= 0) {
                    throw new Error(`Item ${index + 1}: invalid unit_price`);
                }
                if (totalPrice <= 0) {
                    throw new Error(`Item ${index + 1}: invalid total_price`);
                }

                return {
                    order_id: order.id,
                    product_id: parseInt(item.product_id),
                    quantity: quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice,
                    options: item.options || {},
                    notes: item.notes || null
                };
            });

            console.log('Inserting order items:', orderItems);

            // Insert order items
            const { error: itemsError } = await client
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('Order items error:', itemsError);
                // Attempt to rollback
                try {
                    await client.from('orders').delete().eq('id', order.id);
                } catch (rollbackError) {
                    console.error('Rollback failed:', rollbackError);
                }
                throw new Error(`Failed to create order items: ${itemsError.message}`);
            }

            console.log('Order completed successfully');
            return order;

        } catch (error) {
            console.error('Error in createOrder:', error);
            // Re-throw with more context
            if (error.message) {
                throw error;
            } else {
                throw new Error('Unknown error occurred while creating order');
            }
        }
    },

    async getOrders(filters = {}) {
        if (!isSupabaseAvailable()) {
            return [];
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
            if (filters.payment_status) {
                // Handle 'unpaid' filter by converting to 'pending'
                const status = filters.payment_status === 'unpaid' ? 'pending' : filters.payment_status;
                query = query.eq('payment_status', status);
            }

            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching orders:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getOrders:', error);
            return [];
        }
    },

    async getOrderById(id) {
        if (!isSupabaseAvailable()) {
            return null;
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

            if (error) {
                console.error('Error fetching order:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getOrderById:', error);
            return null;
        }
    },

    async deleteOrder(orderId) {
        if (!isSupabaseAvailable()) {
            return true;
        }

        try {
            const { error: orderErr } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (orderErr) {
                console.error(`Failed to delete record on Orders table with id: ${orderId} and reason: ${orderErr}`);
                return false;
            }

            const { error: orderItemsErr } = await supabase
                .from('order_items')
                .delete()
                .eq('order_id', orderId);

            if (orderItemsErr) {
                console.error(`Failed to delete record on order_items table with order_id: ${orderId} and reason: ${orderItemsErr}`);
                return false;
            }

            return true;
        } catch (e) {
            console.error('Error in delete orders:', e);
            return false;
        }
    },

    async updateOrderStatus(id, status) {
        if (!isSupabaseAvailable()) {
            return true;
        }

        try {
            const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid status: ${status}`);
            }

            const { error } = await supabase
                .from('orders')
                .update({
                    order_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating order status:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            return false;
        }
    },

    async updatePaymentStatus(id, status, additionalData = {}) {
        if (!isSupabaseAvailable()) {
            return true;
        }

        try {
            const validStatuses = ['pending', 'paid', 'refunded'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid payment status: ${status}`);
            }

            const updateData = {
                payment_status: status,
                updated_at: new Date().toISOString(),
                ...additionalData
            };

            // If marking as paid, also update order status to completed
            if (status === 'paid' && !additionalData.order_status) {
                updateData.order_status = 'completed';
            }

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', id);

            if (error) {
                console.error('Error updating payment status:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updatePaymentStatus:', error);
            return false;
        }
    },

    async getDailySummary(date = new Date()) {
        if (!isSupabaseAvailable()) {
            return {
                total_orders: 0,
                total_revenue: 0,
                top_products: []
            };
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

            if (summaryError) {
                console.error('Error fetching daily summary:', summaryError);
                return {
                    total_orders: 0,
                    total_revenue: 0,
                    top_products: []
                };
            }

            const totalOrders = summaryData?.length || 0;
            const totalRevenue = summaryData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

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

            if (topProductsError) {
                console.error('Error fetching top products:', topProductsError);
                return {
                    total_orders: totalOrders,
                    total_revenue: totalRevenue,
                    top_products: []
                };
            }

            // Group and calculate top products
            const productSummary = (topProducts || []).reduce((acc, item) => {
                const productId = item.product_id;
                if (!acc[productId]) {
                    acc[productId] = {
                        name: item.products?.name || 'Unknown',
                        total_quantity: 0
                    };
                }
                acc[productId].total_quantity += (item.quantity || 0);
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
            console.error('Error in getDailySummary:', error);
            return {
                total_orders: 0,
                total_revenue: 0,
                top_products: []
            };
        }
    },

    async getTodayOrderCount() {
        try {
            if (!isSupabaseAvailable()) {
                return 0;
            }

            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const client = supabaseService || supabase;

            const { data, error } = await client
                .from('orders')
                .select('id', { count: 'exact' })
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .like('order_number', `ORD-${dateStr}-%`);

            if (error) {
                console.warn('Error getting today order count:', error);
                return 0;
            }

            return data?.length || 0;
        } catch (error) {
            console.error('Error in getTodayOrderCount:', error);
            return 0;
        }
    },

    // Get next order number (preview) without creating an order
    async getNextOrderNumber() {
        try {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

            if (!isSupabaseAvailable()) {
                return `ORD-${dateStr}-0001`;
            }

            const client = supabaseService || supabase;

            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const { data: todayOrders, error } = await client
                .from('orders')
                .select('order_number')
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .like('order_number', `ORD-${dateStr}-%`)
                .order('order_number', { ascending: false })
                .limit(1);

            if (error) {
                console.warn('Error getting next order number:', error);
                return `ORD-${dateStr}-0001`;
            }

            let nextSequence = 1;

            if (todayOrders && todayOrders.length > 0) {
                const latestOrderNumber = todayOrders[0].order_number;
                const sequencePart = latestOrderNumber.split('-')[2];

                if (sequencePart && !isNaN(sequencePart)) {
                    nextSequence = parseInt(sequencePart) + 1;
                }
            }

            const sequenceStr = String(nextSequence).padStart(4, '0');
            return `ORD-${dateStr}-${sequenceStr}`;
        } catch (error) {
            console.error('Error in getNextOrderNumber:', error);
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            return `ORD-${dateStr}-0001`;
        }
    }
};

export default orderService;