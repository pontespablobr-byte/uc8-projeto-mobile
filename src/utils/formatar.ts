// Funções de formatação portadas do renderer.ts do projeto desktop.
// Nenhuma depende de Intl nem de toLocaleString: o resultado é o mesmo
// em qualquer aparelho e no navegador.

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function agruparMilhares(inteiro: string): string {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// 350 -> "R$ 350,00" | 1234.5 -> "R$ 1.234,50"
export function formatarMoeda(valor: number): string {
  const sinal = valor < 0 ? '-' : '';
  const centavos = Math.round(Math.abs(valor) * 100);
  const inteiro = String(Math.floor(centavos / 100));
  const decimais = String(centavos % 100).padStart(2, '0');
  return `${sinal}R$ ${agruparMilhares(inteiro)},${decimais}`;
}

// "2026-09-18" ou "2026-09-18T10:30:00Z" -> "18/09/2026"
// Texto que não começa com AAAA-MM-DD volta como veio.
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split('-');
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

// "84988887777" -> "(84) 98888-7777" | "8433334444" -> "(84) 3333-4444"
// Também serve para formatar enquanto a pessoa digita.
export function formatarTelefone(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

// 85000 -> "85.000 km"
export function formatarQuilometragem(km: number): string {
  return `${agruparMilhares(String(Math.round(km)))} km`;
}

// "qwe1234" -> "QWE-1234" (modelo antigo) | "abc1d23" -> "ABC1D23" (Mercosul)
export function formatarPlaca(valor: string): string {
  const limpa = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
  if (/^[A-Z]{3}\d{4}$/.test(limpa)) return `${limpa.slice(0, 3)}-${limpa.slice(3)}`;
  return limpa;
}
