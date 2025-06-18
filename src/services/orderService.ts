// Server-side Order Service using hosting file system
// This will store data in the hosting service's file system instead of localStorage

export interface Order {
  id?: string
  orderId: string
  fullName: string
  phoneNumber: string
  printType: string
  bindingColorType?: string
  copies?: number
  paperSize?: string
  printSide?: string
  selectedPages?: string
  colorPages?: string
  bwPages?: string
  specialInstructions?: string
  files: Array<{
    name: string
    size: number
    type: string
    path?: string
  }>
  orderDate: string
  status: string
  totalCost?: number
  createdAt?: string
  updatedAt?: string
}

export class OrderService {
  private static readonly API_BASE = '/api'

  // Create a new order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      const order: Order = {
        ...orderData,
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`${this.API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Get all orders
  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${this.API_BASE}/orders`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const orders = await response.json()
      return orders.sort((a: Order, b: Order) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Get order by order ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await fetch(`${this.API_BASE}/orders/${orderId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch order')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      return response.ok
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  // Delete all orders
  static async deleteAllOrders(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/orders`, {
        method: 'DELETE'
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting orders:', error)
      return false
    }
  }

  // Get orders count by status
  static async getOrdersCountByStatus(): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.API_BASE}/orders/stats`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch order stats')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching order counts:', error)
      return {}
    }
  }
}