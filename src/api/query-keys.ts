/** Chaves de cache do react-query, centralizadas para evitar invalidação errada. */
export const queryKeys = {
	destinos: {
		all: ["destinos"] as const,
		detail: (id: number) => ["destinos", id] as const,
	},
	colaboradores: {
		all: ["colaboradores"] as const,
		detail: (id: number) => ["colaboradores", id] as const,
	},
	viagens: {
		all: ["viagens"] as const,
		detail: (id: number) => ["viagens", id] as const,
	},
};
