import { AlertCircle, History } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "#/api/client";
import {
	useAprovarViagem,
	useCancelarViagem,
	useRejeitarViagem,
	useSolicitarAjusteViagem,
	useSolicitarViagem,
} from "#/api/hooks/use-viagem-transicoes";
import { useDeleteViagem } from "#/api/hooks/use-viagens";
import {
	MEIO_TRANSPORTE_LABEL,
	podeCancelarViagem,
	podeEditarViagem,
	podeExcluirViagem,
	podeGestorAgir,
	podeSolicitarViagem,
	type Viagem,
} from "#/api/types";
import { ConfirmDialog } from "#/components/common/confirm-dialog";
import { SituacaoBadge } from "#/components/common/situacao-badge";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Separator } from "#/components/ui/separator";
import { diffEmDias, formatDateRange } from "#/lib/format";
import { useSession } from "#/lib/session";
import { MotivoDialog } from "#/components/viagens/motivo-dialog";
import { ViagemHistoricoSheet } from "#/components/viagens/viagem-historico-sheet";

interface ViagemDetalheDialogProps {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	viagem: Viagem | null;
	/** Abre o formulário de edição para esta viagem (fecha este dialog). */
	onEditar: (viagem: Viagem) => void;
}

function Campo({ label, valor }: { label: string; valor: ReactNode }) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="font-medium text-sm">{valor}</p>
		</div>
	);
}

/**
 * Visualização somente-leitura de uma viagem, com os botões de transição de
 * status apropriados para quem está olhando: o solicitante (dono da viagem)
 * vê Solicitar/Cancelar/Excluir; o gestor vê Aprovar/Rejeitar/Solicitar ajuste
 * quando a viagem está Solicitada.
 */
