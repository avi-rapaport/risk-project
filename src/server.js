import express from "express";
import "dotenv/config";
import cors from "cors";
import { router as gameRouter } from "./routes/game.route.js";
import { errorHandler } from "./middleware.js";

const PORT = process.env.PORT || 3000;

const server = express();

server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(process.cwd() + "/public"));

server.use("/games", gameRouter);

server.use((req, res) => {
  res.status(400).json(`${req.url} doesn't have ${req.method} method!`);
});

server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
