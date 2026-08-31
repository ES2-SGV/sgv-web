import * as React from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "sgv:theme";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function aplicar(theme: Theme) {
	const escuro =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);
	document.documentElement.classList.toggle("dark", escuro);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = React.useState<Theme>(
		() => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system",
	);

	React.useEffect(() => {
		aplicar(theme);
		if (theme !== "system") return;

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => aplicar("system");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme]);

	const value = React.useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme: (next) => {
				localStorage.setItem(STORAGE_KEY, next);
				setThemeState(next);
			},
		}),
		[theme],
	);

	return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
	const context = React.use(ThemeContext);
	if (!context)
		throw new Error("useTheme precisa estar dentro de ThemeProvider");
	return context;
}
