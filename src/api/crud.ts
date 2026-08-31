import api from "#/api/client";

/**
 * As três entidades da API expõem exatamente o mesmo CRUD REST
 * (GET /x, GET /x/:id, POST /x, PUT /x/:id, DELETE /x/:id).
 * Esta fábrica evita repetir as cinco funções para cada uma.
 */
export function createCrudResource<TResponse, TRequest>(path: string) {
	return {
		list: async (): Promise<TResponse[]> => {
			const { data } = await api.get<TResponse[]>(path);
			return data;
		},
		get: async (id: number): Promise<TResponse> => {
			const { data } = await api.get<TResponse>(`${path}/${id}`);
			return data;
		},
		create: async (payload: TRequest): Promise<TResponse> => {
			const { data } = await api.post<TResponse>(path, payload);
			return data;
		},
		update: async (id: number, payload: TRequest): Promise<TResponse> => {
			const { data } = await api.put<TResponse>(`${path}/${id}`, payload);
			return data;
		},
		remove: async (id: number): Promise<void> => {
			await api.delete(`${path}/${id}`);
		},
	};
}
