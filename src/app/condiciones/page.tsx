import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function CondicionesPage() {
  return (
    <>
      <SiteHeader variant="paper" />
      <main className="min-h-screen bg-paper px-4 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-extrabold text-ink">Condiciones del Servicio</h1>
          <p className="text-xs text-muted">Ultima actualizacion: 24 de mayo de 2026</p>

          <section className="space-y-3 text-sm text-ink-2">
            <h2 className="text-base font-bold text-ink">1. Objeto</h2>
            <p>
              Estas condiciones regulan el uso de la aplicacion web de
              &ldquo;Montesina Padel&rdquo; (pachangasmontesina.cc), una herramienta
              para que los socios del club organicen partidos informales de padel
              (pachangas).
            </p>

            <h2 className="text-base font-bold text-ink">2. Registro</h2>
            <p>
              Para crear o apuntarte a pachangas necesitas una cuenta. Puedes registrarte
              con email y contrasena o con tu cuenta de Google. Te comprometes a
              proporcionar informacion veraz.
            </p>

            <h2 className="text-base font-bold text-ink">3. Uso del servicio</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>La app es gratuita y de uso exclusivo para los socios del club.</li>
              <li>Al apuntarte a una pachanga te comprometes a asistir o a cancelar con antelacion razonable.</li>
              <li>El organizador de una pachanga puede establecer requisitos de nivel y categoria.</li>
              <li>Los precios mostrados por partido son orientativos y se acuerdan entre los jugadores.</li>
            </ul>

            <h2 className="text-base font-bold text-ink">4. Reservas de pista</h2>
            <p>
              La app facilita la organizacion de partidos pero la reserva de pistas del
              club se gestiona de forma externa. La confirmacion en la app no garantiza
              la disponibilidad de la pista.
            </p>

            <h2 className="text-base font-bold text-ink">5. Conducta</h2>
            <p>
              Los usuarios se comprometen a un uso respetuoso del servicio. El club se
              reserva el derecho de suspender cuentas que hagan un uso indebido.
            </p>

            <h2 className="text-base font-bold text-ink">6. Responsabilidad</h2>
            <p>
              El club no se responsabiliza de lesiones, danos o incidencias que ocurran
              durante los partidos organizados a traves de la app. Cada jugador participa
              bajo su propia responsabilidad.
            </p>

            <h2 className="text-base font-bold text-ink">7. Modificaciones</h2>
            <p>
              El club puede modificar estas condiciones en cualquier momento. Los cambios
              se publicaran en esta pagina.
            </p>

            <h2 className="text-base font-bold text-ink">8. Contacto</h2>
            <p>
              Para cualquier consulta:{" "}
              <a href="mailto:nolomanolo990@gmail.com" className="font-bold text-lime-deep underline">
                nolomanolo990@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
