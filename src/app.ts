import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import itemRoutes from "./routes/itemRoutes";
import snapshotRoutes from "./routes/snapshotRoutes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
  res.status(200).json({ message: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/snapshots", snapshotRoutes);

app.use((_, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;