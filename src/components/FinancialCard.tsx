import React from 'react';
import { TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

interface FinancialCardProps {
  type: 'profit' | 'savings' | 'risk';
  title: string;
  amount: string;
  subtitle: string;
}

export default function FinancialCard({ type, title, amount, subtitle }: FinancialCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'profit':
        return <TrendingUp className="w-6 h-6" />;
      case 'savings':
        return <DollarSign className="w-6 h-6" />;
      case 'risk':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <DollarSign className="w-6 h-6" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'profit':
        return 'text-green-600 bg-green-100';
      case 'savings':
        return 'text-blue-600 bg-blue-100';
      case 'risk':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAmountColor = () => {
    switch (type) {
      case 'profit':
        return 'text-green-600';
      case 'savings':
        return 'text-blue-600';
      case 'risk':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses()}`}>
          {getIcon()}
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      
      <div className={`text-3xl font-bold mb-2 ${getAmountColor()}`}>
        {amount}
      </div>
      
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}