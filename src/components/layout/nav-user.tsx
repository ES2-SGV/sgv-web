import { ChevronsUpDown, LogOut, ShieldCheck, User } from "lucide-react";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar";
import { Skeleton } from "#/components/ui/skeleton";
import { iniciais } from "#/lib/format";
import { type Papel, useSession } from "#/lib/session";

/**
 * Seletor de sessão: enquanto não há login, troca-se de colaborador e de papel
 * por aqui. O componente já tem o formato de um menu de usuário real.
 */
export function NavUser() {
	const { isMobile } = useSidebar();
	const { colaborador, colaboradores, isLoading, papel, entrarComo, setPapel } =
		useSession();

	if (isLoading) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex items-center gap-2 p-2">
						<Skeleton className="size-8 rounded-lg" />
						<div className="grid flex-1 gap-1">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-3 w-16" />
						</div>
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="size-8 rounded-lg">
								<AvatarFallback className="rounded-lg">
									{colaborador ? iniciais(colaborador.nome) : "—"}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{colaborador?.nome ?? "Sem colaborador"}
								</span>
								<span className="truncate text-xs text-muted-foreground">
									{papel === "GESTOR" ? "Gestor" : "Colaborador"}
									{colaborador ? ` · ${colaborador.area}` : ""}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Sessão simulada
						</DropdownMenuLabel>
						<DropdownMenuRadioGroup
							value={papel}
							onValueChange={(valor) => setPapel(valor as Papel)}
						>
							<DropdownMenuRadioItem value="COLABORADOR">
								<User className="size-4" />
								Colaborador
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="GESTOR">
								<ShieldCheck className="size-4" />
								Gestor
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>

						<DropdownMenuSeparator />
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Entrar como
						</DropdownMenuLabel>
						{colaboradores.length === 0 && (
							<DropdownMenuItem disabled>
								Nenhum colaborador cadastrado
							</DropdownMenuItem>
						)}
						<DropdownMenuRadioGroup
							value={colaborador ? String(colaborador.id) : ""}
							onValueChange={(valor) => entrarComo(Number(valor))}
						>
							{colaboradores.map((item) => (
								<DropdownMenuRadioItem key={item.id} value={String(item.id)}>
									<span className="truncate">{item.nome}</span>
									<span className="ml-auto text-muted-foreground text-xs">
										{item.matricula}
									</span>
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>

						<DropdownMenuSeparator />
						<DropdownMenuItem disabled>
							<LogOut className="size-4" />
							Sair (requer autenticação na API)
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
