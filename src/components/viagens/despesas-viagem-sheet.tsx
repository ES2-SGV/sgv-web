import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getErrorMessage } from "#/api/client";
import {
	useCreateDespesa,
	useDeleteDespesa,
	useDespesasDaViagem,
} from "#/api/hooks/use-despesas";
import {
	type DespesaRequest,
	podeRegistrarDespesa,
	TIPO_DESPESA_LABEL,
	TIPOS_DESPESA,
	type Viagem,
} from "#/api/types";
import { ConfirmDialog } from "#/components/common/confirm-dialog";
import { DateField } from "#/components/common/date-field";
import { EmptyState, ErrorState } from "#/components/common/state-views";
import { Button } from "#/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import { formatCurrency, formatDate, toIsoDate } from "#/lib/format";

interface DespesasViagemSheetProps {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	viagem: Viagem | null;
}

const despesaSchema = z.object({
	tipoDespesa: z.enum(TIPOS_DESPESA, { message: "Categoria é obrigatória" }),
	dataDespesa: z.string().min(1, "Data é obrigatória"),
	valor: z.coerce.number().positive("O valor deve ser maior que zero"),
	descricao: z.string().trim().min(1, "Descrição é obrigatória"),
});

type DespesaFormValues = z.infer<typeof despesaSchema>;

const VALORES_VAZIOS: DespesaFormValues = {
	tipoDespesa: "" as DespesaFormValues["tipoDespesa"],
	dataDespesa: toIsoDate(new Date()),
	valor: 0,
	descricao: "",
};

/**
 * Drawer de despesas de uma viagem. Lista o que já foi lançado, mostra o
 * subtotal por categoria e o total (que é o `viagem.valorTotal` calculado
 * pelo backend — não recalculamos aqui para não divergir dele), e permite
 * lançar/excluir despesa quando a viagem está Aprovada.
 */
export function DespesasViagemSheet({
	aberto,
	onOpenChange,
	viagem,
}: DespesasViagemSheetProps) {
	const viagemId = viagem?.id;
	const {
		data: despesas = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useDespesasDaViagem(viagemId);
	const criar = useCreateDespesa(viagemId ?? 0);
	const remover = useDeleteDespesa(viagemId ?? 0);

	const form = useForm<DespesaFormValues>({
		resolver: zodResolver(despesaSchema),
		defaultValues: VALORES_VAZIOS,
	});

	const subtotais = useMemo(() => {
		const mapa = new Map<string, number>();
		for (const despesa of despesas) {
			mapa.set(
				despesa.tipoDespesa,
				(mapa.get(despesa.tipoDespesa) ?? 0) + despesa.valor,
			);
		}
		return mapa;
	}, [despesas]);

	if (!viagem) return null;

	const podeLancar = podeRegistrarDespesa(viagem.situacao);

	const onSubmit = form.handleSubmit((valores) => {
		const payload: DespesaRequest = {
			tipoDespesa: valores.tipoDespesa,
			dataDespesa: valores.dataDespesa,
			valor: valores.valor,
			descricao: valores.descricao,
		};
		criar.mutate(payload, {
			onSuccess: () => {
				toast.success("Despesa lançada.");
				form.reset(VALORES_VAZIOS);
			},
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});
	});

	const excluir = (despesaId: number) =>
		remover.mutate(despesaId, {
			onSuccess: () => toast.success("Despesa removida."),
			onError: (erro) => toast.error(getErrorMessage(erro)),
		});

	return (
		<Sheet open={aberto} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Despesas da viagem #{viagem.id}</SheetTitle>
					<SheetDescription>
						{viagem.destino.nome} — {viagem.destino.cidade}/
						{viagem.destino.pais}
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
					{/* Resumo por categoria + total */}
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{TIPOS_DESPESA.map((tipo) => (
							<div key={tipo} className="rounded-md border p-2">
								<p className="text-muted-foreground text-xs">
									{TIPO_DESPESA_LABEL[tipo]}
								</p>
								<p className="font-medium text-sm">
									{formatCurrency(subtotais.get(tipo) ?? 0)}
								</p>
							</div>
						))}
						<div className="rounded-md border border-primary bg-primary/5 p-2 col-span-2 sm:col-span-3">
							<p className="text-muted-foreground text-xs">
								Custo total da viagem
							</p>
							<p className="font-semibold text-base">
								{formatCurrency(viagem.valorTotal)}
							</p>
						</div>
					</div>

					<Separator />

					{/* Formulário de nova despesa — só quando a viagem está Aprovada */}
					{podeLancar ? (
						<Form {...form}>
							<form onSubmit={onSubmit} className="space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name="tipoDespesa"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Categoria</FormLabel>
												<Select
													value={field.value}
													onValueChange={field.onChange}
												>
													<FormControl>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Selecione" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{TIPOS_DESPESA.map((tipo) => (
															<SelectItem key={tipo} value={tipo}>
																{TIPO_DESPESA_LABEL[tipo]}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="valor"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Valor (R$)</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														min="0.01"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="dataDespesa"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Data</FormLabel>
											<FormControl>
												<DateField
													value={field.value}
													onChange={field.onChange}
													// A regra de negócio não aceita despesa com data futura.
													maxima={new Date()}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="descricao"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Descrição</FormLabel>
											<FormControl>
												<Input
													placeholder="Ex.: Hotel Ibis - 2 diárias"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									size="sm"
									disabled={criar.isPending}
									className="w-full"
								>
									<Plus className="size-4" />
									{criar.isPending ? "Lançando..." : "Lançar despesa"}
								</Button>
							</form>
						</Form>
					) : (
						<p className="text-muted-foreground text-sm">
							Só é possível lançar despesas com a viagem aprovada.
						</p>
					)}

					<Separator />

					{/* Lista de despesas já lançadas */}
					{isError ? (
						<ErrorState error={error} onRetry={() => refetch()} />
					) : isLoading ? (
						<>
							<Skeleton className="h-14 w-full" />
							<Skeleton className="h-14 w-full" />
						</>
					) : despesas.length === 0 ? (
						<EmptyState
							icon={Receipt}
							titulo="Nenhuma despesa lançada"
							descricao="As despesas aparecem aqui assim que forem registradas."
						/>
					) : (
						<ul className="space-y-2">
							{despesas.map((despesa) => (
								<li
									key={despesa.id}
									className="flex items-center justify-between gap-2 rounded-md border p-2"
								>
									<div className="min-w-0">
										<p className="truncate font-medium text-sm">
											{despesa.descricao}
										</p>
										<p className="text-muted-foreground text-xs">
											{TIPO_DESPESA_LABEL[despesa.tipoDespesa]} ·{" "}
											{formatDate(despesa.dataDespesa)}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<span className="font-medium text-sm">
											{formatCurrency(despesa.valor)}
										</span>
										<ConfirmDialog
											titulo="Excluir despesa?"
											descricao={`"${despesa.descricao}" (${formatCurrency(despesa.valor)}) será removida permanentemente.`}
											textoConfirmar="Excluir"
											destrutivo
											onConfirm={() => excluir(despesa.id)}
										>
											<Button
												variant="ghost"
												size="icon"
												aria-label="Excluir despesa"
												disabled={remover.isPending}
											>
												<Trash2 className="size-4" />
											</Button>
										</ConfirmDialog>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
