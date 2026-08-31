import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CircleSlash, MapPin, Plane, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useViagens } from "#/api/hooks/use-viagens";
import type { Viagem } from "#/api/types";
import { SituacaoBadge } from "#/components/common/situacao-badge";
import { StatCard } from "#/components/common/stat-card";
import { EmptyState, ErrorState } from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { formatDateRange } from "#/lib/format";

export const Route = createFileRoute("/")({
	component: Dashboard,
	staticData: { titulo: "Dashboard" },
});

function destinoMaisVisitado(viagens: Viagem[]): string {
	const contagem = new Map<string, number>();
	for (const viagem of viagens) {
		const nome = viagem.destino.nome;
		contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
	}
	let campeao = "—";
	let maior = 0;
	for (const [nome, quantidade] of contagem) {
		if (quantidade > maior) {
			campeao = nome;
			maior = quantidade;
		}
	}
	return campeao;
}

function Dashboard() {
	const {
		data: viagens = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useViagens();

	const indicadores = useMemo(
		() => ({
			total: viagens.length,
			aprovadas: viagens.filter((v) => v.situacao === "APROVADA").length,
			rejeitadas: viagens.filter((v) => v.situacao === "REJEITADA").length,
			destinoTop: destinoMaisVisitado(viagens),
		}),
		[viagens],
	);

	const recentes = useMemo(
		() => [...viagens].sort((a, b) => b.id - a.id).slice(0, 5),
		[viagens],
	);

	return (
		<>
			<PageHeader
				titulo="Dashboard"
				descricao="Visão consolidada das viagens corporativas."
			/>

			{isError && <ErrorState error={error} onRetry={() => refetch()} />}

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					titulo="Viagens cadastradas"
					valor={indicadores.total}
					icon={Plane}
					isLoading={isLoading}
				/>
				<StatCard
					titulo="Aprovadas"
					valor={indicadores.aprovadas}
					icon={CheckCircle2}
					isLoading={isLoading}
				/>
				<StatCard
					titulo="Rejeitadas"
					valor={indicadores.rejeitadas}
					icon={CircleSlash}
					isLoading={isLoading}
				/>
				<StatCard
					titulo="Destino mais visitado"
					valor={indicadores.destinoTop}
					icon={MapPin}
					isLoading={isLoading}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<StatCard
					titulo="Valor total gasto"
					valor="—"
					descricao="Aguardando o endpoint de despesas na API."
					icon={Wallet}
				/>
				<StatCard
					titulo="Custo médio por viagem"
					valor="—"
					descricao="Aguardando o endpoint de despesas na API."
					icon={Wallet}
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Viagens recentes</CardTitle>
					<CardDescription>
						As cinco últimas viagens cadastradas.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!isLoading && recentes.length === 0 ? (
						<EmptyState
							icon={Plane}
							titulo="Nenhuma viagem cadastrada"
							descricao="Cadastre a primeira viagem para ver os indicadores."
							acao={
								<Button asChild size="sm">
									<Link to="/viagens">Ir para viagens</Link>
								</Button>
							}
						/>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Destino</TableHead>
									<TableHead>Responsável</TableHead>
									<TableHead>Período</TableHead>
									<TableHead>Situação</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentes.map((viagem) => (
									<TableRow key={viagem.id}>
										<TableCell className="font-medium">
											{viagem.destino.nome}
										</TableCell>
										<TableCell>{viagem.colaborador.nome}</TableCell>
										<TableCell className="tabular-nums">
											{formatDateRange(viagem.dataSaida, viagem.dataRetorno)}
										</TableCell>
										<TableCell>
											<SituacaoBadge situacao={viagem.situacao} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</>
	);
}
