"""Zwicky-style tired light: redshift from photon energy loss in a static cosmos."""

from ..observation import Prediction
from ..theory import Theory


class TiredLight(Theory):
    name = "Tired Light (static cosmos)"
    short_name = "tired-light"
    summary = "Cosmic redshift from photon energy loss in transit; no expansion."

    def _build(self) -> None:
        self.predictions = {
            # SR/GR tests at solar-system scale are not what tired-light disputes;
            # adherents typically accept SR/GR locally.
            "mercury_perihelion": Prediction(42.98, 0.1),
            "light_deflection_sun": Prediction(1.7512, 0.001),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.5e-21),
            "gps_time_dilation": Prediction(38.6, 0.1),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            # Cosmology: this is where tired-light fails hard.
            "hubble_local": Prediction(None),
            "hubble_cmb": Prediction(None),
            "sigma_8_lensing": Prediction(None),
            "lithium_7_primordial": Prediction(None),
            "cmb_temperature": Prediction(None),  # has to invoke ad-hoc thermalization
            "cmb_blackbody_shape": Prediction("distorted"),  # generic prediction
            "cmb_first_acoustic_peak": Prediction(None),
            "bbn_helium_fraction": Prediction(None),
            "bao_scale": Prediction(None),
            # Static cosmos: light-curve widths do NOT stretch with redshift.
            "supernova_time_dilation": Prediction(0.0, 0.02),
            # Static cosmos: surface brightness dims as (1+z)^-1, not -4.
            "tolman_surface_brightness": Prediction(1.0, 0.1),
            "dark_energy_density": Prediction(0.0, 0.0),  # nothing accelerating
            "matter_density": Prediction(None),
            # Galactic / particle / foundational: tired-light is silent.
            "galaxy_rotation_flatness": Prediction(None),
            "bullet_cluster_offset": Prediction(None),
            "cluster_lensing_strength": Prediction(None),
            "tully_fisher_slope": Prediction(None),
            "higgs_mass": Prediction(None),
            "electron_mass": Prediction(None),
            "proton_electron_mass_ratio": Prediction(None),
            "muon_g2_anomaly": Prediction(None),
            "fine_structure_constant": Prediction(None),
            "proton_decay_lifetime": Prediction(None),
            "neutrino_mass_squared_diff": Prediction(None),
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
            "hubble_local": "FAIL",
            "hubble_cmb": "FAIL",
            "sigma_8_lensing": "FAIL",
            "lithium_7_primordial": "FAIL",
            "cmb_temperature": "FAIL",
            "cmb_blackbody_shape": "FAIL",   # observed blackbody, predicted distorted
            "cmb_first_acoustic_peak": "FAIL",
            "bbn_helium_fraction": "FAIL",
            "bao_scale": "FAIL",
            "supernova_time_dilation": "FAIL",
            "tolman_surface_brightness": "FAIL",
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
