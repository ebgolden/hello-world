"""Cosmological observations."""

from ..observation import Observation


COSMOLOGY_OBSERVATIONS = [
    Observation(
        key="hubble_constant",
        name="Hubble constant H0",
        domain="cosmology",
        measured_value=70.0,        # km/s/Mpc, broad consensus value
        uncertainty=3.0,            # widened to accommodate Planck vs SH0ES tension
        description=(
            "Present-day Hubble parameter. Planck CMB gives ~67.4, SH0ES "
            "Cepheid-SN gives ~73.0; consensus band 70 +/- 3."
        ),
    ),
    Observation(
        key="cmb_temperature",
        name="CMB blackbody temperature",
        domain="cosmology",
        measured_value=2.7255,      # Kelvin (FIRAS)
        uncertainty=0.0006,
        description=(
            "Temperature of the cosmic microwave background measured by FIRAS. "
            "LCDM predicts ~2.7 K from relic photon thermodynamics."
        ),
    ),
    Observation(
        key="cmb_blackbody_shape",
        name="CMB spectrum is blackbody",
        domain="cosmology",
        measured_value="blackbody",
        description=(
            "FIRAS confirmed the CMB is a pure blackbody to one part in 1e4. "
            "Tired-light models predict spectral distortion."
        ),
    ),
    Observation(
        key="cmb_first_acoustic_peak",
        name="CMB first acoustic peak multipole",
        domain="cosmology",
        measured_value=220.0,
        uncertainty=1.0,
        description=(
            "Angular position l ~ 220 of the first acoustic peak in the CMB "
            "TT power spectrum. LCDM with flat geometry predicts this."
        ),
    ),
    Observation(
        key="bbn_helium_fraction",
        name="Primordial helium-4 mass fraction Yp",
        domain="cosmology",
        measured_value=0.2453,
        uncertainty=0.0034,
        description=(
            "Big-Bang-Nucleosynthesis helium-4 mass fraction. Standard BBN with "
            "the LCDM baryon density predicts Yp ~ 0.247."
        ),
    ),
    Observation(
        key="bao_scale",
        name="Baryon acoustic oscillation scale (comoving)",
        domain="cosmology",
        measured_value=147.0,       # Mpc (sound horizon at drag epoch)
        uncertainty=2.0,
        description=(
            "Sound horizon at the baryon drag epoch, ~147 Mpc, imprinted as a "
            "preferred clustering scale in galaxy surveys."
        ),
    ),
    Observation(
        key="supernova_time_dilation",
        name="Type Ia supernova time dilation",
        domain="cosmology",
        # Light-curve width scales as (1+z); we test the proportionality slope.
        measured_value=1.0,
        uncertainty=0.05,
        description=(
            "Observed (1+z) stretching of Type Ia supernova light curves. "
            "Expanding cosmologies predict slope = 1; static cosmologies "
            "(tired light) predict slope = 0."
        ),
    ),
    Observation(
        key="tolman_surface_brightness",
        name="Tolman surface-brightness dimming exponent",
        domain="cosmology",
        # Surface brightness ~ (1+z)^-n; expanding cosmo predicts n=4, static n=1.
        measured_value=4.0,
        uncertainty=0.3,
        description=(
            "Exponent n in the surface-brightness ~ (1+z)^-n relation. "
            "Expanding cosmology predicts n = 4; tired light predicts n = 1."
        ),
    ),
    Observation(
        key="dark_energy_density",
        name="Dark energy density fraction Omega_Lambda",
        domain="cosmology",
        measured_value=0.685,
        uncertainty=0.013,
        description=(
            "Fractional energy density of dark energy today. Required by SN Ia, "
            "BAO, and CMB jointly."
        ),
    ),
    Observation(
        key="matter_density",
        name="Total matter density fraction Omega_m",
        domain="cosmology",
        measured_value=0.315,
        uncertainty=0.013,
        description=(
            "Fractional energy density in matter (baryons + dark matter)."
        ),
    ),
]
