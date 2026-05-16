"""MOND: modified inertia/gravity at low accelerations; nails rotation curves, fails the Bullet Cluster."""

from ..observation import Prediction
from ..theory import Theory


class MOND(Theory):
    name = "Modified Newtonian Dynamics (TeVeS extension)"
    short_name = "MOND"
    summary = (
        "Replaces dark matter with a low-acceleration modification of "
        "gravity. Reproduces galaxy rotation curves and Tully-Fisher "
        "naturally; struggles with clusters and CMB peaks."
    )

    def _build(self) -> None:
        self.predictions = {
            # Relativistic completions (TeVeS) recover GR in solar-system limit.
            "mercury_perihelion": Prediction(42.98, 0.1),
            "light_deflection_sun": Prediction(1.7512, 0.001),
            "shapiro_delay": Prediction(1.0, 0.0),
            "gravitational_wave_strain": Prediction(1.0e-21, 0.3e-21),
            "gps_time_dilation": Prediction(38.6, 0.1),
            "michelson_morley": Prediction(0.0, 0.0),
            "ives_stilwell": Prediction(1.0, 0.0),
            "hafele_keating": Prediction(275.0, 10.0),
            # Cosmology: MOND alone doesn't give the LCDM cosmology cleanly.
            # No clean MOND prediction for the H0 tension.
            "hubble_local": Prediction(None),
            "hubble_cmb": Prediction(None),
            "sigma_8_lensing": Prediction(None),
            "lithium_7_primordial": Prediction(None),
            "cmb_temperature": Prediction(2.7255, 0.01),  # accepts standard thermal history
            "cmb_blackbody_shape": Prediction("blackbody"),
            # First peak: TeVeS struggles to fit the third peak and overall ratios.
            "cmb_first_acoustic_peak": Prediction(220.0, 10.0),  # first peak ~ OK
            "bbn_helium_fraction": Prediction(0.247, 0.005),
            "bao_scale": Prediction(None),  # no clean BAO prediction
            "supernova_time_dilation": Prediction(1.0, 0.05),
            "tolman_surface_brightness": Prediction(4.0, 0.1),
            "dark_energy_density": Prediction(None),
            "matter_density": Prediction(None),
            # Galactic: MOND's home turf.
            "galaxy_rotation_flatness": Prediction(1.0, 0.05),
            # MOND-only predicts coincident lensing and gas peaks.
            "bullet_cluster_offset": Prediction(0.0, 0.1),
            # Cluster lensing: MOND undershoots cluster masses.
            "cluster_lensing_strength": Prediction(0.5, 0.1),
            "tully_fisher_slope": Prediction(4.0, 0.05),  # predicted exactly
            # Particle / foundational: silent.
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
            "cmb_temperature": "PASS",
            "cmb_blackbody_shape": "PASS",
            "cmb_first_acoustic_peak": "PASS",
            "bbn_helium_fraction": "PASS",
            "bao_scale": "FAIL",
            "supernova_time_dilation": "PASS",
            "tolman_surface_brightness": "PASS",
            "dark_energy_density": "FAIL",
            "matter_density": "FAIL",
            "galaxy_rotation_flatness": "PASS",
            "bullet_cluster_offset": "FAIL",       # famously fails this
            "cluster_lensing_strength": "FAIL",
            "tully_fisher_slope": "PASS",
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
