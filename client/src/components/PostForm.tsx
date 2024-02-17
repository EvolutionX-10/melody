// generate a Post Form where user will add his post, the field should be title and content and a add button that will submit the form, do all the zod validations and if possible also send the POST request to /posts route with the above data
import { Form, FormItem, FormLabel, FormField, FormMessage, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { authFetch } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";

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
