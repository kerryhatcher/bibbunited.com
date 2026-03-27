'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      data-print-hide
      className="inline-flex items-center gap-2 text-text-secondary hover:text-accent text-sm min-h-[44px] py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <Printer size={16} />
      Print this article
    </button>
  )
}
