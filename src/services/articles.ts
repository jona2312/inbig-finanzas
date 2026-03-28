import { createClient } from '@/lib/supabase/server'
import type { Article } from '@/types/database'

export type ArticleCategory = 'macro' | 'argentina' | 'divisas' | 'empresas' | 'mercados' | 'crypto'

export async function getFeaturedArticles(limit = 6): Promise<Article[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('getFeaturedArticles:', error); return [] }
  return data ?? []
}

export async function getLatestArticles(limit = 20, category?: ArticleCategory): Promise<Article[]> {
  const supabase = createClient()
  let query = supabase
    .from('articles')
    .select('id, title, excerpt, summary, category, source, image_url, published_at, is_featured, urgency_level, frontend_tag, slug, external_url')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) { console.error('getLatestArticles:', error); return [] }
  return (data ?? []) as Article[]
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getArticlesByCategory(
  category: ArticleCategory,
  limit = 12,
  offset = 0
): Promise<{ articles: Article[]; total: number }> {
  const supabase = createClient()

  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, excerpt, summary, category, source, image_url, published_at, is_featured, urgency_level, slug, external_url')
      .eq('category', category)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1),
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category', category),
  ])

  if (error) { console.error('getArticlesByCategory:', error); return { articles: [], total: 0 } }
  return { articles: (data ?? []) as Article[], total: count ?? 0 }
}

// TODO: implementar con RPC en Supabase
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function incrementViewCount(_id: string): Promise<void> {}
