const express = require("express");
const app = express();
const PORT = 3456;
const cors = require("cors");
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const initializeDatabase = require('./initDb');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Path to order history file
const ORDER_HISTORY_PATH = path.join(__dirname, 'data', 'customer_order.json');

// Function to read order history
async function getOrderHistory(customerMobile) {
    try {
        const data = await fs.readFile(ORDER_HISTORY_PATH, 'utf8');
        const orders = JSON.parse(data).orders;
        return orders.filter(order => order.mobile === customerMobile);
    } catch (error) {
        console.error('Error reading order history:', error);
        return [];
    }
}

const verifyOrder = async (orderId, mobile) => {
    try {
        console.log(`Verifying order: ${orderId} for mobile: ${mobile}`); // Debug log

        const data = await fs.readFile(ORDER_HISTORY_PATH, 'utf8');
        const orders = JSON.parse(data).orders;
        
        console.log('Available orders:', orders); // Debug log
        
        const order = orders.find(o => 
            o.orderId.toLowerCase() === orderId.toLowerCase() &&
            o.mobile === mobile
        );
        
        console.log('Found order:', order); // Debug log

        if (!order) {
            const orderExists = orders.some(o => o.orderId.toLowerCase() === orderId.toLowerCase());
            if (orderExists) {
                return { 
                    verified: false, 
                    message: "Mobile number doesn't match order records" 
                };
            }
            return { 
                verified: false, 
                message: "Order ID not found" 
            };
        }
        
        return { 
            verified: true, 
            orderDetails: order 
        };
    } catch (error) {
        console.error('Error verifying order:', error);
        return { verified: false, message: "Error verifying order" };
    }
};

const SYSTEM_PROMPT = `You are a professional customer support agent for AI Smart Tech. 
Follow these guidelines for natural conversation:

1. Order Verification:
   - When customer mentions an order ID
   - Only provide order details if verification is successful
   - For unverified orders, politely ask for correct order ID

2. Order Information:
   - Provide order status, delivery dates, and item details when verified
   - For delivered orders, confirm delivery date
   - For pending orders, share expected delivery date

3. Communication Style:
   - Be professional and security-conscious
   - Never share full order details without verification
   - Ask for order ID if customer inquires about an order without providing ID
   - Use customer's name when verified

4. Security Guidelines:
   - Only discuss order details with verified customers
   - If verification fails, provide general support only
   - Guide customers to proper verification process

5. and the most important thing if the custuomer want to make any modification in their records then tell that their request has been submitted and they will recieve a call from our team soon.
  you dont need to verify mobile number for modification.
`;

async function startServer() {
    try {
        await initializeDatabase();
        
        app.use(cors());
        app.use(express.json());

        app.post("/send-text", async (req, res) => {
            const { text, language, name, mobile } = req.body;
            console.log("Received request:", { text, language, name, mobile });

            try {
                // Improved order ID extraction
                const orderIdMatch = text.match(/\b(ord\d+)\b/i);
                let orderContext = '';

                if (orderIdMatch) {
                    const orderId = orderIdMatch[0].toUpperCase();
                    console.log('Extracted Order ID:', orderId); // Debug log
                    
                    const verification = await verifyOrder(orderId, mobile);
                    console.log('Verification result:', verification); // Debug log

                    if (verification.verified) {
                        const details = verification.orderDetails;
                        orderContext = `
                            Verified Order Details:
                            Order ID: ${details.orderId}
                            Customer: ${details.customerName}
                            Status: ${details.status}
                            Order Date: ${details.orderDate}
                            ${details.deliveryDate ? `Delivery Date: ${details.deliveryDate}` : 
                              details.expectedDelivery ? `Expected Delivery: ${details.expectedDelivery}` : ''}
                            Items: ${JSON.stringify(details.items)}
                            
                            Please provide accurate order information in your response.
                        `;
                    } else {
                        orderContext = `
                            Order Verification Failed: ${verification.message}
                            Please ask customer to verify their order ID and mobile number.
                        `;
                    }
                }

                // Generate response using GPT-3.5
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { 
                            role: "system", 
                            content: SYSTEM_PROMPT + (orderContext ? `\n\n${orderContext}` : '')
                        },
                        { 
                            role: "user", 
                            content: `Customer Name: ${name}\nMobile: ${mobile}\nLanguage: ${language}\nQuery: ${text}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 200
                });

                const aiResponse = completion.choices[0].message.content;

                // Generate speech
                const audioResponse = await axios({
                    method: 'post',
                    url: 'https://api.openai.com/v1/audio/speech',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        model: 'tts-1',
                        input: aiResponse,
                        voice: language === 'hi' ? 'shimmer' : 'echo',
                        speed: 1.0
                    },
                    responseType: 'arraybuffer'
                });

                const audioBase64 = Buffer.from(audioResponse.data).toString('base64');

                res.json({
                    aiResponse,
                    audio: audioBase64
                });

            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ 
                    error: "Error processing request",
                    details: error.message 
                });
            }
        });

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();