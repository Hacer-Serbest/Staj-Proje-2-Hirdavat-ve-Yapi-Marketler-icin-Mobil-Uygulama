import logging

from rest_framework.views import exception_handler

logger = logging.getLogger('django')


def custom_exception_handler(exc, context):
    """DRF'nin varsayılan hata yanıtını tutarlı bir zarfa (envelope) sarar.

    Beklenmeyen (500) hatalarda DRF varsayılan olarak None döner; bu durumda
    da istemciye anlamlı bir JSON hatası döndürülür ve sunucu tarafında loglanır.
    """
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            'error': True,
            'detail': response.data,
            'status_code': response.status_code,
        }
        return response

    logger.exception('Beklenmeyen hata: %s', exc, exc_info=exc)
    return None
