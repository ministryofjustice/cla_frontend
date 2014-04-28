from django.core.exceptions import ValidationError


class RemoteValidationError(ValidationError):
    """
    Exception for when remote validation has failed.
    """
    pass
