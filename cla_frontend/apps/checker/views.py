from django.views.generic import FormView
from django.shortcuts import redirect
from django.core.urlresolvers import reverse

from django.contrib.formtools.wizard.views import NamedUrlSessionWizardView

from .helpers import SessionCheckerHelper
from .forms import YourDetailsForm, YourFinancesForm, YourProblemForm, ContactDetails



class CheckerWizard(NamedUrlSessionWizardView):
    storage_name = 'checker.storage.CheckerSessionStorage'

    form_list = [
        ("your_problem", YourProblemForm),
        ("your_details", YourDetailsForm),
        ("your_finances", YourFinancesForm),
    ]

    TEMPLATES = {
        "your_problem": "checker/your_problem.html",
        "your_details": "checker/your_details.html",
        "your_finances": "checker/your_finances.html",
    }

    def dispatch(self, request, *args, **kwargs):
        self.session_helper = SessionCheckerHelper(request)
        return super(CheckerWizard, self).dispatch(request, *args, **kwargs)

    def get_template_names(self):
        return [self.TEMPLATES[self.steps.current]]

    def get_context_data(self, form, **kwargs):
        context = super(CheckerWizard, self).get_context_data(form, **kwargs)

        # get from cleaned_data if possible otherwise, get it from the session
        session_data = self.session_helper.get() or {}
        history_data = {}
        for step in self.steps.all:
            if step == self.storage.current_step:
                continue

            cleaned_data = self.get_cleaned_data_for_step(step)
            if not cleaned_data:
                cleaned_data = session_data.get(step)

            if cleaned_data:
                history_data[step] = cleaned_data

        context['history_data'] = history_data
        return context

    def get_form_kwargs(self, step=None):
        kwargs = super(CheckerWizard, self).get_form_kwargs(step=step)
        kwargs['reference'] = self.storage.get_reference()
        if step == 'your_finances':
            details_data = self.get_cleaned_data_for_step('your_details')
            if details_data:
                kwargs['has_partner'] = bool(details_data['has_partner'])
                kwargs['has_children'] = bool(details_data['has_children'])
                kwargs['has_property'] = bool(details_data['own_property'])
        return kwargs

    def get_form_initial(self, step):
        history_data = self.session_helper.get()
        if history_data:
            return history_data.get(step, {})
        return {}

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
            if bool(form.cleaned_data['your_other_properties']['other_properties']):
                data = data.copy()
                data['property-TOTAL_FORMS'] = unicode(int(data['property-TOTAL_FORMS']) + 1)
                data['your_other_properties-other_properties'] = u'0'
                self.redirect_to_self = True
        return data


    def process_step(self, form):
        response_data = form.save()
        self.storage.set_if_necessary_reference(response_data['reference'])
        return super(CheckerWizard, self).process_step(form)

    def done(self, *args, **kwargs):
        data = {}
        for step in self.steps.all:
            data[step] = self.get_cleaned_data_for_step(step)

        self.session_helper.store(data)
        return redirect(reverse('checker:result'))

    def render_redirect(self):
        if getattr(self, 'redirect_to_self', False):
            return self.render_goto_step(self.steps.current)



class ResultView(FormView):
    template_name = 'checker/result.html'
    form_class = ContactDetails

    def get(self, request, *args, **kwargs):
        return super(ResultView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ResultView, self).get_context_data(**kwargs)

        session_helper = SessionCheckerHelper(self.request)
        context.update({
            'history_data': session_helper.get(),
            'applying': self.kwargs.get('applying')
        })
        return context
