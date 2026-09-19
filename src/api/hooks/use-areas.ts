import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "#/api/client";
import { queryKeys } from "#/api/query-keys";
import type { Area } from "#/api/types";

/**
 * PLACEHOLDER — path do endpoint de área ainda não confirmado com o backend.
 * Assumimos GET /areas (mesmo padrão de /destinos e /colaboradores). Só
 * expomos `list` aqui porque, das tasks passadas pelo scrum master, nenhuma
 * pede uma tela de CRUD de área — só o select no formulário de colaborador.
 * Se depois precisar de criar/editar área pelo front, dá pra trocar por
 * `createCrudResource<Area, AreaRequest>("/areas")` igual às outras entidades.
 */
export const areasQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.areas.all,
		queryFn: async () => {
			const { data } = await api.get<Area[]>("/areas");
			return data;
		},
	});

export function useAreas() {
	return useQuery(areasQueryOptions());
}
