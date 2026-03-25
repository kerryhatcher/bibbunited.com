interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

export function lexicalToPlainText(body: { root: LexicalNode }): string {
  const texts: string[] = []

  function walk(node: LexicalNode): void {
    if (node.type === 'text' && node.text) {
      texts.push(node.text)
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }

  walk(body.root)
  return texts.join(' ').replace(/\s+/g, ' ').trim()
}

export function getExcerpt(
  body: { root: LexicalNode },
  maxLength = 150,
): string {
  const text = lexicalToPlainText(body)
  if (text.length <= maxLength) return text
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '\u2026'
}
