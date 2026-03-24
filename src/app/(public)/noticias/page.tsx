import type { Metadata } from 'next'
import { getLatestArticles, getArticlesByCategory, type ArticleCategory } from '@/services/articles'
import { ArticleCard } from '@/components/news/article-card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Noticias — Economía y Mercados LATAM',
}

export const revalidate = 180

const CATEGORIES = [
  { value: 'todas', label: 'Todas', color: 'text-foreground' },
  { value: 'macro', label: 'Macro', color: 'text-blue-400' },
  { value: 'argentina', label: 'Argentina', color: 'text-sky-400' },
  { value: 'mercados', label: 'Mercados', color: 'text-orange-400' },
  { value: 'divisas', label: 'Divisas', color: 'text-emerald-400' },
  { value: 'empresas', label: 'Empresas', color: 'text-purple-400' },
  { value: 'crypto', label: 'Crypto', color: 'text-yellow-400' },
]

interface Props {
  searchParams: { cat?: string }
}

export default async function NoticiasPage({ searchParams }: Props) {
  const cat = searchParams.cat
  const validCat = (cat && cat !== 'todas' && CATEGORIES.some(c => c.value === cat))
    ? cat as ArticleCategory
    : undefined

  const articles = validCat
    ? (await getArticlesByCategory(validCat, 24)).articles
    : await getLatestArticles(24)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Economía, mercados y finanzas en tiempo real
        </p>
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(({ value, label, color }) => {
          const isActive = (!validCat && value === 'todas') || validCat === value
          return (
            <Link
              key={value}
              href={value === 'todas' ? '/noticias' : `/noticias?cat=${value}`}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : `border-border/40 ${color} hover:border-border opacity-70 hover:opacity-100`
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay noticias en esta categoría aún.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} variant="featured" />
          ))}
        </div>
      )}
    </div>
  )
}
