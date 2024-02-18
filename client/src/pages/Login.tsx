import { Input } from "@/components/ui/input";
import { Form, FormField, FormControl, FormMessage, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { useEffect } from "react";

const formSchema = z.object({
	email: z.string().email().min(1, {
		message: "Email is required",
	}),
	password: z.string().min(1, {
		message: "Password is required",
	}),
});

export function Login() {
	const navigate = useNavigate();
	useEffect(() => {
		if (Cookie.get("access_token")) navigate("/dashboard");
	}, []);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const res = await fetch(`${import.meta.env.VITE_BASE}/login`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: values.email,
				password: values.password,
			}),
		});

		const data = await res.json();
		switch (res.status) {
			case 200:
				toast.success(data.message);
				navigate("/dashboard");
				break;
			case 403:
				toast.error(data.message);
				break;
			default:
				toast.error("An error occurred");
				break;
		}
		if (data.access_token) Cookie.set("access_token", data.access_token, { secure: true });
	}

	return (
		<div className="flex flex-col h-screen w-screen items-center justify-center bg-background">
			<section className="bg-primary-foreground p-16 rounded-lg shadow-lg w-[25rem] max-md:w-[90vw] max-md:px-4">
				<h1 className="text-blue-600 dark:text-blue-500 text-5xl font-medium text-center">Login</h1>
				<div className="py-16 flex flex-col gap-4 items-center">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full text-primary">
							<FormField
								name="email"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem className="w-full">
											<FormControl>
												<Input placeholder="Email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
							<FormField
								name="password"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem className="w-full">
											<FormControl>
												<Input {...field} type="password" placeholder="Password" />
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
							<Button type="submit" className="w-full">
								Login
							</Button>
						</form>
					</Form>
				</div>
			</section>
		</div>
	);
}
