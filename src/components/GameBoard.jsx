import React, { useState } from 'react';
import { Crown, Biohazard, Bomb, Crosshair, Sparkles, Shield, Home, Zap, Compass, Gift, AlertTriangle } from 'lucide-react';

export default function GameBoard({
  state,
  onTileClick,
  onAbilityTargetTile,
  onStrikeTargetLine,
  onQueenLaser,
  onQueenTeleport,
  onTriggerDoomsday,
  boardRef,
}) {
  const { rows, cols, board, selectedTile, validMoves, activeAbility, pendingSpawnUnit, turn, isWhiteScreenActive, isBoardSplit } = state;
  const [hoveredTile, setHoveredTile] = useState(null);

  const isTileValidMove = (r, c) => {
    return validMoves.some(m => m.toR === r && m.toC === c);
  };

  const isTileInNukeZone = (r, c) => {
    if (activeAbility !== 'nuke' || !hoveredTile) return false;
    return Math.abs(r - hoveredTile.r) <= 1 && Math.abs(c - hoveredTile.c) <= 1;
  };

  const isTileInStrikeLine = (r, c) => {
    if (activeAbility !== 'strike' || !hoveredTile) return false;
    return r === hoveredTile.r || c === hoveredTile.c;
  };

  const selectedPiece = selectedTile ? board[selectedTile.r][selectedTile.c].piece : null;
  const isSelectedQueen = selectedPiece && selectedPiece.isKing && selectedPiece.player === turn;

  return (
    <div className="relative flex items-center justify-center gap-6">
      {/* 🔴 RED DOOMSDAY ATOMIC BUTTON ON THE LEFT OF THE BOARD */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onTriggerDoomsday}
          className="group relative flex flex-col items-center justify-center w-24 h-48 bg-gradient-to-b from-red-600 via-rose-700 to-red-950 border-4 border-yellow-400 rounded-3xl shadow-[0_0_40px_#ff0000] hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer animate-pulse"
        >
          {/* Warning hazard stripes background */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
          
          {/* Pulsing inner button core */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-900 border-4 border-yellow-300 shadow-[0_0_25px_#ff0000] flex items-center justify-center animate-ping">
            <AlertTriangle className="w-8 h-8 text-yellow-300" />
          </div>

          <div className="mt-3 text-center px-1">
            <span className="text-[11px] font-black text-yellow-300 uppercase tracking-widest leading-none block drop-shadow">
              DOOMSDAY
            </span>
            <span className="text-[9px] font-extrabold text-white uppercase block mt-1">
              NIE DOTYKAĆ!
            </span>
          </div>
        </button>
      </div>

      {/* Board & Screamer Container */}
      <div
        ref={boardRef}
        className={`relative select-none transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
          state.screenShake ? 'animate-shake' : ''
        }`}
      >
        {/* Unhinged Queen Power Action Bar */}
        {isSelectedQueen && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-950 via-amber-900 to-yellow-950 border-2 border-yellow-400 rounded-xl shadow-[0_0_25px_#ffe600] animate-bounce z-40">
            <span className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-4 h-4 text-yellow-300" /> MOCE KRÓLOWEJ:
            </span>
            <button
              onClick={() => onQueenLaser(selectedTile.r, selectedTile.c)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg shadow-md transition flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> DIABELSKI LASER ⚡
            </button>
            <button
              onClick={() => onQueenTeleport(selectedTile.r, selectedTile.c)}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black rounded-lg shadow-md transition flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" /> TELEPORTACJA ✨
            </button>
          </div>
        )}

        {/* Unit Placement Notification Banner */}
        {activeAbility === 'place_unit' && pendingSpawnUnit && (
          <div className="px-4 py-2 bg-yellow-950 border-2 border-yellow-400 rounded-xl text-yellow-300 font-black text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce z-40">
            <Gift className="w-4 h-4 text-yellow-300" /> KLIKNIJ WOLNE POLE, ABY POSTAWIĆ {pendingSpawnUnit.name}!
          </div>
        )}

        {/* Shield Target Notification Banner */}
        {activeAbility === 'shield' && (
          <div className="px-4 py-2 bg-cyan-950 border-2 border-cyan-400 rounded-xl text-cyan-300 font-black text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce z-40">
            <Shield className="w-4 h-4 text-cyan-300" /> KLIKNIJ SWOJĄ FIGURĘ, ABY NAKŁAŚĆ TARCZĘ NIEZNISZCZALNOŚCI!
          </div>
        )}

        {/* 👻 WHITE DEMON SCREAMER & WHITE SCREEN OVERLAY */}
        {isWhiteScreenActive && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center animate-pulse rounded-3xl overflow-hidden shadow-[0_0_100px_#ffffff]">
            {/* Terrifying White Demon Screamer Icon */}
            <div className="relative flex flex-col items-center justify-center animate-bounce">
              <span className="text-8xl drop-shadow-[0_0_30px_#ff0000] scale-150">👻</span>
              <div className="text-4xl font-black text-red-600 tracking-widest mt-4 uppercase animate-ping">
                WRAAAAAAAAHHHH!!!!!
              </div>
              <p className="text-sm font-black text-slate-900 mt-2 uppercase tracking-wider">
                BIAŁY DEMON ROZERWAŁ PLANSZĘ W PÓŁ!
              </p>
            </div>
          </div>
        )}

        {/* MASSIVE Checkers Board Container (With crack animation when split!) */}
        <div
          className={`grid gap-1 p-3 bg-slate-900/90 border-4 rounded-3xl backdrop-blur-md transition-all duration-500 relative ${
            isBoardSplit
              ? 'border-red-600 shadow-[0_0_80px_#ff0000] divide-y-4 divide-red-600 rotate-1 scale-95'
              : 'border-cyan-500/40 shadow-[0_0_60px_rgba(0,255,255,0.3)]'
          }`}
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: 'clamp(500px, 86vh, 900px)',
            height: 'clamp(500px, 86vh, 900px)',
          }}
        >
          {/* Jagged red fracture line when board is split in half */}
          {isBoardSplit && (
            <div className="absolute inset-0 border-t-8 border-b-8 border-red-600/80 pointer-events-none z-30 animate-pulse" />
          )}

          {board.map((row, r) =>
            row.map((tile, c) => {
              const isDark = tile.isPlayable;
              const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;
              const isValidMove = isTileValidMove(r, c);
              const inNukeZone = isTileInNukeZone(r, c);
              const inStrikeLine = isTileInStrikeLine(r, c);
              const isHovered = hoveredTile && hoveredTile.r === r && hoveredTile.c === c;

              const isShieldTargetable = activeAbility === 'shield' && tile.piece && tile.piece.player === turn;
              const isPlaceTargetable = activeAbility === 'place_unit' && isDark && !tile.piece;

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseEnter={() => setHoveredTile({ r, c })}
                  onMouseLeave={() => setHoveredTile(null)}
                  onClick={() => {
                    if (activeAbility === 'nuke' || activeAbility === 'ufo' || activeAbility === 'shield' || activeAbility === 'brothel' || activeAbility === 'place_unit') {
                      onAbilityTargetTile(r, c);
                    } else if (activeAbility === 'strike') {
                      onStrikeTargetLine(r, c);
                    } else {
                      onTileClick(r, c);
                    }
                  }}
                  className={`relative flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer overflow-hidden ${
                    !isDark
                      ? 'bg-slate-800/40 border border-slate-700/20'
                      : tile.irradiatedTurns > 0
                      ? 'bg-emerald-950/80 border-2 border-emerald-500 animate-pulse'
                      : tile.isBrothel
                      ? 'bg-pink-950/90 border-2 border-pink-500 shadow-[0_0_20px_#ff007f] animate-pulse'
                      : isShieldTargetable
                      ? 'bg-cyan-950 border-2 border-cyan-400 shadow-[0_0_20px_#00ffff] animate-pulse'
                      : isPlaceTargetable
                      ? 'bg-yellow-950/80 border-2 border-yellow-400 shadow-[0_0_20px_#ffe600] animate-pulse'
                      : isSelected
                      ? 'bg-cyan-950 border-2 border-cyan-400 shadow-[0_0_20px_#00ffff]'
                      : inNukeZone
                      ? 'bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_25px_#ff0055]'
                      : inStrikeLine
                      ? 'bg-amber-950/80 border-2 border-amber-400'
                      : 'bg-slate-950 border border-slate-800/80 hover:border-cyan-400/50 hover:bg-slate-900'
                  }`}
                >
                  {/* Irradiated Overlay */}
                  {tile.irradiatedTurns > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 pointer-events-none">
                      <Biohazard className="w-7 h-7 text-emerald-400 animate-spin text-opacity-80" />
                    </div>
                  )}

                  {/* Brothel Indicator */}
                  {tile.isBrothel && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-500/10 pointer-events-none">
                      <Home className="w-8 h-8 text-pink-400 animate-bounce" />
                      <span className="text-[10px] font-black text-pink-300 uppercase">BURDEL</span>
                    </div>
                  )}

                  {/* Landmine Indicator */}
                  {tile.isMine && (
                    <div className="absolute top-1 left-1 opacity-70 pointer-events-none">
                      <Bomb className="w-4 h-4 text-red-500 animate-bounce" />
                    </div>
                  )}

                  {/* Valid Move Indicator */}
                  {isValidMove && !tile.piece && (
                    <div className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_15px_#00ff66] animate-ping" />
                  )}

                  {/* Nuke Crosshair */}
                  {activeAbility === 'nuke' && isHovered && (
                    <Crosshair className="absolute w-10 h-10 text-rose-500 animate-spin z-20" />
                  )}

                  {/* Placement Dot */}
                  {isPlaceTargetable && (
                    <div className="w-8 h-8 rounded-full border-2 border-yellow-400 bg-yellow-400/30 flex items-center justify-center animate-ping">
                      <span className="text-sm font-bold text-yellow-300">+</span>
                    </div>
                  )}

                  {/* Checker / Chess / Demon Piece Component */}
                  {tile.piece && (
                    <div
                      className={`relative w-[82%] h-[82%] rounded-full flex items-center justify-center transition-transform duration-200 shadow-2xl ${
                        tile.piece.player === 'red'
                          ? 'bg-gradient-to-br from-rose-500 via-red-600 to-red-950 border-2 border-rose-300 shadow-[0_0_20px_rgba(255,0,85,0.7)]'
                          : 'bg-gradient-to-br from-cyan-400 via-sky-600 to-blue-950 border-2 border-cyan-200 shadow-[0_0_20px_rgba(0,255,255,0.7)]'
                      } ${isSelected ? 'scale-110 ring-4 ring-cyan-300' : 'hover:scale-105'}`}
                    >
                      {/* Invincibility Shield Aura */}
                      {tile.piece.isInvincible > 0 && (
                        <div className="absolute -inset-2 rounded-full border-2 border-cyan-300 animate-spin shadow-[0_0_20px_#00ffff] pointer-events-none flex items-center justify-center">
                          <Shield className="w-4 h-4 text-cyan-300 absolute -top-2.5" />
                        </div>
                      )}

                      {/* Distracted Status */}
                      {tile.piece.isDistracted > 0 && (
                        <span className="absolute -top-4 text-base animate-bounce">💕</span>
                      )}

                      {/* Piece Icon Display */}
                      <div className="w-[74%] h-[74%] rounded-full border border-white/30 flex items-center justify-center bg-black/20">
                        {tile.piece.type === 'demon' ? (
                          <span className="text-3xl animate-bounce">👹</span>
                        ) : tile.piece.isKing ? (
                          <Crown className="w-8 h-8 text-yellow-300 drop-shadow-[0_0_10px_#ffe600] animate-pulse" />
                        ) : tile.piece.type === 'knight' ? (
                          <span className="text-2xl font-bold text-yellow-300">♘</span>
                        ) : tile.piece.type === 'rook' ? (
                          <span className="text-2xl font-bold text-purple-300">♜</span>
                        ) : tile.piece.type === 'bishop' ? (
                          <span className="text-2xl font-bold text-emerald-300">♗</span>
                        ) : tile.piece.type === 'queen' ? (
                          <span className="text-2xl font-bold text-amber-300">♕</span>
                        ) : tile.piece.type === 'golden_pawn' ? (
                          <span className="text-2xl font-bold text-amber-300">♟️</span>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-white/50" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
