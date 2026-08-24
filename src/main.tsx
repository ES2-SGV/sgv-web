import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import "./styles.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const router = getRouter();
const queryClient = new QueryClient();
const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ReactQueryDevtools />
		</QueryClientProvider>
	</StrictMode>,
);
