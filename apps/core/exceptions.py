from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    """Wrap every DRF error response in a consistent {"detail": ...} envelope."""
    response = drf_exception_handler(exc, context)
    if response is None:
        return None
    response.data = {'detail': response.data}
    return response
