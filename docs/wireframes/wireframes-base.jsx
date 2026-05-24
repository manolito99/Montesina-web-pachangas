// Shared wireframe primitives — low-fi sketchy vibe with lime accent

const WF = {
  paper: '#f5f2ea',
  paperAlt: '#ece8dc',
  ink: '#1a1a1a',
  ink2: '#3a3a3a',
  muted: '#7a7670',
  fill: '#ffffff',
  fillAlt: '#e9e5d8',
  lime: '#c8e84a',
  limeDeep: '#9fc93c',
  navy: '#0F1A2E',
  navy2: '#0B1220',
  rose: '#e58a7b',
  hand: '"Kalam", "Architects Daughter", "Comic Sans MS", cursive',
  ui: '"Space Grotesk", "Inter", system-ui, sans-serif',
};

// =============== Primitive sketchy box ===============
function Box({ children, style, w, h, rough = 1, fill = WF.fill, accent, dashed, ...rest }) {
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        background: fill,
        border: `1.5px solid ${WF.ink}`,
        borderRadius: 6,
        boxShadow: rough ? `2px 2px 0 0 ${WF.ink}` : 'none',
        borderStyle: dashed ? 'dashed' : 'solid',
        ...(accent ? { borderColor: WF.limeDeep, borderWidth: 2 } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Handwritten annotation w/ arrow
function Annot({ children, style, dir = 'left' }) {
  return (
    <div style={{
      position: 'absolute',
      fontFamily: WF.hand,
      fontSize: 14,
      color: WF.ink2,
      lineHeight: 1.1,
      pointerEvents: 'none',
      ...style,
    }}>
      {dir === 'left' && <span style={{ marginRight: 4 }}>↖</span>}
      {children}
      {dir === 'right' && <span style={{ marginLeft: 4 }}>↗</span>}
      {dir === 'down' && <span style={{ marginLeft: 4 }}>↘</span>}
    </div>
  );
}

// Sketchy button
function Btn({ children, primary, ghost, sm, style, full, icon }) {
  const padY = sm ? 6 : 10;
  const padX = sm ? 12 : 18;
  const bg = primary ? WF.lime : ghost ? 'transparent' : WF.fill;
  const color = primary ? WF.navy : WF.ink;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: `${padY}px ${padX}px`,
      background: bg,
      border: `1.5px solid ${WF.ink}`,
      borderRadius: 999,
      fontFamily: WF.ui,
      fontWeight: 600,
      fontSize: sm ? 12 : 14,
      color,
      boxShadow: primary || !ghost ? `2px 2px 0 0 ${WF.ink}` : 'none',
      width: full ? '100%' : undefined,
      justifyContent: full ? 'center' : undefined,
      ...style,
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

// Placeholder image / pista visual
function Placeholder({ w, h = 80, label, style, lime, navy }) {
  return (
    <div style={{
      width: w || '100%',
      height: h,
      background: navy ? WF.navy : lime ? WF.lime : WF.fillAlt,
      border: `1.5px solid ${WF.ink}`,
      borderRadius: 6,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: WF.hand,
      fontSize: 13,
      color: navy ? WF.lime : WF.ink2,
      ...style,
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <line x1="0" y1="0" x2="100%" y2="100%" stroke={navy ? WF.lime : WF.muted} strokeWidth="0.7" strokeDasharray="3 4" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke={navy ? WF.lime : WF.muted} strokeWidth="0.7" strokeDasharray="3 4" />
      </svg>
      <span style={{ position: 'relative', zIndex: 1 }}>{label || '[img]'}</span>
    </div>
  );
}

// Pelota relleno = nivel
function LevelBalls({ value = 3, max = 5, size = 10 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, verticalAlign: 'middle' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          border: `1.2px solid ${WF.ink}`,
          background: i < value ? WF.lime : WF.fill,
        }} />
      ))}
    </span>
  );
}

// Avatar circle
function Avatar({ label, size = 28, lime, dashed }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      border: `1.2px solid ${WF.ink}`,
      borderStyle: dashed ? 'dashed' : 'solid',
      background: lime ? WF.lime : WF.fill,
      fontFamily: WF.ui, fontSize: size * 0.36, fontWeight: 700,
      color: WF.ink,
    }}>
      {label || '?'}
    </span>
  );
}

