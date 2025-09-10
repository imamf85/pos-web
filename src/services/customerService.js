import { supabase, handleSupabaseError, isSupabaseAvailable } from '../lib/supabase';
import { mockCustomers } from '../data/mockData';

const customerService = {
    async getCustomers() {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => resolve([...mockCustomers]), 300);
            });
        }

        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Supabase error, falling back to mock data:', error);
            return [...mockCustomers];
        }
    },

    async addCustomer(customerData) {
        if (!isSupabaseAvailable()) {
            // Fallback ke mock data
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newCustomer = {
                        id: Date.now(),
                        created_at: new Date().toISOString(),
                        ...customerData
                    };
                    mockCustomers.unshift(newCustomer);
                    resolve(newCustomer);
                }, 500);
            });
        }

        try {
            const { data, error } = await supabase
                .from('customers')
                .insert([{
                    name: customerData.name,
                    phone: customerData.phone || null,
                    email: customerData.email || null,
                    address: customerData.address || null
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async updateCustomer(id, customerData) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const index = mockCustomers.findIndex(c => c.id === id);
                    if (index !== -1) {
                        mockCustomers[index] = { ...mockCustomers[index], ...customerData };
                        resolve(mockCustomers[index]);
                    } else {
                        throw new Error('Customer not found');
                    }
                }, 300);
            });
        }

        try {
            const { data, error } = await supabase
                .from('customers')
                .update(customerData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async deleteCustomer(id) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const index = mockCustomers.findIndex(c => c.id === id);
                    if (index !== -1) {
                        mockCustomers.splice(index, 1);
                        resolve(true);
                    } else {
                        throw new Error('Customer not found');
                    }
                }, 300);
            });
        }

        try {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async searchCustomers(query) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const filtered = mockCustomers.filter(customer =>
                        customer.name.toLowerCase().includes(query.toLowerCase()) ||
                        (customer.phone && customer.phone.includes(query))
                    );
                    resolve(filtered);
                }, 200);
            });
        }

        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Supabase search error, falling back to mock data:', error);
            return mockCustomers.filter(customer =>
                customer.name.toLowerCase().includes(query.toLowerCase()) ||
                (customer.phone && customer.phone.includes(query))
            );
        }
    }
};

export default customerService;