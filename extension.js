const vscode = require('vscode');

const KEYWORDS = [
  "lo","àtiṣe","pe","kí","yí","sọ","ẹpín","ẹ̀wun","àkàsílẹ̀","pòòrì_tí","ṣe","fún","pàrọ̀","ẹjọ́","já","àìjẹ́bẹ̀","gbangba","àdáni","pìkí"
];

const TYPES = [
  "soso","aléfòó","àlọ́po","8w","16w","32w","64w","ìtó_w","8j","16j","32j","64j","ìtó_j",
  "àjámì","ọsán","ìdésì","pooro","àdájọ́","àkókò","atọ́kàa","ohun"
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
    KEYWORDS.filter(k => ["àtiṣe","lo","ẹpín","ẹ̀wun","kí"].includes(k)).forEach(k =>
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
    add('sọ (print)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('sọ ${1:expr};'), 'Print');
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
