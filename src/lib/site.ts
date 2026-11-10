// Editable event details. Nothing here is confirmed — replace before launch.
export const SITE = {
  name: "The People's Canvas",
  organiser: "Fobally Art Gallery",
  initiative: "Paint and Document Your Aspired Nigeria 2026",
  // PLACEHOLDERS — set real values when confirmed.
  dates: "Dates to be announced",
  venue: "Venue to be announced",
  contactEmail: "contact@fobally.example", // TODO: replace with the gallery's real address
  period: "2027–2031",
} as const;

export const MEDIUMS = [
  { id: "painting", name: "Painting", note: "Oil, acrylic, watercolour, gouache on any surface." },
  { id: "mixed", name: "Mixed media", note: "Collage, assemblage, textile, found material." },
  { id: "sculpture", name: "Sculpture", note: "Carved, cast, constructed, installed." },
  { id: "ceramics", name: "Ceramics", note: "Vessels, figures and surfaces made in clay." },
  { id: "drawing", name: "Drawing", note: "Graphite, charcoal, ink, pastel, pen." },
  { id: "print", name: "Printmaking", note: "Monoprint, serigraphy, etching and related forms." },
] as const;
