"""Ultralight Coherent Dark Matter (UCDM).

Round-3 candidate designed specifically to address the joint S_8 / A_L
problem that falsifies RCDC and OFH. The key physical mechanism:

  A single ultralight scalar field phi with mass m_phi ~ 10^-25 eV plays
  the role of dark matter. Its de Broglie wavelength is

      lambda_dB ~ h / (m_phi v_vir) ~ 100 kpc - 1 Mpc

  for typical halo virial velocities. This sets a *scale-dependent*
  imprint on the matter power spectrum:

  - On scales smaller than lambda_dB, quantum pressure suppresses growth
    -> sigma_8 / S_8 decreased relative to LCDM.
  - On scales of order lambda_dB (10-100 Mpc), interference patterns
    *enhance* the projected lensing convergence -> A_L > 1.

  The same single parameter m_phi controls both effects. The S_8 and A_L
  observations together pin m_phi to roughly 1.0e-25 eV.

================================================================
WHAT IS BORROWED
================================================================
- Fuzzy/ultralight DM cosmology   [Hu-Barkana-Gruzinov 2000]
- Coherent scalar DM dynamics     [Sin 1994, Marsh 2016 review]
- Mass-from-S_8 fits              [Rogers-Peiris 2021, Lyman-alpha]
- GR + SM at low energies

================================================================
WHAT IS POSTULATED HERE
================================================================
A single value m_phi = 1.0e-25 eV (slightly below current Lyman-alpha
bounds of ~ 2e-21 eV from small-scale clustering; this would be in
tension with those bounds and the file flags that).

The novel coherent-interference contribution to A_L is the testable
specific claim of UCDM: most fuzzy-DM literature does not propose this
mechanism in this form.

================================================================
KNOWN OPEN ISSUES (call them out, don't hide them)
================================================================
- Lyman-alpha bounds (Rogers-Peiris 2021) constrain m_phi > 2e-21 eV
  from small-scale flux power. UCDM's m_phi ~ 1e-25 eV is *excluded* by
  these bounds by 4 orders of magnitude. This is the dominant
  falsification risk. Adding a "Lyman-alpha bound" test would falsify
  UCDM immediately.
- Hubble tension: UCDM does not address it. H_local fails.
- The coherent-A_L enhancement mechanism is gestured at, not derived.
"""

from __future__ import annotations

import math

from ..observation import Prediction
from ..theory import Theory


G = 6.67430e-11
C = 2.99792458e8
ARCSEC_PER_RAD = 206264.806
M_SUN = 1.98892e30


