import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { ApiRequestError } from "#/api/client";
import { createCrudResource } from "#/api/crud";
import { queryKeys } from "#/api/query-keys";
import type { Destino, DestinoRequest } from "#/api/types";

const destinos = createCrudResource<Destino, DestinoRequest>("/destinos");

export const destinosQueryOptions = () =>
	queryOptions({ queryKey: queryKeys.destinos.all, queryFn: destinos.list });

export const destinoQueryOptions = (id: number) =>
	queryOptions({
		queryKey: queryKeys.destinos.detail(id),
		queryFn: () => destinos.get(id),
	});

export function useDestinos() {
	return useQuery(destinosQueryOptions());
}

export function useDestino(id: number | undefined) {
	return useQuery({
		...destinoQueryOptions(id as number),
		enabled: id !== undefined,
	});
}

function useInvalidateDestinos() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.destinos.all });
}

export function useCreateDestino() {
	const invalidate = useInvalidateDestinos();
	return useMutation<Destino, ApiRequestError, DestinoRequest>({
		mutationFn: destinos.create,
		onSuccess: invalidate,
	});
}

export function useUpdateDestino() {
	const invalidate = useInvalidateDestinos();
	return useMutation<
		Destino,
		ApiRequestError,
		{ id: number; payload: DestinoRequest }
	>({
		mutationFn: ({ id, payload }) => destinos.update(id, payload),
		onSuccess: invalidate,
	});
}

export function useDeleteDestino() {
	const invalidate = useInvalidateDestinos();
	return useMutation<void, ApiRequestError, number>({
		mutationFn: destinos.remove,
		onSuccess: invalidate,
	});
}
