import { Chess, Square } from "chess.js";
import { findOpening } from "@chess-openings/eco.json";

import { EvaluatedPosition } from "../types/Position";
import Report from "../types/Report";

import {
  Classification,
  classificationValues,
  computeWPL,
  isMiss,
  wplClassify,
} from "./classification";
import {
  InfluencingPiece,
  getAttackers,
  isPieceHanging,
  pieceValues,
  promotions,
} from "./board";

export async function analyse(positions: EvaluatedPosition[]): Promise<Report> {
  const openingsDB = await getOpeningsDB();

  let lastWPL: number | undefined;
  let positionIndex = 0;
  for (let position of positions.slice(1)) {
    positionIndex++;

    let board = new Chess(position.fen);
    let lastPosition = positions[positionIndex - 1];

    let topMove = lastPosition.topLines.find((line) => line.id == 1);
    let secondTopMove = lastPosition.topLines.find((line) => line.id == 2);
    if (!topMove) continue;

    let previousEvaluation = topMove.evaluation;
    let evaluation = position.topLines.find((line) => line.id == 1)?.evaluation;
    if (!previousEvaluation) continue;

    let moveColour = (position.fen.includes(" b ") ? "white" : "black") as "white" | "black";

    if (!evaluation) {
      evaluation = { type: board.isCheckmate() ? "mate" : "cp", value: 0 };
      position.topLines.push({
        id: 1,
        depth: 0,
        evaluation: evaluation,
        moveUCI: "",
      });
    }

    let absoluteEvaluation =
      evaluation.value * (moveColour == "white" ? 1 : -1);
    let previousAbsoluteEvaluation =
      previousEvaluation.value * (moveColour == "white" ? 1 : -1);
    let absoluteSecondEvaluation =
      (secondTopMove?.evaluation.value ?? 0) * (moveColour == "white" ? 1 : -1);

    let wpl = computeWPL(
      previousEvaluation.value, previousEvaluation.type == "mate",
      evaluation.value, evaluation.type == "mate",
      moveColour,
    );

    if (!secondTopMove) {
      const legalMoves = board.moves();
      if (legalMoves.length <= 1) {
        position.classification = Classification.FORCED;
        continue;
      }
      secondTopMove = {
        id: 2,
        depth: topMove.depth,
        evaluation: { ...topMove.evaluation },
        moveUCI: topMove.moveUCI,
        moveSAN: topMove.moveSAN,
      };
    }

    let noMate = previousEvaluation.type == "cp" && evaluation.type == "cp";

    if (topMove.moveUCI == position.move.uci) {
      position.classification = Classification.BEST;
    } else {
      if (noMate) {
        position.classification = wplClassify(wpl);
      } else if (previousEvaluation.type == "cp" && evaluation.type == "mate") {
        if (absoluteEvaluation > 0) {
          position.classification = Classification.BEST;
        } else if (absoluteEvaluation >= -2) {
          position.classification = Classification.BLUNDER;
        } else if (absoluteEvaluation >= -5) {
          position.classification = Classification.MISTAKE;
        } else {
          position.classification = Classification.INACCURACY;
        }
      } else if (previousEvaluation.type == "mate" && evaluation.type == "cp") {
        if (previousAbsoluteEvaluation < 0 && absoluteEvaluation < 0) {
          position.classification = Classification.BEST;
        } else if (absoluteEvaluation >= 400) {
          position.classification = Classification.GOOD;
        } else if (absoluteEvaluation >= 150) {
          position.classification = Classification.INACCURACY;
        } else if (absoluteEvaluation >= -100) {
          position.classification = Classification.MISTAKE;
        } else {
          position.classification = Classification.BLUNDER;
        }
      } else if (
        previousEvaluation.type == "mate" &&
        evaluation.type == "mate"
      ) {
        if (previousAbsoluteEvaluation > 0) {
          if (absoluteEvaluation <= -4) {
            position.classification = Classification.MISTAKE;
          } else if (absoluteEvaluation < 0) {
            position.classification = Classification.BLUNDER;
          } else if (absoluteEvaluation < previousAbsoluteEvaluation) {
            position.classification = Classification.BEST;
          } else if (absoluteEvaluation <= previousAbsoluteEvaluation + 2) {
            position.classification = Classification.EXCELLENT;
          } else {
            position.classification = Classification.GOOD;
          }
        } else {
          if (absoluteEvaluation == previousAbsoluteEvaluation) {
            position.classification = Classification.BEST;
          } else {
            position.classification = Classification.GOOD;
          }
        }
      }
    }

    if (position.classification !== Classification.BEST) {
      if (isMiss(lastWPL, wpl)) {
        position.classification = Classification.MISS;
      }
    }
    lastWPL = wpl;

    if (position.classification == Classification.BEST) {
      let winningAnyways =
        (absoluteSecondEvaluation >= 700 && topMove.evaluation.type == "cp") ||
        (topMove.evaluation.type == "mate" &&
          secondTopMove.evaluation.type == "mate");

      if (
        absoluteEvaluation >= 0 &&
        !winningAnyways &&
        !position.move.san.includes("=")
      ) {
        let lastBoard = new Chess(lastPosition.fen);
        let currentBoard = new Chess(position.fen);
        if (lastBoard.isCheck()) continue;

        let lastPiece = lastBoard.get(
          position.move.uci.slice(2, 4) as Square,
        ) || { type: "m" };

        let sacrificedPieces: InfluencingPiece[] = [];
        for (let row of currentBoard.board()) {
          for (let piece of row) {
            if (!piece) continue;
            if (piece.color != moveColour.charAt(0)) continue;
            if (piece.type == "k" || piece.type == "p") continue;

            if (pieceValues[lastPiece.type] >= pieceValues[piece.type]) {
              continue;
            }

            if (isPieceHanging(lastPosition.fen, position.fen, piece.square)) {
              position.classification = Classification.BRILLIANT;
              sacrificedPieces.push(piece);
            }
          }
        }

        let anyPieceViablyCapturable = false;
        let captureTestBoard = new Chess(position.fen);

        for (let piece of sacrificedPieces) {
          let attackers = getAttackers(position.fen, piece.square);

          for (let attacker of attackers) {
            for (let promotion of promotions) {
              try {
                captureTestBoard.move({
                  from: attacker.square,
                  to: piece.square,
                  promotion: promotion,
                });

                let attackerPinned = false;
                for (let row of captureTestBoard.board()) {
                  for (let enemyPiece of row) {
                    if (!enemyPiece) continue;
                    if (enemyPiece.color == captureTestBoard.turn()) continue;
                    if (enemyPiece.type == "k" || enemyPiece.type == "p")
                      continue;

                    if (
                      isPieceHanging(
                        position.fen,
                        captureTestBoard.fen(),
                        enemyPiece.square,
                      ) &&
                      pieceValues[enemyPiece.type] >=
                        Math.max(
                          ...sacrificedPieces.map(
                            (sack) => pieceValues[sack.type],
                          ),
                        )
                    ) {
                      attackerPinned = true;
                      break;
                    }
                  }
                  if (attackerPinned) break;
                }

                if (pieceValues[piece.type] >= 5) {
                  if (!attackerPinned) {
                    anyPieceViablyCapturable = true;
                    break;
                  }
                } else if (
                  !attackerPinned &&
                  !captureTestBoard.moves().some((move) => move.endsWith("#"))
                ) {
                  anyPieceViablyCapturable = true;
                  break;
                }

                captureTestBoard.undo();
              } catch {}
            }

            if (anyPieceViablyCapturable) break;
          }

          if (anyPieceViablyCapturable) break;
        }

        if (!anyPieceViablyCapturable) {
          position.classification = Classification.BEST;
        }
      }

      try {
        if (
          noMate &&
          position.classification != Classification.BRILLIANT &&
          lastPosition.classification == Classification.BLUNDER &&
          Math.abs(topMove.evaluation.value - secondTopMove.evaluation.value) >=
            150 &&
          !isPieceHanging(
            lastPosition.fen,
            position.fen,
            position.move.uci.slice(2, 4) as Square,
          )
        ) {
          position.classification = Classification.GREAT;
        }
      } catch {}
    }

    if (
      position.classification == Classification.BLUNDER &&
      absoluteEvaluation >= 600
    ) {
      position.classification = Classification.GOOD;
    }

    if (
      position.classification == Classification.BLUNDER &&
      previousAbsoluteEvaluation <= -600 &&
      previousEvaluation.type == "cp" &&
      evaluation.type == "cp"
    ) {
      position.classification = Classification.GOOD;
    }

    position.classification ??= Classification.BOOK;
  }

  const maxOpeningHalfMoves = 20;
  for (let i = 0; i < Math.min(positions.length, maxOpeningHalfMoves); i++) {
    const position = positions[i];
    if (openingsDB) {
      const opening = findOpening(openingsDB, position.fen);
      position.opening = opening?.name;
    }
  }

  let positiveClassifs = Object.keys(classificationValues).slice(4, 8);
  for (let i = 0; i < positions.length - 1; i++) {
    const position = positions[i + 1];
    if (i >= maxOpeningHalfMoves) break;
    if (
      (position.worker == "cloud" &&
        positiveClassifs.includes(position.classification!)) ||
      position.opening
    ) {
      position.classification = Classification.BOOK;
    } else {
      break;
    }
  }

  for (let position of positions) {
    for (let line of position.topLines) {
      if (line.evaluation.type == "mate" && line.evaluation.value == 0)
        continue;

      let board = new Chess(position.fen);

      try {
        line.moveSAN = board.move({
          from: line.moveUCI.slice(0, 2),
          to: line.moveUCI.slice(2, 4),
          promotion: line.moveUCI.slice(4) || undefined,
        }).san;
      } catch {
        line.moveSAN = "";
      }
    }
  }

  let accuracies = {
    white: { current: 0, maximum: 0 },
    black: { current: 0, maximum: 0 },
  };
  const classifications = {
    white: {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      book: 0,
      forced: 0,
      miss: 0,
      critical: 0,
      theory: 0,
      risky: 0,
    },
    black: {
      brilliant: 0,
      great: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      book: 0,
      forced: 0,
      miss: 0,
      critical: 0,
      theory: 0,
      risky: 0,
    },
  };

  for (let position of positions.slice(1)) {
    const moveColour = position.fen.includes(" b ") ? "white" : "black";

    const cls = position.classification!;
    accuracies[moveColour].current +=
      classificationValues[cls as keyof typeof classificationValues];
    accuracies[moveColour].maximum++;

    classifications[moveColour][cls as keyof typeof classifications.white] += 1;
  }

  return {
    accuracies: {
      white: (accuracies.white.current / accuracies.white.maximum) * 100,
      black: (accuracies.black.current / accuracies.black.maximum) * 100,
    },
    classifications,
    positions: positions,
  };
}

let openingsDBPromise: Promise<any> | null = null;

function getOpeningsDB() {
  if (!openingsDBPromise) {
    openingsDBPromise = import("@chess-openings/eco.json").then((mod) =>
      mod.openingBook(),
    );
  }
  return openingsDBPromise;
}
