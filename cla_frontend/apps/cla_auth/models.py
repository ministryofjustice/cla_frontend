class ClaUser(object):
    USERNAME_FIELD = 'token'

    def __init__(self, token, **props):
        self.pk = token

        for prop, value in props.items():
            setattr(self, prop, value)

    def save(self, *args, **kwargs):
        # TODO call backend api with last_login ?
        pass

    def is_authenticated(self, *args, **kwargs):
        return True
