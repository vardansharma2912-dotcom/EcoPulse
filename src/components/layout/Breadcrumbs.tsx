import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-xs mb-1.5 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-slate-600 dark:text-[var(--text-secondary)] font-medium">
        <li>
          <Link
            to="/"
            className="hover:text-emerald-900 dark:hover:text-emerald-200 hover:underline transition-colors inline-flex items-center"
          >
            Dashboard
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={item.label}>
              <li aria-hidden="true" className="text-slate-400 dark:text-stone-500 select-none flex items-center">
                <ChevronRight className="w-3 h-3" />
              </li>
              <li>
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className="text-emerald-950 dark:text-emerald-200 font-semibold truncate max-w-[200px] inline-block"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="hover:text-emerald-900 dark:hover:text-emerald-200 hover:underline transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
