import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  ArrowLeft, 
  User, 
  DollarSign,
  Calendar,
  AlertTriangle 
} from 'lucide-react';
import QRBox from '../components/QRBox';
import { mockApi, type Customer } from '../services/mockApi';

// Customer interface moved to mockApi.ts

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string>('');

  // Use mock API for demo purposes
  const USE_MOCK_API = true;

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    if (!id) {
      setError('ไม่พบรหัสลูกค้า');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching customer with ID:', id);
      
      if (USE_MOCK_API) {
        // Use mock API
        const customerId = parseInt(id);
        console.log('Parsed customer ID:', customerId);
        
        if (isNaN(customerId)) {
          setError('รหัสลูกค้าไม่ถูกต้อง');
          return;
        }
        
        const data = await mockApi.getCustomer(customerId);
        console.log('Mock API returned:', data);
        
        if (data) {
          setCustomer(data);
          setError('');
        } else {
          setError(`ไม่พบข้อมูลลูกค้ารหัส ${id}`);
        }
      } else {
        // Real API call (commented out for demo)
        const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${API_BASE}/api/customers/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setCustomer(data);
          setError('');
        } else if (response.status === 404) {
          setError('ไม่พบข้อมูลลูกค้า');
        } else {
          throw new Error('Failed to fetch customer');
        }
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!customer) return;

    setPaying(true);
    try {
      if (USE_MOCK_API) {
        // Use mock API
        const updatedCustomer = await mockApi.markAsPaid(customer.id);
        if (updatedCustomer) {
          setCustomer(updatedCustomer);
          toast.success('ชำระเงินสำเร็จ!');
        }
      } else {
        // Real API call (commented out for demo)
        const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${API_BASE}/api/pay/${customer.id}`, {
          method: 'POST'
        });

        if (response.ok) {
          const updatedCustomer = await response.json();
          setCustomer(updatedCustomer);
          toast.success('ชำระเงินสำเร็จ!');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    } finally {
      setPaying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getQRValue = (customer: Customer) => {
    return `PAY:${customer.id}:${customer.amount}:${customer.name}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-xl shadow-lg border p-8 text-center space-y-6">
            <div className="text-destructive">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
            </div>
            
            <Link 
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                กลับ
              </Link>
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">ชำระเงินกู้</h1>
              </div>
            </div>
            
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              customer.status === 'paid' 
                ? 'bg-success/10 text-success' 
                : isOverdue(customer.due_date)
                ? 'bg-destructive/10 text-destructive'
                : 'bg-pending/10 text-pending'
            }`}>
              {customer.status === 'paid' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ชำระแล้ว
                </>
              ) : isOverdue(customer.due_date) ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  เลยกำหนด
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  รอชำระ
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {customer.status === 'paid' && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <h3 className="text-lg font-semibold text-success">ชำระเงินสำเร็จแล้ว</h3>
                <p className="text-sm text-success/80">การชำระเงินของคุณได้รับการบันทึกเรียบร้อยแล้ว</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">รายละเอียดการชำระเงิน</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">ชื่อลูกค้า</p>
                    <p className="text-lg font-semibold text-foreground">{customer.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">จำนวนเงินที่ต้องชำระ</p>
                    <p className="text-2xl font-bold text-foreground">
                      ฿{Number(customer.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">วันที่ครบกำหนดชำระ</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatDate(customer.due_date)}
                    </p>
                    {isOverdue(customer.due_date) && customer.status === 'pending' && (
                      <p className="text-sm text-destructive font-medium mt-1">
                        เลยกำหนดชำระแล้ว
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            {customer.status === 'pending' && (
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">ดำเนินการชำระเงิน</h3>
                <p className="text-muted-foreground mb-6">
                  กดปุ่มด้านล่างเพื่อยืนยันการชำระเงิน หลังจากที่คุณได้ชำระเงินผ่านช่องทางที่กำหนดแล้ว
                </p>
                
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl text-secondary-foreground bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {paying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary-foreground mr-3"></div>
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      ยืนยันการชำระเงิน
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="lg:sticky lg:top-8">
            <QRBox 
              value={getQRValue(customer)}
              size={280}
              className="w-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;