// Bluetooth Printer Service for Thermal Printers
class BluetoothPrinterService {
    constructor() {
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        
        // Common UUIDs for thermal printers
        this.SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
        this.CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';
        
        // Storage keys for persistent connection
        this.STORAGE_KEY = 'bluetooth_printer_device';
        this.CONNECTION_STATUS_KEY = 'bluetooth_printer_connected';
        
        // Auto-reconnect settings
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectInterval = null;
        
        // Initialize auto-reconnect on page load
        this.initializeAutoReconnect();
    }

    // Check if Web Bluetooth is supported
    isSupported() {
        return navigator.bluetooth !== undefined;
    }

    // Save device info to localStorage
    saveDeviceInfo(device) {
        try {
            const deviceInfo = {
                id: device.id,
                name: device.name,
                timestamp: Date.now()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(deviceInfo));
            localStorage.setItem(this.CONNECTION_STATUS_KEY, 'true');
            console.log('Device info saved:', deviceInfo);
        } catch (error) {
            console.warn('Failed to save device info:', error);
        }
    }

    // Get saved device info from localStorage
    getSavedDeviceInfo() {
        try {
            const deviceInfo = localStorage.getItem(this.STORAGE_KEY);
            return deviceInfo ? JSON.parse(deviceInfo) : null;
        } catch (error) {
            console.warn('Failed to get saved device info:', error);
            return null;
        }
    }

    // Check if should auto-reconnect
    shouldAutoReconnect() {
        try {
            const connected = localStorage.getItem(this.CONNECTION_STATUS_KEY);
            const deviceInfo = this.getSavedDeviceInfo();
            return connected === 'true' && deviceInfo && deviceInfo.id;
        } catch (error) {
            return false;
        }
    }

