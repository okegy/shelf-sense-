import React, { useState } from 'react';
import { X, Camera, Keyboard } from 'lucide-react';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeModal({ isOpen, onClose, onScan }: BarcodeModalProps) {
  const [manualBarcode, setManualBarcode] = useState('');

  if (!isOpen) return null;

  const handleManualScan = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onClose();
    }
  };

  const handleSimulateScan = () => {
    const sampleBarcodes = ['AMU-500-001', 'FRS-TOM-001', 'MAG-2MN-001', 'COK-500-001'];
    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
    onScan(randomBarcode);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualScan();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-500" />
            Barcode Scanner
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          {/* Camera Preview Area */}
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 mb-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">Camera scanner would appear here</p>
            <p className="text-sm text-gray-500">Point camera at barcode to scan automatically</p>
          </div>

          {/* Manual Entry */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Or enter barcode manually:</span>
            </div>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
              placeholder="Enter barcode (e.g., AMU-500-001)"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleManualScan}
              disabled={!manualBarcode.trim()}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              Search Product
            </button>
            
            <button
              onClick={handleSimulateScan}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200"
            >
              🎯 Simulate Random Scan (Demo)
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            In production, this would use device camera for real barcode scanning
          </p>
        </div>
      </div>
    </div>
  );
}