import express from "express";
import cors from "cors";
import { PrismaClient, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "./types/Request.js";

const EXPIRATION_TIME = 600;

export const app = express();
const prisma = new PrismaClient();

const whitelist = ["http://localhost:5173", "https://melody-five.vercel.app"];

const corsOptions = {
	credentials: true,
	origin: (origin, callback) => {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get("/api", (req, res) => {
	res.send("Hello World");
});

// ! SIGNUP ROUTE

app.post("/api/signup", async (req, res) => {
	const { email, password, name } = req.body as User;
	const hashedPassword = await bcrypt.hash(password, 10);
	const exists = await prisma.user.findUnique({ where: { email } });

	if (exists) {
		return res.status(400).json({ message: "User already exists" });
	}

	await prisma.user
		.create({ data: { email, password: hashedPassword, name } })
		.then((user) => {
			const access_token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRATION_TIME });
			const refresh_token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

			res.cookie("jwt", refresh_token, {
				httpOnly: true,
				sameSite: "none",
				secure: true,
				maxAge: 24 * 60 * 60 * 1000,
			});
			return res.status(200).json({ message: "Sign Up Successful", ...user, access_token });
		})
		.catch((e) => {
			return res.status(403).json({ message: e.message });
		});
});

// ! LOGIN ROUTE

app.post("/api/login", async (req, res) => {
	const { email, password } = req.body as User;
	const user = await prisma.user.findUnique({ where: { email } });

	// console.log(await bcrypt.compare(password, user.password));
	// console.log(await bcrypt.hash(password, 10));
	const validPassword = await bcrypt.compare(password, user.password);

	if (!user || !validPassword) {
		return res.status(403).json({ message: "Invalid Password or Email" });
	}

	const access_token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRATION_TIME });
	const refresh_token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

	res.cookie("jwt", refresh_token, {
		httpOnly: true,
		sameSite: "none",
		secure: true,
		maxAge: 24 * 60 * 60 * 1000,
	});

	return res.status(200).json({ message: "Login Successful", access_token });
});

// ! REFRESH TOKEN ROUTE

app.get("/api/refresh", async (req, res) => {
	const token = req.cookies.jwt;

	if (!token) {
		return res.status(406).json({ message: "Unauthorized" });
	}

	jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err: unknown, user: { email: string }) => {
		if (err) {
			return res.status(403).json({ message: "Invalid token" });
		}

		const access_token = jwt.sign({ email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRATION_TIME });

		return res.status(200).json({ access_token });
	});
});

// ! VERIFY FUNCTION

const verify = async (req: any, res: any, next: any) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token || token == "undefined") {
		return res.status(406).json({ message: "Unauthorized" });
	}

	jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err: unknown, user: User) => {
		if (err) {
			if (err instanceof jwt.TokenExpiredError) {
				return res.status(406).json({ message: "Session Expired" });
			}
			return res.status(403).json({ message: "Invalid token" });
		}
		// fetch user from db
		const fetchedUser = await prisma.user.findUnique({ where: { email: user.email } });
		req.user = { ...user, ...fetchedUser };
		next();
	});
};

// ! DEFINING PROTECTED ROUTES

app.get("/api/posts", verify, async (req: AuthenticatedRequest, res) => {
	const posts = await prisma.post.findMany({ where: { author: { email: req.user.email } } });
	posts.reverse();
	return res.status(200).json({ message: "Authorized from Posts Route", user: req.user, posts });
});

app.post("/api/posts", verify, async (req: AuthenticatedRequest, res) => {
	const post = await prisma.post.create({
		data: {
			title: req.body.title,
			content: req.body.content,
			author: {
				connect: { email: req.user.email },
			},
		},
	});
	return res.status(200).json({ message: "Post Created", post });
});

app.put("/api/posts/:id", verify, async (req: AuthenticatedRequest, res) => {
	const post = await prisma.post.update({
		where: { id: req.params.id },
		data: {
			title: req.body.title,
			content: req.body.content,
		},
	});
	return res.status(200).json({ message: "Post Updated", post });
});

app.delete("/api/posts/:id", verify, async (req: AuthenticatedRequest, res) => {
	await prisma.post.delete({ where: { id: req.params.id } });
	return res.status(200).json({ message: "Post Deleted" });
});

app.get("/api/logout", verify, async (req: AuthenticatedRequest, res) => {
	res.clearCookie("jwt");
	return res.status(200).json({ message: "Logged Out" });
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running: http://localhost:${process.env.PORT}`);
});
