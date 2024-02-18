var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
const EXPIRATION_TIME = 60;
const app = express();
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
  }
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.get("/api", (req, res) => {
  res.send("Hello World");
});
app.post("/api/signup", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }
  await prisma.user.create({ data: { email, password: hashedPassword, name } }).then((user) => {
    const access_token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRATION_TIME });
    const refresh_token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1e3
    });
    return res.status(200).json({ message: "Sign Up Successful", ...user, access_token });
  }).catch((e) => {
    return res.status(403).json({ message: e.message });
  });
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
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
    maxAge: 24 * 60 * 60 * 1e3
  });
  return res.status(200).json({ message: "Login Successful", access_token });
});
app.get("/api/refresh", async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(406).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    const access_token = jwt.sign({ email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: EXPIRATION_TIME });
    return res.status(200).json({ access_token });
  });
});
const verify = /* @__PURE__ */ __name(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || token == "undefined") {
    return res.status(406).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, user) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(406).json({ message: "Session Expired" });
      }
      return res.status(403).json({ message: "Invalid token" });
    }
    const fetchedUser = await prisma.user.findUnique({ where: { email: user.email } });
    req.user = { ...user, ...fetchedUser };
    next();
  });
}, "verify");
app.get("/api/posts", verify, async (req, res) => {
  const posts = await prisma.post.findMany({ where: { author: { email: req.user.email } } });
  posts.reverse();
  return res.status(200).json({ message: "Authorized from Posts Route", user: req.user, posts });
});
app.post("/api/posts", verify, async (req, res) => {
  const post = await prisma.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      author: {
        connect: { email: req.user.email }
      }
    }
  });
  return res.status(200).json({ message: "Post Created", post });
});
app.put("/api/posts/:id", verify, async (req, res) => {
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      content: req.body.content
    }
  });
  return res.status(200).json({ message: "Post Updated", post });
});
app.delete("/api/posts/:id", verify, async (req, res) => {
  await prisma.post.delete({ where: { id: req.params.id } });
  return res.status(200).json({ message: "Post Deleted" });
});
app.get("/api/logout", verify, async (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged Out" });
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running: http://localhost:${process.env.PORT}`);
});
export {
  app
};
//# sourceMappingURL=index.js.map