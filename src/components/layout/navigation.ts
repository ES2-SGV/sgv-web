import {
	LayoutDashboard,
	type LucideIcon,
	MapPin,
	Plane,
	Receipt,
	Users,
} from "lucide-react";
import type { FileRoutesByTo } from "#/routeTree.gen";

export interface NavItem {
	titulo: string;
	to: keyof FileRoutesByTo;
	icon: LucideIcon;
	/** Some do menu quando a sessão não é de um gestor. */
	somenteGestor?: boolean;
}

export interface NavGroup {
	label?: string;
	items: NavItem[];
}

/** Fonte única do menu lateral. Adicionou uma rota? Registre-a aqui. */
export const navGroups: NavGroup[] = [
	{
		items: [
			{ titulo: "Dashboard", to: "/", icon: LayoutDashboard },
			{ titulo: "Viagens", to: "/viagens", icon: Plane },
			{ titulo: "Despesas", to: "/despesas", icon: Receipt },
		],
	},
	{
		label: "Cadastros",
		items: [
			{ titulo: "Destinos", to: "/destinos", icon: MapPin },
			{ titulo: "Colaboradores", to: "/colaboradores", icon: Users },
		],
	},
];
