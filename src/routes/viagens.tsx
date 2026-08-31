import { createFileRoute } from "@tanstack/react-router";
import { Plane, Plus } from "lucide-react";
import { useState } from "react";
import type { Viagem } from "#/api/types";
import { EmptyState } from "#/components/common/state-views";
import { PageHeader } from "#/components/layout/page-header";
import { Button } from "#/components/ui/button";
import { ViagemFormDialog } from "#/components/viagens/viagem-form-dialog";

export const Route = createFileRoute("/viagens")({
	component: ViagensPage,
	staticData: { titulo: "Viagens" },
});

function ViagensPage() {
	const [emEdicao, setEmEdicao] = useState<Viagem | null>(null);
	const [dialogAberto, setDialogAberto] = useState(false);

	const abrirCriacao = () => {
		setEmEdicao(null);
		setDialogAberto(true);
	};

	return (
		<>
			<PageHeader
				titulo="Viagens"
				descricao="Planejamento, acompanhamento e aprovação das viagens."
				acoes={
					<Button onClick={abrirCriacao}>
						<Plus className="size-4" />
						Nova viagem
					</Button>
				}
			/>

			<EmptyState
				icon={Plane}
				titulo="Listagem em construção"
				descricao="O cadastro já funciona; a tabela com filtros entra na próxima tarefa."
				acao={
					<Button size="sm" onClick={abrirCriacao}>
						<Plus className="size-4" />
						Nova viagem
					</Button>
				}
			/>

			<ViagemFormDialog
				key={emEdicao?.id ?? "nova"}
				aberto={dialogAberto}
				onOpenChange={setDialogAberto}
				viagem={emEdicao}
			/>
		</>
	);
}
