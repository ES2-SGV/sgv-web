/**
 * A API devolve LocalDate como "yyyy-MM-dd". `new Date("2025-01-05")` seria
 * interpretado como UTC e mostraria o dia anterior no fuso do Brasil, então
 * montamos a data em horário local explicitamente.
 */
export function parseIsoDate(iso: string): Date {
	const [ano, mes, dia] = iso.split("-").map(Number);
	return new Date(ano, mes - 1, dia);
}

/** Data de hoje em "yyyy-MM-dd", pronta para mandar à API. */
export function toIsoDate(date: Date): string {
	const mes = String(date.getMonth() + 1).padStart(2, "0");
	const dia = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${mes}-${dia}`;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export function formatDate(iso: string | null | undefined): string {
	return iso ? dateFormatter.format(parseIsoDate(iso)) : "—";
}

export function formatDateRange(inicio: string, fim: string): string {
	return `${formatDate(inicio)} – ${formatDate(fim)}`;
}

/** Duração em dias, contando o dia de saída e o de retorno. */
export function diffEmDias(inicio: string, fim: string): number {
	const ms = parseIsoDate(fim).getTime() - parseIsoDate(inicio).getTime();
	return Math.round(ms / 86_400_000) + 1;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

export function formatCurrency(valor: number | null | undefined): string {
	return currencyFormatter.format(valor ?? 0);
}

/** Iniciais para o avatar do menu de usuário. */
export function iniciais(nome: string): string {
	const partes = nome.trim().split(/\s+/);
	if (partes.length === 0 || partes[0] === "") return "?";
	const primeira = partes[0][0];
	const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
	return (primeira + ultima).toUpperCase();
}
