from cla_auth.backend import ClaBackend
from cla_auth.models import ClaUser


class ClaProviderBackend(ClaBackend):
    zone_name = 'cla_provider'
