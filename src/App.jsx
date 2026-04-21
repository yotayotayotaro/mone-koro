import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  LineChart,
  ChevronRight,
  RotateCcw,
  Calendar,
  PlusCircle,
  Save,
  Settings,
  ChevronLeft,
  AlertCircle,
  Download,
  Upload,
  HelpCircle,
  Info,
} from 'lucide-react';

// --- アスキーアート（重ね合わせ合成用パーツ） ---
const CHAR_AA_EGG = [
  '        ',
  '        ',
  '        ',
  '   ▄▄   ',
  '  ████  ',
  '   ▀▀   ',
  '        ',
  '        ',
];

const AA_BASES = [
  [
    '        ',
    '        ',
    '   ▄▄   ',
    ' ▄████▄ ',
    '████████',
    '▀██████▀',
    '        ',
    '        ',
  ],
  [
    '        ',
    '  ▄▄▄▄  ',
    ' ▄████▄ ',
    '████████',
    '████████',
    ' ▀████▀ ',
    '  ▀▀▀▀  ',
    '        ',
  ],
  [
    '        ',
    ' ▄▄▄▄▄▄ ',
    ' ██████ ',
    ' ██████ ',
    ' ██████ ',
    ' ██████ ',
    ' ▀▀▀▀▀▀ ',
    '        ',
  ],
];

const AA_PARTS = {
  eyes: [
    [
      '        ',
      '        ',
      '        ',
      '  ▀  ▀  ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '  ◎  ◎  ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '  ＞ ＜ ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '  T  T  ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '  ^  ^  ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
  ],
  mouths: [
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '   ▄▄   ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '  ▄▀▀▄  ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '  vvvv  ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '   ω    ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '  ───   ',
      '        ',
      '        ',
      '        ',
    ],
  ],
  decors: [
    [
      '  ▄▄▄▄  ',
      ' █    █ ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '  ▄  ▄  ',
      '  ▀  ▀  ',
    ],
    [
      ' ▄    ▄ ',
      ' █    █ ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '█      █',
      '█      █',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '   ||   ',
      '  =██=  ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '  ◎  ◎  ',
      '  ▀  ▀  ',
    ],
    [
      ' █▀█▀█  ',
      ' ▀████▀ ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
    ],
    [
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '        ',
      '  ~~  ~~',
      '        ',
    ],
  ],
  auras: [
    [
      ' ░░░░░░ ',
      '░      ░',
      '░      ░',
      '░      ░',
      '░      ░',
      '░      ░',
      ' ░░░░░░ ',
      '        ',
    ],
    [
      ' ▒▒▒▒▒▒ ',
      '▒      ▒',
      '▒      ▒',
      '▒      ▒',
      '▒      ▒',
      '▒      ▒',
      ' ▒▒▒▒▒▒ ',
      '        ',
    ],
  ],
};

