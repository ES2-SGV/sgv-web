import { AlertCircle, Inbox, RotateCw } from "lucide-react";
import type * as React from "react";
import { getErrorMessage } from "#/api/client";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { TableCell, TableRow } from "#/components/ui/table";

/** Placeholder genérico enquanto uma query carrega. */
export function LoadingState({ linhas = 3 }: { linhas?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: linhas }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: placeholders sem identidade
				<Skeleton key={i} className="h-12 w-full" />
			))}
		</div>
	);
}

/** Linhas fantasma dentro de uma <Table>, preservando o alinhamento das colunas. */
export function TableSkeleton({
	colunas,
	linhas = 5,
}: {
	colunas: number;
	linhas?: number;
}) {
	return (
		<>
			{Array.from({ length: linhas }).map((_, linha) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: placeholders sem identidade
				<TableRow key={linha}>
					{Array.from({ length: colunas }).map((__, coluna) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: placeholders sem identidade
						<TableCell key={coluna}>
							<Skeleton className="h-4 w-full" />
						</TableCell>
					))}
				</TableRow>
			))}
		</>
	);
}

export function ErrorState({
	error,
	onRetry,
}: {
	error: unknown;
	onRetry?: () => void;
}) {
	return (
		<Alert variant="destructive">
			<AlertCircle className="size-4" />
			<AlertTitle>Não foi possível carregar</AlertTitle>
			<AlertDescription className="flex flex-col items-start gap-3">
				<span>{getErrorMessage(error)}</span>
				{onRetry && (
					<Button variant="outline" size="sm" onClick={onRetry}>
						<RotateCw className="size-4" />
						Tentar novamente
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}

export function EmptyState({
	icon: Icon = Inbox,
	titulo,
	descricao,
	acao,
}: {
	icon?: React.ElementType;
	titulo: string;
	descricao?: string;
	acao?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center">
			<div className="flex size-10 items-center justify-center rounded-full bg-muted">
				<Icon className="size-5 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<p className="font-medium text-sm">{titulo}</p>
				{descricao && (
					<p className="max-w-sm text-muted-foreground text-sm">{descricao}</p>
				)}
			</div>
			{acao}
		</div>
	);
}
