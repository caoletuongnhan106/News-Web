import React from 'react';

const ContradictionBadge = ({ type, confidence }) => {
  if (!type) return null;
  
  const badgeConfig = {
    'No-Contradiction': {
      bgColor: '#d3f9d8',
      textColor: '#2b8a3e',
      label: 'No Contradiction'
    },
    'Numerical': { 
      bgColor: '#ffe5e5',
      textColor: '#c92a2a',
      label: 'Numerical'
    },
    'Entity': { 
      bgColor: '#e9ecef',
      textColor: '#495057',
      label: 'Entity'
    },
    'Temporal': { 
      bgColor: '#fff3e0',
      textColor: '#e67700',
      label: 'Temporal'
    },
    'Factual': { 
      bgColor: '#e7f5ff',
      textColor: '#1971c2',
      label: 'Factual'
    }
  };
  
  const config = badgeConfig[type] || badgeConfig['Factual'];
  
  return (
    <span 
      style={{ 
        backgroundColor: config.bgColor,
        color: config.textColor,
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        marginLeft: '8px',
        display: 'inline-block'
      }}
      title={`Confidence: ${(confidence * 100).toFixed(0)}%`}
    >
      {config.label}
    </span>
  );
};

export default ContradictionBadge;
