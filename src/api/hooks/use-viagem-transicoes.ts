import { useMutation, useQueryClient } from "@tanstack/react-query";
import api, { type ApiRequestError } from "#/api/client";
import { queryKeys } from "#/api/query-keys";
import type { Viagem } from "#/api/types";

/**
 * PLACEHOLDER — nenhum destes paths foi confirmado com o backend ainda. A
 * task só definiu que "toda ação de transição, mais PUT e DELETE
 * /viagens/{id}, exige o header X-Colaborador-Id" — os paths abaixo são um
 * chute razoável (POST /viagens/{id}/<ação>). Ajuste aqui assim que o
 * contrato real da API for fechado; como tudo passa por este único arquivo,
 * a mudança não deve vazar para os componentes que usam os hooks.
 */
const ENDPOINT = {
	solicitar: (id: number) => `/viagens/${id}/solicitar`,
	cancelar: (id: number) => `/viagens/${id}/cancelar`,
	aprovar: (id: number) => `/viagens/${id}/aprovar`,
	rejeitar: (id: number) => `/viagens/${id}/rejeitar`,
	solicitarAjuste: (id: number) => `/viagens/${id}/solicitar-ajuste`,
} as const;

function useInvalidateViagem(id: number) {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.viagens.all });
		queryClient.invalidateQueries({ queryKey: queryKeys.viagens.detail(id) });
		queryClient.invalidateQueries({
			queryKey: queryKeys.viagens.historico(id),
		});
	};
}

/** Rascunho/Em ajuste -> Solicitada. Reaproveitado para o reenvio pós-ajuste. */
export function useSolicitarViagem(id: number) {
	const invalidate = useInvalidateViagem(id);
	return useMutation<Viagem, ApiRequestError, void>({
		mutationFn: async () => {
			const { data } = await api.post<Viagem>(ENDPOINT.solicitar(id));
			return data;
		},
		onSuccess: invalidate,
	});
}

/** Rascunho/Solicitada/Em ajuste -> Cancelada. Encerra o fluxo. */
export function useCancelarViagem(id: number) {
	const invalidate = useInvalidateViagem(id);
	return useMutation<Viagem, ApiRequestError, void>({
		mutationFn: async () => {
			const { data } = await api.post<Viagem>(ENDPOINT.cancelar(id));
			return data;
		},
		onSuccess: invalidate,
	});
}

/** Somente gestor, com a viagem Solicitada. Solicitada -> Aprovada. Encerra o fluxo. */
export function useAprovarViagem(id: number) {
	const invalidate = useInvalidateViagem(id);
	return useMutation<Viagem, ApiRequestError, void>({
		mutationFn: async () => {
			const { data } = await api.post<Viagem>(ENDPOINT.aprovar(id));
			return data;
		},
		onSuccess: invalidate,
	});
}

/**
 * Somente gestor, com a viagem Solicitada. Solicitada -> Rejeitada. Encerra o
 * fluxo. PLACEHOLDER: assumimos que a justificativa vai no corpo como
 * `{ motivo }` — confirmar nome do campo com o backend.
 */
export function useRejeitarViagem(id: number) {
	const invalidate = useInvalidateViagem(id);
	return useMutation<Viagem, ApiRequestError, string>({
		mutationFn: async (motivo) => {
			const { data } = await api.post<Viagem>(ENDPOINT.rejeitar(id), {
				motivo,
			});
			return data;
		},
		onSuccess: invalidate,
	});
}

/**
 * Somente gestor, com a viagem Solicitada. Solicitada -> Em ajuste, gravando
 * o texto que o solicitante vai ver em `viagem.motivoAjuste`. PLACEHOLDER:
 * assumimos `{ motivoAjuste }` no corpo — confirmar com o backend.
 */
export function useSolicitarAjusteViagem(id: number) {
	const invalidate = useInvalidateViagem(id);
	return useMutation<Viagem, ApiRequestError, string>({
		mutationFn: async (motivoAjuste) => {
			const { data } = await api.post<Viagem>(ENDPOINT.solicitarAjuste(id), {
				motivoAjuste,
			});
			return data;
		},
		onSuccess: invalidate,
	});
}
