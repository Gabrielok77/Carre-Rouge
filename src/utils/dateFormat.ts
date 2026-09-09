export function formatDateDDMMYYYY(dateValue: string): string {
  const datePart = dateValue.slice(0, 10);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
