import { History } from "lucide-react";
import { useColaboradorLotacoes } from "#/api/hooks/use-colaborador-lotacoes";
import { CARGO_LABEL, type Colaborador } from "#/api/types";
import { EmptyState, ErrorState } from "#/components/common/state-views";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import { formatDate } from "#/lib/format";

interface LotacaoColaboradorSheetProps {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	colaborador: Colaborador | null;
}

/**
 * Linha do tempo de cargo/área do colaborador, a partir de
 * GET /colaboradores/{id}/lotacoes (ver api/hooks/use-colaborador-lotacoes.ts
 * para o aviso de placeholder do formato retornado).
 *
 * É este histórico — e não o de mudanças de status da viagem — que guarda
 * qual era o cargo/área do colaborador em cada período; cada viagem deve
 * referenciar o registro vigente no momento da solicitação, sem duplicar ou
 * misturar os dois históricos.
 */
export function LotacaoColaboradorSheet({
	aberto,
	onOpenChange,
	colaborador,
}: LotacaoColaboradorSheetProps) {
	const {
		data: lotacoes = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useColaboradorLotacoes(colaborador?.id);

	return (
		<Sheet open={aberto} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Histórico de lotação {colaborador?.nome}</SheetTitle>
					<SheetDescription>
						Cargo e área do colaborador ao longo do tempo.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
					{isError ? (
						<ErrorState error={error} onRetry={() => refetch()} />
					) : isLoading ? (
						<>
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
						</>
					) : lotacoes.length === 0 ? (
						<EmptyState
							icon={History}
							titulo="Sem histórico ainda"
							descricao="Nenhuma mudança de cargo ou área foi registrada para este colaborador."
						/>
					) : (
						<ol className="relative space-y-6 border-muted border-l pl-4">
							{lotacoes.map((item) => (
								<li key={item.id} className="relative">
									<span className="-left-[21px] absolute top-1 size-2.5 rounded-full bg-primary" />
									<p className="font-medium text-sm">
										{CARGO_LABEL[item.cargo]} — {item.area.nome}
									</p>
									<p className="text-muted-foreground text-xs">
										{formatDate(item.dataInicio)} –{" "}
										{item.dataFim ? formatDate(item.dataFim) : "atual"}
									</p>
								</li>
							))}
						</ol>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
