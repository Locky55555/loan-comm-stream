import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw, CreditCard, Users, Wifi, WifiOff } from 'lucide-react';
import CustomerForm from '../components/CustomerForm';
import CustomersTable from '../components/CustomersTable';
import { mockApi, detectTunnelUrl, type Customer } from '../services/mockApi';

// Customer interface moved to mockApi.ts

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);

  // Use mock API for demo purposes
  const USE_MOCK_API = true;

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchCustomers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCustomers();
    detectTunnelUrlAsync();
  }, []);

  const detectTunnelUrlAsync = async () => {
    try {
      const url = await detectTunnelUrl();
      setTunnelUrl(url);
    } catch (error) {
      setTunnelUrl(window.location.origin);
    }
  };

  const fetchCustomers = async () => {
    try {
      setRefreshing(true);
      setIsOnline(true);
      
      if (USE_MOCK_API) {
        // Use mock API for demonstration
        const data = await mockApi.getCustomers();
        setCustomers(data);
      } else {
        // Real API call (commented out for demo)
        const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${API_BASE}/api/customers`);
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          throw new Error('Failed to fetch customers');
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setIsOnline(false);
      
      if (!USE_MOCK_API) {
        toast.error('ไม่สามารถดึงข้อมูลลูกค้าได้');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    const paymentUrl = `${tunnelUrl || window.location.origin}/pay/${newCustomer.id}`;
    
    // Show success toast with payment link
    toast.success(
      <div className="space-y-2">
        <div className="font-semibold">เพิ่มลูกค้าสำเร็จ!</div>
        <div className="text-sm">
          <div>ลิงก์ชำระเงิน:</div>
          <div className="bg-muted p-2 rounded mt-1 font-mono text-xs break-all">
            {paymentUrl}
          </div>
        </div>
      </div>,
      { duration: 8000 }
    );
  };

  const getPaymentLink = (customerId: number) => {
    return `${tunnelUrl || window.location.origin}/pay/${customerId}`;
  };

  const pendingCount = customers.filter(c => c.status === 'pending').length;
  const paidCount = customers.filter(c => c.status === 'paid').length;
  const totalAmount = customers.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Loan Payment System</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">ระบบจัดการลิงก์ชำระเงินกู้</p>
                  {USE_MOCK_API && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <Wifi className="h-3 w-3 mr-1" />
                      Demo Mode
                    </span>
                  )}
                  {!USE_MOCK_API && !isOnline && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={fetchCustomers}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              รีเฟรช
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-pending rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-pending-foreground">{pendingCount}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">รอชำระ</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-success rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-success-foreground">{paidCount}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ชำระแล้ว</p>
                <p className="text-2xl font-bold text-foreground">{paidCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ยอดรวม</p>
                <p className="text-2xl font-bold text-foreground">
                  ฿{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Form */}
          <div className="lg:col-span-1">
            <CustomerForm 
              onCustomerAdded={handleCustomerAdded}
              useMockApi={USE_MOCK_API}
            />
          </div>

          {/* Customers Table */}
          <div className="lg:col-span-2">
            <CustomersTable 
              customers={customers}
              loading={loading}
              getPaymentLink={getPaymentLink}
              onRefresh={fetchCustomers}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;