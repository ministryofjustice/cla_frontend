# import logging
# # This is a hack because the DOM1 Windows XP PCs that
# # the MoJ uses are setup to not set a referrer which obviously
# # breaks django sites using CSRF protection
# class DisableCSRF(object):
#     def process_request(self, request):
#         logging.info('this is insecure, please disable this middleware')
#         setattr(request, '_dont_enforce_csrf_checks', True)
#         return None
