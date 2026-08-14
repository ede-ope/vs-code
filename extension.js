const vscode = require('vscode');

const KEYWORDS = [
  "lo", "mú", "gẹ́gẹ́bíi", "òṣìṣẹ́", "itú", "adágún", "kí", "ní", "yí", "kó",
  "kọ", "ka", "kékeré", "àjọ",
  "apẹ̀rẹ̀", "pòrì", "tí", "ṣe", "sí", "fún", "ré", "já", "wo",
  "àìjẹ́bẹ̀", "gbangba", "àdáni", "kárí", "jọmọ́", "òwun", "níwọ̀bí", "níbàámu",
  "tóyí", "látòde", "afárá", "àfijọ", "ju", "hàn", "gbìyànjú", "hán",
  "látinú", "túmọ̀", "ogún", "jogún", "pitú", "àbájáde", "àìwí",
  "x86_64", "arm", "windows", "linux", "mac", "pẹpẹ",
  "dúróde", "bẹ̀rẹ̀", "tàṣé", "máa_ṣa", "ry", "àfipè", "ìtúpayá"
];

const TYPES = [
  "8d", "16d", "32d", "64d", "128d", "àtó_d", "8p", "16p", "32p", "64p", "128p", "àtó_p",
  "8b", "16b", "32b", "64b", "128b", "àtó_b", "òtítọ́", "irọ́", "bóyá", "agbede",
  "àkàyọ", "ọsán", "ǹjẹ́", "ibùta", "ibùrin", "òfìfo",
  "àṣàyàn", "àyọrísí"
];

function provideContextualCompletions(document, position) {
  const items = [];

  const line = document.lineAt(position);
  const before = line.text.slice(0, position.character);
  const trimmed = before.trimEnd();

  // Helper to push completion with kind and optional snippet
  function add(label, kind, insertText, detail) {
    const it = new vscode.CompletionItem(label, kind);
    if (insertText) it.insertText = insertText;
    if (detail) it.detail = detail;
    return items.push(it);
  }

  // If start of line or first non-whitespace char -> suggest top-level keywords
  if (/^\s*$/.test(before) || /^\s*[^\S\r\n]*$/.test(before)) {
    KEYWORDS.filter(k => ["pitú","lo","apẹ̀rẹ̀","àjọ","kí","látinú"].includes(k)).forEach(k =>
      add(k, vscode.CompletionItemKind.Keyword, k, "Kui top-level keyword")
    );
    // Add import snippet
    add('lo "module.kui"', vscode.CompletionItemKind.Module, new vscode.SnippetString('lo "${1:module.kui}"${2: ? alias};'), 'Import module');
  }

  // If just typed `lo` or line starts with lo -> import suggestions
  if (/^\s*lo\s+["']?[^"']*$/.test(before)) {
    add('"module.kui"', vscode.CompletionItemKind.File, new vscode.SnippetString('"${1:module.kui}"'), 'Module path');
    add('ìṣirò', vscode.CompletionItemKind.Module, 'ìṣirò', 'Standard library');
  }

  // If inside param parentheses (rough check for '(' before without ')')
  if (before.lastIndexOf('(') > before.lastIndexOf(')')) {
    // Suggest parameter pattern: identifier + type
    add('paramName soso', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('${1:paramName} ${2|'+TYPES.join(',')+'|}'), 'Parameter (name type)');
    // Suggest types
    TYPES.forEach(t => add(t, vscode.CompletionItemKind.TypeParameter, t, 'Type'));
  }

  // Inside a block: suggest variable/print/loops
  if (/{\s*$/.test(before) || /^\s*[^\n]*\{\s*$/.test(before)) {
    add('kí (variable)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('kí ${1:soso} ${2:name} : ${3:expr};'), 'Variable declaration');
    add('kọ (print)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('òǹsọ ${1:expr};'), 'Print');
    add('pòrì (loop)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('pòrì (${1:cond}) {\n\t$0\n}'), 'loop');
  }

  // Always include all keywords but as lower-priority suggestions
  KEYWORDS.forEach(k => items.push(new vscode.CompletionItem(k, vscode.CompletionItemKind.Keyword)));

  // Types as separate suggestions
  TYPES.forEach(t => items.push(new vscode.CompletionItem(t, vscode.CompletionItemKind.TypeParameter)));

  return items;
}

function activate(context) {
  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'kui' },
    {
      provideCompletionItems(document, position) {
        try {
          return provideContextualCompletions(document, position);
        } catch (err) {
          console.error('Kui completion error', err);
          return [];
        }
      }
    },
    // trigger characters (letters, colon, whitespace, quotes, parentheses)
    '.', ' ', '(', '"', '\'', ':', '>'
  );

  context.subscriptions.push(provider);
}

function deactivate() {}

module.exports = { activate, deactivate };
