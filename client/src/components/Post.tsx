import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Post as PType } from "@/lib/types/Post";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { authFetch, cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ComponentProps, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

export function Post(props: Props) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const date = formatTimeAgo(new Date(props.createdAt));

	async function onDelete() {
		await authFetch(
			`/posts/${props.id}`,
			{
				method: "DELETE",
			},
			navigate
		);
		toast.success("Post deleted successfully");
		props.setCount((c) => c - 1);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 100 }}
			whileInView={{ opacity: 1, y: 0 }}
			key={props.id}
			transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
		>
			<Card className="border-primary-foreground">
				<CardHeader className="p-4">
					<CardTitle className="text-xl flex items-center justify-between">
						<span>{props.title}</span>
						<div className="flex items-center justify-center gap-2">
							{isDesktop ? (
								<Dialog open={open} onOpenChange={setOpen}>
									<DialogTrigger asChild>
										<Button variant="outline" size="icon">
											<Pencil1Icon className="scale-125" />
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[425px]">
										<DialogHeader>
											<DialogTitle>Edit Post</DialogTitle>
											{/* <DialogDescription></DialogDescription> */}
										</DialogHeader>
										<EditForm {...props} setOpen={setOpen} />
									</DialogContent>
								</Dialog>
							) : (
								<Drawer open={open} onOpenChange={setOpen}>
									<DrawerTrigger asChild>
										<Button variant="outline" size="icon">
											<Pencil1Icon className="scale-125" />
										</Button>
									</DrawerTrigger>
									<DrawerContent>
										<DrawerHeader className="text-left">
											<DrawerTitle>Edit Post</DrawerTitle>
											{/* <DrawerDescription></DrawerDescription> */}
										</DrawerHeader>
										<EditForm {...props} setOpen={setOpen} className="px-4" />
										<DrawerFooter className="pt-2">
											<DrawerClose asChild>
												<Button variant="outline">Cancel</Button>
											</DrawerClose>
										</DrawerFooter>
									</DrawerContent>
								</Drawer>
							)}
							<Button variant="outline" size="icon" onClick={onDelete}>
								<TrashIcon className="scale-125" />
							</Button>
						</div>
					</CardTitle>
					<CardDescription className="-translate-y-2">{date}</CardDescription>
				</CardHeader>
				<CardContent className="p-8 px-4">
					<p>{props.content}</p>
				</CardContent>
				<CardFooter className="text-sm bg-blue-100 dark:bg-slate-300 rounded-b-md pt-2 pb-2 pl-4 text-muted-foreground">
					{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(props.createdAt))}
				</CardFooter>
			</Card>
		</motion.div>
	);
}

const formSchema = z.object({
	title: z.string().min(1, {
		message: "Title is required",
	}),
	content: z.string().min(1, {
		message: "Content is required",
	}),
});

function EditForm(
	props: ComponentProps<"form"> &
		PType & {
			setOpen: React.Dispatch<React.SetStateAction<boolean>>;
			setCount: React.Dispatch<React.SetStateAction<number>>;
		}
) {
	const navigate = useNavigate();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: props.title,
			content: props.content,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const data = await authFetch(
			`/posts/${props.id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			},
			navigate
		);

		if (data) {
			toast.success("Post updated successfully");
		} else {
			toast.error("Failed to update post");
		}
		props.setOpen(false);
		props.setCount((c) => c + 1);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={cn(props.className, "space-y-8 w-full")}>
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
					Update Post
				</Button>
			</form>
		</Form>
	);
}

const formatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: "auto",
});

const DIVISIONS = [
	{ amount: 60, name: "seconds" },
	{ amount: 60, name: "minutes" },
	{ amount: 24, name: "hours" },
	{ amount: 7, name: "days" },
	{ amount: 4.34524, name: "weeks" },
	{ amount: 12, name: "months" },
	{ amount: Number.POSITIVE_INFINITY, name: "years" },
];

function formatTimeAgo(date: Date) {
	let duration = (date.getTime() - new Date().getTime()) / 1000;

	for (let i = 0; i < DIVISIONS.length; i++) {
		const division = DIVISIONS[i];
		if (Math.abs(duration) < division.amount) {
			return formatter.format(Math.round(duration), division.name as Intl.RelativeTimeFormatUnit);
		}
		duration /= division.amount;
	}
}

type Props = PType & {
	setCount: React.Dispatch<React.SetStateAction<number>>;
};
