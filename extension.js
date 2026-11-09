const vscode = require('vscode');

const KEYWORDS = [
    "iṣẹ́", "lo", "mú", "pèéní", "bíi", "òṣìṣẹ́", "adágún", "kí", "ní", "yí", "kó",
    "kọ", "ka", "àgánkọ", "ìrísí",
    "apẹ̀rẹ̀", "pòrì", "tí", "ṣe", "sí", "fún", "ré", "já", "wo",
    "àìjẹ́bẹ̀", "gbangba", "àdáni", "kárí", "jọmọ́", "òwun", "níwọ̀bí", "níbàámu",
    "tóyí", "látòde", "afárá", "àfijọ", "ju", "síta", "sóde", "gbìyànjú", "hán",
    "látinú", "túmọ̀", "ogún", "jogún", "àbájáde", "àìwí",
    "km", "ẹ̀rọ",
    "dúróde", "bẹ̀rẹ̀", "tàṣé", "máa_ṣa", "ry", "àfipè", "ìtúpayá",
];

const TYPES = [
    "d8", "d16", "d32", "d64", "d128", "àtó_d", "p8", "p16", "p32", "p64", "p128", "àtó_p",
    "b8", "b16", "b32", "b64", "b128", "àtó_b", "òtítọ́", "irọ́", "àìmọ̀", "agbede", ,
    "wóró", "ọsán", "ǹjẹ́", "ibùta", "ibùrin", "òfìfo", "òpin",
    "Àṣàyàn", "Àyọrísí"
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
        KEYWORDS.filter(k => ["iṣẹ́", "mú", "lo", "apẹ̀rẹ̀", "ìrísí", "kí", "àfijọ", "òṣìṣẹ́"].includes(k)).forEach(k =>
            add(k, vscode.CompletionItemKind.Keyword, k, "Ope top-level keyword")
        );
        // Add import snippet
        add('lo "module.ope": alias', vscode.CompletionItemKind.Module, new vscode.SnippetString('lo "${1:module.ope}"${2: ? alias};'), 'Import module');
    }

    // If just typed `lo` or line starts with lo -> import suggestions
    if (/^\s*lo\s+["']?[^"']*$/.test(before)) {
        add('"module.ope"', vscode.CompletionItemKind.File, new vscode.SnippetString('"${1:module.ope}"'), 'Module path');
        add('ìṣirò', vscode.CompletionItemKind.Module, 'ìṣirò', 'Standard library');
    }

    // If inside param parentheses (rough check for '(' before without ')')
    if (before.lastIndexOf('(') > before.lastIndexOf(')')) {
        // Suggest parameter pattern: identifier + type
        add('paramName soso', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('${1:paramName} ${2|' + TYPES.join(',') + '|}'), 'Parameter (type it)');
        // Suggest types
        TYPES.forEach(t => add(t, vscode.CompletionItemKind.TypeParameter, t, 'Type'));
    }

    // Inside a block: suggest variable/print/loops
    if (/{\s*$/.test(before) || /^\s*[^\n]*\{\s*$/.test(before)) {
        add('kí (variable)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('kí ${1:types} ${2:ident} : ${3:expr};'), 'Variable declaration');
        // add('kọ (print)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('òǹsọ ${1:expr};'), 'Print');
        add('pòrì (loop)', vscode.CompletionItemKind.Snippet, new vscode.SnippetString('pòrì (${1:cond}) {\n\t$0\n}'), 'loop');
    }

    // Always include all keywords but as lower-priority suggestions
    KEYWORDS.forEach(k => items.push(new vscode.CompletionItem(k, vscode.CompletionItemKind.Keyword)));

    // Types as separate suggestions
    TYPES.forEach(t => items.push(new vscode.CompletionItem(t, vscode.CompletionItemKind.TypeParameter)));

    return items;
}

function activate(context) {
    const provider = vscode.languages.registerCompletionItemProvider({ language: 'ope' }, {
            provideCompletionItems(document, position) {
                try {
                    return provideContextualCompletions(document, position);
                } catch (err) {
                    console.error('Ope completion error', err);
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