import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Cookie from "js-cookie";
import { User } from "@/lib/types/User";
import { Loading } from "./Loading";
import { PostForm, formSchema } from "@/components/PostForm";
import type { Post as PType } from "@/lib/types/Post";
import { Post } from "@/components/Post";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";

export function Dashboard() {
	const navigate = useNavigate();
	const [user, setUser] = useState<User>();
	const [posts, setPosts] = useState<PType[]>([]);
	const [count, setCount] = useState(0);

	async function getPosts() {
		const data = await authFetch("/posts", {}, navigate);
		if (data.user) {
			setUser(data.user);
			setPosts(data.posts);
			setCount(data.posts.length);
		}
	}

	async function logout() {
		await authFetch("/logout", {}, navigate);
		Cookie.remove("access_token");
		navigate("/");
		toast.success("Logged out");
	}

	useEffect(() => {
		getPosts();
	}, [count]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const data = await authFetch(
			"/posts",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			},
			navigate
		);

		if (data) {
			toast.success("Post added successfully");
			setCount((c) => c + 1);
		} else {
			toast.error("Failed to add post");
		}
	}

	if (!user) {
		return <Loading />;
	}

	return (
		<div className="w-full flex flex-col items-center justify-center">
			<nav className="bg-neutral-100 p-4 flex justify-end absolute top-0 w-full">
				<Button onClick={logout} className="text-white" variant="default">
					Logout
				</Button>
			</nav>
			<div className="flex items-center justify-center flex-col w-1/3 h-[30rem] max-md:w-[80vw] overflow-x-hidden">
				<h1 className="text-blue-600 text-5xl font-medium py-16 max-md:text-3xl text-center flex items-center justify-center">
					Hello {user.name}
				</h1>
				<PostForm onSubmit={onSubmit} />
			</div>
			{posts.length > 0 && (
				<div className="flex flex-wrap py-4 pb-12 justify-center w-full items-center gap-8 overflow-hidden">
					<AnimatePresence>
						{posts.map((post) => (
							<motion.div
								layout
								className="w-1/3 max-md:w-[80vw]"
								animate={{ opacity: 1 }}
								exit={{ opacity: 0, y: 100 }}
								key={post.id}
							>
								<Post key={post.id} {...post} setCount={setCount} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}
