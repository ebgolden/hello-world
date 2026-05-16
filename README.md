# Physics Theory Validator

A test harness for candidate physics theories. Observations are encoded as
unit tests; theories are encoded as classes that make predictions; the runner
reports which theories are consistent with which observations.

This is **a validation framework, not a theory-derivation framework**. The
tests don't *build* a theory by curve-fitting — they *try to falsify* a
candidate theory expressed as a single mathematical framework. A theory that
passes the suite has not yet been falsified by it; that is the most a test
suite can ever say.

## The candidate-style trilemma

After working through several candidate theories, a structural trilemma
became visible. Every concrete theory candidate falls into one of three
categories, each with a representative implementation in this repo:

| Style | Example | Result on 38-test suite | Honest description |
|---|---|---|---|
| **Made-up-to-fit** | `UnifiedHolographicFramework` (UHFT) | 34 / 38 pass | Declares predictions matching observations. Falsified by tightening the suite (it cannot satisfy two different H0 measurements with one number, has nothing to say about S8 or Li-7). |
| **Speculation-with-structure** | `RecursiveCausalDiamondCosmology` (RCDC) | 38 / 38 pass | One new postulated scale L_d. Claims a single non-minimal coupling fixes four open tensions (H0, S8, Li-7, g-2). Passes by *claimed* derivations; the math is gestured at, not proved. |
| **Rethink-from-scratch** | `PureRelationalSubstrate` (PRS) | 4 / 38 pass | Drops the continuous manifold, fields, Lagrangian, and probability as primitives. Passes only the conceptual tests it can answer without coarse-graining derivations. Fails most quantitative tests *because the derivations don't exist yet*, not because the framework is wrong. |

The trilemma is unavoidable in code alone. To escape it you need original
derivation work — recovering quantitative observables from primitives — that
a validator cannot supply. The validator's job is to make the trilemma
visible and to make each candidate's commitments explicit.

## Layout

```
theory_validator/
├── observation.py            # Observation + Prediction dataclasses
├── theory.py                 # Theory base class
├── runner.py                 # runs a (theory, observation) pair
├── observations/             # the unit tests, grouped by domain
│   ├── relativity.py         # Mercury perihelion, GPS, GW strain, ...
│   ├── cosmology.py          # H0 (split into local + CMB), S8, Li-7, CMB, BBN, ...
│   ├── galactic.py           # rotation curves, Bullet Cluster, ...
│   ├── particle.py           # Higgs/electron masses, muon g-2, alpha, ...
│   └── quantum.py            # QM-GR unification, hierarchy, Lambda naturalness
└── theories/
    ├── general_relativity.py
    ├── standard_model.py
    ├── lambda_cdm.py
    ├── string_theory.py
    ├── tired_light.py
    ├── mond.py
    ├── loop_quantum_gravity.py
    ├── unified_holographic_framework.py    # (1) made-up-to-fit baseline
    ├── recursive_causal_diamond.py         # (2) speculation-with-structure
    └── pure_relational_substrate.py        # (3) rethink-from-scratch
```

## Running

```bash
python3 run_validator.py    # print full matrix + summary + calibration check
python3 -m pytest tests/    # the framework's own sanity tests
```

## How an observation is checked

Each `Observation` carries a measured value, an uncertainty, and a tolerance
in sigma (default 3σ; tightened to 2σ for the open-tension tests). A
theory's `Prediction` carries its own value and optional theoretical
uncertainty. The check combines uncertainties in quadrature and passes if
the prediction is within tolerance. Categorical observations (e.g. "is the
CMB a blackbody?") use exact equality.

A theory that has no prediction for an observation (returns `None`) **fails**
that test — a Theory of Everything is required to address every domain.

## The test-suite calibration check

Each existing theory declares, per observation, the PASS/FAIL outcome that
the physics literature documents — e.g. tired light is expected to FAIL the
Tolman surface-brightness test, MOND is expected to FAIL the Bullet Cluster,
LCDM is expected to FAIL the local H0 / S8 / Li-7 tests (those are the open
tensions). The runner reports any mismatch between expected and actual
outcomes; a mismatch means either the theory implementation is wrong or the
test is miscalibrated. This is how the test suite is validated *before*
being used to validate the candidate theories.

## How to push on the candidates

- **Falsify RCDC further**: add more tests. The growth index f sigma_8(z) at
  multiple redshifts, the CMB lensing amplitude, primordial gravitational
  waves r, the small-scale lensing power. Any of these may break the
  one-parameter coherence claim.
- **Develop PRS into something testable**: derive *one* observable
  (anything — say, an emergent dimensionality of 4 ± epsilon) rigorously
  from the relational primitives. Add it as a unit test. Repeat for the
  next observable. This is multi-paper research per observable, but each
  derivation moves a FAIL to a PASS for honest reasons.
- **Build candidate (4)**: a from-scratch theory that *has* done at least
  some derivations. None exists at the time of this commit; making one is
  the actual unsolved problem.
