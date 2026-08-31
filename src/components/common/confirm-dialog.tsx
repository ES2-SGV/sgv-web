import type * as React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";

interface ConfirmDialogProps {
	/** Elemento que abre o diálogo (normalmente um Button). */
	children: React.ReactNode;
	titulo: string;
	descricao: string;
	textoConfirmar?: string;
	destrutivo?: boolean;
	onConfirm: () => void;
}

/** Confirmação para ações irreversíveis (excluir, rejeitar...). */
export function ConfirmDialog({
	children,
	titulo,
	descricao,
	textoConfirmar = "Confirmar",
	destrutivo = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{titulo}</AlertDialogTitle>
					<AlertDialogDescription>{descricao}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className={cn(
							destrutivo && buttonVariants({ variant: "destructive" }),
						)}
					>
						{textoConfirmar}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
