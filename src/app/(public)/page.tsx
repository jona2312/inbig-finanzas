// Route group (public)/page.tsx would conflict with app/page.tsx at "/"
// Landing is served directly from app/page.tsx
import { redirect } from 'next/navigation'
export default function PublicRootRedirect() {
  redirect('/al-dia')
}
