import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner.tsx";
import App from "./App.tsx";
import "./index.css";
import "./base.css";

import { Login } from "@/pages/Login.tsx";
import { SignUp } from "@/pages/SignUp.tsx";
import { Dashboard } from "@/pages/Dashboard.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/signup",
		element: <SignUp />,
	},
	{
		path: "/dashboard",
		element: <Dashboard />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<>
		<RouterProvider router={router} />
		<Toaster />
	</>
);
