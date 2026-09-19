import { useQuery } from "@tanstack/react-query";
import api from "#/api/client";
import { queryKeys } from "#/api/query-keys";
import type { HistoricoViagemItem } from "#/api/types";

/** GET /viagens/{id}/historico — usado no drawer de linha do tempo da viagem. */
export function useViagemHistorico(id: number | undefined) {
	return useQuery({
		queryKey: queryKeys.viagens.historico(id as number),
		queryFn: async () => {
			const { data } = await api.get<HistoricoViagemItem[]>(
				`/viagens/${id}/historico`,
			);
			return data;
		},
		enabled: id !== undefined,
	});
}
