import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import useDestinos, { useDestino } from "#/api/hooks/useDestinos";
import type { DestinoRequest } from "#/api/types";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";

export const Route = createFileRoute("/")({ component: Home });

const emptyForm: DestinoRequest = { nome: "", cidade: "", pais: "" };

function Home() {
	const {
		destinos,
		isLoading,
		isError,
		error,
		refetch,
		create,
		update,
		remove,
	} = useDestinos();
	const [form, setForm] = useState<DestinoRequest>(emptyForm);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [lookupId, setLookupId] = useState("");

	const lookup = useDestino(lookupId ? Number(lookupId) : undefined);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (editingId === null) {
			create.mutate(form, { onSuccess: () => setForm(emptyForm) });
		} else {
			update.mutate(
				{ id: editingId, payload: form },
				{
					onSuccess: () => {
						setForm(emptyForm);
						setEditingId(null);
					},
				},
			);
		}
	};

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
			<h1 className="font-bold text-3xl">Destinos</h1>

			<Card>
				<CardHeader>
					<CardTitle>
						{editingId === null
							? "Criar destino"
							: `Editar destino #${editingId}`}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="flex flex-col gap-4">
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="flex flex-col gap-2">
								<Label htmlFor="nome">Nome</Label>
								<Input
									id="nome"
									value={form.nome}
									onChange={(e) => setForm({ ...form, nome: e.target.value })}
									required
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="cidade">Cidade</Label>
								<Input
									id="cidade"
									value={form.cidade}
									onChange={(e) => setForm({ ...form, cidade: e.target.value })}
									required
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="pais">País</Label>
								<Input
									id="pais"
									value={form.pais}
									onChange={(e) => setForm({ ...form, pais: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								type="submit"
								disabled={create.isPending || update.isPending}
							>
								{editingId === null ? "Criar (POST)" : "Salvar (PUT)"}
							</Button>
							{editingId !== null && (
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setForm(emptyForm);
										setEditingId(null);
									}}
								>
									Cancelar
								</Button>
							)}
						</div>
						{(create.isError || update.isError) && (
							<p className="text-destructive text-sm">
								{create.error?.message ?? update.error?.message}
							</p>
						)}
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Buscar por id (GET /destinos/:id)</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<Input
						value={lookupId}
						onChange={(e) => setLookupId(e.target.value)}
						placeholder="id"
						inputMode="numeric"
					/>
					{lookup.isFetching && <p className="text-sm">Buscando...</p>}
					{lookup.isError && (
						<p className="text-destructive text-sm">{lookup.error.message}</p>
					)}
					{lookup.data && (
						<pre className="rounded bg-muted p-3 text-sm">
							{JSON.stringify(lookup.data, null, 2)}
						</pre>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex-row items-center justify-between">
					<CardTitle>Lista (GET /destinos)</CardTitle>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Recarregar
					</Button>
				</CardHeader>
				<CardContent>
					{isLoading && <p className="text-sm">Carregando...</p>}
					{isError && (
						<p className="text-destructive text-sm">{error?.message}</p>
					)}
					{!isLoading && !isError && destinos.length === 0 && (
						<p className="text-muted-foreground text-sm">Nenhum destino.</p>
					)}
					{destinos.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Id</TableHead>
									<TableHead>Nome</TableHead>
									<TableHead>Cidade</TableHead>
									<TableHead>País</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{destinos.map((destino) => (
									<TableRow key={destino.id}>
										<TableCell>{destino.id}</TableCell>
										<TableCell>{destino.nome}</TableCell>
										<TableCell>{destino.cidade}</TableCell>
										<TableCell>{destino.pais}</TableCell>
										<TableCell className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setEditingId(destino.id);
													setForm({
														nome: destino.nome,
														cidade: destino.cidade,
														pais: destino.pais,
													});
												}}
											>
												Editar
											</Button>
											<Button
												variant="destructive"
												size="sm"
												disabled={remove.isPending}
												onClick={() => remove.mutate(destino.id)}
											>
												Excluir
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
