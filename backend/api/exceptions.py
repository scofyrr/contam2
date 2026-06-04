from rest_framework.views import exception_handler


def contam_exception_handler(exc, context):
    """Respuestas JSON consistentes con campo `error` para toasts en React."""
    response = exception_handler(exc, context)
    if response is not None:
        detail = response.data
        if isinstance(detail, dict):
            if "detail" in detail and len(detail) == 1:
                message = str(detail["detail"])
            else:
                message = "; ".join(
                    f"{k}: {v}" if not isinstance(v, list) else f"{k}: {', '.join(str(x) for x in v)}"
                    for k, v in detail.items()
                )
        else:
            message = str(detail)
        response.data = {"error": message, "detail": detail}
        return response

    return None
