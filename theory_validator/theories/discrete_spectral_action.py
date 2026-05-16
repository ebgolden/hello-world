"""Discrete Spectral Action (DSA).

Connes-Chamseddine-Marcolli noncommutative geometry program. Reality is
described by a spectral triple (A, H, D) where A is a noncommutative
algebra of functions on a product space M x F. M is the Riemannian
spacetime; F is a finite, discrete noncommutative space encoding the
internal SM degrees of freedom. The single action is the spectral action

    S = Tr f(D / Lambda)

with f a smooth cutoff function and Lambda the unification scale.

================================================================
WHAT IS BORROWED
================================================================
- Spectral triple formalism      [Connes 1996]
- Bosonic spectral action        [Chamseddine-Connes 1997]
- SM coupling unification        [Chamseddine-Connes-Marcolli 2007]
- Right-handed neutrino + seesaw [Chamseddine-Connes 2008]

================================================================
WHAT IS NOVEL HERE
================================================================
Nothing structurally. This file implements DSA's documented predictions as
a calibration: a real, published unification framework subjected to the
validator. Its successes and failures are both well-known in the literature.

================================================================
WHAT DSA PREDICTS (well-documented)
================================================================
- Higgs mass: 125 +/- 4 GeV (after 2012 revisions; earlier predictions of
  170 GeV were falsified by ATLAS+CMS)
- Specific gauge coupling unification at Lambda ~ 10^17 GeV
- Standard cosmology (inherits GR + LCDM at low energies)
- No specific Hubble-tension resolution
- No S8 / Li-7 fix
- Photon dispersion: zero (Lorentz invariance preserved)
- GW dispersion: zero (geometric gravity)
- Tensor-to-scalar r: small but not pinned
"""

from __future__ import annotations

from ..observation import Prediction
from ..theory import Theory


class DiscreteSpectralAction(Theory):
    name = "Discrete Spectral Action (Connes)"
    short_name = "DSA"
    summary = (
        "Spectral triple (A, H, D) over M x F with spectral action "
        "Tr f(D/Lambda). SM gauge group + Higgs sector emerge from F's "
        "noncommutative geometry. Inherits GR + LCDM at low energies."
    )

    def _build(self) -> None:
        # Inherits GR -- all gravity-only tests pass.
        # Inherits SM -- all particle tests pass except those (g-2) the SM fails.
        # Standard cosmology with single H0 -> fails the Hubble tension.
        self.predictions = {
            # Relativity (full GR)
            "mercury_perihelion": Prediction(42.98, 0.05),
            "light_deflection_sun": Prediction(1.7512, 0.001),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.1e-21),
            "gps_time_dilation": Prediction(38.6, 0.1),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            "equivalence_principle": Prediction(0.0, 0.0),
            "photon_dispersion_LIV": Prediction(0.0, 0.0),
            "gw_dispersion": Prediction(0.0, 0.0),
            # Cosmology: standard single-H0 LCDM
            "hubble_cmb": Prediction(67.36, 0.5),
            "hubble_local": Prediction(67.36, 0.5),
            "sigma_8_lensing": Prediction(0.83, 0.02),
            "lithium_7_primordial": Prediction(-9.45, 0.05),
            "cmb_temperature": Prediction(2.7255, 0.001),
            "cmb_blackbody_shape": Prediction("blackbody"),
            "cmb_first_acoustic_peak": Prediction(220.0, 1.0),
            "bbn_helium_fraction": Prediction(0.247, 0.001),
            "bao_scale": Prediction(147.0, 0.3),
            "supernova_time_dilation": Prediction(1.0, 0.02),
            "tolman_surface_brightness": Prediction(4.0, 0.05),
            "dark_energy_density": Prediction(0.685, 0.013),
            "matter_density": Prediction(0.315, 0.013),
            "tensor_to_scalar_ratio": Prediction(0.005, 0.005),
            "cmb_lensing_amplitude": Prediction(1.0, 0.02),  # standard LCDM -> FAIL vs A_L=1.18
            "fsigma8_z057": Prediction(0.48, 0.02),
            "neff_relativistic_species": Prediction(3.044, 0.02),
            # Galactic (inherits LCDM dark matter halos via right-handed neutrino)
            "galaxy_rotation_flatness": Prediction(1.0, 0.1),
            "bullet_cluster_offset": Prediction(1.0, 0.1),
            "cluster_lensing_strength": Prediction(1.0, 0.1),
            "tully_fisher_slope": Prediction(3.5, 0.3),
            # DSA's DM via right-handed Majorana neutrino: keV-GeV scale.
            "fuzzy_dm_mass_bound": Prediction(4.0, 1.0),
            # Particle (post-revision values)
            "higgs_mass": Prediction(125.25, 4.0),     # Connes 2012 revision
            "electron_mass": Prediction(0.51099895, 1e-8),
            "proton_electron_mass_ratio": Prediction(1836.15267, 2e-4),
            "muon_g2_anomaly": Prediction(116591810e-11, 43e-11),
            "fine_structure_constant": Prediction(137.035999084, 2.1e-8),
            "proton_decay_lifetime": Prediction(1.0e36, 1.0e36),
            # Right-handed Majorana neutrino via spectral triple seesaw
            "neutrino_mass_squared_diff": Prediction(2.45e-3, 0.1e-3),
            # Foundational
            "qm_gr_unification": Prediction(True),
            "dark_matter_provided": Prediction(True),     # right-handed nu
            "dark_energy_provided": Prediction(True),     # cosmological term
            "hierarchy_problem_addressed": Prediction(False),
            "cosmological_constant_natural": Prediction(False),
            "matter_antimatter_asymmetry": Prediction(True),  # via leptogenesis
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
            "photon_dispersion_LIV": "PASS",
            "gw_dispersion": "PASS",
            "hubble_cmb": "PASS",
            "hubble_local": "FAIL",         # single-H0 -> tension
            "sigma_8_lensing": "FAIL",      # LCDM-from-CMB S8
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
            "cmb_lensing_amplitude": "FAIL",   # the A_L Planck anomaly
            "fsigma8_z057": "PASS",
            "neff_relativistic_species": "PASS",
            "galaxy_rotation_flatness": "PASS",
            "bullet_cluster_offset": "PASS",
            "cluster_lensing_strength": "PASS",
            "tully_fisher_slope": "PASS",
            "higgs_mass": "PASS",
            "electron_mass": "PASS",
            "proton_electron_mass_ratio": "PASS",
            "muon_g2_anomaly": "FAIL",      # SM tension persists
            "proton_decay_lifetime": "PASS",
            "neutrino_mass_squared_diff": "PASS",
            "fine_structure_constant": "PASS",
            "qm_gr_unification": "PASS",
            "dark_matter_provided": "PASS",
            "dark_energy_provided": "PASS",
            "hierarchy_problem_addressed": "FAIL",
            "cosmological_constant_natural": "FAIL",
            "matter_antimatter_asymmetry": "PASS",
        }
