'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

interface NavLink {
  label: string
  type?: ('internal' | 'external') | null
  page?: { relationTo: string; value: number | { slug?: string | null } } | null
  url?: string | null
  newTab?: boolean | null
}

interface NavItem extends NavLink {
  children?: (NavLink & { id?: string | null })[] | null
  id?: string | null
}

function resolveHref(item: NavLink): string {
  if (item.type === 'internal' && item.page) {
    const pageValue = item.page.value
    if (typeof pageValue === 'object' && pageValue?.slug) {
      return `/${pageValue.slug}`
    }
    return '#'
  }
  return item.url || '#'
}

function useFocusTrap(containerRef: React.RefObject<HTMLDivElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusables = container.querySelectorAll<HTMLElement>(focusableSelector)
    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    // Focus the close button (first focusable) when menu opens
    first.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef])
}

interface HeaderProps {
  navItems: NavItem[]
}

export function Header({ navItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const dropdownRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const dropdownItemRefs = useRef<Map<string, HTMLAnchorElement[]>>(new Map())
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useFocusTrap(mobileMenuRef, mobileOpen)

  const closeDropdowns = useCallback(() => {
    setOpenDropdown(null)
  }, [])

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeDropdowns()
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeDropdowns])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  function handleDropdownKeyDown(
    e: React.KeyboardEvent,
    itemId: string,
    children: NavLink[],
  ) {
    const items = dropdownItemRefs.current.get(itemId)
    if (!items) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpenDropdown(itemId)
      // Focus first child on next tick
      setTimeout(() => {
        items[0]?.focus()
      }, 0)
    }
  }

  function handleChildKeyDown(
    e: React.KeyboardEvent,
    itemId: string,
    childIndex: number,
    totalChildren: number,
  ) {
    const items = dropdownItemRefs.current.get(itemId)
    if (!items) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (childIndex + 1) % totalChildren
      items[next]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = childIndex === 0 ? totalChildren - 1 : childIndex - 1
      items[prev]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpenDropdown(null)
    }
  }

  function renderLink(item: NavLink, className: string, onClick?: () => void) {
    const href = resolveHref(item)
    const isExternal = item.newTab || !href.startsWith('/')

    if (isExternal) {
      return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {item.label}
        </a>
      )
    }

    return (
      <Link href={href} className={className} onClick={onClick}>
        {item.label}
      </Link>
    )
  }

  function renderChildLink(
    child: NavLink & { id?: string | null },
    childIndex: number,
    itemId: string,
    totalChildren: number,
    className: string,
    onClick?: () => void,
  ) {
    const childHref = resolveHref(child)
    const isExternal = child.newTab || !childHref.startsWith('/')

    if (isExternal) {
      return (
        <a
          key={child.id || `child-${childIndex}`}
          href={childHref}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
          ref={(el) => {
            if (el) {
              if (!dropdownItemRefs.current.has(itemId)) {
                dropdownItemRefs.current.set(itemId, [])
              }
              const arr = dropdownItemRefs.current.get(itemId)!
              arr[childIndex] = el
            }
          }}
          onKeyDown={(e) =>
            handleChildKeyDown(e, itemId, childIndex, totalChildren)
          }
          onClick={onClick}
        >
          {child.label}
        </a>
      )
    }

    return (
      <Link
        key={child.id || `child-${childIndex}`}
        href={childHref}
        className={className}
        ref={(el) => {
          if (el) {
            if (!dropdownItemRefs.current.has(itemId)) {
              dropdownItemRefs.current.set(itemId, [])
            }
            const arr = dropdownItemRefs.current.get(itemId)!
            arr[childIndex] = el
          }
        }}
        onKeyDown={(e) =>
          handleChildKeyDown(e, itemId, childIndex, totalChildren)
        }
        onClick={onClick}
      >
        {child.label}
      </Link>
    )
  }

  return (
    <header data-print-hide="" className="sticky top-0 z-50 border-b border-border bg-bg-dominant">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="no-underline">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          <ul className="flex items-center gap-6 list-none m-0 p-0">
            {navItems.map((item, index) => {
              const itemId = item.id || `nav-${index}`
              const hasChildren = item.children && item.children.length > 0

              if (hasChildren) {
                return (
                  <li
                    key={itemId}
                    className="relative"
                    ref={(el) => {
                      if (el) dropdownRefs.current.set(itemId, el)
                    }}
                    onMouseEnter={() => setOpenDropdown(itemId)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className="flex items-center gap-1 font-heading text-sm font-bold uppercase tracking-wide text-text-primary hover:text-accent bg-transparent border-none cursor-pointer py-2"
                      aria-expanded={openDropdown === itemId}
                      aria-haspopup="true"
                      onClick={() =>
                        setOpenDropdown(openDropdown === itemId ? null : itemId)
                      }
                      onKeyDown={(e) =>
                        handleDropdownKeyDown(e, itemId, item.children!)
                      }
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openDropdown === itemId ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openDropdown === itemId && (
                      <div className="absolute left-0 top-full min-w-48 border border-border bg-bg-dominant py-2 shadow-lg">
                        {item.children!.map((child, childIndex) =>
                          renderChildLink(
                            child,
                            childIndex,
                            itemId,
                            item.children!.length,
                            'block px-4 py-2 text-sm text-text-primary no-underline hover:bg-accent hover:text-text-on-accent',
                          ),
                        )}
                      </div>
                    )}
                  </li>
                )
              }

              return (
                <li key={itemId}>
                  {renderLink(
                    item,
                    'font-heading text-sm font-bold uppercase tracking-wide text-text-primary no-underline hover:text-accent',
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="bg-transparent border-none cursor-pointer text-text-primary lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-out panel */}
      <div
        ref={mobileMenuRef}
        inert={!mobileOpen}
        className={`fixed right-0 top-0 z-[60] h-full w-72 transform bg-bg-dominant transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex items-center justify-end p-4">
          <button
            className="bg-transparent border-none cursor-pointer text-text-primary"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile nav items */}
        <nav className="px-4" aria-label="Mobile navigation">
          <ul className="list-none m-0 p-0">
            {navItems.map((item, index) => {
              const itemId = item.id || `mobile-nav-${index}`
              const hasChildren = item.children && item.children.length > 0

              if (hasChildren) {
                return (
                  <li key={itemId} className="border-b border-border">
                    <button
                      className="flex w-full items-center justify-between bg-transparent border-none cursor-pointer py-3 font-heading text-sm font-bold uppercase tracking-wide text-text-primary"
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === itemId ? null : itemId,
                        )
                      }
                      aria-expanded={mobileExpanded === itemId}
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${mobileExpanded === itemId ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {mobileExpanded === itemId && (
                      <ul className="list-none m-0 mb-2 p-0 pl-4">
                        {item.children!.map((child, childIndex) => {
                          const childHref = resolveHref(child)
                          const isExternal = child.newTab || !childHref.startsWith('/')

                          return (
                            <li key={child.id || `mobile-child-${childIndex}`}>
                              {isExternal ? (
                                <a
                                  href={childHref}
                                  className="block py-2 text-sm text-text-secondary no-underline hover:text-accent"
                                  onClick={() => setMobileOpen(false)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {child.label}
                                </a>
                              ) : (
                                <Link
                                  href={childHref}
                                  className="block py-2 text-sm text-text-secondary no-underline hover:text-accent"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              }

              const href = resolveHref(item)
              const isExternal = item.newTab || !href.startsWith('/')

              return (
                <li key={itemId} className="border-b border-border">
                  {isExternal ? (
                    <a
                      href={href}
                      className="block py-3 font-heading text-sm font-bold uppercase tracking-wide text-text-primary no-underline hover:text-accent"
                      onClick={() => setMobileOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="block py-3 font-heading text-sm font-bold uppercase tracking-wide text-text-primary no-underline hover:text-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
