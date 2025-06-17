// Local Storage Order Service
// Note: localStorage is browser-specific and cannot be shared between different users/devices
// For shared data, you would need a database solution like Supabase

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
  private static readonly STORAGE_KEY = 'xeroxOrders'

  // Create a new order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      const order: Order = {
        ...orderData,
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const existingOrders = this.getAllOrdersSync()
      const updatedOrders = [...existingOrders, order]
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedOrders))
      
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Get all orders synchronously (for immediate UI updates)
  static getAllOrdersSync(): Order[] {
    try {
      const ordersJson = localStorage.getItem(this.STORAGE_KEY)
      if (!ordersJson) return []
      
      const orders = JSON.parse(ordersJson) as Order[]
      return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Get all orders (async for consistency with API pattern)
  static async getAllOrders(): Promise<Order[]> {
    return this.getAllOrdersSync()
  }

  // Get order by order ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orders = this.getAllOrdersSync()
      return orders.find(order => order.orderId === orderId) || null
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const orders = this.getAllOrdersSync()
      const orderIndex = orders.findIndex(order => order.orderId === orderId)
      
      if (orderIndex === -1) {
        return false
      }

      orders[orderIndex] = {
        ...orders[orderIndex],
        status,
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders))
      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  // Delete all orders
  static async deleteAllOrders(): Promise<boolean> {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Error deleting orders:', error)
      return false
    }
  }

  // Get orders count by status
  static async getOrdersCountByStatus(): Promise<Record<string, number>> {
    try {
      const orders = this.getAllOrdersSync()
      const counts: Record<string, number> = {}
      
      orders.forEach(order => {
        counts[order.status] = (counts[order.status] || 0) + 1
      })

      return counts
    } catch (error) {
      console.error('Error fetching order counts:', error)
      return {}
    }
  }

  // Export orders (for backup/sharing)
  static exportOrders(): string {
    const orders = this.getAllOrdersSync()
    return JSON.stringify(orders, null, 2)
  }

  // Import orders (for backup/sharing)
  static importOrders(ordersJson: string): boolean {
    try {
      const orders = JSON.parse(ordersJson) as Order[]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders))
      return true
    } catch (error) {
      console.error('Error importing orders:', error)
      return false
    }
  }
}