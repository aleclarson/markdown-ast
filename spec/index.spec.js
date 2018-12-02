const md = require('..')

test('preserves EOF newline', () => {
  expect(md('foo\n')).toMatchSnapshot()
  // List
  expect(md('- a\n- b\n')).toMatchSnapshot()
  // Title
  expect(md('# foo\n')).toMatchSnapshot()
  // Code block
  expect(md('```\nfoo\n```\n')).toMatchSnapshot()
})

describe('Bold', () => {
  test('star syntax', () => {
    expect(md('I **like** tiny libraries')).toMatchSnapshot()
  })

  test('underline syntax', () => {
    expect(md('I __like__ tiny libraries')).toMatchSnapshot()
  })

  test('wrapped in italic', () => {
    expect(md('_I like **tiny** libraries_')).toMatchSnapshot()
    expect(md('*I like **tiny** libraries*')).toMatchSnapshot()
    expect(md('_I like __tiny__ libraries_')).toMatchSnapshot()
  })

  test('must be closed with same style', () => {
    expect(md('__Hello world**')).toMatchSnapshot()
  })
})

describe('Italic', () => {
  test('star syntax', () => {
    expect(md('I *like* tiny libraries')).toMatchSnapshot()
  })

  test('underline syntax', () => {
    expect(md('I _like_ tiny libraries')).toMatchSnapshot()
  })

  test('wrapped in bold', () => {
    expect(md('__I like *tiny* libraries__')).toMatchSnapshot()
    expect(md('**I like *tiny* libraries**')).toMatchSnapshot()
    expect(md('__I like _tiny_ libraries__')).toMatchSnapshot()
  })

  test('must be closed with same style', () => {
    expect(md('_Hello world*')).toMatchSnapshot()
  })
})

describe('Strike-through', () => {
  test('using squiggles', () => {
    expect(md('I like ~~tiny~~ libraries')).toMatchSnapshot()
  })
})

describe('Titles', () => {
  test('<h1>', () => {
    expect(md('# I like tiny libraries')).toMatchSnapshot()
    expect(md('I like tiny libraries\n===')).toMatchSnapshot()
  })

  test('<h2>', () => {
    expect(md('## I like tiny libraries')).toMatchSnapshot()
    expect(md('I like tiny libraries\n---')).toMatchSnapshot()
  })

  test('<h3> thru <h6>', () => {
    expect(md('### I like tiny libraries')).toMatchSnapshot()
    expect(md('#### I like tiny libraries')).toMatchSnapshot()
    expect(md('##### I like tiny libraries')).toMatchSnapshot()
    expect(md('###### I like tiny libraries')).toMatchSnapshot()
  })

  test('empty title', () => {
    expect(md('#')).toMatchSnapshot()
    expect(md('## ')).toMatchSnapshot()
    expect(md('###\t')).toMatchSnapshot()
    expect(md('#### \t \t')).toMatchSnapshot()
  })
})

describe('Links', () => {
  test('inline url', () => {
    let link = 'https://github.com/aleclarson/markdown-ast'
    expect(md(`[Hello world](${link})`)).toMatchSnapshot()
  })

  test('hash url', () => {
    expect(md('[Example](#example)')).toMatchSnapshot()
  })

  test('link reference', () => {
    expect(md('Hello [GitHub]!')).toMatchSnapshot()
    expect(md('Hello [GitHub][gh]!')).toMatchSnapshot()
  })

  test('inside an <h1>', () => {
    let link = 'https://github.com/aleclarson/markdown-ast'
    expect(md(`# I like [this]`)).toMatchSnapshot()
    expect(md(`# I like [this](#foo)`)).toMatchSnapshot()
    expect(md(`# I like [this](${link})`)).toMatchSnapshot()
  })

  test('auto-close any nested blocks', () => {
    expect(md('[unclosed **bold text](#foo)')).toMatchSnapshot()
    expect(md('[unclosed _italic text](#foo)')).toMatchSnapshot()

    // The nested link takes over by looking ahead for ")"
    expect(md('[unclosed [link]( text](#foo)')).toMatchSnapshot()

    // The nested image takes over by looking ahead for "]"
    expect(md('[unclosed ![link text](#foo)')).toMatchSnapshot()
  })
})

describe('Link definitions', () => {
  let link = 'https://github.com/aleclarson/markdown-ast'
  test('must come first on their line', () => {
    expect(md(`[foo]: ${link}`)).toMatchSnapshot()
  })
  test('may contain markdown syntax', () => {
    expect(md(`[__proto__]: ${link}`)).toMatchSnapshot()
  })
})

