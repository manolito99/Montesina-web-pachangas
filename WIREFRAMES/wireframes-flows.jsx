// Detalle pachanga + Crear wizard + Reservar pista

// =================== DETALLE PACHANGA (desktop + mobile) ===================
function DetailDesktop() {
  return (
    <DesktopFrame label="Detalle pachanga · mixto" h={760}>
      <TopBar active="Pachangas" />
      <div style={{ padding: '14px 24px 8px', borderBottom: `1px dashed ${WF.muted}`, fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>
        ← volver al listado
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 600 }}>
        {/* MAIN */}
        <div style={{ padding: '20px 28px', background: WF.paper }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CatChip cat="X" />
            <span style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2 }}>Pachanga · #1287</span>
            <span style={{ marginLeft: 'auto', fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>creada por Marta L. · hace 2 h</span>
          </div>
          <h1 style={{ fontFamily: WF.ui, fontSize: 30, fontWeight: 800, margin: '12px 0 4px', letterSpacing: -0.5 }}>
            Martes 20 · 19:00 — 20:30
          </h1>
          <div style={{ fontFamily: WF.ui, fontSize: 14, color: WF.ink2 }}>Pista 1 · outdoor · Montesiña</div>

          {/* meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 18 }}>
            {[
              ['CATEGORÍA', 'Mixto'],
              ['NIVEL', null],
              ['PLAZAS', '3/4'],
              ['PRECIO', '8 € / jug.'],
            ].map(([k, v], i) => (
              <Box key={k} fill={WF.fill} style={{ padding: 10, boxShadow: 'none' }}>
                <div style={{ fontFamily: WF.ui, fontSize: 10, color: WF.muted, fontWeight: 700, letterSpacing: 1 }}>{k}</div>
                <div style={{ fontFamily: WF.ui, fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                  {k === 'NIVEL' ? <LevelBalls value={3} size={12} /> : v}
                </div>
              </Box>
            ))}
          </div>

          {/* Mixto: equilibrio H/M */}
          <Card style={{ marginTop: 16, padding: 14, position: 'relative' }} accent>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: WF.ui, fontWeight: 700, fontSize: 13 }}>Equilibrio mixto</span>
              <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.limeDeep }}>2H / 2M</span>
              <Annot dir="right" style={{ position: 'absolute', top: -28, right: 0 }}>
                solo deja apuntarse si<br/>encaja el equilibrio →
              </Annot>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div>
                <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.muted, fontWeight: 700 }}>HOMBRES (2/2)</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <Avatar label="C" lime size={32} />
                  <Avatar label="J" lime size={32} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.muted, fontWeight: 700 }}>MUJERES (1/2)</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <Avatar label="M" lime size={32} />
                  <Avatar label="+" dashed size={32} />
                </div>
                <div style={{ fontFamily: WF.hand, fontSize: 11, color: WF.limeDeep, marginTop: 4 }}>↑ falta 1 mujer</div>
              </div>
            </div>
          </Card>

          {/* Notas */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.muted, fontWeight: 700, letterSpacing: 1 }}>NOTAS DE LA ORGANIZADORA</div>
            <div style={{
              marginTop: 6, padding: 12, fontFamily: WF.ui, fontSize: 13, color: WF.ink2,
              background: WF.fillAlt, border: `1px dashed ${WF.muted}`, borderRadius: 6,
            }}>
              "Buscamos nivel medio. Llevo pelotas. Cancelo si llueve antes de las 17h."
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Btn primary>Apuntarme (queda 1 plaza)</Btn>
            <Btn ghost>Compartir</Btn>
            <span style={{ marginLeft: 'auto', fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>
              cancelación hasta 12h antes
            </span>
          </div>
        </div>

        {/* SIDEBAR — chat + lista espera */}
        <div style={{ borderLeft: `1.5px solid ${WF.ink}`, background: WF.paperAlt, display: 'flex', flexDirection: 'column' }}>
          {/* Lista de espera */}
          <div style={{ padding: '16px 16px 10px', borderBottom: `1px dashed ${WF.muted}` }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: WF.muted }}>LISTA DE ESPERA · 2</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <Avatar label="P" size={26} />
              <span style={{ fontFamily: WF.ui, fontSize: 12 }}>Pedro G. <span style={{ color: WF.muted }}>· nivel 3</span></span>
              <span style={{ marginLeft: 'auto', fontFamily: WF.hand, fontSize: 10, color: WF.muted }}>#1</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <Avatar label="N" size={26} />
              <span style={{ fontFamily: WF.ui, fontSize: 12 }}>Nuria C. <span style={{ color: WF.muted }}>· nivel 3</span></span>
              <span style={{ marginLeft: 'auto', fontFamily: WF.hand, fontSize: 10, color: WF.muted }}>#2</span>
            </div>
          </div>
          {/* Chat */}
          <div style={{ padding: '12px 14px 8px', flex: 1 }}>
            <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: WF.muted, marginBottom: 8 }}>CHAT · 3</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ChatMsg who="Marta L." text="Llevo yo botes!" time="17:02" mine />
              <ChatMsg who="Carlos R." text="Yo voy 5 min tarde, esperadme 🏃" time="18:30" />
              <ChatMsg who="Javi M." text="Confirmadlo si llueve" time="18:42" />
            </div>
            <div style={{
              marginTop: 12, padding: 8, border: `1.2px solid ${WF.ink}`, borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 6, background: WF.fill,
            }}>
              <span style={{ flex: 1, fontFamily: WF.ui, fontSize: 12, color: WF.muted }}>Escribe un mensaje…</span>
              <span style={{ fontFamily: WF.hand, fontSize: 14, color: WF.limeDeep }}>↑</span>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

