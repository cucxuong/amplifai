/** Conference agenda window (inclusive) */
export const AGENDA_SCHEDULE_START = "2026-06-02";
export const AGENDA_SCHEDULE_END = "2026-06-05";

export interface AgendaItem {
  id: string;
  /** ISO 8601 local datetime; same calendar day as `endAt`; 1–2h before `endAt` */
  startAt: string;
  endAt: string;
  title: string;
  description?: string;
  speaker: string;
  speakerTitle?: string;
  speakerOrg?: string;
  speakerImage: string;
  sparks: number;
  stage?: string;
  location?: string;
  locationDetail?: string;
  /** Always-on booth tab; still single-day `startAt` / `endAt` */
  alwaysOn?: boolean;
}

export function isAlwaysOnItem(item: AgendaItem) {
  return item.alwaysOn === true;
}

export function isAgendaItemLive(item: AgendaItem, now = new Date()) {
  const start = new Date(item.startAt).getTime();
  const end = new Date(item.endAt).getTime();
  const t = now.getTime();
  return t >= start && t < end;
}

export function itemOnDate(item: AgendaItem, date: string) {
  return item.startAt.slice(0, 10) === date;
}

export const useAgendaStore = defineStore("agenda", () => {
  const items = ref<AgendaItem[]>([
    // Tue 2026-06-02 (5)
    {
      id: "agenda-tue-open",
      startAt: "2026-06-02T09:00:00",
      endAt: "2026-06-02T10:00:00",
      title: "Opening Keynote",
      description:
        "Kick off L'Oréal ONE SINGAPORE with a vision for the future of beauty, technology, and the people who shape it.",
      speaker: "Host",
      speakerTitle: "MC",
      speakerOrg: "L'Oréal Singapore",
      speakerImage: "/speaker-4.jpg",
      sparks: 10,
      location: "Main Stage — LVL3",
      locationDetail: "Marina Bay Sands, Singapore 018971",
      inMySchedule: true,
    },
    {
      id: "agenda-tue-trends",
      startAt: "2026-06-02T10:30:00",
      endAt: "2026-06-02T12:00:00",
      title: "2026 Beauty Trends",
      description:
        "Explore the macro shifts reshaping beauty retail — from hyper-personalisation and bio-materials to the rise of skin longevity.",
      speaker: "Sarah Chen",
      speakerTitle: "Head of Consumer Insights",
      speakerOrg: "L'Oréal APAC",
      speakerImage: "/speaker-1.jpg",
      sparks: 15,
      stage: "Stage A",
      location: "Stage A — LVL4",
      locationDetail: "Marina Bay Sands, Singapore 018971",
    },
    {
      id: "agenda-tue-sustain",
      startAt: "2026-06-02T12:30:00",
      endAt: "2026-06-02T13:30:00",
      title: "Sustainable Formulation",
      description:
        "How L'Oréal's R&I teams are rethinking ingredient sourcing and formula design to hit our 2030 sustainability commitments.",
      speaker: "Marcus Lee",
      speakerTitle: "R&I Director",
      speakerOrg: "L'Oréal Research",
      speakerImage: "/speaker-2.jpg",
      sparks: 12,
      location: "Stage B — LVL4",
      locationDetail: "Marina Bay Sands, Singapore 018971",
      inMySchedule: true,
    },
    {
      id: "agenda-tue-retail",
      startAt: "2026-06-02T14:00:00",
      endAt: "2026-06-02T16:00:00",
      title: "Retail Tech Showcase",
      description:
        "Live demos of the latest in-store and e-commerce innovations — AR try-on, smart mirrors, AI shelf analytics, and more.",
      speaker: "Nina Patel",
      speakerTitle: "VP Retail Innovation",
      speakerOrg: "L'Oréal Digital",
      speakerImage: "/speaker-3.jpg",
      sparks: 18,
      stage: "Stage B",
      location: "Stage B — LVL4",
      locationDetail: "Marina Bay Sands, Singapore 018971",
    },
    {
      id: "agenda-tue-network",
      startAt: "2026-06-02T16:30:00",
      endAt: "2026-06-02T17:30:00",
      title: "Founder Networking Hour",
      description:
        "Open networking with startup founders and L'Oréal tech leads. Bring your questions — this one's unscripted.",
      speaker: "Community",
      speakerTitle: "Open Format",
      speakerOrg: "All attendees",
      speakerImage: "/speaker-4.jpg",
      sparks: 8,
      location: "Atrium — LVL3",
      locationDetail: "Marina Bay Sands, Singapore 018971",
    },
    // Wed 2026-06-03 (5)
    {
      id: "agenda-wed-ai-live",
      startAt: "2026-06-03T09:00:00",
      endAt: "2026-06-03T10:00:00",
      title: "AI Innovation in Beauty",
      description:
        "How AI is reshaping every touchpoint of the beauty experience — from discovery to formulation to personalised retail.",
      speaker: "Laurence Liew",
      speakerTitle: "Founder",
      speakerOrg: "AI Singapore",
      speakerImage: "/speaker-1.jpg",
      sparks: 20,
      stage: "Stage A",
      location: "Stage A — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
      inMySchedule: true,
    },
    {
      id: "agenda-wed-roi-1",
      startAt: "2026-06-03T10:30:00",
      endAt: "2026-06-03T12:30:00",
      title: "Beyond the Hype: AI ROI",
      description:
        "Build your first agent in 45 minutes — from prompt to autonomous tool calls. A hands-on session for non-engineers.",
      speaker: "Andy Brown",
      speakerTitle: "Chief AI Officer",
      speakerOrg: "L'Oréal Group",
      speakerImage: "/speaker-2.jpg",
      sparks: 20,
      location: "Stage B — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
      inMySchedule: false,
    },
    {
      id: "agenda-wed-roi-2",
      startAt: "2026-06-03T13:00:00",
      endAt: "2026-06-03T14:00:00",
      title: "Measuring AI Impact",
      description:
        "Practical frameworks for attributing revenue, efficiency, and NPS gains to AI investments — with real L'Oréal case studies.",
      speaker: "Andy Brown",
      speakerTitle: "Chief AI Officer",
      speakerOrg: "L'Oréal Group",
      speakerImage: "/speaker-3.jpg",
      sparks: 20,
      location: "Stage B — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
      inMySchedule: true,
    },
    {
      id: "agenda-wed-personal",
      startAt: "2026-06-03T14:30:00",
      endAt: "2026-06-03T16:00:00",
      title: "Personalization at Scale",
      description:
        "From 1:1 email to real-time product recommendations — how data and AI unlock true personalisation across 37 brands.",
      speaker: "Elena Rossi",
      speakerTitle: "Global CRM Director",
      speakerOrg: "L'Oréal Luxe",
      speakerImage: "/speaker-4.jpg",
      sparks: 16,
      stage: "Stage B",
      location: "Stage A — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
    },
    {
      id: "agenda-wed-lab",
      startAt: "2026-06-03T16:30:00",
      endAt: "2026-06-03T18:00:00",
      title: "Ingredient Discovery Lab",
      description:
        "Step inside the future of formulation R&D — generative AI, high-throughput screening, and ethical ingredient sourcing in practice.",
      speaker: "Dr. Kim",
      speakerTitle: "Senior Scientist",
      speakerOrg: "L'Oréal Research & Innovation",
      speakerImage: "/speaker-1.jpg",
      sparks: 22,
      location: "Lab Space — LVL2",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
      inMySchedule: true,
    },
    // Thu 2026-06-04 (5)
    {
      id: "agenda-thu-brand",
      startAt: "2026-06-04T09:00:00",
      endAt: "2026-06-04T10:00:00",
      title: "Brand Storytelling Masterclass",
      description:
        "Craft narratives that move people — frameworks used across L'Oréal's most awarded campaign teams worldwide.",
      speaker: "Jordan Blake",
      speakerTitle: "Executive Creative Director",
      speakerOrg: "L'Oréal Consumer Products",
      speakerImage: "/speaker-2.jpg",
      sparks: 14,
      location: "Stage A — LVL4",
      locationDetail: "Suntec Convention Centre, Singapore 038983",
    },
    {
      id: "agenda-thu-data",
      startAt: "2026-06-04T10:30:00",
      endAt: "2026-06-04T12:00:00",
      title: "Consumer Data Deep Dive",
      description:
        "Unpacking our first-party data strategy — consent, enrichment, and how we activate insights across owned and paid channels.",
      speaker: "Priya Shah",
      speakerTitle: "Head of Data Strategy",
      speakerOrg: "L'Oréal APAC",
      speakerImage: "/speaker-3.jpg",
      sparks: 17,
      location: "Stage B — LVL4",
      locationDetail: "Suntec Convention Centre, Singapore 038983",
      inMySchedule: true,
    },
    {
      id: "agenda-thu-panel",
      startAt: "2026-06-04T13:00:00",
      endAt: "2026-06-04T15:00:00",
      title: "Data & Beauty Panel",
      description:
        "Industry leaders debate the ethics, opportunities, and risks of data-driven beauty — from genomics to facial recognition.",
      speaker: "Panel",
      speakerTitle: "Moderated Discussion",
      speakerOrg: "Multiple organisations",
      speakerImage: "/speaker-1.jpg",
      sparks: 15,
      location: "Main Stage — LVL3",
      locationDetail: "Suntec Convention Centre, Singapore 038983",
    },
    {
      id: "agenda-thu-workshop",
      startAt: "2026-06-04T15:30:00",
      endAt: "2026-06-04T17:30:00",
      title: "Hands-on Lab",
      description:
        "Get your hands into real formulas. Work alongside L'Oréal scientists in a guided lab session — no chemistry degree required.",
      speaker: "Facilitator",
      speakerTitle: "Lab Programme Lead",
      speakerOrg: "L'Oréal Research & Innovation",
      speakerImage: "/speaker-4.jpg",
      sparks: 25,
      location: "Lab Space — LVL2",
      locationDetail: "Suntec Convention Centre, Singapore 038983",
      inMySchedule: true,
    },
    {
      id: "agenda-thu-social",
      startAt: "2026-06-04T18:00:00",
      endAt: "2026-06-04T19:00:00",
      title: "Social Commerce Playbook",
      description:
        "TikTok Shop, livestream selling, creator commerce — tactical playbooks from the teams driving our social revenue growth.",
      speaker: "Mia Torres",
      speakerTitle: "Head of Social Commerce",
      speakerOrg: "L'Oréal Digital",
      speakerImage: "/speaker-2.jpg",
      sparks: 11,
      location: "Stage A — LVL4",
      locationDetail: "Suntec Convention Centre, Singapore 038983",
    },
    // Fri 2026-06-05 (5)
    {
      id: "agenda-fri-future",
      startAt: "2026-06-05T09:00:00",
      endAt: "2026-06-05T11:00:00",
      title: "Future of Beauty Tech",
      description:
        "A sweeping look at where beauty technology is headed — biotech, neurocosmetics, ambient commerce, and the post-screen era.",
      speaker: "Laurence Liew",
      speakerTitle: "Founder",
      speakerOrg: "AI Singapore",
      speakerImage: "/speaker-1.jpg",
      sparks: 20,
      stage: "Stage A",
      location: "Stage A — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
    },
    {
      id: "agenda-fri-partner",
      startAt: "2026-06-05T11:30:00",
      endAt: "2026-06-05T12:30:00",
      title: "Partner Ecosystem Briefing",
      description:
        "A confidential look at our 2026–2028 partnership roadmap — technology, retail, and media alliances in the pipeline.",
      speaker: "Andy Brown",
      speakerTitle: "Chief AI Officer",
      speakerOrg: "L'Oréal Group",
      speakerImage: "/speaker-2.jpg",
      sparks: 12,
      location: "Stage B — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
      inMySchedule: true,
    },
    {
      id: "agenda-fri-pitch",
      startAt: "2026-06-05T13:00:00",
      endAt: "2026-06-05T14:30:00",
      title: "Startup Pitch Finals",
      description:
        "Eight startups. Four minutes each. One partnership deal on the table. Watch the finalists pitch to the L'Oréal leadership panel.",
      speaker: "Judges",
      speakerTitle: "Leadership Panel",
      speakerOrg: "L'Oréal Group",
      speakerImage: "/speaker-3.jpg",
      sparks: 18,
      location: "Main Stage — LVL3",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
    },
    {
      id: "agenda-fri-roadmap",
      startAt: "2026-06-05T14:30:00",
      endAt: "2026-06-05T15:30:00",
      title: "Product Roadmap Preview",
      description:
        "An exclusive first look at what's shipping across L'Oréal's digital product suite in H2 2026 — feedback welcome.",
      speaker: "Product Team",
      speakerTitle: "Product Leadership",
      speakerOrg: "L'Oréal Digital",
      speakerImage: "/speaker-4.jpg",
      sparks: 15,
      location: "Stage B — LVL46",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
      inMySchedule: true,
    },
    {
      id: "agenda-fri-closing",
      startAt: "2026-06-05T16:00:00",
      endAt: "2026-06-05T18:00:00",
      title: "Closing & Awards",
      description:
        "Celebrate four days of ideas, experiments, and connections. Awards for best pitch, most sparks earned, and team of the conference.",
      speaker: "Host",
      speakerTitle: "MC",
      speakerOrg: "L'Oréal Singapore",
      speakerImage: "/speaker-1.jpg",
      sparks: 10,
      location: "Main Stage — LVL3",
      locationDetail: "10 Bayfront Ave, Singapore 018956",
    },
    // Always-on booth tab
    {
      id: "agenda-booth-demo",
      startAt: "2026-06-02T09:00:00",
      endAt: "2026-06-02T11:00:00",
      title: "Tech Demo Corner",
      description:
        "Drop by anytime to explore live demos of L'Oréal's latest digital products — AR beauty, skin diagnostics, and the AmplifAI platform.",
      speaker: "Booth team",
      speakerTitle: "Product Specialists",
      speakerOrg: "L'Oréal Tech & Data",
      speakerImage: "/speaker-4.jpg",
      sparks: 5,
      location: "Booth Area — LVL1",
      locationDetail: "Open all four days",
      alwaysOn: true,
    },
  ]);

  function toggleSchedule(id: string) {
    const item = items.value.find((i) => i.id === id);
    if (item) item.inMySchedule = !item.inMySchedule;
  }

  function itemsByDate(date: string | null) {
    if (date === null) return items.value.filter(isAlwaysOnItem);
    return items.value.filter((i) => !isAlwaysOnItem(i) && itemOnDate(i, date));
  }

  return {
    items,
    itemsByDate,
    scheduledItems,
    itemsForView,
    toggleSchedule,
    isAgendaItemLive,
    isAlwaysOnItem,
    itemOnDate,
  };
});
