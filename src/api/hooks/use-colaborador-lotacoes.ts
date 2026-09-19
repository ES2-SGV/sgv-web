import { useQuery } from "@tanstack/react-query";
import api from "#/api/client";
import { queryKeys } from "#/api/query-keys";
import type { LotacaoColaboradorItem } from "#/api/types";

/** GET /colaboradores/{id}/lotacoes — linha do tempo de cargo/área do colaborador. */
export function useColaboradorLotacoes(id: number | undefined) {
	return useQuery({
		queryKey: queryKeys.colaboradores.lotacoes(id as number),
		queryFn: async () => {
			const { data } = await api.get<LotacaoColaboradorItem[]>(
				`/colaboradores/${id}/lotacoes`,
			);
			return data;
		},
		enabled: id !== undefined,
	});
}
