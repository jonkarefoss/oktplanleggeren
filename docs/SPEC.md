# Øktplanleggeren – prosjektbeskrivelse for Claude Code

> **Beslutninger for fase 1 (18.11.2026).** Punktene under går foran resten av dokumentet der de er i konflikt.
>
> **Avklaringer**
> 1. Kampblokken i 60-minuttersmalen er justert til 15 min (39–54), og spillernes valg er kortet ned til 3 min (54–57). Se de nye malene under.
> 2. `kidText` nevner aldri settlengde. Lengden vises ved siden av teksten i appen.
> 3. Antall spillere er 8–24 (maks 8 per bane × 3 baner).
> 4. Hallen: Én halvdel kan deles i opptil tre baner på tvers, med eller uten skillevegg. Treneren velger «hel» eller «halv» hall og 1–3 baner. Banetypene passer slik:
>    - `tverrbane`: alltid.
>    - `halv-bane`: halv hall med 1 bane, eller hel hall med 1–2 baner.
>    - `hel-bane`: bare i hel hall. Øvelsen bruker hele hallen og alle spillerne, uansett antall baner.
>    - `hele-hallen` (oppvarming): alltid, med alle spillerne samlet.
> 5. Språktesten sjekker hele ord, ikke bokstavrekker.
> 6. «Lås blokk og generer på nytt» er fjernet.
>
> **Forenklinger**
> - Faste maler for 60, 75 og 90 min. Regelmotoren fyller plassene med øvelser som passer.
> - «Bytt øvelse» per blokk (per bane for stasjoner) erstatter låsing. Lagres som `overrides`.
> - Utstyr: avkrysning for hva dere har. Antall oppgis bare for baller og håndballmål. Et avkrysset utstyr regnes som nok.
> - Voksne: «Én voksen» eller «Flere voksne».
> - Ingen variasjon fra forrige økt.
> - Bytte mellom sett er fast 1,5 min (ikke konfigurerbart i fase 1).
> - Lagring i `localStorage`, ikke IndexedDB.
> - Ingen figurer på øvelseskortene.
> - Spillernes valg: Treneren trykker på øvelsen barna valgte, fra lista over dagens øvelser. Forslaget er spilløvelsen.
> - Øvelsesbanken filtreres bare på type.
> - A4: enkel utskrift først. Kravet om nøyaktig to sider tas i neste runde.
> - Mobilvisningen i hallen bygges før A4.
>
> **Maler (byttetid 1,5 min er regnet inn i blokkene)**
>
> | 60 min | 75 min | 90 min |
> |---|---|---|
> | 0–8 Oppvarming 1 × 8 | 0–8 Oppvarming 1 × 8 | 0–8 Oppvarming 1 × 8 |
> | 8–10 Pause/forklaring | 8–10 Pause/forklaring | 8–10 Pause/forklaring |
> | 10–22 Stasjoner 3 × 3 | 10–22 Stasjoner 3 × 3 | 10–22 Stasjoner 3 × 3 |
> | 22–37 Spill 3 × 4 | 22–37 Spill 3 × 4 | 22–37 Spill 3 × 4 |
> | 37–39 Drikkepause | 37–39 Drikkepause | 37–39 Drikkepause |
> | 39–54 Kamp 3 × 4 | 39–59½ Kamp 4 × 4 | 39–59½ Spill, del 2: 4 × 4 |
> | 54–57 Spillernes valg 1 × 3 | 59½–61½ Drikkepause | 59½–61½ Drikkepause |
> | 57–60 Samling 3 | 61½–71 Spillernes valg 2 × 4 | 61½–82 Kamp 4 × 4 |
> | | 71–75 Samling 4 | 82–86 Spillernes valg 1 × 4 |
> | | | 86–90 Samling 4 |
>
> Ingen strekning uten drikkepause er lengre enn 30 min.


## 1. Hva vi bygger

