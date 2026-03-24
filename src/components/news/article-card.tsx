import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Article } from '@/types/database'

const CATEGORY_LABELS: Record<string, string> = {
  macro: 'Macro',
  argentina: 'Argentina',
  divisas: 'Divisas',
  empresas: 'Empresas',
  mercados: 'Mercados',
  crypto: 'Crypto',
}

const CATEGORY_COLORS: Record<string, string> = {
  macro: 'bg-blue-500/15 text-blue-400',
  argentina: 'bg-sky-500/15 text-sky-400',
  divisas: 'bg-emerald-500/15 text-emerald-400',
  empresas: 'bg-purple-500/15 text-purple-400',
  mercados: 'bg-orange-500/15 text-orange-400',
  crypto: 'bg-yellow-500/15 text-yellow-400',
}

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  // Si tiene URL externa, abrir en nueva tab; si tiene slug, ruta interna
  const href = article.slug
    ? `/noticias/${article.slug}`
    : article.external_url ?? '#'
  const isExternal = !article.slug && !!article.external_url

  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
    locale: es,
  })

  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category
  const categoryColor = CATEGORY_COLORS[article.category] ?? 'bg-zinc-500/15 text-zinc-400'

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
      >
        {article.image_url && (
          <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-zinc-800">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', categoryColor)}>
            {categoryLabel}
          </span>
          <h4 className="text-sm font-medium mt-1 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {article.title}
          </h4>
          <span className="text-xs text-muted-foreground mt-1">{timeAgo}</span>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="group relative rounded-xl overflow-hidden border border-border/40 bg-card hover:border-emerald-500/30 transition-all"
      >
        {article.image_url && (
          <div className="relative h-48 w-full bg-zinc-900">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', categoryColor)}>
              {categoryLabel}
            </span>
            {article.urgency_level === 'breaking' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium animate-pulse">
                BREAKING
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>{article.source}</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    )
  }

  // default
  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group flex gap-4 p-4 rounded-xl border border-border/40 bg-card hover:border-emerald-500/30 transition-all"
    >
      {article.image_url && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', categoryColor)}>
            {categoryLabel}
          </span>
          {article.source && (
            <span className="text-xs text-muted-foreground">{article.source}</span>
          )}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
        )}
        <span className="text-xs text-muted-foreground mt-2 block">{timeAgo}</span>
      </div>
    </Link>
  )
}
