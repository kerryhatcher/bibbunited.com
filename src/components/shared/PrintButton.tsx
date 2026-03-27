'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      data-print-hide
      className="inline-flex items-center gap-2 text-text-secondary hover:text-accent text-sm py-2 min-h-[44px]"
    >
      <Printer size={16} />
      Print this article
    </button>
  )
}
