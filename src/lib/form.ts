import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { getErrorMessage, getFieldErrors } from "#/api/client";

/**
 * Leva os erros de validação da API (`ApiError.campos`) para os campos do
 * formulário. O que não casar com nenhum campo vira erro de raiz.
 */
export function aplicarErrosDaApi<T extends FieldValues>(
	form: UseFormReturn<T>,
	error: unknown,
): void {
	const campos = getFieldErrors(error);
	const nomesConhecidos = Object.keys(form.getValues());
	let houveCampo = false;

	for (const [campo, mensagem] of Object.entries(campos)) {
		if (nomesConhecidos.includes(campo)) {
			form.setError(campo as Path<T>, { type: "server", message: mensagem });
			houveCampo = true;
		}
	}

	if (!houveCampo) {
		form.setError("root", { type: "server", message: getErrorMessage(error) });
	}
}
