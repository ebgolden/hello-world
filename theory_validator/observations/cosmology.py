"""Cosmological observations."""

from ..observation import Observation


COSMOLOGY_OBSERVATIONS = [
    # Two separate H0 tests at full precision. A single-valued theory of H0
    # cannot satisfy both -- this is the actual Hubble tension.
    Observation(
        key="hubble_local",
        name="Local distance-ladder H0 (SH0ES)",
        domain="cosmology",
        measured_value=73.04,
        uncertainty=1.04,
        tolerance_sigma=2.0,
        description=(
            "SH0ES Cepheid + Type Ia supernova H0 (Riess+ 2022). Local rung."
        ),
    ),
    Observation(
        key="hubble_cmb",
        name="CMB-inferred H0 (Planck 2018)",
        domain="cosmology",
        measured_value=67.36,
        uncertainty=0.54,
        tolerance_sigma=2.0,
        description=(
            "Planck 2018 H0 inferred from the CMB power spectrum assuming "
            "flat LCDM. Sits ~ 5 sigma below the local SH0ES value."
        ),
    ),
    Observation(
        key="sigma_8_lensing",
        name="Late-time S8 from weak lensing",
        domain="cosmology",
        measured_value=0.762,
        uncertainty=0.024,
        tolerance_sigma=2.0,
        description=(
            "KiDS-1000 / DES-Y3 weak-lensing S8 = sigma_8 sqrt(Omega_m/0.3). "
            "Sits below the LCDM-from-CMB prediction (~0.83) at ~ 2-3 sigma."
        ),
    ),
    Observation(
        key="tensor_to_scalar_ratio",
        name="Primordial tensor-to-scalar ratio r",
        domain="cosmology",
        measured_value=0.0,
        uncertainty=0.018,           # BICEP/Keck 2021 2-sigma bound = 0.036
        tolerance_sigma=2.0,
        description=(
            "BICEP/Keck 2021: r < 0.036 (95% CL). Discriminates inflation "
            "models and any theory predicting a specific tensor amplitude."
        ),
    ),
    Observation(
        key="cmb_lensing_amplitude",
        name="CMB lensing amplitude A_L (Planck)",
        domain="cosmology",
        measured_value=1.180,
        uncertainty=0.065,
        tolerance_sigma=2.0,
        description=(
            "Phenomenological CMB lensing amplitude. Planck 2018 finds "
            "A_L = 1.180 +/- 0.065 from the TTTEEE spectrum, where LCDM "
            "predicts exactly 1.0. A ~ 2.8-sigma anomaly."
        ),
    ),
    Observation(
        key="fsigma8_z057",
        name="Linear growth rate f*sigma_8 at z=0.57",
        domain="cosmology",
        measured_value=0.444,
        uncertainty=0.038,
        tolerance_sigma=2.0,
        description=(
            "BOSS DR12 redshift-space distortion measurement at z=0.57. "
            "Planck-LCDM predicts ~ 0.48. RCDC's late-time growth "
            "suppression must match this same number from one parameter."
        ),
    ),
    Observation(
        key="neff_relativistic_species",
        name="Effective number of relativistic species N_eff",
        domain="cosmology",
        measured_value=2.99,
        uncertainty=0.17,
        tolerance_sigma=2.0,
        description=(
            "Planck 2018 N_eff. Standard 3-neutrino prediction is 3.044. "
            "Sensitive to new relativistic degrees of freedom at recombination."
        ),
    ),
    Observation(
        key="lithium_7_primordial",
        name="Primordial Li-7 abundance (Spite plateau)",
        domain="cosmology",
        measured_value=-9.94,       # log10(Li/H)
        uncertainty=0.06,
        tolerance_sigma=2.0,
        description=(
            "Halo-star Li-7 abundance, log10(Li/H) ~ -9.94. Standard BBN with "
            "Planck Omega_b predicts ~ -9.45 -- a factor of 3 excess."
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
