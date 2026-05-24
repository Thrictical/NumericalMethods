import { useState } from 'react';
import type { ReactNode } from 'react';
import type {
  BisectionIteration,
  SecantIteration,
  NewtonIteration,
  MethodResult
} from './utils/numericalMethods';
import { Calculator, Play, AlertCircle } from 'lucide-react';

type MethodType = 'bisection' | 'secant' | 'newton';

const formatScientific = (num: number | undefined | null): ReactNode => {
  if (num == null) return '';
  const absNum = Math.abs(num);
  if (absNum === 0 || (absNum >= 0.0001 && absNum < 10000)) {
    return num.toFixed(6); // use standard notation for normal numbers
  }
  const expStr = num.toExponential(4);
  if (!expStr.includes('e')) return expStr;
  const [base, exp] = expStr.split('e');
  const exponent = parseInt(exp, 10);
  return (
    <span>
      {base} &times; 10<sup>{exponent}</sup>
    </span>
  );
};

function App() {
  const [funcStr, setFuncStr] = useState('cos(x) - x');
  const [method, setMethod] = useState<MethodType>('bisection');
  
  // Method parameters
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(1);
  const [x0, setX0] = useState<number>(0);
  const [x1, setX1] = useState<number>(1);
  
  // Results
  const [bisectionRes, setBisectionRes] = useState<MethodResult<BisectionIteration> | null>(null);
  const [secantRes, setSecantRes] = useState<MethodResult<SecantIteration> | null>(null);
  const [newtonRes, setNewtonRes] = useState<MethodResult<NewtonIteration> | null>(null);

  const handleCalculate = async () => {
    // Clear previous results
    setBisectionRes(null);
    setSecantRes(null);
    setNewtonRes(null);

    if (!funcStr.trim()) {
      const errorResult = { iterations: [], root: null, rootVal: null, error: 'Please Enter a Valid Method' };
      if (method === 'bisection') setBisectionRes(errorResult);
      else if (method === 'secant') setSecantRes(errorResult);
      else if (method === 'newton') setNewtonRes(errorResult);
      return;
    }

    const queryParams = new URLSearchParams({
      method,
      func: funcStr,
      a: a.toString(),
      b: b.toString(),
      x0: x0.toString(),
      x1: x1.toString(),
    });

    try {
      const response = await fetch(`http://localhost:3001/api/calculate?${queryParams}`);
      const result = await response.json();

      if (method === 'bisection') {
        setBisectionRes(result);
      } else if (method === 'secant') {
        setSecantRes(result);
      } else if (method === 'newton') {
        setNewtonRes(result);
      }
    } catch (error) {
      console.error('Failed to fetch calculation from backend:', error);
      const errorResult = { iterations: [], root: null, rootVal: null, error: 'Failed to connect to backend' };
      if (method === 'bisection') setBisectionRes(errorResult);
      else if (method === 'secant') setSecantRes(errorResult);
      else if (method === 'newton') setNewtonRes(errorResult);
    }
  };

  const currentError = 
    method === 'bisection' ? bisectionRes?.error :
    method === 'secant' ? secantRes?.error :
    newtonRes?.error;

  const currentRoot = 
    method === 'bisection' ? bisectionRes?.root :
    method === 'secant' ? secantRes?.root :
    newtonRes?.root;

  const currentRootVal = 
    method === 'bisection' ? bisectionRes?.rootVal :
    method === 'secant' ? secantRes?.rootVal :
    newtonRes?.rootVal;

  const iterationCount = 
    method === 'bisection' ? bisectionRes?.iterations.length :
    method === 'secant' ? secantRes?.iterations.length :
    newtonRes?.iterations.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black text-purple-50 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center space-x-3 pb-6 border-b border-purple-800/50">
          <Calculator className="w-8 h-8 text-fuchsia-400" />
          <h1 className="text-3xl font-bold text-white">Numerical Methods Calculator</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <div className="md:col-span-1 bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Function f(x)</label>
              <input 
                type="text" 
                value={funcStr}
                onChange={(e) => setFuncStr(e.target.value)}
                className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent focus:outline-none"
                placeholder="e.g., cos(x) - x"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value as MethodType)}
                className="w-full px-4 py-2 bg-black/30 border border-purple-500/30 text-white rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent focus:outline-none [&>option]:bg-purple-900"
              >
                <option value="bisection">Bisection Method</option>
                <option value="secant">Secant Method</option>
                <option value="newton">Newton-Raphson Method</option>
              </select>
            </div>

            {/* Dynamic Inputs */}
            <div className="space-y-4 pt-2 border-t border-purple-800/50">
              {method === 'bisection' && (
                <>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">Interval Start (a)</label>
                    <input type="number" value={a} onChange={e => setA(Number(e.target.value))} className="w-full px-3 py-1.5 bg-black/30 border border-purple-500/30 text-white rounded-md focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">Interval End (b)</label>
                    <input type="number" value={b} onChange={e => setB(Number(e.target.value))} className="w-full px-3 py-1.5 bg-black/30 border border-purple-500/30 text-white rounded-md focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" />
                  </div>
                </>
              )}

              {method === 'secant' && (
                <>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">First Guess (x0)</label>
                    <input type="number" value={x0} onChange={e => setX0(Number(e.target.value))} className="w-full px-3 py-1.5 bg-black/30 border border-purple-500/30 text-white rounded-md focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">Second Guess (x1)</label>
                    <input type="number" value={x1} onChange={e => setX1(Number(e.target.value))} className="w-full px-3 py-1.5 bg-black/30 border border-purple-500/30 text-white rounded-md focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" />
                  </div>
                </>
              )}

              {method === 'newton' && (
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Initial Guess (x0)</label>
                  <input type="number" value={x0} onChange={e => setX0(Number(e.target.value))} className="w-full px-3 py-1.5 bg-black/30 border border-purple-500/30 text-white rounded-md focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" />
                </div>
              )}
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full flex items-center justify-center space-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-fuchsia-500/20"
            >
              <Play className="w-4 h-4" />
              <span>Calculate</span>
            </button>
            
            <div className="text-center pt-2">
              <p className="text-xs text-purple-300/50 uppercase tracking-widest">
                Made by <span className="text-fuchsia-400/80 font-medium">Momen</span> & <span className="text-fuchsia-400/80 font-medium">Mamdouh</span>
              </p>
            </div>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-2 space-y-6">
            
            {currentError && (
              <div className="bg-red-900/40 text-red-200 p-4 rounded-lg flex items-start space-x-3 border border-red-500/30 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                <p>{currentError}</p>
              </div>
            )}

            {currentRoot !== null && currentRoot !== undefined && (
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-fuchsia-500/30">
                <h3 className="text-sm font-semibold text-fuchsia-300 uppercase tracking-wider mb-2">Result Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-300/70">Root Found (x)</p>
                    <p className="text-xl font-mono font-medium text-white">{currentRoot.toFixed(10)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300/70">f(x) Value</p>
                    <p className="text-xl font-mono font-medium text-white">{formatScientific(currentRootVal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300/70">Total Iterations</p>
                    <p className="text-xl font-mono font-medium text-white">{iterationCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Iteration Tables */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-black/20">
                <h3 className="font-semibold text-purple-100">Iteration Steps</h3>
              </div>
              <div className="overflow-x-auto">
                {method === 'bisection' && bisectionRes?.iterations && (
                  <table className="w-full text-sm text-left text-purple-100 font-mono">
                    <thead className="text-xs text-fuchsia-200 uppercase bg-purple-950/50">
                      <tr>
                        <th className="px-4 py-3">n</th>
                        <th className="px-4 py-3">a</th>
                        <th className="px-4 py-3">b</th>
                        <th className="px-4 py-3">c</th>
                        <th className="px-4 py-3">f(a)</th>
                        <th className="px-4 py-3">f(b)</th>
                        <th className="px-4 py-3">f(c)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bisectionRes.iterations.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2">{row.n}</td>
                          <td className="px-4 py-2">{row.a.toFixed(8)}</td>
                          <td className="px-4 py-2">{row.b.toFixed(8)}</td>
                          <td className="px-4 py-2 font-medium text-fuchsia-400">{row.c.toFixed(8)}</td>
                          <td className="px-4 py-2">{formatScientific(row.fa)}</td>
                          <td className="px-4 py-2">{formatScientific(row.fb)}</td>
                          <td className="px-4 py-2">{formatScientific(row.fc)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {method === 'secant' && secantRes?.iterations && (
                  <table className="w-full text-sm text-left text-purple-100 font-mono">
                    <thead className="text-xs text-fuchsia-200 uppercase bg-purple-950/50">
                      <tr>
                        <th className="px-4 py-3">n</th>
                        <th className="px-4 py-3">x0</th>
                        <th className="px-4 py-3">x1</th>
                        <th className="px-4 py-3">x2</th>
                        <th className="px-4 py-3">f(x2)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {secantRes.iterations.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2">{row.n}</td>
                          <td className="px-4 py-2">{row.x0.toFixed(8)}</td>
                          <td className="px-4 py-2">{row.x1.toFixed(8)}</td>
                          <td className="px-4 py-2 font-medium text-fuchsia-400">{row.x2.toFixed(8)}</td>
                          <td className="px-4 py-2">{formatScientific(row.fx2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {method === 'newton' && newtonRes?.iterations && (
                  <table className="w-full text-sm text-left text-purple-100 font-mono">
                    <thead className="text-xs text-fuchsia-200 uppercase bg-purple-950/50">
                      <tr>
                        <th className="px-4 py-3">n</th>
                        <th className="px-4 py-3">x0</th>
                        <th className="px-4 py-3">f(x0)</th>
                        <th className="px-4 py-3">f'(x0)</th>
                        <th className="px-4 py-3">x1</th>
                        <th className="px-4 py-3">f(x1)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newtonRes.iterations.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2">{row.n}</td>
                          <td className="px-4 py-2">{row.x0.toFixed(8)}</td>
                          <td className="px-4 py-2">{formatScientific(row.fx0)}</td>
                          <td className="px-4 py-2">{formatScientific(row.dfx0)}</td>
                          <td className="px-4 py-2 font-medium text-fuchsia-400">{row.x1.toFixed(8)}</td>
                          <td className="px-4 py-2">{formatScientific(row.fx1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                
                {!bisectionRes && !secantRes && !newtonRes && (
                  <div className="p-8 text-center text-purple-300/50 text-sm">
                    Enter a function and click calculate to see iteration steps.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
