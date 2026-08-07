'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { type PieceSymbol } from 'chess.js';
import { fenStringToPositionObject } from 'react-chessboard';
import type { PieceDropHandlerArgs, PieceHandlerArgs, SquareHandlerArgs } from 'react-chessboard';

import { useChessGame } from './useChessGame';
import { MoveHandler } from '@/lib/chess/MoveHandler';
import { useBoardStyles } from './useBoardStyles';
import { useEvaluation } from './useEvaluation';
import { useEngine } from './useEngine';
import { useBookMoves } from './useBookMoves';
import type { HintData } from '@/lib/chess/MoveEngine';
import type { BookMove } from './useBookMoves';
import { playSoundForMove } from '@/lib/chess/sounds';

export interface ChessBoardConfig {
  enablePremove?: boolean;
  autoPromoteToQueen?: boolean;
  isOverdefended?: boolean;
  isUnderdefended?: boolean;
  showCheckHighlights?: boolean;
  elo?: number;
  playerColor?: 'w' | 'b';
}

export interface ChessBoardReturn {
  chessGame: ReturnType<typeof useChessGame>['chessGame'];
  position: string;
  moveFrom: string;
  optionSquares: Record<string, React.CSSProperties>;
  promotionMove: { sourceSquare: string; targetSquare: string } | null;
  premoves: PieceDropHandlerArgs[];
  showAnimations: boolean;
  currentPosition: Record<string, { pieceType: string }>;
  evaluation: number;
  rawScore: number;
  mateIn: number | null;
  diff: number | null;
  hintData: HintData | null;
  elo: number;
  isThinking: boolean;
  openingName: string | null;
  bookMoves: BookMove[];
  squareStyles: Record<string, React.CSSProperties>;
  arrows: { startSquare: string; endSquare: string; color: string }[];
  getGameState: () => { fen: string; isGameOver: boolean; turn: 'w' | 'b'; moves: any[] };
  makeMove: (from: string, to: string, promotion?: PieceSymbol) => boolean;
  setPosition: (fen: string) => void;
  undo: (count?: number) => void;
  loadFen: (fen: string) => boolean;
  clearAnalysis: () => void;
  resetMoveState: (clearPremoves?: boolean) => void;
  setPromotionMove: (pm: { sourceSquare: string; targetSquare: string } | null) => void;
  setOptionSquares: (sq: Record<string, React.CSSProperties>) => void;
  setMoveFrom: (sq: string) => void;
  handleEloChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  makeEngineMove: () => Promise<void>;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onSquareClick: (args: SquareHandlerArgs) => void;
  onSquareRightClick: () => void;
  canDragPiece: (args: PieceHandlerArgs) => boolean;
  onPromotionSelect: (piece: PieceSymbol) => void;
  handleUndo: () => void;
  registerMoveForAnalysis: (fen: string, evalBeforeMove: number, side: 'w' | 'b') => void;
  terminate: () => void;
  getPositionEval: (fen: string) => { evaluation: { type: 'cp' | 'mate'; value: number }; bestmove: string; bestmoveSan: string } | undefined;
  clearGameData: () => void;
}

