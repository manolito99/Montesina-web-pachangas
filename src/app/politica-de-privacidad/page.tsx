import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PrivacidadPage() {
  return (
    <>
      <SiteHeader variant="paper" />
      <main className="min-h-screen bg-paper px-4 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-extrabold text-ink">Politica de Privacidad</h1>
          <p className="text-xs text-muted">Ultima actualizacion: 24 de mayo de 2026</p>

          <section className="space-y-3 text-sm text-ink-2">
            <h2 className="text-base font-bold text-ink">1. Responsable</h2>
            <p>
              <strong>Montesina Padel</strong> (en adelante, &ldquo;el Club&rdquo;) es responsable del tratamiento de
              los datos personales recogidos a traves de la aplicacion web
              &ldquo;pachangasmontesina.cc&rdquo;.
            </p>

            <h2 className="text-base font-bold text-ink">2. Datos que recogemos</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nombre y direccion de correo electronico (registro o Google OAuth).</li>
              <li>Genero y nivel de juego (para organizar partidos equilibrados).</li>
              <li>Foto de perfil de Google (si inicias sesion con Google).</li>
              <li>Suscripciones push (para enviarte notificaciones que tu activas).</li>
            </ul>

            <h2 className="text-base font-bold text-ink">3. Finalidad</h2>
            <p>
              Usamos tus datos exclusivamente para gestionar tu cuenta, organizar pachangas
              (partidos informales de padel) y enviarte notificaciones sobre partidos que
              coincidan con tus preferencias.
            </p>

            <h2 className="text-base font-bold text-ink">4. Base legal</h2>
            <p>
              El tratamiento se basa en tu consentimiento al registrarte y en la ejecucion
              del servicio que solicitas (organizar y apuntarte a pachangas).
            </p>

            <h2 className="text-base font-bold text-ink">5. Comparticion de datos</h2>
            <p>
              No vendemos ni compartimos tus datos con terceros. Tu nombre y nivel son
              visibles para otros socios del club dentro de las pachangas a las que te
              apuntas. Usamos Google OAuth para el inicio de sesion; Google recibe solo
              la informacion necesaria para autenticarte.
            </p>

            <h2 className="text-base font-bold text-ink">6. Conservacion</h2>
            <p>
              Tus datos se conservan mientras mantengas tu cuenta activa. Puedes solicitar
              la eliminacion de tu cuenta y datos en cualquier momento contactando al club.
            </p>

            <h2 className="text-base font-bold text-ink">7. Derechos</h2>
            <p>
              Puedes ejercer tus derechos de acceso, rectificacion, supresion, limitacion
              y portabilidad escribiendo a{" "}
              <a href="mailto:nolomanolo990@gmail.com" className="font-bold text-lime-deep underline">
                nolomanolo990@gmail.com
              </a>.
            </p>

            <h2 className="text-base font-bold text-ink">8. Seguridad</h2>
            <p>
              Las contrasenas se almacenan con hash bcrypt. La comunicacion se realiza
              mediante HTTPS. Las notificaciones push usan cifrado VAPID de extremo a extremo.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
