import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function App() {
	const navigate = useNavigate();
	return (
		<div className="flex h-screen w-screen items-center justify-center gap-16">
			<Button variant="outline" onClick={() => navigate("/login")}>
				Login
			</Button>
			<Button variant="outline" onClick={() => navigate("/signup")}>
				Sign Up
			</Button>
		</div>
	);
}
