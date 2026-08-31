import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { ApiRequestError } from "#/api/client";
import { createCrudResource } from "#/api/crud";
import { queryKeys } from "#/api/query-keys";
import type { Colaborador, ColaboradorRequest } from "#/api/types";

const colaboradores = createCrudResource<Colaborador, ColaboradorRequest>(
	"/colaboradores",
);

export const colaboradoresQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.colaboradores.all,
		queryFn: colaboradores.list,
	});

export const colaboradorQueryOptions = (id: number) =>
	queryOptions({
		queryKey: queryKeys.colaboradores.detail(id),
		queryFn: () => colaboradores.get(id),
	});

export function useColaboradores() {
	return useQuery(colaboradoresQueryOptions());
}

export function useColaborador(id: number | undefined) {
	return useQuery({
		...colaboradorQueryOptions(id as number),
		enabled: id !== undefined,
	});
}

function useInvalidateColaboradores() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.colaboradores.all });
}

export function useCreateColaborador() {
	const invalidate = useInvalidateColaboradores();
	return useMutation<Colaborador, ApiRequestError, ColaboradorRequest>({
		mutationFn: colaboradores.create,
		onSuccess: invalidate,
	});
}

export function useUpdateColaborador() {
	const invalidate = useInvalidateColaboradores();
	return useMutation<
		Colaborador,
		ApiRequestError,
		{ id: number; payload: ColaboradorRequest }
	>({
		mutationFn: ({ id, payload }) => colaboradores.update(id, payload),
		onSuccess: invalidate,
	});
}

export function useDeleteColaborador() {
	const invalidate = useInvalidateColaboradores();
	return useMutation<void, ApiRequestError, number>({
		mutationFn: colaboradores.remove,
		onSuccess: invalidate,
	});
}
