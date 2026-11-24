@README.md

## Regler for Claude
- `docs/SPEC.md` er spesifikasjonen og beslutningsloggen. Les relevant del før du endrer regelmotoren eller datamodellen.
  Språkkravene står i §6, og senere faser (som ikke skal bygges ennå) i §8.
- Regelmotoren i `src/planner/` består av rene funksjoner med tester. Kjør `npm test` og `npm run typecheck` før commit.
- Push til `main` publiserer automatisk til GitHub Pages (offentlig repo). Push er altså publisering, så spør først.
- Appen lagrer aldri navn eller nivå på barn.
- Kjør lokalt: `npm run dev`, eller preview-navnet `okt`.
