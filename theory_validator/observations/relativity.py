"""Tests of special and general relativity.

Values cited are well-documented; uncertainties reflect modern measurements."""

from ..observation import Observation


RELATIVITY_OBSERVATIONS = [
    Observation(
        key="mercury_perihelion",
        name="Mercury perihelion advance (anomalous)",
        domain="relativity",
        measured_value=42.98,       # arcsec / century
        uncertainty=0.04,
        description=(
            "Anomalous precession of Mercury's perihelion after Newtonian "
            "contributions are subtracted. Famously matched by GR to 43.0''/century."
        ),
    ),
    Observation(
        key="light_deflection_sun",
        name="Solar light deflection",
        domain="relativity",
        measured_value=1.7512,      # arcsec at the solar limb
        uncertainty=0.0016,
        description=(
            "Deflection of starlight grazing the Sun. VLBI measurements give "
            "1.7512'' ± 0.0016''. Newtonian gravity predicts half this value."
        ),
    ),
    Observation(
        key="shapiro_delay",
        name="Shapiro time delay (Cassini)",
        domain="relativity",
        # Cassini bound on PPN gamma: gamma - 1 = (2.1 +/- 2.3)e-5
        # We test the PPN gamma parameter directly. GR predicts gamma = 1.
        measured_value=1.0,
        uncertainty=2.3e-5,
        description=(
            "PPN parameter gamma inferred from Cassini-era Shapiro delay. "
            "GR predicts gamma = 1 exactly."
        ),
    ),
    Observation(
        key="gravitational_wave_strain",
        name="GW150914 peak strain",
        domain="relativity",
        measured_value=1.0e-21,     # dimensionless strain at peak
        uncertainty=0.2e-21,
        description=(
            "Peak gravitational-wave strain from the GW150914 binary black-hole "
            "merger. GR predicts strain at this order from the inferred masses."
        ),
    ),
    Observation(
        key="gps_time_dilation",
        name="GPS net relativistic clock shift",
        domain="relativity",
        measured_value=38.6,        # microseconds per day, net (gravity - velocity)
        uncertainty=0.2,
        description=(
            "Net relativistic clock drift between GPS satellite and ground "
            "clocks: about +45 us/day gravitational, -7 us/day kinematic."
        ),
    ),
    Observation(
        key="michelson_morley",
        name="Speed of light isotropy",
        domain="relativity",
        # Modern Michelson-Morley bounds the anisotropy delta-c/c at < 1e-17.
        measured_value=0.0,
        uncertainty=1.0e-17,
        description=(
            "Anisotropy of the speed of light. Modern resonator tests bound "
            "|delta c|/c < 1e-17."
        ),
    ),
    Observation(
        key="ives_stilwell",
        name="Transverse Doppler / SR time dilation",
        domain="relativity",
        # Test of (1 - SR_factor) to 1 ppb level in storage-ring experiments.
        measured_value=1.0,
        uncertainty=1.0e-9,
        description=(
            "Ratio of observed transverse Doppler shift to the SR prediction "
            "in stored ion beams. SR predicts exactly 1."
        ),
    ),
    Observation(
        key="hafele_keating",
        name="Atomic-clock circumnavigation",
        domain="relativity",
        measured_value=273.0,       # nanoseconds, eastward, observed
        uncertainty=21.0,
        description=(
            "Hafele-Keating eastward clock drift. Combined kinematic + "
            "gravitational shift predicted by relativity matches within errors."
        ),
    ),
]
