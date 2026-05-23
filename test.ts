import { bisectionMethod, secantMethod } from './src/utils/numericalMethods.ts';
console.log(JSON.stringify(secantMethod("cos(x) - x", 0, 1)));
