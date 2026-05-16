"""General relativity (alone). Excellent for gravity, silent on quanta."""

from ..observation import Prediction
from ..theory import Theory


class GeneralRelativity(Theory):
    name = "General Relativity"
    short_name = "GR"
    summary = "Classical curved-spacetime gravity. Silent on quantum matter and dark sector microphysics."

    def _build(self) -> None:
        self.predictions = {
            # --- Relativity wins ---
            "mercury_perihelion": Prediction(42.98, 0.05),
            "light_deflection_sun": Prediction(1.7512, 0.0005),
            "shapiro_delay": Prediction(1.0, 0.0),  # PPN gamma = 1 exactly
            "gravitational_wave_strain": Prediction(1.0e-21, 0.1e-21),
            "gps_time_dilation": Prediction(38.6, 0.05),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            # --- Cosmology: GR alone does not pick out a model ---
            # We give plain FRW + matter-only predictions, which fail.
            "hubble_constant": Prediction(70.0, 5.0),    # consistent with FRW
            "cmb_temperature": Prediction(None),         # GR alone doesn't predict it
            "cmb_blackbody_shape": Prediction(None),
            "cmb_first_acoustic_peak": Prediction(None),
            "bbn_helium_fraction": Prediction(None),
            "bao_scale": Prediction(None),
            "supernova_time_dilation": Prediction(1.0, 0.05),  # expansion gives this
            "tolman_surface_brightness": Prediction(4.0, 0.1),
            "dark_energy_density": Prediction(None),
            "matter_density": Prediction(None),
            # --- Galactic: pure GR without DM fails rotation curves ---
            "galaxy_rotation_flatness": Prediction(0.4, 0.1),  # too low
            "bullet_cluster_offset": Prediction(0.0, 0.05),    # no DM in plain GR
            "cluster_lensing_strength": Prediction(0.2, 0.05),
            # Pure GR (no dark matter) makes no prediction for the slope of
            # the empirical Tully-Fisher relation.
            "tully_fisher_slope": Prediction(None),
            # --- Particle: GR is silent ---
            # leave unset -> None -> fail
            # --- Foundational ---
            "qm_gr_unification": Prediction(False),
            "dark_matter_provided": Prediction(False),
            "dark_energy_provided": Prediction(False),
            "hierarchy_problem_addressed": Prediction(False),
            "cosmological_constant_natural": Prediction(False),
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
            "hubble_constant": "PASS",
            "cmb_temperature": "FAIL",
            "cmb_blackbody_shape": "FAIL",
            "cmb_first_acoustic_peak": "FAIL",
            "bbn_helium_fraction": "FAIL",
            "bao_scale": "FAIL",
            "supernova_time_dilation": "PASS",
            "tolman_surface_brightness": "PASS",
            "dark_energy_density": "FAIL",
            "matter_density": "FAIL",
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
            "qm_gr_unification": "FAIL",
            "dark_matter_provided": "FAIL",
            "dark_energy_provided": "FAIL",
            "hierarchy_problem_addressed": "FAIL",
            "cosmological_constant_natural": "FAIL",
            "matter_antimatter_asymmetry": "FAIL",
        }
        # Proton decay: GR makes no prediction; treat as FAIL.
        self.predictions.setdefault("proton_decay_lifetime", Prediction(None))