function AvatarRow({ avatars = [], empty = 0, max = 4, size = 28 }) {
  return (
    <span style={{ display: 'inline-flex' }}>
      {avatars.map((a, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar label={a} size={size} />
        </span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={'e' + i} style={{ marginLeft: -8 }}>
          <Avatar label="+" size={size} dashed />
        </span>
      ))}
    </span>
  );
}

// Categoria chip
function CatChip({ cat, sm }) {
  const map = {
    M: { label: 'MASC', color: '#5b8aef' },
    F: { label: 'FEM', color: '#e57db5' },
    X: { label: 'MIXTO', color: WF.limeDeep },
  };
  const c = map[cat] || map.M;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: sm ? '2px 6px' : '3px 8px',
      border: `1.2px solid ${WF.ink}`,
      background: c.color,
      color: '#0a0a0a',
      borderRadius: 4,
      fontFamily: WF.ui, fontWeight: 700, fontSize: sm ? 10 : 11,
      letterSpacing: 0.5,
    }}>
      ● {c.label}
    </span>
  );
}

// Sketchy text line (placeholder copy)
function Line({ w = '100%', h = 8, mt = 6, dark }) {
  return <div style={{ width: w, height: h, marginTop: mt, background: dark ? WF.ink2 : WF.muted, opacity: dark ? 0.85 : 0.45, borderRadius: 2 }} />;
}

// Stroke logo (uses currentColor) inlined as background-image
function LogoFlat({ size = 28, color = WF.ink }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, color,
      WebkitMask: `url('assets/logo-montesina-flat.svg') center / contain no-repeat`,
      mask: `url('assets/logo-montesina-flat.svg') center / contain no-repeat`,
      background: 'currentColor',
    }} />
  );
}

