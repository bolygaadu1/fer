import { supabase, type Order } from '@/lib/supabase'
import { toast } from 'sonner'

export class OrderService {
  // Create a new order
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        toast.error('Failed to create order. Please try again.')
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order. Please try again.')
      return null
    }
  }

  // Get all orders (for admin)
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to fetch orders.')
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders.')
      return []
    }
  }

  // Get order by order_id (for tracking)
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching order:', error)
        toast.error('Failed to fetch order.')
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to fetch order.')
      return null
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)

      if (error) {
        console.error('Error updating order status:', error)
        toast.error('Failed to update order status.')
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status.')
      return false
    }
  }

  // Delete all orders (for admin cleanup)
  static async deleteAllOrders(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

      if (error) {
        console.error('Error deleting orders:', error)
        toast.error('Failed to delete orders.')
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting orders:', error)
      toast.error('Failed to delete orders.')
      return false
    }
  }

  // Get orders count by status
  static async getOrdersCountByStatus(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status')

      if (error) {
        console.error('Error fetching order counts:', error)
        return {}
      }

      const counts: Record<string, number> = {}
      data?.forEach(order => {
        counts[order.status] = (counts[order.status] || 0) + 1
      })

      return counts
    } catch (error) {
      console.error('Error fetching order counts:', error)
      return {}
    }
  }
}