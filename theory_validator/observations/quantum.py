"""Foundational tests: unification, hierarchy, vacuum energy.

These are categorical (does the theory address it?) rather than numeric
matches; they are the ones a real Theory of Everything is required to handle."""

from ..observation import Observation


QUANTUM_OBSERVATIONS = [
    Observation(
        key="qm_gr_unification",
        name="Quantum-gravity unification",
        domain="foundational",
        measured_value=True,
        description=(
            "Does the theory provide a consistent quantization of gravity? "
            "Required of a Theory of Everything."
        ),
    ),
    Observation(
        key="dark_matter_provided",
        name="Dark matter sector",
        domain="foundational",
        measured_value=True,
        description=(
            "Does the theory include something that plays the role of dark "
            "matter (lensing, structure formation, CMB peaks)?"
        ),
    ),
    Observation(
        key="dark_energy_provided",
        name="Dark energy / accelerated expansion",
        domain="foundational",
        measured_value=True,
        description=(
            "Does the theory account for the observed acceleration of cosmic "
            "expansion?"
        ),
    ),
    Observation(
        key="hierarchy_problem_addressed",
        name="Electroweak hierarchy problem",
        domain="foundational",
        measured_value=True,
        description=(
            "Does the theory explain why the Higgs mass is ~ 1e17 times below "
            "the Planck scale without fine tuning?"
        ),
    ),
    Observation(
        key="cosmological_constant_natural",
        name="Cosmological-constant naturalness",
        domain="foundational",
        measured_value=True,
        description=(
            "Does the theory predict a vacuum energy density consistent with "
            "the observed ~ 1e-122 in Planck units, without fine tuning?"
        ),
    ),
    Observation(
        key="matter_antimatter_asymmetry",
        name="Baryogenesis mechanism",
        domain="foundational",
        measured_value=True,
        description=(
            "Does the theory provide a mechanism producing the observed "
            "baryon-to-photon ratio ~ 6e-10?"
        ),
    ),
]
