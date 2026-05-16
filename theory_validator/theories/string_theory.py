"""String theory / M-theory (no unique vacuum, but address several conceptual problems)."""

from ..observation import Prediction
from ..theory import Theory


class StringTheory(Theory):
    name = "String / M-theory"
    short_name = "string"
    summary = (
        "Quantizes gravity perturbatively, contains GR + gauge sectors in the "
        "low-energy limit, but with a vast landscape it does not uniquely "
        "predict particle masses, dark matter, or the cosmological constant."
    )

    def _build(self) -> None:
        self.predictions = {
            # Low-energy limit gives GR -- relativity tests inherited.
            "mercury_perihelion": Prediction(42.98, 0.05),
            "light_deflection_sun": Prediction(1.7512, 0.0005),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.1e-21),
            "gps_time_dilation": Prediction(38.6, 0.05),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            # Cosmology: low-energy GR + matter content; broadly LCDM-compatible
            # but doesn't pick out specific values.
            "hubble_constant": Prediction(70.0, 5.0),
            "cmb_temperature": Prediction(2.7255, 0.005),
            "cmb_blackbody_shape": Prediction("blackbody"),
            "cmb_first_acoustic_peak": Prediction(220.0, 5.0),
            "bbn_helium_fraction": Prediction(0.247, 0.003),
            "bao_scale": Prediction(147.0, 3.0),
            "supernova_time_dilation": Prediction(1.0, 0.02),
            "tolman_surface_brightness": Prediction(4.0, 0.1),
            "dark_energy_density": Prediction(None),    # landscape, no unique value
            "matter_density": Prediction(None),
            # Galactic
            "galaxy_rotation_flatness": Prediction(1.0, 0.2),  # via WIMP/axion candidates
            "bullet_cluster_offset": Prediction(1.0, 0.2),
            "cluster_lensing_strength": Prediction(1.0, 0.2),
            "tully_fisher_slope": Prediction(3.5, 0.4),
            # Particle: doesn't uniquely predict SM parameters.
            "higgs_mass": Prediction(None),
            "electron_mass": Prediction(None),
            "proton_electron_mass_ratio": Prediction(None),
            "muon_g2_anomaly": Prediction(None),
            "fine_structure_constant": Prediction(None),
            # GUT-like proton decay channels are generically expected.
            # Heterotic string models often predict tau_p ~ 1e33-1e35 yr.
            "proton_decay_lifetime": Prediction(1.0e34, 5.0e34),
            "neutrino_mass_squared_diff": Prediction(2.5e-3, 1.5e-3),
            # Foundational
            "qm_gr_unification": Prediction(True),  # this is the headline claim
            "dark_matter_provided": Prediction(True),  # axions / sterile neutrinos
            "dark_energy_provided": Prediction(False),  # landscape isn't a prediction
            "hierarchy_problem_addressed": Prediction(True),  # via SUSY
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
            "galaxy_rotation_flatness": "PASS",
            "bullet_cluster_offset": "PASS",
            "cluster_lensing_strength": "PASS",
            "tully_fisher_slope": "PASS",
            "higgs_mass": "FAIL",
            "electron_mass": "FAIL",
            "proton_electron_mass_ratio": "FAIL",
            "muon_g2_anomaly": "FAIL",
            "proton_decay_lifetime": "PASS",
            "neutrino_mass_squared_diff": "PASS",
            "fine_structure_constant": "FAIL",
            "qm_gr_unification": "PASS",
            "dark_matter_provided": "PASS",
            "dark_energy_provided": "FAIL",
            "hierarchy_problem_addressed": "PASS",
            "cosmological_constant_natural": "FAIL",
            "matter_antimatter_asymmetry": "FAIL",
        }
