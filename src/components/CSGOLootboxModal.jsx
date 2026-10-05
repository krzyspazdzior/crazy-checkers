import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

const LOOT_ITEMS = [
  { id: 'demon', name: '👹 DEMON CHAOSU (ULTRA RARE - 5%)', color: 'border-red-500 bg-red-950/90 text-red-400 font-extrabold', icon: '👹', desc: 'Niszczy pół planszy przy przyzwaniu!' },
  { id: 'knight', name: 'SKOCZEK SZACHOWY ♘', color: 'border-yellow-400 bg-yellow-950/80 text-yellow-300', icon: '♘', desc: 'Ruchy w literę L nad przeszkodami!' },
  { id: 'rook', name: 'WIEŻA SZACHOWA ♜', color: 'border-purple-500 bg-purple-950/80 text-purple-300', icon: '♜', desc: 'Lata po pionowych i poziomych prostych!' },
  { id: 'bishop', name: 'GONIEC SZACHOWY ♗', color: 'border-emerald-400 bg-emerald-950/80 text-emerald-300', icon: '♗', desc: 'Snajper po przekątnych!' },
  { id: 'queen', name: 'KRÓLOWA SZACHOWA ♕', color: 'border-amber-400 bg-amber-950/80 text-amber-200', icon: '♕', desc: 'Lata we wszystkich 8 kierunkach!' },
  { id: 'golden_pawn', name: 'ZŁOTY PIONEK ♟️', color: 'border-yellow-300 bg-yellow-900/60 text-yellow-100', icon: '♟️', desc: '+100 $ PKT za bicie!' },
];

export default function CSGOLootboxModal({ isOpen, onClose, onWinReward }) {
  const [spinning, setSpinning] = useState(false);
  const [wonItem, setWonItem] = useState(null);
  const [reelItems, setReelItems] = useState([]);
  const stripRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const items = [];
      for (let i = 0; i < 60; i++) {
        // Ultra rare Demon chance (5% chance only for slot 40)
        const isDemon = i === 40 && Math.random() < 0.05;
        const rand = isDemon
          ? LOOT_ITEMS[0]
          : LOOT_ITEMS[1 + Math.floor(Math.random() * (LOOT_ITEMS.length - 1))];
        items.push({ ...rand, uniqueId: i });
      }
      setReelItems(items);
      setWonItem(null);
      setSpinning(false);
      if (stripRef.current) {
        stripRef.current.style.transition = 'none';
        stripRef.current.style.transform = 'translateX(0px)';
      }
    }
  }, [isOpen]);

  const handleStartSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const winningIndex = 40;
    const winner = reelItems[winningIndex];

    if (stripRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const itemWidth = 144; // 128px item + 16px gap
      // Exact calculation to center winningIndex right under the middle indicator pointer!
      const targetOffset = winningIndex * itemWidth + itemWidth / 2 - containerWidth / 2;

      let currentStep = 0;
      const totalSteps = 40;
      const tickInterval = setInterval(() => {
        currentStep++;
        soundEngine.playCaseTick();
        if (currentStep >= totalSteps) {
          clearInterval(tickInterval);
        }
      }, 90);

      stripRef.current.style.transition = 'transform 3.8s cubic-bezier(0.12, 0.8, 0.2, 1)';
      stripRef.current.style.transform = `translateX(-${targetOffset}px)`;

      setTimeout(() => {
        soundEngine.playLootWin();
        setWonItem(winner);
        setSpinning(false);
      }, 3900);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-yellow-500/80 rounded-3xl max-w-2xl w-full p-6 text-center shadow-[0_0_80px_rgba(255,200,0,0.4)] flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-yellow-400 font-black text-2xl uppercase tracking-widest animate-pulse">
            <Sparkles className="w-7 h-7 text-yellow-300" />
            SKRZYNKA CHAOSU CS:GO
            <Sparkles className="w-7 h-7 text-yellow-300" />
          </div>
          <p className="text-xs text-slate-400 mt-1">LOSUJ FIGURY SZACHOWE (DEMON CHAOSU 5% UNIKAT!)</p>
        </div>

        {/* CSGO Reel Container */}
        <div
          ref={containerRef}
          className="relative w-full h-44 bg-slate-950 border-2 border-yellow-600/50 rounded-2xl overflow-hidden flex items-center shadow-inner"
        >
          {/* Target Pointer Center Marker */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-yellow-400 shadow-[0_0_20px_#ffe600] z-20 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400 z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 z-20 pointer-events-none" />

          {/* Scrolling Strip */}
          <div
            ref={stripRef}
            className="flex items-center gap-4 px-6 absolute left-0"
            style={{ width: `${reelItems.length * 144}px` }}
          >
            {reelItems.map(item => (
              <div
                key={item.uniqueId}
                className={`w-32 h-36 rounded-xl border-2 p-3 flex flex-col items-center justify-between shrink-0 shadow-lg ${item.color}`}
              >
                <span className="text-4xl">{item.icon}</span>
                <div className="text-[11px] font-black uppercase text-center leading-tight">
                  {item.name}
                </div>
                <div className="text-[9px] opacity-80">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {!wonItem ? (
          <button
            onClick={handleStartSpin}
            disabled={spinning}
            className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-xl ${
              spinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-[0_0_25px_#ffe600]'
            }`}
          >
            {spinning ? 'LOSOWANIE W TOKU...' : 'OTWÓRZ SKRZYNKĘ (SPIN!)'}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full animate-fade-in">
            <div className="text-xl font-black text-yellow-300">
              🎉 WYDROPIŁEŚ: {wonItem.name}!
            </div>
            <button
              onClick={() => {
                onWinReward(wonItem);
                onClose();
              }}
              className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-lg uppercase hover:bg-emerald-400 transition shadow-[0_0_20px_#00ff66]"
            >
              ODBIERZ I POSTAW NA PLANSZY!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
