export function formatCrmDate(value: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value) ? value.replace(' ', 'T') + ':00Z' : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit',
  }).format(date);
}
