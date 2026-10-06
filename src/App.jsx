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
  executeDoomsdayWhiteDemon,
  addClickerCash,
  buyPawnFromShop,
  checkWinCondition,
  makeAIMove,
} from './logic/checkersEngine';
import { soundEngine } from './utils/audio';
import { peerService } from './utils/peerService';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(createInitialState());
  const [isMuted, setIsMuted] = useState(false);
  const [lastEventPos, setLastEventPos] = useState(null);
  const [isLootboxOpen, setIsLootboxOpen] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState(null);
  const [peerStatus, setPeerStatus] = useState('');
  const boardRef = useRef(null);

  // Trigger sound & particle FX on lastEvent
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

    if (type === 'demon_doomsday') {
      soundEngine.playDemonRoar();
      // Remove white screen flash overlay after 2.5 seconds
      const whiteTimer = setTimeout(() => {
        setState(prev => ({ ...prev, isWhiteScreenActive: false }));
      }, 2500);
      return () => clearTimeout(whiteTimer);
    } else if (type === 'nuke') soundEngine.playNuke();
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
      }, 600);
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

  // Broadcast state changes in online mode
  const syncStateOnline = newState => {
    if (state.gameMode === 'online') {
      peerService.sendData({ type: 'STATE_UPDATE', payload: newState });
    }
  };

  // RED DOOMSDAY BUTTON TRIGGER
  const handleTriggerDoomsday = () => {
    soundEngine.playClick();
    const newState = executeDoomsdayWhiteDemon(state);
    setState(newState);
    syncStateOnline(newState);
  };

  // Tile Clicks
  const handleTileClick = (r, c) => {
    if (state.winner) return;

    // Check online turn enforcement
    if (state.gameMode === 'online' && state.onlineRole && state.turn !== state.onlineRole) {
      return;
    }
    if (state.gameMode === 'ai' && state.turn === 'red') return;

    soundEngine.playClick();

    const matchingMove = state.validMoves.find(m => m.toR === r && m.toC === c);
    if (matchingMove) {
      const newState = executeMove(state, matchingMove);
      const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
      setState({ ...newState, winner });
      syncStateOnline({ ...newState, winner });

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
    if (state.gameMode === 'online' && state.onlineRole && state.turn !== state.onlineRole) return;

    let newState = state;
    if (state.activeAbility === 'place_unit') {
      newState = executePlaceSpawnedUnit(state, r, c);
    } else if (state.activeAbility === 'nuke') {
      newState = executeNukeAbility(state, r, c);
    } else if (state.activeAbility === 'ufo') {
      newState = executeUFOAbility(state, r, c);
    } else if (state.activeAbility === 'shield') {
      newState = executeShieldAbility(state, r, c);
    } else if (state.activeAbility === 'brothel') {
      newState = executeBrothelAbility(state, r, c);
    }

    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
    syncStateOnline({ ...newState, winner });
  };

  const handleStrikeTargetLine = (r, c) => {
    if (state.activeAbility !== 'strike') return;
    if (state.gameMode === 'online' && state.onlineRole && state.turn !== state.onlineRole) return;

    const newState = executeStrikeAbility(state, true, r);
    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
    syncStateOnline({ ...newState, winner });
  };

  const handleQueenLaser = (r, c) => {
    if (state.gameMode === 'online' && state.onlineRole && state.turn !== state.onlineRole) return;

    const newState = executeQueenLaser(state, r, c);
    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
    syncStateOnline({ ...newState, winner });
  };

  const handleQueenTeleport = (r, c) => {
    setState(prev => ({
      ...prev,
      activeAbility: 'queen_teleport',
    }));
  };

  const handleExtendBoard = () => {
    soundEngine.playClick();
    if (state.gameMode === 'online' && state.onlineRole && state.turn !== state.onlineRole) return;

    const newState = executeExtendBoardAbility(state, 'bottom');
    const winner = checkWinCondition(newState.board, newState.rows, newState.cols, newState.scores);
    setState({ ...newState, winner });
    syncStateOnline({ ...newState, winner });
  };

  const handleChaosClick = () => {
    soundEngine.playClick();
    const newState = addClickerCash(state, 1);
    setState(newState);
    syncStateOnline(newState);
  };

  const handleBuyPawn = (type, cost) => {
    soundEngine.playClick();
    if (state.gameMode === 'online' && state.onlineRole && state.turn !== state.onlineRole) return;

    const newState = buyPawnFromShop(state, type, cost);
    setState(newState);
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

  // ONLINE WEBRTC MULTIPLAYER
  const handleCreateOnlineRoom = () => {
    soundEngine.playClick();
    setPeerStatus('TWORZENIE POKOJU...');
    const roomId = peerService.createRoom(
      info => {
        setOnlineRoomCode(info.roomId);
        if (info.isGuestConnected) {
          setPeerStatus('🔴 GRACZ 2 DOŁĄCZYŁ!');
        } else {
          setPeerStatus('🟡 OCZEKIWANIE NA GRACZA 2...');
        }
        setState(prev => ({
          ...prev,
          gameMode: 'online',
          onlineRole: 'blue', // Host is Blue
          roomId: info.roomId,
        }));
      },
      data => {
        if (data.type === 'STATE_UPDATE') {
          setState(prev => ({ ...data.payload, gameMode: 'online', onlineRole: 'blue' }));
        }
      },
      err => setPeerStatus('❌ BŁĄD PEER')
    );
  };

  const handleJoinOnlineRoom = code => {
    soundEngine.playClick();
    setPeerStatus('ŁĄCZENIE...');
    peerService.joinRoom(
      code,
      info => {
        setOnlineRoomCode(info.roomId);
        setPeerStatus('🟢 POŁĄCZONO Z HOSTEM!');
        setState(prev => ({
          ...prev,
          gameMode: 'online',
          onlineRole: 'red', // Guest is Red
          roomId: info.roomId,
        }));
      },
      data => {
        if (data.type === 'STATE_UPDATE') {
          setState(prev => ({ ...data.payload, gameMode: 'online', onlineRole: 'red' }));
        }
      },
      err => setPeerStatus('❌ NIE ZNALEZIONO POKOJU')
    );
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleGameMode = mode => {
    soundEngine.playClick();
    if (state.gameMode === 'online') {
      peerService.disconnect();
      setOnlineRoomCode(null);
      setPeerStatus('');
    }
    const reset = createInitialState();
    reset.gameMode = mode;
    setState(reset);
  };

  const handleResetGame = () => {
    soundEngine.playClick();
    const reset = createInitialState();
    reset.gameMode = state.gameMode;
    reset.onlineRole = state.onlineRole;
    reset.roomId = state.roomId;
    setState(reset);
    syncStateOnline(reset);
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
          onTriggerDoomsday={handleTriggerDoomsday}
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
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
        onlineRoomCode={onlineRoomCode}
        peerStatus={peerStatus}
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
