import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { EmptyState } from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";

export const Route = createFileRoute("/despesas")({
	component: DespesasPage,
	staticData: { titulo: "Despesas" },
});

/**
 * Stub do controle financeiro. Depende de endpoints de despesa que ainda não
 * existem na sgv-api — nada foi cabeado aqui de propósito.
 */
function DespesasPage() {
	return (
		<>
			<PageHeader
				titulo="Despesas"
				descricao="Lançamentos financeiros das viagens aprovadas."
			/>
			<EmptyState
				icon={Receipt}
				titulo="Aguardando a API"
				descricao="O backend ainda não expõe endpoints de despesa. Assim que existirem, os hooks entram em #/api/hooks/use-despesas."
			/>
		</>
	);
}
