const returnTrue = () => true

// Returns true when the given string ends with an unescaped escape.
const isEscaped = str => {
  let ESCAPE = '\\'.charCodeAt(0),
    i = str.length,
    n = 0
  while (i && str.charCodeAt(--i) === ESCAPE) n++
  return n % 2 == 1
}

// Escape-aware string search.
const search = (input, target, cursor) => {
  let i = cursor - 1
  while (true) {
    let start = i
    i = input.indexOf(target, i + 1)
    if (i < 0) return -1
    if (!isEscaped(input.slice(start, i))) return i
  }
}

/** Convert markdown into a syntax tree */
const parse = (input, top = []) => {
  // Stack of unclosed nodes
  let blocks = []
  // The last added node
  let prevNode

  // Add text to the previous node if possible.
  // Otherwise, create a new text node and pass it to `addNode`.
  let addText = text =>
    prevNode && prevNode.type == 'text'
      ? ((prevNode.text += text), prevNode)
      : addNode({ type: 'text', text })

  // Add a node to the current block.
  let addNode = node => {
    let len = blocks.length
    ;(len ? blocks[len - 1].block : top).push(node)
    return (prevNode = node)
  }

  let addBlock = node => {
    // Ensure links are closed properly.
    if (node.type == 'link')
      node = { type: 'link', block: node.block, url: '', ref: '' }

    return addNode(node)
  }

  // Gracefully close any unclosed nodes (as long as `filter` returns truthy).
  let flush = (filter = returnTrue) => {
    for (let i = blocks.length; --i >= 0; ) {
      let node = blocks[i]
      if (!filter(node)) return node
      addBlock(blocks.pop())
    }
  }

  // Move the cursor and update the lexer.
  let moveTo = offset => (lexer.lastIndex = cursor = offset)

  // The primary token scanner
  let lexer = /(^([*_-])\s*\2(?:\s*\2)+$)|(?:^(\s*)([>*+-]|\d+[.\)])\s+)|(?:^``` *(\w*)\n([\s\S]*?)```$)|(^(?:(?:\t|    )[^\n]*(?:\n|$))+)|(\!?\[)|(\](?:(\(|\[)|\:\s*(.+)$)?)|(?:^([^\s].*)\n(\-{3,}|={3,})$)|(?:^(#{1,6})(?:[ \t]+(.*))?$)|(?:`([^`].*?)`)|(  \n|\n\n)|(__|\*\*|[_*]|~~)/gm
  let cursor = 0
  while (true) {
    let match = lexer.exec(input),
      matchOffset = match ? match.index : input.length

    // Copy text between this match and the last.
    let text = input.slice(cursor, matchOffset)
    if (text) {
      addText(text)

      // Skip escaped matches.
      if (match && isEscaped(text)) {
        moveTo(match.index + 1)
        addText(match[0][0])
        continue
      }
    }

    if (!match) break
    let i = 1

    // Move the cursor _after_ this match.
    cursor = lexer.lastIndex

    // Borders (-0 to +1)
    if (match[i]) {
      flush()
      addNode({
        type: 'border',
        text: input.slice(matchOffset, matchOffset + match[0].length),
      })
    }

    // Quotes and lists (-1 to +0)
    else if (match[(i += 3)]) {
      flush()

      let bullet = match[i]
      let isQuote = bullet == '>'
      let node = isQuote
        ? addNode({
            type: 'quote',
            block: [],
          })
        : addNode({
            type: 'list',
            block: [],
            indent: match[i - 1],
            bullet,
          })

      // This looks for block-closing lines.
      let breakRE = isQuote
        ? /^\s{0,3}([*+-]|\d+[.\)])[ \t]/
        : /^\s*([>*+-]|\d+[.\)])[ \t]/

      // Find where the first line ends.
      let start = cursor
      cursor = search(input, '\n', start)
      if (cursor < 0) cursor = input.length

      // Parse multi-line blocks.
      let content = input.slice(start, cursor)
      while (cursor < input.length) {
        let start = cursor + 1
        // Look for "\n\n" break node.
        if (input.charAt(start) == '\n') break

        // Find where the current line ends.
        cursor = search(input, '\n', start)
        if (cursor < 0) cursor = input.length

        // Slice after "> " and before "\n"
        let line = input.slice(start, cursor)

        // Avoid swallowing EOF newline.
        if (!line) {
          cursor = start - 1
          break
        }

        // When a line starts with a list/quote node, avoid parsing it here.
        if (line.match(breakRE)) {
          cursor = start
          break
        }

        content +=
          '\n' + line.match(isQuote ? /^\s*>?\s*(.*)$/ : /^\s*(.*)$/)[1]
      }

      parse(content, node.block)
      moveTo(cursor)
    }

    // Code blocks: (-1 to +1)
    else if (match[(i += 2)] != null || match[i + 1]) {
      flush()

      let code = match[i + 1],
        syntax = '',
        indent = ''

      // Indented code
      if (code) {
        indent = /^(\t|    )/.exec(code)[0]
        code = code.replace(/^(\t|    )/gm, '')

        // Avoid capturing the final newline.
        if (code.slice(-1) == '\n') {
          code = code.slice(0, -1)
          moveTo(cursor - 1)
        }
      }
      // Fenced code
      else {
        // Omit the final newline.
        code = match[i].slice(0, -1)
        syntax = match[i - 1].toLowerCase()
      }

      addNode({
        type: 'codeBlock',
        code,
        syntax,
        indent,
      })
    }

    // Images / Links (-0 to +0)
    else if (match[(i += 2)]) {
      if (match[i][0] == '!') {
        // Find the closing bracket.
        let endOffset = search(input, ']', cursor)
        if (endOffset < 0) {
          addText(match[0])
          continue
        }

        // Images are _not_ actually blocks. We treat it as one temporarily so
        // we can reuse code between images and links.
        prevNode = null
        blocks.push({
          type: 'image',
          alt: input.slice(match.index + 2, endOffset),
          url: '',
          ref: '',
        })

        // Process the "]" next.
        moveTo(endOffset)
      }
      // Create a link node.
      else {
        prevNode = null
        blocks.push({
          type: 'link',
          block: [],
          offset: cursor,
        })
      }
    }
    // Closing bracket (-0 to +2)
    else if (match[++i]) {
      let nodeTypes = /^(link|image)$/
      let node = flush(block => !nodeTypes.test(block.type))
      if (node) {
        blocks.pop()

        // [foo]: bar
        if (match[i + 2]) {
          if (node.type == 'link') {
            addNode({
              type: 'linkDef',
              key: input.slice(node.offset, matchOffset),
              url: match[i + 2],
            })
            continue
          }
          moveTo(match.index + 1) // "]".length
        }

        node = addBlock(node)

        // [foo](bar) or [foo][bar]
        if (match[i + 1]) {
          // Find the closing bracket.
          let endOffset = search(input, match[i + 1] == '(' ? ')' : ']', cursor)
          if (endOffset < 0) {
            addText(match[i + 1])
          } else {
            let startOffset = match.index + 2 // "](".length
            let target = input.slice(startOffset, endOffset)
            moveTo(endOffset + 1) // ")".length

            // [foo](bar)
            if (match[i + 1] == '(') {
              node.url = target
            }
            // [foo][bar]
            else {
              node.ref = target
            }
          }
        }
      } else {
        addText(match[0])
      }
    }

    // Titles (-0 to +3)
    else if (match[(i += 3)] || match[i + 2]) {
      flush()
      addNode({
        type: 'title',
        block: parse(match[i] || match[i + 3] || ''),
        rank: match[i + 2]
          ? match[i + 2].length
          : match[i + 1][0] == '='
          ? 1
          : 2,
      })
    }

    // Code spans (-0 to +0)
    else if (match[(i += 4)]) {
      let codeOffset = matchOffset + 1
      addNode({
        type: 'codeSpan',
        code: input.slice(codeOffset, codeOffset + match[i].length),
      })
    }

    // Breaks (-0 to +0)
    else if (match[++i]) {
      flush()
      addNode({ type: 'break', text: match[0] })
    }

    // Inline formatting (-0 to +0)
    else if (match[++i]) {
      let style = match[i]
      let type = style.length < 2 ? 'italic' : style == '~~' ? 'strike' : 'bold'

      // Close a matching block..
      let node = blocks[blocks.length - 1]
      if (node && node.type == type && node.style == style) {
        addNode(blocks.pop())
      }
      // ..or open a new block.
      else {
        prevNode = null
        blocks.push({
          type,
          block: [],
          style,
        })
      }
    }
  }

  flush()
  return top
}

Object.defineProperty(parse, 'default', { value: parse })
module.exports = parse
