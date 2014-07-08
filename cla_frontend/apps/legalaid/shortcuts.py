from django.http import Http404

from slumber.exceptions import HttpClientError


def get_case_or_404(client, case_reference):
    """
    Returns the case object with reference ``case_reference`` if it exists,
    raises Http404 otherwise.
    """

    try:
        return client.case(case_reference).get()
    except HttpClientError as e:
        if e.response.status_code == 404:
            raise Http404('No case matches with reference %s.' % case_reference)
        raise e

def get_eligibility_or_404(client, case_reference):
    """
    Returns the eligibility_check for case object with reference ``case_reference`` if it exists,
    raises Http404 otherwise.
    """
    try:
        return client.case(case_reference).eligibility_check.get()
    except HttpClientError as e:
        if e.response.status_code == 404:
            raise Http404('No eligibility check for case with reference %s.' % case_reference)
        raise e
