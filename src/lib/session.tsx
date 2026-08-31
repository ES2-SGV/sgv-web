import * as React from "react";
import { useColaboradores } from "#/api/hooks/use-colaboradores";
import type { Colaborador } from "#/api/types";

/**
 * A API ainda não tem autenticação, mas a especificação exige um responsável
 * por viagem e um gestor que aprova. Enquanto o login não existe, a "sessão" é
 * um colaborador escolhido no menu lateral e guardado no localStorage.
 *
 * Quando o login real entrar, só o corpo deste arquivo muda — as telas
 * continuam consumindo `useSession()`.
 */

export type Papel = "COLABORADOR" | "GESTOR";

const STORAGE_KEY_COLABORADOR = "sgv:colaboradorId";
const STORAGE_KEY_PAPEL = "sgv:papel";

interface SessionContextValue {
	/** Colaborador logado, ou undefined enquanto carrega / nenhum escolhido. */
	colaborador: Colaborador | undefined;
	colaboradorId: number | null;
	papel: Papel;
	isGestor: boolean;
	/** Lista para o seletor de sessão do menu lateral. */
	colaboradores: Colaborador[];
	isLoading: boolean;
	entrarComo: (colaboradorId: number) => void;
	setPapel: (papel: Papel) => void;
	sair: () => void;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

function lerColaboradorSalvo(): number | null {
	const salvo = localStorage.getItem(STORAGE_KEY_COLABORADOR);
	return salvo ? Number(salvo) : null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const { data: colaboradores = [], isLoading } = useColaboradores();
	const [colaboradorId, setColaboradorId] = React.useState<number | null>(
		lerColaboradorSalvo,
	);
	const [papel, setPapelState] = React.useState<Papel>(
		() =>
			(localStorage.getItem(STORAGE_KEY_PAPEL) as Papel | null) ??
			"COLABORADOR",
	);

	// Se ninguém foi escolhido ainda (ou o escolhido foi excluído), assume o primeiro.
	React.useEffect(() => {
		if (colaboradores.length === 0) return;
		const valido = colaboradores.some((c) => c.id === colaboradorId);
		if (!valido) {
			const primeiro = colaboradores[0].id;
			localStorage.setItem(STORAGE_KEY_COLABORADOR, String(primeiro));
			setColaboradorId(primeiro);
		}
	}, [colaboradores, colaboradorId]);

	const value = React.useMemo<SessionContextValue>(() => {
		return {
			colaborador: colaboradores.find((c) => c.id === colaboradorId),
			colaboradorId,
			papel,
			isGestor: papel === "GESTOR",
			colaboradores,
			isLoading,
			entrarComo: (id) => {
				localStorage.setItem(STORAGE_KEY_COLABORADOR, String(id));
				setColaboradorId(id);
			},
			setPapel: (next) => {
				localStorage.setItem(STORAGE_KEY_PAPEL, next);
				setPapelState(next);
			},
			sair: () => {
				localStorage.removeItem(STORAGE_KEY_COLABORADOR);
				setColaboradorId(null);
			},
		};
	}, [colaboradores, colaboradorId, papel, isLoading]);

	return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
	const context = React.use(SessionContext);
	if (!context)
		throw new Error("useSession precisa estar dentro de SessionProvider");
	return context;
}
