import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Post as PType } from "@/lib/types/Post";

export function Post(props: PType) {
	const date = new Date(props.createdAt).toLocaleDateString();
	return (
		<Card className="w-1/3 max-md:w-[80vw]">
			<CardHeader className="p-4">
				<CardTitle className="text-xl">{props.title}</CardTitle>
				<CardDescription>{date}</CardDescription>
			</CardHeader>
			<CardContent className="p-8 px-4">
				<p>{props.content}</p>
			</CardContent>
		</Card>
	);
}
