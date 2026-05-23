import * as math from 'mathjs';

export interface BisectionIteration {
  n: number;
  a: number;
  b: number;
  c: number;
  fa: number;
  fb: number;
  fc: number;
}

export interface SecantIteration {
  n: number;
  x0: number;
  x1: number;
  x2: number;
  fx2: number;
}

export interface NewtonIteration {
  n: number;
  x0: number;
  fx0: number;
  dfx0: number;
  x1: number;
  fx1: number;
}

export interface MethodResult<T> {
  iterations: T[];
  root: number | null;
  rootVal: number | null;
  error: string | null;
}

function evaluateFunction(compiledFunc: math.EvalFunction, x: number): number {
  return compiledFunc.evaluate({ x });
}

// Numerical derivative using central difference
function evaluateDerivative(compiledFunc: math.EvalFunction, x: number): number {
  const h = 1e-5;
  const fPlus = evaluateFunction(compiledFunc, x + h);
  const fMinus = evaluateFunction(compiledFunc, x - h);
  return (fPlus - fMinus) / (2.0 * h);
}

export function bisectionMethod(funcStr: string, a: number, b: number, tol: number = 1e-10, maxIter: number = 1000): MethodResult<BisectionIteration> {
  const result: MethodResult<BisectionIteration> = {
    iterations: [],
    root: null,
    rootVal: null,
    error: null,
  };

  let compiledFunc: math.EvalFunction;
  try {
    compiledFunc = math.compile(funcStr);
  } catch (err: any) {
    result.error = `Invalid function: ${err.message}`;
    return result;
  }

  let fa = evaluateFunction(compiledFunc, a);
  let fb = evaluateFunction(compiledFunc, b);

  if (fa * fb > 0) {
    result.error = "Wrong interval: f(a) and f(b) must have opposite signs.";
    return result;
  }

  let mid = (a + b) / 2.0;
  let fmid = evaluateFunction(compiledFunc, mid);
  let n = 1;

  result.iterations.push({ n, a, b, c: mid, fa, fb, fc: fmid });

  while (Math.abs(fmid) > tol && Math.abs(b - a) > tol && n < maxIter) {
    if (fa * fmid > 0) {
      a = mid;
      fa = fmid; // Optimization
    } else {
      b = mid;
      fb = fmid; // Optimization
    }
    n++;
    mid = (a + b) / 2.0;
    fmid = evaluateFunction(compiledFunc, mid);
    result.iterations.push({ n, a, b, c: mid, fa, fb, fc: fmid });
  }

  result.root = mid;
  result.rootVal = fmid;
  return result;
}

export function secantMethod(funcStr: string, x0: number, x1: number, tol: number = 1e-10, maxIter: number = 1000): MethodResult<SecantIteration> {
  const result: MethodResult<SecantIteration> = {
    iterations: [],
    root: null,
    rootVal: null,
    error: null,
  };

  let compiledFunc: math.EvalFunction;
  try {
    compiledFunc = math.compile(funcStr);
  } catch (err: any) {
    result.error = `Invalid function: ${err.message}`;
    return result;
  }

  let n = 0;
  let x2 = 0;

  while (n < maxIter) {
    const fx0 = evaluateFunction(compiledFunc, x0);
    const fx1 = evaluateFunction(compiledFunc, x1);

    if (Math.abs(fx1 - fx0) < 1e-15) {
      result.error = "Error: Division by zero. Method fails.";
      break;
    }

    x2 = x1 - fx1 * ((x1 - x0) / (fx1 - fx0));
    const fx2 = evaluateFunction(compiledFunc, x2);
    n++;
    
    result.iterations.push({ n, x0, x1, x2, fx2 });

    if (Math.abs(x2 - x1) <= tol || Math.abs(fx2) <= tol) {
      break;
    }

    x0 = x1;
    x1 = x2;
  }

  if (!result.error) {
    result.root = x2;
    result.rootVal = evaluateFunction(compiledFunc, x2);
  }
  return result;
}

export function newtonRaphsonMethod(funcStr: string, x0: number, tol: number = 1e-10, maxIter: number = 1000): MethodResult<NewtonIteration> {
  const result: MethodResult<NewtonIteration> = {
    iterations: [],
    root: null,
    rootVal: null,
    error: null,
  };

  let compiledFunc: math.EvalFunction;
  try {
    compiledFunc = math.compile(funcStr);
  } catch (err: any) {
    result.error = `Invalid function: ${err.message}`;
    return result;
  }

  let n = 0;
  let x1 = 0;

  while (n < maxIter) {
    const fx0 = evaluateFunction(compiledFunc, x0);
    const dfx0 = evaluateDerivative(compiledFunc, x0);

    if (Math.abs(dfx0) < 1e-15) {
      result.error = "Error: Derivative is near zero. Method fails.";
      break;
    }

    x1 = x0 - (fx0 / dfx0);
    const fx1 = evaluateFunction(compiledFunc, x1);
    n++;

    result.iterations.push({ n, x0, fx0, dfx0, x1, fx1 });

    if (Math.abs(x1 - x0) <= tol || Math.abs(fx1) <= tol) {
      break;
    }

    x0 = x1;
  }

  if (!result.error) {
    result.root = x1;
    result.rootVal = evaluateFunction(compiledFunc, x1);
  }
  return result;
}
