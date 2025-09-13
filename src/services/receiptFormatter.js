// ESC/POS Commands for Thermal Printer
const ESC_POS = {
    // Printer hardware
    HW_INIT: '\x1b\x40',                    // Initialize printer
    HW_SELECT: '\x1b\x3d\x01',              // Select printer

    // Feed control
    CTL_LF: '\x0a',                         // Line feed
    CTL_CR: '\x0d',                         // Carriage return
    CTL_FF: '\x0c',                         // Form feed
    CTL_VT: '\x0b',                         // Vertical tab

    // Text formatting
    TXT_NORMAL: '\x1b\x21\x00',             // Normal text
    TXT_2HEIGHT: '\x1b\x21\x10',            // Double height
    TXT_2WIDTH: '\x1b\x21\x20',             // Double width
    TXT_4SQUARE: '\x1b\x21\x30',            // Double width & height
    TXT_BOLD_ON: '\x1b\x45\x01',            // Bold on
    TXT_BOLD_OFF: '\x1b\x45\x00',           // Bold off
    TXT_UNDERL_ON: '\x1b\x2d\x01',          // Underline on
    TXT_UNDERL_OFF: '\x1b\x2d\x00',         // Underline off
    TXT_ALIGN_LEFT: '\x1b\x61\x00',         // Left alignment
    TXT_ALIGN_CENTER: '\x1b\x61\x01',       // Center alignment
    TXT_ALIGN_RIGHT: '\x1b\x61\x02',        // Right alignment

    // Paper cutting
    PAPER_FULL_CUT: '\x1d\x56\x00',         // Full cut
    PAPER_PART_CUT: '\x1d\x56\x01',         // Partial cut

    // Cash drawer
    CD_KICK_2: '\x1b\x70\x00\x19\x78',      // Kick cash drawer 2
    CD_KICK_5: '\x1b\x70\x01\x19\x78',      // Kick cash drawer 5

    // Barcode
    BARCODE_TXT_OFF: '\x1d\x48\x00',        // Hide barcode text
    BARCODE_TXT_ABV: '\x1d\x48\x01',        // Show barcode text above
    BARCODE_TXT_BLW: '\x1d\x48\x02',        // Show barcode text below
    BARCODE_TXT_BTH: '\x1d\x48\x03',        // Show barcode text above & below
    BARCODE_FONT_A: '\x1d\x66\x00',         // Font A for barcode
    BARCODE_FONT_B: '\x1d\x66\x01',         // Font B for barcode
    BARCODE_HEIGHT: '\x1d\x68\x64',         // Barcode height
    BARCODE_WIDTH: '\x1d\x77\x03',          // Barcode width
    BARCODE_UPC_A: '\x1d\x6b\x00',          // UPC-A barcode
    BARCODE_UPC_E: '\x1d\x6b\x01',          // UPC-E barcode
    BARCODE_EAN13: '\x1d\x6b\x02',          // EAN13 barcode
    BARCODE_EAN8: '\x1d\x6b\x03',           // EAN8 barcode
    BARCODE_CODE39: '\x1d\x6b\x04',         // CODE39 barcode
    BARCODE_ITF: '\x1d\x6b\x05',            // ITF barcode
    BARCODE_NW7: '\x1d\x6b\x06',            // NW7 barcode
};

class ReceiptFormatter {
    constructor() {
        this.paperWidth = 32; // Standard 58mm thermal printer width (32 chars)
    }

    // Format text with padding
    padText(text, width, align = 'left') {
        text = String(text);
        if (text.length > width) {
            return text.substring(0, width);
        }

        const padding = width - text.length;
        if (align === 'center') {
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
        } else if (align === 'right') {
            return ' '.repeat(padding) + text;
        } else {
            return text + ' '.repeat(padding);
        }
    }

    // Format two columns
    formatColumns(left, right, totalWidth = this.paperWidth) {
        const leftWidth = totalWidth - right.length - 1;
        return this.padText(left, leftWidth) + ' ' + right;
    }

    // Format line separator
    separator(char = '-') {
        return char.repeat(this.paperWidth);
    }

    // Format currency
    formatCurrency(amount) {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }

