/**
 * Tiny arithmetic evaluator for derivation expressions such as
 * "{esg25-freight-logistics} / {f1-rounds-2025}". Supports + - * / and
 * parentheses over numbers and {id} references. No eval().
 */

type Token = { t: "num"; v: number } | { t: "op"; v: string };

function tokenize(expr: string, lookup: (id: string) => number): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " ") {
      i++;
    } else if (c === "{") {
      const end = expr.indexOf("}", i);
      if (end === -1) throw new Error(`Unclosed reference in "${expr}"`);
      tokens.push({ t: "num", v: lookup(expr.slice(i + 1, end)) });
      i = end + 1;
    } else if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push({ t: "num", v: Number(expr.slice(i, j)) });
      i = j;
    } else if ("+-*/()".includes(c)) {
      tokens.push({ t: "op", v: c });
      i++;
    } else {
      throw new Error(`Unexpected "${c}" in "${expr}"`);
    }
  }
  return tokens;
}

export function evaluate(expr: string, lookup: (id: string) => number): number {
  const tokens = tokenize(expr, lookup);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function primary(): number {
    const tok = next();
    if (!tok) throw new Error(`Unexpected end of "${expr}"`);
    if (tok.t === "num") return tok.v;
    if (tok.v === "(") {
      const v = sum();
      const close = next();
      if (!close || close.v !== ")") throw new Error(`Missing ) in "${expr}"`);
      return v;
    }
    if (tok.v === "-") return -primary();
    throw new Error(`Unexpected "${tok.v}" in "${expr}"`);
  }
  function product(): number {
    let v = primary();
    for (let tok = peek(); tok && tok.t === "op" && (tok.v === "*" || tok.v === "/"); tok = peek()) {
      next();
      const rhs = primary();
      v = tok.v === "*" ? v * rhs : v / rhs;
    }
    return v;
  }
  function sum(): number {
    let v = product();
    for (let tok = peek(); tok && tok.t === "op" && (tok.v === "+" || tok.v === "-"); tok = peek()) {
      next();
      const rhs = product();
      v = tok.v === "+" ? v + rhs : v - rhs;
    }
    return v;
  }

  const result = sum();
  if (pos !== tokens.length) throw new Error(`Trailing tokens in "${expr}"`);
  return result;
}

/** Round to a sensible number of significant figures for display and storage. */
export function roundSig(value: number, sig = 4): number {
  if (value === 0) return 0;
  const mag = Math.floor(Math.log10(Math.abs(value)));
  const factor = 10 ** (sig - 1 - mag);
  return Math.round(value * factor) / factor;
}
