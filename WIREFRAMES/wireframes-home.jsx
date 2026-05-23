// Home — 3 variantes (desktop + mobile)

// =================== VARIANTE A — Hero clásico con reveal ===================
function HomeA_Desktop() {
  return (
    <DesktopFrame label="Home A">
      <TopBar />
      {/* Hero: logo centered, big */}
      <div style={{ position: 'relative', padding: '40px 60px 30px', textAlign: 'center', background: WF.paper }}>
        <div style={{ fontFamily: WF.hand, fontSize: 13, color: WF.muted, letterSpacing: 2 }}>
          MONTESIÑA PADEL CLUB · SINCE '94
        </div>
        <div style={{ position: 'relative', margin: '20px auto 14px', width: 220, height: 220 }}>
          <Box w={220} h={220} fill={WF.paper} style={{ borderStyle: 'dashed', boxShadow: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoFlat size={170} color={WF.ink} />
            </div>
            <Annot dir="left" style={{ top: -20, left: -90 }}>
              logo SVG<br/>se "compone"<br/>con scroll
            </Annot>
            <Annot dir="right" style={{ top: 40, right: -130 }}>
              glow verde<br/>se intensifica ↗
            </Annot>
            <Annot dir="down" style={{ bottom: -30, right: -110 }}>
              astas + cabeza<br/>entran con stagger
            </Annot>
          </Box>
        </div>
        <h1 style={{ fontFamily: WF.ui, fontSize: 36, fontWeight: 800, letterSpacing: -1, margin: '8px 0 4px' }}>
          Juega. Apúntate. Compite.
        </h1>
        <div style={{ fontFamily: WF.ui, fontSize: 14, color: WF.ink2, maxWidth: 460, margin: '0 auto 22px' }}>
          Pachangas de pádel del club, organizadas entre socios. Masculino, femenino y mixto.
        </div>
        <div style={{ display: 'inline-flex', gap: 10 }}>
          <Btn primary>Apuntarme a una pachanga →</Btn>
          <Btn ghost>Crear pachanga</Btn>
        </div>
        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>
          ↓ scroll para componer el logo
        </div>
      </div>
      {/* Próximas pachangas */}
      <div style={{ padding: '20px 60px 30px', background: WF.paperAlt, borderTop: `1.5px solid ${WF.ink}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 700, margin: 0 }}>Próximas pachangas</h2>
          <span style={{ fontFamily: WF.hand, fontSize: 13, color: WF.ink2 }}>ver todas →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <PachangaCard cat="X" date="HOY · 19:00" filled={3} accent />
          <PachangaCard cat="M" date="MAÑ · 20:30" pista="Pista 1 · outdoor" nivel={4} filled={2} organizer="Carlos R." />
          <PachangaCard cat="F" date="JUE · 18:00" pista="Pista 2 · indoor" nivel={2} filled={4} max={4} organizer="Lucía V." />
        </div>
      </div>
    </DesktopFrame>
  );
}

function HomeA_Mobile() {
  return (
    <PhoneFrame label="Home A">
      <div style={{ padding: '12px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoFlat size={20} />
        <span style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted }}>🔔  ☰</span>
      </div>
      <div style={{ padding: '16px 14px 10px', textAlign: 'center', position: 'relative' }}>
        <Box w={130} h={130} style={{ margin: '0 auto', borderStyle: 'dashed', boxShadow: 'none' }} fill={WF.paper}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoFlat size={100} />
          </div>
        </Box>
        <Annot dir="right" style={{ top: 60, right: 4, fontSize: 10 }}>reveal<br/>scroll</Annot>
        <div style={{ fontFamily: WF.ui, fontSize: 20, fontWeight: 800, marginTop: 10, lineHeight: 1.1 }}>
          Juega. Apúntate.<br/>Compite.
        </div>
        <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.ink2, marginTop: 6 }}>
          Pachangas de pádel del club
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Btn primary full>Apuntarme →</Btn>
          <Btn ghost full>Crear pachanga</Btn>
        </div>
      </div>
      <div style={{ padding: '14px 14px 70px', borderTop: `1.5px solid ${WF.ink}`, background: WF.paperAlt }}>
        <div style={{ fontFamily: WF.ui, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Próximas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PachangaCard cat="X" date="HOY · 19:00" filled={3} compact accent />
          <PachangaCard cat="M" date="MAÑ · 20:30" filled={2} compact organizer="Carlos R." />
        </div>
      </div>
      <MobileTabs active="Inicio" />
    </PhoneFrame>
  );
}

// =================== VARIANTE B — Split agenda (utilitario) ===================
function HomeB_Desktop() {
  return (
    <DesktopFrame label="Home B · split agenda">
      <TopBar active="Pachangas" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 580 }}>
        {/* LEFT — brand & CTA */}
        <div style={{ padding: '40px 50px', background: WF.navy, color: '#E8ECF2', position: 'relative' }}>
          <div style={{ fontFamily: WF.hand, fontSize: 12, color: WF.lime, letterSpacing: 2 }}>EL CLUB · ABIERTO</div>
          <div style={{ position: 'relative', margin: '24px 0 30px', width: 200, height: 200 }}>
            <LogoFlat size={200} color={WF.lime} />
            <Annot dir="right" style={{ top: 80, right: -30, color: WF.lime }}>logo se<br/>compone<br/>(scroll)</Annot>
          </div>
          <h1 style={{ fontFamily: WF.ui, fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: -1.5 }}>
            Pachangas<br/>
            <span style={{ color: WF.lime }}>todos los días.</span>
          </h1>
          <div style={{ fontFamily: WF.ui, fontSize: 14, color: '#aab', marginTop: 14, maxWidth: 340 }}>
            Organizadas entre socios. M / F / Mixto. Apúntate en 2 toques.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <Btn primary>Crear pachanga</Btn>
            <span style={{
              padding: '10px 18px', borderRadius: 999, border: `1.5px solid ${WF.lime}`,
              color: WF.lime, fontFamily: WF.ui, fontWeight: 600, fontSize: 14,
            }}>Reservar pista</span>
          </div>
        </div>
        {/* RIGHT — agenda hoy */}
        <div style={{ padding: '30px 36px', background: WF.paper, borderLeft: `1.5px solid ${WF.ink}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: WF.ui, fontSize: 16, fontWeight: 700, margin: 0 }}>Hoy · martes 20</h2>
            <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>3 con plazas libres</span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { time: '17:30', cat: 'M', filled: 4, max: 4, pista: 'P3 indoor', nivel: 3, accent: false },
              { time: '19:00', cat: 'X', filled: 3, max: 4, pista: 'P1 outdoor', nivel: 3, accent: true },
              { time: '20:30', cat: 'F', filled: 2, max: 4, pista: 'P2 indoor', nivel: 2, accent: false },
              { time: '22:00', cat: 'M', filled: 1, max: 4, pista: 'P4 outdoor', nivel: 4, accent: false },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr auto',
                gap: 12, alignItems: 'center',
                padding: '10px 12px',
                border: `1.5px solid ${WF.ink}`,
                borderRadius: 6,
                boxShadow: p.accent ? `2px 2px 0 0 ${WF.limeDeep}` : `1px 1px 0 0 ${WF.ink2}`,
                background: WF.fill,
                ...(p.accent ? { borderColor: WF.limeDeep, borderWidth: 2 } : {}),
              }}>
                <div>
                  <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 18 }}>{p.time}</div>
                  <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted }}>90 min</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CatChip cat={p.cat} sm />
                    <span style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2 }}>{p.pista}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <LevelBalls value={p.nivel} size={8} />
                    <AvatarRow avatars={['M', 'A', 'J', 'K'].slice(0, p.filled)} empty={p.max - p.filled} size={18} />
                  </div>
                </div>
                <span style={{ fontFamily: WF.ui, fontWeight: 700, fontSize: 12, color: p.filled === p.max ? WF.muted : WF.limeDeep }}>
                  {p.filled === p.max ? 'LLENO' : 'APUNTARME'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

function HomeB_Mobile() {
  return (
    <PhoneFrame label="Home B · split">
      <div style={{ padding: '14px 14px 20px', background: WF.navy, color: '#E8ECF2', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoFlat size={20} color={WF.lime} />
          <span style={{ fontFamily: WF.hand, fontSize: 10, color: WF.lime }}>🔔</span>
        </div>
        <div style={{ position: 'relative', margin: '12px auto', width: 120, height: 120 }}>
          <LogoFlat size={120} color={WF.lime} />
        </div>
        <h1 style={{ fontFamily: WF.ui, fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1 }}>
          Pachangas<br/><span style={{ color: WF.lime }}>todos los días.</span>
        </h1>
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <Btn primary sm>+ Crear</Btn>
          <span style={{
            padding: '6px 10px', borderRadius: 999, border: `1.5px solid ${WF.lime}`,
            color: WF.lime, fontFamily: WF.ui, fontSize: 11, fontWeight: 600,
          }}>Reservar</span>
        </div>
      </div>
      <div style={{ padding: '12px 14px 70px', background: WF.paper }}>
        <div style={{ fontFamily: WF.ui, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Hoy · 4 partidos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { t: '17:30', c: 'M', f: 4 }, { t: '19:00', c: 'X', f: 3, a: true },
            { t: '20:30', c: 'F', f: 2 },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 8, alignItems: 'center',
              padding: 8, border: `1.5px solid ${WF.ink}`, borderRadius: 6,
              background: WF.fill,
              ...(p.a ? { borderColor: WF.limeDeep, borderWidth: 2 } : {}),
            }}>
              <span style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 13 }}>{p.t}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CatChip cat={p.c} sm /><span style={{ fontSize: 10, color: WF.ink2 }}>{p.f}/4</span>
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: p.f === 4 ? WF.muted : WF.limeDeep }}>{p.f === 4 ? 'LLENO' : '＋'}</span>
            </div>
          ))}
        </div>
      </div>
      <MobileTabs active="Inicio" />
    </PhoneFrame>
  );
}

