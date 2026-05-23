import type {
  Pachanga,
  Court,
  UserProfile,
  UserNotification,
  BookingState,
} from "./types";

export const PACHANGAS: Pachanga[] = [
  {
    id: "1",
    cat: "X",
    date: "HOY · 19:00",
    time: "19:00 · 90min",
    pista: "Pista 1 · outdoor",
    nivel: 3,
    filled: 3,
    max: 4,
    organizer: "Marta L.",
    price: "8€",
    avatars: ["C", "J", "M"],
    accent: true,
    notes:
      "Buscamos nivel medio. Llevo pelotas. Cancelo si llueve antes de las 17h.",
    waitlist: [
      { name: "Pedro G.", initial: "P", nivel: 3, position: 1 },
      { name: "Nuria C.", initial: "N", nivel: 3, position: 2 },
    ],
    chat: [
      { who: "Marta L.", text: "Llevo yo botes!", time: "17:02", mine: true },
      {
        who: "Carlos R.",
        text: "Yo voy 5 min tarde, esperadme 🏃",
        time: "18:30",
      },
      { who: "Javi M.", text: "Confirmadlo si llueve", time: "18:42" },
    ],
  },
  {
    id: "2",
    cat: "M",
    date: "HOY · 20:30",
    time: "20:30 · 90min",
    pista: "Pista 3 · indoor",
    nivel: 4,
    filled: 2,
    max: 4,
    organizer: "Carlos R.",
    price: "8€",
    avatars: ["C", "A"],
  },
  {
    id: "3",
    cat: "F",
    date: "HOY · 21:00",
    time: "21:00 · 90min",
    pista: "Pista 2 · indoor",
    nivel: 2,
    filled: 4,
    max: 4,
    organizer: "Lucía V.",
    price: "8€",
    avatars: ["L", "E", "S", "A"],
  },
  {
    id: "4",
    cat: "M",
    date: "HOY · 17:30",
    time: "17:30 · 90min",
    pista: "Pista 3 · indoor",
    nivel: 3,
    filled: 4,
    max: 4,
    organizer: "David P.",
    price: "8€",
    avatars: ["D", "T", "I", "A"],
  },
  {
    id: "5",
    cat: "M",
    date: "HOY · 22:00",
    time: "22:00 · 90min",
    pista: "Pista 4 · outdoor",
    nivel: 4,
    filled: 1,
    max: 4,
    organizer: "Iván R.",
    price: "8€",
    avatars: ["I"],
  },
  {
    id: "6",
    cat: "X",
    date: "MAÑ · 18:00",
    time: "18:00 · 90min",
    pista: "Pista 3 · indoor",
    nivel: 3,
    filled: 1,
    max: 4,
    organizer: "Sofía B.",
    price: "8€",
    avatars: ["S"],
  },
  {
    id: "7",
    cat: "M",
    date: "MAÑ · 19:00",
    time: "19:00 · 90min",
    pista: "Pista 1 · outdoor",
    nivel: 5,
    filled: 4,
    max: 4,
    organizer: "Toni G.",
    price: "8€",
    avatars: ["T", "D", "I", "A"],
  },
  {
    id: "8",
    cat: "F",
    date: "MAÑ · 20:00",
    time: "20:00 · 90min",
    pista: "Pista 3 · outdoor",
    nivel: 3,
    filled: 3,
    max: 4,
    organizer: "Eva M.",
    price: "8€",
    avatars: ["E", "L", "S"],
  },
  {
    id: "9",
    cat: "F",
    date: "JUE · 18:00",
    time: "18:00 · 90min",
    pista: "Pista 2 · indoor",
    nivel: 2,
    filled: 4,
    max: 4,
    organizer: "Lucía V.",
    price: "8€",
    avatars: ["L", "E", "S", "A"],
  },
  {
    id: "10",
    cat: "X",
    date: "VIE · 19:00",
    time: "19:00 · 90min",
    pista: "Pista 1 · outdoor",
    nivel: 3,
    filled: 2,
    max: 4,
    organizer: "Marta L.",
    price: "8€",
    avatars: ["M", "J"],
    accent: true,
  },
  {
    id: "11",
    cat: "M",
    date: "SÁB · 11:00",
    time: "11:00 · 90min",
    pista: "Pista 4 · outdoor",
    nivel: 3,
    filled: 2,
    max: 4,
    organizer: "Javi G.",
    price: "8€",
    avatars: ["J", "C"],
  },
  {
    id: "12",
    cat: "X",
    date: "DOM · 10:00",
    time: "10:00 · 90min",
    pista: "Pista 2 · indoor",
    nivel: 2,
    filled: 3,
    max: 4,
    organizer: "Sofía B.",
    price: "8€",
    avatars: ["S", "M", "T"],
  },
];

export function getPachangaById(id: string): Pachanga | undefined {
  return PACHANGAS.find((p) => p.id === id);
}

export function getPachangasByDay(): { day: string; items: Pachanga[] }[] {
  const groups: Record<string, Pachanga[]> = {};
  for (const p of PACHANGAS) {
    const day = p.date.split(" · ")[0];
    (groups[day] ??= []).push(p);
  }
  const order = ["HOY", "MAÑ", "JUE", "VIE", "SÁB", "DOM"];
  return Object.entries(groups)
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([day, items]) => ({ day, items }));
}

export const COURTS: Court[] = [
  { id: "p1", name: "Pista 1", type: "outdoor", free: true },
  { id: "p2", name: "Pista 2", type: "indoor", free: false },
  { id: "p3", name: "Pista 3", type: "indoor", free: true },
  { id: "p4", name: "Pista 4", type: "outdoor", free: true },
];

export const CURRENT_USER: UserProfile = {
  name: "Javi González",
  email: "javi@correo.com",
  initial: "JG",
  level: 3,
  gender: "H",
  memberSince: 2022,
  stats: {
    played: 32,
    created: 8,
    attendance: "94%",
    favCategory: "Mixto",
    thisMonth: 6,
  },
};

export const NOTIFICATIONS: UserNotification[] = [
  {
    id: "n1",
    icon: "✓",
    text: "Te has apuntado a la pachanga del martes 20:00",
    time: "Hace 2 min",
    kind: "ok",
    read: false,
  },
  {
    id: "n2",
    icon: "!",
    text: "Falta 1 mujer en la pachanga mixta del jueves",
    time: "Hace 1 h",
    kind: "warn",
    read: false,
  },
  {
    id: "n3",
    icon: "⏷",
    text: "Has subido de la lista de espera al partido del sábado",
    time: "Ayer",
    kind: "lime",
    read: true,
  },
  {
    id: "n4",
    icon: "×",
    text: "Marta L. canceló la pachanga del miércoles 18:00",
    time: "Ayer",
    kind: "neutral",
    read: true,
  },
  {
    id: "n5",
    icon: "⏰",
    text: "Recordatorio: tu pachanga empieza en 1 hora",
    time: "Hace 3 días",
    kind: "neutral",
    read: true,
  },
  {
    id: "n6",
    icon: "⊕",
    text: "Nueva pachanga mixta en tu rango de nivel",
    time: "Hace 4 días",
    kind: "neutral",
    read: true,
  },
];

export const BOOKING_HOURS = [
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
];

export const BOOKING_GRID: BookingState[][] = [
  [0, 0, 3, 3, 0, 0, 0, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0],
  [3, 3, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0],
  [0, 0, 0, 2, 2, 0, 0, 3, 3, 0, 0, 2, 2],
];

export const BOOKING_MOBILE_SLOTS = [
  "16:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "22:00",
];
