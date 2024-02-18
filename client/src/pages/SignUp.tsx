import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormControl, FormMessage, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { useEffect } from "react";

const formSchema = z
	.object({
		name: z.string().min(1, {
			message: "Name is required",
		}),
		email: z.string().email().min(1, {
			message: "Email is required",
		}),
		password: z
			.string()
			.min(1, {
				message: "Password is required",
			})
			.min(8, {
				message: "Password must be at least 8 characters long",
			}),
		confirmPassword: z.string().min(1, {
			message: "Re-Enter your Password",
		}),
		terms: z.literal<boolean>(true, {
			errorMap: () => ({
				message: "Terms and Conditions must be accepted",
			}),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function SignUp() {
	const navigate = useNavigate();
	useEffect(() => {
		if (Cookie.get("access_token")) navigate("/dashboard");
	}, []);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const res = await fetch(`${import.meta.env.VITE_BASE}/signup`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: values.name,
				email: values.email,
				password: values.password,
			}),
		});

		const data = await res.json();
		if (data.access_token) Cookie.set("access_token", data.access_token, { secure: true });

		switch (res.status) {
			case 200:
				toast.success(data.message);
				navigate("/dashboard");
				break;
			case 400:
				toast.warning(data.message);
				break;
			case 403:
				toast.error(data.message);
				break;
			default:
				toast.error("An error occurred");
				break;
		}
	}

	return (
		<div className="flex flex-col h-screen w-screen items-center justify-center bg-background">
			<section className="bg-primary-foreground p-16 rounded-lg shadow-lg w-[25rem] max-md:w-[90vw] max-md:p-4">
				<h1 className="text-blue-600 dark:text-blue-500 text-5xl font-medium text-center">Sign Up</h1>
				<div className="py-4 flex flex-col gap-4 items-center">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full text-primary">
							<FormField
								name="name"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem className="w-full">
											<FormControl>
												<Input placeholder="Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
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
							<FormField
								name="confirmPassword"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem>
											<FormControl>
												<Input {...field} type="password" placeholder="Confirm Password" />
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
							<FormField
								name="terms"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem className="space-x-2">
											<div className="flex gap-2">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} id="terms" />
												</FormControl>
												<FormLabel htmlFor="terms">I agree to the terms and conditions</FormLabel>
											</div>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
							<Button type="submit" className="w-full">
								Sign Up
							</Button>
						</form>
					</Form>
				</div>
			</section>
		</div>
	);
}
