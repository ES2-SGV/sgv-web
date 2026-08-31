import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "#/components/ui/sonner";
import { SessionProvider } from "#/lib/session";
import { ThemeProvider } from "#/lib/theme";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<SessionProvider>
					<RouterProvider router={router} />
					<Toaster richColors position="bottom-right" />
				</SessionProvider>
			</ThemeProvider>
			<ReactQueryDevtools buttonPosition="bottom-right" />
		</QueryClientProvider>
	</StrictMode>,
);
