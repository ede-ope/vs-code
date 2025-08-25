# Kui — VS Code language extension

Provides basic Kui language support:
- Syntax highlighting (keywords, types, strings, numbers, imports, classes, structs, enums)
- Language configuration (comments, brackets, auto-closing)
- Context-aware IntelliSense (imports, types, snippets, top-level constructs)

## Install / Test locally
1. Place this folder in e.g. `kui-vscode`.
2. Open in VS Code.
3. Press `F5` to run the Extension Development Host.
4. Create a file `example.kui` and test keywords, `lo "..."`, `àtiṣe` declarations.

## Notes
- Extension sets `[kui]` defaults to disable `wordBasedSuggestions` and hide other snippets so other languages (JS, etc.) don't pollute suggestions.
- Grammar uses Unicode-aware identifier rules so Yoruba diacritics are supported.

If you want deeper features (go-to-definition, real language server, diagnostics) I can help you scaffold a Language Server (LSP) next.
