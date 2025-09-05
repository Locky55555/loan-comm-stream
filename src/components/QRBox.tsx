import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';

interface QRBoxProps {
  value: string;
  size?: number;
  className?: string;
}

const QRBox: React.FC<QRBoxProps> = ({ value, size = 224, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#1e293b', // slate-800
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
        }
      });
    }
  }, [value, size]);

  if (!value) {
    return (
      <div className={`bg-card rounded-xl border shadow-sm p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <QrCode className="h-16 w-16 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">QR Code</h3>
            <p className="text-sm text-muted-foreground">
              QR Code จะแสดงที่นี่เมื่อมีข้อมูล
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-xl border shadow-sm p-6 ${className}`}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">QR Code สำหรับชำระเงิน</h3>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-inner border-2 border-muted">
            <canvas 
              ref={canvasRef}
              className="rounded"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            สแกน QR Code นี้เพื่อดูรายละเอียดการชำระเงิน
          </p>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs font-mono text-foreground break-all">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRBox;