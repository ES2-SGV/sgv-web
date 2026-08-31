/**
 * Espelho dos DTOs da sgv-api. Ao mexer em um Request/Response no backend,
 * ajuste aqui também.
 */

/* ---------------------------------- Destino --------------------------------- */

export interface Destino {
	id: number;
	nome: string;
	cidade: string;
	pais: string;
}

export interface DestinoRequest {
	nome: string;
	cidade: string;
	pais: string;
}

/* -------------------------------- Colaborador ------------------------------- */

export interface Colaborador {
	id: number;
	matricula: string;
	nome: string;
	area: string;
}

export interface ColaboradorRequest {
	matricula: string;
	nome: string;
	area: string;
}

/* ----------------------------------- Viagem --------------------------------- */

export const SITUACOES_VIAGEM = [
	"RASCUNHO",
	"SOLICITADA",
	"APROVADA",
	"REJEITADA",
] as const;

export type SituacaoViagem = (typeof SITUACOES_VIAGEM)[number];

export const MEIOS_TRANSPORTE = [
	"AEREO",
	"RODOVIARIO",
	"FERROVIARIO",
	"VEICULO_PROPRIO",
	"OUTRO",
] as const;

export type MeioTransporte = (typeof MEIOS_TRANSPORTE)[number];

export interface Viagem {
	id: number;
	destino: Destino;
	colaborador: Colaborador;
	motivo: string;
	/** ISO date (yyyy-MM-dd) — LocalDate no backend. */
	dataSaida: string;
	/** ISO date (yyyy-MM-dd) — LocalDate no backend. */
	dataRetorno: string;
	meioTransporte: MeioTransporte;
	situacao: SituacaoViagem;
}

export interface ViagemRequest {
	destinoId: number;
	colaboradorId: number;
	motivo: string;
	dataSaida: string;
	dataRetorno: string;
	meioTransporte: MeioTransporte;
}

/* ----------------------------------- Rótulos -------------------------------- */

export const SITUACAO_LABEL: Record<SituacaoViagem, string> = {
	RASCUNHO: "Rascunho",
	SOLICITADA: "Solicitada",
	APROVADA: "Aprovada",
	REJEITADA: "Rejeitada",
};

export const MEIO_TRANSPORTE_LABEL: Record<MeioTransporte, string> = {
	AEREO: "Aéreo",
	RODOVIARIO: "Rodoviário",
	FERROVIARIO: "Ferroviário",
	VEICULO_PROPRIO: "Veículo próprio",
	OUTRO: "Outro",
};

/**
 * Regra da especificação: a viagem só pode ser alterada ou excluída enquanto
 * não tiver sido analisada por um gestor.
 */
export function podeEditarViagem(situacao: SituacaoViagem): boolean {
	return situacao === "RASCUNHO" || situacao === "SOLICITADA";
}
