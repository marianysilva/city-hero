from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelBase(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
        # Strips input_value/input_type from ValidationError's *string* repr
        # (str(exc)) — a defense-in-depth belt for anything that ever logs a
        # raw pydantic ValidationError directly. Doesn't affect FastAPI's
        # JSON 422 response body (exc.errors() ignores this config); see
        # main.py's RequestValidationError handler for that actual fix.
        hide_input_in_errors=True,
    )
