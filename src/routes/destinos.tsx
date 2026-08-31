import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getErrorMessage } from "#/api/client";
import {
	useCreateDestino,
	useDeleteDestino,
	useDestinos,
	useUpdateDestino,
} from "#/api/hooks/use-destinos";
import type { Destino } from "#/api/types";
import { ConfirmDialog } from "#/components/common/confirm-dialog";
import {
	EmptyState,
	ErrorState,
	TableSkeleton,
} from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { aplicarErrosDaApi } from "#/lib/form";

export const Route = createFileRoute("/destinos")({
	component: DestinosPage,
	staticData: { titulo: "Destinos" },
});

const destinoSchema = z.object({
	nome: z.string().trim().min(1, "Nome é obrigatório"),
	cidade: z.string().trim().min(1, "Cidade é obrigatória"),
	pais: z.string().trim().min(1, "País é obrigatório"),
});

type DestinoFormValues = z.infer<typeof destinoSchema>;

const VALORES_VAZIOS: DestinoFormValues = { nome: "", cidade: "", pais: "" };

function DestinosPage() {
	const {
		data: destinos = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useDestinos();
	const remover = useDeleteDestino();
	const [emEdicao, setEmEdicao] = useState<Destino | null>(null);
	const [dialogAberto, setDialogAberto] = useState(false);

	const abrirCriacao = () => {
		setEmEdicao(null);
		setDialogAberto(true);
	};

	const abrirEdicao = (destino: Destino) => {
		setEmEdicao(destino);
		setDialogAberto(true);
	};

	const excluir = (destino: Destino) =>
		remover.mutate(destino.id, {
			onSuccess: () => toast.success(`Destino "${destino.nome}" excluído.`),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	return (
		<>
			<PageHeader
				titulo="Destinos"
				descricao="Locais disponíveis para vincular às viagens."
				acoes={
					<Button onClick={abrirCriacao}>
						<Plus className="size-4" />
						Novo destino
					</Button>
				}
			/>

			{isError ? (
				<ErrorState error={error} onRetry={() => refetch()} />
			) : (
				<Card>
					<CardContent>
						{!isLoading && destinos.length === 0 ? (
							<EmptyState
								icon={MapPin}
								titulo="Nenhum destino cadastrado"
								descricao="Cadastre um destino para poder planejar viagens."
								acao={
									<Button size="sm" onClick={abrirCriacao}>
										<Plus className="size-4" />
										Novo destino
									</Button>
								}
							/>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">#</TableHead>
										<TableHead>Nome</TableHead>
										<TableHead>Cidade</TableHead>
										<TableHead>País</TableHead>
										<TableHead className="w-28" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableSkeleton colunas={5} />
									) : (
										destinos.map((destino) => (
											<TableRow key={destino.id}>
												<TableCell className="text-muted-foreground tabular-nums">
													{destino.id}
												</TableCell>
												<TableCell className="font-medium">
													{destino.nome}
												</TableCell>
												<TableCell>{destino.cidade}</TableCell>
												<TableCell>{destino.pais}</TableCell>
												<TableCell>
													<div className="flex justify-end gap-1">
														<Button
															variant="ghost"
															size="icon"
															aria-label="Editar"
															onClick={() => abrirEdicao(destino)}
														>
															<Pencil className="size-4" />
														</Button>
														<ConfirmDialog
															titulo="Excluir destino?"
															descricao={`"${destino.nome}" será removido permanentemente.`}
															textoConfirmar="Excluir"
															destrutivo
															onConfirm={() => excluir(destino)}
														>
															<Button
																variant="ghost"
																size="icon"
																aria-label="Excluir"
															>
																<Trash2 className="size-4" />
															</Button>
														</ConfirmDialog>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			)}

			<DestinoDialog
				key={emEdicao?.id ?? "novo"}
				aberto={dialogAberto}
				onOpenChange={setDialogAberto}
				destino={emEdicao}
			/>
		</>
	);
}

function DestinoDialog({
	aberto,
	onOpenChange,
	destino,
}: {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	destino: Destino | null;
}) {
	const criar = useCreateDestino();
	const atualizar = useUpdateDestino();
	const form = useForm<DestinoFormValues>({
		resolver: zodResolver(destinoSchema),
		defaultValues: destino
			? { nome: destino.nome, cidade: destino.cidade, pais: destino.pais }
			: VALORES_VAZIOS,
	});

	const onSubmit = form.handleSubmit((valores) => {
		const opcoes = {
			onSuccess: () => {
				toast.success(destino ? "Destino atualizado." : "Destino cadastrado.");
				onOpenChange(false);
			},
			onError: (erro: unknown) => aplicarErrosDaApi(form, erro),
		};

		if (destino) {
			atualizar.mutate({ id: destino.id, payload: valores }, opcoes);
		} else {
			criar.mutate(valores, opcoes);
		}
	});

	const salvando = criar.isPending || atualizar.isPending;

	return (
		<Dialog open={aberto} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{destino ? "Editar destino" : "Novo destino"}
					</DialogTitle>
					<DialogDescription>Informe onde a viagem acontece.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						<FormField
							control={form.control}
							name="nome"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome</FormLabel>
									<FormControl>
										<Input placeholder="Matriz do cliente" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="cidade"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Cidade</FormLabel>
										<FormControl>
											<Input placeholder="São Paulo" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="pais"
								render={({ field }) => (
									<FormItem>
										<FormLabel>País</FormLabel>
										<FormControl>
											<Input placeholder="Brasil" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{form.formState.errors.root && (
							<p className="text-destructive text-sm">
								{form.formState.errors.root.message}
							</p>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={salvando}>
								{salvando ? "Salvando..." : "Salvar"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
