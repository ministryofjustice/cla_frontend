from django.test.runner import DiscoverRunner


class NoDbTestRunner(DiscoverRunner):
    """ A test runner to test without database creation """
    # def __init__(self, *args, **kwargs):
    #     kwargs['top_level'] = '.'
    #     super(NoDbTestRunner, self).__init__(*args, **kwargs)

    def setup_databases(self, **kwargs):
        """ Override the database creation defined in parent class """
        pass

    def teardown_databases(self, old_config, **kwargs):
        """ Override the database teardown defined in parent class """
        pass
