from .general_relativity import GeneralRelativity
from .standard_model import StandardModel
from .lambda_cdm import LambdaCDM
from .string_theory import StringTheory
from .tired_light import TiredLight
from .mond import MOND
from .loop_quantum_gravity import LoopQuantumGravity


EXISTING_THEORIES = [
    GeneralRelativity(),
    StandardModel(),
    LambdaCDM(),
    StringTheory(),
    TiredLight(),
    MOND(),
    LoopQuantumGravity(),
]
