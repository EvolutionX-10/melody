import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Post as PType } from "@/lib/types/Post";

export function Post(props: PType) {
	const date = new Date(props.createdAt).toLocaleDateString();
	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{date}</CardDescription>
			</CardHeader>
			<CardContent>
				<p>{props.content}</p>
			</CardContent>
		</Card>
	);
}
