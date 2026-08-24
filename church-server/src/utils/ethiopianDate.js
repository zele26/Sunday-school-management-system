export const toEthiopianDate = (date = new Date()) => {
  return new Intl.DateTimeFormat('am-ET-u-ca-ethiopic', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(date);
};