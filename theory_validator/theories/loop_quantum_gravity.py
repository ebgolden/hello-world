"""Loop quantum gravity: background-independent quantization of GR."""

from ..observation import Prediction
from ..theory import Theory


class LoopQuantumGravity(Theory):
    name = "Loop Quantum Gravity"
    short_name = "LQG"
    summary = (
        "Canonical, background-independent quantization of GR. Recovers GR "
        "in the classical limit but does not contain the Standard Model and "
        "does not predict dark sector content."
    )

    def _build(self) -> None:
        self.predictions = {
            "mercury_perihelion": Prediction(42.98, 0.1),
            "light_deflection_sun": Prediction(1.7512, 0.001),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.2e-21),
            "gps_time_dilation": Prediction(38.6, 0.1),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            # Cosmology: LQC gives a bounce; cosmological observables match LCDM at low energies.
            "hubble_constant": Prediction(70.0, 5.0),
            "cmb_temperature": Prediction(2.7255, 0.01),
            "cmb_blackbody_shape": Prediction("blackbody"),
            "cmb_first_acoustic_peak": Prediction(220.0, 5.0),
            "bbn_helium_fraction": Prediction(0.247, 0.003),
            "bao_scale": Prediction(147.0, 3.0),
            "supernova_time_dilation": Prediction(1.0, 0.02),
            "tolman_surface_brightness": Prediction(4.0, 0.1),
            "dark_energy_density": Prediction(None),
            "matter_density": Prediction(None),
            # Galactic
            "galaxy_rotation_flatness": Prediction(0.4, 0.1),  # no DM, no MOND, fails
            "bullet_cluster_offset": Prediction(0.0, 0.1),
            "cluster_lensing_strength": Prediction(0.2, 0.05),
            # LQG does not include a matter sector that predicts the slope.
            "tully_fisher_slope": Prediction(None),
            # Particle: LQG does not contain SM matter content.
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
            "cmb_temperature": "PASS",
            "cmb_blackbody_shape": "PASS",
            "cmb_first_acoustic_peak": "PASS",
            "bbn_helium_fraction": "PASS",
            "bao_scale": "PASS",
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
            "qm_gr_unification": "PASS",
            "dark_matter_provided": "FAIL",
            "dark_energy_provided": "FAIL",
            "hierarchy_problem_addressed": "FAIL",
            "cosmological_constant_natural": "FAIL",
            "matter_antimatter_asymmetry": "FAIL",
        }
