import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { ApiRequestError } from "#/api/client";
import { createCrudResource } from "#/api/crud";
import { queryKeys } from "#/api/query-keys";
import type { Viagem, ViagemRequest } from "#/api/types";

const viagens = createCrudResource<Viagem, ViagemRequest>("/viagens");

export const viagensQueryOptions = () =>
	queryOptions({ queryKey: queryKeys.viagens.all, queryFn: viagens.list });

export const viagemQueryOptions = (id: number) =>
	queryOptions({
		queryKey: queryKeys.viagens.detail(id),
		queryFn: () => viagens.get(id),
	});

export function useViagens() {
	return useQuery(viagensQueryOptions());
}

export function useViagem(id: number | undefined) {
	return useQuery({
		...viagemQueryOptions(id as number),
		enabled: id !== undefined,
	});
}

function useInvalidateViagens() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.viagens.all });
}

export function useCreateViagem() {
	const invalidate = useInvalidateViagens();
	return useMutation<Viagem, ApiRequestError, ViagemRequest>({
		mutationFn: viagens.create,
		onSuccess: invalidate,
	});
}

export function useUpdateViagem() {
	const invalidate = useInvalidateViagens();
	return useMutation<
		Viagem,
		ApiRequestError,
		{ id: number; payload: ViagemRequest }
	>({
		mutationFn: ({ id, payload }) => viagens.update(id, payload),
		onSuccess: invalidate,
	});
}

export function useDeleteViagem() {
	const invalidate = useInvalidateViagens();
	return useMutation<void, ApiRequestError, number>({
		mutationFn: viagens.remove,
		onSuccess: invalidate,
	});
}
