// Perfil, Auth, Notificaciones, estados extra

// =================== PERFIL ===================
function ProfileDesktop() {
  return (
    <DesktopFrame label="Perfil · jugador" h={700}>
      <TopBar />
      <div style={{ padding: '24px 28px 14px', background: WF.paper, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center', borderBottom: `1.5px solid ${WF.ink}` }}>
        <Avatar label="JG" size={86} lime />
        <div>
          <div style={{ fontFamily: WF.ui, fontSize: 26, fontWeight: 800 }}>Javi González</div>
          <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2 }}>javi@correo.com · socio desde 2022</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: WF.ui, fontSize: 12 }}>
              Nivel <LevelBalls value={3} size={11} />
            </span>
            <span style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2 }}>♂ Masculino</span>
            <span style={{ fontFamily: WF.hand, fontSize: 13, color: WF.limeDeep }}>32 partidos jugados</span>
          </div>
        </div>
        <div>
          <Btn ghost sm>Editar perfil</Btn>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '0 28px', background: WF.paper, borderBottom: `1px dashed ${WF.muted}` }}>
        {['Próximas (3)', 'Creadas (8)', 'Historial', 'Estadísticas'].map((t, i) => (
          <span key={t} style={{
            padding: '12px 14px',
            fontFamily: WF.ui, fontSize: 12,
            fontWeight: i === 0 ? 700 : 500,
            color: i === 0 ? WF.ink : WF.muted,
            borderBottom: i === 0 ? `2px solid ${WF.lime}` : '2px solid transparent',
          }}>{t}</span>
        ))}
      </div>
      <div style={{ padding: '18px 28px', background: WF.paperAlt }}>
        <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: WF.muted, marginBottom: 8 }}>ESTA SEMANA</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <PachangaCard cat="X" date="MAR · 19:00" filled={3} accent />
          <PachangaCard cat="M" date="JUE · 20:00" filled={4} max={4} organizer="Tú" />
          <PachangaCard cat="M" date="SÁB · 11:00" filled={2} organizer="Tú" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            ['PARTIDOS JUGADOS', '32'],
            ['ESTE MES', '6'],
            ['ASISTENCIA', '94%'],
            ['CATEG. FAVORITA', 'Mixto'],
          ].map(([k, v]) => (
            <Box key={k} fill={WF.fill} style={{ padding: 12, boxShadow: 'none' }}>
              <div style={{ fontFamily: WF.ui, fontSize: 10, color: WF.muted, fontWeight: 700, letterSpacing: 1 }}>{k}</div>
              <div style={{ fontFamily: WF.ui, fontSize: 22, fontWeight: 800, marginTop: 4 }}>{v}</div>
            </Box>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

function ProfileMobile() {
  return (
    <PhoneFrame label="Perfil · mobile">
      <div style={{ padding: '14px 14px 14px', background: WF.navy, color: '#E8ECF2', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: WF.hand, fontSize: 11, color: WF.lime }}>⚙</div>
        <Avatar label="JG" size={64} lime />
        <div style={{ fontFamily: WF.ui, fontSize: 16, fontWeight: 800, marginTop: 8 }}>Javi González</div>
        <div style={{ fontFamily: WF.ui, fontSize: 11, opacity: 0.7 }}>socio desde 2022</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, fontFamily: WF.ui, fontSize: 11 }}>
          Nivel <LevelBalls value={3} size={10} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 14px', borderBottom: `1.5px solid ${WF.ink}`, background: WF.paper }}>
        {[['32', 'jugados'], ['8', 'creadas'], ['94%', 'asist.']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 800 }}>{n}</div>
            <div style={{ fontFamily: WF.hand, fontSize: 10, color: WF.muted }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, padding: '0 14px', background: WF.paper, borderBottom: `1px dashed ${WF.muted}` }}>
        {['Próx.', 'Creadas', 'Hist.'].map((t, i) => (
          <span key={t} style={{
            padding: '8px 10px', fontFamily: WF.ui, fontSize: 11,
            fontWeight: i === 0 ? 700 : 500, color: i === 0 ? WF.ink : WF.muted,
            borderBottom: i === 0 ? `2px solid ${WF.lime}` : '2px solid transparent',
          }}>{t}</span>
        ))}
      </div>
      <div style={{ padding: '10px 12px 70px' }}>
        <PachangaCard cat="X" date="MAR · 19:00" filled={3} compact accent />
        <div style={{ height: 6 }} />
        <PachangaCard cat="M" date="JUE · 20:00" filled={4} max={4} compact organizer="Tú" />
      </div>
      <MobileTabs active="Yo" />
    </PhoneFrame>
  );
}

