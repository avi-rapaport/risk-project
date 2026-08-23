import express from "express";
import { gameService } from "../services/game.service.js";
import { gameRepo } from "../repositories/game.repo.js";

export const router = express.Router();

router.post("/", async (req, res) => {
  const playerName = req.body.playerName;

  const game = await gameService.startGame(playerName);
  res.status(201).json(game);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const result = await gameService.getGameById(id);
  res.json(result);
});
