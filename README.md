# markdown-ast

[![npm](https://img.shields.io/npm/v/markdown-ast.svg)](https://www.npmjs.com/package/markdown-ast)
[![Build status](https://travis-ci.org/aleclarson/markdown-ast.svg?branch=master)](https://travis-ci.org/aleclarson/markdown-ast)
[![Coverage status](https://coveralls.io/repos/github/aleclarson/markdown-ast/badge.svg?branch=master)](https://coveralls.io/github/aleclarson/markdown-ast?branch=master)
[![Bundle size](https://badgen.net/bundlephobia/min/markdown-ast)](https://bundlephobia.com/result?p=markdown-ast)
[![Install size](https://packagephobia.now.sh/badge?p=markdown-ast)](https://packagephobia.now.sh/result?p=markdown-ast)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alecdotbiz)

Fork of [snarkdown](https://github.com/developit/snarkdown) that returns an
array of AST nodes, instead of an HTML string.

TypeScript support included!

```ts
import md from 'markdown-ast'

const ast = md(code)
```

The goal is to support **Github-style markdown**.
Please file an issue if you run into any inconsistencies.

&nbsp;

## Notable behavior

- Node locations are _not_ tracked.
- No HTML parsing. Embedded HTML is plain text.
- Single `\n` chars are removed from the start/end of plain text.

&nbsp;

## Node types

Every node has a `type` property equal to one of these:

- `bold`: `__text__` or `**text**`
- `border`: 3+ character sequence of `[*-_]` w/ optional spaces between
- `break`: `\n\n` or `\r\n\r\n` or `\n` or `\r\n`
- `codeBlock`: triple backticks or 4-spaces/tab indented
- `codeSpan`: inline backticks
- `image`: `![alt](url)` or `![alt][key]` or just `![altAsKey]`
- `italic`: `_text_` or `*text*`
- `link`: `[text](url)` or `[text][key]` or just `[textAsKey]`
- `linkDef`: `[key]: url`
- `list`: markdown w/ `[-+*]|\d+[\.\)]` prefix
- `quote`: markdown w/ `>` prefix
- `strike`: `~~text~~`
- `text`
- `title`: markdown w/ `#{1,6}` prefix or underlined w/ 3+ `=|-` symbols

Available properties are defined [here](./index.d.ts).

&nbsp;

## Block nodes

"Block nodes" have a `block` property containing any nested nodes. Blocks are
auto-closed when their parent block is closed (unless the nested block is
already closed, of course).

Some nodes (which may not be blocks) auto-close **all** open blocks. These
include `border`, `break`, `list`, `quote`, and `title` nodes.

"Inline blocks" can be used anywhere in the document. These include `bold`,
`codeSpan`, `image`, `italic`, `link`, and `strike` nodes.

"Recursive blocks" use their own parsing context to process any nested nodes.
These include `list`, `quote`, and `title` nodes.
