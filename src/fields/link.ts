import type { Field } from 'payload'

interface LinkFieldOptions {
  relationTo?: string[]
  disableLabel?: boolean
}

export function linkFields(options?: LinkFieldOptions): Field[] {
  const { relationTo = ['pages'], disableLabel = false } = options || {}

  const fields: Field[] = []

  if (!disableLabel) {
    fields.push({
      name: 'label',
      type: 'text',
      required: true,
      label: 'Link Label',
    })
  }

  fields.push(
    {
      name: 'type',
      type: 'radio',
      defaultValue: 'internal',
      options: [
        { label: 'Internal Page', value: 'internal' },
        { label: 'External URL', value: 'external' },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo,
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'internal',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.type === 'external',
      },
    },
    {
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Open in New Tab',
    },
  )

  return fields
}
