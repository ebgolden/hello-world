"""Particle-physics observations."""

from ..observation import Observation


PARTICLE_OBSERVATIONS = [
    Observation(
        key="higgs_mass",
        name="Higgs boson mass",
        domain="particle",
        measured_value=125.25,      # GeV/c^2
        uncertainty=0.17,
        description="ATLAS+CMS combined Higgs mass.",
    ),
    Observation(
        key="electron_mass",
        name="Electron mass",
        domain="particle",
        measured_value=0.51099895,  # MeV/c^2
        uncertainty=1.5e-8,
        description="CODATA electron mass.",
    ),
    Observation(
        key="proton_electron_mass_ratio",
        name="m_p / m_e",
        domain="particle",
        measured_value=1836.15267,
        uncertainty=2.0e-4,
        description="Proton-to-electron mass ratio.",
    ),
    Observation(
        key="muon_g2_anomaly",
        name="Muon (g-2) anomalous moment a_mu",
        domain="particle",
        measured_value=116592059.0e-11,
        uncertainty=22.0e-11,
        description=(
            "Fermilab + BNL combined muon anomalous magnetic moment. "
            "Standard Model R-ratio prediction is in mild tension."
        ),
    ),
    Observation(
        key="proton_decay_lifetime",
        name="Proton lifetime lower bound",
        domain="particle",
        # Super-K bound: tau_p > 1.6e34 yr for p -> e+ pi0. We test that
        # a candidate theory predicts a lifetime at least that long.
        measured_value=1.0e35,
        uncertainty=1.0e35,         # very broad; this is just a lower bound
        description=(
            "Super-Kamiokande lower limit on proton lifetime. Many GUTs predict "
            "lifetimes already ruled out (~1e30-1e32 yr)."
        ),
    ),
    Observation(
        key="neutrino_mass_squared_diff",
        name="Atmospheric neutrino |Δm²_32|",
        domain="particle",
        measured_value=2.45e-3,     # eV^2
        uncertainty=0.07e-3,
        description=(
            "Neutrino oscillation mass-squared difference. Standard Model "
            "with massless neutrinos predicts 0 -- requires extension."
        ),
    ),
    Observation(
        key="fine_structure_constant",
        name="Fine-structure constant alpha^-1",
        domain="particle",
        measured_value=137.035999084,
        uncertainty=2.1e-8,
        description="CODATA inverse fine-structure constant.",
    ),
]
