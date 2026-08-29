import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetOnNext, setResetOnNext] = useState(false);

  const { vaultPinCode, setUIMode, setShowProUnlock } = useAppStore();

  // Secret Triple Tap - Top to Lock Screen
  let topTapCount = 0;
  let topTapTimeout: any = null;
  const handleTopTap = () => {
    topTapCount++;
    if (topTapCount >= 3) {
      setUIMode('lockscreen');
    }
    clearTimeout(topTapTimeout);
    topTapTimeout = setTimeout(() => { topTapCount = 0; }, 1000);
  };

  const handleNum = (num: string) => {
    if (display === '0' || resetOnNext) {
      setDisplay(num);
      setResetOnNext(false);
    } else {
      if (display.length < 9) {
        setDisplay(display + num);
      }
    }
  };

  const handleOp = (op: string) => {
    setPrevValue(parseFloat(display));
    setOperation(op);
    setResetOnNext(true);
  };

  const handleEquals = () => {
    // Secret trigger: Typing Tier 2 Vault PIN (e.g. 8888) and equals opens Pro Unlock / Vault
    if (display === vaultPinCode) {
      setDisplay('0');
      setUIMode('vault');
      return;
    }
    if (display === '9999') {
      setDisplay('0');
      setUIMode('browser');
      return;
    }

    if (operation && prevValue !== null) {
      const current = parseFloat(display);
      let result = 0;
      switch (operation) {
        case '+': result = prevValue + current; break;
        case '-': result = prevValue - current; break;
        case '×': result = prevValue * current; break;
        case '÷': result = current !== 0 ? prevValue / current : 0; break;
      }
      setDisplay(result.toString().slice(0, 9));
      setPrevValue(null);
      setOperation(null);
      setResetOnNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setResetOnNext(false);
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    setDisplay((val * -1).toString());
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay((val / 100).toString());
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white justify-between pb-8 pt-10 px-6 select-none">
      {/* Hidden secret tap zone */}
      <div 
        className="absolute top-0 left-0 w-full h-16 bg-transparent z-50"
        onClick={handleTopTap}
      />

      {/* Top micro info */}
      <div className="flex justify-between items-center text-xs text-gray-600 px-2">
        <span>Máy tính chuẩn</span>
        <button 
          onClick={() => setUIMode('browser')}
          className="text-gray-500 hover:text-gray-300 text-[11px]"
        >
          Trình duyệt ➔
        </button>
      </div>

      {/* Screen Display */}
      <div className="w-full flex justify-end items-end pb-4 pr-2 overflow-hidden">
        <h1 className="text-6xl font-light tracking-tight font-sans truncate">
          {display}
        </h1>
      </div>

      {/* Keypad Grid (iOS Style) */}
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto w-full">
        {/* Row 1 */}
        <button onClick={handleClear} className="w-16 h-16 rounded-full bg-neutral-400 text-black text-xl font-medium flex items-center justify-center active:bg-neutral-300 transition">
          {display !== '0' ? 'C' : 'AC'}
        </button>
        <button onClick={handleToggleSign} className="w-16 h-16 rounded-full bg-neutral-400 text-black text-xl font-medium flex items-center justify-center active:bg-neutral-300 transition">
          +/-
        </button>
        <button onClick={handlePercent} className="w-16 h-16 rounded-full bg-neutral-400 text-black text-xl font-medium flex items-center justify-center active:bg-neutral-300 transition">
          %
        </button>
        <button onClick={() => handleOp('÷')} className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center transition ${operation === '÷' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'}`}>
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={() => handleNum('7')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          7
        </button>
        <button onClick={() => handleNum('8')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          8
        </button>
        <button onClick={() => handleNum('9')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          9
        </button>
        <button onClick={() => handleOp('×')} className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center transition ${operation === '×' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'}`}>
          ×
        </button>

        {/* Row 3 */}
        <button onClick={() => handleNum('4')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          4
        </button>
        <button onClick={() => handleNum('5')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          5
        </button>
        <button onClick={() => handleNum('6')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          6
        </button>
        <button onClick={() => handleOp('-')} className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center transition ${operation === '-' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'}`}>
          -
        </button>

        {/* Row 4 */}
        <button onClick={() => handleNum('1')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          1
        </button>
        <button onClick={() => handleNum('2')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          2
        </button>
        <button onClick={() => handleNum('3')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          3
        </button>
        <button onClick={() => handleOp('+')} className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center transition ${operation === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'}`}>
          +
        </button>

        {/* Row 5 */}
        <button onClick={() => handleNum('0')} className="col-span-2 w-full h-16 rounded-full bg-neutral-800 text-white text-2xl font-light pl-6 flex items-center justify-start active:bg-neutral-700 transition">
          0
        </button>
        <button onClick={() => handleNum('.')} className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light flex items-center justify-center active:bg-neutral-700 transition">
          .
        </button>
        <button onClick={handleEquals} className="w-16 h-16 rounded-full bg-orange-500 text-white text-2xl font-medium flex items-center justify-center active:bg-orange-400 transition">
          =
        </button>
      </div>
    </div>
  );
};
