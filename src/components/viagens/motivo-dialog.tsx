import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Textarea } from "#/components/ui/textarea";

interface MotivoDialogProps {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	titulo: string;
	descricao: string;
	placeholder: string;
	textoConfirmar: string;
	destrutivo?: boolean;
	enviando: boolean;
	onConfirm: (motivo: string) => void;
}

/**
 * Usado tanto para "Rejeitar viagem" quanto para "Solicitar ajuste" — as duas
 * ações do gestor que exigem uma justificativa em texto antes de confirmar.
 */
export function MotivoDialog({
	aberto,
	onOpenChange,
	titulo,
	descricao,
	placeholder,
	textoConfirmar,
	destrutivo = false,
	enviando,
	onConfirm,
}: MotivoDialogProps) {
	const [motivo, setMotivo] = useState("");

	const confirmar = () => {
		if (motivo.trim() === "") return;
		onConfirm(motivo.trim());
	};

	return (
		<Dialog
			open={aberto}
			onOpenChange={(valor) => {
				if (!valor) setMotivo("");
				onOpenChange(valor);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{titulo}</DialogTitle>
					<DialogDescription>{descricao}</DialogDescription>
				</DialogHeader>

				<Textarea
					value={motivo}
					onChange={(evento) => setMotivo(evento.target.value)}
					placeholder={placeholder}
					rows={4}
					disabled={enviando}
					autoFocus
				/>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={enviando}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						variant={destrutivo ? "destructive" : "default"}
						disabled={enviando || motivo.trim() === ""}
						onClick={confirmar}
					>
						{enviando ? "Enviando..." : textoConfirmar}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
