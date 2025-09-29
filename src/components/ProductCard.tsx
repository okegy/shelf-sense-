import { Product } from '../types/index';
import { formatDate } from '../utils/dateUtils';
import { Calendar, Package, DollarSign, Thermometer, Droplets } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getStatusColor = () => {
    switch (product.status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (product.status) {
      case 'safe':
        return 'Fresh & Safe';
      case 'warning':
        return 'Near Expiry (20% OFF)';
      case 'danger':
        return 'Expiring Soon (30% OFF)';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white flex-1">{product.name}</h3>
        <div className="bg-black/30 text-white px-3 py-1 rounded-lg font-mono text-sm">
          {product.barcode}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="font-medium text-white">{getStatusText()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
          <Package className="w-4 h-4 text-white/70" />
          <div>
            <div className="font-semibold text-white">{product.count}</div>
            <div className="text-xs text-white/70">Units</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-white/70" />
          <div>
            <div className="font-semibold text-sm text-white">{formatDate(product.expiry)}</div>
            <div className="text-xs text-white/70">Expiry</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-white/70" />
          <div>
            {product.discountedPrice ? (
              <>
                <div className="font-semibold text-green-600">₹{product.discountedPrice}</div>
                <div className="text-xs text-white/70 line-through">₹{product.price}</div>
              </>
            ) : (
              <>
                <div className="font-semibold text-white">₹{product.price}</div>
                <div className="text-xs text-white/70">Price</div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="font-semibold text-white">{product.freshness}</div>
          <div className="text-xs text-white/70">Freshness</div>
        </div>
      </div>

      {/* Additional sensor data for fresh produce */}
      {(product.humidity || product.temperature || product.ethylene) && (
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20">
          {product.humidity && (
            <div className="text-center">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <div className="text-xs font-semibold text-white">{product.humidity}</div>
              <div className="text-xs text-white/70">Humidity</div>
            </div>
          )}
          
          {product.temperature && (
            <div className="text-center">
              <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <div className="text-xs font-semibold text-white">{product.temperature}</div>
              <div className="text-xs text-white/70">Temp</div>
            </div>
          )}
          
          {product.ethylene && (
            <div className="text-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full mx-auto mb-1"></div>
              <div className="text-xs font-semibold text-white">{product.ethylene}</div>
              <div className="text-xs text-white/70">Ethylene</div>
            </div>
          )}
        </div>
      )}

      {product.status !== 'safe' && (
        <div className={`mt-4 p-3 rounded-lg ${product.status === 'warning' ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <div className="font-semibold text-sm text-white">Smart Recommendation:</div>
              <div className="text-sm text-white/80">
                Apply automatic discount to reduce wastage and boost sales!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}