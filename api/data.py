def yes_no_to_binary(value: str) -> int:
    if not isinstance(value, str):
        return 0
    return 1 if value.strip().lower() == "yes" else 0
