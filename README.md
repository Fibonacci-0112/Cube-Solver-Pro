# Cube Improver

An app to help improve your Rubik's cube abilities. Time and track your solves,
generate random scrambles and train algorithms.

One TypeScript codebase runs on **Windows** (as a desktop app, packaged for the
Microsoft Store) and on the **web** (as an installable, offline-capable page).

---

## What it does

**Timer.** Hold the spacebar until it goes green, release to start, press
anything to stop — or hold the panel on a touchscreen. Optional WCA inspection
with the two-second and DNF penalties for overrunning it. Mark a solve `+2` or
`DNF`, write a note on it, or delete it.

**Scrambles for 2x2 through 7x7.** 2x2 and 3x3 are *random-state*: a cube
position is drawn uniformly at random and then solved backwards, so every
position is equally likely. 4x4 and up use the random move sequences the WCA
specifies, at the lengths it specifies. The next scramble is generated in the
background while you solve the current one, so the timer never waits.

**Statistics.** Averages follow competition rules — the fastest and slowest
solves are dropped, a DNF sorts as worse than any time, and an average holding
more DNFs than it can drop is itself a DNF. Trend line with rolling averages,
distribution of your times, and the full solve list.

**Algorithm trainer.** All 41 F2L, 57 OLL and 21 PLL cases. Set the case up on
your cube with the moves shown, solve it, and the trainer records a time per
case — then weights what comes next towards cases you have never seen, cases
you are still learning, and cases that are slow compared with the rest of your
set. Setups include a random top-layer turn so you meet each case from
different angles.

**27 tutorials.** Notation and the beginner method, the move to CFOP and each
of its steps, guides on lookahead, finger tricks, colour neutrality, inspection
and practice routines, big-cube reduction and parity, and two **solve-alongs**:
turn a cube in the app and it reads the position and tells you the next step,
naming the exact F2L, OLL or PLL case in front of you.

Every cube picture in the app is drawn from a real cube state rather than
stored as an image, so a picture cannot disagree with the algorithm beside it.

## Your data

Everything is stored on the device, in IndexedDB. There is no account, no
server and nothing is uploaded — which also means there is no backup unless you
make one. **Settings → Export everything** writes a JSON file; import reads that
back, and also reads csTimer exports.

## Running it

```bash
npm install
npm run dev          # web app at http://localhost:5173
npm test             # unit tests
npm run typecheck
```

To run the desktop shell against the dev server:

```bash
npm run electron:dev
```

## Building

```bash
npm run build        # the web app, into dist/
npm run dist:win     # Windows .exe installer, into dist-release/
npm run dist:store   # Windows MSIX/AppX package for the Microsoft Store
```

The Windows packages must be built on Windows. The CI workflow does this on
every push and uploads them as artifacts.

### Publishing to the Microsoft Store

The Store only accepts a package whose identity matches the listing you
reserved, so three values need replacing before submitting. Reserve the app
name in [Partner Center](https://partner.microsoft.com/dashboard) first, then
open **Product management → Product identity** and copy:

| Partner Center field | Where it goes |
| --- | --- |
| `Package/Identity/Name` | `appx.identityName` |
| `Package/Identity/Publisher` | `appx.publisher` |
| `Package/Properties/PublisherDisplayName` | `appx.publisherDisplayName` |

Either edit `electron-builder.yml` directly, or set them as repository
variables named `APPX_IDENTITY_NAME`, `APPX_PUBLISHER` and
`APPX_PUBLISHER_DISPLAY_NAME` — the CI workflow builds the Store package only
once those are present, since a package built with the placeholder identity
cannot be uploaded anyway.

You do not need a code-signing certificate: the Store signs the package on
submission.

### Installing from the web instead

The web build is a progressive web app. Open it in Edge or Chrome on Windows and
use **Install this app** — it gets its own window, a Start-menu entry, and works
offline. No installer, no Store listing.

## How correctness is established

The cube engine is the part where a subtle mistake produces plausible-looking
nonsense, so it is checked rather than trusted:

- **Two independent models of the cube.** A sticker model derived from a 3D
  geometric model, and a permutation model used by the solver. The tests assert
  they agree on 500 random scrambles, and pin the derived facelet tables against
  the standard ones.
- **Scrambles verify themselves.** A random state is drawn, the scramble is
  built from it, and the test asserts that applying that scramble to a solved
  cube lands on exactly that state.
- **The 2x2 solver finds a worst case of exactly 11 moves** across 1500 states,
  matching God's number for 2x2 in the half-turn metric — which confirms the
  distance table spans the whole state space.
- **Algorithm coverage is proven, not assumed.** The case spaces are enumerated
  from the cube's own constraints, which independently derives the familiar
  counts of 57 OLL, 21 PLL and 41 F2L cases. Each set is then asserted to cover
  its space exactly once, so a missing, duplicated or mistyped algorithm fails
  the build.
- **The F2L algorithms are generated rather than transcribed.**
  `scripts/generate-f2l.mjs` searches outwards from a solved cube using only the
  faces bounding the slot and records the shortest route to each case.

There are 141 tests. `scripts/smoke-electron.cjs` additionally launches the real
Electron shell and checks the app loads, has a secure origin, can open its
database and generates a scramble.

## Layout

```
src/cube/        cube models, notation, solvers, scramble generation
src/algs/        F2L/OLL/PLL data, case identification, drill logic
src/stats/       solve records and the average rules
src/db/          local storage, import and export
src/state/       app state, the timer, the scramble queue
src/components/  cube diagrams, charts, shared pieces
src/routes/      the screens
src/tutorials/   lesson content and the solve-along analysis
electron/        desktop main and preload processes
```

### Adding another algorithm set

A set is self-describing: it knows how to identify one of its cases from a cube
state, how to enumerate every case that can exist, and what must be true of a
case state. Write a data file exporting an `AlgSet` and add it to the list in
`src/algs/index.ts` — the shared test then verifies it automatically, including
full coverage of whatever case space it defines.
