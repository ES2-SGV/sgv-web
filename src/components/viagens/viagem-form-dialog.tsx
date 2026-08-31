import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useColaboradores } from "#/api/hooks/use-colaboradores";
import { useDestinos } from "#/api/hooks/use-destinos";
import { useCreateViagem } from "#/api/hooks/use-viagens";
import {
	MEIO_TRANSPORTE_LABEL,
	MEIOS_TRANSPORTE,
	type MeioTransporte,
	type ViagemRequest,
} from "#/api/types";
import { DateField } from "#/components/common/date-field";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { aplicarErrosDaApi } from "#/lib/form";
import { useSession } from "#/lib/session";

const viagemSchema = z
	.object({
		destinoId: z.string().min(1, "Destino é obrigatório"),
		colaboradorId: z.string().min(1, "Responsável é obrigatório"),
		motivo: z.string().trim().min(1, "Motivo é obrigatório"),
		dataSaida: z.string().min(1, "Data de saída é obrigatória"),
		dataRetorno: z.string().min(1, "Data de retorno é obrigatória"),
		meioTransporte: z.enum(MEIOS_TRANSPORTE, {
			message: "Meio de transporte é obrigatório",
		}),
	})
	.refine((valores) => valores.dataRetorno >= valores.dataSaida, {
		message: "Data de retorno deve ser igual ou posterior à data de saída",
		path: ["dataRetorno"],
	});

export type ViagemFormValues = z.infer<typeof viagemSchema>;

function valoresIniciais(colaboradorDaSessao: number | null): ViagemFormValues {
	return {
		destinoId: "",
		colaboradorId: colaboradorDaSessao ? String(colaboradorDaSessao) : "",
		motivo: "",
		dataSaida: "",
		dataRetorno: "",
		meioTransporte: "" as MeioTransporte,
	};
}

interface ViagemFormDialogProps {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
}

/** Formulário de cadastro de viagem. */
export function ViagemFormDialog({
	aberto,
	onOpenChange,
}: ViagemFormDialogProps) {
	const { colaboradorId: colaboradorDaSessao } = useSession();
	const { data: destinos = [], isLoading: carregandoDestinos } = useDestinos();
	const { data: colaboradores = [], isLoading: carregandoColaboradores } =
		useColaboradores();

	const criar = useCreateViagem();

	const form = useForm<ViagemFormValues>({
		resolver: zodResolver(viagemSchema),
		defaultValues: valoresIniciais(colaboradorDaSessao),
	});

	const dataSaida = form.watch("dataSaida");
	const semCadastrosBasicos =
		!carregandoDestinos &&
		!carregandoColaboradores &&
		(destinos.length === 0 || colaboradores.length === 0);

	const onSubmit = form.handleSubmit((valores) => {
		const payload: ViagemRequest = {
			destinoId: Number(valores.destinoId),
			colaboradorId: Number(valores.colaboradorId),
			motivo: valores.motivo,
			dataSaida: valores.dataSaida,
			dataRetorno: valores.dataRetorno,
			meioTransporte: valores.meioTransporte,
		};

		criar.mutate(payload, {
			onSuccess: () => {
				toast.success("Viagem cadastrada como rascunho.");
				onOpenChange(false);
			},
			onError: (erro: unknown) => aplicarErrosDaApi(form, erro),
		});
	});

	const salvando = criar.isPending;
	const camposBloqueados = salvando;

	return (
		<Dialog open={aberto} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Nova viagem</DialogTitle>
					<DialogDescription>
						A viagem é criada como rascunho e pode ser submetida depois.
					</DialogDescription>
				</DialogHeader>

				{semCadastrosBasicos && (
					<Alert>
						<AlertCircle className="size-4" />
						<AlertTitle>Cadastros pendentes</AlertTitle>
						<AlertDescription>
							É preciso ter ao menos um{" "}
							<Link to="/destinos" className="underline">
								destino
							</Link>{" "}
							e um{" "}
							<Link to="/colaboradores" className="underline">
								colaborador
							</Link>{" "}
							para registrar uma viagem.
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="destinoId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Destino</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={camposBloqueados || carregandoDestinos}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecione o destino" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{destinos.map((destino) => (
													<SelectItem
														key={destino.id}
														value={String(destino.id)}
													>
														{destino.nome} — {destino.cidade}/{destino.pais}
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
								name="colaboradorId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Responsável</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={camposBloqueados || carregandoColaboradores}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecione o responsável" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{colaboradores.map((colaborador) => (
													<SelectItem
														key={colaborador.id}
														value={String(colaborador.id)}
													>
														{colaborador.nome} — {colaborador.area}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Vem da sessão atual, mas pode ser trocado.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="dataSaida"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Data de saída</FormLabel>
										<FormControl>
											<DateField
												value={field.value}
												onChange={(iso) => {
													field.onChange(iso);
													const retorno = form.getValues("dataRetorno");
													if (retorno && retorno < iso) {
														form.setValue("dataRetorno", "");
													}
												}}
												disabled={camposBloqueados}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="dataRetorno"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Data de retorno</FormLabel>
										<FormControl>
											<DateField
												value={field.value}
												onChange={field.onChange}
												minima={dataSaida || undefined}
												disabled={camposBloqueados}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="meioTransporte"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Meio de transporte</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={camposBloqueados}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Selecione o meio de transporte" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{MEIOS_TRANSPORTE.map((meio) => (
												<SelectItem key={meio} value={meio}>
													{MEIO_TRANSPORTE_LABEL[meio]}
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
							name="motivo"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Motivo</FormLabel>
									<FormControl>
										<Textarea
											rows={3}
											placeholder="Reunião de alinhamento com o cliente"
											disabled={camposBloqueados}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{form.formState.errors.root && (
							<p className="text-destructive text-sm">
								{form.formState.errors.root.message}
							</p>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={salvando || semCadastrosBasicos}>
								{salvando ? "Salvando..." : "Cadastrar viagem"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
