
function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function agruparMilhares(inteiro: string): string {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatarMoeda(valor: number): string {
  const sinal = valor < 0 ? '-' : '';
  const centavos = Math.round(Math.abs(valor) * 100);
  const inteiro = String(Math.floor(centavos / 100));
  const decimais = String(centavos % 100).padStart(2, '0');
  return `${sinal}R$ ${agruparMilhares(inteiro)},${decimais}`;
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split('-');
  if (!ano || !mes || !dia) return data;
  if (data.length === 10) return `${dia}/${mes}/${ano}`;

  const momento = new Date(data.replace(/(\.\d{3})\d+/, '$1'));
  if (Number.isNaN(momento.getTime())) return `${dia}/${mes}/${ano}`;

  const diaLocal = String(momento.getDate()).padStart(2, '0');
  const mesLocal = String(momento.getMonth() + 1).padStart(2, '0');
  return `${diaLocal}/${mesLocal}/${momento.getFullYear()}`;
}

export function formatarTelefone(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function formatarQuilometragem(km: number): string {
  return `${agruparMilhares(String(Math.round(km)))} km`;
}

export function formatarPlaca(valor: string): string {
  const limpa = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
  if (/^[A-Z]{3}\d{4}$/.test(limpa)) return `${limpa.slice(0, 3)}-${limpa.slice(3)}`;
  return limpa;
}

export function lerInteiro(texto: string): number | null {
  const limpo = texto.replace(/\s/g, '');
  if (!/^\d+$|^\d{1,3}(\.\d{3})+$/.test(limpo)) return null;
  return Number(limpo.replace(/\./g, ''));
}

const valorComMilhar =/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/;
const valorSemMilhar = /^\d+([.,]\d{1,2})?$/;

export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/\s/g, '');
  if (valorComMilhar.test(limpo)) {
    return Number(limpo.replace(/\./g, '').replace(',', '.'));
  }
  if (valorSemMilhar.test(limpo)) {
    return Number(limpo.replace(',', '.'));
  }
  return null;
}
