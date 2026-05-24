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

// Logic has been moved to the C++ backend (NumericalMomen_api.cpp)
// This file now only provides types for the frontend.
