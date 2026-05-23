// Listado de pachangas — 5 layouts distintos

// ============== L1 — Cards verticales + filtros laterales (Airbnb) ==============
function ListA_Desktop() {
  return (
    <DesktopFrame label="Listado · cards + filtros lat." h={760}>
      <TopBar active="Pachangas" />
      {/* tabs por categoría */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: `1.5px solid ${WF.ink}`, background: WF.paper }}>
        {['Todas', 'Masculino', 'Femenino', 'Mixto'].map((t, i) => (
          <span key={t} style={{
            padding: '6px 12px', borderRadius: 999,
            border: `1.5px solid ${WF.ink}`,
            background: i === 0 ? WF.lime : WF.fill,
            fontFamily: WF.ui, fontSize: 12, fontWeight: 600,
          }}>{t}</span>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>12 pachangas</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 520 }}>
        {/* filtros laterales */}
        <div style={{ padding: '20px 18px', borderRight: `1.5px solid ${WF.ink}`, background: WF.paperAlt }}>
          <div style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Filtros</div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 6 }}>FECHA</div>
            {['Hoy', 'Mañana', 'Esta semana', 'Elegir…'].map((o, i) => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: WF.ui, fontSize: 12, padding: '3px 0' }}>
                <span style={{ width: 12, height: 12, border: `1.2px solid ${WF.ink}`, borderRadius: 3, background: i === 0 ? WF.lime : WF.fill, position: 'relative' }}>
                  {i === 0 && <span style={{ position: 'absolute', inset: 0, textAlign: 'center', fontSize: 10, lineHeight: '10px' }}>✓</span>}
                </span>
                {o}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 6 }}>NIVEL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LevelBalls value={2} size={12} />
              <span style={{ fontFamily: WF.hand, fontSize: 11, color: WF.ink2 }}>2 — 4</span>
            </div>
            <div style={{ marginTop: 6, height: 4, background: WF.fill, border: `1px solid ${WF.ink}`, borderRadius: 2, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '20%', right: '20%', top: -1, bottom: -1, background: WF.lime, border: `1px solid ${WF.ink}`, borderRadius: 2 }} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 6 }}>PLAZAS</div>
            {['Con plaza libre', 'Lista de espera'].map((o, i) => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: WF.ui, fontSize: 12, padding: '3px 0' }}>
                <span style={{ width: 12, height: 12, border: `1.2px solid ${WF.ink}`, borderRadius: 3, background: i === 0 ? WF.lime : WF.fill }} />
                {o}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 6 }}>PISTA</div>
            {['Indoor', 'Outdoor'].map(o => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: WF.ui, fontSize: 12, padding: '3px 0' }}>
                <span style={{ width: 12, height: 12, border: `1.2px solid ${WF.ink}`, borderRadius: 3, background: WF.fill }} />
                {o}
              </label>
            ))}
          </div>

          <Btn ghost sm full>Limpiar filtros</Btn>
        </div>
        {/* grid cards */}
        <div style={{ padding: '20px 22px', background: WF.paper }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <PachangaCard cat="X" date="HOY · 19:00" filled={3} accent />
            <PachangaCard cat="M" date="HOY · 20:30" pista="P1 · outdoor" filled={2} nivel={4} organizer="Carlos R." />
            <PachangaCard cat="F" date="HOY · 21:00" pista="P2 · indoor" filled={4} nivel={2} organizer="Lucía V." />
            <PachangaCard cat="X" date="MAÑ · 18:00" filled={1} nivel={3} organizer="Sofía B." />
            <PachangaCard cat="M" date="MAÑ · 19:00" filled={4} nivel={5} pista="P4 · indoor" organizer="Toni G." />
            <PachangaCard cat="F" date="MAÑ · 20:00" filled={3} nivel={3} pista="P3 · outdoor" organizer="Eva M." />
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontFamily: WF.hand, fontSize: 13, color: WF.muted }}>
            ↓ cargar más
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

