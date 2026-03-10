export const formatCurrency = (value: number): string => {
  if (value === 0) return '$0.00';
  const decimals = value < 0.01 ? 6 : value < 1 ? 4 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};


export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const calcPercentChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    minute: '2-digit',
    second: '2-digit',
  });
};