    // Format date time
    formatDateTime(date = new Date()) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleString('id-ID', options);
    }

    // Generate kitchen receipt
    generateKitchenReceipt(order, items) {
        let receipt = '';

        // Initialize printer
        receipt += ESC_POS.HW_INIT;

        // Header
        receipt += ESC_POS.TXT_ALIGN_CENTER;
        receipt += ESC_POS.TXT_2HEIGHT;
        receipt += 'KITCHEN ORDER\n';
        receipt += ESC_POS.TXT_NORMAL;
        receipt += this.separator() + '\n';

        // Order info
        receipt += ESC_POS.TXT_ALIGN_LEFT;
        receipt += ESC_POS.TXT_BOLD_ON;
        receipt += `Order #${order.order_number || order.id}\n`;
        receipt += ESC_POS.TXT_BOLD_OFF;
        receipt += `Customer: ${order.customer_name || 'Walk-in'}\n`;
        receipt += `Time: ${this.formatDateTime()}\n`;
        receipt += this.separator() + '\n';

        // Items
        receipt += ESC_POS.TXT_BOLD_ON;
        receipt += 'ITEMS:\n';
        receipt += ESC_POS.TXT_BOLD_OFF;

        items.forEach(item => {
            // Item name in bold
            receipt += ESC_POS.TXT_BOLD_ON;
            receipt += `${item.quantity || 1}x ${item.name}\n`;
            receipt += ESC_POS.TXT_BOLD_OFF;

            // Options/notes
            if (item.options) {
                Object.entries(item.options).forEach(([key, value]) => {
                    if (value && key !== 'specialNote') {
                        const displayValue = Array.isArray(value) ? value.join(', ') : value;
                        if (displayValue) {
                            receipt += `   - ${key}: ${displayValue}\n`;
                        }
                    }
                });

                if (item.options.specialNote) {
                    receipt += `   Note: ${item.options.specialNote}\n`;
                }
            }
            receipt += '\n';
        });

        // Footer
        receipt += this.separator() + '\n';
        receipt += ESC_POS.TXT_ALIGN_CENTER;
        receipt += 'SEGERA DISIAPKAN\n';

        // Cut paper
        receipt += '\n\n\n';
        receipt += ESC_POS.PAPER_PART_CUT;

        return receipt;
    }

    // Generate customer receipt
    generateCustomerReceipt(order, items, paymentMethod, cashAmount = 0) {
        let receipt = '';

        // Initialize printer
        receipt += ESC_POS.HW_INIT;

        // Header
        receipt += ESC_POS.TXT_ALIGN_CENTER;
        receipt += ESC_POS.TXT_2HEIGHT;
        receipt += ' KEBAB AL BEWOK\n';
        receipt += ESC_POS.TXT_NORMAL;
        receipt += 'Rasa Nikmat, Harga Bersahabat\n';
        receipt += 'Jl. Kalisari III, Kel. Kalisari, Pasar Rebo, Jakarta Timur 13790\n';
        receipt += 'Telp: 0823-1546-7329\n';
        receipt += this.separator() + '\n';

        // Order info
        receipt += ESC_POS.TXT_ALIGN_LEFT;
        receipt += `Order #${order.order_number || order.id}\n`;
        receipt += `Cashier: ${order.cashier || 'Admin'}\n`;
        receipt += `Date: ${this.formatDateTime()}\n`;
        receipt += `Customer: ${order.customer_name || 'Walk-in'}\n`;
        receipt += this.separator() + '\n';

        // Items
        let subtotal = 0;
        items.forEach(item => {
            const itemTotal = item.price * (item.quantity || 1);
            subtotal += itemTotal;

            // Item line
            receipt += this.formatColumns(
                `${item.quantity || 1}x ${item.name}`,
                this.formatCurrency(itemTotal)
            ) + '\n';

            // Price per item if quantity > 1
            if ((item.quantity || 1) > 1) {
                receipt += this.formatColumns(
                    `   @ ${this.formatCurrency(item.price)}`,
                    ''
                ) + '\n';
            }

            // Options
            if (item.options) {
                Object.entries(item.options).forEach(([key, value]) => {
                    if (value && key !== 'specialNote') {
                        const displayValue = Array.isArray(value) ? value.join(', ') : value;
                        if (displayValue) {
                            receipt += `   ${key}: ${displayValue}\n`;
                        }
                    }
                });

                if (item.options.specialNote) {
                    receipt += `   Note: ${item.options.specialNote}\n`;
                }
            }
        });

        receipt += this.separator() + '\n';

        // Totals
        receipt += this.formatColumns('Subtotal:', this.formatCurrency(subtotal)) + '\n';

        const tax = 0;
        if (tax > 0) {
            receipt += this.formatColumns('Tax (10%):', this.formatCurrency(tax)) + '\n';
        }

        receipt += ESC_POS.TXT_BOLD_ON;
        receipt += this.formatColumns('TOTAL:', this.formatCurrency(order.total_amount || subtotal)) + '\n';
        receipt += ESC_POS.TXT_BOLD_OFF;

        // Payment info
        receipt += this.separator('-') + '\n';
        let paymentMethodText = paymentMethod;
        if (paymentMethod === 'cash') {
            paymentMethodText = 'TUNAI';
        } else if (paymentMethod === 'qris') {
            paymentMethodText = 'QRIS';
        } else if (paymentMethod === 'unpaid') {
            paymentMethodText = 'BELUM BAYAR';
        }

        receipt += this.formatColumns('Metode:', paymentMethodText) + '\n';

        if (paymentMethod === 'cash' && cashAmount > 0) {
            receipt += this.formatColumns('Bayar:', this.formatCurrency(cashAmount)) + '\n';
            const change = cashAmount - (order.total_amount || subtotal);
            if (change > 0) {
                receipt += this.formatColumns('Kembali:', this.formatCurrency(change)) + '\n';
            }
        }

        // Footer
        receipt += this.separator() + '\n';
        receipt += ESC_POS.TXT_ALIGN_CENTER;
        receipt += 'Terima Kasih\n';
        receipt += 'Silakan Datang Kembali\n';

        // Barcode (optional - order number)
        if (order.order_number) {
            receipt += '\n';
            receipt += ESC_POS.BARCODE_HEIGHT;
            receipt += ESC_POS.BARCODE_WIDTH;
            receipt += ESC_POS.BARCODE_TXT_BLW;
            receipt += ESC_POS.BARCODE_CODE39;
            receipt += order.order_number + '\x00';
        }

        // Cut paper
        receipt += '\n\n\n';
        receipt += ESC_POS.PAPER_PART_CUT;

        return receipt;
    }
}

export default new ReceiptFormatter();