import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface RichTextRendererProps {
  data: SerializedEditorState
  className?: string
}

export function RichTextRenderer({ data, className = '' }: RichTextRendererProps) {
  return (
    <div className={`prose prose-lg max-w-[65ch] mx-auto ${className}`}>
      <RichText data={data} />
    </div>
  )
}
