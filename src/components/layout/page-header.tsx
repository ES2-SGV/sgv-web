import type * as React from "react";

interface PageHeaderProps {
	titulo: string;
	descricao?: string;
	/** Botões primários da tela, alinhados à direita. */
	acoes?: React.ReactNode;
}

export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="space-y-1">
				<h1 className="font-semibold text-2xl tracking-tight">{titulo}</h1>
				{descricao && (
					<p className="text-muted-foreground text-sm">{descricao}</p>
				)}
			</div>
			{acoes && <div className="flex items-center gap-2">{acoes}</div>}
		</div>
	);
}
