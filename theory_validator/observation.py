"""Observations are unit tests. Each one has a measured value, an uncertainty,
and a check that decides whether a theory's prediction is consistent with it."""

from __future__ import annotations

from dataclasses import dataclass, field
from math import sqrt
from typing import Any, Callable, Optional


@dataclass
class Prediction:
    """A theory's prediction for a given observation.

    `value` may be numeric, a string (for categorical predictions like
    "blackbody" vs "distorted"), or a bool (for yes/no predictions like
    "does this theory unify QM and GR?"). `uncertainty` only applies to
    numeric predictions.
    """

    value: Any
    uncertainty: float = 0.0
    note: str = ""


# A theory can declare it has no prediction at all.
NO_PREDICTION = Prediction(value=None, note="theory does not address this domain")


@dataclass
class Observation:
    key: str
    name: str
    domain: str
    measured_value: Any
    uncertainty: float = 0.0
    tolerance_sigma: float = 3.0
    description: str = ""
    # Optional custom checker. Defaults to numeric-sigma or exact equality.
    checker: Optional[Callable[["Observation", Prediction], bool]] = field(
        default=None, repr=False
    )

    def check(self, prediction: Optional[Prediction]) -> tuple[bool, str]:
        """Returns (passed, reason)."""
        if prediction is None or prediction.value is None:
            return False, "no prediction made"
        if self.checker is not None:
            ok = self.checker(self, prediction)
            return ok, "custom check passed" if ok else "custom check failed"
        # Default numeric / equality check
        if isinstance(self.measured_value, (int, float)) and isinstance(
            prediction.value, (int, float)
        ):
            sigma = sqrt(self.uncertainty ** 2 + prediction.uncertainty ** 2)
            if sigma == 0:
                # Fall back to relative tolerance of 1% when no uncertainty is given.
                ok = abs(prediction.value - self.measured_value) <= max(
                    1e-30, 0.01 * abs(self.measured_value)
                )
                reason = (
                    f"|pred - obs| = {abs(prediction.value - self.measured_value):.3g}, "
                    f"tol = {0.01 * abs(self.measured_value):.3g}"
                )
                return ok, reason
            n_sigma = abs(prediction.value - self.measured_value) / sigma
            ok = n_sigma <= self.tolerance_sigma
            return ok, f"{n_sigma:.2f} sigma deviation (tol={self.tolerance_sigma})"
        # Equality for strings / bools.
        ok = prediction.value == self.measured_value
        return ok, (
            f"predicted {prediction.value!r}, observed {self.measured_value!r}"
        )
