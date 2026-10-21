export interface GlossaryEntry {
  term: string;
  ru: string;
  en: string;
}

const entries: GlossaryEntry[] = [
  { term: 'перестройка', ru: 'политика реформ М. С. Горбачёва (с 1985 г.): «перестройка» экономики и политической системы СССР.', en: 'restructuring – Gorbachev’s reform programme' },
  { term: 'гласность', ru: 'открытость власти и свобода слова: смягчение цензуры, публичное обсуждение проблем.', en: 'openness / publicity – relaxation of censorship' },
  { term: 'ускорение', ru: 'курс 1985–1986 гг. на быстрый рост экономики через модернизацию промышленности.', en: 'acceleration – drive to speed up economic growth' },
  { term: 'кооператив', ru: 'частное или коллективное предприятие, разрешённое Законом о кооперации (1988 г.).', en: 'co-operative – semi-private enterprise legalised in 1988' },
  { term: 'дефицит', ru: 'нехватка товаров в магазинах: очереди, талоны, пустые полки.', en: 'shortage – empty shelves, queues, rationing' },
  { term: 'цензура', ru: 'государственный контроль над печатью, радио, телевидением и литературой.', en: 'censorship' },
  { term: 'сухой закон', ru: 'жёсткое ограничение продажи алкоголя (кампания 1985–1987 гг.). Народное прозвище – «сухое вино» было ироничным: вино тоже стало дефицитом.', en: 'prohibition – the anti-alcohol campaign' },
  { term: 'самогон', ru: 'домашний крепкий алкоголь; в 1985–1987 гг. «чёрный рынок» самогона и сахара вырос.', en: 'moonshine – home-distilled spirit' },
  { term: 'госплан', ru: 'Государственный плановый комитет СССР: составлял пятилетние планы и распределял ресурсы.', en: 'State Planning Committee' },
  { term: 'суверенитет', ru: 'право республики самостоятельно решать свои внутренние и внешние дела.', en: 'sovereignty' },
  { term: 'гкчп', ru: 'Государственный комитет по чрезвычайному положению – группа консерваторов, организовавшая путч 19–21 августа 1991 г.', en: 'State Committee on the State of Emergency – 1991 coup plotters' },
  { term: 'спекуляция', ru: 'перепродажа товаров по завышенным ценам; в СССР долго считалась преступлением.', en: 'speculation / profiteering' },
  { term: 'политбюро', ru: 'высший руководящий орган КПСС, принимавший ключевые решения.', en: 'Politburo – ruling inner circle of the Party' },
  { term: 'кгб', ru: 'Комитет государственной безопасности – тайная полиция и разведка СССР.', en: 'KGB – security service' },
  { term: 'кпсс', ru: 'Коммунистическая партия Советского Союза; её монополия на власть была закреплена в ст. 6 Конституции.', en: 'Communist Party of the Soviet Union' },
  { term: 'чернобыльская аэс', ru: 'атомная станция, где 26 апреля 1986 г. взорвался 4-й реактор.', en: 'Chernobyl nuclear power plant' },
  { term: 'народные депутаты', ru: 'члены Съезда народных депутатов СССР, выбранные в 1989 г. на частично альтернативных выборах.', en: 'People’s Deputies – members of the 1989 Congress' },
  { term: 'союзный договор', ru: 'проект договора 1991 г., превращавший СССР в союз суверенных государств.', en: 'Union Treaty – draft for a looser federation' },
  { term: 'чрезвычайное положение', ru: 'особый режим с ограничением гражданских прав, вводимый силовыми методами.', en: 'state of emergency' },
  { term: 'чёрный рынок', ru: 'нелегальная торговля дефицитными товарами вне государственной системы.', en: 'black market' },
];

export const GLOSSARY: Record<string, GlossaryEntry> = Object.fromEntries(entries.map((e) => [e.term, e]));

export const GLOSSARY_LIST = entries;
