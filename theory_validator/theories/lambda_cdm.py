"""Lambda-CDM concordance cosmology (GR + cold dark matter + cosmological constant)."""

from ..observation import Prediction
from ..theory import Theory


class LambdaCDM(Theory):
    name = "Lambda-CDM concordance cosmology"
    short_name = "LCDM"
    summary = (
        "GR + cold dark matter + cosmological constant. Excellent cosmological "
        "fits; inherits Standard-Model particle content."
    )

    def _build(self) -> None:
        self.predictions = {
            # --- Relativity ---
            "mercury_perihelion": Prediction(42.98, 0.05),
            "light_deflection_sun": Prediction(1.7512, 0.0005),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.1e-21),
            "gps_time_dilation": Prediction(38.6, 0.05),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            # --- Cosmology ---
            # Planck H0 is ~67.4 +/- 0.5 -- sits at the low edge of the consensus
            # band; with the broader uncertainty in our observation, it passes.
            "hubble_constant": Prediction(67.4, 0.5),
            "cmb_temperature": Prediction(2.7255, 0.001),
            "cmb_blackbody_shape": Prediction("blackbody"),
            "cmb_first_acoustic_peak": Prediction(220.0, 1.0),
            "bbn_helium_fraction": Prediction(0.247, 0.001),
            "bao_scale": Prediction(147.0, 0.3),
            "supernova_time_dilation": Prediction(1.0, 0.02),
            "tolman_surface_brightness": Prediction(4.0, 0.05),
            "dark_energy_density": Prediction(0.685, 0.013),
            "matter_density": Prediction(0.315, 0.013),
            # --- Galactic (with cold dark matter halos) ---
            "galaxy_rotation_flatness": Prediction(1.0, 0.1),
            "bullet_cluster_offset": Prediction(1.0, 0.1),
            "cluster_lensing_strength": Prediction(1.0, 0.1),
            "tully_fisher_slope": Prediction(3.5, 0.3),  # CDM gets the slope only roughly
            # --- Particle (inherits SM) ---
            "higgs_mass": Prediction(125.25, 0.17),
            "electron_mass": Prediction(0.51099895, 1e-8),
            "proton_electron_mass_ratio": Prediction(1836.15267, 2e-4),
            "muon_g2_anomaly": Prediction(116591810e-11, 43e-11),
            "fine_structure_constant": Prediction(137.035999084, 2.1e-8),
            "proton_decay_lifetime": Prediction(1.0e40, 1.0e40),
            "neutrino_mass_squared_diff": Prediction(0.0, 0.0),
            # --- Foundational ---
            "qm_gr_unification": Prediction(False),
            "dark_matter_provided": Prediction(True),
            "dark_energy_provided": Prediction(True),
            "hierarchy_problem_addressed": Prediction(False),
            # 120 orders of magnitude off if computed from QFT vacuum.
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
            "cmb_temperature": "PASS",
            "cmb_blackbody_shape": "PASS",
            "cmb_first_acoustic_peak": "PASS",
            "bbn_helium_fraction": "PASS",
            "bao_scale": "PASS",
            "supernova_time_dilation": "PASS",
            "tolman_surface_brightness": "PASS",
            "dark_energy_density": "PASS",
            "matter_density": "PASS",
            "galaxy_rotation_flatness": "PASS",
            "bullet_cluster_offset": "PASS",
            "cluster_lensing_strength": "PASS",
            "tully_fisher_slope": "PASS",  # within 1.5 sigma of slope 4
            "higgs_mass": "PASS",
            "electron_mass": "PASS",
            "proton_electron_mass_ratio": "PASS",
            "muon_g2_anomaly": "FAIL",
            "proton_decay_lifetime": "PASS",
            "neutrino_mass_squared_diff": "FAIL",
            "fine_structure_constant": "PASS",
            "qm_gr_unification": "FAIL",
            "dark_matter_provided": "PASS",
            "dark_energy_provided": "PASS",
            "hierarchy_problem_addressed": "FAIL",
            "cosmological_constant_natural": "FAIL",
            "matter_antimatter_asymmetry": "FAIL",
        }