    // Clear saved device info
    clearSavedDeviceInfo() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.CONNECTION_STATUS_KEY);
        } catch (error) {
            console.warn('Failed to clear device info:', error);
        }
    }

    // Initialize auto-reconnect functionality
    async initializeAutoReconnect() {
        if (!this.isSupported()) {
            return;
        }

        // Wait a bit for the page to fully load
        setTimeout(async () => {
            if (this.shouldAutoReconnect()) {
                console.log('Attempting to auto-reconnect to saved printer...');
                await this.attemptReconnect();
            }
        }, 1000);
    }

    // Attempt to reconnect to saved device
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return false;
        }

        try {
            const savedDevice = this.getSavedDeviceInfo();
            if (!savedDevice || !savedDevice.id) {
                return false;
            }

            // Try to get the device by ID
            const devices = await navigator.bluetooth.getDevices();
            const device = devices.find(d => d.id === savedDevice.id);
            
            if (device && device.gatt) {
                console.log('Found saved device, attempting to reconnect:', device.name);
                this.device = device;
                await this.connectToExistingDevice();
                this.reconnectAttempts = 0; // Reset attempts on success
                return true;
            } else {
                console.log('Saved device not found or not available');
                this.reconnectAttempts++;
                return false;
            }
        } catch (error) {
            console.warn('Auto-reconnect failed:', error);
            this.reconnectAttempts++;
            
            // Schedule next attempt if not exceeded max attempts
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.attemptReconnect(), 2000);
            } else {
                // Clear saved info if we can't reconnect
                this.clearSavedDeviceInfo();
            }
            return false;
        }
    }

    // Connect to an existing paired device
    async connectToExistingDevice() {
        if (!this.device) {
            throw new Error('No device available');
        }

        try {
            // Connect to GATT server
            this.server = await this.device.gatt.connect();
            
            // Get service
            this.service = await this.server.getPrimaryService(this.SERVICE_UUID);
            
            // Get characteristic
            this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

            // Set up disconnect handler
            this.device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected.bind(this));

            console.log('Reconnected to printer:', this.device.name);
            return true;
        } catch (error) {
            console.error('Error reconnecting to existing device:', error);
            throw error;
        }
    }

    // Handle device disconnection
    onDeviceDisconnected(event) {
        console.log('Device disconnected:', event.target.name);
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        
        // Try to reconnect after a short delay
        if (this.shouldAutoReconnect()) {
            console.log('Scheduling reconnect attempt...');
            setTimeout(() => this.attemptReconnect(), 3000);
        }
    }

    // Connect to Bluetooth printer
    async connect() {
        try {
            if (!this.isSupported()) {
                throw new Error('Web Bluetooth API tidak didukung di browser ini');
            }

            // If already connected, return success
            if (this.isConnected()) {
                console.log('Printer already connected');
                return true;
            }

            // First try to reconnect to saved device
            if (this.shouldAutoReconnect()) {
                const reconnected = await this.attemptReconnect();
                if (reconnected) {
                    return true;
                }
            }

            // Request new Bluetooth device
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [this.SERVICE_UUID]
            });

            // Connect to GATT server
            this.server = await this.device.gatt.connect();
            
            // Get service
            this.service = await this.server.getPrimaryService(this.SERVICE_UUID);
            
            // Get characteristic
            this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

            // Set up disconnect handler
            this.device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected.bind(this));

            // Save device info for future auto-reconnect
            this.saveDeviceInfo(this.device);

            console.log('Printer connected:', this.device.name);
            return true;
        } catch (error) {
            console.error('Error connecting to printer:', error);
            throw error;
        }
    }

    // Disconnect from printer
    async disconnect() {
        try {
            // Clear the connection status to prevent auto-reconnect
            this.clearSavedDeviceInfo();
            
            // Clear any pending reconnect intervals
            if (this.reconnectInterval) {
                clearTimeout(this.reconnectInterval);
                this.reconnectInterval = null;
            }
            
            // Remove event listener
            if (this.device) {
                this.device.removeEventListener('gattserverdisconnected', this.onDeviceDisconnected.bind(this));
            }
            
            // Disconnect from GATT
            if (this.device && this.device.gatt && this.device.gatt.connected) {
                await this.device.gatt.disconnect();
            }
            
            // Reset all connection variables
            this.device = null;
            this.server = null;
            this.service = null;
            this.characteristic = null;
            this.reconnectAttempts = 0;
            
            console.log('Printer disconnected and memory cleared');
        } catch (error) {
            console.error('Error during disconnect:', error);
        }
    }

    // Soft disconnect (keeps memory for auto-reconnect)
    async softDisconnect() {
        try {
            if (this.device && this.device.gatt && this.device.gatt.connected) {
                await this.device.gatt.disconnect();
            }
            
            // Don't clear saved device info, just reset current connection
            this.server = null;
            this.service = null;
            this.characteristic = null;
            
            console.log('Printer soft disconnected (memory preserved)');
        } catch (error) {
            console.error('Error during soft disconnect:', error);
        }
    }

    // Check if printer is connected
    isConnected() {
        return this.device && this.device.gatt && this.device.gatt.connected;
    }

    // Get current device name
    getDeviceName() {
        if (this.device && this.device.name) {
            return this.device.name;
        }
        
        const savedDevice = this.getSavedDeviceInfo();
        return savedDevice ? savedDevice.name : 'Unknown Printer';
    }

    // Get connection status info
    getConnectionInfo() {
        return {
            isConnected: this.isConnected(),
            deviceName: this.getDeviceName(),
            hasSavedDevice: this.shouldAutoReconnect(),
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }

    // Send data to printer
    async print(data) {
        if (!this.isConnected()) {
            throw new Error('Printer tidak terhubung');
        }

        try {
            // Convert string to Uint8Array
            const encoder = new TextEncoder();
            const text = encoder.encode(data);
            
            // Send data in chunks (max 20 bytes for BLE)
            const chunkSize = 20;
            for (let i = 0; i < text.length; i += chunkSize) {
                const chunk = text.slice(i, i + chunkSize);
                await this.characteristic.writeValue(chunk);
                // Small delay between chunks
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            return true;
        } catch (error) {
            console.error('Error printing:', error);
            throw error;
        }
    }

    // Print raw bytes
    async printBytes(bytes) {
        if (!this.isConnected()) {
            throw new Error('Printer tidak terhubung');
        }

        try {
            // Send data in chunks
            const chunkSize = 20;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.slice(i, i + chunkSize);
                await this.characteristic.writeValue(chunk);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            return true;
        } catch (error) {
            console.error('Error printing bytes:', error);
            throw error;
        }
    }
}

// Create singleton instance
const bluetoothPrinter = new BluetoothPrinterService();

export default bluetoothPrinter;