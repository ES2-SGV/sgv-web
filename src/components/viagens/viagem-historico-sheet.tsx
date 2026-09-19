import { History } from "lucide-react";
import { useViagemHistorico } from "#/api/hooks/use-viagem-historico";
import { SITUACAO_LABEL } from "#/api/types";
import { EmptyState, ErrorState } from "#/components/common/state-views";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import { formatDateTime } from "#/lib/format";

interface ViagemHistoricoSheetProps {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	viagemId: number | undefined;
}

/**
 * Timeline de mudanças de situação de uma viagem, a partir de
 * GET /viagens/{id}/historico (ver api/hooks/use-viagem-historico.ts para o
 * aviso de placeholder do formato retornado).
 */
export function ViagemHistoricoSheet({
	aberto,
	onOpenChange,
	viagemId,
}: ViagemHistoricoSheetProps) {
	const {
		data: historico = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useViagemHistorico(viagemId);

	return (
		<Sheet open={aberto} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Histórico da viagem {viagemId && `#${viagemId}`}</SheetTitle>
					<SheetDescription>
						Todas as mudanças de situação, com data e responsável.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
					{isError ? (
						<ErrorState error={error} onRetry={() => refetch()} />
					) : isLoading ? (
						<>
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
						</>
					) : historico.length === 0 ? (
						<EmptyState
							icon={History}
							titulo="Sem histórico ainda"
							descricao="Nenhuma mudança de situação foi registrada para esta viagem."
						/>
					) : (
						<ol className="relative space-y-6 border-muted border-l pl-4">
							{historico.map((item) => (
								<li key={item.id} className="relative">
									<span className="-left-[21px] absolute top-1 size-2.5 rounded-full bg-primary" />
									<p className="font-medium text-sm">
										{SITUACAO_LABEL[item.situacao]}
									</p>
									<p className="text-muted-foreground text-xs">
										{formatDateTime(item.data)} · {item.responsavel.nome} (
										{item.responsavel.matricula})
									</p>
									{item.observacao && (
										<p className="mt-1 rounded-md bg-muted p-2 text-sm">
											{item.observacao}
										</p>
									)}
								</li>
							))}
						</ol>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
