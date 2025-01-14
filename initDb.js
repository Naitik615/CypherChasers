const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    const dataDir = path.join(__dirname, 'data');
    const orderFilePath = path.join(dataDir, 'customer_order.json');

    try {
        // Create data directory if it doesn't exist
        await fs.mkdir(dataDir, { recursive: true });

        // Check if order file exists
        try {
            await fs.access(orderFilePath);
        } catch {
            // Create initial order data
            const initialData = {
                "orders": [
                    {
                        "orderId": "ORD001",
                        "mobile": "9876543210",
                        "customerName": "John Doe",
                        "items": [
                            {
                                "productId": "P001",
                                "name": "Smartphone",
                                "quantity": 1,
                                "price": 699.99
                            }
                        ],
                        "status": "delivered",
                        "orderDate": "2024-02-15",
                        "deliveryDate": "2024-02-18"
                    }
                ]
            };

            await fs.writeFile(orderFilePath, JSON.stringify(initialData, null, 2));
            console.log('Database initialized with sample data');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = initializeDatabase;
