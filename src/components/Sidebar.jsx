import React, { useState } from 'react';
import {
  Radiation,
  Rocket,
  Maximize2,
  Volume2,
  VolumeX,
  Users,
  Bot,
  RotateCcw,
  Zap,
  Flame,
  Sparkles,
  Shield,
  Home,
  Gift,
  ShoppingCart,
  MousePointerClick,
} from 'lucide-react';

export default function Sidebar({
  state,
  onActivateAbility,
  onExtendBoard,
  onOpenLootbox,
  onBuyPawn,
  onChaosClick,
  onToggleMute,
  isMuted,
  onToggleGameMode,
  onResetGame,
}) {
  const { turn, scores, inventory, activeAbility, gameMode, combatLog } = state;
  const currentInventory = inventory[turn] || {};
  const currentScore = scores[turn] || 0;
  const [clickCount, setClickCount] = useState(0);

  const handleMiningClick = () => {
    onChaosClick();
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="w-[380px] shrink-0 h-screen max-h-screen border-l border-slate-800 bg-slate-900/95 flex flex-col justify-between p-4 shadow-2xl backdrop-blur-xl z-30 overflow-y-auto gap-3">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="text-center pb-2 border-b border-slate-800/80">
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-yellow-400 to-cyan-400 animate-pulse uppercase">
            POPIERDOLONE WARCABY
          </h1>
          <p className="text-[11px] font-bold text-cyan-400 tracking-wider flex items-center justify-center gap-1 mt-0.5">
            <Flame className="w-3.5 h-3.5 text-yellow-400 animate-bounce" /> ARSENAŁ CHAOSU <Flame className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
          </p>
        </div>

        {/* Turn & Score Status Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-950/90 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2">
            <div
              className={`w-3.5 h-3.5 rounded-full animate-ping ${
                turn === 'red' ? 'bg-rose-500 shadow-[0_0_10px_#ff0055]' : 'bg-cyan-400 shadow-[0_0_10px_#00ffff]'
              }`}
            />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              TURA: {turn === 'red' ? '🔴 CZERWONY' : '🔵 NIEBIESKI'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 font-black text-base">
            <Zap className="w-4 h-4" />
            <span>{currentScore} $</span>
          </div>
        </div>
      </div>

      {/* 2. Chaos Clicker Button */}
      <button
        onClick={handleMiningClick}
        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl font-black text-white text-xs uppercase tracking-wider flex items-center justify-between hover:brightness-110 shadow-[0_0_20px_rgba(0,255,204,0.3)] transition active:scale-98 border border-cyan-300/40 shrink-0"
      >
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 animate-bounce text-yellow-300" />
          <span>DOKLIKAJ GOTÓWKĘ (+1 $)</span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-black/40 text-xs font-bold text-yellow-300">
          {clickCount}
        </span>
      </button>

      {/* 3. Pawn Shop Section */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-yellow-600/30 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between text-xs font-black text-yellow-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-yellow-400" /> SKLEP PIONKÓW
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Kup i stawiaj</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onBuyPawn('checker', 15)}
            disabled={currentScore < 15}
            className={`py-2 px-1.5 rounded-lg border font-black text-[11px] flex flex-col items-center justify-between gap-1 transition ${
              currentScore >= 15
                ? 'bg-rose-950/80 border-rose-600/60 text-rose-200 hover:bg-rose-900'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span>🔴 PIONEK</span>
            <span className="text-yellow-400">15 $</span>
          </button>

          <button
            onClick={() => onBuyPawn('golden_pawn', 30)}
            disabled={currentScore < 30}
            className={`py-2 px-1.5 rounded-lg border font-black text-[11px] flex flex-col items-center justify-between gap-1 transition ${
              currentScore >= 30
                ? 'bg-amber-950/80 border-amber-600/60 text-amber-200 hover:bg-amber-900'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span>♟️ ZŁOTY</span>
            <span className="text-yellow-400">30 $</span>
          </button>

          <button
            onClick={() => onBuyPawn('knight', 50)}
            disabled={currentScore < 50}
            className={`py-2 px-1.5 rounded-lg border font-black text-[11px] flex flex-col items-center justify-between gap-1 transition ${
              currentScore >= 50
                ? 'bg-purple-950/80 border-purple-600/60 text-purple-200 hover:bg-purple-900'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span>♘ SKOCZEK</span>
            <span className="text-yellow-400">50 $</span>
          </button>
        </div>
      </div>

      {/* 4. CS:GO Case Button */}
      <button
        onClick={onOpenLootbox}
        className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 rounded-xl font-black text-slate-950 text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(255,230,0,0.3)] transition shrink-0 animate-pulse"
      >
        <Gift className="w-4 h-4 text-slate-950" /> SKRZYNKA CS:GO (LOSUJ DROP!)
      </button>

      {/* 5. Arsenal Grid */}
      <div className="flex flex-col gap-2 shrink-0">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-500" /> SUPER MOCE I AKCJE
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {/* Nuke */}
          <button
            onClick={() => onActivateAbility('nuke')}
            disabled={currentInventory.nuke <= 0}
            className={`flex items-center justify-between p-2.5 rounded-lg border font-black text-xs transition ${
              activeAbility === 'nuke'
                ? 'bg-rose-900 border-rose-500 text-white shadow-[0_0_15px_#ff0055]'
                : currentInventory.nuke > 0
                ? 'bg-slate-950/80 border-rose-900/50 text-rose-200 hover:border-rose-500'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Radiation className="w-4 h-4 text-rose-500" /> ATAK ATOM
            </span>
            <span className="px-1.5 py-0.5 bg-rose-950 rounded text-[10px]">{currentInventory.nuke}x</span>
          </button>

          {/* UFO */}
          <button
            onClick={() => onActivateAbility('ufo')}
            disabled={currentInventory.ufo <= 0}
            className={`flex items-center justify-between p-2.5 rounded-lg border font-black text-xs transition ${
              activeAbility === 'ufo'
                ? 'bg-cyan-900 border-cyan-400 text-white shadow-[0_0_15px_#00ffff]'
                : currentInventory.ufo > 0
                ? 'bg-slate-950/80 border-cyan-900/50 text-cyan-200 hover:border-cyan-500'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> UFO
            </span>
            <span className="px-1.5 py-0.5 bg-cyan-950 rounded text-[10px]">{currentInventory.ufo}x</span>
          </button>

          {/* Rocket */}
          <button
            onClick={() => onActivateAbility('strike')}
            disabled={currentInventory.strike <= 0}
            className={`flex items-center justify-between p-2.5 rounded-lg border font-black text-xs transition ${
              activeAbility === 'strike'
                ? 'bg-amber-900 border-amber-400 text-white shadow-[0_0_15px_#ffbb00]'
                : currentInventory.strike > 0
                ? 'bg-slate-950/80 border-amber-900/50 text-amber-200 hover:border-amber-500'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-amber-400" /> NALOT
            </span>
            <span className="px-1.5 py-0.5 bg-amber-950 rounded text-[10px]">{currentInventory.strike}x</span>
          </button>

          {/* Shield */}
          <button
            onClick={() => onActivateAbility('shield')}
            disabled={currentInventory.shield <= 0}
            className={`flex items-center justify-between p-2.5 rounded-lg border font-black text-xs transition ${
              activeAbility === 'shield'
                ? 'bg-cyan-900 border-cyan-400 text-white shadow-[0_0_15px_#00ffff]'
                : currentInventory.shield > 0
                ? 'bg-slate-950/80 border-cyan-900/50 text-cyan-200 hover:border-cyan-500'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-300" /> TARCZA
            </span>
            <span className="px-1.5 py-0.5 bg-cyan-950 rounded text-[10px]">{currentInventory.shield}x</span>
          </button>

          {/* Brothel */}
          <button
            onClick={() => onActivateAbility('brothel')}
            disabled={currentInventory.brothel <= 0}
            className={`flex items-center justify-between p-2.5 rounded-lg border font-black text-xs transition ${
              activeAbility === 'brothel'
                ? 'bg-pink-900 border-pink-400 text-white shadow-[0_0_15px_#ff007f]'
                : currentInventory.brothel > 0
                ? 'bg-slate-950/80 border-pink-900/50 text-pink-200 hover:border-pink-500'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-pink-400" /> BURDEL
            </span>
            <span className="px-1.5 py-0.5 bg-pink-950 rounded text-[10px]">{currentInventory.brothel}x</span>
          </button>

          {/* Extend Board */}
          <button
            onClick={onExtendBoard}
            disabled={currentScore < 100}
            className={`flex items-center justify-between p-2.5 rounded-lg border font-black text-xs transition ${
              currentScore >= 100
                ? 'bg-purple-950/80 border-purple-500/80 text-purple-200 hover:bg-purple-900'
                : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-purple-400" /> POSZERZ
            </span>
            <span className="text-yellow-400 text-[10px]">100 $</span>
          </button>
        </div>
      </div>

      {/* 6. Combat Log */}
      <div className="flex-1 flex flex-col min-h-[100px] p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
          📜 DZIENNIK CHAOSU
        </h3>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-[10px] scrollbar-thin scrollbar-thumb-slate-800">
          {combatLog.map(item => (
            <div
              key={item.id}
              className="p-1.5 rounded border text-[10px] font-medium leading-tight bg-slate-900 border-slate-800 text-slate-300"
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Footer Controls */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 shrink-0">
        <button
          onClick={onToggleGameMode}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
        >
          {gameMode === 'pvp' ? (
            <>
              <Users className="w-4 h-4 text-cyan-400" /> 2 Graczy (2P)
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 text-rose-400" /> vs Chaos AI
            </>
          )}
        </button>

        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onResetGame}
          className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
