import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Post as PType } from "@/lib/types/Post";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { authFetch } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export function Post(props: Props) {
	const navigate = useNavigate();
	const date = new Date(props.createdAt).toLocaleDateString();

	async function onEdit() {
		console.log(`editing post ${props.id}`);
	}

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
			// viewport={{ once: true }}
			transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
		>
			<Card>
				<CardHeader className="p-4">
					<CardTitle className="text-xl flex items-center justify-between">
						<span>{props.title}</span>
						<div className="flex items-center justify-center gap-2">
							<Button variant="outline" size="icon" onClick={onEdit}>
								<Pencil1Icon className="scale-125" />
							</Button>
							<Button variant="outline" size="icon" onClick={onDelete}>
								<TrashIcon className="scale-125" />
							</Button>
						</div>
					</CardTitle>
					<CardDescription>{date}</CardDescription>
				</CardHeader>
				<CardContent className="p-8 px-4">
					<p>{props.content}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}

type Props = PType & {
	setCount: React.Dispatch<React.SetStateAction<number>>;
};
