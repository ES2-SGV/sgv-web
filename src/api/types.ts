export interface Destino {
	id: number;
	nome: string;
	cidade: string;
	pais: string;
}

export interface DestinoRequest {
	nome: string;
	cidade: string;
	pais: string;
}
