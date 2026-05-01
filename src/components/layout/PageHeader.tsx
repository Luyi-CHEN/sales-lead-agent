import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  right?: ReactNode
  transparent?: boolean
}

export function PageHeader({ title, onBack, right, transparent = false }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-12 items-center gap-2 px-2",
        transparent
          ? "bg-transparent"
          : "border-b bg-card"
      )}
    >
      <button
        onClick={onBack ?? (() => navigate(-1))}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground active:bg-secondary"
      >
        <ChevronLeft className="h-5 w-5 stroke-[2.5px]" />
      </button>
      <h1 className="flex-1 text-base font-semibold text-foreground truncate">{title}</h1>
      {right && <div className="flex items-center">{right}</div>}
    </header>
  )
}