export function ViagemDetalheDialog({
	aberto,
	onOpenChange,
	viagem,
	onEditar,
}: ViagemDetalheDialogProps) {
	const { colaboradorId, isGestor } = useSession();
	const [historicoAberto, setHistoricoAberto] = useState(false);
	const [dialogRejeitar, setDialogRejeitar] = useState(false);
	const [dialogAjuste, setDialogAjuste] = useState(false);

	const id = viagem?.id ?? 0;
	const solicitar = useSolicitarViagem(id);
	const cancelar = useCancelarViagem(id);
	const aprovar = useAprovarViagem(id);
	const rejeitar = useRejeitarViagem(id);
	const solicitarAjuste = useSolicitarAjusteViagem(id);
	const excluir = useDeleteViagem();

	if (!viagem) return null;

	const souDono = viagem.colaborador.id === colaboradorId;
	const podeEditar = podeEditarViagem(viagem.situacao);
	const podeSolicitar = podeSolicitarViagem(viagem.situacao) && souDono;
	const podeCancelar = podeCancelarViagem(viagem.situacao) && souDono;
	const podeExcluir = podeExcluirViagem(viagem.situacao) && souDono;
	const gestorPodeAgir = isGestor && podeGestorAgir(viagem.situacao);

	const aoSolicitar = () =>
		solicitar.mutate(undefined, {
			onSuccess: () =>
				toast.success(
					viagem.situacao === "EM_AJUSTE"
						? "Viagem reenviada para análise."
						: "Viagem solicitada.",
				),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	const aoCancelar = () =>
		cancelar.mutate(undefined, {
			onSuccess: () => toast.success("Viagem cancelada."),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	const aoAprovar = () =>
		aprovar.mutate(undefined, {
			onSuccess: () => toast.success("Viagem aprovada."),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	const aoExcluir = () =>
		excluir.mutate(viagem.id, {
			onSuccess: () => {
				toast.success(`Viagem #${viagem.id} excluída.`);
				onOpenChange(false);
			},
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	const enviando =
		solicitar.isPending ||
		cancelar.isPending ||
		aprovar.isPending ||
		rejeitar.isPending ||
		solicitarAjuste.isPending;

	return (
		<>
			<Dialog open={aberto} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<DialogTitle>Viagem #{viagem.id}</DialogTitle>
							<SituacaoBadge situacao={viagem.situacao} />
						</div>
						<DialogDescription>
							{viagem.destino.nome} — {viagem.destino.cidade}/
							{viagem.destino.pais}
						</DialogDescription>
					</DialogHeader>

					{viagem.situacao === "EM_AJUSTE" && viagem.motivoAjuste && (
						<Alert>
							<AlertCircle className="size-4" />
							<AlertTitle>O gestor pediu ajustes</AlertTitle>
							<AlertDescription>{viagem.motivoAjuste}</AlertDescription>
						</Alert>
					)}

					<div className="grid gap-4 sm:grid-cols-2">
						<Campo
							label="Responsável"
							valor={`${viagem.colaborador.nome} — ${viagem.colaborador.area.nome}`}
						/>
						<Campo
							label="Período"
							valor={`${formatDateRange(viagem.dataSaida, viagem.dataRetorno)} (${diffEmDias(viagem.dataSaida, viagem.dataRetorno)} dia(s))`}
						/>
						<Campo
							label="Meio de transporte"
							valor={MEIO_TRANSPORTE_LABEL[viagem.meioTransporte]}
						/>
						<Campo label="Motivo" valor={viagem.motivo} />
					</div>

					<Separator />

					<div className="flex flex-wrap items-center justify-between gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setHistoricoAberto(true)}
						>
							<History className="size-4" />
							Ver histórico
						</Button>

						<div className="flex flex-wrap justify-end gap-2">
							{/* Ações do solicitante */}
							{podeEditar && souDono && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => onEditar(viagem)}
								>
									Editar
								</Button>
							)}
							{podeExcluir && (
								<ConfirmDialog
									titulo="Excluir viagem?"
									descricao={`A viagem #${viagem.id} para ${viagem.destino.nome} será removida permanentemente.`}
									textoConfirmar="Excluir"
									destrutivo
									onConfirm={aoExcluir}
								>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={excluir.isPending}
									>
										Excluir
									</Button>
								</ConfirmDialog>
							)}
							{podeCancelar && (
								<ConfirmDialog
									titulo="Cancelar viagem?"
									descricao={`A viagem #${viagem.id} será cancelada e o fluxo encerrado. Esta ação não pode ser desfeita.`}
									textoConfirmar="Cancelar viagem"
									destrutivo
									onConfirm={aoCancelar}
								>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={enviando}
									>
										Cancelar viagem
									</Button>
								</ConfirmDialog>
							)}
							{podeSolicitar && (
								<Button
									type="button"
									size="sm"
									disabled={enviando}
									onClick={aoSolicitar}
								>
									{viagem.situacao === "EM_AJUSTE"
										? "Reenviar para análise"
										: "Solicitar"}
								</Button>
							)}

							{/* Ações do gestor */}
							{gestorPodeAgir && (
								<>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={enviando}
										onClick={() => setDialogAjuste(true)}
									>
										Solicitar ajuste
									</Button>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										disabled={enviando}
										onClick={() => setDialogRejeitar(true)}
									>
										Rejeitar
									</Button>
									<Button
										type="button"
										size="sm"
										disabled={enviando}
										onClick={aoAprovar}
									>
										Aprovar
									</Button>
								</>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ViagemHistoricoSheet
				aberto={historicoAberto}
				onOpenChange={setHistoricoAberto}
				viagemId={viagem.id}
			/>

			<MotivoDialog
				aberto={dialogRejeitar}
				onOpenChange={setDialogRejeitar}
				titulo="Rejeitar viagem"
				descricao="Informe o motivo da rejeição. O solicitante poderá ver este texto."
				placeholder="Ex.: orçamento do trimestre já esgotado para esta área."
				textoConfirmar="Rejeitar viagem"
				destrutivo
				enviando={rejeitar.isPending}
				onConfirm={(motivo) => {
					rejeitar.mutate(motivo, {
						onSuccess: () => {
							toast.success("Viagem rejeitada.");
							setDialogRejeitar(false);
						},
						onError: (erro) => toast.error(getErrorMessage(erro)),
					});
				}}
			/>

			<MotivoDialog
				aberto={dialogAjuste}
				onOpenChange={setDialogAjuste}
				titulo="Solicitar ajuste"
				descricao="Descreva o que precisa ser corrigido. O solicitante verá este texto e poderá editar a viagem novamente."
				placeholder="Ex.: revisar a data de retorno, está um dia a mais que o necessário."
				textoConfirmar="Solicitar ajuste"
				enviando={solicitarAjuste.isPending}
				onConfirm={(motivo) => {
					solicitarAjuste.mutate(motivo, {
						onSuccess: () => {
							toast.success("Ajuste solicitado ao colaborador.");
							setDialogAjuste(false);
						},
						onError: (erro) => toast.error(getErrorMessage(erro)),
					});
				}}
			/>
		</>
	);
}
