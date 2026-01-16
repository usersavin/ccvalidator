
import React, { useState, useEffect, useMemo } from 'react';
import CreditCard from './components/CreditCard';
import ValidationStats from './components/ValidationStats';
import { CardData, ValidationResult, SecurityInsight, BulkResult, CardAnalytics } from './types';
import { validateCard, formatCardNumber, parseBulkCsv, generateRandomCard, generateCardFromBin } from './utils/validation';
import { getSecurityInsights, getCardAnalytics } from './services/geminiService';
import { ISSUER_LOGOS, COUNTRY_BINS } from './constants';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'single' | 'bulk' | 'generator'>('single');
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expiry: '',
    cvv: '',
    holder: '',
    country: 'Unknown',
    bank: '',
    tier: ''
  });

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    issuer: 'unknown',
    luhnValid: false,
    errors: {},
    country: 'Unknown',
    bank: '',
    tier: ''
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [insights, setInsights] = useState<SecurityInsight[]>([]);
  const [analytics, setAnalytics] = useState<CardAnalytics | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Bulk State
  const [bulkText, setBulkText] = useState('');
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);

  // Generator State
  const [genBin, setGenBin] = useState('');
  const [genExpiry, setGenExpiry] = useState('');
  const [genCountry, setGenCountry] = useState('LK'); // Sri Lanka as default
  const [genCount, setGenCount] = useState<number>(10);
  const [genResults, setGenResults] = useState<CardData[]>([]);

  // Validate on data change
  useEffect(() => {
    const result = validateCard(cardData.number, cardData.expiry, cardData.cvv);
    setValidation(result);
  }, [cardData]);

  // Fetch AI insights & Analytics when issuer identified
  useEffect(() => {
    const digits = cardData.number.replace(/\D/g, '');
    if (digits.length >= 6) {
      const iin = digits.substring(0, 6);
      const timer = setTimeout(async () => {
        setLoadingInsights(true);
        setLoadingAnalytics(true);
        
        const [insightData, analyticData] = await Promise.all([
          getSecurityInsights(iin),
          getCardAnalytics(cardData.number, validation.bank, validation.country)
        ]);
        
        setInsights(insightData);
        setAnalytics(analyticData);
        setLoadingInsights(false);
        setLoadingAnalytics(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setAnalytics(null);
      setInsights([]);
    }
  }, [cardData.number.substring(0, 6)]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const formatted = formatCardNumber(value);
      setCardData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'expiry') {
      let v = value.replace(/\D/g, '');
      if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
      setCardData(prev => ({ ...prev, [name]: v.substring(0, 5) }));
    } else if (name === 'cvv') {
      const v = value.replace(/\D/g, '').substring(0, 4);
      setCardData(prev => ({ ...prev, [name]: v }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBulkValidate = () => {
    const results = parseBulkCsv(bulkText);
    setBulkResults(results);
  };

  const handleGenerateRandom = () => {
    const results: CardData[] = [];
    const count = Math.min(Math.max(1, genCount), 1000); // Limit to 1000 for performance
    
    for(let i=0; i < count; i++) {
        results.push(generateRandomCard({ countryCode: genCountry || undefined }));
    }
    setGenResults(results);
    if (results.length > 0) setCardData(results[0]);
  };

  const handleGenerateFromBin = () => {
    const results: CardData[] = [];
    const names = ["James Smith", "Maria Garcia", "Robert Johnson", "Patricia Williams", "Michael Brown", "Linda Jones", "David Miller", "Elizabeth Davis"];
    const count = Math.min(Math.max(1, genCount), 1000);

    for (let i = 0; i < count; i++) {
      const card = generateRandomCard({ countryCode: genCountry || undefined });
      const num = generateCardFromBin(genBin);
      const expiry = genExpiry || card.expiry;
      const cvv = Math.floor(100 + Math.random() * 899).toString();
      const check = validateCard(num, expiry, cvv);
      results.push({
        number: formatCardNumber(num),
        expiry,
        cvv,
        holder: names[Math.floor(Math.random() * names.length)].toUpperCase(),
        country: check.country,
        bank: check.bank,
        tier: check.tier
      });
    }
    setGenResults(results);
    if (results.length > 0) setCardData(results[0]);
  };

  const bulkStats = useMemo(() => {
    if (bulkResults.length === 0) return { valid: 0, total: 0 };
    return {
      valid: bulkResults.filter(r => r.isValid).length,
      total: bulkResults.length
    };
  }, [bulkResults]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-black text-slate-900 flex items-center justify-center gap-4 tracking-tight">
            <span className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-indigo-200 shadow-lg transform -rotate-3"><i className="fa-solid fa-shield-halved"></i></span>
            SECURE<span className="text-indigo-600">CARD</span> INSIGHT
          </h1>
          <p className="mt-4 text-lg text-slate-500 font-medium">Sri Lankan Market Accuracy: 10,000% BIN & AI Analyzer.</p>
        </header>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-2xl shadow-xl border border-slate-100 inline-flex flex-wrap justify-center backdrop-blur-md">
            <button onClick={() => setViewMode('single')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'single' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>
              <i className="fa-solid fa-credit-card mr-2"></i> Single Checker
            </button>
            <button onClick={() => setViewMode('bulk')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'bulk' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>
              <i className="fa-solid fa-layer-group mr-2"></i> Bulk Mode
            </button>
            <button onClick={() => setViewMode('generator')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'generator' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}>
              <i className="fa-solid fa-wand-magic mr-2"></i> Bulk Generator
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            {viewMode === 'single' && (
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-white/50 animate-in slide-in-from-left duration-500">
                <div className="flex flex-col gap-1 mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-800 tracking-tighter uppercase">Entry Details</h2>
                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Live Scan</span>
                  </div>
                  {validation.bank && (
                    <div className="text-xs font-black text-indigo-500 uppercase flex items-center gap-1.5">
                      <i className="fa-solid fa-building-columns"></i> {validation.bank}
                    </div>
                  )}
                  {validation.tier && (
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Market Tier: {validation.tier}
                    </div>
                  )}
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Holder Identity</label>
                    <input type="text" name="holder" placeholder="CARD HOLDER NAME" value={cardData.holder} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 transition-all uppercase text-sm font-bold text-slate-900 placeholder:text-slate-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Card Credentials</label>
                    <div className="relative">
                      <input type="text" name="number" placeholder="XXXX XXXX XXXX XXXX" value={cardData.number} onChange={handleChange} className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all mono tracking-[0.15em] font-bold text-lg text-slate-900 placeholder:text-slate-300 ${validation.errors.number ? 'border-rose-400 bg-rose-50' : 'border-slate-100 focus:border-indigo-500'}`} />
                      {validation.luhnValid && cardData.number.length >= 15 && (
                        <i className="fa-solid fa-circle-check absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 text-xl"></i>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="expiry" placeholder="MM/YY" value={cardData.expiry} onChange={handleChange} className="px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-sm text-slate-900 placeholder:text-slate-300" />
                    <input type="password" name="cvv" placeholder="CVV" value={cardData.cvv} onChange={handleChange} onFocus={() => setIsFlipped(true)} onBlur={() => setIsFlipped(false)} className="px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-sm text-slate-900 placeholder:text-slate-300" />
                  </div>
                </form>

                <div className="mt-8 p-4 bg-slate-900 rounded-2xl">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Detection</span>
                      <span className="text-xs font-black uppercase tracking-wider">{validation.country || 'Searching...'}</span>
                    </div>
                    <div className="text-2xl text-slate-400 opacity-50">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'bulk' && (
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-left duration-500">
                <h2 className="text-lg font-black text-slate-800 uppercase mb-6">Mass Batch Entry</h2>
                <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder='Format: Issuer, Name, "CardNumber", CVV, MM/YY' className="w-full h-64 px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 transition-all mono text-xs mb-6 text-slate-900 placeholder:text-slate-400" />
                <button onClick={handleBulkValidate} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-transform">
                  Initiate Validations
                </button>
              </div>
            )}

            {viewMode === 'generator' && (
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-left duration-500">
                <h2 className="text-lg font-black text-slate-800 uppercase mb-6">Bulk Factory</h2>
                <div className="space-y-6">
                  
                  {/* Quantity Input */}
                  <div className="p-5 bg-white rounded-2xl border-2 border-indigo-50">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Generation Quantity</label>
                    <div className="flex items-center gap-3">
                       <input 
                         type="number" 
                         min="1" 
                         max="1000"
                         value={genCount} 
                         onChange={(e) => setGenCount(parseInt(e.target.value) || 1)} 
                         className="w-full p-3.5 rounded-xl border-2 border-indigo-100 bg-white font-bold text-lg text-slate-900 focus:border-indigo-500 outline-none text-center" 
                       />
                       <span className="text-xs font-bold text-slate-400 uppercase">Cards</span>
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-3">Geographic Filter</label>
                    <select value={genCountry} onChange={(e) => setGenCountry(e.target.value)} className="w-full p-3.5 rounded-xl border-2 border-indigo-100 bg-white font-bold text-sm text-slate-900 focus:border-indigo-500 outline-none mb-4">
                      {COUNTRY_BINS.map(c => <option key={c.code} value={c.code}>{c.country}</option>)}
                    </select>
                    <button onClick={handleGenerateRandom} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-colors">Generate {genCount} Cards (Regional)</button>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Custom BIN Protocol</label>
                    <input 
                      type="text" 
                      value={genBin} 
                      onChange={(e) => setGenBin(e.target.value.replace(/\D/g, ''))} 
                      placeholder="Enter BIN (e.g. 405663)" 
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 mb-3 mono text-sm font-bold text-slate-900 placeholder:text-slate-400" 
                    />
                    <button disabled={!genBin} onClick={handleGenerateFromBin} className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest opacity-90 disabled:opacity-20 hover:bg-slate-900 transition-colors">Generate {genCount} Cards (Custom BIN)</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visualization & Analytics Panel */}
          <div className="lg:col-span-8 space-y-8">
            {/* Upper Dash: Card & Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Card Visualization */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] group-hover:bg-indigo-500/30 transition-all"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Validator v3.5</span>
                    {validation.country && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Region Lock</span>
                        <span className="text-xs font-black text-white uppercase">{validation.country}</span>
                      </div>
                    )}
                  </div>
                  <CreditCard data={cardData} issuer={validation.issuer} isFlipped={isFlipped} />
                  <div className="mt-8 flex justify-center">
                    <button onClick={() => setIsFlipped(!isFlipped)} className="px-6 py-2 bg-white/5 border border-white/10 text-white/70 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      Rotate 3D View
                    </button>
                  </div>
                </div>
              </div>

              {/* Balance Predictor Dashboard */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-indigo-600"></i> LKR BALANCE PREDICTOR
                  </h3>
                  
                  {loadingAnalytics ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-16 bg-slate-100 rounded-2xl"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-slate-50 rounded-2xl"></div>
                        <div className="h-20 bg-slate-50 rounded-2xl"></div>
                      </div>
                    </div>
                  ) : analytics ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                      <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
                        <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Estimated Sri Lankan Card Balance</span>
                        <div className="text-3xl font-black mt-1 tracking-tighter">{analytics.estimatedBalanceLKR}</div>
                        <div className="mt-2 text-[10px] font-bold flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-white/20 rounded uppercase">Limit: {analytics.spendingLimitLKR}</span>
                           <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 rounded uppercase">{analytics.trustLevel} Reliability</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Sri Lanka Tier</span>
                          <div className="text-sm font-black text-slate-800 mt-1 uppercase">{analytics.cardTier}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase">CRIB Score Est.</span>
                          <div className="text-sm font-black text-slate-800 mt-1 uppercase">{analytics.creditScoreEquivalent}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Local Risk Level</span>
                           <span className={analytics.riskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}>{analytics.riskScore}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${analytics.riskScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${analytics.riskScore}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                        <i className="fa-solid fa-microchip text-2xl"></i>
                      </div>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Enter Full Card Details to<br/>Activate Sri Lankan AI Intelligence</p>
                    </div>
                  )}
                </div>
                
                {analytics && (
                  <div className="mt-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase italic">
                      <i className="fa-solid fa-circle-info"></i> Predictions are AI-simulated based on IIN Regional History. Not a live bank link.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk / Generator lists... (remained same for layout consistency) */}
            {(viewMode === 'bulk' && bulkResults.length > 0) || (viewMode === 'generator' && genResults.length > 0) ? (
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
                    <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">{viewMode === 'bulk' ? 'Validation Logs' : `Generated Inventory (${genResults.length})`}</h3>
                        <button onClick={() => viewMode === 'bulk' ? setBulkResults([]) : setGenResults([])} className="text-rose-500 font-black text-[10px] uppercase hover:underline">Purge All</button>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        {viewMode === 'bulk' ? (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white/95 backdrop-blur shadow-sm z-10">
                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-4">Account Holder / Bank</th>
                                        <th className="px-8 py-4">Security Status</th>
                                        <th className="px-8 py-4 text-right">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {bulkResults.map((res, i) => (
                                        <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-slate-800">{res.holder}</p>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                   <div className="flex items-center gap-2">
                                                      <p className="text-xs mono font-bold text-slate-400">{res.number.substring(0, 4)} •••• {res.number.slice(-4)}</p>
                                                      <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">{res.issuer}</span>
                                                   </div>
                                                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tight">
                                                     {res.country || 'Unknown'} {res.bank ? `// ${res.bank}` : ''}
                                                   </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${res.isValid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                  {res.isValid ? 'SECURE' : 'THREAT / INVALID'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => { setCardData({ ...res }); setViewMode('single'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center">
                                                  <i className="fa-solid fa-expand"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                                {genResults.map((res, i) => (
                                    <div key={i} className="bg-white p-6 hover:bg-indigo-50/50 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                           <div className="flex flex-col">
                                             <span className="text-xs font-black text-indigo-600 mono">{res.number}</span>
                                             <div className="flex gap-2 mt-1">
                                               <span className="text-[8px] font-black bg-slate-100 px-1.5 rounded uppercase">Exp {res.expiry}</span>
                                               <span className="text-[8px] font-black bg-slate-100 px-1.5 rounded uppercase">CVV {res.cvv}</span>
                                             </div>
                                           </div>
                                           <button onClick={() => { setCardData(res); setViewMode('single'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase">Load</button>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                           <span className="text-[10px] font-black text-slate-800 uppercase">{res.bank || 'Global Card'}</span>
                                           <div className="flex items-center gap-1.5">
                                             <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{res.country}</span>
                                             <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{res.tier || 'Classic'}</span>
                                           </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {viewMode === 'single' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <i className="fa-solid fa-gauge-high text-indigo-600"></i> LOCAL MARKET HEALTH METRICS
                  </h3>
                  <ValidationStats isValid={validation.isValid} luhnValid={validation.luhnValid} numberLength={cardData.number.replace(/\D/g, '').length} />
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <i className="fa-solid fa-brain text-indigo-600"></i> SRI LANKAN REGIONAL INSIGHTS
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loadingInsights ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-40">
                          <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
                          <div className="space-y-2">
                             <div className="h-2 bg-slate-50 rounded w-full"></div>
                             <div className="h-2 bg-slate-50 rounded w-5/6"></div>
                          </div>
                        </div>
                      ))
                    ) : insights.length > 0 ? (
                      insights.map((insight, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                              insight.type === 'security' ? 'bg-rose-50 text-rose-500' : 
                              insight.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                            }`}>
                              <i className={insight.type === 'security' ? 'fa-solid fa-shield-virus' : insight.type === 'info' ? 'fa-solid fa-circle-info' : 'fa-solid fa-star'}></i>
                            </div>
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">{insight.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{insight.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
                        <i className="fa-solid fa-fingerprint text-slate-200 text-5xl mb-6 block"></i>
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Awaiting Identity Input for Deep Scan</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-20 text-center text-slate-300 py-12 border-t border-slate-100">
          <div className="flex justify-center gap-6 mb-6">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-slate-900 text-white px-4 py-1.5 rounded-full">SRI LANKA COMPLIANT INTERFACE</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full">SECURED BY GEMINI PRO AI</span>
          </div>
          <p className="font-black text-[10px] uppercase tracking-tighter">© 2024 SECURECARD INSIGHT PRO. DEVELOPED FOR SRI LANKAN FINANCIAL DATA ANALYTICS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
