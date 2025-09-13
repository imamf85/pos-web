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
    }

    // Check if Web Bluetooth is supported
    isSupported() {
        return navigator.bluetooth !== undefined;
    }

    // Connect to Bluetooth printer
    async connect() {
        try {
            if (!this.isSupported()) {
                throw new Error('Web Bluetooth API tidak didukung di browser ini');
            }

            // Request Bluetooth device
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

            console.log('Printer connected:', this.device.name);
            return true;
        } catch (error) {
            console.error('Error connecting to printer:', error);
            throw error;
        }
    }

    // Disconnect from printer
    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
            this.device = null;
            this.server = null;
            this.service = null;
            this.characteristic = null;
        }
    }

    // Check if printer is connected
    isConnected() {
        return this.device && this.device.gatt.connected;
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