// =================== AUTH ===================
function AuthLogin() {
  return (
    <DesktopFrame label="Login" h={520}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 520 }}>
        <div style={{ padding: '40px 40px', background: WF.navy, color: '#E8ECF2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <LogoFlat size={28} color={WF.lime} />
          <div style={{ position: 'relative', textAlign: 'center', margin: '0 auto' }}>
            <LogoFlat size={200} color={WF.lime} />
          </div>
          <div>
            <div style={{ fontFamily: WF.ui, fontSize: 24, fontWeight: 800 }}>Bienvenido al club.</div>
            <div style={{ fontFamily: WF.ui, fontSize: 13, color: '#aab', marginTop: 4 }}>
              Apúntate a pachangas, reserva pistas, organiza tus partidos.
            </div>
          </div>
        </div>
        <div style={{ padding: '60px 50px', background: WF.paper }}>
          <h1 style={{ fontFamily: WF.ui, fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Entrar</h1>
          <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2, marginBottom: 24 }}>
            ¿Aún no eres socio? <span style={{ color: WF.limeDeep, fontWeight: 700 }}>Crea tu cuenta →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Email" placeholder="tu@correo.com" />
            <Field label="Contraseña" placeholder="••••••••" type="password" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: WF.ui, fontSize: 12 }}>
                <span style={{ width: 12, height: 12, border: `1.2px solid ${WF.ink}`, borderRadius: 3, background: WF.fill }} />
                Recordarme
              </label>
              <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>¿olvidaste tu contraseña?</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <Btn primary full>Entrar →</Btn>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

function Field({ label, placeholder, type, value }) {
  return (
    <label style={{ display: 'block', fontFamily: WF.ui }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1 }}>{label.toUpperCase()}</span>
      <div style={{
        marginTop: 4,
        padding: '10px 12px',
        border: `1.5px solid ${WF.ink}`,
        borderRadius: 6,
        background: WF.fill,
        fontFamily: WF.ui, fontSize: 13,
        color: value ? WF.ink : WF.muted,
      }}>
        {value || placeholder}
      </div>
    </label>
  );
}

function AuthRegister() {
  return (
    <DesktopFrame label="Registro" h={620}>
      <TopBar />
      <div style={{ padding: '34px 60px', background: WF.paper, maxWidth: 540 }}>
        <h1 style={{ fontFamily: WF.ui, fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Crear cuenta</h1>
        <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2, marginBottom: 18 }}>
          Solo socios del club Montesiña.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Nombre" placeholder="Javi" />
          <Field label="Apellido" placeholder="González" />
          <Field label="Email" placeholder="javi@correo.com" />
          <Field label="Contraseña" placeholder="mínimo 8 caracteres" type="password" />
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1 }}>GÉNERO</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {['Hombre', 'Mujer', 'Prefiero no decir'].map((g, i) => (
              <span key={g} style={{
                padding: '6px 12px', borderRadius: 999,
                border: `1.2px solid ${WF.ink}`,
                background: i === 0 ? WF.lime : WF.fill,
                fontFamily: WF.ui, fontSize: 12, fontWeight: i === 0 ? 700 : 500,
              }}>{g}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, position: 'relative' }}>
          <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1 }}>NIVEL DE JUEGO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <LevelBalls value={3} size={16} />
            <span style={{ fontFamily: WF.hand, fontSize: 13, color: WF.ink2 }}>nivel 3 · intermedio</span>
          </div>
          <Annot dir="right" style={{ top: -8, right: 0 }}>1-5 · puede actualizar después</Annot>
        </div>

        <div style={{ marginTop: 22 }}>
          <Btn primary>Crear cuenta →</Btn>
          <span style={{ marginLeft: 12, fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>
            ya tengo cuenta · <span style={{ color: WF.limeDeep, fontWeight: 700 }}>entrar</span>
          </span>
        </div>
      </div>
    </DesktopFrame>
  );
}

