/** What the view from the window looks like at a given moment of the story. */
export interface WindowState {
  /** 0..1 snow lying on roofs and ground */
  snow: number;
  /** 0 bare branches .. 1 full summer foliage */
  foliage: number;
  /** 0 clear .. 1 fully overcast */
  cloud: number;
  rain: number;
  snowfall: number;
  /** time of day, 0 = midnight, 0.5 = noon (unwrapped during a time-lapse) */
  tod: number;
  /** 1 once the tricolour flies over the Kremlin */
  tricolor: number;
}

/** One state per scenario (index = stage) plus a final one for December 1991. */
export const WINDOW_STATES: WindowState[] = [
  // Март 1985: серое позднее утро, тающий снег
  { snow: 0.8, foliage: 0, cloud: 0.7, rain: 0, snowfall: 0, tod: 0.42, tricolor: 0 },
  // Апрель 1986: дождливый вечер
  { snow: 0.05, foliage: 0.3, cloud: 0.85, rain: 0.7, snowfall: 0, tod: 0.69, tricolor: 0 },
  // 1988: ясный летний полдень
  { snow: 0, foliage: 1, cloud: 0.15, rain: 0, snowfall: 0, tod: 0.5, tricolor: 0 },
  // Февраль 1989: снегопад на закате
  { snow: 0.95, foliage: 0, cloud: 0.9, rain: 0, snowfall: 0.9, tod: 0.7, tricolor: 0 },
  // Август 1991: тревожный закат
  { snow: 0, foliage: 1, cloud: 0.5, rain: 0, snowfall: 0, tod: 0.76, tricolor: 1 },
  // Декабрь 1991: зимние сумерки
  { snow: 0.85, foliage: 0, cloud: 0.8, rain: 0, snowfall: 0.7, tod: 0.67, tricolor: 1 },
];

/** Length of the time-lapse after a decision. */
export const SKIP_MS = 5200;