function ChatMsg({ who, text, time, mine }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
      <div style={{
        fontFamily: WF.ui, fontSize: 12,
        padding: '6px 10px',
        borderRadius: 12,
        border: `1.2px solid ${WF.ink}`,
        background: mine ? WF.lime : WF.fill,
        maxWidth: 220,
      }}>{text}</div>
      <div style={{ fontFamily: WF.hand, fontSize: 10, color: WF.muted, marginTop: 2 }}>
        {who} · {time}
      </div>
    </div>
  );
}

function DetailMobile() {
  return (
    <PhoneFrame label="Detalle · mobile + estado completo">
      <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1.5px solid ${WF.ink}` }}>
        <span style={{ fontFamily: WF.hand, fontSize: 13 }}>←</span>
        <span style={{ fontFamily: WF.ui, fontSize: 12, fontWeight: 700 }}>Pachanga #1287</span>
        <span style={{ fontFamily: WF.hand, fontSize: 13 }}>⋯</span>
      </div>
      <div style={{ padding: '12px 14px 60px', overflow: 'hidden' }}>
        <CatChip cat="X" sm />
        <div style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>
          Mar 20 · 19:00 — 20:30
        </div>
        <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.ink2, marginTop: 2 }}>Pista 1 · outdoor</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
          <Box style={{ padding: 8, boxShadow: 'none' }}>
            <div style={{ fontSize: 9, color: WF.muted, fontWeight: 700 }}>NIVEL</div>
            <LevelBalls value={3} size={9} />
          </Box>
          <Box style={{ padding: 8, boxShadow: 'none' }}>
            <div style={{ fontSize: 9, color: WF.muted, fontWeight: 700 }}>PRECIO</div>
            <div style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: 700 }}>8€ / jug.</div>
          </Box>
        </div>

        <div style={{
          marginTop: 10, padding: 10, border: `2px solid ${WF.limeDeep}`, borderRadius: 8, background: WF.fill,
        }}>
          <div style={{ fontFamily: WF.ui, fontSize: 10, color: WF.muted, fontWeight: 700 }}>EQUILIBRIO 2H / 2M</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <Avatar label="C" lime size={26} />
            <Avatar label="J" lime size={26} />
            <Avatar label="M" lime size={26} />
            <Avatar label="?" dashed size={26} />
          </div>
          <div style={{ fontFamily: WF.hand, fontSize: 10, color: WF.limeDeep, marginTop: 4 }}>↑ falta 1 mujer</div>
        </div>

        <div style={{ marginTop: 10, padding: 8, border: `1px dashed ${WF.muted}`, borderRadius: 6, fontFamily: WF.ui, fontSize: 10, color: WF.ink2 }}>
          "Buscamos nivel medio. Llevo pelotas."
        </div>

        <div style={{ marginTop: 10, fontFamily: WF.ui, fontSize: 10, fontWeight: 700, color: WF.muted, letterSpacing: 1 }}>CHAT</div>
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ChatMsg who="Marta" text="Llevo botes!" time="17:02" mine />
          <ChatMsg who="Carlos" text="Voy 5 min tarde" time="18:30" />
        </div>
      </div>
      {/* sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '8px 14px 14px',
        background: WF.paper, borderTop: `1.5px solid ${WF.ink}`,
        display: 'flex', gap: 6,
      }}>
        <Btn primary full sm>Apuntarme · 1 plaza</Btn>
      </div>
    </PhoneFrame>
  );
}

// =================== ESTADO LLENO + LISTA ESPERA (mini) ===================
function DetailFull() {
  return (
    <PhoneFrame label="Detalle · LLENO (lista espera)">
      <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1.5px solid ${WF.ink}` }}>
        <span style={{ fontFamily: WF.hand, fontSize: 13 }}>←</span>
        <span style={{ fontFamily: WF.ui, fontSize: 12, fontWeight: 700 }}>Pachanga #1290</span>
        <span style={{ fontFamily: WF.hand, fontSize: 13 }}>⋯</span>
      </div>
      <div style={{ padding: '12px 14px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CatChip cat="M" sm />
          <span style={{ fontFamily: WF.ui, fontSize: 10, fontWeight: 700, padding: '2px 6px', border: `1px solid ${WF.ink}`, borderRadius: 4, background: WF.fillAlt }}>COMPLETO</span>
        </div>
        <div style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>
          Mié 21 · 19:00 — 20:30
        </div>
        <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.ink2 }}>Pista 4 · indoor</div>

        <div style={{ marginTop: 14, padding: 12, border: `1.5px solid ${WF.ink}`, borderRadius: 8, background: WF.fill }}>
          <div style={{ fontFamily: WF.ui, fontSize: 11, color: WF.muted, fontWeight: 700 }}>JUGADORES · 4/4</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {['T', 'D', 'I', 'A'].map(a => <Avatar key={a} label={a} lime size={28} />)}
          </div>
        </div>

        <div style={{
          marginTop: 12, padding: 12, border: `2px dashed ${WF.limeDeep}`, borderRadius: 8, background: '#fafce0',
          position: 'relative',
        }}>
          <Annot dir="right" style={{ top: -22, right: 0 }}>estado "espera"</Annot>
          <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.limeDeep, letterSpacing: 1 }}>LISTA DE ESPERA · 2</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.muted, width: 16 }}>#1</span>
              <Avatar label="P" size={22} />
              <span style={{ fontFamily: WF.ui, fontSize: 11 }}>Pedro G.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.muted, width: 16 }}>#2</span>
              <Avatar label="Yo" size={22} />
              <span style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700 }}>Tú</span>
              <span style={{ marginLeft: 'auto', fontFamily: WF.hand, fontSize: 10, color: WF.muted }}>te avisaremos</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '8px 14px 14px', background: WF.paper, borderTop: `1.5px solid ${WF.ink}`,
      }}>
        <Btn ghost full sm>Salir de la lista</Btn>
      </div>
    </PhoneFrame>
  );
}

