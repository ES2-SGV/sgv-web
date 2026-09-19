/**
 * Chaves de localStorage centralizadas. Ficam num arquivo à parte (em vez de
 * dentro de session.tsx) porque api/client.ts também precisa dela para montar
 * o header X-Colaborador-Id, e client.ts não pode depender de session.tsx sem
 * criar um ciclo de importação (session -> hooks -> crud -> client).
 */
export const STORAGE_KEY_COLABORADOR = "sgv:colaboradorId";