// =================== VARIANTE C — Inmersivo full-bleed con reveal protagonista ===================
function HomeC_Desktop() {
  return (
    <DesktopFrame label="Home C · inmersivo">
      {/* sticky header (small flat logo reaparece) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', background: 'transparent',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: WF.lime, fontFamily: WF.ui, fontWeight: 700, fontSize: 13 }}>
          <LogoFlat size={20} color={WF.lime} /> MONTESIÑA
        </span>
        <span style={{ display: 'inline-flex', gap: 14, fontFamily: WF.ui, fontSize: 12, color: '#aab' }}>
          <span>Pachangas</span><span>Pistas</span><span>Entrar</span>
        </span>
      </div>
      {/* full-bleed navy hero */}
      <div style={{
        height: 460, background: `radial-gradient(ellipse at center, #1a2a47 0%, ${WF.navy2} 70%)`,
        color: '#E8ECF2', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* big composing logo */}
        <div style={{ position: 'relative' }}>
          <Box w={300} h={300} fill="transparent" style={{ borderColor: WF.lime, borderStyle: 'dashed', boxShadow: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoFlat size={260} color={WF.lime} />
            </div>
            <Annot dir="left" style={{ top: -28, left: -150, color: WF.lime }}>
              sticky section:<br/>scroll-linked<br/>opacity + scale
            </Annot>
            <Annot dir="right" style={{ top: 100, right: -180, color: WF.lime }}>
              astas y cabeza<br/>entran con<br/>stagger ↗
            </Annot>
            <Annot dir="down" style={{ bottom: -32, right: -120, color: WF.lime }}>
              glow se intensifica
            </Annot>
          </Box>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, 180px)', textAlign: 'center', width: 360 }}>
            <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.lime, letterSpacing: 3 }}>EST. 1994</div>
            <div style={{ fontFamily: WF.ui, fontSize: 13, color: '#cdd' }}>Pádel · pachangas · pistas</div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: WF.hand, fontSize: 11, color: WF.lime, opacity: 0.7 }}>
          ↓ scroll
        </div>
      </div>
      {/* sección que aparece debajo */}
      <div style={{ padding: '34px 60px', background: WF.paper, borderTop: `1.5px solid ${WF.ink}` }}>
        <h2 style={{ fontFamily: WF.ui, fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>
          ¿Para hoy o para esta semana?
        </h2>
        <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2, marginBottom: 16 }}>
          Tres tipos de partido. Apúntate o crea el tuyo.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { cat: 'M', label: 'Masculino', n: 7 },
            { cat: 'F', label: 'Femenino', n: 4 },
            { cat: 'X', label: 'Mixto', n: 9 },
          ].map(c => (
            <Box key={c.cat} fill={WF.fill} style={{ padding: 16 }}>
              <CatChip cat={c.cat} />
              <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 28, marginTop: 10 }}>{c.n}</div>
              <div style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2 }}>partidos esta semana</div>
              <div style={{ marginTop: 12, fontFamily: WF.hand, fontSize: 13, color: WF.limeDeep }}>ver {c.label.toLowerCase()} →</div>
            </Box>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

