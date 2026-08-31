import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { EmptyState } from "#/components/common/state-views";
import { AppShell } from "#/components/layout/app-shell";
import { Button } from "#/components/ui/button";

export const Route = createRootRoute({
	component: RootLayout,
	notFoundComponent: NotFound,
});

function RootLayout() {
	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}

function NotFound() {
	return (
		<EmptyState
			titulo="Página não encontrada"
			descricao="O endereço acessado não existe no SGV."
			acao={
				<Button asChild variant="outline" size="sm">
					<Link to="/">Voltar ao dashboard</Link>
				</Button>
			}
		/>
	);
}
