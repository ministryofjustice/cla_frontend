from django.shortcuts import redirect
from django.http import Http404
from django.core.urlresolvers import reverse
from django.views.generic import TemplateView

from django.contrib.formtools.wizard.views import NamedUrlSessionWizardView

from .helpers import SessionCheckerHelper
from .forms import YourDetailsForm, YourFinancesForm, YourProblemForm, \
    ResultForm, ApplyForm


class CheckerWizard(NamedUrlSessionWizardView):
    storage_name = 'checker.storage.CheckerSessionStorage'

    form_list = [
        ("your_problem", YourProblemForm),
        ("your_details", YourDetailsForm),
        ("your_finances", YourFinancesForm),
        ("result", ResultForm),
        ("apply", ApplyForm),
    ]

    TEMPLATES = {
        "your_problem": "checker/your_problem.html",
        "your_details": "checker/your_details.html",
        "your_finances": "checker/your_finances.html",
        "result": "checker/result.html",
        "apply": "checker/apply.html"
    }

    def get_template_names(self):
        return [self.TEMPLATES[self.steps.current]]

    def get_all_cleaned_data_dicts(self):
        data = {}
        for step in self.steps.all:
            _data = self.get_cleaned_data_for_step(step)
            if _data:
                data[step] = _data
        return data

    def get_context_data(self, form, **kwargs):
        context = super(CheckerWizard, self).get_context_data(form, **kwargs)

        history_data = self.get_all_cleaned_data_dicts()
        if self.storage.current_step in history_data:
            del history_data[self.storage.current_step]

        context['history_data'] = history_data
        context.update(form.get_context_data())

        # steps
        context['steps'] = self.steps.all[:-2]
        return context

    def get_form_kwargs(self, step=None):
        kwargs = super(CheckerWizard, self).get_form_kwargs(step=step)
        kwargs['reference'] = self.storage.get_eligibility_check_reference()
        if step == 'your_finances':
            details_data = self.get_cleaned_data_for_step('your_details')
            if details_data:
                kwargs['has_partner'] = bool(details_data['has_partner'])
                kwargs['has_children'] = bool(details_data['has_children'])
                kwargs['has_property'] = bool(details_data['own_property'])
        return kwargs

    def render_next_step(self, form, **kwargs):
        response = self.render_redirect()
        if not response:
            response = super(CheckerWizard, self).render_next_step(form, **kwargs)
        return response

    def render_done(self, form, **kwargs):
        response = self.render_redirect()
        if not response:
            response = super(CheckerWizard, self).render_done(form, **kwargs)
        return response

    def get_form_step_data(self, form):
        data = super(CheckerWizard, self).get_form_step_data(form)
        if self.steps.current == 'your_finances':
            if bool(form.cleaned_data.get('your_other_properties',{}).get('other_properties', False)):
                data = data.copy()
                data['property-TOTAL_FORMS'] = unicode(int(data['property-TOTAL_FORMS']) + 1)
                data['your_other_properties-other_properties'] = u'0'
                self.redirect_to_self = True
        return data

    def process_step(self, form):
        response_data = form.save()

        # saving eligibility check AND / OR case references in the session
        eligibility_check = response_data.get('eligibility_check')
        case = response_data.get('case')

        if eligibility_check:
            self.storage.set_eligibility_check_reference(eligibility_check['reference'])

        if case:
            self.storage.set_case_reference(case['reference'])

        return super(CheckerWizard, self).process_step(form)

    def done(self, *args, **kwargs):
        forms_data = self.get_all_cleaned_data_dicts()

        # save everything in the session
        session_helper = SessionCheckerHelper(self.request)
        session_helper.store_forms_data(forms_data)
        session_helper.store_eligibility_check_reference(self.storage.get_eligibility_check_reference())
        session_helper.store_case_reference(self.storage.get_case_reference())

        return redirect(reverse('checker:confirmation'))

    def render_redirect(self):
        if getattr(self, 'redirect_to_self', False):
            return self.render_goto_step(self.steps.current)


class ConfirmationView(TemplateView):
    template_name = 'checker/confirmation.html'

    def dispatch(self, request, *args, **kwargs):
        """
        If case reference not found in the session => 404
        """
        self.session_helper = SessionCheckerHelper(self.request)

        if not self.session_helper.get_case_reference():
            raise Http404()

        return super(ConfirmationView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ConfirmationView, self).get_context_data(**kwargs)

        context.update({
            'history_data': self.session_helper.get_forms_data(),
            'case_reference': self.session_helper.get_case_reference()
        })
        return context
