/**
 * api-error.ts — extrator único de mensagens de erro vindas da API NestJS.
 *
 * Formato padrão NestJS:
 *   { statusCode, message: string | string[], error: "Bad Request" | "Conflict" | ... }
 *
 * Preferimos `message` (explicação real) sobre `error` (status text genérico).
 */

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string | { message?: string | string[] };
  timestamp?: string;
  path?: string;
}

export interface ApiError extends Error {
  status?: number;
  body?: ApiErrorBody;
}

/**
 * Extrai mensagem amigável de um erro da API.
 * Prioridade: body.message → body.error.message → body.error → fallback.
 */
export function extractApiMessage(err: unknown, fallback = 'Não foi possível concluir a operação. Tente novamente.'): string {
  const apiErr = err as ApiError;
  const body = apiErr.body;
  if (!body) return fallback;

  // 1. body.message (formato NestJS padrão)
  if (body.message) {
    return Array.isArray(body.message) ? body.message.join(' · ') : body.message;
  }

  // 2. body.error.message (caso aninhado)
  if (typeof body.error === 'object' && body.error?.message) {
    return Array.isArray(body.error.message) ? body.error.message.join(' · ') : body.error.message;
  }

  // 3. body.error string (último recurso, pode ser apenas "Conflict")
  if (typeof body.error === 'string' && body.error.length > 0) {
    return translateStatus(body.error, body.statusCode);
  }

  return fallback;
}

function translateStatus(error: string, code?: number): string {
  const map: Record<string, string> = {
    'Conflict':            'Já existe um cadastro com esses dados.',
    'Bad Request':         'Dados inválidos. Confira e tente de novo.',
    'Unauthorized':        'Sessão expirada. Faça login novamente.',
    'Forbidden':           'Você não tem permissão para esta ação.',
    'Not Found':           'Não encontramos o que você procura.',
    'Internal Server Error': 'Erro inesperado no servidor. Tente novamente em instantes.',
  };
  return map[error] ?? `${error}${code ? ` (${code})` : ''}`;
}
