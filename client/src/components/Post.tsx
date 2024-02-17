import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Post as PType } from "@/lib/types/Post";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

export function Post(props: PType) {
	const date = new Date(props.createdAt).toLocaleDateString();
	return (
		<AnimatePresence>
			<motion.div
				className="w-1/3 max-md:w-[80vw]"
				initial={{ opacity: 0, y: 100 }}
				whileInView={{ opacity: 1, y: 0 }}
				// viewport={{ once: true }}
				transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
			>
				<Card>
					<CardHeader className="p-4">
						<CardTitle className="text-xl flex items-center justify-between">
							<span>{props.title}</span>
							<div className="flex items-center justify-center gap-2">
								<Button variant="outline" size="icon">
									<Pencil1Icon className="scale-125" />
								</Button>
								<Button variant="outline" size="icon">
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
		</AnimatePresence>
	);
}
