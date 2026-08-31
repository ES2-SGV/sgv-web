import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { EmptyState } from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";

export const Route = createFileRoute("/viagens")({
	component: ViagensPage,
	staticData: { titulo: "Viagens" },
});

/**
 * Stub da feature "planejar viagem". Os hooks já existem em
 * `#/api/hooks/use-viagens` (list/get/create/update/delete sobre /viagens).
 */
function ViagensPage() {
	return (
		<>
			<PageHeader
				titulo="Viagens"
				descricao="Planejamento, acompanhamento e aprovação das viagens."
			/>
			<EmptyState
				icon={Plane}
				titulo="Tela em construção"
				descricao="A listagem e o cadastro de viagens entram na próxima feature. A camada de API (/viagens) já está pronta."
			/>
		</>
	);
}