// ============== L2 — Lista densa agenda (móvil-friendly) ==============
function ListB_Desktop() {
  const rows = [
    { day: 'HOY · MAR 20', items: [
      { t: '17:30', c: 'M', p: 'Pista 3 · indoor', n: 3, f: 4, m: 4, org: 'David P.' },
      { t: '19:00', c: 'X', p: 'Pista 1 · outdoor', n: 3, f: 3, m: 4, org: 'Marta L.', a: true },
      { t: '20:30', c: 'F', p: 'Pista 2 · indoor', n: 2, f: 2, m: 4, org: 'Lucía V.' },
      { t: '22:00', c: 'M', p: 'Pista 4 · outdoor', n: 4, f: 1, m: 4, org: 'Iván R.' },
    ]},
    { day: 'MAÑANA · MIÉ 21', items: [
      { t: '18:00', c: 'X', p: 'Pista 3 · indoor', n: 3, f: 1, m: 4, org: 'Sofía B.' },
      { t: '19:00', c: 'M', p: 'Pista 1 · outdoor', n: 5, f: 4, m: 4, org: 'Toni G.' },
    ]},
    { day: 'ESTA SEMANA', items: [
      { t: 'JUE 18:00', c: 'F', p: 'Pista 2 · indoor', n: 3, f: 3, m: 4, org: 'Eva M.' },
    ]},
  ];
  return (
    <DesktopFrame label="Listado · agenda densa">
      <TopBar active="Pachangas" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderBottom: `1.5px solid ${WF.ink}`, background: WF.paper }}>
        {['Todas', 'M', 'F', 'X'].map((t, i) => (
          <span key={t} style={{
            padding: '4px 10px', borderRadius: 999, border: `1.2px solid ${WF.ink}`,
            background: i === 0 ? WF.lime : WF.fill, fontFamily: WF.ui, fontSize: 11, fontWeight: 700,
          }}>{t}</span>
        ))}
        <span style={{ marginLeft: 16, fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>nivel: cualquiera · plazas: libres</span>
        <span style={{ marginLeft: 'auto' }}><Btn primary sm icon="+">Crear</Btn></span>
      </div>
      <div style={{ padding: '12px 22px', background: WF.paperAlt }}>
        {rows.map((r) => (
          <div key={r.day} style={{ marginBottom: 18 }}>
            <div style={{
              fontFamily: WF.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: WF.muted,
              padding: '8px 0', borderBottom: `1px dashed ${WF.muted}`, marginBottom: 6,
            }}>{r.day}</div>
            <div style={{
              border: `1.5px solid ${WF.ink}`, borderRadius: 8, overflow: 'hidden', background: WF.fill,
            }}>
              {r.items.map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '90px 90px 1fr 140px 110px 100px',
                  alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderTop: i ? `1px solid ${WF.fillAlt}` : 'none',
                  background: p.a ? '#fafce0' : WF.fill,
                }}>
                  <span style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 14 }}>{p.t}</span>
                  <CatChip cat={p.c} sm />
                  <span style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2 }}>{p.p}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <LevelBalls value={p.n} size={8} />
                    <span style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted }}>N{p.n}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <AvatarRow avatars={['M', 'A', 'J', 'K'].slice(0, p.f)} empty={p.m - p.f} size={18} />
                    <span style={{ fontFamily: WF.ui, fontSize: 11, color: p.f === p.m ? WF.muted : WF.limeDeep, fontWeight: 700 }}>{p.f}/{p.m}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <Btn primary={!p.a} ghost={p.f === p.m} sm>{p.f === p.m ? 'En espera' : p.a ? 'Apuntarme' : '＋'}</Btn>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DesktopFrame>
  );
}

