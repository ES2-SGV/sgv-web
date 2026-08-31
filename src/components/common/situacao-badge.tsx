import { SITUACAO_LABEL, type SituacaoViagem } from "#/api/types";
import { Badge } from "#/components/ui/badge";
import { cn } from "#/lib/utils";

const ESTILOS: Record<SituacaoViagem, string> = {
	RASCUNHO: "bg-muted text-muted-foreground border-transparent",
	SOLICITADA:
		"bg-amber-100 text-amber-900 border-transparent dark:bg-amber-950 dark:text-amber-200",
	APROVADA:
		"bg-emerald-100 text-emerald-900 border-transparent dark:bg-emerald-950 dark:text-emerald-200",
	REJEITADA:
		"bg-red-100 text-red-900 border-transparent dark:bg-red-950 dark:text-red-200",
};

export function SituacaoBadge({
	situacao,
	className,
}: {
	situacao: SituacaoViagem;
	className?: string;
}) {
	return (
		<Badge variant="outline" className={cn(ESTILOS[situacao], className)}>
			{SITUACAO_LABEL[situacao]}
		</Badge>
	);
}
