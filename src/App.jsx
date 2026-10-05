import React, { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import Sidebar from './components/Sidebar';
import ParticleCanvas from './components/ParticleCanvas';
import CSGOLootboxModal from './components/CSGOLootboxModal';
import {
  createInitialState,
  getLegalMovesForPlayer,
  executeMove,
  executeNukeAbility,
  executeUFOAbility,
  executeStrikeAbility,
  executeShieldAbility,
  executeBrothelAbility,
  executeQueenLaser,
  executeQueenTeleport,
  executePlaceSpawnedUnit,
  executeExtendBoardAbility,
  addClickerCash,
  buyPawnFromShop,
  checkWinCondition,
  makeAIMove,
} from './logic/checkersEngine';
import { soundEngine } from './utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [isMuted, setIsMuted] = useState(false);
  const [lastEventPos, setLastEventPos] = useState(null);
  const [isLootboxOpen, setIsLootboxOpen] = useState(false);
  const boardRef = useRef(null);

  useEffect(() => {
    if (!state.lastEvent) return;
    const { type, r, c, promoted } = state.lastEvent;

    if (boardRef.current && r !== undefined && c !== undefined) {
      const boardBounds = boardRef.current.getBoundingClientRect();
      const tileWidth = boardBounds.width / state.cols;
      const tileHeight = boardBounds.height / state.rows;
      const eventX = c * tileWidth + tileWidth / 2;
      const eventY = r * tileHeight + tileHeight / 2;

      setLastEventPos({ type, x: eventX, y: eventY });
    }

    if (type === 'nuke') soundEngine.playNuke();
    else if (type === 'ufo') soundEngine.playUFO();
    else if (type === 'strike') soundEngine.playRocket();
    else if (type === 'mine') soundEngine.playMine();
    else if (type === 'shield') soundEngine.playShield();
    else if (type === 'brothel') soundEngine.playBrothel();
    else if (type === 'capture' || type === 'friendly') soundEngine.playCapture();
    else if (type === 'move') soundEngine.playMove();
    else if (type === 'extend') soundEngine.playExtendBoard();

    if (promoted) soundEngine.playKing();

    if (state.screenShake) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, screenShake: false }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.lastEvent]);

  // AI Turn Execution
  useEffect(() => {
    if (state.gameMode === 'ai' && state.turn === 'red' && !state.winner) {
      const aiTimer = setTimeout(() => {
        const newState = makeAIMove(state);
        const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
        setState({ ...newState, winner });
      }, 800);
      return () => clearTimeout(aiTimer);
    }
  }, [state.turn, state.gameMode, state.winner]);

  const handleTileClick = (r, c) => {
    if (state.winner) return;
    if (state.gameMode === 'ai' && state.turn === 'red') return;

    soundEngine.playClick();

    const matchingMove = state.validMoves.find(m => m.toR === r && m.toC === c);
    if (matchingMove) {
      const newState = executeMove(state, matchingMove);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });

      if (winner) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
      return;
    }

    const tile = state.board[r][c];
    if (tile.piece && tile.piece.player === state.turn) {
      const legal = getLegalMovesForPlayer(
        state.board,
        state.turn,
        state.rows,
        state.cols,
        state.comboPiece
      );
      const pieceMoves = legal.moves.filter(m => m.fromR === r && m.fromC === c);

      setState(prev => ({
        ...prev,
        selectedTile: { r, c },
        validMoves: pieceMoves,
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedTile: null,
        validMoves: [],
      }));
    }
  };

  const handleActivateAbility = abilityType => {
    soundEngine.playClick();
    if (state.activeAbility === abilityType) {
      setState(prev => ({ ...prev, activeAbility: null }));
    } else {
      setState(prev => ({
        ...prev,
        activeAbility: abilityType,
        selectedTile: null,
        validMoves: [],
      }));
    }
  };

  const handleAbilityTargetTile = (r, c) => {
    if (!state.activeAbility) return;

    if (state.activeAbility === 'place_unit') {
      const newState = executePlaceSpawnedUnit(state, r, c);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });
    } else if (state.activeAbility === 'nuke') {
      const newState = executeNukeAbility(state, r, c);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });
    } else if (state.activeAbility === 'ufo') {
      const newState = executeUFOAbility(state, r, c);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });
    } else if (state.activeAbility === 'shield') {
      const newState = executeShieldAbility(state, r, c);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });
    } else if (state.activeAbility === 'brothel') {
      const newState = executeBrothelAbility(state, r, c);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });
    }
  };

  const handleStrikeTargetLine = (r, c) => {
    if (state.activeAbility !== 'strike') return;
    const newState = executeStrikeAbility(state, true, r);
    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
  };

  const handleQueenLaser = (r, c) => {
    const newState = executeQueenLaser(state, r, c);
    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
  };

  const handleQueenTeleport = (r, c) => {
    setState(prev => ({
      ...prev,
      activeAbility: 'queen_teleport',
    }));
  };

  const handleExtendBoard = () => {
    soundEngine.playClick();
    const newState = executeExtendBoardAbility(state, 'bottom');
    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
  };

  const handleChaosClick = () => {
    soundEngine.playClick();
    setState(prev => addClickerCash(prev, 1));
  };

  const handleBuyPawn = (type, cost) => {
    soundEngine.playClick();
    setState(prev => buyPawnFromShop(prev, type, cost));
  };

  const handleWinLootReward = rewardItem => {
    setState(prev => ({
      ...prev,
      activeAbility: 'place_unit',
      pendingSpawnUnit: rewardItem,
      combatLog: [
        { id: Date.now(), text: `🎁 WYDROPOWANO ${rewardItem.name}! KLIKNIJ POLE NA PLANSZY, ABY JE POSTAWIĆ!`, type: 'action' },
        ...prev.combatLog,
      ],
    }));
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleGameMode = () => {
    soundEngine.playClick();
    const newMode = state.gameMode === 'pvp' ? 'ai' : 'pvp';
    const reset = createInitialState();
    reset.gameMode = newMode;
    setState(reset);
  };

  const handleResetGame = () => {
    soundEngine.playClick();
    const reset = createInitialState();
    reset.gameMode = state.gameMode;
    setState(reset);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-white flex flex-row items-center justify-between relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950/30 to-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Center/Left MASSIVE Board Container */}
      <div className="flex-1 h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
        <GameBoard
          state={state}
          onTileClick={handleTileClick}
          onAbilityTargetTile={handleAbilityTargetTile}
          onStrikeTargetLine={handleStrikeTargetLine}
          onQueenLaser={handleQueenLaser}
          onQueenTeleport={handleQueenTeleport}
          boardRef={boardRef}
        />
        {boardRef.current && (
          <ParticleCanvas
            lastEvent={lastEventPos}
            width={boardRef.current.offsetWidth}
            height={boardRef.current.offsetHeight}
          />
        )}
      </div>

      {/* Right Side Fullscreen Height Sidebar */}
      <Sidebar
        state={state}
        onActivateAbility={handleActivateAbility}
        onExtendBoard={handleExtendBoard}
        onOpenLootbox={() => setIsLootboxOpen(true)}
        onBuyPawn={handleBuyPawn}
        onChaosClick={handleChaosClick}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        onToggleGameMode={handleToggleGameMode}
        onResetGame={handleResetGame}
      />

      <CSGOLootboxModal
        isOpen={isLootboxOpen}
        onClose={() => setIsLootboxOpen(false)}
        onWinReward={handleWinLootReward}
      />

      {state.winner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-4 border-yellow-400 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_60px_#ffe600] flex flex-col items-center gap-4">
            <Trophy className="w-20 h-20 text-yellow-400 animate-bounce" />
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 uppercase tracking-widest">
              ZWYCIĘSTWO!
            </h2>
            <p className="text-lg font-bold text-slate-200">
              {state.winner === 'blue' ? '🔵 GRACZ NIEBIESKI' : '🔴 GRACZ CZERWONY'} ZMIAŻDŻYŁ PRZECIWNIKA!
            </p>

            <button
              onClick={handleResetGame}
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-black text-slate-950 text-lg hover:brightness-110 shadow-lg transition"
            >
              <RefreshCw className="w-5 h-5" /> ZAGRAJ PONOWNIE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