// =================== NOTIFICACIONES ===================
function NotificationsPanel() {
  const items = [
    { ic: '✓', t: 'Te has apuntado a la pachanga del martes 20:00', s: 'Hace 2 min', kind: 'ok' },
    { ic: '!', t: 'Falta 1 mujer en la pachanga mixta del jueves', s: 'Hace 1 h', kind: 'warn' },
    { ic: '⏷', t: 'Has subido de la lista de espera al partido del sábado', s: 'Ayer', kind: 'lime' },
    { ic: '×', t: 'Marta L. canceló la pachanga del miércoles 18:00', s: 'Ayer', kind: 'neutral' },
    { ic: '⏰', t: 'Recordatorio: tu pachanga empieza en 1 hora', s: 'Hace 3 días', kind: 'neutral' },
    { ic: '⊕', t: 'Nueva pachanga mixta en tu rango de nivel', s: 'Hace 4 días', kind: 'neutral' },
  ];
  return (
    <DesktopFrame label="Notificaciones · panel" h={580}>
      <TopBar />
      <div style={{ padding: '20px 28px 0' }}>
        <h1 style={{ fontFamily: WF.ui, fontSize: 22, fontWeight: 800, margin: 0 }}>Notificaciones</h1>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {['Todas (6)', 'Sin leer (2)', 'Recordatorios'].map((t, i) => (
            <span key={t} style={{
              padding: '6px 12px', borderRadius: 999, border: `1.2px solid ${WF.ink}`,
              background: i === 0 ? WF.lime : WF.fill,
              fontFamily: WF.ui, fontSize: 12, fontWeight: i === 0 ? 700 : 500,
            }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 28px 24px' }}>
        <div style={{ border: `1.5px solid ${WF.ink}`, borderRadius: 8, overflow: 'hidden', background: WF.fill }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              borderTop: i ? `1px solid ${WF.fillAlt}` : 'none',
              background: i < 2 ? '#fafce0' : WF.fill,
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `1.2px solid ${WF.ink}`,
                background: it.kind === 'ok' ? WF.lime : it.kind === 'warn' ? '#ffd9b3' : it.kind === 'lime' ? WF.lime : WF.fill,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: WF.ui, fontSize: 12, fontWeight: 800,
                flex: 'none',
              }}>{it.ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: i < 2 ? 700 : 500 }}>{it.t}</div>
                <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted, marginTop: 2 }}>{it.s}</div>
              </div>
              {i < 2 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: WF.limeDeep, marginTop: 8 }} />}
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

function PushToast() {
  return (
    <PhoneFrame label="Push · recordatorio">
      <div style={{ height: '100%', background: `radial-gradient(ellipse at center, #1a2a47 0%, ${WF.navy2} 70%)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 80, left: 12, right: 12 }}>
          <div style={{
            padding: 12, borderRadius: 14,
            background: 'rgba(245,242,234,0.96)',
            border: `1.5px solid ${WF.ink}`,
            boxShadow: `2px 2px 0 0 ${WF.ink}`,
            display: 'flex', gap: 10,
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 6,
              background: WF.navy, color: WF.lime, fontFamily: WF.ui, fontSize: 16, fontWeight: 800,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              border: `1.2px solid ${WF.ink}`,
            }}>M</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700 }}>MONTESIÑA · ahora</div>
              <div style={{ fontFamily: WF.ui, fontSize: 12, marginTop: 2 }}>
                <b>Tu pachanga empieza en 1 h</b> — Pista 1 · 19:00
              </div>
              <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.ink2, marginTop: 2 }}>
                3 jugadores confirmados · falta 1
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', color: '#aab', fontFamily: WF.ui, fontSize: 32, fontWeight: 200 }}>17:58</div>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', color: '#aab', fontFamily: WF.ui, fontSize: 12 }}>martes 20 de mayo</div>
      </div>
    </PhoneFrame>
  );
}

// =================== ESTADOS VACÍO + ERROR ===================
function EmptyState() {
  return (
    <DesktopFrame label="Estado vacío + error" h={460}>
      <TopBar active="Pachangas" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 360 }}>
        <div style={{ padding: 30, borderRight: `1.5px solid ${WF.ink}`, background: WF.paper, textAlign: 'center' }}>
          <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted, letterSpacing: 1 }}>VACÍO</div>
          <div style={{ margin: '20px auto', width: 90, height: 90, position: 'relative' }}>
            <LogoFlat size={90} color={WF.muted} />
            <span style={{ position: 'absolute', top: -10, right: -10, fontFamily: WF.hand, fontSize: 26 }}>?</span>
          </div>
          <div style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 800 }}>Sin pachangas para hoy</div>
          <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2, marginTop: 4 }}>
            Aún nadie ha organizado nada. Sé el primero.
          </div>
          <div style={{ marginTop: 16 }}>
            <Btn primary sm>+ Crear pachanga</Btn>
          </div>
        </div>
        <div style={{ padding: 30, background: WF.paperAlt, textAlign: 'center' }}>
          <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted, letterSpacing: 1 }}>ERROR</div>
          <div style={{
            margin: '24px auto', width: 60, height: 60, borderRadius: '50%',
            background: WF.fill, border: `2px solid ${WF.ink}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: WF.ui, fontSize: 28, fontWeight: 800,
          }}>!</div>
          <div style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 800 }}>Algo ha fallado</div>
          <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2, marginTop: 4 }}>
            No hemos podido cargar las pachangas. Comprueba tu conexión.
          </div>
          <div style={{ marginTop: 16 }}>
            <Btn ghost sm>Reintentar</Btn>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

Object.assign(window, {
  ProfileDesktop, ProfileMobile, AuthLogin, AuthRegister, Field,
  NotificationsPanel, PushToast, EmptyState,
});