function HomeC_Mobile() {
  return (
    <PhoneFrame label="Home C · inmersivo">
      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, height: 360, background: `radial-gradient(ellipse at center, #1a2a47 0%, ${WF.navy2} 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <LogoFlat size={180} color={WF.lime} />
        </div>
        <div style={{ position: 'absolute', top: 10, left: 14, color: WF.lime, fontFamily: WF.ui, fontWeight: 700, fontSize: 12 }}>MONTESIÑA</div>
        <div style={{ position: 'absolute', top: 10, right: 14, color: '#aab', fontFamily: WF.ui, fontSize: 11 }}>Entrar</div>
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: WF.lime, fontFamily: WF.hand, fontSize: 10 }}>↓ scroll</div>
      </div>
      <div style={{ position: 'absolute', top: 382, left: 0, right: 0, bottom: 50, padding: '14px', background: WF.paper, borderTop: `1.5px solid ${WF.ink}` }}>
        <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 16 }}>¿Para hoy?</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {['M', 'F', 'X'].map(c => (
            <div key={c} style={{ flex: 1, padding: 8, border: `1.5px solid ${WF.ink}`, borderRadius: 6, textAlign: 'center', background: WF.fill }}>
              <CatChip cat={c} sm />
              <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 18, marginTop: 4 }}>{c === 'M' ? 7 : c === 'F' ? 4 : 9}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Btn primary full sm>Apuntarme →</Btn>
          <Btn ghost full sm>Crear pachanga</Btn>
        </div>
      </div>
      <MobileTabs active="Inicio" />
    </PhoneFrame>
  );
}

Object.assign(window, {
  HomeA_Desktop, HomeA_Mobile,
  HomeB_Desktop, HomeB_Mobile,
  HomeC_Desktop, HomeC_Mobile,
});
