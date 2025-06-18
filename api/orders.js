// API endpoint for orders - stores data in hosting file system
import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// Helper functions
function readOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing orders:', error);
    return false;
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.orderId) {
          // Get specific order
          const orders = readOrders();
          const order = orders.find(o => o.orderId === req.query.orderId);
          if (order) {
            res.status(200).json(order);
          } else {
            res.status(404).json({ error: 'Order not found' });
          }
        } else if (req.query.stats) {
          // Get order statistics
          const orders = readOrders();
          const stats = {};
          orders.forEach(order => {
            stats[order.status] = (stats[order.status] || 0) + 1;
          });
          res.status(200).json(stats);
        } else {
          // Get all orders
          const orders = readOrders();
          res.status(200).json(orders);
        }
        break;

      case 'POST':
        // Create new order
        const orders = readOrders();
        const newOrder = req.body;
        orders.push(newOrder);
        
        if (writeOrders(orders)) {
          res.status(201).json(newOrder);
        } else {
          res.status(500).json({ error: 'Failed to save order' });
        }
        break;

      case 'PATCH':
        // Update order status
        if (req.query.orderId && req.query.action === 'status') {
          const orders = readOrders();
          const orderIndex = orders.findIndex(o => o.orderId === req.query.orderId);
          
          if (orderIndex !== -1) {
            orders[orderIndex].status = req.body.status;
            orders[orderIndex].updatedAt = new Date().toISOString();
            
            if (writeOrders(orders)) {
              res.status(200).json(orders[orderIndex]);
            } else {
              res.status(500).json({ error: 'Failed to update order' });
            }
          } else {
            res.status(404).json({ error: 'Order not found' });
          }
        } else {
          res.status(400).json({ error: 'Invalid request' });
        }
        break;

      case 'DELETE':
        // Delete all orders
        if (writeOrders([])) {
          res.status(200).json({ message: 'All orders deleted' });
        } else {
          res.status(500).json({ error: 'Failed to delete orders' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}