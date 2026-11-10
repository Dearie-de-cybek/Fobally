// Single source of truth for every registration journey.
// Used by the client (rendering + step validation) AND the server (full validation).
import { NIGERIAN_STATES, OUTSIDE_NIGERIA } from "./states";

export type Category = "citizen" | "artist" | "volunteer" | "collaborator" | "partner";
export type Values = Record<string, unknown>;

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "url" | "textarea" | "select" | "radio" | "multi" | "upload";
  required?: boolean;
  options?: readonly string[];
  hint?: string;
  placeholder?: string;
  max?: number; // max chars for text/textarea
  min?: number; // min chars when provided
  maxFiles?: number;
  showIf?: (v: Values) => boolean;
  /** if true, a value is stored in browser draft; PII is never drafted */
  pii?: boolean;
};

export type Step = {
  id: string;
  kicker: string;
  title: string;
  intro?: string;
  fields: Field[];
  variant?: "form" | "aspiration" | "upload" | "consent";
};

export type Journey = {
  category: Category;
  label: string;
  verb: string;
  blurb: string;
  steps: Step[];
};

const stateList = [...NIGERIAN_STATES] as string[];
const residence = [...stateList, OUTSIDE_NIGERIA];
const scope = ["National exhibition", "State-level exhibition", "Both national and state level"] as const;

const name = (label = "Full name"): Field => ({ name: "name", label, type: "text", required: true, max: 120, pii: true, placeholder: "As you would like it printed" });
const email = (): Field => ({ name: "email", label: "Email address", type: "email", required: true, max: 200, pii: true, hint: "Your confirmation and reference will be sent here." });
const phone = (): Field => ({ name: "phone", label: "Phone number", type: "tel", required: true, max: 24, pii: true, placeholder: "+234 …" });

export const AREAS = [
  "Education", "Healthcare", "Security", "Economy and jobs", "Infrastructure", "Energy and power",
  "Agriculture and food", "Youth and employment", "Women and inclusion", "Arts and culture",
  "Technology and innovation", "Environment and climate", "Justice and rule of law", "Unity and identity",
] as const;

export const CONSENT_STEP: Step = {
  id: "consent",
  kicker: "Last thing",
  title: "Your data, your say.",
  intro: "We only collect what we need to run the exhibition. Your personal details are never shown publicly.",
  variant: "consent",
  fields: [
    { name: "consentPrivacy", label: "I agree to Fobally Art Gallery storing and using my details to administer my registration and contact me about this exhibition.", type: "radio", required: true, options: ["agree"] },
    { name: "consentPublic", label: "Optional — I allow my aspirations and/or artwork to be displayed publicly (anonymously for aspirations; credited by name for artwork).", type: "radio", options: ["yes"] },
    { name: "consentUpdates", label: "Optional — keep me updated about future Fobally exhibitions.", type: "radio", options: ["yes"] },
  ],
};

