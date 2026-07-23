"""Unit tests for the schema-level validators — no database required
(except validate_role_slug, which needs the RBAC cache warmed; that one is
exercised at the HTTP level in test_users_integration.py instead).

Each assertion on `.type` locks in a stable, per-rule error code — the
whole point of using PydanticCustomError instead of a plain ValueError is
that the frontend can key an i18n translation off `type` instead of
parsing the English `msg` sentence. See app/schemas/_validators.py.
"""
import pytest
from pydantic_core import PydanticCustomError

from app.schemas._validators import validate_language_code, validate_name, validate_password_strength


class TestPasswordStrength:
    def test_accepts_a_strong_password(self):
        assert validate_password_strength("Str0ng!Pass") == "Str0ng!Pass"

    def test_too_short_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("Sh0rt!")
        assert exc_info.value.type == "password_too_short"
        assert exc_info.value.context == {"min_length": 8}

    def test_too_long_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("Aa1!" + "a" * 126)
        assert exc_info.value.type == "password_too_long"
        assert exc_info.value.context == {"max_length": 128}

    def test_missing_uppercase_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("alllower1!")
        assert exc_info.value.type == "password_missing_uppercase"

    def test_missing_lowercase_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("ALLUPPER1!")
        assert exc_info.value.type == "password_missing_lowercase"

    def test_missing_digit_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("NoDigits!")
        assert exc_info.value.type == "password_missing_digit"

    def test_missing_special_char_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("NoSpecial1")
        assert exc_info.value.type == "password_missing_special_char"

    def test_checks_run_in_a_fixed_order_shortest_check_first(self):
        """A password failing multiple rules only reports the first one hit —
        documents the order so a future reordering doesn't silently change
        which `type` a given input reports."""
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_password_strength("short")  # too short AND missing every class
        assert exc_info.value.type == "password_too_short"


class TestName:
    def test_strips_surrounding_whitespace(self):
        assert validate_name("  Alice  ") == "Alice"

    def test_empty_after_strip_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_name("   ")
        assert exc_info.value.type == "name_empty"


class TestLanguageCode:
    def test_accepts_pt_br(self):
        assert validate_language_code("pt-BR") == "pt-BR"

    def test_accepts_en_us(self):
        assert validate_language_code("en-US") == "en-US"

    def test_none_is_allowed_and_passed_through(self):
        assert validate_language_code(None) is None

    def test_unsupported_language_has_a_stable_type_code(self):
        with pytest.raises(PydanticCustomError) as exc_info:
            validate_language_code("fr-FR")
        assert exc_info.value.type == "language_unsupported"
        assert exc_info.value.context == {"language": "fr-FR"}
