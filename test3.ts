import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const formatScientific = (num: number | undefined | null) => {
  if (num == null) return '';
  const absNum = Math.abs(num);
  if (absNum === 0 || (absNum >= 0.0001 && absNum < 10000)) {
    return num.toFixed(6);
  }
  const expStr = num.toExponential(4);
  if (!expStr.includes('e')) return expStr;
  const [base, exp] = expStr.split('e');
  const exponent = parseInt(exp, 10);
  return React.createElement('span', null, 
    base, " \u00d7 10", React.createElement('sup', null, exponent)
  );
};

console.log(renderToStaticMarkup(formatScientific(4.633871064640971e-11)));
