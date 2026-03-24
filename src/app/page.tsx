// Redirect / → /(public) layout home
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/al-dia')
}
