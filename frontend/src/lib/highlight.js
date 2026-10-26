// Tiny highlighters for the code panel. The listings are short and known, so a few regexes are
// enough and the bundle does not carry a full highlighting library.

const PSEUDO_KEYWORDS = new Set(['mientras', 'para', 'cada', 'si', 'sino', 'fin', 'de', 'no', 'y', 'o', 'en'])
const PSEUDO_TOKENS = /([\p{L}\p{N}_]+\([^)]*\)|[\p{L}]+|←|\[[^\]]*\])/u

const JAVA_KEYWORDS = new Set([
  'abstract', 'boolean', 'break', 'case', 'catch', 'char', 'class', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import', 'instanceof',
  'int', 'interface', 'long', 'new', 'package', 'private', 'protected', 'public', 'return', 'static', 'super',
  'switch', 'this', 'throw', 'throws', 'try', 'var', 'void', 'while', 'null', 'true', 'false',
])
const JAVA_TOKENS = /([A-Za-z_]\w*|\d+|"[^"]*"|\s+|.)/g

/** Splits a pseudocode line into [kind, text] pairs: kw, op, fn or plain. */
export function pseudocodeTokens(line) {
  return line.split(PSEUDO_TOKENS).filter(Boolean).map((part) => {
    if (PSEUDO_KEYWORDS.has(part)) return ['kw', part]
    if (part === '←') return ['op', part]
    if (/\w+\(/.test(part)) return ['fn', part]
    return ['plain', part]
  })
}

/** Splits a Java line into [kind, text] pairs: kw, type, fn, lit, punct or plain. */
export function javaTokens(line) {
  const parts = line.match(JAVA_TOKENS) ?? []
  return parts.map((part, i) => {
    if (JAVA_KEYWORDS.has(part)) return ['kw', part]
    if (/^[A-Z]\w*$/.test(part)) return ['type', part]
    if (/^[a-z_]\w*$/.test(part) && parts.slice(i + 1).find((p) => p.trim()) === '(') return ['fn', part]
    if (/^\d+$|^"/.test(part)) return ['lit', part]
    if (/^[^\w\s]$/.test(part)) return ['punct', part]
    return ['plain', part]
  })
}
