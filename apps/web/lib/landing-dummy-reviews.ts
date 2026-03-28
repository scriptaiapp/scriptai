export type LandingDummyReview = {
  id: string
  name: string
  handle: string
  subscriberLine: string
  quote: string
  img: string
}

export const LANDING_DUMMY_REVIEWS: readonly LandingDummyReview[] = [
  {
    id: "r1",
    name: "Jordan M.",
    handle: "@jordanplays",
    subscriberLine: "Gaming channel · 420K subs",
    img: "https://avatar.vercel.sh/jordan-m",
    quote:
      "Script drafts used to take me a full day. Now I get a solid first pass in minutes and it actually sounds like me.",
  },
  {
    id: "r2",
    name: "Priya S.",
    handle: "@priyaedu",
    subscriberLine: "Education · 180K subs",
    img: "https://avatar.vercel.sh/priya-s",
    quote:
      "The thumbnail workflow alone paid for itself. I ship more tests per week without burning out my designer.",
  },
  {
    id: "r3",
    name: "Alex R.",
    handle: "@alextech",
    subscriberLine: "Tech reviews · 95K subs",
    img: "https://avatar.vercel.sh/alex-r",
    quote:
      "Subtitles + export formats just work. I stopped juggling three different tools for the same upload.",
  },
  {
    id: "r4",
    name: "Sam K.",
    handle: "@samvlogs",
    subscriberLine: "Lifestyle vlog · 310K subs",
    img: "https://avatar.vercel.sh/sam-k",
    quote:
      "I was skeptical about “AI voice,” but the tone matching is scary good. Fewer rewrites before I hit record.",
  },
  {
    id: "r5",
    name: "Taylor L.",
    handle: "@taylorfinance",
    subscriberLine: "Finance · 75K subs",
    img: "https://avatar.vercel.sh/taylor-l",
    quote:
      "Story structure suggestions helped me tighten intros. Average view duration is up since I switched.",
  },
  {
    id: "r6",
    name: "Morgan D.",
    handle: "@morganfit",
    subscriberLine: "Fitness · 220K subs",
    img: "https://avatar.vercel.sh/morgan-d",
    quote:
      "Having scripts, thumbs, and ideas in one dashboard means I finally plan a month ahead instead of winging it.",
  },
  {
    id: "r7",
    name: "Casey V.",
    handle: "@caseybeats",
    subscriberLine: "Music production · 140K subs",
    img: "https://avatar.vercel.sh/casey-v",
    quote:
      "Dubbing experiments for non-English audiences were a pain. This removed the friction completely.",
  },
  {
    id: "r8",
    name: "Riley N.",
    handle: "@rileydiy",
    subscriberLine: "DIY & crafts · 60K subs",
    img: "https://avatar.vercel.sh/riley-n",
    quote:
      "The UI is fast and the outputs don’t feel generic. It’s become part of my weekly upload ritual.",
  },
] as const
