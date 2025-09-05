import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, User, DollarSign, Calendar } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  amount: number;
  status: 'pending' | 'paid';
  due_date: string;
  created_at: string;
}

interface CustomerFormProps {
  onCustomerAdded: (customer: Customer) => void;
  apiBase: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onCustomerAdded, apiBase }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default due_date to 24 hours from now
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDueDate = tomorrow.toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, due_date: defaultDueDate }));
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณาใส่ชื่อลูกค้า';
    }
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'กรุณาใส่จำนวนเงินที่ถูกต้อง (มากกว่า 0)';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'กรุณาเลือกวันที่ครบกำหนดชำระ';
    } else {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      const maxDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      if (dueDate <= now) {
        newErrors.due_date = 'วันที่ครบกำหนดต้องเป็นอนาคต';
      } else if (dueDate > maxDate) {
        newErrors.due_date = 'วันที่ครบกำหนดต้องไม่เกิน 24 ชั่วโมงจากตอนนี้';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${apiBase}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          amount: parseFloat(formData.amount),
          due_date: new Date(formData.due_date).toISOString()
        }),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        onCustomerAdded(newCustomer);
        
        // Reset form
        setFormData({
          name: '',
          amount: '',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">เพิ่มลูกค้าใหม่</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>ชื่อลูกค้า</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="กรุณาใส่ชื่อลูกค้า"
            className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.name 
                ? 'border-destructive bg-destructive/5' 
                : 'border-input bg-background hover:border-primary/50'
            }`}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Amount Field */}
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>จำนวนเงิน (บาท)</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.amount 
                ? 'border-destructive bg-destructive/5' 
                : 'border-input bg-background hover:border-primary/50'
            }`}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        {/* Due Date Field */}
        <div className="space-y-2">
          <label htmlFor="due_date" className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>วันที่ครบกำหนดชำระ</span>
          </label>
          <input
            type="datetime-local"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.due_date 
                ? 'border-destructive bg-destructive/5' 
                : 'border-input bg-background hover:border-primary/50'
            }`}
          />
          {errors.due_date && (
            <p className="text-sm text-destructive">{errors.due_date}</p>
          )}
          <p className="text-xs text-muted-foreground">
            * ต้องไม่เกิน 24 ชั่วโมงจากตอนนี้
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              กำลังเพิ่มลูกค้า...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มลูกค้า
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;