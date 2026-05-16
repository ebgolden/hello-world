"""Causal Set with Volume Law (CSVL).

Sorkin's causal-set quantum gravity program. Spacetime is fundamentally a
locally finite partially ordered set; the metric and continuous spacetime
are coarse-grained statistical features of the element-count density.

================================================================
WHAT IS BORROWED
================================================================
- Causal set discreteness  [Bombelli-Lee-Meyer-Sorkin 1987]
- Volume-law action        [Benincasa-Dowker 2010]
- Stochastic Lambda        [Sorkin 1990 -- predicted Lambda ~ 1/sqrt(N)
                            BEFORE the 1998 supernova observations confirmed
                            its order of magnitude]

================================================================
KNOWN SUCCESS
================================================================
Sorkin's 1990 prediction of Lambda ~ 1/sqrt(N) where N is the spacetime
element count gives Lambda ~ 10^-122 in Planck units, matching observation
to within an order of magnitude. This is one of the only quantum-gravity
predictions to have been confirmed by data after publication.

================================================================
KNOWN FAILURES
================================================================
- No Standard Model embedding: causal sets don't naturally carry gauge
  fields or fermion content. Particle physics is silent.
- No dark matter mechanism (without bolting one on).
- Photon dispersion: Planck-scale linear LIV is generic and is now in
  significant tension with GRB bounds (the n=1 LIV scale must be >> M_P
  to evade bounds, which CSVL does not predict).
"""

from __future__ import annotations

from ..observation import Prediction
from ..theory import Theory


class CausalSetVolumeLaw(Theory):
    name = "Causal Set with Volume Law (Sorkin)"
    short_name = "CSVL"
    summary = (
        "Spacetime is a discrete partial order; Lambda = 1/sqrt(N) in "
        "Planck units. Beautiful prediction of the cosmological constant "
        "scale, silent on the Standard Model and dark matter."
    )

    def _build(self) -> None:
        self.predictions = {
            # GR is recovered in the continuum limit -- gravitational tests pass.
            "mercury_perihelion": Prediction(42.98, 0.1),
            "light_deflection_sun": Prediction(1.7512, 0.001),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.2e-21),
            "gps_time_dilation": Prediction(38.6, 0.1),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            "equivalence_principle": Prediction(0.0, 0.0),
            # Generic linear LIV at Planck scale: dv/c at 100 GeV = 100 GeV / M_P
            # = 100e9 eV / 1.22e28 eV = 8.2e-18 -- right at the GRB bound.
            "photon_dispersion_LIV": Prediction(8.2e-18, 1e-18),
            "gw_dispersion": Prediction(0.0, 1e-18),
            # Cosmology
            "hubble_cmb": Prediction(67.36, 1.0),
            "hubble_local": Prediction(67.36, 1.0),         # single-H0 -> tension
            "sigma_8_lensing": Prediction(0.83, 0.02),
            "lithium_7_primordial": Prediction(-9.45, 0.05),
            "cmb_temperature": Prediction(2.7255, 0.01),
            "cmb_blackbody_shape": Prediction("blackbody"),
            "cmb_first_acoustic_peak": Prediction(220.0, 5.0),
            "bbn_helium_fraction": Prediction(0.247, 0.003),
            "bao_scale": Prediction(147.0, 3.0),
            "supernova_time_dilation": Prediction(1.0, 0.02),
            "tolman_surface_brightness": Prediction(4.0, 0.1),
            # CSVL's signature win: Lambda ~ 1/sqrt(N) gives right order.
            # Omega_Lambda is sensitive to the specific volume-law coefficient
            # but stochastic, so its central value is roughly correct.
            "dark_energy_density": Prediction(0.7, 0.1),
            "matter_density": Prediction(0.3, 0.1),
            "tensor_to_scalar_ratio": Prediction(0.001, 0.005),
            # Galactic: no DM -> rotation curves fail
            "galaxy_rotation_flatness": Prediction(0.4, 0.1),
            "bullet_cluster_offset": Prediction(0.0, 0.1),
            "cluster_lensing_strength": Prediction(0.2, 0.1),
            "tully_fisher_slope": Prediction(None),
            # Particle: silent
            "higgs_mass": Prediction(None),
            "electron_mass": Prediction(None),
            "proton_electron_mass_ratio": Prediction(None),
            "muon_g2_anomaly": Prediction(None),
            "fine_structure_constant": Prediction(None),
            "proton_decay_lifetime": Prediction(None),
            "neutrino_mass_squared_diff": Prediction(None),
            # Foundational
            "qm_gr_unification": Prediction(True),
            "dark_matter_provided": Prediction(False),
            "dark_energy_provided": Prediction(True),       # Sorkin's win
            "hierarchy_problem_addressed": Prediction(False),
            "cosmological_constant_natural": Prediction(True),  # 1/sqrt(N) is natural
            "matter_antimatter_asymmetry": Prediction(False),
        }
        self.expected_outcomes = {
            "mercury_perihelion": "PASS",
            "light_deflection_sun": "PASS",
            "shapiro_delay": "PASS",
            "gravitational_wave_strain": "PASS",
            "gps_time_dilation": "PASS",
            "michelson_morley": "PASS",
            "ives_stilwell": "PASS",
            "hafele_keating": "PASS",
            "equivalence_principle": "PASS",
            "photon_dispersion_LIV": "PASS",   # marginal -- at the bound
            "gw_dispersion": "PASS",
            "hubble_cmb": "PASS",
            "hubble_local": "FAIL",
            "sigma_8_lensing": "FAIL",
            "lithium_7_primordial": "FAIL",
            "cmb_temperature": "PASS",
            "cmb_blackbody_shape": "PASS",
            "cmb_first_acoustic_peak": "PASS",
            "bbn_helium_fraction": "PASS",
            "bao_scale": "PASS",
            "supernova_time_dilation": "PASS",
            "tolman_surface_brightness": "PASS",
            "dark_energy_density": "PASS",
            "matter_density": "PASS",
            "tensor_to_scalar_ratio": "PASS",
            "cmb_lensing_amplitude": "FAIL",
            "fsigma8_z057": "FAIL",
            "neff_relativistic_species": "FAIL",
            "galaxy_rotation_flatness": "FAIL",
            "bullet_cluster_offset": "FAIL",
            "cluster_lensing_strength": "FAIL",
            "tully_fisher_slope": "FAIL",
            "higgs_mass": "FAIL",
            "electron_mass": "FAIL",
            "proton_electron_mass_ratio": "FAIL",
            "muon_g2_anomaly": "FAIL",
            "proton_decay_lifetime": "FAIL",
            "neutrino_mass_squared_diff": "FAIL",
            "fine_structure_constant": "FAIL",
            "qm_gr_unification": "PASS",
            "dark_matter_provided": "FAIL",
            "dark_energy_provided": "PASS",
            "hierarchy_problem_addressed": "FAIL",
            "cosmological_constant_natural": "PASS",
            "matter_antimatter_asymmetry": "FAIL",
        }
