import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getErrorMessage } from "#/api/client";
import {
	useColaboradores,
	useCreateColaborador,
	useDeleteColaborador,
	useUpdateColaborador,
} from "#/api/hooks/use-colaboradores";
import type { Colaborador } from "#/api/types";
import { ConfirmDialog } from "#/components/common/confirm-dialog";
import {
	EmptyState,
	ErrorState,
	TableSkeleton,
} from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";
import { Badge } from "#/components/ui/badge";
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
	FormDescription,
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
import { useSession } from "#/lib/session";

export const Route = createFileRoute("/colaboradores")({
	component: ColaboradoresPage,
	staticData: { titulo: "Colaboradores" },
});

const colaboradorSchema = z.object({
	matricula: z.string().trim().min(1, "Matrícula é obrigatória"),
	nome: z.string().trim().min(1, "Nome é obrigatório"),
	area: z.string().trim().min(1, "Área é obrigatória"),
});

type ColaboradorFormValues = z.infer<typeof colaboradorSchema>;

const VALORES_VAZIOS: ColaboradorFormValues = {
	matricula: "",
	nome: "",
	area: "",
};

function ColaboradoresPage() {
	const {
		data: colaboradores = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useColaboradores();
	const { colaboradorId } = useSession();
	const remover = useDeleteColaborador();
	const [emEdicao, setEmEdicao] = useState<Colaborador | null>(null);
	const [dialogAberto, setDialogAberto] = useState(false);

	const abrirCriacao = () => {
		setEmEdicao(null);
		setDialogAberto(true);
	};

	const abrirEdicao = (colaborador: Colaborador) => {
		setEmEdicao(colaborador);
		setDialogAberto(true);
	};

	const excluir = (colaborador: Colaborador) =>
		remover.mutate(colaborador.id, {
			onSuccess: () => toast.success(`"${colaborador.nome}" excluído.`),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	return (
		<>
			<PageHeader
				titulo="Colaboradores"
				descricao="Quem pode ser responsável por uma viagem."
				acoes={
					<Button onClick={abrirCriacao}>
						<Plus className="size-4" />
						Novo colaborador
					</Button>
				}
			/>

			{isError ? (
				<ErrorState error={error} onRetry={() => refetch()} />
			) : (
				<Card>
					<CardContent>
						{!isLoading && colaboradores.length === 0 ? (
							<EmptyState
								icon={Users}
								titulo="Nenhum colaborador cadastrado"
								descricao="É preciso ao menos um colaborador para registrar viagens."
								acao={
									<Button size="sm" onClick={abrirCriacao}>
										<Plus className="size-4" />
										Novo colaborador
									</Button>
								}
							/>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-32">Matrícula</TableHead>
										<TableHead>Nome</TableHead>
										<TableHead>Área</TableHead>
										<TableHead className="w-28" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableSkeleton colunas={4} />
									) : (
										colaboradores.map((colaborador) => (
											<TableRow key={colaborador.id}>
												<TableCell className="font-mono text-muted-foreground text-xs">
													{colaborador.matricula}
												</TableCell>
												<TableCell className="font-medium">
													<span className="flex items-center gap-2">
														{colaborador.nome}
														{colaborador.id === colaboradorId && (
															<Badge variant="secondary">Sessão atual</Badge>
														)}
													</span>
												</TableCell>
												<TableCell>{colaborador.area}</TableCell>
												<TableCell>
													<div className="flex justify-end gap-1">
														<Button
															variant="ghost"
															size="icon"
															aria-label="Editar"
															onClick={() => abrirEdicao(colaborador)}
														>
															<Pencil className="size-4" />
														</Button>
														<ConfirmDialog
															titulo="Excluir colaborador?"
															descricao={`"${colaborador.nome}" será removido permanentemente.`}
															textoConfirmar="Excluir"
															destrutivo
															onConfirm={() => excluir(colaborador)}
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

			<ColaboradorDialog
				key={emEdicao?.id ?? "novo"}
				aberto={dialogAberto}
				onOpenChange={setDialogAberto}
				colaborador={emEdicao}
			/>
		</>
	);
}

function ColaboradorDialog({
	aberto,
	onOpenChange,
	colaborador,
}: {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	colaborador: Colaborador | null;
}) {
	const criar = useCreateColaborador();
	const atualizar = useUpdateColaborador();
	const form = useForm<ColaboradorFormValues>({
		resolver: zodResolver(colaboradorSchema),
		defaultValues: colaborador
			? {
					matricula: colaborador.matricula,
					nome: colaborador.nome,
					area: colaborador.area,
				}
			: VALORES_VAZIOS,
	});

	const onSubmit = form.handleSubmit((valores) => {
		const opcoes = {
			onSuccess: () => {
				toast.success(
					colaborador ? "Colaborador atualizado." : "Colaborador cadastrado.",
				);
				onOpenChange(false);
			},
			onError: (erro: unknown) => aplicarErrosDaApi(form, erro),
		};

		if (colaborador) {
			atualizar.mutate({ id: colaborador.id, payload: valores }, opcoes);
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
						{colaborador ? "Editar colaborador" : "Novo colaborador"}
					</DialogTitle>
					<DialogDescription>
						A matrícula identifica o colaborador e não pode se repetir.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						<FormField
							control={form.control}
							name="matricula"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Matrícula</FormLabel>
									<FormControl>
										<Input placeholder="0001" {...field} />
									</FormControl>
									<FormDescription>Única por colaborador.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="nome"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome</FormLabel>
									<FormControl>
										<Input placeholder="Maria Silva" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="area"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Área</FormLabel>
									<FormControl>
										<Input placeholder="Comercial" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
