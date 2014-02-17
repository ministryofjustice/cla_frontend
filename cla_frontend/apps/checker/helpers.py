# import pickle


# class SessionCheckerHelper(object):
#     SESSION_KEY = 'checker_result'

#     def __init__(self, request):
#         self.request = request

#     def store(self, data):
#         self.request.session[self.SESSION_KEY] = pickle.dumps(data)

#     def get(self):
#         data = self.request.session.get(self.SESSION_KEY)
#         if data:
#             data = pickle.loads(data)
#         return data
