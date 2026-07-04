# Udbodhan — design specification for Saradakosh

## Grounding

Named for *Udbodhan*, the Bengali monthly founded in 1899 by direct disciples of Sri Ramakrishna under Swami Vivekananda's direction — the tradition's own publishing voice, still printed today from the Udbodhan Office in Baghbazar, Kolkata. This direction treats Saradakosh as an object from that print lineage: a serious, warm, ink-and-paper archive — not a wellness app, not a generic "spiritual site."

Rule of thumb for every decision below: would this belong on the shelf of a serious Bengali religious publisher in 1910, or does it look like a SaaS landing page? Prefer the former.

## Palette

| Role | Hex | Use |
|---|---|---|
| Background (parchment) | `#F2E8D5` | Page background |
| Surface (ivory) | `#FAF6EC` | Cards, content panels — slightly lighter than the page |
| Accent (oxblood maroon) | `#5C1A1B` | Headlines, primary buttons, active nav — color of traditional Bengali book-cloth bindings and sindoor |
| Muted accent (aged brass) | `#A67C27` | Dividers, rules, small ornaments only — never a fill color |
| Foreground (charcoal ink) | `#211D1A` | Body text |
| Utility (muted sage) | `#6B7A5E` | Links, secondary actions — used least often of all six |

Keep maroon to one primary action per screen. Brass is a trim color, not a background color — if brass starts filling large areas, pull back.

## Typography

- **Bengali display** — Noto Serif Bengali, weight 600. Reserved strictly for content/data display; never to be used for UI layout, headers, labels, or wordmarks.
- **Latin display** — Baskervville. Old book-typesetting serif with real character. Headlines and section titles only — never body copy.
- **Body** (English, transliteration, Hindi) — Noto Sans or Source Sans 3. Clean and legible across mixed scripts, since this is a multilingual archive.
- **Data/caption** — a tabular-numeral font for date ranges, so spans like "1836–1936" line up cleanly in lists.

Scale: display 32/40px · section title 22/28px · body 16/26px (generous line-height — this is long-form historical prose) · caption 13px.

## Layout

- Content column capped at ~68ch for reading passages (parables, letters). This is a reading archive first, a browsing tool second.
- Section dividers: a single 1px brass hairline with a small centered diamond or teardrop mark — echoes a woodblock chapter mark, not a generic icon.
- Cards: ivory surface, 1px maroon-tinted border (flat — no drop shadow), 4–6px radius. Not the rounded-pill SaaS look.
- Hero: no gradient mesh, no stock photography, and no illustrations containing script/text (to avoid language restrictions in UI). Uses a clean, centered, book-cover layout with the English title "Saradakosh" set in Baskervville.
- "Today in History": genuinely chronological, so a numbered/dated vertical spine with brass tick marks is earned here — unlike most numbered UI, this content actually is a sequence.

## Signature element

Manuscript-page-style borders on section and card dividers — a thin double rule, brass outer / maroon inner. This is the one recurring, distinctive device that ties every page back to the print heritage. Use it at section boundaries only; don't apply it to every element or it stops reading as special.

## Motion

Minimal. A single subtle fade/rise on hero load, nothing else animated by default. No parallax, no hover-scale on cards. Motion should never compete with the text.

## Do

- Write UI copy for what the reader controls, never how the data is stored — no raw database field or column names anywhere in the bibliography or metadata display.
- Give every async state (loading, empty, error) an explicit designed treatment in this palette — never a default browser spinner or unstyled text.
- Every content page gets a breadcrumb trail, styled brass-on-parchment, not a browser-default link chain.
- Check contrast specifically for maroon-on-parchment and charcoal-on-ivory — deep colors on warm cream can undershoot WCAG AA if not tuned.
- Respect `prefers-reduced-motion`.

## Don't

- No lotus icons, om symbols, or incense-stick genericism.
- No gradient hero backgrounds or glow effects.
- No cream/serif/terracotta AI-default look — this palette is deliberately deeper and more maroon than that.
- No numbered markers (01/02/03) except where content is a genuine sequence — the History timeline qualifies; most sections don't.
- Don't let brass become a dominant fill color.

## Quotes Page Layout

- **Sidebar**: Renders using `#5C1A1B` (oxblood maroon) as a background, with `#FAF6EC` (ivory) as text.
- **Main Area**: Uses the parchment background (`#F2E8D5`), keeping visual harmony with the rest of the archive.
- **Form Controls**: Drop-downs and text inputs are styled as flat ivory surfaces (`#FAF6EC`) with oxblood borders (`#5C1A1B`), supporting both Dawn and Midnight light/dark theme modes.

