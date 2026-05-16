"""Standard Model of particle physics (no gravity, no dark sector)."""

from ..observation import Prediction
from ..theory import Theory


class StandardModel(Theory):
    name = "Standard Model"
    short_name = "SM"
    summary = "QFT of quarks, leptons, gauge bosons, Higgs. No gravity, no dark sector."

    def _build(self) -> None:
        self.predictions = {
            # --- Particle wins ---
            "higgs_mass": Prediction(125.25, 0.17),
            "electron_mass": Prediction(0.51099895, 1e-8),
            "proton_electron_mass_ratio": Prediction(1836.15267, 2e-4),
            # SM theory R-ratio prediction sits ~ 4 sigma below the measurement.
            "muon_g2_anomaly": Prediction(116591810e-11, 43e-11),
            "fine_structure_constant": Prediction(137.035999084, 2.1e-8),
            # Proton decay: SM has B-L conservation, so tau_p effectively infinite.
            "proton_decay_lifetime": Prediction(1.0e40, 1.0e40),
            # SM with massless neutrinos predicts zero - fails the observation.
            "neutrino_mass_squared_diff": Prediction(0.0, 0.0),
            # --- Gravity / cosmology: SM is silent ---
            "qm_gr_unification": Prediction(False),
            "dark_matter_provided": Prediction(False),
            "dark_energy_provided": Prediction(False),
            "hierarchy_problem_addressed": Prediction(False),
            "cosmological_constant_natural": Prediction(False),
            "matter_antimatter_asymmetry": Prediction(False),  # CP violation too small
            # SM ignores special/general relativity tests at this level
            # (the gauge sector is built on SR but doesn't predict orbital effects).
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            # SM has no cosmology -- explicit None for the new tests.
            "hubble_local": Prediction(None),
            "hubble_cmb": Prediction(None),
            "sigma_8_lensing": Prediction(None),
            "lithium_7_primordial": Prediction(None),
        }
        self.expected_outcomes = {
            "mercury_perihelion": "FAIL",
            "light_deflection_sun": "FAIL",
            "shapiro_delay": "FAIL",
            "gravitational_wave_strain": "FAIL",
            "gps_time_dilation": "FAIL",
            "michelson_morley": "PASS",
            "ives_stilwell": "PASS",
            "hafele_keating": "FAIL",
            "hubble_local": "FAIL",
            "hubble_cmb": "FAIL",
            "sigma_8_lensing": "FAIL",
            "lithium_7_primordial": "FAIL",
            "cmb_temperature": "FAIL",
            "cmb_blackbody_shape": "FAIL",
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
            "higgs_mass": "PASS",
            "electron_mass": "PASS",
            "proton_electron_mass_ratio": "PASS",
            "muon_g2_anomaly": "FAIL",     # documented ~ 4 sigma tension
            "proton_decay_lifetime": "PASS",
            "neutrino_mass_squared_diff": "FAIL",
            "fine_structure_constant": "PASS",
            "qm_gr_unification": "FAIL",
            "dark_matter_provided": "FAIL",
            "dark_energy_provided": "FAIL",
            "hierarchy_problem_addressed": "FAIL",
            "cosmological_constant_natural": "FAIL",
            "matter_antimatter_asymmetry": "FAIL",
        }
