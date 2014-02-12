import slumber


API_VERSION = 'v1'
BASE_URI = 'http://127.0.0.1:8000/legalaid/api/{version}'.\
    format(version=API_VERSION)

_client = slumber.API(BASE_URI, )


class Resource(object):
    fields = set()
    required_fields = set()
    connection = None

    def validate_fields(self, data):
        """
        checks if all required fields have been specified
        """
        raise NotImplementedError()

    def update(self, data=None, reference=None, **kwargs):
        """
        :param data: optional, the whole updated object you want to save
        :param kwargs: or, a reference for the object to be updated and
        """

        updated = None
        if data is not None and 'reference' in data:
            # check data has a reference before posting
            updated = self.connection.post(data)
        elif reference:
            kwargs.update({'reference': reference})
            updated = self.connection.patch(kwargs)

        return updated



class Category(Resource):

    connection = _client.category

    def list(self):
        """
        :return: a list of all categories
        """
        return self.connection.get()


class EligibilityClaim(Resource):

    connection = _client.eligibility_check

    def create(self, category=None, notes=None):
        """
        begin an eligibility claim
        :param category: id of a category object obtained from
         `get_category_list`
        :param notes: an optional string to be set as the notes field
        :return: the created eligibility claim, including the id
        """

        data = {}
        if category:
            data['category'] = category
            data['notes'] = notes

        new = self.connection.post(data)
        return new


class PersonalDetails(object):

    fields = ('title', 'full_name', 'postcode',
              'street', 'town', 'mobile_phone', 'home_phone',)

    def create(self, title=None, full_name=None, postcode=None,
               street=None, town=None, mobile_phone=None, home_phone=None):
        if not any([mobile_phone, home_phone]):
            raise ValueError('One of home_phone or mobile_phone must be supplied')

        data = {}

        for f in self.fields:
            data[f] = locals()[f]

        _client.personal_details.post(data)

    def update(self, data=None, **kwargs):
        pass


class Case(object):

    def create(self, eligibility_check, personal_details):
        """
        creates a case using a pre-existing pair of an
        eligibility claim object and a personal_details object.
        :param eligibility_check: id of an existing eligibility claim
        :param personal_details: id of an existing
        personal details object
        :return: the created claim including the
        reference to give to the end user
        """
        data = {}
        data['eligibility_check'] = eligibility_check
        data['personal_details'] = personal_details
        return _client.case.post(data)
