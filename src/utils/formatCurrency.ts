export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount < 0) return '0 đ';
  return `${Math.round(amount).toLocaleString('vi-VN')} đ`;
};