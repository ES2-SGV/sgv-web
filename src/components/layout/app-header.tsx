import { Link, useMatches } from "@tanstack/react-router";
import * as React from "react";
import { ThemeToggle } from "#/components/layout/theme-toggle";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";

/**
 * As migalhas saem do `staticData.titulo` declarado em cada rota — nada de
 * mapa de caminhos para manter sincronizado à mão.
 */
export function AppHeader() {
	const matches = useMatches();
	const crumbs = matches
		.filter((match) => Boolean(match.staticData?.titulo))
		.map((match) => ({
			titulo: match.staticData.titulo as string,
			href: match.pathname,
		}));

	return (
		<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
			<div className="flex w-full items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						{crumbs.map((crumb, index) => {
							const ultimo = index === crumbs.length - 1;
							return (
								<React.Fragment key={crumb.href}>
									<BreadcrumbItem>
										{ultimo ? (
											<BreadcrumbPage>{crumb.titulo}</BreadcrumbPage>
										) : (
											<BreadcrumbLink asChild>
												<Link to={crumb.href}>{crumb.titulo}</Link>
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{!ultimo && <BreadcrumbSeparator />}
								</React.Fragment>
							);
						})}
					</BreadcrumbList>
				</Breadcrumb>
				<div className="ml-auto flex items-center gap-2">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
