import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { parseIsoDate, toIsoDate } from "#/lib/format";
import { cn } from "#/lib/utils";

interface DateFieldProps {
	value: string;
	onChange: (iso: string) => void;
	placeholder?: string;
	disabled?: boolean;
	/** Datas anteriores a esta ficam bloqueadas no calendário. */
	minima?: string;
	id?: string;
}

export function DateField({
	value,
	onChange,
	placeholder = "Selecione a data",
	disabled = false,
	minima,
	id,
}: DateFieldProps) {
	const [aberto, setAberto] = useState(false);
	const selecionada = value ? parseIsoDate(value) : undefined;

	return (
		<Popover open={aberto} onOpenChange={setAberto}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={disabled}
					className={cn(
						"w-full justify-start font-normal",
						!value && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="size-4" />
					{selecionada
						? format(selecionada, "dd/MM/yyyy", { locale: ptBR })
						: placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					locale={ptBR}
					selected={selecionada}
					defaultMonth={selecionada}
					disabled={minima ? { before: parseIsoDate(minima) } : undefined}
					autoFocus
					onSelect={(data) => {
						onChange(data ? toIsoDate(data) : "");
						setAberto(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
