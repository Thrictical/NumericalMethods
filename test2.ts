import { bisectionMethod } from './src/utils/numericalMethods.ts';
console.log(JSON.stringify(bisectionMethod("cos(x) - x", 0, 1)));
