# DetroitBakery.com

An independent, verification-first guide to bakeries in Detroit and nearby cities.

The premise: most bakery listings tell you a place exists. This one tells you the facts
that decide a purchase, how far ahead a custom cake must be ordered, who is open Sunday,
who sells paczki year round, and what the bakery itself publishes about prices. Every
profile carries the date a person last checked it.

## Stack

- Astro 7, TypeScript, static output
- Content collections with Zod schemas, validated at build time
- No database, no CMS, no runtime server
- GitHub to Netlify

## Running it

```bash
npm install
npm run dev        # local dev at localhost:4321
npm run build      # static build to dist/
npm run validate   # content checks, run this before committing
```

## Adding or editing a bakery

Every bakery is one JSON file in `src/content/bakeries/`. The filename must match the
`slug` field. Nothing else needs touching, the profile page, the directory, the
comparison tables, the sitemap and the structured data all regenerate from it.

1. Copy an existing file in `src/content/bakeries/`.
2. Fill it in from the bakery's own website. Set `verifiedOn` to today.
3. Run `npm run validate`.
4. Commit. Netlify rebuilds automatically.

### The rules that make this site worth reading

- **Never invent a fact.** No guessed hours, prices, phone numbers or lead times. If it is
  not confirmed, leave it out.
- **Primary sources only for operational facts.** The bakery's own site, or the bakery
  telling you directly. Local journalism is fine for cultural context, never for hours.
- **Do not use Google Maps, Places or Yelp content.** Their terms forbid it. Places permits
  storing `place_id` and nothing else; Yelp caps caching at 24 hours and licenses
  non-commercial use only.
- **Tri-state fields are `yes`, `no`, or `unknown`.** Never write `no` because you did not
  check. `unknown` renders as "Not confirmed" and is excluded from filters, which is what
  makes the filters trustworthy.
- **`publication` and `operational` are separate.** A bakery on hiatus is
  `operational: "temporarily_closed"` and stays out of the live list. Only
  `published` + `operating` renders.
- **Every profile needs at least one source** with a real URL and the date checked.
- **No em dashes or en dashes** anywhere. The validator fails the build on these.

### Fields that matter most

`customCakeLeadTime`, `customCakeProcess`, `hours`, `priceExamples`, `openSunday`,
`paczkiYearRound`. These are the decision facts. A profile with none of them will build,
but the validator warns, because a listing without a decision fact is just a phone book
entry.

## Maintenance

The freshness is the product. A stale listing is worse than no listing.

| What | How often |
|---|---|
| Reported errors | Within a week |
| Hours, prices, lead times | Quarterly |
| Full audit of every profile | Twice a year |
| Paczki pricing and dates | Every January, refresh or remove |

`npm run validate` warns on any profile whose `verifiedOn` is more than 120 days old.

## Deploying

Netlify is configured by `netlify.toml`: build `npm run build`, publish `dist`, Node 24.
Pushing to the default branch deploys. Rolling back is a one-click deploy revert in the
Netlify dashboard.

### Setup checklist for the owner

- [ ] Connect the repo in Netlify and set the custom domain to `detroitbakery.com`
- [ ] Confirm the `www` to apex redirect works (configured in `netlify.toml`)
- [ ] Enable **Forms** in Netlify, then submit each form once and confirm it arrives in the dashboard. A success page alone does not prove delivery.
- [ ] Verify the domain in Google Search Console and submit `https://detroitbakery.com/sitemap-index.xml`
- [ ] Add analytics if wanted. Nothing is installed yet, deliberately.

## Forms

Four Netlify forms: `correction`, `suggestion`, `contact`, and the honeypot field
`company-website` on each. They post to `/thanks/`, which is `noindex`. Netlify detects
forms from the built HTML, so they must exist in the static output, which they do.

## What is deliberately not here

No accounts, no reviews, no ratings, no `aggregateRating` markup, no ad network, no
affiliate links, no lead resale, no map application, no photos we lack permission to use.
Each was considered and cut. Sponsored placement, if it ever ships, goes in its own
labelled area with `rel="sponsored"` and never alters the standard ordering.
