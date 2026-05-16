"""Galactic and astrophysical observations."""

from ..observation import Observation


GALACTIC_OBSERVATIONS = [
    Observation(
        key="galaxy_rotation_flatness",
        name="Spiral galaxy rotation-curve flatness",
        domain="galactic",
        # The ratio v_outer / v_keplerian_predicted from luminous matter alone.
        # Observed ~ 1 (flat); pure-baryon Newtonian prediction ~ 0.3-0.5.
        measured_value=1.0,
        uncertainty=0.1,
        description=(
            "Ratio of observed outer rotation velocity to the value predicted "
            "from luminous matter alone. Flat curves give ~1; pure-baryon "
            "Newtonian dynamics give ~0.3-0.5."
        ),
    ),
    Observation(
        key="bullet_cluster_offset",
        name="Bullet Cluster lensing-gas offset",
        domain="galactic",
        # Offset between weak-lensing mass peak and X-ray gas peak (kpc-scale).
        # Observed ~ nonzero; modified-gravity-only theories predict 0.
        measured_value=1.0,         # encoded as boolean-like: 1 = offset, 0 = none
        uncertainty=0.1,
        description=(
            "Spatial offset between weak-lensing mass and X-ray gas in the "
            "Bullet Cluster. 1 = significant offset (dark matter), "
            "0 = coincident (modified-gravity only)."
        ),
    ),
    Observation(
        key="cluster_lensing_strength",
        name="Galaxy cluster strong-lensing convergence",
        domain="galactic",
        # Ratio of observed convergence to GR-with-dark-matter prediction.
        measured_value=1.0,
        uncertainty=0.1,
        description=(
            "Ratio of observed Einstein-radius strong-lensing convergence to "
            "the GR + dark matter prediction. Pure baryonic GR predicts ~0.2."
        ),
    ),
    Observation(
        key="tully_fisher_slope",
        name="Baryonic Tully-Fisher slope",
        domain="galactic",
        measured_value=4.0,
        uncertainty=0.2,
        description=(
            "Slope of the log(baryonic mass) vs log(rotation velocity) "
            "relation in disk galaxies. Observed slope ~ 4."
        ),
    ),
]
