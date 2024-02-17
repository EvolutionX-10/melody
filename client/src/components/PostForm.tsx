import { Form, FormItem, FormField, FormMessage, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

export const formSchema = z.object({
	title: z.string().min(1, {
		message: "Title is required",
	}),
	content: z.string().min(1, {
		message: "Content is required",
	}),
});

export function PostForm(props: Props) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			content: "",
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-8 w-full">
				<FormField
					name="title"
					control={form.control}
					render={({ field }) => {
						return (
							<FormItem className="w-full">
								<FormControl>
									<Input placeholder="Title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<FormField
					name="content"
					control={form.control}
					render={({ field }) => {
						return (
							<FormItem className="w-full">
								<FormControl>
									<Input placeholder="Content" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<Button type="submit" className="w-full">
					Add Post
				</Button>
			</form>
		</Form>
	);
}

interface Props {
	onSubmit: (values: z.infer<typeof formSchema>) => void;
}
