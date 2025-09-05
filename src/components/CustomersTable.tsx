import React from 'react';
import { ExternalLink, Copy, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  amount: number;
  status: 'pending' | 'paid';
  due_date: string;
  created_at: string;
}

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  getPaymentLink: (customerId: number) => string;
  onRefresh: () => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({ 
  customers, 
  loading, 
  getPaymentLink, 
  onRefresh 
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('คัดลอกลิงก์แล้ว!');
    }).catch(() => {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading && customers.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">รายการลูกค้า</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">รายการลูกค้า</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>รีเฟรชอัตโนมัติทุก 5 วินาที</span>
          <RefreshCw className="h-4 w-4" />
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-muted-foreground mb-4">
            <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีลูกค้า</h3>
            <p>เริ่มต้นด้วยการเพิ่มลูกค้าคนแรกของคุณ</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  จำนวนเงิน
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ครบกำหนด
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {customer.id}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-foreground">
                      ฿{Number(customer.amount).toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'paid' 
                        ? 'bg-success/10 text-success' 
                        : isOverdue(customer.due_date)
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-pending/10 text-pending'
                    }`}>
                      {customer.status === 'paid' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          ชำระแล้ว
                        </>
                      ) : isOverdue(customer.due_date) ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          เลยกำหนด
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          รอชำระ
                        </>
                      )}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {formatDate(customer.due_date)}
                    </div>
                    {isOverdue(customer.due_date) && customer.status === 'pending' && (
                      <div className="text-xs text-destructive">เลยกำหนดแล้ว</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => window.open(`/pay/${customer.id}`, '_blank')}
                      className="inline-flex items-center text-primary hover:text-primary-hover transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      เปิด
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(getPaymentLink(customer.id))}
                      className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      คัดลอก
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;