const overlayAA = (base, part) => {
  if (!part) return base;
  return base.map((line, i) => {
    let newLine = '';
    for (let j = 0; j < 8; j++) {
      const pChar = part[i] ? part[i][j] : ' ';
      newLine += pChar && pChar !== ' ' ? pChar : line[j] || ' ';
    }
    return newLine;
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState('pet');
  const [step, setStep] = useState('home');
  const [showSaveIcon, setShowSaveIcon] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [stepHistory, setStepHistory] = useState([]);

  // 新規追加：結果画面の詳細表示トグル
  const [showResultDetails, setShowResultDetails] = useState(false);

  // --- 状態管理 ---
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('manekoro_settings');
    return saved ? JSON.parse(saved) : { periodType: 'month' };
  });
  const [periods, setPeriods] = useState(() => {
    const saved = localStorage.getItem('manekoro_periods');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedData, setSavedData] = useState(() => {
    const saved = localStorage.getItem('manekoro_savedData');
    return saved ? JSON.parse(saved) : {};
  });
  const [finance, setFinance] = useState(() => {
    const saved = localStorage.getItem('manekoro_finance');
    return saved
      ? JSON.parse(saved)
      : {
          startAssets: null,
          previousAssets: null,
          currentAssets: 0,
          actualBalance: 0,
          senseBalance: 0,
          senseExpenseTotal: 0,
          discrepancy: 0,
          income: 0,
          tolerance: 0,
          isGood: false,
          secProfit: 0,
        };
  });
  const [character, setCharacter] = useState(() => {
    const saved = localStorage.getItem('manekoro_character');
    return saved
      ? JSON.parse(saved)
      : {
          stage: 0,
          level: 1,
          evolutionPoint: 0,
          baseIdx: 0,
          parts: [],
          hasAura: false,
          sizeScale: 1.0,
          lastEvent: null,
          lastEarnedEP: 0,
          lastRate: 0,
        };
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('manekoro_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputs, setInputs] = useState({ banks: [] });
  const [currentBankInput, setCurrentBankInput] = useState('');
  const [analyticsPage, setAnalyticsPage] = useState(0);

  const [boolSelection, setBoolSelection] = useState(true);
  const boolContainerRef = useRef(null);
  const introContainerRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const [initYear, setInitYear] = useState(String(currentYear));
  const [initMonth, setInitMonth] = useState(String(new Date().getMonth() + 1));
  const [initWeek, setInitWeek] = useState('1');

  useEffect(() => {
    localStorage.setItem('manekoro_settings', JSON.stringify(userSettings));
  }, [userSettings]);
  useEffect(() => {
    localStorage.setItem('manekoro_periods', JSON.stringify(periods));
  }, [periods]);
  useEffect(() => {
    localStorage.setItem('manekoro_finance', JSON.stringify(finance));
  }, [finance]);
  useEffect(() => {
    localStorage.setItem('manekoro_character', JSON.stringify(character));
  }, [character]);
  useEffect(() => {
    localStorage.setItem('manekoro_history', JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    localStorage.setItem('manekoro_savedData', JSON.stringify(savedData));
  }, [savedData]);

  useEffect(() => {
    if (['ask_bank', 'ask_securities', 'ask_loan'].includes(step)) {
      setBoolSelection(true);
      setTimeout(() => {
        if (boolContainerRef.current) boolContainerRef.current.focus();
      }, 50);
    }
    if (['intro_start', 'intro_current', 'intro_sense'].includes(step)) {
      setTimeout(() => {
        if (introContainerRef.current) introContainerRef.current.focus();
      }, 50);
    }
  }, [step]);

  useEffect(() => {
    const isRecording =
      currentPeriod &&
      ![
        'home',
        'select_period',
        'result',
        'evolution',
        'settings',
        'help',
      ].includes(step);
    if (isRecording) {
      setSavedData((prev) => ({
        ...prev,
        [currentPeriod.id]: {
          status: 'in_progress',
          step: step,
          inputs: inputs,
        },
      }));
      setShowSaveIcon(true);
      const timer = setTimeout(() => setShowSaveIcon(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, inputs, currentPeriod]);

  const handleResetAll = () => {
    if (
      window.confirm('すべてのセーブデータを消去して最初からやり直しますか？')
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      manekoro_settings: localStorage.getItem('manekoro_settings'),
      manekoro_periods: localStorage.getItem('manekoro_periods'),
      manekoro_savedData: localStorage.getItem('manekoro_savedData'),
      manekoro_finance: localStorage.getItem('manekoro_finance'),
      manekoro_character: localStorage.getItem('manekoro_character'),
      manekoro_history: localStorage.getItem('manekoro_history'),
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dataToExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'manekoro_backup.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.manekoro_settings)
          localStorage.setItem(
            'manekoro_settings',
            importedData.manekoro_settings
          );
        if (importedData.manekoro_periods)
          localStorage.setItem(
            'manekoro_periods',
            importedData.manekoro_periods
          );
        if (importedData.manekoro_savedData)
          localStorage.setItem(
            'manekoro_savedData',
            importedData.manekoro_savedData
          );
        if (importedData.manekoro_finance)
          localStorage.setItem(
            'manekoro_finance',
            importedData.manekoro_finance
          );
        if (importedData.manekoro_character)
          localStorage.setItem(
            'manekoro_character',
            importedData.manekoro_character
          );
        if (importedData.manekoro_history)
          localStorage.setItem(
            'manekoro_history',
            importedData.manekoro_history
          );
        alert('データを復元しました！アプリを再起動します。');
        window.location.reload();
      } catch (error) {
        alert(
          'ファイルの読み込みに失敗しました。正しいバックアップファイルを選択してください。'
        );
      }
    };
    reader.readAsText(file);
  };

  const hideKeyboard = (e) => {
    if (
      e.target.tagName !== 'INPUT' &&
      e.target.tagName !== 'BUTTON' &&
      e.target.tagName !== 'SELECT'
    ) {
      document.activeElement?.blur();
    }
  };

  const handleAddInitPeriod = () => {
    const isMonth = userSettings.periodType === 'month';
    const mm = initMonth.padStart(2, '0');
    const id = isMonth
      ? `${initYear}-${mm}-m`
      : `${initYear}-${mm}-w${initWeek}`;
    const label = isMonth
      ? `${initYear}年 ${initMonth}月分`
      : `${initMonth}月 第${initWeek}週`;
    const days = isMonth
      ? new Date(parseInt(initYear), parseInt(initMonth), 0).getDate()
      : 7;
    if (!periods.some((p) => p.id === id))
      setPeriods([
        { id, label, type: userSettings.periodType, days },
        ...periods,
      ]);
  };

  const handleAddNextPeriod = () => {
    const currentType = userSettings.periodType;
    const filteredPeriods = periods.filter((p) => p.type === currentType);
    if (filteredPeriods.length === 0) return;
    const latestPeriod = [...filteredPeriods].sort((a, b) =>
      b.id.localeCompare(a.id)
    )[0];
    let nextId, nextLabel, nextDays;
    if (currentType === 'month') {
      const match = latestPeriod.id.match(/^(\d{4})-(\d{2})-m$/);
      if (match) {
        let year = parseInt(match[1], 10);
        let month = parseInt(match[2], 10);
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
        const mm = month.toString().padStart(2, '0');
        nextId = `${year}-${mm}-m`;
        nextLabel = `${year}年 ${month}月分`;
        nextDays = new Date(year, month, 0).getDate();
      }
    } else if (currentType === 'week') {
      const match = latestPeriod.id.match(/^(\d{4})-(\d{2})-w(\d)$/);
      if (match) {
        let year = parseInt(match[1], 10);
        let month = parseInt(match[2], 10);
        let week = parseInt(match[3], 10);
        week += 1;
        if (week > 4) {
          week = 1;
          month += 1;
          if (month > 12) {
            month = 1;
            year += 1;
          }
        }
        const mm = month.toString().padStart(2, '0');
        nextId = `${year}-${mm}-w${week}`;
        nextLabel = `${month}月 第${week}週`;
        nextDays = 7;
      }
    }
    if (nextId && !periods.some((p) => p.id === nextId)) {
      setPeriods([
        { id: nextId, label: nextLabel, type: currentType, days: nextDays },
        ...periods,
      ]);
    }
  };

  const handleSelectPeriod = (period) => {
    setCurrentPeriod(period);
    setStepHistory(['select_period']);
    const data = savedData[period.id];
    if (
      data &&
      data.status === 'in_progress' &&
      data.step !== 'settings' &&
      data.step !== 'help'
    ) {
      setInputs(data.inputs || { banks: [] });
      setStep(data.step);
    } else {
      setInputs(data?.inputs || { banks: [] });
      if (finance.previousAssets === null) setStep('intro_start');
      else setStep('intro_current');
    }
  };

  const updateInput = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrevStep = () => {
    if (stepHistory.length > 0) {
      const newHistory = [...stepHistory];
      const prevStep = newHistory.pop();
      if (prevStep === 'bank_input') {
        setInputs((prev) => {
          const newBanks = [...(prev.banks || [])];
          const lastBank = newBanks.pop();
          setCurrentBankInput(lastBank !== undefined ? String(lastBank) : '');
          return { ...prev, banks: newBanks };
        });
      }
      if (step === 'bank_input') setCurrentBankInput('');
      setStepHistory(newHistory);
      setStep(prevStep);
    } else {
      setStep('select_period');
    }
  };

  const handleCancelWizard = () => {
    setStepHistory([]);
    setStep('home');
    setCurrentPeriod(null);
  };

  const handleNextStep = (currentStep, overrideValue = null) => {
    setStepHistory((prev) => [...prev, currentStep]);
    switch (currentStep) {
      case 'intro_start':
        return setStep('initial_assets');
      case 'initial_assets':
        return setStep('initial_loan');
      case 'initial_loan':
        return setStep('intro_current');
      case 'intro_current':
        return setStep('cash');
      case 'cash':
        return setStep('ask_bank');
      case 'ask_bank':
        return overrideValue
          ? setStep('bank_input')
          : setStep('ask_securities');
      case 'bank_input':
        setInputs((prev) => ({
          ...prev,
          banks: [...(prev.banks || []), Number(currentBankInput) || 0],
        }));
        setCurrentBankInput('');
        return setStep('ask_bank');
      case 'ask_securities':
        return overrideValue
          ? setStep('securities_total')
          : setStep('ask_loan');
      case 'securities_total':
        return setStep('securities_profit');
      case 'securities_profit':
        return setStep('ask_loan');
      case 'ask_loan':
        return overrideValue ? setStep('loan') : setStep('intro_sense');
      case 'loan':
        return setStep('intro_sense');
      case 'intro_sense':
        return setStep('income');
      case 'income':
        return setStep('expFood');
      case 'expFood':
        return setStep('expDaily');
      case 'expDaily':
        return setStep('expHobby');
      case 'expHobby':
        return setStep('expFixed');
      case 'expFixed':
        return setStep('expOthers');
      case 'expOthers':
        return calculateResult();
      default:
        return setStep('home');
    }
  };

  const calculateResult = () => {
    const cash = Number(inputs.cash) || 0;
    const banksTotal = (inputs.banks || []).reduce((sum, val) => sum + val, 0);
    const securities = inputs.hasSecurities
      ? Number(inputs.securities_total) || 0
      : 0;
    const secProfit = inputs.hasSecurities
      ? Number(inputs.securities_profit) || 0
      : 0;
    const loan = inputs.hasLoan ? Number(inputs.loan) || 0 : 0;
    const income = Number(inputs.income) || 0;
    const currentPureAssets = cash + banksTotal + securities - loan;
    const assetsWithoutProfit = currentPureAssets - secProfit;
    const isFirstRecord = history.length === 0;
    const startAssets =
      finance.startAssets !== null && !isFirstRecord
        ? finance.startAssets
        : currentPureAssets;
    const prevAssets =
      finance.previousAssets !== null ? finance.previousAssets : startAssets;
    const actualBalance = assetsWithoutProfit - prevAssets;
    const expFood = Number(inputs.expFood) || 0;
    const expDaily = Number(inputs.expDaily) || 0;
    const expHobby = Number(inputs.expHobby) || 0;
    const expFixed = Number(inputs.expFixed) || 0;
    const expOthers = Number(inputs.expOthers) || 0;
    const senseExpenseTotal =
      expFood + expDaily + expHobby + expFixed + expOthers;
    const senseBalance = income - senseExpenseTotal;
    const discrepancy = senseBalance - actualBalance;
    const tolerance = income > 0 ? Math.floor(income * 0.03) : 5000;
    const isGood = Math.abs(discrepancy) <= tolerance;

    setFinance((prev) => ({
      ...prev,
      currentAssets: currentPureAssets,
      actualBalance,
      senseBalance,
      senseExpenseTotal,
      discrepancy,
      income,
      tolerance,
      isGood,
      startAssets,
      previousAssets: prevAssets,
      secProfit,
    }));

    const newRecord = {
      id: currentPeriod.id,
      label: currentPeriod.label,
      type: currentPeriod.type,
      totalAssets: currentPureAssets + loan,
      loan: loan,
      pureAssets: currentPureAssets,
      income: income,
      actualBalance: actualBalance,
      senseBalance: senseBalance,
      discrepancy: discrepancy,
      expTotal: senseExpenseTotal,
      exp: {
        food: expFood,
        daily: expDaily,
        hobby: expHobby,
        fixed: expFixed,
        others: expOthers,
      },
    };

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== currentPeriod.id);
      return [...filtered, newRecord].sort((a, b) => a.id.localeCompare(b.id));
    });
    setSavedData((prev) => ({
      ...prev,
      [currentPeriod.id]: { status: 'completed', step: 'result', inputs },
    }));

    // 新規追加：結果画面を表示する際に、詳細は閉じておく
    setShowResultDetails(false);
    setStep('result');
  };

  const handleEvolution = () => {
    let newChar = { ...character };
    let nextEvent = null;
    const growthAmount = finance.currentAssets - finance.startAssets;
    const newLevel = Math.max(1, 1 + Math.floor(growthAmount / 50000));
    const displayLevel = Math.min(newLevel, 16);

    // 倍率を最大約3倍に戻し、枠に収まらないほどの巨大さを演出
    const newScale = 1.0 + (displayLevel - 1) * 0.133;

    newChar.level = newLevel;
    newChar.sizeScale = newScale;

    if (newChar.stage === 0) {
      newChar.stage = 1;
      newChar.baseIdx = Math.floor(Math.random() * AA_BASES.length);
      newChar.parts = [];
      newChar.hasAura = false;
      newChar.evolutionPoint = 0;
      newChar.lastEarnedEP = 0;
      newChar.lastRate = 0;
      nextEvent = 'hatch';
    } else {
      const rate = Math.abs(finance.discrepancy) / (finance.income || 1);
      let baseEP = 0;
      if (rate <= 0.01) baseEP = 3;
      else if (rate <= 0.03) baseEP = 1;
      const earnedEP = baseEP * newLevel;
      newChar.evolutionPoint = (newChar.evolutionPoint || 0) + earnedEP;
      newChar.lastEarnedEP = earnedEP;
      newChar.lastRate = rate;

      if (rate > 0.03) {
        newChar.hasAura = true;
        nextEvent = 'devolve';
      } else {
        newChar.hasAura = false;
        const EVOLUTION_THRESHOLD = 10;
        let evolvedCount = 0;
        while (newChar.evolutionPoint >= EVOLUTION_THRESHOLD) {
          newChar.evolutionPoint -= EVOLUTION_THRESHOLD;
          evolvedCount++;
          const partTypes = ['eyes', 'mouths', 'decors'];
          const type = partTypes[Math.floor(Math.random() * partTypes.length)];
          const idx = Math.floor(Math.random() * AA_PARTS[type].length);
          if (!newChar.parts) newChar.parts = [];
          newChar.parts.push({ type, idx });
        }
        if (evolvedCount > 0) nextEvent = 'evolve';
        else nextEvent = 'stay';
      }
    }
    newChar.lastEvent = nextEvent;
    setCharacter(newChar);
    setFinance((prev) => ({ ...prev, previousAssets: prev.currentAssets }));
    setStep('evolution');
  };

  const renderAA = (charState) => {
    if (charState.stage === 0) {
      return (
        <div className="flex justify-center items-center h-48 sm:h-64 transition-transform duration-1000">
          <div className="font-mono whitespace-pre leading-none text-stone-800 text-xs text-center flex flex-col items-center">
            {CHAR_AA_EGG.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      );
    }
    let resultAA = [...AA_BASES[charState.baseIdx || 0]];
    (charState.parts || []).forEach((p) => {
      const partAA = AA_PARTS[p.type][p.idx];
      resultAA = overlayAA(resultAA, partAA);
    });
    if (charState.hasAura) {
      const auraAA =
        AA_PARTS.auras[Math.floor(Math.random() * AA_PARTS.auras.length)];
      resultAA = overlayAA(resultAA, auraAA);
    }
    const scaleStyle = {
      transform: `scale(${charState.sizeScale || 1.0})`,
      transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
    return (
      // overflow-hidden にし、はみ出た部分を非表示（クリッピング）にする
      <div className="flex justify-center items-center h-48 sm:h-64 relative overflow-hidden pointer-events-none opacity-90 w-full">
        <div
          style={scaleStyle}
          className="font-mono whitespace-pre leading-none text-stone-800 text-sm sm:text-lg text-center flex flex-col items-center origin-center"
        >
          {resultAA.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderWizardHeader = () => (
    <div className="flex justify-between items-center mb-6 border-b-2 border-transparent shrink-0">
      <button
        onClick={handlePrevStep}
        className="flex items-center gap-1 p-2 text-stone-600 font-bold hover:bg-stone-200 rounded-lg transition-colors"
      >
        <ChevronLeft size={20} /> 戻る
      </button>
      <button
        onClick={handleCancelWizard}
        className="flex items-center gap-1 p-2 text-stone-500 text-sm hover:bg-stone-200 rounded-lg transition-colors"
      >
        中断
      </button>
    </div>
  );

  const renderIntroScreen = ({ title, desc }) => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextStep(step);
      }
    };
    return (
      <div
        className="flex flex-col h-full justify-start pt-6 px-4 animate-fade-in relative pb-10 outline-none"
        onClick={hideKeyboard}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        ref={introContainerRef}
      >
        {renderWizardHeader()}
        <div className="flex flex-col flex-1 justify-center items-center text-center pb-8">
          <h3 className="text-2xl font-black mb-6 text-stone-800 tracking-wider leading-tight">
            {title}
          </h3>
          <div className="bg-white border-2 border-stone-800 p-6 rounded-xl shadow-[4px_4px_0_0_#292524] w-full">
            <p className="text-sm text-stone-700 font-bold whitespace-pre-line leading-loose">
              {desc}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => handleNextStep(step)}
            className="w-full border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-xl flex justify-center items-center gap-2 hover:bg-stone-700 active:translate-y-1 rounded-lg"
          >
            ツギヘ <ChevronRight size={24} />
          </button>
          <p className="text-center text-xs text-stone-500 mt-4 animate-pulse font-bold">
            Enter で次へ
          </p>
        </div>
      </div>
    );
  };

  const renderInputScreen = ({ id, title, desc, type, prefix = '¥' }) => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextStep(step);
      }
    };
    if (type === 'boolean') {
      const handleBoolKeyDown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === '4') {
          e.preventDefault();
          setBoolSelection(true);
        } else if (e.key === 'ArrowRight' || e.key === '6') {
          e.preventDefault();
          setBoolSelection(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          updateInput(id, boolSelection);
          handleNextStep(step, boolSelection);
        }
      };
      return (
        <div
          className="flex flex-col h-full justify-start pt-6 px-4 animate-fade-in relative pb-10 outline-none"
          onClick={hideKeyboard}
          onKeyDown={handleBoolKeyDown}
          tabIndex={-1}
          ref={boolContainerRef}
        >
          {renderWizardHeader()}
          <h3 className="text-xl font-bold mb-2 border-b-2 border-stone-800 pb-2 inline-block self-start shrink-0">
            {title}
          </h3>
          {desc && (
            <p className="text-sm text-stone-600 mb-6 font-mono shrink-0 whitespace-pre-line leading-relaxed">
              {desc}
            </p>
          )}
          <div className="flex gap-4 mt-8 shrink-0">
            <button
              onClick={() => {
                updateInput(id, true);
                handleNextStep(step, true);
              }}
              className={`flex-1 border-2 border-stone-800 p-4 font-bold text-xl rounded-lg transition-all ${
                boolSelection
                  ? 'bg-stone-800 text-white shadow-lg scale-105'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              はい
            </button>
            <button
              onClick={() => {
                updateInput(id, false);
                handleNextStep(step, false);
              }}
              className={`flex-1 border-2 border-stone-800 p-4 font-bold text-xl rounded-lg transition-all ${
                !boolSelection
                  ? 'bg-stone-800 text-white shadow-lg scale-105'
                  : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              }`}
            >
              いいえ
            </button>
          </div>
          <p className="text-center text-xs text-stone-500 mt-8 animate-pulse font-bold">
            ← 4 / 6 → キーで選択
            <br />
            Enter で決定
          </p>
        </div>
      );
    }
    return (
      <div
        className="flex flex-col h-full justify-start pt-6 px-4 animate-fade-in relative pb-10"
        onClick={hideKeyboard}
      >
        {renderWizardHeader()}
        <h3 className="text-xl font-bold mb-2 border-b-2 border-stone-800 pb-2 inline-block self-start shrink-0">
          {title}
        </h3>
        {desc && (
          <p className="text-sm text-stone-600 mb-6 font-mono shrink-0 whitespace-pre-line leading-relaxed">
            {desc}
          </p>
        )}
        <div className="mt-4 shrink-0">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl">
              {prefix}
            </span>
            <input
              type="number"
              value={inputs[id] || ''}
              onChange={(e) => updateInput(id, e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border-2 border-stone-800 bg-white p-4 pl-10 text-2xl font-bold focus:outline-none font-mono rounded-lg"
              placeholder="0"
              autoFocus
            />
          </div>
          <button
            onClick={() => handleNextStep(step)}
            className="w-full mt-6 border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-xl flex justify-center items-center gap-2 hover:bg-stone-700 active:translate-y-1 rounded-lg"
          >
            ケッテイ <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderFoodInputScreen = () => {
    const daily = inputs.expFoodDaily || '';
    const total = inputs.expFoodTotal || '';
    const days = currentPeriod.days;
    const calculatedTotal = daily ? Number(daily) * days : Number(total);
    const handleNext = () => {
      updateInput('expFood', calculatedTotal);
      handleNextStep('expFood');
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && calculatedTotal) {
        e.preventDefault();
        handleNext();
      }
    };
    return (
      <div
        className="flex flex-col h-full justify-start pt-6 px-4 animate-fade-in relative pb-10"
        onClick={hideKeyboard}
      >
        {renderWizardHeader()}
        <h3 className="text-xl font-bold mb-2 border-b-2 border-stone-800 pb-2 inline-block self-start shrink-0">
          使った感覚: 食費
        </h3>
        <p className="text-sm text-stone-600 mb-4 font-mono shrink-0">
          1日あたり、または合計を入力
        </p>
        <div className="bg-stone-100 border-2 border-stone-800 p-4 mb-2 rounded-lg shrink-0">
          <p className="text-sm font-bold mb-2 text-stone-700">
            ★ 1日およそいくら？（優先）
          </p>
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">
              ¥
            </span>
            <input
              type="number"
              value={daily}
              onChange={(e) => {
                updateInput('expFoodDaily', e.target.value);
                updateInput('expFoodTotal', '');
              }}
              onKeyDown={handleKeyDown}
              className="w-full border-2 border-stone-800 rounded-lg p-2 pl-8 text-xl font-bold font-mono"
              placeholder="例: 1500"
            />
          </div>
          {daily && (
            <p className="text-right text-xs font-bold text-stone-600">
              → 自動計算 ({days}日分): ¥
              {(Number(daily) * days).toLocaleString()}
            </p>
          )}
        </div>
        <div className="text-center font-bold text-stone-500 mb-2 shrink-0">
          ーー または ーー
        </div>
        <div className="bg-white border-2 border-stone-800 p-4 mb-4 rounded-lg shrink-0">
          <p className="text-sm font-bold mb-2 text-stone-700">期間の合計額</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">
              ¥
            </span>
            <input
              type="number"
              value={total}
              onChange={(e) => {
                updateInput('expFoodTotal', e.target.value);
                updateInput('expFoodDaily', '');
              }}
              onKeyDown={handleKeyDown}
              className="w-full border-2 border-stone-800 rounded-lg p-2 pl-8 text-xl font-bold font-mono bg-stone-50"
              placeholder="合計金額"
            />
          </div>
        </div>
        <button
          onClick={handleNext}
          disabled={!calculatedTotal}
          className="w-full border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-xl flex justify-center items-center gap-2 hover:bg-stone-700 disabled:bg-stone-300 disabled:text-stone-500 disabled:border-stone-400 active:translate-y-1 rounded-lg shrink-0"
        >
          ケッテイ <ChevronRight size={24} />
        </button>
      </div>
    );
  };

  const displayHistory = history.filter(
    (h) => h.type === userSettings.periodType
  );
  const displayPeriods = periods.filter(
    (p) => p.type === userSettings.periodType
  );
  const ITEMS_PER_PAGE = 13;
  const sortedHistory = [...displayHistory].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const chunks = [];
  for (let i = 0; i < sortedHistory.length; i += ITEMS_PER_PAGE) {
    chunks.push(sortedHistory.slice(i, i + ITEMS_PER_PAGE));
  }
  const reversedChunks = [...chunks].reverse();
  const maxPage = Math.max(0, reversedChunks.length - 1);
  const pageData = reversedChunks[analyticsPage] || [];
  const prevHalf = pageData.slice(0, 7);
  const recentHalf = pageData.slice(7, 13);

  const sumKey = (arr, key) => arr.reduce((acc, curr) => acc + curr[key], 0);
  const sumExp = (arr, key) =>
    arr.reduce((acc, curr) => acc + curr.exp[key], 0);
  const calcTotals = (arr) => ({
    income: sumKey(arr, 'income'),
    expTotal: sumKey(arr, 'expTotal'),
    exp: {
      food: sumExp(arr, 'food'),
      daily: sumExp(arr, 'daily'),
      hobby: sumExp(arr, 'hobby'),
      fixed: sumExp(arr, 'fixed'),
      others: sumExp(arr, 'others'),
    },
  });
  const prevTotals = calcTotals(prevHalf);
  const recentTotals = calcTotals(recentHalf);

  const dataLen = pageData.length;
  const startIndex = 0;
  const midIndex = Math.floor((dataLen - 1) / 2);
  const lastIndex = Math.max(0, dataLen - 1);
  const uniqueTargetIndices = [
    ...new Set([startIndex, midIndex, lastIndex]),
  ].sort((a, b) => a - b);

  const maxAssets = Math.max(...pageData.map((d) => d.totalAssets), 1);
  const minAssets = Math.min(...pageData.map((d) => d.pureAssets), 0);
  const assetRange = maxAssets - minAssets || 1;
  const maxExp = Math.max(...pageData.map((d) => d.expTotal), 1);
  const getAssetY = (val) => 100 - ((val - minAssets) / assetRange) * 100;
  const maxDiscrepancyRate = Math.max(
    ...pageData.map((d) => {
      const disc =
        d.discrepancy !== undefined
          ? d.discrepancy
          : d.actualExpense !== undefined
          ? d.actualExpense - d.expTotal
          : 0;
      return Math.abs((disc / (d.income || 1)) * 100);
    }),
    10
  );

  // グラフ上の絶対位置(left%)を計算。両端が枠（Y軸）に被らないよう、各データセルの中央に配置
  const getLeftPercent = (i) => ((i + 0.5) / Math.max(dataLen, 1)) * 100;

  // ピックアップラベル・X軸ラベルの配置スタイル（端のはみ出し防止）
  const getLabelStyle = (i) => {
    if (i === 0) return { left: '0%', transform: 'translateX(0)' };
    if (i === dataLen - 1)
      return { left: '100%', transform: 'translateX(-100%)' };
    return { left: `${getLeftPercent(i)}%`, transform: 'translateX(-50%)' };
  };

  const shortLabel = (d) =>
    d
      ? d.label
          .replace('年 ', '/')
          .replace('月分', '')
          .replace('第', 'w')
          .replace('週', '')
      : '';

  const formatToMan = (val) => {
    if (val === 0) return '0';
    const man = val / 10000;
    return Number.isInteger(man) ? man.toLocaleString() : man.toFixed(1);
  };

  // 新規追加：結果画面のUI構築ロジック
  const getResultUI = () => {
    const rate = Math.abs(finance.discrepancy) / (finance.income || 1);
    const diff = Math.abs(finance.discrepancy);
    const isOver = finance.discrepancy > 0; // 浪費(感覚より多く使った)か

    if (rate <= 0.01) {
      return {
        bg: 'bg-blue-50',
        textColor: 'text-blue-800',
        title: 'お見事。完璧に把握しています。',
        desc: `ズレはわずか ¥${diff.toLocaleString()}。\n素晴らしいお金の感覚です。`,
      };
    } else if (rate <= 0.03) {
      return {
        bg: 'bg-green-50',
        textColor: 'text-green-800',
        title: 'いい感じです。ほぼ合っています。',
        desc: `¥${diff.toLocaleString()} のズレ。\n誤差の範囲内ですね。`,
      };
    } else if (rate < 0.05) {
      return {
        bg: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        title: 'ん？ 少し感覚がズレてきましたね。',
        desc: isOver
          ? `¥${diff.toLocaleString()}、どこに消えたか\n思い出せますか？`
          : `¥${diff.toLocaleString()}、なぜか浮いています。\n多めに見積もっていたようです。`,
      };
    } else {
      return {
        bg: 'bg-red-50',
        textColor: 'text-red-800',
        title: 'あれ…こんなはずじゃなかった？',
        desc: isOver
          ? `¥${diff.toLocaleString()} が行方不明です。\n完全に把握から漏れています。`
          : `¥${diff.toLocaleString()} も余っています。\nお金の感覚が麻痺しているかも。`,
      };
    }
  };

  const renderAnalytics = () => {
    if (displayHistory.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-stone-500 animate-fade-in">
          <LineChart size={48} className="mb-4 opacity-50" />
          <p className="font-bold">まだ記録がありません</p>
          <p className="text-xs mt-2">イクセイから記録をつけてみよう！</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-full animate-fade-in text-stone-800 relative pb-10">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold border-b-2 border-stone-800 pb-1">
            キロクのふりかえり
          </h2>
          {maxPage > 0 && (
            <div className="flex items-center gap-2">
              <button
                disabled={analyticsPage === 0}
                onClick={() => setAnalyticsPage((p) => p - 1)}
                className="p-1 border-2 border-stone-800 bg-white rounded disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold py-1 px-1">
                {analyticsPage === 0 ? '最新' : `過去 ${analyticsPage}`} (
                {analyticsPage + 1}/{maxPage + 1})
              </span>
              <button
                disabled={analyticsPage >= maxPage}
                onClick={() => setAnalyticsPage((p) => p + 1)}
                className="p-1 border-2 border-stone-800 bg-white rounded disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-hidden pb-2 flex-1">
          <div className="space-y-6">
            {/* 資産推移 */}
            <div className="border-2 border-stone-800 bg-white p-3 sm:p-4 rounded-lg">
              <div className="flex flex-wrap justify-between items-center mb-2 border-b border-stone-200 pb-2 gap-y-1">
                <h3 className="text-xs sm:text-sm font-bold whitespace-nowrap mr-2">
                  ■ お金のふえかた (全資産/純資産)
                </h3>
                <div className="flex gap-2 sm:gap-3 text-[10px] font-bold whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-green-500"></div>全資産
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-blue-500"></div>純資産
                  </span>
                </div>
              </div>

              {/* 【修正】絶対配置(absolute)をやめ、Flexboxで3つを均等に並べて重なりを防止 */}
              <div className="flex justify-between w-full mb-1 px-4 sm:px-6 gap-1">
                {uniqueTargetIndices.map((i) => {
                  const d = pageData[i];
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center bg-stone-50 border border-stone-200 rounded p-1 shadow-sm z-10 whitespace-nowrap flex-1 max-w-[32%] overflow-hidden"
                    >
                      <span className="text-[7px] sm:text-[8px] text-stone-500 font-bold mb-0.5 truncate">
                        {shortLabel(d)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-green-600 font-bold leading-none truncate">
                        {Math.round(d.totalAssets / 1000).toLocaleString()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold leading-none mt-0.5 truncate">
                        {Math.round(d.pureAssets / 1000).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="relative mt-2 px-8 sm:px-10">
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[7px] text-stone-400 text-right pr-1">
                  <span className="translate-y-[-50%]">
                    {formatToMan(maxAssets)}
                  </span>
                  <span className="translate-y-[-50%]">
                    {formatToMan((maxAssets + minAssets) / 2)}
                  </span>
                  <span className="translate-y-[50%]">
                    {formatToMan(minAssets)}
                  </span>
                </div>

                <div className="relative w-full h-32 border-l-2 border-b-2 border-stone-800">
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '0%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '25%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '50%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '75%' }}
                  ></div>

                  <svg
                    className="absolute inset-0 h-full w-full overflow-visible"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {pageData.length > 1 && (
                      <>
                        <polyline
                          points={pageData
                            .map(
                              (d, i) =>
                                `${getLeftPercent(i)},${getAssetY(
                                  d.totalAssets
                                )}`
                            )
                            .join(' ')}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="2"
                        />
                        <polyline
                          points={pageData
                            .map(
                              (d, i) =>
                                `${getLeftPercent(i)},${getAssetY(
                                  d.pureAssets
                                )}`
                            )
                            .join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      </>
                    )}
                    {pageData.map((d, i) => (
                      <g key={i}>
                        <circle
                          cx={getLeftPercent(i)}
                          cy={getAssetY(d.totalAssets)}
                          r="2.5"
                          fill="#22c55e"
                        />
                        <circle
                          cx={getLeftPercent(i)}
                          cy={getAssetY(d.pureAssets)}
                          r="2.5"
                          fill="#3b82f6"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="relative w-full h-4 mt-1">
                  {uniqueTargetIndices.map((i) => {
                    const d = pageData[i];
                    return (
                      <span
                        key={i}
                        className="absolute text-[7px] sm:text-[8px] text-stone-500 font-bold"
                        style={getLabelStyle(i)}
                      >
                        {shortLabel(d)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 支出内訳推移 */}
            <div className="border-2 border-stone-800 bg-white p-3 sm:p-4 rounded-lg">
              <div className="mb-2 border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold mb-1">■ 使った感覚の割合</h3>
                <div className="flex gap-2 text-[10px] font-bold whitespace-nowrap">
                  <span className="text-orange-500">■食費</span>
                  <span className="text-blue-500">■日用品</span>
                  <span className="text-purple-500">■趣味</span>
                  <span className="text-green-500">■固定</span>
                  <span className="text-yellow-500">■他</span>
                </div>
              </div>

              {/* 【修正】絶対配置(absolute)をやめ、Flexboxで3つを均等に並べて重なりを防止 */}
              <div className="flex justify-between w-full mb-2 px-4 sm:px-6 gap-1">
                {uniqueTargetIndices.map((i) => {
                  const d = pageData[i];
                  return (
                    <div
                      key={i}
                      className="flex flex-col bg-stone-50 border border-stone-200 rounded p-1 shadow-sm z-10 whitespace-nowrap flex-1 max-w-[32%] overflow-hidden"
                    >
                      <span className="text-[7px] sm:text-[8px] text-stone-500 font-bold border-b border-stone-300 mb-0.5 pb-0.5 text-center truncate">
                        {shortLabel(d)}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-black text-center mb-0.5 truncate">
                        計: {Math.round(d.expTotal / 1000).toLocaleString()}
                      </span>
                      <div className="grid grid-cols-2 gap-x-0.5 text-[6.5px] sm:text-[7.5px] font-bold leading-tight text-center">
                        <span className="text-orange-600 truncate">
                          食:{Math.round(d.exp.food / 1000)}
                        </span>
                        <span className="text-blue-600 truncate">
                          日:{Math.round(d.exp.daily / 1000)}
                        </span>
                        <span className="text-purple-600 truncate">
                          趣:{Math.round(d.exp.hobby / 1000)}
                        </span>
                        <span className="text-green-600 truncate">
                          固:{Math.round(d.exp.fixed / 1000)}
                        </span>
                        <span className="text-yellow-600 col-span-2 truncate">
                          他:{Math.round(d.exp.others / 1000)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative mt-2 px-8 sm:px-10">
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[7px] text-stone-400 text-right pr-1">
                  <span className="translate-y-[-50%]">
                    {formatToMan(maxExp)}
                  </span>
                  <span className="translate-y-[-50%]">
                    {formatToMan(maxExp / 2)}
                  </span>
                  <span className="translate-y-[50%]">0</span>
                </div>

                <div className="relative w-full h-32 border-l-2 border-b-2 border-stone-800">
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '0%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '25%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '50%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '75%' }}
                  ></div>

                  {Array.from({ length: dataLen }).map((_, i) => {
                    const d = pageData[i];
                    if (!d) return null;
                    return (
                      <div
                        key={i}
                        className="absolute bottom-0 flex flex-col justify-end w-3 sm:w-4"
                        style={{
                          left: `${getLeftPercent(i)}%`,
                          transform: 'translateX(-50%)',
                          height: `${(d.expTotal / maxExp) * 100}%`,
                        }}
                      >
                        <div
                          className="bg-yellow-400 w-full"
                          style={{
                            height: `${(d.exp.others / d.expTotal) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-green-400 w-full"
                          style={{
                            height: `${(d.exp.fixed / d.expTotal) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-purple-400 w-full"
                          style={{
                            height: `${(d.exp.hobby / d.expTotal) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-blue-400 w-full"
                          style={{
                            height: `${(d.exp.daily / d.expTotal) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-orange-400 w-full"
                          style={{
                            height: `${(d.exp.food / d.expTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                <div className="relative w-full h-4 mt-1">
                  {uniqueTargetIndices.map((i) => {
                    const d = pageData[i];
                    return (
                      <span
                        key={i}
                        className="absolute text-[7px] sm:text-[8px] text-stone-500 font-bold"
                        style={getLabelStyle(i)}
                      >
                        {shortLabel(d)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 差異率推移 */}
            <div className="border-2 border-stone-800 bg-white p-3 rounded-lg shrink-0">
              <div className="flex justify-between items-center mb-2 border-b border-stone-200 pb-2">
                <h3 className="text-sm font-bold">■ カンカクのズレ具合</h3>
                <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1 rounded whitespace-nowrap">
                  ズレ÷収入(%)
                </span>
              </div>

              <div className="relative mt-4 px-8 sm:px-10">
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[7px] text-stone-400 text-right pr-1">
                  <span className="translate-y-[-50%]">
                    {maxDiscrepancyRate.toFixed(0)}%
                  </span>
                  <span className="translate-y-[-50%]">0%</span>
                  <span className="translate-y-[50%]">
                    -{maxDiscrepancyRate.toFixed(0)}%
                  </span>
                </div>

                <div className="relative w-full h-24 border-l-2 border-stone-800">
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '0%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '25%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t-2 border-dashed border-stone-400"
                    style={{ top: '50%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '75%' }}
                  ></div>
                  <div
                    className="absolute w-full border-t border-stone-200"
                    style={{ top: '100%' }}
                  ></div>

                  {pageData.map((d, i) => {
                    const disc =
                      d.discrepancy !== undefined
                        ? d.discrepancy
                        : d.actualExpense !== undefined
                        ? d.actualExpense - d.expTotal
                        : 0;
                    const rate = (disc / (d.income || 1)) * 100;
                    const x = getLeftPercent(i);
                    const barHeight =
                      (Math.abs(rate) / maxDiscrepancyRate) * 50;
                    const colorClass = rate > 0 ? 'bg-red-500' : 'bg-blue-500';
                    const textColorClass =
                      rate > 0 ? 'text-red-500' : 'text-blue-500';

                    return (
                      <div
                        key={i}
                        className="absolute flex flex-col items-center justify-center w-2 sm:w-3"
                        style={{
                          left: `${x}%`,
                          transform: 'translateX(-50%)',
                          top: '0',
                          bottom: '0',
                        }}
                      >
                        {rate > 0 && (
                          <>
                            <span
                              className={`absolute ${textColorClass} text-[7px] sm:text-[8px] font-bold`}
                              style={{
                                bottom: `calc(50% + ${barHeight}% + 2px)`,
                              }}
                            >
                              {rate.toFixed(0)}%
                            </span>
                            <div
                              className={`absolute ${colorClass} w-full rounded-t-sm`}
                              style={{ bottom: '50%', height: `${barHeight}%` }}
                            ></div>
                          </>
                        )}
                        {rate <= 0 && (
                          <>
                            <div
                              className={`absolute ${colorClass} w-full rounded-b-sm`}
                              style={{ top: '50%', height: `${barHeight}%` }}
                            ></div>
                            <span
                              className={`absolute ${textColorClass} text-[7px] sm:text-[8px] font-bold`}
                              style={{ top: `calc(50% + ${barHeight}% + 2px)` }}
                            >
                              {rate.toFixed(0)}%
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="relative w-full h-4 mt-1">
                  {uniqueTargetIndices.map((i) => {
                    const d = pageData[i];
                    return (
                      <span
                        key={i}
                        className="absolute text-[7px] sm:text-[8px] text-stone-500 font-bold"
                        style={getLabelStyle(i)}
                      >
                        {shortLabel(d)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* データテーブル */}
            <div className="border-2 border-stone-800 bg-white p-3 rounded-lg overflow-x-auto">
              <h3 className="text-sm font-bold mb-2">
                ■ くわしい数字まとめ (単位: 万円)
              </h3>
              <p className="text-[10px] text-stone-500 mb-2 font-bold shrink-0">
                ※表は横にスクロールできます
              </p>

              <table className="w-max text-[11px] text-right border-collapse">
                <thead>
                  <tr className="bg-stone-200 border-b-2 border-stone-800">
                    <th className="py-2 px-1 border-r border-stone-400 text-left w-16 sticky left-0 bg-stone-200 z-10 whitespace-nowrap">
                      項目
                    </th>
                    {Array.from({ length: dataLen }).map((_, i) => {
                      const d = pageData[i];
                      let shortLabel = d
                        ? d.label
                            .replace('年 ', '/')
                            .replace('月分', '')
                            .replace('第', 'w')
                            .replace('週', '')
                        : '';
                      return (
                        <th
                          key={i}
                          className="py-2 px-2 border-r border-stone-300 font-normal min-w-[50px] whitespace-nowrap"
                        >
                          {shortLabel}
                        </th>
                      );
                    })}
                    <th className="py-2 px-2 border-r border-stone-400 bg-stone-300 font-bold min-w-[50px] whitespace-nowrap">
                      前半計
                    </th>
                    <th className="py-2 px-2 bg-stone-300 font-bold min-w-[50px] whitespace-nowrap">
                      後半計
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'totalAssets', name: '全資産' },
                    { key: 'loan', name: 'ローン' },
                    { key: 'pureAssets', name: '純資産' },
                    { key: 'income', name: '収入' },
                    { key: 'expTotal', name: '使った感覚(計)' },
                    { key: 'food', name: '├ 食費', isExp: true },
                    { key: 'daily', name: '├ 日用品', isExp: true },
                    { key: 'hobby', name: '├ 趣味', isExp: true },
                    { key: 'fixed', name: '├ 固定費', isExp: true },
                    { key: 'others', name: '└ その他', isExp: true },
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-stone-200 ${
                        idx === 2 || idx === 4
                          ? 'border-b-2 border-stone-800'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-1 border-r border-stone-400 text-left font-bold sticky left-0 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap z-10">
                        {row.name}
                      </td>
                      {Array.from({ length: dataLen }).map((_, i) => {
                        const d = pageData[i];
                        const val = d
                          ? formatToMan(row.isExp ? d.exp[row.key] : d[row.key])
                          : '';
                        return (
                          <td
                            key={i}
                            className="py-2 px-2 border-r border-stone-300 text-stone-700 whitespace-nowrap"
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 border-r border-stone-400 bg-stone-100 font-bold whitespace-nowrap">
                        {['totalAssets', 'loan', 'pureAssets'].includes(row.key)
                          ? '-'
                          : formatToMan(
                              row.isExp
                                ? prevTotals.exp[row.key]
                                : prevTotals[row.key]
                            )}
                      </td>
                      <td className="py-2 px-2 bg-stone-100 font-bold whitespace-nowrap">
                        {['totalAssets', 'loan', 'pureAssets'].includes(row.key)
                          ? '-'
                          : formatToMan(
                              row.isExp
                                ? recentTotals.exp[row.key]
                                : recentTotals[row.key]
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] bg-white flex items-center justify-center p-2 sm:p-4 font-mono text-stone-800 selection:bg-stone-800 selection:text-white overflow-hidden">
      <div className="w-full max-w-sm bg-white border-4 sm:border-8 border-stone-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg flex flex-col h-[96dvh] sm:h-[750px]">
        <div className="bg-stone-800 text-stone-100 p-4 flex justify-between items-center shrink-0 relative z-20">
          <h1 className="font-bold tracking-widest text-sm truncate">
            マネコロ{' '}
            {currentPeriod && step !== 'home' && `- ${currentPeriod.label}`}
          </h1>
          {showSaveIcon && (
            <div className="absolute right-4 text-stone-300 flex items-center gap-1 text-xs animate-pulse">
              <Save size={14} /> 保存中
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-white relative">
          <div className="h-full">
            {step === 'help' ? (
              <div className="flex flex-col h-full justify-start pt-8 px-4 animate-fade-in pb-10">
                <div className="flex justify-between items-center mb-6 border-b-2 border-stone-800 pb-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <HelpCircle size={24} /> アソビカタ
                  </h2>
                  <button
                    onClick={() => setStep('settings')}
                    className="p-2 border-2 border-stone-800 bg-white rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 pb-8">
                  <div className="bg-stone-100 border-2 border-stone-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      🥚 マネコロとは？
                    </h3>
                    <p className="text-sm leading-relaxed text-stone-700">
                      細かいレシート入力は不要！
                      <br />
                      月に1回、<b>「現実の残高」</b>と<b>「使った感覚」</b>
                      を入力して、そのズレを無くしていく育成ゲームです。
                      <br />
                      ズレが少ないほど、マネコロは立派に成長します。
                    </p>
                  </div>
                  <div className="bg-white border-2 border-stone-800 p-4 rounded-lg shadow-[2px_2px_0_0_#292524]">
                    <h3 className="font-bold text-lg mb-2">📝 キロクの手順</h3>
                    <ol className="text-sm space-y-3 text-stone-700 list-decimal list-inside font-bold">
                      <li className="pb-2 border-b border-stone-200">
                        <span className="text-stone-800">
                          最初は「今の全資産」を入力！
                        </span>
                        <br />
                        <span className="font-normal text-xs ml-4">
                          今の銀行や財布のお金をざっくり入力すると、タマゴが誕生します。
                        </span>
                      </li>
                      <li className="pb-2 border-b border-stone-200">
                        <span className="text-stone-800">
                          次回からが本番（答え合わせ）
                        </span>
                        <br />
                        <span className="font-normal text-xs ml-4">
                          給料日などに「キロク スル」を押して、
                          <b>①リアルな残高</b>と<b>②使った感覚</b>を入力します。
                        </span>
                      </li>
                      <li>
                        <span className="text-stone-800">ケッカハッピョウ</span>
                        <br />
                        <span className="font-normal text-xs ml-4">
                          現実と感覚のズレが計算され、結果に応じてマネコロが進化します！
                        </span>
                      </li>
                    </ol>
                  </div>
                  <div className="bg-stone-800 text-white border-2 border-stone-800 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      🌟 進化のヒント
                    </h3>
                    <ul className="text-sm space-y-2 text-stone-300">
                      <li>
                        ・ズレが少ないと{' '}
                        <b className="text-yellow-400">EP(進化ポイント)</b>{' '}
                        を獲得！
                      </li>
                      <li>
                        ・純資産(貯金)が増えると、マネコロが{' '}
                        <b className="text-green-400">巨大化</b> します。
                      </li>
                      <li>
                        ・ズレが大きすぎると、ヤミのオーラに包まれてしまうかも...
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : step === 'settings' ? (
              <div className="flex flex-col h-full justify-start pt-12 px-4 animate-fade-in pb-10">
                <div className="flex justify-between items-center mb-6 border-b-2 border-stone-800 pb-2">
                  <h2 className="text-xl font-bold">セッテイ</h2>
                  <button
                    onClick={() => {
                      setStep('home');
                      setCurrentPeriod(null);
                    }}
                    className="p-2 border-2 border-stone-800 bg-white rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
                <div className="space-y-6">
                  <button
                    onClick={() => setStep('help')}
                    className="w-full border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-lg flex justify-between items-center hover:bg-stone-700 active:translate-y-1 rounded-lg shadow-[2px_2px_0_0_#292524]"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle size={20} /> アソビカタ (ヘルプ)
                    </span>
                    <ChevronRight size={20} />
                  </button>
                  <div className="border-2 border-stone-800 bg-white p-4 rounded-lg">
                    <h3 className="font-bold mb-2">記録のペース</h3>
                    <select
                      value={userSettings.periodType}
                      onChange={(e) => {
                        setUserSettings((prev) => ({
                          ...prev,
                          periodType: e.target.value,
                        }));
                        setStep('home');
                      }}
                      className="w-full border-2 border-stone-800 p-2 font-mono bg-stone-50 rounded"
                    >
                      <option value="month">1ヶ月ごと (おすすめ)</option>
                      <option value="week">1週間ごと</option>
                    </select>
                    <p className="text-xs text-stone-600 mt-2">
                      ※ペースを変更するとホーム画面の表示が切り替わります。
                    </p>
                  </div>
                  <div className="border-2 border-stone-800 bg-white p-4 rounded-lg">
                    <h3 className="font-bold mb-4">バックアップ・引き継ぎ</h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleExportData}
                        className="w-full border-2 border-stone-800 bg-stone-100 p-3 font-bold flex justify-center items-center gap-2 hover:bg-stone-200 rounded"
                      >
                        <Download size={18} /> データを書き出す
                      </button>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button className="w-full border-2 border-stone-800 bg-stone-100 p-3 font-bold flex justify-center items-center gap-2 hover:bg-stone-200 rounded pointer-events-none">
                          <Upload size={18} /> データを読み込む
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-2">
                        ※機種変更時は、書き出したファイルを新しいスマホに送り、ここで読み込んでください。
                      </p>
                    </div>
                  </div>
                  <div className="border-2 border-stone-800 bg-white p-4 rounded-lg">
                    <h3 className="font-bold text-red-600 mb-2">
                      データ初期化
                    </h3>
                    <button
                      onClick={handleResetAll}
                      className="w-full border-2 border-red-600 text-red-600 p-2 font-bold hover:bg-red-50 rounded"
                    >
                      すべての記録を消す
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'pet' ? (
              step === 'home' ? (
                <div className="flex flex-col h-full justify-between items-center py-8 animate-fade-in">
                  <div className="w-full px-6 flex justify-between items-start">
                    <div className="text-left font-bold text-stone-600">
                      <div className="text-xs">ジュンシサン</div>
                      <div className="text-xl">
                        ¥{finance.currentAssets.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right font-bold text-stone-600">
                      <div className="text-xs">純資産レベル</div>
                      <div className="text-xl">Lv.{character.level || 1}</div>
                    </div>
                  </div>
                  <div className="w-full px-6 flex justify-end">
                    {character.stage > 0 && (
                      <div className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                        進化まで あと{' '}
                        {10 - ((character.evolutionPoint || 0) % 10)} EP
                      </div>
                    )}
                  </div>
                  {renderAA(character)}
                  <div className="w-full px-6 flex flex-col gap-3">
                    <button
                      onClick={() => setStep('select_period')}
                      className="w-full border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-xl flex justify-center items-center gap-2 hover:bg-stone-700 active:translate-y-1 rounded-lg"
                    >
                      キロク スル <PlusCircle size={24} />
                    </button>
                    <button
                      onClick={() => setStep('settings')}
                      className="w-full border-2 border-stone-800 bg-white p-3 font-bold text-stone-700 flex justify-center items-center gap-2 hover:bg-stone-50 active:translate-y-1 rounded-lg"
                    >
                      セッテイ <Settings size={20} />
                    </button>
                  </div>
                </div>
              ) : step === 'select_period' ? (
                <div className="flex flex-col h-full justify-start pt-8 px-4 animate-fade-in relative pb-10">
                  <div className="flex justify-between items-center mb-6 border-b-2 border-stone-800 pb-2">
                    <h2 className="text-xl font-bold">いつのキロク？</h2>
                    <button
                      onClick={() => {
                        setStep('home');
                        setCurrentPeriod(null);
                      }}
                      className="p-2 border-2 border-stone-800 bg-white rounded"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  </div>
                  <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                    {displayPeriods.length === 0 ? (
                      <div className="border-2 border-stone-800 bg-stone-50 p-4 rounded-lg">
                        <p className="text-sm font-bold mb-4">
                          最初の記録期間を作りましょう！
                        </p>
                        <div className="flex gap-2 mb-4">
                          <select
                            value={initYear}
                            onChange={(e) => setInitYear(e.target.value)}
                            className="border-2 border-stone-800 p-2 rounded flex-1"
                          >
                            {[
                              currentYear - 1,
                              currentYear,
                              currentYear + 1,
                            ].map((y) => (
                              <option key={y} value={String(y)}>
                                {y}年
                              </option>
                            ))}
                          </select>
                          <select
                            value={initMonth}
                            onChange={(e) => setInitMonth(e.target.value)}
                            className="border-2 border-stone-800 p-2 rounded flex-1"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={String(i + 1)}>
                                {i + 1}月
                              </option>
                            ))}
                          </select>
                          {userSettings.periodType === 'week' && (
                            <select
                              value={initWeek}
                              onChange={(e) => setInitWeek(e.target.value)}
                              className="border-2 border-stone-800 p-2 rounded flex-1"
                            >
                              {[1, 2, 3, 4, 5].map((w) => (
                                <option key={w} value={w}>
                                  第{w}週
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <button
                          onClick={handleAddInitPeriod}
                          className="w-full border-2 border-stone-800 bg-stone-800 text-white p-3 font-bold rounded"
                        >
                          作成する
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleAddNextPeriod}
                          className="w-full border-2 border-stone-800 border-dashed bg-white p-4 font-bold text-stone-600 flex justify-center items-center gap-2 hover:bg-stone-50 rounded-lg"
                        >
                          <PlusCircle size={20} /> 次の期間を追加
                        </button>
                        {displayPeriods.map((p) => {
                          const data = savedData[p.id];
                          const isCompleted = data?.status === 'completed';
                          const isInProgress = data?.status === 'in_progress';
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSelectPeriod(p)}
                              className={`w-full border-2 border-stone-800 p-4 font-bold text-lg flex justify-between items-center hover:-translate-y-1 transition-transform rounded-lg ${
                                isCompleted
                                  ? 'bg-stone-300 text-stone-600'
                                  : isInProgress
                                  ? 'bg-stone-100'
                                  : 'bg-white shadow-[2px_2px_0_0_#292524]'
                              }`}
                            >
                              <span>{p.label}</span>
                              {isCompleted ? (
                                <span className="text-xs bg-stone-500 text-white px-2 py-1 rounded">
                                  完了
                                </span>
                              ) : isInProgress ? (
                                <span className="text-xs bg-stone-600 text-white px-2 py-1 rounded">
                                  途中から
                                </span>
                              ) : (
                                <ChevronRight size={20} />
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              ) : step === 'result' ? (
                // 【変更】結果画面のUIをフルリニューアル
                (() => {
                  const ui = getResultUI();
                  return (
                    <div
                      className={`flex flex-col h-full justify-center px-6 animate-fade-in relative pb-10 ${ui.bg} transition-colors duration-500`}
                    >
                      <div className="flex-1 flex flex-col justify-center items-center text-center -mt-10">
                        <h2
                          className={`text-xl font-bold mb-8 whitespace-pre-line leading-relaxed ${ui.textColor}`}
                        >
                          {ui.title}
                        </h2>

                        <div className="mb-6">
                          <p className="text-xs font-bold text-stone-500 mb-2">
                            感覚とのズレ
                          </p>
                          <p
                            className={`text-5xl font-black tracking-tighter ${ui.textColor}`}
                          >
                            ¥{Math.abs(finance.discrepancy).toLocaleString()}
                          </p>
                        </div>

                        <p className="text-sm font-bold whitespace-pre-line leading-relaxed text-stone-700">
                          {ui.desc}
                        </p>
                      </div>

                      <div className="w-full shrink-0 mb-4">
                        <button
                          onClick={() =>
                            setShowResultDetails(!showResultDetails)
                          }
                          className="text-xs text-stone-500 font-bold underline w-full text-center py-2"
                        >
                          {showResultDetails
                            ? '詳細を閉じる'
                            : 'なぜこのズレになったか計算式を見る'}
                        </button>
                        {showResultDetails && (
                          <div className="text-[10px] text-stone-600 bg-white/50 p-3 rounded mt-2 border border-stone-200 animate-fade-in">
                            <div className="flex justify-between mb-1">
                              <span>現実の純資産増減:</span>
                              <span>
                                {finance.actualBalance > 0 ? '+' : ''}¥
                                {finance.actualBalance.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>感覚の収支 (収入-支出):</span>
                              <span>
                                {finance.senseBalance > 0 ? '+' : ''}¥
                                {finance.senseBalance.toLocaleString()}
                              </span>
                            </div>
                            <div className="border-t border-stone-300 my-1"></div>
                            <div className="flex justify-between font-bold">
                              <span>ズレ (使途不明金):</span>
                              <span>
                                ¥
                                {Math.abs(finance.discrepancy).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleEvolution}
                        className="w-full border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-lg flex justify-center items-center gap-2 hover:bg-stone-700 active:translate-y-1 rounded-lg shrink-0 shadow-[4px_4px_0_0_#292524]"
                      >
                        マネコロの様子を見る <ChevronRight size={24} />
                      </button>
                    </div>
                  );
                })()
              ) : step === 'evolution' ? (
                <div className="flex flex-col h-full justify-between items-center py-12 px-4 animate-fade-in relative pb-10">
                  <h2 className="text-2xl font-black text-center tracking-widest text-stone-800 mb-4 border-b-2 border-stone-800 pb-2">
                    {character.lastEvent === 'hatch'
                      ? 'タマゴからかえった！'
                      : character.lastEvent === 'evolve'
                      ? 'レベルアップ！'
                      : character.lastEvent === 'stay'
                      ? '順調！'
                      : 'ヤミのオーラ...'}
                  </h2>
                  <div className="flex-1 flex flex-col justify-center items-center w-full my-4">
                    {renderAA(character)}
                  </div>
                  <div className="bg-white border-2 border-stone-800 p-4 w-full shadow-[2px_2px_0_0_#292524] rounded-lg">
                    <p className="font-bold text-center whitespace-pre-line leading-relaxed">
                      {character.lastEvent === 'hatch'
                        ? 'マネコロ が 誕生した！\n(資産を増やすとレベルが上がるよ)'
                        : character.lastEvent === 'evolve'
                        ? `誤差 ${((character.lastRate || 0) * 100).toFixed(
                            1
                          )}%！ (+${
                            character.lastEarnedEP
                          } EP)\n複利の力で進化！\n新しいパーツを獲得した！`
                        : character.lastEvent === 'stay'
                        ? `誤差 ${((character.lastRate || 0) * 100).toFixed(
                            1
                          )}%！ (+${
                            character.lastEarnedEP
                          } EP)\n成長ポイントが貯まった。\n(進化まであと ${
                            10 - ((character.evolutionPoint || 0) % 10)
                          } EP)`
                        : `誤差 ${((character.lastRate || 0) * 100).toFixed(
                            1
                          )}%...\nズレが大きすぎて\nヤミのオーラに包まれた...`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setStep('home');
                      setCurrentPeriod(null);
                    }}
                    className="w-full mt-8 border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-xl flex justify-center items-center gap-2 hover:bg-stone-700 active:translate-y-1 rounded-lg"
                  >
                    ホームヘ <RotateCcw size={24} />
                  </button>
                </div>
              ) : (
                <>
                  {step === 'intro_start' &&
                    renderIntroScreen({
                      title: '【初回】\nスタート時の残高',
                      desc: 'まずは、今回の記録期間が始まった時の\n「ざっくりとした総資産」\nを教えてください。',
                    })}
                  {step === 'initial_assets' &&
                    renderInputScreen({
                      id: 'initialAssets',
                      title: 'スタート時の全資産',
                      desc: '期間の最初（スタート時）にあった\n銀行や手元の現金の合計\n（大体でOK）',
                    })}
                  {step === 'initial_loan' &&
                    renderInputScreen({
                      id: 'initialLoan',
                      title: 'スタート時のローン',
                      desc: '期間の最初（スタート時）にあった\n借金やローンの合計\n（なければ0）',
                    })}

                  {step === 'intro_current' &&
                    renderIntroScreen({
                      title: '今現在の\nリアルな残高',
                      desc: '次に、今現在（期間の終わり）の\n財布や銀行の残高を\n【ありのまま】に入力してください。',
                    })}
                  {step === 'cash' &&
                    renderInputScreen({
                      id: 'cash',
                      title: '手元の現金',
                      desc: '今ある現金(財布等)の合計',
                    })}
                  {step === 'ask_bank' &&
                    renderInputScreen({
                      id: 'hasMoreBank',
                      title:
                        (inputs.banks?.length || 0) === 0
                          ? '銀行口座の残高を入力する？'
                          : '別の銀行口座を追加する？',
                      desc:
                        (inputs.banks?.length || 0) > 0
                          ? `現在 ${inputs.banks.length} 件登録済み`
                          : '',
                      type: 'boolean',
                    })}
                  {step === 'bank_input' && (
                    <div
                      className="flex flex-col h-full justify-start pt-6 px-4 animate-fade-in relative pb-10"
                      onClick={hideKeyboard}
                    >
                      {renderWizardHeader()}
                      <h3 className="text-xl font-bold mb-2 border-b-2 border-stone-800 pb-2 inline-block self-start shrink-0">
                        銀行残高 ({(inputs.banks?.length || 0) + 1}つ目)
                      </h3>
                      <div className="mt-4 shrink-0">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl">
                            ¥
                          </span>
                          <input
                            type="number"
                            value={currentBankInput}
                            onChange={(e) =>
                              setCurrentBankInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')
                                handleNextStep('bank_input');
                            }}
                            className="w-full border-2 border-stone-800 bg-white p-4 pl-10 text-2xl font-bold font-mono rounded-lg"
                            placeholder="0"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleNextStep('bank_input')}
                          className="w-full mt-6 border-2 border-stone-800 bg-stone-800 text-white p-4 font-bold text-xl flex justify-center items-center gap-2 shadow-[2px_2px_0_0_#292524] rounded-lg hover:bg-stone-700"
                        >
                          ツイカ スル <PlusCircle size={24} />
                        </button>
                      </div>
                    </div>
                  )}
                  {step === 'ask_securities' &&
                    renderInputScreen({
                      id: 'hasSecurities',
                      title: '証券口座（投資）は？',
                      type: 'boolean',
                    })}
                  {step === 'securities_total' &&
                    renderInputScreen({
                      id: 'securities_total',
                      title: '証券口座の【評価額】',
                      desc: '現在の株や投資信託の合計額',
                    })}
                  {step === 'securities_profit' &&
                    renderInputScreen({
                      id: 'securities_profit',
                      title: '証券口座の【評価損益】',
                      desc: '前回からいくら増えた/減ったか\n(マイナスなら - をつける)',
                    })}
                  {step === 'ask_loan' &&
                    renderInputScreen({
                      id: 'hasLoan',
                      title: 'ローンや借金は？',
                      type: 'boolean',
                    })}
                  {step === 'loan' &&
                    renderInputScreen({
                      id: 'loan',
                      title: 'ローンの残高',
                      desc: '現在のローン残高の合計',
                    })}

                  {step === 'intro_sense' &&
                    renderIntroScreen({
                      title: '収入と\n「使った感覚」',
                      desc: '最後に、この期間中の収入と、\nあなたが【いくら使った気がするか】\nを教えてください。',
                    })}
                  {step === 'income' &&
                    renderInputScreen({
                      id: 'income',
                      title: '期間中の【収入】',
                      desc: `この期間(${currentPeriod?.label})に\n入ってきたお金の合計`,
                    })}
                  {step === 'expFood' && renderFoodInputScreen()}
                  {step === 'expDaily' &&
                    renderInputScreen({
                      id: 'expDaily',
                      title: '使った感覚: 日用品',
                      desc: '洗剤やトイレットペーパーなど',
                    })}
                  {step === 'expHobby' &&
                    renderInputScreen({
                      id: 'expHobby',
                      title: '使った感覚: 趣味・交際',
                      desc: '遊び、飲み会、欲しいものなど',
                    })}
                  {step === 'expFixed' &&
                    renderInputScreen({
                      id: 'expFixed',
                      title: '使った感覚: 固定費',
                      desc: '家賃、光熱費、サブスクなど',
                    })}
                  {step === 'expOthers' &&
                    renderInputScreen({
                      id: 'expOthers',
                      title: '使った感覚: その他',
                      desc: '医療費や突発的な出費など',
                    })}
                </>
              )
            ) : (
              <div className="h-full bg-white p-2 sm:p-4">
                {renderAnalytics()}
              </div>
            )}
          </div>
        </div>

        <div className="bg-stone-800 text-stone-400 flex border-t-4 border-stone-800 shrink-0">
          <button
            onClick={() => {
              setActiveTab('pet');
              setStep('home');
              setCurrentPeriod(null);
            }}
            className={`flex-1 py-4 flex flex-col items-center justify-center font-bold ${
              activeTab === 'pet'
                ? 'text-white bg-stone-700'
                : 'hover:bg-stone-700'
            }`}
          >
            <Wallet size={24} className="mb-1" />
            <span className="text-xs">イクセイ</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics');
              setCurrentPeriod(null);
            }}
            className={`flex-1 py-4 flex flex-col items-center justify-center font-bold ${
              activeTab === 'analytics'
                ? 'text-white bg-stone-700'
                : 'hover:bg-stone-700'
            }`}
          >
            <LineChart size={24} className="mb-1" />
            <span className="text-xs">ブンセキ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
