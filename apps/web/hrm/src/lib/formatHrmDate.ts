/** Safe vi-VN date — avoids epoch display for null/invalid API values. */
export function formatHrmDateVi(value: string | null | undefined): string {
  if (!value || value === '0') return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return '-';
  return d.toLocaleDateString('vi-VN');
}
