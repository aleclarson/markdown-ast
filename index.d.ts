const parse: (input: string) => Document
export default parse

export interface Node {
  type: (
    | Text
    | Link
    | LinkDefinition
    | CodeSpan
    | CodeBlock
    | Bold
    | Italic
    | Strike
    | Border
    | Title
    | Quote
    | Image
    | List)['type']
}
export interface Text {
  type: 'text'
  text: string
}
export interface Block {
  block: Node[]
}
export interface Bold extends Block {
  type: 'bold'
}
export interface Italic extends Block {
  type: 'italic'
}
export interface Strike extends Block {
  type: 'strike'
}
export interface Border extends Text {
  type: 'border'
}
export interface Title extends Block {
  type: 'title'
  rank: 1 | 2 | 3 | 4 | 5 | 6
}
export interface Break extends Text {
  type: 'break'
}
export interface Image {
  type: 'image'
  alt: string
  url: string
  ref: string
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
export interface CodeSpan {
  type: 'codeSpan'
  code: string
}
export interface CodeBlock {
  type: 'codeBlock'
  code: string
  syntax: string
  indent: string
}
export interface Quote extends Block {
  type: 'quote'
}
export interface List extends Block {
  type: 'list'
  indent: string
  bullet: string
}
