declare const parse: (input: string) => Node[]
export default parse

export type Node =
  | Bold
  | Border
  | Break
  | CodeBlock
  | CodeSpan
  | Image
  | Italic
  | Link
  | LinkDefinition
  | List
  | Quote
  | Strike
  | Text
  | Title

interface Block {
  block: Node[]
}

export interface Bold extends Block {
  type: 'bold'
  style: '**' | '__'
}
export interface Border {
  type: 'border'
  text: string
}
export interface Break {
  type: 'break'
  text: string
}
export interface CodeBlock {
  type: 'codeBlock'
  code: string
  syntax: string
  indent: string
}
export interface CodeSpan {
  type: 'codeSpan'
  code: string
}
export interface Image {
  type: 'image'
  alt: string
  url: string
  ref: string
}
export interface Italic extends Block {
  type: 'italic'
  style: '*' | '_'
}
export interface Link extends Block {
  type: 'link'
  url: string
  ref: string
}
export interface LinkDefinition {
  type: 'linkDef'
  key: string
  url: string
}
export interface List extends Block {
  type: 'list'
  indent: string
  bullet: string
}
export interface Quote extends Block {
  type: 'quote'
}
export interface Strike extends Block {
  type: 'strike'
}
export interface Text {
  type: 'text'
  text: string
}
export interface Title extends Block {
  type: 'title'
  rank: 1 | 2 | 3 | 4 | 5 | 6
}
