import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/api/api";
import type { Destino, DestinoRequest } from "@/api/types";

export const destinosKey = ["destinos"];

async function fetchDestinos(): Promise<Destino[]> {
	const { data } = await api.get<Destino[]>("/destinos");
	return data;
}

async function fetchDestino(id: number): Promise<Destino> {
	const { data } = await api.get<Destino>(`/destinos/${id}`);
	return data;
}

async function createDestino(payload: DestinoRequest): Promise<Destino> {
	const { data } = await api.post<Destino>("/destinos", payload);
	return data;
}

async function updateDestino(
	id: number,
	payload: DestinoRequest,
): Promise<Destino> {
	const { data } = await api.put<Destino>(`/destinos/${id}`, payload);
	return data;
}

async function deleteDestino(id: number): Promise<void> {
	await api.delete(`/destinos/${id}`);
}

export function useDestino(id: number | undefined) {
	return useQuery<Destino, AxiosError>({
		queryKey: [...destinosKey, id],
		queryFn: () => fetchDestino(id as number),
		enabled: id !== undefined,
	});
}

export function useDestinos() {
	const queryClient = useQueryClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: destinosKey });

	const query = useQuery<Destino[], AxiosError>({
		queryKey: destinosKey,
		queryFn: fetchDestinos,
	});

	const create = useMutation<Destino, AxiosError, DestinoRequest>({
		mutationFn: createDestino,
		onSuccess: invalidate,
	});

	const update = useMutation<
		Destino,
		AxiosError,
		{ id: number; payload: DestinoRequest }
	>({
		mutationFn: ({ id, payload }) => updateDestino(id, payload),
		onSuccess: invalidate,
	});

	const remove = useMutation<void, AxiosError, number>({
		mutationFn: deleteDestino,
		onSuccess: invalidate,
	});

	return {
		destinos: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		create,
		update,
		remove,
	};
}

export default useDestinos;
