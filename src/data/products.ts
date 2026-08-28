/** Catalog of Loopsware products shown on the homepage and about page.
 *  Add a product here, then add a matching device visual in DeviceVisual.astro.
 */
export type Product = {
  slug: "plany" | "recipy";
  index: string;
  name: string;
  url: string;
  category: string;
  tagline: string;
  description: string;
  highlights: string[];
  platforms: string[];
};

export const products: Product[] = [
  {
    slug: "plany",
    index: "01",
    name: "Plany",
    url: "https://plany.travel/",
    category: "Travel",
    tagline: "Every trip. Every spot. Every plan.",
    description:
      "Turn places you save on social into routes you actually take — itineraries, costs, and a map that stays in sync.",
    highlights: [
      "Import spots from TikTok, Reels, and Shorts",
      "Optimized day-by-day routes",
      "Trip cost estimates for stays, food, and activities",
      "AI travel companion for weather, prices, and places",
    ],
    platforms: ["iOS", "Android"],
  },
  {
    slug: "recipy",
    index: "02",
    name: "Recipy",
    url: "https://recipy.food/",
    category: "Food",
    tagline: "A week of plates in seconds.",
    description:
      "Weekly meal plans around the grocer you already walk — macros, cook times, and a shopping list that survives the aisle.",
    highlights: [
      "Plans priced against 80+ real supermarkets",
      "Protein, carbs, fat, and cost per serving",
      "Shopping lists grouped the way stores are stocked",
      "Paste a recipe from TikTok, Facebook, or YouTube",
    ],
    platforms: ["iOS"],
  },
];
