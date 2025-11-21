export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};