export const JOURNEYS: Record<Category, Journey> = {
  citizen: {
    category: "citizen",
    label: "Nigerian Citizen",
    verb: "Document my Nigeria",
    blurb: "Tell us the country you want to live in — in your own words, for the record.",
    steps: [
      {
        id: "you", kicker: "First, you", title: "Who is speaking?", variant: "form",
        intro: "A few details so we can reach you. They stay private.",
        fields: [
          name(), email(), phone(),
          { name: "ageRange", label: "Age range", type: "select", required: true, options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"] },
        ],
      },
      {
        id: "roots", kicker: "Where from, where now", title: "Roots and residence.", variant: "form",
        fields: [
          { name: "stateOrigin", label: "State of origin", type: "select", required: true, options: stateList },
          { name: "stateResidence", label: "State of residence", type: "select", required: true, options: residence },
          { name: "citizenship", label: "Nigerian citizenship status", type: "radio", required: true, options: ["Citizen by birth", "Citizen by registration or naturalisation", "Citizen by descent (diaspora)", "Resident, not a citizen"] },
        ],
      },
      {
        id: "activities", kicker: "Your visit", title: "How would you like to take part?", variant: "form",
        fields: [
          { name: "activities", label: "Preferred event activities", type: "multi", required: true, options: ["Conferences", "Art exhibitions", "Live performances", "Vendor and exhibition booths", "Other"], hint: "Choose all that apply." },
          { name: "activitiesOther", label: "Tell us what else", type: "text", max: 200, showIf: (v) => Array.isArray(v.activities) && v.activities.includes("Other"), required: true },
        ],
      },
      {
        id: "aspiration", kicker: "The heart of it", title: "Document your Nigeria.", variant: "aspiration",
        intro: "Six questions, one at a time. Only the first two are needed — the rest are yours if you want them.",
        fields: [
          // Each of Q1/Q2 needs an answer for Nigeria OR the participant's state (or both) — enforced in RegisterFlow.
          { name: "aspChangeNational", label: "If you could change one thing about Nigeria, what would it be?", type: "textarea", min: 10, max: 2000 },
          { name: "aspChangeState", label: "…and in your state?", type: "textarea", min: 10, max: 2000 },
          { name: "aspVisionNational", label: "What should Nigeria look like between 2027 and 2031?", type: "textarea", min: 10, max: 3000 },
          { name: "aspVisionState", label: "…and your state?", type: "textarea", min: 10, max: 3000 },
          { name: "aspAreas", label: "What areas of national development matter most to you?", type: "multi", options: AREAS, hint: "Choose up to five." },
          { name: "aspAreasNote", label: "Anything to add about these priorities?", type: "textarea", max: 1500 },
          { name: "aspLeadership", label: "What would responsible leadership look like?", type: "textarea", max: 3000 },
          { name: "aspResponsibility", label: "What responsibility do citizens have in building the Nigeria they imagine?", type: "textarea", max: 3000 },
          { name: "aspMessage", label: "What message would you leave for the next generation?", type: "textarea", max: 1500 },
        ],
      },
      CONSENT_STEP,
    ],
  },

  artist: {
    category: "artist",
    label: "Artist",
    verb: "Submit my work",
    blurb: "Apply to show a work that interprets an aspired Nigeria. Acceptance is by gallery review.",
    steps: [
      {
        id: "you", kicker: "The artist", title: "Introduce yourself.", variant: "form",
        fields: [
          name(), email(), phone(),
          { name: "stateResidence", label: "State of residence", type: "select", required: true, options: residence },
          { name: "bio", label: "Artist biography", type: "textarea", required: true, min: 40, max: 2500, hint: "Who you are, where you train or practise, and what you are known for." },
        ],
      },
      {
        id: "practice", kicker: "Your practice", title: "Discipline and experience.", variant: "form",
        fields: [
          { name: "discipline", label: "Artistic discipline", type: "select", required: true, options: ["Painting", "Mixed media", "Sculpture", "Ceramics", "Drawing", "Printmaking", "Other"] },
          { name: "disciplineOther", label: "Please specify", type: "text", max: 120, required: true, showIf: (v) => v.discipline === "Other" },
          { name: "years", label: "Years of practice (optional)", type: "text", max: 3, placeholder: "e.g. 8" },
          { name: "portfolio", label: "Portfolio website or social media (optional)", type: "url", max: 300, placeholder: "https://" },
        ],
      },
      {
        id: "work", kicker: "The work", title: "Describe the artwork.", variant: "form",
        fields: [
          { name: "artTitle", label: "Artwork title", type: "text", required: true, max: 160 },
          { name: "artMedium", label: "Artistic medium", type: "text", required: true, max: 160, placeholder: "e.g. Acrylic and indigo dye on canvas" },
          { name: "artDimensions", label: "Artwork dimensions", type: "text", required: true, max: 80, placeholder: "H × W × D in cm" },
          { name: "artDescription", label: "Artwork description", type: "textarea", required: true, min: 20, max: 2000 },
        ],
      },
      {
        id: "images", kicker: "Show us", title: "Photographs of the work.", variant: "upload",
        intro: "Clear, well-lit photographs. Include a full view and at least one detail.",
        fields: [{ name: "images", label: "Artwork photographs", type: "upload", required: true, maxFiles: 6 }],
      },
      {
        id: "statement", kicker: "The thinking", title: "Why this work, for this theme?", variant: "form",
        fields: [
          { name: "statement", label: "Artist statement", type: "textarea", required: true, min: 40, max: 3000, hint: "How does the work interpret the Nigeria you aspire to see?" },
          { name: "participation", label: "Participation preference", type: "radio", required: true, options: scope },
        ],
      },
      CONSENT_STEP,
    ],
  },

  volunteer: {
    category: "volunteer",
    label: "Volunteer",
    verb: "Offer my hands",
    blurb: "Help us run the exhibition — on the floor, behind the stage, or online.",
    steps: [
      {
        id: "you", kicker: "The volunteer", title: "Who's offering?", variant: "form",
        fields: [
          name(), email(), phone(),
          { name: "gender", label: "Gender (optional)", type: "select", options: ["Female", "Male", "Non-binary", "Prefer not to say"] },
        ],
      },
      {
        id: "roles", kicker: "Where you fit", title: "Roles and skills.", variant: "form",
        fields: [
          { name: "roles", label: "Preferred volunteer roles", type: "multi", required: true, options: ["Event coordination", "Registration and guest reception", "Media and photography assistance", "Social media and content creation", "Stage management", "Other"] },
          { name: "rolesOther", label: "Tell us what else", type: "text", max: 200, required: true, showIf: (v) => Array.isArray(v.roles) && v.roles.includes("Other") },
          { name: "skills", label: "Relevant skills and experience", type: "textarea", required: true, min: 10, max: 2000 },
          { name: "availability", label: "Availability", type: "textarea", required: true, min: 5, max: 600, hint: "Days, times, or restrictions. Dates will be confirmed later." },
        ],
      },
      {
        id: "care", kicker: "Looking after you", title: "Care and contact.", variant: "form",
        intro: "Medical or accessibility notes are optional and visible only to the volunteer coordinator.",
        fields: [
          { name: "needs", label: "Medical or accessibility needs (optional, confidential)", type: "textarea", max: 800, pii: true },
          { name: "emergencyName", label: "Emergency contact name", type: "text", required: true, max: 120, pii: true },
          { name: "emergencyPhone", label: "Emergency contact phone", type: "tel", required: true, max: 24, pii: true },
        ],
      },
      CONSENT_STEP,
    ],
  },

  collaborator: {
    category: "collaborator",
    label: "Collaborator",
    verb: "Propose a collaboration",
    blurb: "Institutions, collectives and organisations: tell us what we could make together.",
    steps: [
      {
        id: "org", kicker: "The organisation", title: "Who are you?", variant: "form",
        fields: [
          { name: "orgName", label: "Organisation or institution name", type: "text", required: true, max: 160 },
          { name: "orgCategory", label: "Organisation category", type: "select", required: true, options: ["Arts and culture", "Education", "Civil society / NGO", "Media", "Government agency", "Community group", "Business", "Other"] },
          { name: "orgWork", label: "Description of your organisation's work", type: "textarea", required: true, min: 30, max: 2500 },
        ],
      },
      {
        id: "contact", kicker: "The contact", title: "Who should we speak to?", variant: "form",
        fields: [{ ...name("Contact person's name") }, email(), phone()],
      },
      {
        id: "proposal", kicker: "The idea", title: "What could we do together?", variant: "form",
        fields: [
          { name: "proposal", label: "Proposed collaboration", type: "textarea", required: true, min: 30, max: 3000 },
          { name: "interests", label: "Relevant professional interests", type: "textarea", max: 1500 },
          { name: "participation", label: "Participation preference", type: "radio", required: true, options: scope },
        ],
      },
      CONSENT_STEP,
    ],
  },

  partner: {
    category: "partner",
    label: "Partner / Sponsor",
    verb: "Back the exhibition",
    blurb: "Fund, host, brand or amplify — partner with the exhibition for the long run.",
    steps: [
      {
        id: "org", kicker: "The organisation", title: "Who is partnering?", variant: "form",
        fields: [
          { name: "orgName", label: "Organisation name", type: "text", required: true, max: 160 },
          { name: "website", label: "Website or social media", type: "url", max: 300, placeholder: "https://" },
          { name: "orgDescription", label: "Organisation description", type: "textarea", required: true, min: 30, max: 2500 },
        ],
      },
      {
        id: "contact", kicker: "The contact", title: "Who should we speak to?", variant: "form",
        fields: [
          { ...name("Contact person's full name") },
          { name: "position", label: "Position", type: "text", required: true, max: 120 },
          email(), phone(),
        ],
      },
      {
        id: "partnership", kicker: "The partnership", title: "How would you back this?", variant: "form",
        fields: [
          { name: "partnershipCategory", label: "Partnership category", type: "radio", required: true, options: ["Financial partner", "Organisational partner", "Brand partner", "Media partner"] },
          { name: "opportunities", label: "Desired partnership opportunities", type: "textarea", required: true, min: 10, max: 2000 },
          { name: "contribution", label: "Proposed contribution or support", type: "textarea", required: true, min: 10, max: 2000 },
          { name: "longTerm", label: "Long-term partnership interest", type: "radio", required: true, options: ["Yes, multi-year", "Open to discussing", "This edition only"] },
        ],
      },
      CONSENT_STEP,
    ],
  },
};

export const CATEGORIES = Object.keys(JOURNEYS) as Category[];
export const isCategory = (c: unknown): c is Category => typeof c === "string" && c in JOURNEYS;

export const UPLOAD_RULES = {
  maxBytes: 8 * 1024 * 1024,
  maxFiles: 6,
  mimes: ["image/jpeg", "image/png", "image/webp"] as readonly string[],
};
