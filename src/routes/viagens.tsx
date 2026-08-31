import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plane, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "#/api/client";
import { useDeleteViagem, useViagens } from "#/api/hooks/use-viagens";
import {
	MEIO_TRANSPORTE_LABEL,
	podeEditarViagem,
	SITUACAO_LABEL,
	SITUACOES_VIAGEM,
	type SituacaoViagem,
	type Viagem,
} from "#/api/types";
import { ConfirmDialog } from "#/components/common/confirm-dialog";
import { SituacaoBadge } from "#/components/common/situacao-badge";
import {
	EmptyState,
	ErrorState,
	TableSkeleton,
} from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { ViagemFormDialog } from "#/components/viagens/viagem-form-dialog";
import { diffEmDias, formatDateRange } from "#/lib/format";

export const Route = createFileRoute("/viagens")({
	component: ViagensPage,
	staticData: { titulo: "Viagens" },
});

/** Valor do <Select> de situação que representa "sem filtro". */
const TODAS = "TODAS";

function combinaComBusca(viagem: Viagem, termo: string): boolean {
	const alvo = [
		viagem.destino.nome,
		viagem.destino.cidade,
		viagem.destino.pais,
		viagem.colaborador.nome,
		viagem.colaborador.matricula,
		viagem.motivo,
	]
		.join(" ")
		.toLowerCase();
	return alvo.includes(termo);
}

function ViagensPage() {
	const {
		data: viagens = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useViagens();
	const remover = useDeleteViagem();

	const [emEdicao, setEmEdicao] = useState<Viagem | null>(null);
	const [dialogAberto, setDialogAberto] = useState(false);
	const [busca, setBusca] = useState("");
	const [situacao, setSituacao] = useState<SituacaoViagem | typeof TODAS>(
		TODAS,
	);

	const abrirCriacao = () => {
		setEmEdicao(null);
		setDialogAberto(true);
	};

	const abrirViagem = (viagem: Viagem) => {
		setEmEdicao(viagem);
		setDialogAberto(true);
	};

	const excluir = (viagem: Viagem) =>
		remover.mutate(viagem.id, {
			onSuccess: () => toast.success(`Viagem #${viagem.id} excluída.`),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	// Mais recentes primeiro: a API não garante ordem e o id é sequencial.
	const filtradas = useMemo(() => {
		const termo = busca.trim().toLowerCase();
		return [...viagens]
			.sort((a, b) => b.id - a.id)
			.filter((viagem) => situacao === TODAS || viagem.situacao === situacao)
			.filter((viagem) => termo === "" || combinaComBusca(viagem, termo));
	}, [viagens, busca, situacao]);

	const semNenhuma = !isLoading && viagens.length === 0;
	const semResultado =
		!isLoading && viagens.length > 0 && filtradas.length === 0;

	return (
		<>
			<PageHeader
				titulo="Viagens"
				descricao="Planejamento, acompanhamento e aprovação das viagens."
				acoes={
					<Button onClick={abrirCriacao}>
						<Plus className="size-4" />
						Nova viagem
					</Button>
				}
			/>

			{isError ? (
				<ErrorState error={error} onRetry={() => refetch()} />
			) : (
				<Card>
					<CardContent className="space-y-4">
						{!semNenhuma && (
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<div className="relative flex-1">
									<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
									<Input
										value={busca}
										onChange={(evento) => setBusca(evento.target.value)}
										placeholder="Buscar por destino, responsável ou motivo"
										aria-label="Buscar viagens"
										className="pl-9"
									/>
								</div>
								<Select
									value={situacao}
									onValueChange={(valor) =>
										setSituacao(valor as SituacaoViagem | typeof TODAS)
									}
								>
									<SelectTrigger
										className="w-full sm:w-52"
										aria-label="Situação"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={TODAS}>Todas as situações</SelectItem>
										{SITUACOES_VIAGEM.map((valor) => (
											<SelectItem key={valor} value={valor}>
												{SITUACAO_LABEL[valor]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{semNenhuma ? (
							<EmptyState
								icon={Plane}
								titulo="Nenhuma viagem cadastrada"
								descricao="Planeje a primeira viagem: ela é criada como rascunho e pode ser ajustada depois."
								acao={
									<Button size="sm" onClick={abrirCriacao}>
										<Plus className="size-4" />
										Nova viagem
									</Button>
								}
							/>
						) : semResultado ? (
							<EmptyState
								icon={Search}
								titulo="Nenhuma viagem encontrada"
								descricao="Ajuste a busca ou o filtro de situação."
								acao={
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setBusca("");
											setSituacao(TODAS);
										}}
									>
										Limpar filtros
									</Button>
								}
							/>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">#</TableHead>
										<TableHead>Destino</TableHead>
										<TableHead>Responsável</TableHead>
										<TableHead>Período</TableHead>
										<TableHead>Transporte</TableHead>
										<TableHead>Situação</TableHead>
										<TableHead className="w-28" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableSkeleton colunas={7} />
									) : (
										filtradas.map((viagem) => {
											const editavel = podeEditarViagem(viagem.situacao);
											return (
												<TableRow key={viagem.id}>
													<TableCell className="text-muted-foreground tabular-nums">
														{viagem.id}
													</TableCell>
													<TableCell className="font-medium">
														{viagem.destino.nome}
														<span className="block text-muted-foreground text-xs">
															{viagem.destino.cidade}/{viagem.destino.pais}
														</span>
													</TableCell>
													<TableCell>
														{viagem.colaborador.nome}
														<span className="block text-muted-foreground text-xs">
															{viagem.colaborador.area}
														</span>
													</TableCell>
													<TableCell className="whitespace-nowrap">
														{formatDateRange(
															viagem.dataSaida,
															viagem.dataRetorno,
														)}
														<span className="block text-muted-foreground text-xs">
															{diffEmDias(viagem.dataSaida, viagem.dataRetorno)}{" "}
															dia(s)
														</span>
													</TableCell>
													<TableCell>
														{MEIO_TRANSPORTE_LABEL[viagem.meioTransporte]}
													</TableCell>
													<TableCell>
														<SituacaoBadge situacao={viagem.situacao} />
													</TableCell>
													<TableCell>
														<div className="flex justify-end gap-1">
															<Button
																variant="ghost"
																size="icon"
																aria-label={editavel ? "Editar" : "Visualizar"}
																onClick={() => abrirViagem(viagem)}
															>
																{editavel ? (
																	<Pencil className="size-4" />
																) : (
																	<Eye className="size-4" />
																)}
															</Button>
															{editavel && (
																<ConfirmDialog
																	titulo="Excluir viagem?"
																	descricao={`A viagem #${viagem.id} para ${viagem.destino.nome} será removida permanentemente.`}
																	textoConfirmar="Excluir"
																	destrutivo
																	onConfirm={() => excluir(viagem)}
																>
																	<Button
																		variant="ghost"
																		size="icon"
																		aria-label="Excluir"
																	>
																		<Trash2 className="size-4" />
																	</Button>
																</ConfirmDialog>
															)}
														</div>
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			)}

			<ViagemFormDialog
				key={emEdicao?.id ?? "nova"}
				aberto={dialogAberto}
				onOpenChange={setDialogAberto}
				viagem={emEdicao}
			/>
		</>
	);
}
