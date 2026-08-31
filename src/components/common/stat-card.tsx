import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

interface StatCardProps {
	titulo: string;
	valor: string | number;
	descricao?: string;
	icon?: LucideIcon;
	isLoading?: boolean;
}

/** Indicador numérico dos painéis gerenciais. */
export function StatCard({
	titulo,
	valor,
	descricao,
	icon: Icon,
	isLoading = false,
}: StatCardProps) {
	return (
		<Card>
			<CardContent className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="font-medium text-muted-foreground text-sm">{titulo}</p>
					{isLoading ? (
						<Skeleton className="h-8 w-20" />
					) : (
						<p className="font-semibold text-2xl tabular-nums tracking-tight">
							{valor}
						</p>
					)}
					{descricao && (
						<p className="text-muted-foreground text-xs">{descricao}</p>
					)}
				</div>
				{Icon && (
					<div className="flex size-9 items-center justify-center rounded-md bg-muted">
						<Icon className="size-4 text-muted-foreground" />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
