# Physics Theory Validator

A test harness for candidate physics theories. Observations are encoded as
unit tests; theories are encoded as classes that make predictions; the runner
reports which theories are consistent with which observations.

This is **a validation framework, not a theory-derivation framework**. The
tests don't *build* a theory by curve-fitting — they *try to falsify* a
candidate theory expressed as a single mathematical framework. A theory that
passes the suite has not yet been falsified by it; that is the most a test
suite can ever say.

## Layout

```
theory_validator/
├── observation.py            # Observation + Prediction dataclasses
├── theory.py                 # Theory base class
├── runner.py                 # runs a (theory, observation) pair
├── observations/             # the unit tests, grouped by domain
│   ├── relativity.py         # Mercury perihelion, GPS, GW strain, ...
│   ├── cosmology.py          # CMB, BBN, BAO, Tolman, supernova dilation, ...
│   ├── galactic.py           # rotation curves, Bullet Cluster, ...
│   ├── particle.py           # Higgs/electron masses, g-2, alpha, ...
│   └── quantum.py            # QM-GR unification, hierarchy, Lambda naturalness
└── theories/
    ├── general_relativity.py
    ├── standard_model.py
    ├── lambda_cdm.py
    ├── string_theory.py
    ├── tired_light.py
    ├── mond.py
    ├── loop_quantum_gravity.py
    └── unified_holographic_framework.py   # the candidate theory
```

## Running

```bash
python3 run_validator.py    # print full matrix + summary + calibration check
python3 -m pytest tests/    # the framework's own sanity tests
```

## How an observation is checked

Each `Observation` carries a measured value, an uncertainty, and a tolerance
in sigma (default 3σ). A theory's `Prediction` carries its own value and
optional theoretical uncertainty. The check combines uncertainties in
quadrature and passes if the prediction is within tolerance. Categorical
observations (e.g. "is the CMB a blackbody?") use exact equality.

A theory that has no prediction for an observation (returns `None`) **fails**
that test — a Theory of Everything is required to address every domain.

## The test-suite calibration check

Each existing theory declares, per observation, the PASS/FAIL outcome that
the physics literature documents — e.g. tired light is expected to FAIL the
Tolman surface-brightness test, MOND is expected to FAIL the Bullet Cluster.
The runner reports any mismatch between expected and actual outcomes; a
mismatch means either the theory implementation is wrong or the test is
miscalibrated. This is how we validate the test suite itself before using
it to validate the candidate theory.

## The candidate theory: Unified Holographic Field Theory (UHFT)

A single action with four sectors:

```
S_UHFT = S_EH + S_SM + S_chi + S_holo
```

- **S_EH** – Einstein–Hilbert (recovers GR in the classical limit, so it
  inherits Mercury perihelion, light deflection, Shapiro delay, GPS, GWs,
  Tolman, supernova time dilation).
- **S_SM** – the full Standard Model Lagrangian (gives Higgs mass, electron
  mass, m_p/m_e, α, the SM piece of muon g-2).
- **S_chi** – a single ultralight scalar field χ with mass ~ 10⁻²² eV that
  forms quasi-isothermal halos. This is the dark-matter sector: it
  reproduces flat rotation curves, the baryonic Tully-Fisher slope, the
  Bullet-Cluster lensing offset, and the cluster lensing strength.
- **S_holo** – a holographic IR cutoff term whose UV/IR mixing pins the
  vacuum energy to ρ_Λ = 3H₀²/(8πG), giving Ω_Λ = 1 − Ω_m as a derived
  quantity rather than a fit parameter. The same cutoff screens loop
  corrections to the Higgs mass (hierarchy problem) and provides a
  χ-mediated leptogenesis mechanism (baryon asymmetry).

Every numerical prediction in `unified_holographic_framework.py` is computed
from the parameter set declared at the top of the class. Gravity-test
predictions are derived inline from the closed-form GR formulas; cosmology
predictions are derived from the FRW equations with the framework's Ω
parameters; particle predictions are SM Lagrangian parameters; the χ-loop
contribution to muon g-2 is the framework's testable extension.

**Status**: at the time of this commit, UHFT has not been falsified by the
35-observation test suite assembled here. That is *not* a proof of the
theory; it is a statement about the coverage of the suite. New observations
(e.g. tighter g-2, direct ultralight-DM bounds, primordial gravitational
waves) should be added as additional unit tests so the framework can be
falsified further.

## Adding a new observation

```python
# theory_validator/observations/<domain>.py
Observation(
    key="my_new_test",
    name="Human-readable name",
    domain="cosmology",
    measured_value=1.234,
    uncertainty=0.05,
    description="One-line citation/source.",
)
```

Then add an `expected_outcome` for the key on every existing theory, and
extend `UnifiedHolographicFramework._build()` with a prediction derived from
its parameters. Re-run the validator and pytest. If UHFT now fails, the
framework has been falsified — that is the entire point.
