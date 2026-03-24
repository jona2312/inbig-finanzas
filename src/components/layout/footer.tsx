import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span>IN<span className="text-emerald-500">big</span> Finanzas</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              El Wall Street latinoamericano. Datos de mercado, análisis y herramientas financieras para el inversor retail de LATAM.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Mercados</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/mercados" className="hover:text-foreground">Acciones</Link></li>
              <li><Link href="/crypto" className="hover:text-foreground">Crypto</Link></li>
              <li><Link href="/divisas" className="hover:text-foreground">Divisas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Recursos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/noticias" className="hover:text-foreground">Noticias</Link></li>
              <li><Link href="/herramientas" className="hover:text-foreground">Herramientas</Link></li>
              <li><Link href="/glosario" className="hover:text-foreground">Glosario</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Cuenta</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/registro" className="hover:text-foreground">Registrarse</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Iniciar sesión</Link></li>
              <li><Link href="/precios" className="hover:text-foreground">Planes y precios</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} INbig Finanzas / INBSAS. Todos los derechos reservados.</p>
          <p className="text-xs">
            La información publicada no constituye asesoramiento financiero.
          </p>
        </div>
      </div>
    </footer>
  )
}
