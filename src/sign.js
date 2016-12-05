/*
Initially a pollyfill for IE.
Exported as a function to be "ponyfill compliant"
(Does not rewrite default API) as per @mathisonian comment.
https://github.com/mathisonian/premonish/pull/3#issuecomment-264919893
*/
export const sign = function sign (x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return Number(x);
  }
  return x > 0 ? 1 : -1;
};
