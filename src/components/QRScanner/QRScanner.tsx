import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Scan } from 'lucide-react';
import Button from '../UI/Button';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestCameraPermission();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate QR code detection after 3 seconds
    setTimeout(() => {
      const mockQRCodes = ['PRD-001', 'PRD-002', 'PRD-003'];
      const randomCode = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
      onScan(randomCode);
      setIsScanning(false);
    }, 3000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold">Scanner QR Code</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative">
        {hasPermission === true ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-64 h-64 border-4 border-nexsaas-saas-green rounded-lg relative"
              >
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                
                {isScanning && (
                  <motion.div
                    animate={{ y: [0, 240, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-0 left-0 w-full h-1 bg-nexsaas-saas-green"
                  />
                )}
              </motion.div>
            </div>

            {/* Scan Button */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={simulateScan}
                disabled={isScanning}
                className="bg-nexsaas-saas-green hover:bg-green-600 text-white px-8 py-4 rounded-full"
              >
                {isScanning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Scan className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <>
                    <Camera className="w-6 h-6 mr-2" />
                    Scanner
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                {hasPermission === false ? 'Accès caméra refusé' : 'Demande d\'accès caméra...'}
              </h3>
              <p className="text-gray-300 mb-6">
                {hasPermission === false 
                  ? 'Veuillez autoriser l\'accès à la caméra pour scanner les codes QR'
                  : 'Autorisation en cours...'
                }
              </p>
              {hasPermission === false && (
                <Button onClick={requestCameraPermission} className="mb-4">
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Input */}
      <div className="bg-black/80 p-4">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Saisir le code manuellement..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:border-nexsaas-saas-green focus:outline-none"
          />
          <Button type="submit" disabled={!manualCode.trim()}>
            Valider
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default QRScanner;