describe('Images', () => {
  test('inline url', () => {
    expect(md('![](foo.png)')).toMatchSnapshot()
    expect(md('![title](foo.png)')).toMatchSnapshot()
  })

  test('link reference', () => {
    expect(md('![][foo]')).toMatchSnapshot()
    expect(md('![Foo Bar]')).toMatchSnapshot()
  })

  test('inside a link block', () => {
    expect(md('[![](toc.png)](#toc)')).toMatchSnapshot()
    expect(md('[![Foo Bar](foo.png)](#foo)')).toMatchSnapshot()
    expect(md('[![Example]](#example)')).toMatchSnapshot()
  })

  test('cannot be confused for a link definition', () => {
    // The ": bar" part is interpreted as plain text.
    expect(md('![foo]: bar')).toMatchSnapshot()
  })

  test('markdown in the alt text', () => {
    expect(md('![# foo _bar_ ![baz]]')).toMatchSnapshot()
  })

  test('escaped square brackets in the alt text', () => {
    expect(md('![hello \\[world\\]](foo.png)')).toMatchSnapshot()
  })
})

describe('Lists', () => {
  test('<ul>', () => {
    expect(md('- One\n- Two')).toMatchSnapshot()
    expect(md('+ One\n+ Two')).toMatchSnapshot()
    expect(md('* One\n* Two')).toMatchSnapshot()
  })

  test('<ul> with mixed bullet styles', () => {
    expect(md('+ One\n* Two\n- Three')).toMatchSnapshot()
  })

  test('indented <ul>', () => {
    expect(md('+ One\n\t* Nested one\n\t* Nested two\n- Two')).toMatchSnapshot()
  })

  test('spaced out <ul>', () => {
    expect(md('* One\n\n* Two\n\n* Three')).toMatchSnapshot()
  })

  test('<ol>', () => {
    expect(md('1. Ordered\n2. Lists\n4. Numbers are ignored')).toMatchSnapshot()
    expect(md('1) Ordered\n2) Lists\n4) Numbers are ignored')).toMatchSnapshot()
  })

  test('indented <ol>', () => {
    expect(
      md('1. One\n\t1. Nested one\n\t2. Nested two\n2. Two')
    ).toMatchSnapshot()
    expect(
      md('1) One\n\t1) Nested one\n\t2) Nested two\n2) Two')
    ).toMatchSnapshot()
    expect(
      md('1. One\n\t1) Nested one\n\t2) Nested two\n2. Two')
    ).toMatchSnapshot()
    expect(
      md('1) One\n\t1. Nested one\n\t2. Nested two\n2) Two')
    ).toMatchSnapshot()
  })
})

describe('Multi-line list items', () => {
  test('indentation styles', () => {
    expect(md('* foo\nbar\nbaz')).toMatchSnapshot()
    expect(md('* foo\n\tbar\n\tbaz')).toMatchSnapshot()
    expect(md('* foo\n  bar\n  baz')).toMatchSnapshot()
    expect(md('* foo\n    bar\n    baz')).toMatchSnapshot()
  })

  test('mixed indentation', () => {
    expect(md('* a1\na2\n  a3\n    a4\n\ta5')).toMatchSnapshot()
  })

  test('with indented bullet', () => {
    expect(md('* foo\n\t* bar\nbaz')).toMatchSnapshot()
    expect(md('* foo\n\t* bar\n\tbaz')).toMatchSnapshot()

    expect(md('* foo\n  * bar\nbaz')).toMatchSnapshot()
    expect(md('* foo\n  * bar\n  baz')).toMatchSnapshot()

    expect(md('* foo\n    * bar\nbaz')).toMatchSnapshot()
    expect(md('* foo\n    * bar\n    baz')).toMatchSnapshot()
  })

  test('closed by next <li>', () => {
    expect(md('* foo\nbar\n* baz')).toMatchSnapshot()
  })

  test('closed by <br>', () => {
    expect(md('* foo\n  bar\n\n  baz')).toMatchSnapshot()
  })
})

describe('Code spans', () => {
  test('in between text nodes', () => {
    expect(md('Use `foo(bar, true)` to win bigly.')).toMatchSnapshot()
  })

  test('right before newline in multi-line list item', () => {
    expect(md('- Use `foo(bar, true)`\nto win bigly.')).toMatchSnapshot()
  })

  test('right after newline in multi-line list item', () => {
    expect(md('- Use\n`foo(bar, true)` to win bigly.')).toMatchSnapshot()
  })
})

describe('Code blocks', () => {
  test('using triple backticks', () => {
    let code = 'function approx(n) {}'
    expect(md('```\n' + code + '\n```')).toMatchSnapshot()
  })

  test('with syntax highlighting', () => {
    let code = 'function approx(n) {}'
    expect(md('```js\n' + code + '\n```')).toMatchSnapshot()
  })

  describe('indented', () => {
    test('with tabs', () => {
      expect(md('\tvar a = 1\n\tvar b = 2')).toMatchSnapshot()
    })
    test('with spaces', () => {
      expect(md('    var a = 1\n    var b = 2')).toMatchSnapshot()
    })

    test('must be first on its line', () => {
      expect(md('|    var a = 1')).toMatchSnapshot()
    })

    test('empty with text immediately after', () => {
      expect(md('    \nfoo')).toMatchSnapshot()
    })
  })
})