export function useChessBoard(config: ChessBoardConfig = {}): ChessBoardReturn {
  const {
    enablePremove = true,
    autoPromoteToQueen = false,
    isOverdefended = false,
    isUnderdefended = false,
    showCheckHighlights = false,
    elo: initialElo,
    playerColor = 'w',
  } = config;

  const game = useChessGame();
  const { currentEval, rawScore, mateIn, diff, hintData, registerMoveForAnalysis, clearAnalysis, getPositionEval, clearPositionHistory } = useEvaluation(
    game.chessGame,
    game.position,
  );
  const { elo, isThinking, handleEloChange, makeEngineMove: rawEngineMove, terminate: terminateEngine } = useEngine(game, initialElo);
  const { openingName, bookMoves } = useBookMoves(game.position);

  const moveHandlerRef = useRef(new MoveHandler(game.chessGame));
  useEffect(() => {
    moveHandlerRef.current = new MoveHandler(game.chessGame);
  }, [game.chessGame]);

  const visualStyles = useBoardStyles({
    chessGame: game.chessGame,
    isOverdefended,
    isUnderdefended,
    showCheckHighlights,
    optionSquares: game.optionSquares,
  });

  const currentPosition = fenStringToPositionObject(game.position, 8, 8);

  const finalSquareStyles: Record<string, React.CSSProperties> = { ...visualStyles.styles };
  game.premoves.forEach((p) => {
    delete currentPosition[p.sourceSquare];
    currentPosition[p.targetSquare!] = { pieceType: p.piece.pieceType };
    finalSquareStyles[p.sourceSquare] = { backgroundColor: 'rgba(255,0,0,0.2)' };
    finalSquareStyles[p.targetSquare!] = { backgroundColor: 'rgba(255,0,0,0.2)' };
  });

  const onPieceDropRef = useRef<(args: PieceDropHandlerArgs) => boolean>(() => false);

  const _onPieceDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare, piece } = args;
      if (!targetSquare || sourceSquare === targetSquare) return false;
      if (piece.pieceType[0] !== playerColor) return false;

      const oldEval = rawScore;

      if (moveHandlerRef.current.isPromotionMove(sourceSquare, targetSquare)) {
        if (!autoPromoteToQueen) {
          game.setPromotionMove({ sourceSquare, targetSquare });
          return true;
        }
      }

      const pieceColor = piece.pieceType[0];
      if (game.chessGame.turn() !== pieceColor) {
        if (!enablePremove) return false;

        const type = piece.pieceType[1].toLowerCase();
        const color = piece.pieceType[0];
        const allowedMoves = moveHandlerRef.current.getTheoreticalMoves(sourceSquare, type, color);
        if (!allowedMoves.includes(targetSquare)) return false;

        game.premovesRef.current.push({ sourceSquare, targetSquare, piece });
        game.setPremoves([...game.premovesRef.current]);
        return true;
      }

      if (moveHandlerRef.current.executeMove(sourceSquare, targetSquare, 'q')) {
        playSoundForMove(game.chessGame);
        const newFen = game.chessGame.fen();
        game.setPosition(newFen);
        registerMoveForAnalysis(newFen, oldEval, playerColor);
        game.resetMoveState();
        setTimeout(() => rawEngineMove(onPieceDropRef.current), 350);
        return true;
      }

      return false;
    },
    [autoPromoteToQueen, enablePremove, game, rawScore, registerMoveForAnalysis, rawEngineMove],
  );

  useEffect(() => {
    onPieceDropRef.current = _onPieceDrop;
  }, [_onPieceDrop]);

  const onPromotionSelect = useCallback(
    (piece: PieceSymbol) => {
      if (!game.promotionMove) return;

      const oldEval = rawScore;
      moveHandlerRef.current.executeMove(game.promotionMove.sourceSquare, game.promotionMove.targetSquare, piece);
      playSoundForMove(game.chessGame);
      const newFen = game.chessGame.fen();
      game.setPosition(newFen);

      registerMoveForAnalysis(newFen, oldEval, playerColor);
      game.setPromotionMove(null);
      game.resetMoveState();
      setTimeout(() => rawEngineMove(onPieceDropRef.current), 250);
    },
    [game, rawScore, registerMoveForAnalysis, rawEngineMove],
  );

  const onSquareClick = useCallback(
    (args: SquareHandlerArgs) => {
      const { square, piece } = args;
      if (game.promotionMove) return;

      const isOurTurn = game.chessGame.turn() === playerColor;
      const isOurPiece = piece && piece.pieceType[0] === playerColor;

      if (!game.moveFrom && isOurPiece) {
        if (isOurTurn) {
          game.setOptionSquares(moveHandlerRef.current.getAvailableMovesSquares(square));
        } else if (enablePremove) {
          const pieceType = piece.pieceType[1].toLowerCase();
          game.setOptionSquares(moveHandlerRef.current.getPremoveOptionSquares(square, pieceType, playerColor));
        }
        game.setMoveFrom(square);
      } else if (game.moveFrom) {
        let allowedMoves: string[] = [];
        const fromPieceStr = currentPosition[game.moveFrom]?.pieceType;

        if (isOurTurn) {
          allowedMoves = moveHandlerRef.current.getLegalMoves(game.moveFrom).map((m) => m.to);
        } else if (fromPieceStr) {
          const type = fromPieceStr[1].toLowerCase();
          const color = fromPieceStr[0];
          allowedMoves = moveHandlerRef.current.getTheoreticalMoves(game.moveFrom, type, color);
        }

        if (allowedMoves.includes(square) && fromPieceStr) {
          _onPieceDrop({
            sourceSquare: game.moveFrom,
            targetSquare: square,
            piece: { pieceType: fromPieceStr, isSparePiece: false, position: square },
          });
        }
        game.resetMoveState(false);
      }
    },
    [game, enablePremove, currentPosition, _onPieceDrop],
  );

  const onSquareRightClick = useCallback(() => {
    game.resetMoveState(true);
  }, [game]);

  const canDragPiece = useCallback(({ piece }: PieceHandlerArgs) => {
    return piece.pieceType[0] === playerColor;
  }, []);

  const handleUndo = useCallback(() => {
    if (isThinking) return;
    const turn = game.chessGame.turn();
    const count = turn === 'b' ? 1 : 2;
    game.undo(count);
    clearAnalysis();
  }, [game, isThinking, clearAnalysis]);

  const makeEngineMove = useCallback(async () => {
    await rawEngineMove(onPieceDropRef.current);
  }, [rawEngineMove]);

  return {
    chessGame: game.chessGame,
    position: game.position,
    moveFrom: game.moveFrom,
    optionSquares: game.optionSquares,
    promotionMove: game.promotionMove,
    premoves: game.premoves,
    showAnimations: game.showAnimations,
    currentPosition,
    evaluation: currentEval,
    rawScore,
    mateIn,
    diff,
    hintData,
    elo,
    isThinking,
    openingName,
    bookMoves,
    squareStyles: finalSquareStyles,
    arrows: visualStyles.arrows,
    getGameState: game.getGameState,
    setPosition: game.setPosition,
    makeMove: game.makeMove,
    undo: game.undo,
    loadFen: game.loadFen,
    clearAnalysis,
    resetMoveState: game.resetMoveState,
    setPromotionMove: game.setPromotionMove,
    setOptionSquares: game.setOptionSquares,
    setMoveFrom: game.setMoveFrom,
    handleEloChange,
    makeEngineMove,
    onPieceDrop: _onPieceDrop,
    onSquareClick,
    onSquareRightClick,
    canDragPiece,
    onPromotionSelect,
    handleUndo,
    registerMoveForAnalysis,
    terminate: terminateEngine,
    getPositionEval,
    clearGameData: () => {
      clearAnalysis();
      clearPositionHistory();
    },
  };
}
