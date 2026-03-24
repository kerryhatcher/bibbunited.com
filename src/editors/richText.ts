import {
  BlockquoteFeature,
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { PullQuote } from '../blocks/PullQuote'
import { Callout } from '../blocks/Callout'
import { Embed } from '../blocks/Embed'

export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    // D-10: headings (h2, h3, h4 -- h1 reserved for page title)
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    // D-06: inline images with captions and alt text
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'caption',
              type: 'text',
              label: 'Caption',
            },
          ],
        },
      },
    }),
    // D-05, D-07: pull quotes, callouts, embeds as blocks
    BlocksFeature({
      blocks: [PullQuote, Callout, Embed],
    }),
    // D-09: horizontal rule / section dividers
    HorizontalRuleFeature(),
    // D-08: table support for structured data
    EXPERIMENTAL_TableFeature(),
    // Fixed toolbar for better editor UX
    FixedToolbarFeature(),
  ],
})
