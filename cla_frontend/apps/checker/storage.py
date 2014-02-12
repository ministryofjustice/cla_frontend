from django.contrib.formtools.wizard.storage.session import SessionStorage


class CheckerSessionStorage(SessionStorage):
    def init_data(self):
        super(CheckerSessionStorage, self).init_data()
        self.data['_reference'] = None

    def set_if_necessary_reference(self, reference):
        if not self.data.get('_reference'):
            self.data['_reference'] = reference

    def get_reference(self):
        return self.data.get('_reference')
