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

router.post("/:id/reinforce", async (req, res) => {
  const gameId = req.params.id;
  const territoryId = Number(req.body.territoryId);

  const result = await gameService.reinforcePlayer(gameId, territoryId);
  res.json(result);
});

router.post("/:id/attack", async (req, res) => {
  const gameId = req.params;

  if (req.body.skip) {
    const result = await gameService.skipAttack(gameId);
    return res.json(result);
  }

  const fromId = Number(req.body.fromId);
  const toId = Number(req.body.toId);
  const soldiers = Number(req.body.soldiers);

  const result = await gameService.playerAttack(gameId, fromId, toId, soldiers);
  res.json(result);
});

router.post("/:id/move", async (req, res) => {
  const gameId = req.params.id;
  const fromId = Number(req.body.fromId);
  const toId = Number(req.body.toId);
  const soldiers = Number(req.body.soldiers);

  const result = await gameService.playerMove(gameId, fromId, toId, soldiers);
  res.json(result);
});

router.post("/:id/end-turn", async (req, res) => {
  const gameId = req.params.id;

  const result = await gameService.endTurn(gameId);
  res.json(result);
});