// =================== CREAR PACHANGA — WIZARD 4 PASOS ===================
function WizardStep({ n, title, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <span style={{
        width: 26, height: 26, borderRadius: '50%',
        border: `1.5px solid ${WF.ink}`,
        background: active ? WF.lime : done ? WF.ink2 : WF.fill,
        color: active ? WF.ink : done ? WF.fill : WF.ink,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: WF.ui, fontSize: 12, fontWeight: 700,
      }}>{done ? '✓' : n}</span>
      <span style={{
        fontFamily: WF.ui, fontSize: 12,
        fontWeight: active ? 700 : 500,
        color: active ? WF.ink : WF.muted,
      }}>{title}</span>
      <span style={{ flex: 1, height: 1, borderTop: `1px dashed ${WF.muted}`, marginLeft: 6 }} />
    </div>
  );
}

function CreateWizardStep1() {
  return (
    <DesktopFrame label="Crear pachanga · paso 1/4 · categoría" h={680}>
      <TopBar />
      <div style={{ padding: '22px 28px 0' }}>
        <div style={{ fontFamily: WF.hand, fontSize: 13, color: WF.muted }}>← cancelar</div>
        <h1 style={{ fontFamily: WF.ui, fontSize: 26, fontWeight: 800, margin: '8px 0 18px' }}>Nueva pachanga</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
          <WizardStep n="1" title="Categoría" active />
          <WizardStep n="2" title="Día y hora" />
          <WizardStep n="3" title="Pista y nivel" />
          <WizardStep n="4" title="Plazas y notas" />
        </div>
      </div>
      <div style={{ padding: '0 28px 24px' }}>
        <div style={{ fontFamily: WF.ui, fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          ¿Qué tipo de partido organizas?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { c: 'M', label: 'Masculino', desc: '4 hombres' },
            { c: 'F', label: 'Femenino', desc: '4 mujeres' },
            { c: 'X', label: 'Mixto', desc: '2 H + 2 M', sel: true },
          ].map(o => (
            <div key={o.c} style={{
              padding: 22,
              border: `${o.sel ? 2 : 1.5}px solid ${o.sel ? WF.limeDeep : WF.ink}`,
              borderRadius: 8,
              background: o.sel ? '#fafce0' : WF.fill,
              boxShadow: o.sel ? `3px 3px 0 0 ${WF.limeDeep}` : `2px 2px 0 0 ${WF.ink2}`,
              textAlign: 'center',
              position: 'relative',
            }}>
              <CatChip cat={o.c} />
              <div style={{ fontFamily: WF.ui, fontSize: 18, fontWeight: 800, marginTop: 14 }}>{o.label}</div>
              <div style={{ fontFamily: WF.hand, fontSize: 14, color: WF.ink2, marginTop: 4 }}>{o.desc}</div>
              {o.sel && <div style={{ position: 'absolute', top: 8, right: 10, fontFamily: WF.hand, fontSize: 14, color: WF.limeDeep }}>✓</div>}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 28px', borderTop: `1.5px solid ${WF.ink}`, background: WF.paperAlt,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: WF.hand, fontSize: 13, color: WF.muted }}>paso 1 de 4</span>
        <Btn primary>Siguiente →</Btn>
      </div>
    </DesktopFrame>
  );
}

function CreateWizardStep2() {
  const days = ['MAR 20', 'MIÉ 21', 'JUE 22', 'VIE 23', 'SÁB 24', 'DOM 25', 'LUN 26'];
  const slots = ['17:00', '18:30', '19:00', '20:30', '22:00'];
  return (
    <DesktopFrame label="Crear pachanga · paso 2/4 · día/hora" h={680}>
      <TopBar />
      <div style={{ padding: '22px 28px 0' }}>
        <h1 style={{ fontFamily: WF.ui, fontSize: 26, fontWeight: 800, margin: '8px 0 18px' }}>Nueva pachanga</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          <WizardStep n="1" title="Categoría" done />
          <WizardStep n="2" title="Día y hora" active />
          <WizardStep n="3" title="Pista y nivel" />
          <WizardStep n="4" title="Plazas y notas" />
        </div>
      </div>
      <div style={{ padding: '0 28px 24px' }}>
        <div style={{ fontFamily: WF.ui, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Elige día</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {days.map((d, i) => (
            <div key={d} style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              border: `${i === 2 ? 2 : 1.2}px solid ${i === 2 ? WF.limeDeep : WF.ink}`,
              background: i === 2 ? WF.lime : WF.fill,
              borderRadius: 6,
              fontFamily: WF.ui, fontSize: 12, fontWeight: i === 2 ? 800 : 500,
            }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: WF.ui, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Franja horaria</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {slots.map((s, i) => (
            <span key={s} style={{
              padding: '10px 16px',
              border: `${i === 2 ? 2 : 1.2}px solid ${i === 2 ? WF.limeDeep : WF.ink}`,
              background: i === 4 ? WF.fillAlt : i === 2 ? WF.lime : WF.fill,
              borderRadius: 6,
              fontFamily: WF.ui, fontSize: 13, fontWeight: i === 2 ? 800 : 500,
              color: i === 4 ? WF.muted : WF.ink,
              textDecoration: i === 4 ? 'line-through' : 'none',
            }}>{s}{i === 4 && <span style={{ fontFamily: WF.hand, fontSize: 10, marginLeft: 6 }}>ocupada</span>}</span>
          ))}
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: 700 }}>Duración:</span>
          {['60 min', '90 min', '120 min'].map((d, i) => (
            <span key={d} style={{
              padding: '6px 14px', borderRadius: 999, border: `1.2px solid ${WF.ink}`,
              background: i === 1 ? WF.lime : WF.fill,
              fontFamily: WF.ui, fontSize: 12, fontWeight: i === 1 ? 700 : 500,
            }}>{d}</span>
          ))}
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 28px', borderTop: `1.5px solid ${WF.ink}`, background: WF.paperAlt,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Btn ghost>← Volver</Btn>
        <Btn primary>Siguiente →</Btn>
      </div>
    </DesktopFrame>
  );
}

function CreateWizardStep3() {
  const courts = [
    { n: 'Pista 1', t: 'outdoor', free: true },
    { n: 'Pista 2', t: 'indoor', free: false },
    { n: 'Pista 3', t: 'indoor', free: true, sel: true },
    { n: 'Pista 4', t: 'outdoor', free: true },
  ];
  return (
    <DesktopFrame label="Crear pachanga · paso 3/4 · pista + nivel" h={680}>
      <TopBar />
      <div style={{ padding: '22px 28px 0' }}>
        <h1 style={{ fontFamily: WF.ui, fontSize: 26, fontWeight: 800, margin: '8px 0 18px' }}>Nueva pachanga</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          <WizardStep n="1" title="Categoría" done />
          <WizardStep n="2" title="Día y hora" done />
          <WizardStep n="3" title="Pista y nivel" active />
          <WizardStep n="4" title="Plazas y notas" />
        </div>
      </div>
      <div style={{ padding: '0 28px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        <div>
          <div style={{ fontFamily: WF.ui, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
            Pistas disponibles · mar 20 · 19:00
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {courts.map(c => (
              <div key={c.n} style={{
                padding: 12, display: 'flex', alignItems: 'center', gap: 10,
                border: `${c.sel ? 2 : 1.5}px solid ${c.sel ? WF.limeDeep : WF.ink}`,
                borderRadius: 6,
                background: !c.free ? WF.fillAlt : c.sel ? '#fafce0' : WF.fill,
                opacity: c.free ? 1 : 0.5,
                position: 'relative',
              }}>
                <Placeholder w={50} h={36} label="" style={{ flex: 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: WF.ui, fontWeight: 700, fontSize: 14 }}>{c.n}</div>
                  <div style={{ fontFamily: WF.hand, fontSize: 12, color: WF.muted }}>{c.t}</div>
                </div>
                <span style={{
                  fontFamily: WF.ui, fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 4,
                  background: c.free ? WF.lime : WF.fillAlt,
                  border: `1px solid ${WF.ink}`,
                }}>{c.free ? 'LIBRE' : 'OCUPADA'}</span>
                {c.sel && <span style={{ fontFamily: WF.hand, fontSize: 16, color: WF.limeDeep, marginLeft: 4 }}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontFamily: WF.hand, fontSize: 12, color: WF.muted, position: 'relative' }}>
            <Annot dir="left" style={{ left: 0, top: -22, position: 'static' }}>↑ impide solapamientos de pista</Annot>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: WF.ui, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
            Nivel objetivo (rango)
          </div>
          <div style={{ padding: 16, border: `1.5px solid ${WF.ink}`, borderRadius: 8, background: WF.fill }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: WF.ui, fontSize: 12, color: WF.muted }}>min</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <LevelBalls value={3} size={16} />
              </div>
              <span style={{ fontFamily: WF.ui, fontSize: 12, color: WF.muted, marginLeft: 16 }}>max</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <LevelBalls value={4} size={16} />
              </div>
            </div>
            <div style={{ marginTop: 14, height: 6, background: WF.fillAlt, border: `1px solid ${WF.ink}`, borderRadius: 3, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '40%', right: '20%', top: -1, bottom: -1, background: WF.lime, border: `1px solid ${WF.ink}`, borderRadius: 3 }} />
              <div style={{ position: 'absolute', left: '40%', top: -5, width: 14, height: 14, background: WF.fill, border: `1.5px solid ${WF.ink}`, borderRadius: '50%' }} />
              <div style={{ position: 'absolute', left: '80%', top: -5, width: 14, height: 14, background: WF.fill, border: `1.5px solid ${WF.ink}`, borderRadius: '50%' }} />
            </div>
            <div style={{ marginTop: 16, fontFamily: WF.hand, fontSize: 13, color: WF.ink2 }}>
              Solo se pueden apuntar jugadores entre <b>nivel 3</b> y <b>nivel 4</b>.
            </div>
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 28px', borderTop: `1.5px solid ${WF.ink}`, background: WF.paperAlt,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Btn ghost>← Volver</Btn>
        <Btn primary>Siguiente →</Btn>
      </div>
    </DesktopFrame>
  );
}

function CreateWizardStep4() {
  return (
    <DesktopFrame label="Crear pachanga · paso 4/4 · resumen" h={680}>
      <TopBar />
      <div style={{ padding: '22px 28px 0' }}>
        <h1 style={{ fontFamily: WF.ui, fontSize: 26, fontWeight: 800, margin: '8px 0 18px' }}>Nueva pachanga</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
          <WizardStep n="1" title="Categoría" done />
          <WizardStep n="2" title="Día y hora" done />
          <WizardStep n="3" title="Pista y nivel" done />
          <WizardStep n="4" title="Plazas y notas" active />
        </div>
      </div>
      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Plazas</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {[2, 4].map(n => (
              <span key={n} style={{
                padding: '8px 18px', borderRadius: 6,
                border: `${n === 4 ? 2 : 1.2}px solid ${n === 4 ? WF.limeDeep : WF.ink}`,
                background: n === 4 ? WF.lime : WF.fill,
                fontFamily: WF.ui, fontSize: 13, fontWeight: n === 4 ? 700 : 500,
              }}>{n} jugadores</span>
            ))}
          </div>

          <div style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Precio por jugador</div>
          <Box w={140} h={40} style={{ padding: 8, marginBottom: 18, boxShadow: 'none' }}>
            <div style={{ fontFamily: WF.ui, fontSize: 14, fontWeight: 700 }}>8,00 €</div>
          </Box>

          <div style={{ fontFamily: WF.ui, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Notas (opcional)</div>
          <div style={{ padding: 10, border: `1.5px solid ${WF.ink}`, borderRadius: 6, background: WF.fill, minHeight: 80, fontFamily: WF.ui, fontSize: 13, color: WF.ink2 }}>
            Buscamos nivel medio. Llevo pelotas. Cancelo si llueve antes de las 17h.
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 32, height: 18, background: WF.lime, border: `1.2px solid ${WF.ink}`, borderRadius: 999, position: 'relative' }}>
              <span style={{ position: 'absolute', right: 1, top: 1, width: 14, height: 14, background: WF.fill, border: `1.2px solid ${WF.ink}`, borderRadius: '50%' }} />
            </span>
            <span style={{ fontFamily: WF.ui, fontSize: 12 }}>Avísame si se llena</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 8 }}>RESUMEN</div>
          <Box style={{ padding: 14, boxShadow: 'none' }}>
            <CatChip cat="X" />
            <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 18, marginTop: 8 }}>Mar 20 · 19:00</div>
            <div style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2 }}>90 min · Pista 3 · indoor</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LevelBalls value={4} size={10} />
              <span style={{ fontFamily: WF.hand, fontSize: 11, color: WF.muted }}>nivel 3 — 4</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <AvatarRow avatars={['Yo']} empty={3} size={22} />
            </div>
          </Box>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 28px', borderTop: `1.5px solid ${WF.ink}`, background: WF.paperAlt,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Btn ghost>← Volver</Btn>
        <Btn primary>Publicar pachanga ✓</Btn>
      </div>
    </DesktopFrame>
  );
}

// =================== RESERVAR PISTA — Doodle grid ===================
function CourtBooking() {
  const courts = ['Pista 1 · out', 'Pista 2 · in', 'Pista 3 · in', 'Pista 4 · out'];
  const hours = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
  // Define occupancy: court x hour -> state
  // 0 free, 1 my-selection, 2 pachanga, 3 reserved
  const grid = [
    [0, 0, 3, 3, 0, 0, 0, 2, 2, 1, 1, 1, 0], // P1
    [0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0], // P2
    [3, 3, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0], // P3
    [0, 0, 0, 2, 2, 0, 0, 3, 3, 0, 0, 2, 2], // P4
  ];
  const colorOf = (s) => s === 0 ? WF.fill : s === 1 ? WF.lime : s === 2 ? '#cfe8ff' : WF.fillAlt;
  const labelOf = (s) => s === 1 ? 'TÚ' : s === 2 ? 'pach.' : s === 3 ? 'rsv.' : '';
  return (
    <DesktopFrame label="Reservar pista · Doodle grid">
      <TopBar active="Pistas" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderBottom: `1.5px solid ${WF.ink}`, background: WF.paper }}>
        <span style={{ fontFamily: WF.hand, fontSize: 14 }}>← Mar 20 →</span>
        <span style={{ marginLeft: 14, fontFamily: WF.ui, fontSize: 13, fontWeight: 700 }}>Martes 20 de mayo</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 10, fontFamily: WF.hand, fontSize: 12, color: WF.ink2 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: WF.fill, border: `1px solid ${WF.ink}`, verticalAlign: -1, marginRight: 4 }} /> libre</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#cfe8ff', border: `1px solid ${WF.ink}`, verticalAlign: -1, marginRight: 4 }} /> pachanga</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: WF.fillAlt, border: `1px solid ${WF.ink}`, verticalAlign: -1, marginRight: 4 }} /> reservada</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: WF.lime, border: `1px solid ${WF.ink}`, verticalAlign: -1, marginRight: 4 }} /> tu selección</span>
        </span>
      </div>
      <div style={{ padding: '18px 22px', background: WF.paper }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${hours.length}, 1fr)`, gap: 3 }}>
          <div />
          {hours.map(h => (
            <div key={h} style={{ fontFamily: WF.ui, fontSize: 10, color: WF.muted, textAlign: 'center', fontWeight: 700 }}>{h}</div>
          ))}
          {courts.map((c, ci) => (
            <React.Fragment key={c}>
              <div style={{ fontFamily: WF.ui, fontSize: 11, fontWeight: 700, padding: '8px 8px 0 0', textAlign: 'right' }}>{c}</div>
              {grid[ci].map((s, hi) => (
                <div key={hi} style={{
                  height: 36, borderRadius: 4,
                  border: `1px ${s === 1 ? 'solid' : 'dashed'} ${s === 1 ? WF.limeDeep : WF.muted}`,
                  borderWidth: s === 1 ? 2 : 1,
                  background: colorOf(s),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: WF.ui, fontSize: 10, color: WF.ink2, fontWeight: 600,
                }}>{labelOf(s)}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
        {/* Selection summary */}
        <div style={{ marginTop: 18, padding: 14, border: `2px solid ${WF.limeDeep}`, borderRadius: 8, background: '#fafce0', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <Annot dir="left" style={{ top: -22, left: 10 }}>arrastra para extender la selección</Annot>
          <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 18 }}>19:00 — 21:30</div>
          <div style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2 }}>Pista 1 · outdoor · 2,5 h</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: WF.ui, fontSize: 13, color: WF.ink2 }}>20,00 €</span>
            <Btn primary>Reservar</Btn>
            <Btn ghost>+ Crear pachanga aquí</Btn>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

function CourtBookingMobile() {
  return (
    <PhoneFrame label="Reservar · mobile">
      <div style={{ padding: '10px 14px', borderBottom: `1.5px solid ${WF.ink}` }}>
        <div style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 14 }}>Reservar pista</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontFamily: WF.hand, fontSize: 11 }}>
          <span>←</span><span style={{ flex: 1, textAlign: 'center', fontFamily: WF.ui, fontWeight: 700, fontSize: 11 }}>MAR 20</span><span>→</span>
        </div>
      </div>
      <div style={{ padding: '10px 12px 70px' }}>
        <div style={{ fontFamily: WF.ui, fontSize: 10, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 6 }}>1. PISTA</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {['P1', 'P2', 'P3', 'P4'].map((p, i) => (
            <span key={p} style={{
              flex: 1, padding: '6px 0', textAlign: 'center',
              border: `${i === 0 ? 2 : 1.2}px solid ${i === 0 ? WF.limeDeep : WF.ink}`,
              borderRadius: 4, background: i === 0 ? WF.lime : WF.fill,
              fontFamily: WF.ui, fontSize: 11, fontWeight: i === 0 ? 700 : 500,
            }}>{p}</span>
          ))}
        </div>
        <div style={{ fontFamily: WF.ui, fontSize: 10, fontWeight: 700, color: WF.muted, letterSpacing: 1, marginBottom: 6 }}>2. FRANJA</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {['16:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '22:00'].map((s, i) => (
            <span key={s} style={{
              padding: '8px 0', textAlign: 'center',
              border: `${i === 3 ? 2 : 1.2}px solid ${i === 3 ? WF.limeDeep : i === 5 ? WF.muted : WF.ink}`,
              background: i === 5 ? WF.fillAlt : i === 3 ? WF.lime : WF.fill,
              borderRadius: 4, fontFamily: WF.ui, fontSize: 11, fontWeight: i === 3 ? 700 : 500,
              color: i === 5 ? WF.muted : WF.ink,
              textDecoration: i === 5 ? 'line-through' : 'none',
            }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 14px 14px', borderTop: `1.5px solid ${WF.ink}`, background: WF.paper }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: WF.ui, fontWeight: 800, fontSize: 13 }}>P1 · 19:00 — 20:30</span>
          <span style={{ marginLeft: 'auto', fontFamily: WF.ui, fontSize: 12 }}>12 €</span>
        </div>
        <Btn primary full sm>Reservar pista</Btn>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, {
  DetailDesktop, DetailMobile, DetailFull, ChatMsg,
  CreateWizardStep1, CreateWizardStep2, CreateWizardStep3, CreateWizardStep4,
  CourtBooking, CourtBookingMobile,
});
