// Mock API Service for demonstration
export interface Customer {
  id: number;
  name: string;
  amount: number;
  status: 'pending' | 'paid';
  due_date: string;
  created_at: string;
}

// Mock database
let customers: Customer[] = [
  {
    id: 1,
    name: 'สมชาย ใจดี',
    amount: 50000,
    status: 'pending',
    due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 2,
    name: 'วิชาญ ร่ำรวย',
    amount: 25000,
    status: 'paid',
    due_date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 3,
    name: 'มาลี สร้างสุข',
    amount: 75000,
    status: 'pending',
    due_date: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours from now
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    await delay(300); // Simulate network delay
    return [...customers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Get customer by ID
  async getCustomer(id: number): Promise<Customer | null> {
    await delay(200);
    const customer = customers.find(c => c.id === id);
    return customer || null;
  },

  // Create new customer
  async createCustomer(data: { name: string; amount: number; due_date: string }): Promise<Customer> {
    await delay(400);
    
    // Validation
    if (!data.name.trim()) {
      throw new Error('ชื่อลูกค้าไม่สามารถเป็นค่าว่างได้');
    }
    
    if (data.amount <= 0) {
      throw new Error('จำนวนเงินต้องมากกว่า 0');
    }
    
    const dueDate = new Date(data.due_date);
    const now = new Date();
    const maxDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    if (dueDate <= now) {
      throw new Error('วันที่ครบกำหนดต้องเป็นอนาคต');
    }
    
    if (dueDate > maxDate) {
      throw new Error('วันที่ครบกำหนดต้องไม่เกิน 24 ชั่วโมงจากตอนนี้');
    }

    const newCustomer: Customer = {
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      name: data.name.trim(),
      amount: data.amount,
      status: 'pending',
      due_date: data.due_date,
      created_at: new Date().toISOString()
    };

    customers.unshift(newCustomer);
    return newCustomer;
  },

  // Mark customer as paid
  async markAsPaid(id: number): Promise<Customer | null> {
    await delay(300);
    
    const customerIndex = customers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      throw new Error('ไม่พบข้อมูลลูกค้า');
    }

    customers[customerIndex] = {
      ...customers[customerIndex],
      status: 'paid'
    };

    return customers[customerIndex];
  }
};

// Mock tunnel detection
export const detectTunnelUrl = async (): Promise<string> => {
  // In real environment, this would try to fetch from cloudflared tunnel API
  // For demo, just return current origin
  await delay(100);
  return window.location.origin;
};