En mobilvennlig nettapp der en barnetrener legger inn antall spillere, hall, utstyr, tid og tema, og får en ferdig økt med mest mulig spill med motstander, automatisk laginndeling, tid til bytter, og to visninger: A4 for utskrift og mobil for bruk i hallen (med settklokke).

Første målgruppe: håndball, gutter 10–12 år (5'er-håndball, 4 utespillere + målvakt). Trenerne er frivillige foreldre og vil bruke appen på telefonen.

Faglige prinsipper som appen skal håndheve:
- Minst 60 % av spilletiden er spill med motstander.
- Korte sett (3–4 min) og nye lag mellom settene. Ingen tabell over flere sett.
- Utfordring tilpasses inne i øvelsen (varianter, regelkort, utfordringskort), aldri ved å dele barna i nivågrupper. Appen lagrer aldri navn eller nivå på barn.
- All tekst som barna skal høre, er uten fagspråk.

## 2. Omfang, fase 1 (bygg dette først)

Med:
1. Oppsett-skjerm: antall spillere (8–30), antall voksne (1–4), hall (hel/halv), antall baner (1–3), utstyr (avkrysning, se 4.2), lengde (60/75/90 min), tema (fra liste).
2. Øktgenerator (regelmotor, se 5) som lager et øktforslag.
3. Øktvisning: blokker med tid, øvelse, inndeling per bane, begrunnelse. Treneren kan bytte øvelse i en blokk, låse en blokk og generere på nytt.
4. A4-visning med `@media print`, to sider.
5. Mobilvisning for hallen: settklokke (3/4/5 min, pip ved slutt, Wake Lock), inndelingsvelger (antall som faktisk kom), øktplan, øvelseskort med figur, regelkort, utfordringskort.
6. Øvelsesbank som lesbar liste med filter (tema, type, utstyr). Data lastes fra `data/exercises.json`.
7. Lagre siste oppsett og genererte økter lokalt (IndexedDB).

Ikke med i fase 1: innlogging, backend, deling, egen-øvelse-skjema, tegneflate, evaluering.

## 3. Teknologi (forslag, kan endres)

- Vite + React + TypeScript
- Ren CSS (CSS-variabler, lys og mørk modus) eller Tailwind
- PWA (kan legges på hjemskjermen, virker uten nett i hallen)
- Lagring: IndexedDB via `idb`
- Tester: Vitest for regelmotoren
- Hosting: statisk (GitHub Pages, Netlify eller Vercel)
- Språk i UI: norsk bokmål

Regelmotoren skal være rene funksjoner uten React, i `src/planner/`, slik at den kan testes og senere flyttes til en server.

## 4. Datamodell

### 4.1 Øvelse

```ts
type ExerciseType = "oppvarming" | "stasjon" | "spill" | "kamp" | "avslutning";

interface Exercise {
  id: string;                    // "2-mot-1"
  name: string;                  // "2 mot 1"
  type: ExerciseType;
  themes: string[];              // ["lokk-og-spill", "1-mot-1"]
  withOpponent: boolean;         // teller som spill med motstander
  playersPerCourt: { min: number; max: number };
  court: "tverrbane" | "halv-bane" | "hel-bane" | "hele-hallen";
  equipment: EquipmentNeed[];
  setMinutes: { min: number; max: number };
  kidText: string;               // forklaring til barna, uten fagspråk
  cues: string[];                // stikkord treneren roper
  questions: string[];           // spørsmål i pausene
  easier: string;
  harder: string;
  ruleCards?: boolean;           // bruker regelkort
  figure: Figure | null;         // fase 1: kan være null
  source: string;                // hvem la den inn
  version: number;
}

interface EquipmentNeed {
  need: EquipmentId;
  perCourt?: number;             // antall per bane
  perGroup?: number;             // antall per gruppe
  perPlayer?: number;            // f.eks. 1 ball per spiller
  substitutes: EquipmentId[];    // i prioritert rekkefølge
}
```

### 4.2 Utstyr

```ts
type EquipmentId =
  | "handballmal" | "fotballmal-lite" | "matte" | "benk"
  | "kjegler" | "vester-2-farger" | "vester-3-farger"
  | "baller" | "tape" | "fløyte";

interface EquipmentInventory {
  [id: string]: number;          // antall tilgjengelig; baller = antall baller
}
```

Regler:
- Mål kan erstattes i rekkefølgen håndballmål → lite fotballmål → matte på høykant → to kjegler.
- Ved lite fotballmål: vis påminnelse om å sikre målet mot velt.
- Ved lite mål (fotballmål, matte, kjegler): foreslå ingen målvakt og et felt på 3–4 m foran målet som ingen får gå inn i.

### 4.3 Kort

```ts
interface RuleCard { id: string; text: string; }        // lagene velger før settet
interface ChallengeCard { id: string; text: string; }   // frivillig for den som vil
```

### 4.4 Økt

```ts
interface SessionInput {
  players: number;
  adults: number;
  courts: 1 | 2 | 3;
  hall: "hel" | "halv";
  inventory: EquipmentInventory;
  minutes: 60 | 75 | 90;
  theme: string;
  locked?: Record<string, string>;  // blockId -> exerciseId
}

interface Block {
  id: string;
  label: string;                  // "Stasjoner", "Drikkepause"
  start: number; end: number;     // minutter fra start
  kind: "aktivitet" | "bytte" | "pause" | "samling";
  sets?: number;
  setMinutes?: number;
  courts: CourtAssignment[];      // én per bane
  why: string;                    // kort begrunnelse
}

interface CourtAssignment {
  court: number;                  // 1..3
  exerciseId: string;
  players: number;
  format: string;                 // "3 mot 3", "2 mot 2 + joker"
  equipmentUsed: EquipmentId[];
  warnings: string[];
}

interface GeneratedSession {
  input: SessionInput;
  blocks: Block[];
  playMinutes: number;            // faktisk spilletid
  opponentShare: number;          // andel av spilletid med motstander, 0..1
  warnings: string[];
}
```

## 5. Regelmotoren

### 5.1 Fordeling på baner

`splitPlayers(n, courts): number[]` fordeler så jevnt som mulig, de største gruppene først.

Forventet resultat med 3 baner (skal ha test):

| Spillere | Bane 1 | Bane 2 | Bane 3 |
|---|---|---|---|
| 14 | 5 | 5 | 4 |
| 15 | 5 | 5 | 5 |
| 16 | 6 | 5 | 5 |
| 17 | 6 | 6 | 5 |
| 18 | 6 | 6 | 6 |
| 19 | 7 | 6 | 6 |
| 20 | 7 | 7 | 6 |

`formatFor(playersOnCourt): string`:

| Spillere | Format |
|---|---|
| 3 | 2 mot 1, roterer |
| 4 | 2 mot 2 |
| 5 | 2 mot 2 + joker (spiller alltid med laget som har ballen) |
| 6 | 3 mot 3 |
| 7 | 3 mot 3 + joker |
| 8 | 4 mot 4 |
| over 8 | advarsel: foreslå én bane til, eller to øvelser på samme bane |

Full bane med tre lag (for eksempel 15 spillere, 5 mot 5): `rotation3Teams(sets)` gir rekkefølgen A–B, B–C, C–A … slik at hvert lag spiller to av tre kamper. Hvilelaget får en oppgave (for eksempel kast mot vegg på tid).

### 5.2 Tidsbudsjett

- Bytte mellom sett eller stasjoner: 1,5 min (konfigurerbart, 1–2 min).
- To drikkepauser à 2 min i en 60-minutters økt, tre i 90 min.
- Samling til slutt: 3 min.
- `playMinutes` = sum av sett × settlengde.
- Summen av alle blokker skal være nøyaktig lik `minutes`. Går det ikke opp, kutt sett fra kampblokken først.

### 5.3 Øktmal for 60 minutter (referanse, skal kunne reproduseres)

| Tid | Blokk | Innhold |
|---|---|---|
| 0–8 | Oppvarming | Stjel ballen |
| 8–10 | Pause/forklaring | Drikke, gå til banene |
| 10–22 | Stasjoner 3 × 3 min | 1 mot 1 · 2 mot 1 · skudd med valg, alle går én bane til høyre |
| 22–37 | Spill 3 × 4 min | 3 mot 3 med regelkort, nye lag mellom settene |
| 37–39 | Drikkepause | Les opp nye lag |
| 39–53 | Kamp 3 × 4 min | Uten regelkort, nye lag hvert sett |
| 53–57 | Spillernes valg | De stemmer over en øvelse fra dagen |
| 57–60 | Samling | To spørsmål og «hvor gøy var det?» 1–5 fingre |

Lag tilsvarende maler for 75 og 90 min ved å forlenge spill- og kampblokkene, ikke stasjonene.

### 5.4 Valg av øvelser

For hver blokk: filtrer banken på type, tema, `playersPerCourt` og tilgjengelig utstyr (med erstatninger). Rangér: tema-treff, deretter spill med motstander, deretter variasjon fra forrige økt. Låste blokker beholdes.

Hvis bare én voksen: bruk én felles øvelse for alle baner i stedet for tre ulike stasjoner.

### 5.5 Advarsler

- Andel spill med motstander under 60 %.
- Færre baller enn spillere i en øvelse der alle skal ha ball.
- Mer enn 8 spillere på en bane.
- Mangler mål som ikke kan erstattes.
- Ingen drikkepause etter 30 min.

## 6. Språkkrav

`kidText`, `cues`, regelkort og utfordringskort skal forstås av 10-åringer. Lag en enkel test som feiler hvis disse feltene inneholder fagord fra en liste, for eksempel:

`stuss, snapping, gjennombrudd, mannsmarkering, ballfører, svak hånd, ballhøyde, binde, avslutte, sone, overtall, undertall`

Bruk i stedet: sprett, ta ballen, komme forbi en forsvarer, hver sin å passe på, den med ballen, den andre hånda, løp hjem, lokk og spill, skyte, felt.

## 7. Akseptansekriterier, fase 1

- [ ] `splitPlayers` gir tabellen i 5.1 for 14–20 spillere (test).
- [ ] Generert 60-minutters økt med 16 spillere, 3 baner og fullt utstyr gir samme struktur som 5.3 (test).
- [ ] Alle økter summerer til valgt lengde, med bytte-tid og drikkepauser (test).
- [ ] Uten håndballmål foreslår appen erstatning og viser sikkerhetspåminnelsen.
- [ ] Språktesten i 6 passerer for hele `data/exercises.json`.
- [ ] A4-visningen får plass på to sider ved utskrift.
- [ ] Mobilvisningen fungerer på 375 px bredde, i lys og mørk modus, og uten nett etter første lasting.
- [ ] Settklokken piper ved slutt og holder skjermen våken.

## 8. Senere faser (ikke bygg nå, men ikke stå i veien for dem)

2. Egen bank: skjema for egne øvelser, kopier og endre, tegneflate for figurer, språksjekk ved lagring.
3. Klubb: innlogging, felles klubbank, deling, merking etter tema i klubbens årsplan, evaluering etter økta som påvirker forslagene.
4. Fotball og andre idretter. Henting av påmeldte fra klubbens påmeldingssystem hvis det har en åpen kobling. Bare antall, aldri navn.

## 9. Arbeidsrekkefølge

1. Prosjektoppsett, typer i `src/planner/types.ts`.
2. `splitPlayers`, `formatFor`, `rotation3Teams` med tester.
3. Tidsbudsjett og øktmal med tester.
4. Øvelsesvalg og advarsler med tester.
5. UI: oppsett → øktvisning → mobil i hallen → A4 → øvelsesbank.
6. PWA og lokal lagring.
