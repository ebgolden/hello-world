"""All observations the validator tests against."""

from .relativity import RELATIVITY_OBSERVATIONS
from .cosmology import COSMOLOGY_OBSERVATIONS
from .galactic import GALACTIC_OBSERVATIONS
from .particle import PARTICLE_OBSERVATIONS
from .quantum import QUANTUM_OBSERVATIONS


ALL_OBSERVATIONS = (
    RELATIVITY_OBSERVATIONS
    + COSMOLOGY_OBSERVATIONS
    + GALACTIC_OBSERVATIONS
    + PARTICLE_OBSERVATIONS
    + QUANTUM_OBSERVATIONS
)

OBSERVATIONS_BY_KEY = {obs.key: obs for obs in ALL_OBSERVATIONS}
