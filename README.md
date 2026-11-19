# Øktplanleggeren

Mobilvennlig nettapp for barnetrenere i håndball (10–12 år). Legg inn spillere, hall, utstyr, tid og tema, og få en ferdig økt med mest mulig spill med motstander, automatisk inndeling, settklokke for hallen og A4-utskrift.

- Spesifikasjon og beslutninger: [docs/SPEC.md](docs/SPEC.md)
- Øvelsesbank: [data/exercises.json](data/exercises.json)
- Regelmotor (rene funksjoner med tester): `src/planner/`

```bash
npm install
npm run dev    # utvikling
npm test       # tester for regelmotor og språk
npm run build  # bygg til dist/
```

Appen publiseres automatisk til GitHub Pages ved push til `main`. Den lagrer aldri navn eller nivå på barn.
