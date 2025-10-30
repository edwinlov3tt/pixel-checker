import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

export default StatsGrid;