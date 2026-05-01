/**
 * Máscaras de input — formatação progressiva enquanto o usuário digita.
 * Aceitam o valor cru, retornam o valor formatado pra exibir.
 */

/** 000.000.000-00 */
export function maskCPF(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3)  return d;
  if (d.length <= 6)  return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9)  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

/** (DD) 9XXXX-XXXX  ou  (DD) XXXX-XXXX */
export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0)   return '';
  if (d.length <= 2)    return `(${d}`;
  if (d.length <= 6)    return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10)   return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

/** Remove todos não-dígitos. */
export function digitsOnly(v: string): string {
  return v.replace(/\D/g, '');
}

/** Validação básica CPF (não verifica DV, só formato). */
export function isCPFValid(v: string): boolean {
  return digitsOnly(v).length === 11;
}

/** Validação básica celular BR (10-11 dígitos). */
export function isPhoneValid(v: string): boolean {
  const d = digitsOnly(v);
  return d.length >= 10 && d.length <= 11;
}
