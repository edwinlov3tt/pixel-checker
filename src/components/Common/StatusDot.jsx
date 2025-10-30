import React from 'react';
import Tooltip from './Tooltip';

const StatusDot = ({ status, tooltip }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'active':
        return 'status-green';
      case 'missing':
        return 'status-red';
      case 'blocked':
        return 'status-amber';
      default:
        return 'bg-gray-500';
    }
  };

  const dotElement = (
    <span className={`status-dot ${getStatusClass()}`} />
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{dotElement}</Tooltip>;
  }

  return dotElement;
};

export default StatusDot;