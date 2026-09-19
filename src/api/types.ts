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

/* ----------------------------------- Área ------------------------------------ */

export interface Area {
	id: number;
	nome: string;
}

/* -------------------------------- Colaborador ------------------------------- */

export const CARGOS = ["COLABORADOR", "GESTOR"] as const;

export type Cargo = (typeof CARGOS)[number];

export const CARGO_LABEL: Record<Cargo, string> = {
	COLABORADOR: "Colaborador",
	GESTOR: "Gestor",
};

export interface Colaborador {
	id: number;
	matricula: string;
	nome: string;
	area: Area;
	cargo: Cargo;
}

export interface ColaboradorRequest {
	matricula: string;
	nome: string;
	areaId: number;
	cargo: Cargo;
}

/** Formato exigido pelo backend: 4 dígitos, hífen, 1 dígito (ex: 0001-1). */
export const MATRICULA_REGEX = /^\d{4}-\d$/;

/* ----------------------------------- Viagem --------------------------------- */

export const SITUACOES_VIAGEM = [
	"RASCUNHO",
	"SOLICITADA",
	"EM_AJUSTE",
	"APROVADA",
	"REJEITADA",
	"CANCELADA",
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
	/**
	 * Preenchido pelo gestor quando pede EM_AJUSTE; é o que a tela do
	 * solicitante mostra como "o que corrigir". Null nos demais estados —
	 * o backend limpa automaticamente ao reenviar a viagem.
	 */
	motivoAjuste: string | null;
}

export interface ViagemRequest {
	destinoId: number;
	colaboradorId: number;
	motivo: string;
	dataSaida: string;
	dataRetorno: string;
	meioTransporte: MeioTransporte;
}

/**
 * Histórico de mudanças de situação de uma viagem.
 * PLACEHOLDER — formato do item ainda não confirmado com o backend
 * (GET /viagens/{id}/historico). Ajuste os campos assim que o contrato
 * real da API for definido.
 */
export interface HistoricoViagemItem {
	id: number;
	situacao: SituacaoViagem;
	/** ISO datetime — quando a mudança ocorreu. */
	data: string;
	responsavel: Pick<Colaborador, "id" | "nome" | "matricula">;
	/** Justificativa de rejeição ou texto de ajuste, quando aplicável. */
	observacao: string | null;
}

/**
 * Histórico de cargo/área do colaborador ao longo do tempo (lotação).
 * PLACEHOLDER — formato do item ainda não confirmado com o backend
 * (GET /colaboradores/{id}/lotacoes).
 */
export interface LotacaoColaboradorItem {
	id: number;
	area: Area;
	cargo: Cargo;
	/** ISO date — início da vigência. */
	dataInicio: string;
	/** ISO date — fim da vigência, ou null se ainda vigente. */
	dataFim: string | null;
}

/* ----------------------------------- Rótulos -------------------------------- */

export const SITUACAO_LABEL: Record<SituacaoViagem, string> = {
	RASCUNHO: "Rascunho",
	SOLICITADA: "Solicitada",
	EM_AJUSTE: "Em ajuste",
	APROVADA: "Aprovada",
	REJEITADA: "Rejeitada",
	CANCELADA: "Cancelada",
};

export const MEIO_TRANSPORTE_LABEL: Record<MeioTransporte, string> = {
	AEREO: "Aéreo",
	RODOVIARIO: "Rodoviário",
	FERROVIARIO: "Ferroviário",
	VEICULO_PROPRIO: "Veículo próprio",
	OUTRO: "Outro",
};

/**
 * A viagem é editável em rascunho e também quando o gestor pede ajuste
 * (o colaborador precisa poder corrigir os dados antes de reenviar).
 */
export function podeEditarViagem(situacao: SituacaoViagem): boolean {
	return ["RASCUNHO", "EM_AJUSTE"].includes(situacao);
}

/** Exclusão definitiva só é permitida em rascunho; depois disso o caminho é cancelar. */
export function podeExcluirViagem(situacao: SituacaoViagem): boolean {
	return situacao === "RASCUNHO";
}

/**
 * O solicitante pode enviar (ou reenviar, após ajuste) para análise sempre
 * que a viagem estiver editável.
 */
export function podeSolicitarViagem(situacao: SituacaoViagem): boolean {
	return podeEditarViagem(situacao);
}

/**
 * ASSUNÇÃO A CONFIRMAR COM O BACKEND: a task do scrum master diz "depois de
 * submetida, o caminho é cancelar", então tratamos cancelar como disponível
 * em qualquer estado não-terminal (não só em rascunho). Se o backend só
 * aceitar cancelamento em RASCUNHO, restrinja esta função.
 */
export function podeCancelarViagem(situacao: SituacaoViagem): boolean {
	return ["RASCUNHO", "SOLICITADA", "EM_AJUSTE"].includes(situacao);
}

/** Ações do gestor só fazem sentido com a viagem aguardando análise. */
export function podeGestorAgir(situacao: SituacaoViagem): boolean {
	return situacao === "SOLICITADA";
}

/** Estados que encerram o fluxo da viagem — não mudam mais de situação. */
export function situacaoEncerrada(situacao: SituacaoViagem): boolean {
	return ["APROVADA", "REJEITADA", "CANCELADA"].includes(situacao);
}
