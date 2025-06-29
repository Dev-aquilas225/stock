import React from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Grid3X3, List, X } from 'lucide-react';
import Button from '../UI/Button';

interface QRCodePrintProps {
  qrCodes: Array<{
    id: string;
    qrCode: string;
    serialNumber: string;
    productName: string;
    status: string;
  }>;
  onClose: () => void;
  isOpen: boolean;
}

const QRCodePrint: React.FC<QRCodePrintProps> = ({ qrCodes, onClose, isOpen }) => {
  const [layout, setLayout] = React.useState<'grid' | 'list'>('grid');
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    if (selectAll) {
      setSelectedCodes(qrCodes.map(qr => qr.id));
    } else {
      setSelectedCodes([]);
    }
  }, [selectAll, qrCodes]);

  const toggleSelection = (id: string) => {
    setSelectedCodes(prev => 
      prev.includes(id) 
        ? prev.filter(codeId => codeId !== id)
        : [...prev, id]
    );
  };

  const generateQRCodeSVG = (text: string, size: number = 100) => {
    // Simple QR code placeholder - in production, use a proper QR code library
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white"/>
        <rect x="10" y="10" width="20" height="20" fill="black"/>
        <rect x="70" y="10" width="20" height="20" fill="black"/>
        <rect x="10" y="70" width="20" height="20" fill="black"/>
        <rect x="40" y="40" width="20" height="20" fill="black"/>
        <text x="50" y="95" text-anchor="middle" font-size="6" fill="black">${text}</text>
      </svg>
    `;
  };

  const handlePrint = () => {
    const selectedQRs = qrCodes.filter(qr => selectedCodes.includes(qr.id));
    
    if (selectedQRs.length === 0) {
      alert('Veuillez sélectionner au moins un QR code à imprimer');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Impression</title>
          <style>
            @page {
              margin: 1cm;
              size: A4;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #223B7B;
              padding-bottom: 20px;
            }
            
            .header h1 {
              color: #223B7B;
              margin: 0;
              font-size: 24px;
            }
            
            .header p {
              color: #666;
              margin: 5px 0 0 0;
              font-size: 14px;
            }
            
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(${layout === 'grid' ? '3, 1fr' : '1, 1fr'});
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .qr-item {
              border: 2px solid #223B7B;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              background: white;
              page-break-inside: avoid;
              ${layout === 'list' ? 'display: flex; align-items: center; text-align: left;' : ''}
            }
            
            .qr-code {
              ${layout === 'list' ? 'margin-right: 20px; flex-shrink: 0;' : 'margin-bottom: 10px;'}
            }
            
            .qr-info h3 {
              color: #223B7B;
              margin: 0 0 5px 0;
              font-size: ${layout === 'grid' ? '14px' : '16px'};
              font-weight: bold;
            }
            
            .qr-info p {
              margin: 2px 0;
              font-size: ${layout === 'grid' ? '10px' : '12px'};
              color: #666;
            }
            
            .qr-code-text {
              font-family: monospace;
              font-weight: bold;
              color: #34C759;
              font-size: ${layout === 'grid' ? '9px' : '11px'};
              word-break: break-all;
            }
            
            .footer {
              position: fixed;
              bottom: 1cm;
              left: 1cm;
              right: 1cm;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            
            @media print {
              .no-print {
                display: none !important;
              }
              
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NexSaaS - QR Codes Produits</h1>
            <p>Générés le ${new Date().toLocaleDateString('fr-FR')} • ${selectedQRs.length} code(s)</p>
          </div>
          
          <div class="qr-grid">
            ${selectedQRs.map(qr => `
              <div class="qr-item">
                <div class="qr-code">
                  ${generateQRCodeSVG(qr.qrCode, layout === 'grid' ? 80 : 60)}
                </div>
                <div class="qr-info">
                  <h3>${qr.productName}</h3>
                  <p><strong>Série:</strong> ${qr.serialNumber}</p>
                  <p><strong>Statut:</strong> ${qr.status}</p>
                  <p class="qr-code-text">${qr.qrCode}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>NexSaaS ERP System • Codes QR générés automatiquement • ${window.location.hostname}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const selectedQRs = qrCodes.filter(qr => selectedCodes.includes(qr.id));
    
    if (selectedQRs.length === 0) {
      alert('Veuillez sélectionner au moins un QR code à télécharger');
      return;
    }

    // Simulate PDF download
    const blob = new Blob(['QR Codes PDF content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImages = () => {
    const selectedQRs = qrCodes.filter(qr => selectedCodes.includes(qr.id));
    
    if (selectedQRs.length === 0) {
      alert('Veuillez sélectionner au moins un QR code à télécharger');
      return;
    }

    // Download each QR code as individual PNG
    selectedQRs.forEach((qr, index) => {
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        
        if (ctx) {
          // Simple QR code pattern
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = 'black';
          
          // Draw QR pattern
          ctx.fillRect(20, 20, 40, 40);
          ctx.fillRect(140, 20, 40, 40);
          ctx.fillRect(20, 140, 40, 40);
          ctx.fillRect(80, 80, 40, 40);
          
          // Add text
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(qr.qrCode, 100, 190);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${qr.qrCode}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      }, index * 100); // Stagger downloads
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nexsaas-light-gray dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              Impression QR Codes
            </h2>
            <p className="text-nexsaas-vanta-black dark:text-gray-300">
              {qrCodes.length} code(s) disponible(s) • {selectedCodes.length} sélectionné(s)
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-nexsaas-light-gray dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                  className="mr-2 rounded border-nexsaas-light-gray focus:ring-nexsaas-saas-green"
                />
                <span className="text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Tout sélectionner
                </span>
              </label>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Disposition:
                </span>
                <Button
                  variant={layout === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setLayout('grid')}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Grille
                </Button>
                <Button
                  variant={layout === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setLayout('list')}
                >
                  <List className="w-4 h-4 mr-1" />
                  Liste
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleDownloadImages}>
                <Download className="w-4 h-4 mr-2" />
                Images PNG
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </div>

        {/* QR Codes Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className={`grid gap-4 ${
            layout === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {qrCodes.map((qr, index) => (
              <motion.div
                key={qr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedCodes.includes(qr.id)
                    ? 'border-nexsaas-saas-green bg-green-50 dark:bg-green-900/20'
                    : 'border-nexsaas-light-gray dark:border-gray-600 hover:border-nexsaas-saas-green'
                } ${layout === 'list' ? 'flex items-center' : 'text-center'}`}
                onClick={() => toggleSelection(qr.id)}
              >
                <div className={`${layout === 'list' ? 'mr-4 flex-shrink-0' : 'mb-3'}`}>
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: generateQRCodeSVG(qr.qrCode, 60) 
                      }} 
                    />
                  </div>
                </div>
                
                <div className={layout === 'list' ? 'flex-1' : ''}>
                  <h3 className={`font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 ${
                    layout === 'list' ? 'text-left' : ''
                  }`}>
                    {qr.productName}
                  </h3>
                  <p className={`text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-1 ${
                    layout === 'list' ? 'text-left' : ''
                  }`}>
                    <strong>Série:</strong> {qr.serialNumber}
                  </p>
                  <p className={`text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-2 ${
                    layout === 'list' ? 'text-left' : ''
                  }`}>
                    <strong>Statut:</strong> {qr.status}
                  </p>
                  <p className={`text-xs font-mono text-nexsaas-saas-green ${
                    layout === 'list' ? 'text-left' : ''
                  }`}>
                    {qr.qrCode}
                  </p>
                </div>
                
                {selectedCodes.includes(qr.id) && (
                  <div className={`${layout === 'list' ? 'ml-4' : 'mt-2'}`}>
                    <div className="w-6 h-6 bg-nexsaas-saas-green rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-nexsaas-light-gray dark:border-gray-700 bg-nexsaas-light-gray dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              <p><strong>Conseils d'impression:</strong></p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                <li>Utilisez du papier blanc de qualité pour une meilleure lisibilité</li>
                <li>Vérifiez que l'imprimante est configurée en haute qualité</li>
                <li>Testez la lecture des codes avec votre scanner avant impression en masse</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                {selectedCodes.length} code(s) sélectionné(s)
              </p>
              <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                Prêt pour l'impression
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodePrint;