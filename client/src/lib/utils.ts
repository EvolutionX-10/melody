import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookie from "js-cookie";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function refreshAccessToken(navigate: Function) {
	const res = await fetch(`${import.meta.env.VITE_BASE}/refresh`, {
		credentials: "include",
	});
	if (res.status === 200) {
		const data = await res.json();
		Cookie.set("access_token", data.access_token, { secure: true });
		toast.success("Token Refreshed");
	} else {
		toast.error("Unauthorized");
		if (Cookie.get("access_token")) {
			Cookie.remove("access_token");
		}
		navigate("/login");
	}
}

export async function authFetch(url: string, options: RequestInit, navigate: Function) {
	const token = Cookie.get("access_token");
	let res = await fetch(`${import.meta.env.VITE_BASE}${url}`, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	});
	if (res.status === 406) {
		await refreshAccessToken(navigate);
		await authFetch(url, options, navigate);
	}
	return res.json();
}
