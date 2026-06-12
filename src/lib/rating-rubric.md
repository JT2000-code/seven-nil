# 7-0 Rating Rubric

All player ratings in 7-0 are **original editorial estimates** on a 0–99 scale.
They are not sourced from, derived from, or affiliated with any commercial
ratings provider, game publisher, or governing body. They exist for nostalgia,
debate, and gameplay balance.

Every player carries **two** numbers:

| Field | Meaning |
| --- | --- |
| `rating` | The player **as they were at that exact tournament** ("Career Season" mode). A young Henry in 1998 rates lower than peak Henry. |
| `prime` | The player's **career-best** level ("Prime" mode). Always `>= rating`. |

## The 0–99 bands

| Band | Tier | Meaning |
| --- | --- | --- |
| 96–99 | Pantheon | Inner-circle GOAT, redefined the sport at this tournament. (Pelé '70, Maradona '86, Cruyff '74, Messi '22) |
| 92–95 | Generational | Best player in the world class; tournament-defining force. |
| 88–91 | World-class | Elite starter for any all-time XI; decisive in knockouts. |
| 84–87 | Elite | Top international, reliable difference-maker. |
| 80–83 | Very good | Quality first-choice starter. |
| 75–79 | Solid | Dependable squad regular / strong role player. |
| 70–74 | Squad | Rotation, depth, or era-context starter. |
| < 70 | Fringe | Bench / limited tournament impact. |

## How a rating is built

A player's tournament `rating` blends four weighted factors, then is normalised
to the bands above:

1. **Peak reputation (35%)** — career accolades and standing: Ballon d'Or
   finishes, era dominance, consensus "best in the world" periods.
2. **Tournament impact (30%)** — what they actually did *that* tournament:
   goals, assists, knockout-stage performances, iconic moments.
3. **Role & level at the time (20%)** — age and form during the tournament; a
   pre-peak prospect or a fading veteran is rated for that moment.
4. **Positional value (15%)** — scarcity and influence of the position; a
   transcendent GK or a deep playmaker gets due credit.

`prime` is then set to the player's career-best expression of factors 1 & 3,
ignoring the specific-tournament discount.

## Positional eligibility

Each player lists every `Position` they can credibly fill. Versatile players
(e.g. Lahm at RB/CDM, Messi at RW/CAM/ST) list multiple slots so they can be
drafted flexibly. This is deliberately generous to keep the draft fun.

## Editorial principles

- **Consistency over precision.** Two comparable players from different eras
  should land in the same band.
- **Reward the moment.** A tournament that defined a player's legend lifts the
  `rating` toward their `prime`.
- **No false exactness.** Ratings are opinions designed to spark "well actually"
  arguments — that debate *is* the product.
- **Transparency.** This file is the single source of truth for how numbers are
  assigned, and ships with the app.

> 7-0 is an independent, fan-made game. It is not affiliated with, endorsed by,
> or associated with any football competition, governing body, or ratings
> provider. All names and data are used for descriptive and editorial purposes
> only.
