"""Pure Relational Substrate (PRS).

A deliberate from-scratch attempt that drops, as far as honestly possible,
the structural assumptions shared by GR, QFT, string theory, LQG, and
every other framework in this repo.

================================================================
WHAT THIS POSTULATES (the entire ontology)
================================================================
1. There exists a finite set R of binary relations among atomic, unlabeled
   referents r_1, r_2, ... . There are no points, no spacetime, no fields,
   no particles a priori.
2. R evolves under a single combinatorial rewrite rule W that atomically
   adds, removes, and rewires relations. W is local in the sense that each
   rewrite touches only a bounded subgraph of R.
3. Nothing else.

================================================================
WHAT THIS DELIBERATELY DROPS
================================================================
- Continuous spacetime manifold   (GR, QFT, string, LQG all assume it)
- Fields on spacetime              (QFT, SM)
- Action / Lagrangian principle    (essentially all modern physics)
- Point particles, even effective  (SM, all BSM)
- Gauge symmetry as fundamental    (claimed here as emergent, not postulated)
- Probability as a primitive       (replaced by relative frequencies in the
                                    multi-way evolution of W)
- Real or complex numbers as the substrate   (only combinatorial counts)
- The notion of an "observer external to the system"

================================================================
WHAT EMERGES (claimed, not derived here)
================================================================
- Spacetime: from the metric induced by graph distance under W
- Lorentz invariance: approximate, holding at coarse-graining scales much
  larger than the discreteness scale L
- Energy: a count of rewrite events per coarse-grained causal volume
- Particles: persistent topological patterns in R (knots, solitons)
- Quantum amplitudes: weighted sums over compatible W-histories
- Gauge symmetries: residual symmetries of stable patterns under W

These are *claimed*. None of them are derived in this file. Deriving even
one of them rigorously is a research program, not a code commit.

================================================================
WHAT PRS CAN HONESTLY SAY RIGHT NOW
================================================================
Almost nothing quantitative. The cost of dropping the continuum is that
observables are not directly available -- they would have to be derived
as emergent coarse-grained averages, which this file does not perform.

The validator will (correctly) report PRS as failing nearly every
numerical test in the suite. That is the *honest* outcome: a true
from-scratch rethink, expressed in code today, looks like this.

The only confident statements PRS can make without derivation are
*conceptual*:

- Quantum-gravity unification is automatic (no separate gravity / matter
  sectors -- only relations).
- The cosmological-constant problem partly dissolves: there is no QFT
  vacuum energy to subtract from gravity in the first place.
- Discreteness at the Planck scale is consistent with all existing
  Lorentz-violation bounds (L > 10^-29 m from gamma-ray bursts).
- The CMB is a blackbody at coarse-graining temperature (the rewrite
  rate sets a thermal scale -- but the *value* is not predicted).

Everything else: the validator will mark FAIL, and that failure is the
honest report.
"""

from __future__ import annotations

from ..observation import Prediction
from ..theory import Theory


class PureRelationalSubstrate(Theory):
    name = "Pure Relational Substrate (PRS)"
    short_name = "PRS"
    summary = (
        "From-scratch ontology: only binary relations among unlabeled "
        "referents and one rewrite rule W. Spacetime, fields, particles, "
        "and probability are all claimed-to-emerge. Quantitatively "
        "underspecified by construction."
    )

    def _build(self) -> None:
        self.predictions: dict[str, Prediction] = {}
        self.expected_outcomes: dict[str, str] = {}

        # The only things PRS can confidently state without derivation:
        confident = {
            # Unification is automatic: there is only one substrate (relations
            # under W). There is no separate gravity sector to quantize.
            "qm_gr_unification": True,
            # No QFT vacuum to subtract -> the cosmological-constant problem
            # in its standard form does not arise. (PRS does not predict
            # the *value* of Lambda; it predicts the *naturalness* claim.)
            "cosmological_constant_natural": True,
            # Lorentz invariance is emergent and approximate. At the scales
            # tested by Michelson-Morley (delta c/c < 1e-17), PRS is
            # consistent because the discreteness scale L ~ L_Planck is
            # eighteen orders of magnitude finer than the optical-cavity
            # scales the experiment probes.
            "michelson_morley": 0.0,
            # Same argument: time-dilation tests at energies far below the
            # Planck scale see only the coarse-grained Lorentz-invariant
            # limit.
            "ives_stilwell": 1.0,
        }
        for key, value in confident.items():
            unc = 0.0 if isinstance(value, (int, float)) else 0.0
            self.predictions[key] = Prediction(value, unc)

        # Everything else: PRS has no derived prediction. We do not insert
        # a fake one. The runner will see the missing key, get None, and
        # mark FAIL. That failure is the honest report.
        #
        # We still need to declare *expected* outcomes so the calibration
        # check knows what PRS is supposed to do. Document outcomes for
        # every observation key the suite uses.
        all_keys = [
            # relativity
            "mercury_perihelion", "light_deflection_sun", "shapiro_delay",
            "gravitational_wave_strain", "gps_time_dilation",
            "michelson_morley", "ives_stilwell", "hafele_keating",
            # cosmology
            "hubble_local", "hubble_cmb", "sigma_8_lensing",
            "lithium_7_primordial", "cmb_temperature", "cmb_blackbody_shape",
            "cmb_first_acoustic_peak", "bbn_helium_fraction", "bao_scale",
            "supernova_time_dilation", "tolman_surface_brightness",
            "dark_energy_density", "matter_density",
            # galactic
            "galaxy_rotation_flatness", "bullet_cluster_offset",
            "cluster_lensing_strength", "tully_fisher_slope",
            # particle
            "higgs_mass", "electron_mass", "proton_electron_mass_ratio",
            "muon_g2_anomaly", "proton_decay_lifetime",
            "neutrino_mass_squared_diff", "fine_structure_constant",
            # foundational
            "qm_gr_unification", "dark_matter_provided",
            "dark_energy_provided", "hierarchy_problem_addressed",
            "cosmological_constant_natural", "matter_antimatter_asymmetry",
        ]
        for key in all_keys:
            if key in self.predictions:
                self.expected_outcomes[key] = "PASS"
            else:
                # No derivation yet -> we *expect* the validator to mark
                # this FAIL. That is what a from-scratch rethink looks like
                # before the coarse-graining derivations are done.
                self.expected_outcomes[key] = "FAIL"
