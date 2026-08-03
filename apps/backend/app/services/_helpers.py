from typing import TypeVar

T = TypeVar("T")


def optional_kwarg(key: str, value: T | None) -> dict[str, T]:
    """Build a single-key kwargs dict for spreading into a constructor/assignment,
    omitting the key entirely when `value` is `None` — so a model column's own
    default (e.g. `User.language`'s `default="en-US"`) applies instead of the
    column being explicitly set to `None`. Spread with `**`, not passed as a
    plain arg: `User(..., **optional_kwarg("language", body.language))`.
    """
    return {key: value} if value is not None else {}