// ============== L3 — Calendario semanal con slots ==============
function ListC_Desktop() {
  const days = ['LUN 19', 'MAR 20', 'MIÉ 21', 'JUE 22', 'VIE 23', 'SÁB 24', 'DOM 25'];
  const hours = ['10', '12', '14', '16', '18', '20', '22'];
  // pre-canned events by [day, slot]
  const events = {
    '1-4': { c: 'X', f: 3, m: 4, a: true }, // mar 18
    '1-5': { c: 'M', f: 4, m: 4 }, // mar 20
    '2-3': { c: 'F', f: 2, m: 4 }, // mié 16
    '2-5': { c: 'X', f: 1, m: 4 },
    '3-4': { c: 'M', f: 4, m: 4 },
    '4-5': { c: 'F', f: 3, m: 4 },
    '5-3': { c: 'X', f: 2, m: 4 },
    '5-5': { c: 'M', f: 3, m: 4 },
    '6-2': { c: 'X', f: 1, m: 4 },
    '6-4': { c: 'F', f: 4, m: 4 },
  };
  return (
    <DesktopFrame label="Listado · calendario semanal">
      <TopBar active="Pachangas" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderBottom: `1.5px solid ${WF.ink}`, background: WF.paper }}>
        <span style={{ fontFamily: WF.hand, fontSize: 14 }}>← Sem 21 →</span>
        <span style={{ marginLeft: 14, fontFamily: WF.ui, fontSize: 13, fontWeight: 700 }}>Mayo 2026</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
          {['M', 'F', 'X'].map((c, i) => <span key={c} style={{ opacity: 0.9 }}><CatChip cat={c} sm /></span>)}
        </span>
      </div>
      <div style={{ padding: '14px 22px', background: WF.paper }}>
        <div style={{ display: 'grid', gridTemplateColumns: `42px repeat(7, 1fr)`, gap: 4 }}>
          <div />
          {days.map(d => (
            <div key={d} style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.ink2, textAlign: 'center', padding: '4px 0' }}>
              {d}
            </div>
          ))}
          {hours.map((h, hi) => (
            <React.Fragment key={h}>
              <div style={{ fontFamily: WF.ui, fontSize: 10, color: WF.muted, textAlign: 'right', paddingRight: 4, paddingTop: 6 }}>{h}h</div>
              {days.map((_, di) => {
                const ev = events[`${di}-${hi}`];
                const full = ev && ev.f === ev.m;
                return (
                  <div key={`${di}-${hi}`} style={{
                    height: 52,
                    border: `1px dashed ${WF.muted}`,
                    background: ev ? (full ? WF.fillAlt : WF.fill) : 'transparent',
                    borderRadius: 4,
                    padding: 3,
                    position: 'relative',
                    ...(ev && ev.a ? { borderStyle: 'solid', borderColor: WF.limeDeep, borderWidth: 2, background: '#fafce0' } : {}),
                  }}>
                    {ev && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <CatChip cat={ev.c} sm />
                        <span style={{ fontFamily: WF.ui, fontSize: 10, fontWeight: 700, color: full ? WF.muted : WF.ink }}>
                          {ev.f}/{ev.m}{full ? ' ⏳' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 16, fontFamily: WF.hand, fontSize: 12, color: WF.ink2 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fafce0', border: `1px solid ${WF.limeDeep}`, marginRight: 4, verticalAlign: -1 }} /> con plaza</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: WF.fillAlt, border: `1px solid ${WF.muted}`, marginRight: 4, verticalAlign: -1 }} /> lleno (lista espera)</span>
          <span style={{ marginLeft: 'auto' }}>click sobre slot vacío → crear pachanga</span>
        </div>
      </div>
    </DesktopFrame>
  );
}

// ============== L4 — Mobile listado (agenda + tabs + chips) ==============
function ListMobile() {
  const days = [
    { day: 'HOY · MAR 20', items: [
      { t: '17:30', c: 'M', f: 4, m: 4 },
      { t: '19:00', c: 'X', f: 3, m: 4, a: true },
      { t: '20:30', c: 'F', f: 2, m: 4 },
    ]},
    { day: 'MAÑANA', items: [
      { t: '18:00', c: 'X', f: 1, m: 4 },
      { t: '19:00', c: 'M', f: 4, m: 4 },
    ]},
  ];
  return (
    <PhoneFrame label="Listado · mobile">
      <div style={{ padding: '10px 14px 8px', borderBottom: `1.5px solid ${WF.ink}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 16 }}>Pachangas</div>
          <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>⏷ filtros</span>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 8, overflow: 'hidden' }}>
          {['Todas', 'M', 'F', 'Mixto'].map((t, i) => (
            <span key={t} style={{
              padding: '4px 9px', borderRadius: 999, border: `1.2px solid ${WF.ink}`,
              background: i === 0 ? WF.lime : WF.fill, fontFamily: WF.ui, fontSize: 10, fontWeight: 700,
            }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 12px 70px', overflow: 'hidden' }}>
        {days.map((r) => (
          <div key={r.day} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: WF.muted, marginBottom: 4 }}>{r.day}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.items.map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 8, alignItems: 'center',
                  padding: 8, border: `1.5px solid ${WF.ink}`, borderRadius: 6,
                  background: WF.fill,
                  ...(p.a ? { borderColor: WF.limeDeep, borderWidth: 2 } : {}),
                }}>
                  <span style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 13 }}>{p.t}</span>
                  <span>
                    <CatChip cat={p.c} sm />
                    <div style={{ fontFamily: WF.hand, fontSize: 10, color: WF.muted, marginTop: 2 }}>P{i+1} · indoor</div>
                  </span>
                  <span style={{ fontFamily: WF.ui, fontSize: 10, fontWeight: 700, color: p.f === p.m ? WF.muted : WF.limeDeep }}>
                    {p.f}/{p.m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* FAB */}
      <span style={{
        position: 'absolute', right: 14, bottom: 60,
        width: 44, height: 44, borderRadius: '50%',
        background: WF.lime, border: `1.5px solid ${WF.ink}`,
        boxShadow: `2px 2px 0 0 ${WF.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 800,
      }}>+</span>
      <MobileTabs active="Pachangas" />
    </PhoneFrame>
  );
}

Object.assign(window, { ListA_Desktop, ListB_Desktop, ListC_Desktop, ListMobile });
