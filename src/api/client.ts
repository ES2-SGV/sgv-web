import axios, { type AxiosError } from "axios";

/**
 * Cliente HTTP único da aplicação — nunca escreva URLs absolutas nos hooks.
 *
 * A base URL depende do modo do Vite, não de onde a app está rodando:
 * `npm run dev` usa a de desenvolvimento; `npm run build` (o que roda no
 * dockerfile) usa a de produção. As duas ficam no `.env`, e o valor é embutido
 * no bundle em tempo de build — mudou a URL, precisa buildar de novo.
 */
const baseURL = import.meta.env.PROD
	? (import.meta.env.VITE_PROD_API_BASEURL ?? "http://localhost:8081")
	: (import.meta.env.VITE_DEV_API_BASEURL ?? "http://localhost:8080");

export const api = axios.create({
	baseURL,
	timeout: 20_000,
});

/** Formato de erro devolvido pelo GlobalExceptionHandler da API. */
export interface ApiError {
	status: number;
	message: string;
	/** Erros por campo, presente apenas em respostas 400 de validação. */
	campos?: Record<string, string>;
}

export type ApiRequestError = AxiosError<ApiError>;

const MENSAGENS_POR_STATUS: Record<number, string> = {
	400: "Dados inválidos.",
	404: "Registro não encontrado.",
	409: "Conflito com um registro existente.",
	500: "Erro interno no servidor.",
};

/** Extrai uma mensagem legível de qualquer erro vindo do axios. */
export function getErrorMessage(error: unknown): string {
	const axiosError = error as ApiRequestError | undefined;

	if (axiosError?.response?.data?.message) {
		return axiosError.response.data.message;
	}
	if (axiosError?.response?.status) {
		return (
			MENSAGENS_POR_STATUS[axiosError.response.status] ??
			"Não foi possível concluir a operação."
		);
	}
	if (axiosError?.code === "ECONNABORTED") {
		return "A API demorou demais para responder.";
	}
	return "Não foi possível conectar à API.";
}

/** Erros de validação por campo, para preencher um formulário. */
export function getFieldErrors(error: unknown): Record<string, string> {
	return (error as ApiRequestError | undefined)?.response?.data?.campos ?? {};
}

export default api;