// Frame chrome wrappers
function DesktopFrame({ children, w = 1080, h = 680, label }) {
  return (
    <div style={{ width: w, fontFamily: WF.ui }}>
      <div style={{
        background: WF.paperAlt,
        border: `1.5px solid ${WF.ink}`,
        borderRadius: 10,
        padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: `3px 3px 0 0 ${WF.ink}`,
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        borderBottom: 'none',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.2px solid ${WF.ink}` }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.2px solid ${WF.ink}` }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.2px solid ${WF.ink}` }} />
        <span style={{ marginLeft: 12, fontFamily: WF.hand, fontSize: 13, color: WF.ink2 }}>
          montesinapadel.club {label ? `· ${label}` : ''}
        </span>
      </div>
      <div style={{
        width: w, minHeight: h,
        background: WF.paper,
        border: `1.5px solid ${WF.ink}`,
        boxShadow: `3px 3px 0 0 ${WF.ink}`,
        borderTopLeftRadius: 0, borderTopRightRadius: 0,
        borderRadius: 10,
        borderTopLeftRadius: 0, borderTopRightRadius: 0,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {children}
      </div>
    </div>
  );
}

function PhoneFrame({ children, w = 280, h = 580, label }) {
  return (
    <div style={{ width: w + 16, fontFamily: WF.ui }}>
      <div style={{
        width: w + 16,
        background: WF.ink,
        borderRadius: 36,
        padding: 8,
        boxShadow: `3px 3px 0 0 ${WF.ink2}`,
      }}>
        <div style={{
          width: w, height: h,
          background: WF.paper,
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* status bar */}
          <div style={{
            height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 16px 0', fontFamily: WF.ui, fontSize: 10, color: WF.ink, fontWeight: 600,
          }}>
            <span>9:41</span>
            <span style={{ width: 60, height: 14, background: WF.ink, borderRadius: 8 }} />
            <span>·· 􀛨</span>
          </div>
          {children}
        </div>
      </div>
      {label && <div style={{ fontFamily: WF.hand, fontSize: 12, color: WF.ink2, textAlign: 'center', marginTop: 6 }}>{label}</div>}
    </div>
  );
}

// Section header bar inside a frame
function TopBar({ active, dark, compact }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: compact ? '8px 14px' : '14px 22px',
      borderBottom: `1.5px solid ${WF.ink}`,
      background: dark ? WF.navy : WF.paper,
      color: dark ? '#E8ECF2' : WF.ink,
      fontFamily: WF.ui, fontSize: 13,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
        <LogoFlat size={compact ? 18 : 22} color={dark ? WF.lime : WF.ink} />
        MONTESIÑA
      </span>
      <span style={{ display: 'inline-flex', gap: 18, fontSize: 12, opacity: 0.85 }}>
        {['Pachangas', 'Pistas', 'Comunidad'].map(t => (
          <span key={t} style={{
            paddingBottom: 2,
            borderBottom: active === t ? `2px solid ${WF.lime}` : '2px solid transparent',
            fontWeight: active === t ? 700 : 500,
          }}>{t}</span>
        ))}
      </span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: WF.hand, fontSize: 12, opacity: 0.7 }}>🔔</span>
        <Avatar label="JG" size={26} />
      </span>
    </div>
  );
}

// Mobile bottom tabs
function MobileTabs({ active }) {
  const tabs = [
    ['Inicio', '⌂'],
    ['Pachangas', '⚉'],
    ['Pistas', '▦'],
    ['Yo', '◉'],
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 14px',
      borderTop: `1.5px solid ${WF.ink}`,
      background: WF.paper,
      fontFamily: WF.ui, fontSize: 10,
    }}>
      {tabs.map(([t, i]) => (
        <span key={t} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: active === t ? WF.ink : WF.muted,
          fontWeight: active === t ? 700 : 500,
        }}>
          <span style={{ fontSize: 14 }}>{i}</span>
          {t}
          {active === t && <span style={{ width: 14, height: 2, background: WF.lime, borderRadius: 2 }} />}
        </span>
      ))}
    </div>
  );
}

// Slot inside a frame: a "card" appearance
function Card({ children, style, accent, dashed, p = 12 }) {
  return (
    <div style={{
      padding: p,
      background: WF.fill,
      border: `1.5px solid ${WF.ink}`,
      borderRadius: 8,
      boxShadow: `2px 2px 0 0 ${WF.ink}`,
      borderStyle: dashed ? 'dashed' : 'solid',
      ...(accent ? { borderColor: WF.limeDeep, borderWidth: 2 } : {}),
      fontFamily: WF.ui,
      ...style,
    }}>
      {children}
    </div>
  );
}

// Sample pachanga card (re-used widely)
function PachangaCard({ cat = 'X', time = '19:00 · 90min', pista = 'Pista 3 · indoor', nivel = 3, filled = 3, max = 4, organizer = 'Marta L.', price = '8€', date, compact, accent }) {
  return (
    <Card accent={accent} p={compact ? 10 : 12}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <CatChip cat={cat} sm />
        {date && <span style={{ fontFamily: WF.hand, fontSize: 13, color: WF.ink2 }}>{date}</span>}
        <span style={{ marginLeft: 'auto', fontFamily: WF.ui, fontSize: 11, fontWeight: 700, color: filled === max ? WF.muted : WF.limeDeep }}>
          {filled}/{max} {filled === max ? '· COMPLETO' : ''}
        </span>
      </div>
      <div style={{ fontFamily: WF.ui, fontWeight: 700, fontSize: compact ? 14 : 15 }}>{time}</div>
      <div style={{ fontFamily: WF.ui, fontSize: 12, color: WF.ink2, marginTop: 2 }}>{pista}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: WF.ink2 }}>
          Nivel <LevelBalls value={nivel} size={8} />
        </span>
        <AvatarRow avatars={['M', 'A', 'J'].slice(0, filled)} empty={max - filled} size={22} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${WF.muted}` }}>
        <span style={{ fontFamily: WF.hand, fontSize: 12, color: WF.ink2 }}>org. {organizer}</span>
        <span style={{ fontFamily: WF.ui, fontWeight: 700, fontSize: 13 }}>{price}</span>
      </div>
    </Card>
  );
}

Object.assign(window, {
  WF, Box, Annot, Btn, Placeholder, LevelBalls, Avatar, AvatarRow, CatChip, Line,
  LogoFlat, DesktopFrame, PhoneFrame, TopBar, MobileTabs, Card, PachangaCard,
});
