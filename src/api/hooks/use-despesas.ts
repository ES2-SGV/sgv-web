import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { type ApiRequestError } from "#/api/client";
import { queryKeys } from "#/api/query-keys";
import type { Despesa, DespesaRequest } from "#/api/types";

/**
 * Toda mutação de despesa muda o `valorTotal` da viagem (o backend recalcula
 * e devolve isso em qualquer rota de viagem — GET /viagens, GET /viagens/{id}
 * etc.), então invalidamos a lista/detalhe de viagens junto com a lista de
 * despesas, e não só a própria despesa.
 */
function useInvalidateDespesas(viagemId: number) {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({
			queryKey: queryKeys.viagens.despesas(viagemId),
		});
		queryClient.invalidateQueries({ queryKey: queryKeys.viagens.all });
		queryClient.invalidateQueries({
			queryKey: queryKeys.viagens.detail(viagemId),
		});
	};
}

/** GET /viagens/{id}/despesas */
export function useDespesasDaViagem(viagemId: number | undefined) {
	return useQuery({
		queryKey: queryKeys.viagens.despesas(viagemId as number),
		queryFn: async () => {
			const { data } = await api.get<Despesa[]>(
				`/viagens/${viagemId}/despesas`,
			);
			return data;
		},
		enabled: viagemId !== undefined,
	});
}

/** POST /viagens/{id}/despesas */
export function useCreateDespesa(viagemId: number) {
	const invalidate = useInvalidateDespesas(viagemId);
	return useMutation<Despesa, ApiRequestError, DespesaRequest>({
		mutationFn: async (payload) => {
			const { data } = await api.post<Despesa>(
				`/viagens/${viagemId}/despesas`,
				payload,
			);
			return data;
		},
		onSuccess: invalidate,
	});
}

/** DELETE /viagens/{idViagem}/despesas/{idDespesa} */
export function useDeleteDespesa(viagemId: number) {
	const invalidate = useInvalidateDespesas(viagemId);
	return useMutation<void, ApiRequestError, number>({
		mutationFn: async (despesaId) => {
			await api.delete(`/viagens/${viagemId}/despesas/${despesaId}`);
		},
		onSuccess: invalidate,
	});
}
