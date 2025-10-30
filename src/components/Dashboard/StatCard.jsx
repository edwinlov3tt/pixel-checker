import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, change, trend }) => {
  const isPositive = trend === 'positive';

  return (
    <div className="glassmorphism-card p-6 fade-in">
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {change && (
        <div className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;