describe('Quotes', () => {
  test('with text', () => {
    expect(md('> To be or not to be')).toMatchSnapshot()
  })

  test('nested', () => {
    expect(
      md('> > To be or not to be\n> That is the question')
    ).toMatchSnapshot()
  })

  test('empty line', () => {
    expect(
      md('> To be or not to be\n>\n> That is the question')
    ).toMatchSnapshot()
  })

  test('multi-line', () => {
    // A double newline is required to exit the quote.
    expect(md('> in\n> the\n> quote\n\nand outside')).toMatchSnapshot()

    // The repeated > brackets are optional.
    expect(md('> in\nthe\nquote\n\nand outside')).toMatchSnapshot()
  })

  test('with bulleted list', () => {
    expect(md('> - line 1\n> - line 2\n> - line 3\n')).toMatchSnapshot()

    // With an EOF newline:
    expect(
      md('> - line 1\n> - line 2\n> - line 3.1\nline 3.2\n')
    ).toMatchSnapshot()

    // With a trailing break node:
    expect(
      md('> - line 1\n> - line 2\n> - line 3.1\n\nafter')
    ).toMatchSnapshot()
  })
})

describe('Breaks', () => {
  test('using double \\n', () => {
    expect(md('Something with\n\na line break')).toMatchSnapshot()
  })

  test('using double \\r\\n', () => {
    expect(md('Something with\r\n\r\na line break')).toMatchSnapshot()
  })

  test('using double space + \\n', () => {
    expect(md('Something with  \na line break')).toMatchSnapshot()
  })
})

describe('Borders', () => {
  test('using tight-packed dashes', () => {
    // Note the extra newline after "foo"
    expect(md('foo\n\n---\nbar')).toMatchSnapshot()
    expect(md('foo\n\n----\nbar')).toMatchSnapshot()
  })

  test('using spaced-out dashes', () => {
    expect(md('foo\n- - -\nbar')).toMatchSnapshot()
    expect(md('foo\n-\t-\t-\nbar')).toMatchSnapshot()
    expect(md('foo\n- \t - \t -\nbar')).toMatchSnapshot()
  })

  test('alternate symbols', () => {
    // Asterisks
    expect(md('foo\n***\n\nbar')).toMatchSnapshot()
    expect(md('foo\n* * *\n\nbar')).toMatchSnapshot()

    // Underscores
    expect(md('foo\n___\nbar')).toMatchSnapshot()
    expect(md('foo\n_ _ _\nbar')).toMatchSnapshot()
  })

  test('inside a quote', () => {
    expect(md('> ---\nbar')).toMatchSnapshot()
    expect(md('> * * *\nbar')).toMatchSnapshot()
  })
})

describe('Edge cases', () => {
  test('unclosed italic', () => {
    expect(md('*')).toMatchSnapshot()
    expect(md('_')).toMatchSnapshot()
    expect(md('*foo')).toMatchSnapshot()
    expect(md('_foo')).toMatchSnapshot()
  })

  test('unclosed bold', () => {
    expect(md('**')).toMatchSnapshot()
    expect(md('__')).toMatchSnapshot()
    expect(md('**foo')).toMatchSnapshot()
    expect(md('__foo')).toMatchSnapshot()
  })

  test('unclosed strike-through', () => {
    expect(md('~~')).toMatchSnapshot()
    expect(md('~~foo')).toMatchSnapshot()
  })

  test('unclosed code span', () => {
    // The backtick becomes plain text.
    expect(md('`')).toMatchSnapshot()
    expect(md('`foo')).toMatchSnapshot()
  })

  test('unclosed code block', () => {
    // The fence becomes plain text.
    expect(md('```')).toMatchSnapshot()
    expect(md('```\nfoo')).toMatchSnapshot()
  })

  test('unclosed link', () => {
    expect(md('[')).toMatchSnapshot()
    expect(md('[foo')).toMatchSnapshot()
    expect(md('[foo](')).toMatchSnapshot()
    expect(md('[foo](#bar')).toMatchSnapshot()
  })

  test('unclosed image', () => {
    expect(md('![')).toMatchSnapshot()
    expect(md('![](')).toMatchSnapshot()
    expect(md('![foo')).toMatchSnapshot()
    expect(md('![](foo')).toMatchSnapshot()
  })
})

describe('Escaped characters', () => {
  test('escaped title', () => {
    expect(md('\\# foo bar')).toMatchSnapshot()
  })

  test('escaped bold', () => {
    expect(md('\\__foo_')).toMatchSnapshot()
  })

  test('escaped escape', () => {
    expect(md('\\\\__foo_')).toMatchSnapshot()
  })
})
