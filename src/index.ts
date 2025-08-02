import express from "express";
import logger from "./utils/logger";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.config";
import connectDB from "./config/connectDB";
import notFound from "./middleware/notFound";
import authRoutes from "./modules/auth/auth.routes";
import { errorMiddleware } from "./middleware/error";
import { prisma } from "./lib/prisma";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());

app.use(cors({ origin: [...env.CORS_ORIGIN.split(",")], credentials: true }));
app.use(cors());

const BASE_URL = env.BASE_URL;
app.get("/", (req, res) => {
  res.send("Smartgate AI Server");
});

app.get(BASE_URL + "/health", (req, res) => {
  res.send("Server is healthy");
});

app.use(BASE_URL + "/auth", authRoutes);

app.use(notFound);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    // await connectDB();
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log("✅ DB connected! User count:", userCount);

    app.listen(env.PORT, () =>
      logger.info(`Server is listening on PORT:${env.PORT}`)
    );
  } catch (error) {
    logger.error(error);
  }
};

startServer();
