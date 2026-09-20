import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { useState } from "react";
import { useViagens } from "#/api/hooks/use-viagens";
import type { Viagem } from "#/api/types";
import { EmptyState, ErrorState, TableSkeleton } from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { DespesasViagemSheet } from "#/components/viagens/despesas-viagem-sheet";
import { formatCurrency, formatDateRange } from "#/lib/format";

export const Route = createFileRoute("/despesas")({
	component: DespesasPage,
	staticData: { titulo: "Despesas" },
});

/**
 * Só viagens Aprovadas podem ter despesa lançada (ver podeRegistrarDespesa em
 * api/types.ts), então essa tela lista só essas — abrir uma linha reaproveita
 * o mesmo drawer de despesas usado na tela de Viagens.
 */
function DespesasPage() {
	const { data: viagens = [], isLoading, isError, error, refetch } =
		useViagens();
	const [selecionada, setSelecionada] = useState<Viagem | null>(null);
	const [aberto, setAberto] = useState(false);

	const aprovadas = viagens
		.filter((v) => v.situacao === "APROVADA")
		.sort((a, b) => b.id - a.id);

	const abrir = (viagem: Viagem) => {
		setSelecionada(viagem);
		setAberto(true);
	};

	return (
		<>
			<PageHeader
				titulo="Despesas"
				descricao="Lançamentos financeiros das viagens aprovadas."
			/>

			{isError ? (
				<ErrorState error={error} onRetry={() => refetch()} />
			) : (
				<Card>
					<CardContent>
						{!isLoading && aprovadas.length === 0 ? (
							<EmptyState
								icon={Receipt}
								titulo="Nenhuma viagem aprovada ainda"
								descricao="Despesas só podem ser lançadas em viagens já aprovadas pelo gestor."
							/>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-16">#</TableHead>
										<TableHead>Destino</TableHead>
										<TableHead>Responsável</TableHead>
										<TableHead>Período</TableHead>
										<TableHead className="text-right">Custo total</TableHead>
										<TableHead className="w-32" />
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableSkeleton colunas={6} />
									) : (
										aprovadas.map((viagem) => (
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
														{viagem.colaborador.area.nome}
													</span>
												</TableCell>
												<TableCell className="whitespace-nowrap">
													{formatDateRange(
														viagem.dataSaida,
														viagem.dataRetorno,
													)}
												</TableCell>
												<TableCell className="text-right font-medium">
													{formatCurrency(viagem.valorTotal)}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="outline"
														size="sm"
														onClick={() => abrir(viagem)}
													>
														<Receipt className="size-4" />
														Despesas
													</Button>
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

			<DespesasViagemSheet
				aberto={aberto}
				onOpenChange={setAberto}
				viagem={selecionada}
			/>
		</>
	);
}
