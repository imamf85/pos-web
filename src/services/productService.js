import { supabase, handleSupabaseError, isSupabaseAvailable } from '../lib/supabase';
import { mockProducts } from '../data/mockData';

const productService = {
    async getProducts() {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockProducts);
                }, 300);
            });
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories!inner(name)
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const groupedProducts = data.map(product => {
                const categoryName = product.categories.name;
                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category_id: product.category_id,
                    category: categoryName
                }
            });

            return groupedProducts;
        } catch (error) {
            console.warn('Supabase error, falling back to mock data:', error);
            return mockProducts;
        }
    },

    async getProductsByCategory(categoryName) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockProducts[categoryName] || []);
                }, 200);
            });
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories!inner(name)
                `)
                .eq('categories.name', categoryName)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price
            }));
        } catch (error) {
            console.warn('Supabase error, falling back to mock data:', error);
            return mockProducts[categoryName] || [];
        }
    },

    async addProduct(productData) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newProduct = {
                        id: Date.now(),
                        ...productData,
                        created_at: new Date().toISOString()
                    };
                    resolve(newProduct);
                }, 500);
            });
        }

        try {
            // Get category ID
            const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('id')
                .eq('name', productData.category)
                .single();

            if (categoryError) throw categoryError;

            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: productData.name,
                    category_id: categoryData.id,
                    price: productData.price,
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async updateProduct(id, productData) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ id, ...productData });
                }, 300);
            });
        }

        try {
            const updateData = {
                name: productData.name,
                price: productData.price
            };

            if (productData.category) {
                // Get category ID if category is being updated
                const { data: categoryData, error: categoryError } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('name', productData.category)
                    .single();

                if (categoryError) throw categoryError;
                updateData.category_id = categoryData.id;
            }

            const { data, error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async deleteProduct(id) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(true), 300);
            });
        }

        try {

            const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            handleSupabaseError(error);
        }
    },

    async getCategories() {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(['kebab', 'burger', 'alacarte']);
                }, 200);
            });
        }

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('name')
                .order('name');

            if (error) throw error;
            return data.map(cat => cat.name);
        } catch (error) {
            console.warn('Supabase error, falling back to mock categories:', error);
            return ['kebab', 'burger', 'alacarte'];
        }
    },

    async getProductOptions(productId) {
        if (!isSupabaseAvailable()) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockOptions = {
                        spice_level: ['tidak pedas', 'sedang', 'pedas'],
                        meat_type: ['ayam', 'daging', 'mixed'],
                        size: ['small', 'regular', 'jumbo'],
                        topping: ['Keju', 'Extra Chicken', 'Extra Daging', 'Extra Lettuce', 'Extra Bombay', 'Extra Nanas']
                    };
                    resolve(mockOptions);
                }, 200);
            });
        }

        try {
            const { data, error } = await supabase
                .from('product_options')
                .select('*')
                .eq('product_category', productId)
                .order('option_value', { ascending: false });

            if (error) throw error;

            const groupedOptions = {};
            data.forEach(option => {
                if (!groupedOptions[option.option_type]) {
                    groupedOptions[option.option_type] = [];
                }
                groupedOptions[option.option_type].push({
                    value: option.option_value,
                    additionalPrice: option.additional_price || 0
                });
            });

            return groupedOptions;
        } catch (error) {
            console.warn('Supabase error, falling back to mock options:', error);
            // Return mock options as fallback
            return {
                spice_level: [
                    { value: 'tidak pedas', additionalPrice: 0 },
                    { value: 'sedang', additionalPrice: 0 },
                    { value: 'pedas', additionalPrice: 0 }
                ],
                meat_type: [
                    { value: 'ayam', additionalPrice: 0 },
                    { value: 'daging', additionalPrice: 0 },
                    { value: 'mixed', additionalPrice: 2000 }
                ],
                size: [
                    { value: 'small', additionalPrice: -3000 },
                    { value: 'regular', additionalPrice: 0 },
                    { value: 'jumbo', additionalPrice: 5000 }
                ],
                topping: [
                    { value: 'Keju', additionalPrice: 5000 },
                    { value: 'Extra Chicken', additionalPrice: 8000 },
                    { value: 'Extra Daging', additionalPrice: 10000 },
                    { value: 'Extra Lettuce', additionalPrice: 2000 },
                    { value: 'Extra Bombay', additionalPrice: 3000 },
                    { value: 'Extra Nanas', additionalPrice: 3000 }
                ]
            };
        }
    }
};

export default productService;