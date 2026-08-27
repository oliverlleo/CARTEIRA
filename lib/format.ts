export function brl(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(value));
}
export function brDate(value: string) {
  const [year, month, day] = value.slice(0,10).split('-');
  return `${day}/${month}/${year}`;
}