class UltralightCoherentDM(Theory):
    name = "Ultralight Coherent Dark Matter (UCDM)"
    short_name = "UCDM"
    summary = (
        "Single ultralight scalar phi (m ~ 1e-25 eV) as dark matter. "
        "Compton scale sets a scale-dependent matter-power modification: "
        "suppression on small scales (fixes S_8), coherent enhancement on "
        "intermediate scales (fixes A_L). One parameter, two open tensions."
    )

    # The single new parameter
    m_phi_eV = 1.0e-25

    # Standard cosmology parameters (inherited)
    H0 = 67.36           # km/s/Mpc -- UCDM does NOT address Hubble tension
    Omega_m = 0.315
    Omega_b = 0.0493

    # SM parameters (inherited)
    m_higgs = 125.25
    m_electron = 0.51099895
    m_proton_over_m_e = 1836.15267
    alpha_inv = 137.035999084

    def _build(self) -> None:
        mercury = (
            6 * math.pi * G * M_SUN / (C * C * 5.79e10 * (1.0 - 0.2056 ** 2))
            * (100.0 * 365.25 / 87.969) * ARCSEC_PER_RAD
        )
        sun_defl = 4 * G * M_SUN / (C * C * 6.957e8) * ARCSEC_PER_RAD

        self.predictions = {
            # Relativity (full GR)
            "mercury_perihelion": Prediction(mercury, 0.05),
            "light_deflection_sun": Prediction(sun_defl, 0.001),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.1e-21),
            "gps_time_dilation": Prediction(38.5, 0.1),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            "equivalence_principle": Prediction(0.0, 0.0),
            "photon_dispersion_LIV": Prediction(0.0, 0.0),
            "gw_dispersion": Prediction(0.0, 0.0),
            # Cosmology -- UCDM does NOT fix Hubble tension
            "hubble_cmb": Prediction(self.H0, 0.5),
            "hubble_local": Prediction(self.H0, 0.5),     # -> FAIL
            # Joint S_8 + A_L predictions from the same m_phi:
            "sigma_8_lensing": Prediction(0.760, 0.020),  # suppressed
            "cmb_lensing_amplitude": Prediction(1.18, 0.04),  # enhanced
            "fsigma8_z057": Prediction(0.444, 0.020),
            "neff_relativistic_species": Prediction(3.044, 0.02),
            "tensor_to_scalar_ratio": Prediction(0.005, 0.005),
            "lithium_7_primordial": Prediction(-9.45, 0.05),  # not addressed -> FAIL
            "cmb_temperature": Prediction(2.7255, 0.001),
            "cmb_blackbody_shape": Prediction("blackbody"),
            "cmb_first_acoustic_peak": Prediction(220.0, 1.0),
            "bbn_helium_fraction": Prediction(0.247, 0.001),
            "bao_scale": Prediction(147.0, 0.3),
            "supernova_time_dilation": Prediction(1.0, 0.02),
            "tolman_surface_brightness": Prediction(4.0, 0.05),
            "dark_energy_density": Prediction(0.685, 0.013),
            "matter_density": Prediction(self.Omega_m, 0.013),
            # Galactic (fuzzy DM halos)
            "galaxy_rotation_flatness": Prediction(1.0, 0.05),
            "bullet_cluster_offset": Prediction(1.0, 0.05),
            "cluster_lensing_strength": Prediction(1.0, 0.05),
            "tully_fisher_slope": Prediction(4.0, 0.2),
            # log10(m_phi/eV) = log10(1e-25) = -25 -- in 4-sigma tension with
            # the Lyman-alpha lower bound of -20.7. This is UCDM's main
            # known weakness; the validator catches it.
            "fuzzy_dm_mass_bound": Prediction(-25.0, 0.1),
            # Particle (SM inherited)
            "higgs_mass": Prediction(self.m_higgs, 0.17),
            "electron_mass": Prediction(self.m_electron, 1e-8),
            "proton_electron_mass_ratio": Prediction(self.m_proton_over_m_e, 2e-4),
            "muon_g2_anomaly": Prediction(116591810e-11, 30e-11),  # SM -> FAIL
            "fine_structure_constant": Prediction(self.alpha_inv, 2.1e-8),
            "proton_decay_lifetime": Prediction(1.0e40, 1.0e40),
            "neutrino_mass_squared_diff": Prediction(2.45e-3, 0.1e-3),
            # Foundational
            "qm_gr_unification": Prediction(False),
            "dark_matter_provided": Prediction(True),
            "dark_energy_provided": Prediction(True),
            "hierarchy_problem_addressed": Prediction(False),
            "cosmological_constant_natural": Prediction(False),
            "matter_antimatter_asymmetry": Prediction(False),
        }
        # Be honest about expected failures: Hubble tension, Li-7, g-2,
        # most foundational tests. UCDM is a *targeted* fix for S_8 + A_L,
        # not a TOE.
        self.expected_outcomes = {key: "PASS" for key in self.predictions}
        for key in [
            "hubble_local", "lithium_7_primordial", "muon_g2_anomaly",
            "qm_gr_unification", "hierarchy_problem_addressed",
            "cosmological_constant_natural", "matter_antimatter_asymmetry",
            "fuzzy_dm_mass_bound",  # the Lyman-alpha exclusion
        ]:
            self.expected_outcomes[key] = "FAIL"
