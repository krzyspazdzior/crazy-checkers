import React, { useState } from 'react';
import { Crown, Biohazard, Bomb, Crosshair, Sparkles, Shield, Home, Zap, Compass, Gift, AlertTriangle, Lock } from 'lucide-react';

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
  const { rows, cols, board, selectedTile, validMoves, activeAbility, pendingSpawnUnit, turn, isWhiteScreenActive, isBoardSplit, isDoomsdayUsed, gameMode, onlineRole } = state;
  const [hoveredTile, setHoveredTile] = useState(null);

  const isOpponentTurn = gameMode === 'online' && onlineRole && turn !== onlineRole;
  const isFlipped = gameMode === 'online' && onlineRole === 'red';

  const isTileValidMove = (r, c) => validMoves.some(m => m.toR === r && m.toC === c);

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

  // Get piece icon based on type
  const getPieceContent = (piece) => {
    if (piece.type === 'demon') return <span className="text-2xl md:text-3xl animate-bounce drop-shadow-[0_0_8px_#ff0000]">👹</span>;
    if (piece.isKing) return <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-300 drop-shadow-[0_0_10px_#ffe600]" />;
    if (piece.type === 'knight') return <span className="text-xl md:text-2xl font-bold text-yellow-300 drop-shadow-[0_0_6px_#ffe600]">♘</span>;
    if (piece.type === 'rook') return <span className="text-xl md:text-2xl font-bold text-purple-300 drop-shadow-[0_0_6px_#a855f7]">♜</span>;
    if (piece.type === 'bishop') return <span className="text-xl md:text-2xl font-bold text-emerald-300 drop-shadow-[0_0_6px_#34d399]">♗</span>;
    if (piece.type === 'queen') return <span className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-[0_0_6px_#fbbf24]">♕</span>;
    if (piece.type === 'golden_pawn') return <span className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-[0_0_6px_#fbbf24]">♟️</span>;
    return <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/60 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />;
  };

  return (
    <div className="relative flex items-center justify-center gap-5">
      {/* 🔴 DOOMSDAY BUTTON */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onTriggerDoomsday}
          disabled={isDoomsdayUsed || isOpponentTurn}
          className="group relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden"
          style={{
            width: '80px',
            height: '180px',
            background: !isDoomsdayUsed && !isOpponentTurn
              ? 'linear-gradient(180deg, #dc2626, #991b1b, #450a0a)'
              : '#0f172a',
            border: !isDoomsdayUsed && !isOpponentTurn
              ? '3px solid #fbbf24'
              : '2px solid #1e293b',
            boxShadow: !isDoomsdayUsed && !isOpponentTurn
              ? '0 0 40px rgba(220, 38, 38, 0.6), inset 0 0 30px rgba(0,0,0,0.3)'
              : 'none',
            opacity: isDoomsdayUsed || isOpponentTurn ? 0.3 : 1,
            cursor: isDoomsdayUsed || isOpponentTurn ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Hazard stripes */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #000 8px, #000 16px)',
          }} />

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
              background: !isDoomsdayUsed && !isOpponentTurn
                ? 'radial-gradient(circle, #ef4444, #7f1d1d)'
                : '#1e293b',
              border: !isDoomsdayUsed && !isOpponentTurn
                ? '3px solid #fcd34d'
                : '2px solid #334155',
              boxShadow: !isDoomsdayUsed && !isOpponentTurn
                ? '0 0 20px #ef4444, 0 0 40px #ef444460'
                : 'none',
            }}>
              <AlertTriangle className="w-7 h-7" style={{
                color: !isDoomsdayUsed && !isOpponentTurn ? '#fcd34d' : '#475569',
              }} />
            </div>

            <div className="text-center px-1">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none block" style={{
                color: !isDoomsdayUsed ? '#fcd34d' : '#475569',
                textShadow: !isDoomsdayUsed && !isOpponentTurn ? '0 0 10px #fbbf24' : 'none',
              }}>
                DOOMSDAY
              </span>
              <span className="text-[8px] font-extrabold uppercase block mt-1" style={{
                color: !isDoomsdayUsed ? '#ffffff' : '#475569',
              }}>
                {!isDoomsdayUsed ? (isOpponentTurn ? 'LOCKED 🔒' : '1x PER GAME!') : 'UŻYTY (0x)'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Board & Overlays Container */}
      <div
        ref={boardRef}
        className={`relative select-none flex flex-col items-center justify-center gap-2 ${
          state.screenShake ? 'animate-shake' : ''
        }`}
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* Opponent Turn Lock Banner */}
        {isOpponentTurn && (
          <div className="px-5 py-2.5 rounded-xl flex items-center gap-2 z-40" style={{
            background: 'linear-gradient(135deg, #0f172a, #1e0a1b)',
            border: '2px solid #be185d80',
            boxShadow: '0 0 25px rgba(190, 24, 93, 0.3)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="text-rose-300 font-black text-xs uppercase tracking-widest">
              TURA PRZECIWNIKA ({turn === 'blue' ? '🔵 NIEBIESKI' : '🔴 CZERWONY'}) - OCZEKIWANIE...
            </span>
          </div>
        )}

        {/* Queen Power Bar */}
        {isSelectedQueen && !isOpponentTurn && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl z-40" style={{
            background: 'linear-gradient(135deg, #451a03, #78350f, #451a03)',
            border: '2px solid #fbbf24',
            boxShadow: '0 0 25px #fbbf2440',
          }}>
            <Crown className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">MOCE KRÓLOWEJ:</span>
            <button
              onClick={() => onQueenLaser(selectedTile.r, selectedTile.c)}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-black flex items-center gap-1 transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}
            >
              <Zap className="w-3.5 h-3.5" /> LASER ⚡
            </button>
            <button
              onClick={() => onQueenTeleport(selectedTile.r, selectedTile.c)}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-black flex items-center gap-1 transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}
            >
              <Compass className="w-3.5 h-3.5" /> TELEPORT ✨
            </button>
          </div>
        )}

        {/* Placement Banner */}
        {activeAbility === 'place_unit' && pendingSpawnUnit && !isOpponentTurn && (
          <div className="px-4 py-2 rounded-xl flex items-center gap-2 z-40" style={{
            background: '#451a03',
            border: '2px solid #fbbf24',
            color: '#fcd34d',
          }}>
            <Gift className="w-4 h-4" />
            <span className="font-black text-xs uppercase tracking-wider">
              KLIKNIJ WOLNE POLE, ABY POSTAWIĆ {pendingSpawnUnit.name}!
            </span>
          </div>
        )}

        {/* Shield Banner */}
        {activeAbility === 'shield' && !isOpponentTurn && (
          <div className="px-4 py-2 rounded-xl flex items-center gap-2 z-40" style={{
            background: '#083344',
            border: '2px solid #06b6d4',
            color: '#22d3ee',
          }}>
            <Shield className="w-4 h-4" />
            <span className="font-black text-xs uppercase tracking-wider">
              KLIKNIJ SWOJĄ FIGURĘ, ABY NAŁOŻYĆ TARCZĘ!
            </span>
          </div>
        )}

        {/* 👻 WHITE DEMON SCREAMER */}
        {isWhiteScreenActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl overflow-hidden pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.98), rgba(255,200,200,0.95))',
            boxShadow: '0 0 100px #ffffff',
          }}>
            <div className="relative flex flex-col items-center justify-center animate-bounce">
              <span className="text-8xl drop-shadow-[0_0_30px_#ff0000]" style={{ transform: 'scale(1.5)' }}>👻</span>
              <div className="text-4xl font-black text-red-600 tracking-widest mt-4 uppercase animate-ping">
                WRAAAAAAAAHHHH!!!!!
              </div>
              <p className="text-sm font-black text-slate-900 mt-2 uppercase tracking-wider">
                BIAŁY DEMON WSTRZĄSNĄŁ PLANSZĄ!
              </p>
            </div>
          </div>
        )}

        {/* ═══ THE 3D BOARD ═══ */}
        <div
          className="relative"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 40%',
          }}
        >
          <div
            className={`grid relative transition-all duration-500 ${isOpponentTurn ? 'pointer-events-none' : ''}`}
            style={{
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: 'clamp(480px, 82vh, 860px)',
              height: 'clamp(480px, 82vh, 860px)',
              gap: '3px',
              padding: '12px',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
              border: isBoardSplit
                ? '3px solid #ef4444'
                : '2px solid rgba(99, 102, 241, 0.3)',
              boxShadow: isBoardSplit
                ? '0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 30px rgba(239, 68, 68, 0.1)'
                : '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              transform: `rotateX(8deg) ${isFlipped ? 'rotateZ(180deg)' : ''}`,
              transformStyle: 'preserve-3d',
              opacity: isOpponentTurn ? 0.75 : 1,
            }}
          >
            {/* Board split crack overlay */}
            {isBoardSplit && (
              <div className="absolute inset-0 pointer-events-none z-30 animate-pulse" style={{
                borderTop: '4px solid #ef4444',
                borderBottom: '4px solid #ef4444',
                borderRadius: '20px',
              }} />
            )}

            {/* Board wood grain / texture overlay */}
            <div className="absolute inset-0 rounded-[18px] pointer-events-none z-0 opacity-[0.03]" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)',
            }} />

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

                // Tile background
                let tileBg, tileBorder, tileBoxShadow;

                if (!isDark) {
                  tileBg = 'linear-gradient(135deg, #c9b896, #b8a67e)';
                  tileBorder = '1px solid rgba(180, 160, 120, 0.3)';
                  tileBoxShadow = 'inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.1)';
                } else if (tile.irradiatedTurns > 0) {
                  tileBg = 'linear-gradient(135deg, #064e3b, #065f46)';
                  tileBorder = '2px solid #10b981';
                  tileBoxShadow = '0 0 15px rgba(16, 185, 129, 0.4), inset 0 0 10px rgba(16, 185, 129, 0.1)';
                } else if (tile.isBrothel) {
                  tileBg = 'linear-gradient(135deg, #4a0028, #831843)';
                  tileBorder = '2px solid #ec4899';
                  tileBoxShadow = '0 0 15px rgba(236, 72, 153, 0.4)';
                } else if (isShieldTargetable) {
                  tileBg = 'linear-gradient(135deg, #083344, #164e63)';
                  tileBorder = '2px solid #22d3ee';
                  tileBoxShadow = '0 0 15px rgba(34, 211, 238, 0.4)';
                } else if (isPlaceTargetable) {
                  tileBg = 'linear-gradient(135deg, #451a03, #78350f)';
                  tileBorder = '2px solid #fbbf24';
                  tileBoxShadow = '0 0 15px rgba(251, 191, 36, 0.3)';
                } else if (isSelected) {
                  tileBg = 'linear-gradient(135deg, #083344, #0c4a6e)';
                  tileBorder = '2px solid #22d3ee';
                  tileBoxShadow = '0 0 20px rgba(34, 211, 238, 0.5)';
                } else if (inNukeZone) {
                  tileBg = 'linear-gradient(135deg, #4c0519, #881337)';
                  tileBorder = '2px solid #fb7185';
                  tileBoxShadow = '0 0 20px rgba(251, 113, 133, 0.4)';
                } else if (inStrikeLine) {
                  tileBg = 'linear-gradient(135deg, #451a03, #92400e)';
                  tileBorder = '2px solid #f59e0b';
                  tileBoxShadow = '0 0 15px rgba(245, 158, 11, 0.3)';
                } else {
                  tileBg = 'linear-gradient(135deg, #3d2b1a, #5c3d24)';
                  tileBorder = '1px solid rgba(92, 61, 36, 0.4)';
                  tileBoxShadow = 'inset 0 1px 2px rgba(255,255,255,0.03), inset 0 -1px 2px rgba(0,0,0,0.2)';
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseEnter={() => setHoveredTile({ r, c })}
                    onMouseLeave={() => setHoveredTile(null)}
                    onClick={() => {
                      if (isOpponentTurn) return;
                      if (activeAbility === 'nuke' || activeAbility === 'ufo' || activeAbility === 'shield' || activeAbility === 'brothel' || activeAbility === 'place_unit') {
                        onAbilityTargetTile(r, c);
                      } else if (activeAbility === 'strike') {
                        onStrikeTargetLine(r, c);
                      } else {
                        onTileClick(r, c);
                      }
                    }}
                    className={`relative flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-150 ${
                      isDark && !isSelected && !inNukeZone && !inStrikeLine && !tile.irradiatedTurns && !tile.isBrothel && !isShieldTargetable && !isPlaceTargetable
                        ? 'hover:brightness-125'
                        : ''
                    }`}
                    style={{
                      borderRadius: '6px',
                      background: tileBg,
                      border: tileBorder,
                      boxShadow: tileBoxShadow,
                      transformStyle: 'preserve-3d',
                      transform: 'translateZ(2px)',
                    }}
                  >
                    {/* Irradiated overlay */}
                    {tile.irradiatedTurns > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Biohazard className={`w-6 h-6 text-emerald-400 animate-spin opacity-60 ${isFlipped ? 'rotate-180' : ''}`} />
                      </div>
                    )}

                    {/* Brothel indicator */}
                    {tile.isBrothel && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Home className={`w-7 h-7 text-pink-400 animate-bounce ${isFlipped ? 'rotate-180' : ''}`} />
                        <span className={`text-[8px] font-black text-pink-300 uppercase ${isFlipped ? 'rotate-180' : ''}`}>BURDEL</span>
                      </div>
                    )}

                    {/* Landmine */}
                    {tile.isMine && (
                      <div className="absolute top-1 left-1 opacity-60 pointer-events-none">
                        <Bomb className={`w-3.5 h-3.5 text-red-500 animate-bounce ${isFlipped ? 'rotate-180' : ''}`} />
                      </div>
                    )}

                    {/* Valid move dot */}
                    {isValidMove && !tile.piece && (
                      <div className="w-4 h-4 rounded-full animate-pulse" style={{
                        background: 'radial-gradient(circle, #34d399, #059669)',
                        boxShadow: '0 0 12px #34d399, 0 0 24px #34d39940',
                      }} />
                    )}

                    {/* Valid move capture highlight */}
                    {isValidMove && tile.piece && (
                      <div className="absolute inset-0 rounded-md pointer-events-none animate-pulse" style={{
                        border: '3px solid #ef4444',
                        boxShadow: '0 0 10px #ef444460, inset 0 0 10px #ef444420',
                      }} />
                    )}

                    {/* Nuke crosshair */}
                    {activeAbility === 'nuke' && isHovered && (
                      <Crosshair className="absolute w-8 h-8 text-rose-500 animate-spin z-20 drop-shadow-[0_0_8px_#ef4444]" />
                    )}

                    {/* Placement dot */}
                    {isPlaceTargetable && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse" style={{
                        border: '2px solid #fbbf24',
                        background: '#fbbf2420',
                      }}>
                        <span className="text-xs font-bold text-yellow-300">+</span>
                      </div>
                    )}

                    {/* ═══ PIECE ═══ */}
                    {tile.piece && (
                      <div
                        className={`relative flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          width: '80%',
                          height: '80%',
                          borderRadius: '50%',
                          background: tile.piece.player === 'red'
                            ? 'linear-gradient(145deg, #f87171, #dc2626, #7f1d1d)'
                            : 'linear-gradient(145deg, #67e8f9, #0891b2, #164e63)',
                          border: tile.piece.player === 'red'
                            ? '2px solid #fca5a5'
                            : '2px solid #a5f3fc',
                          boxShadow: tile.piece.player === 'red'
                            ? `0 4px 12px rgba(220, 38, 38, 0.5), 0 0 20px rgba(248, 113, 113, 0.3), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.15)${isSelected ? ', 0 0 0 3px #22d3ee' : ''}`
                            : `0 4px 12px rgba(8, 145, 178, 0.5), 0 0 20px rgba(103, 232, 249, 0.3), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.15)${isSelected ? ', 0 0 0 3px #22d3ee' : ''}`,
                          transform: `translateZ(8px) ${isFlipped ? 'rotateZ(180deg)' : ''}`,
                        }}
                      >
                        {/* Shield ring */}
                        {tile.piece.isInvincible > 0 && (
                          <div className="absolute -inset-2 rounded-full animate-spin pointer-events-none" style={{
                            border: '2px solid #22d3ee',
                            boxShadow: '0 0 15px #22d3ee60',
                          }}>
                            <Shield className="w-3.5 h-3.5 text-cyan-300 absolute -top-2" style={{ left: '50%', transform: 'translateX(-50%)' }} />
                          </div>
                        )}

                        {/* Distracted hearts */}
                        {tile.piece.isDistracted > 0 && (
                          <span className="absolute -top-4 text-sm animate-bounce">💕</span>
                        )}

                        {/* Inner circle with piece icon */}
                        <div className="flex items-center justify-center" style={{
                          width: '70%',
                          height: '70%',
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}>
                          {getPieceContent(tile.piece)}
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
    </div>
  );
}
