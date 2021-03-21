class SmokeTestFail(Exception):
    pass


class SmokeTestRegistry(object):
    def __init__(self):
        self.tests = {}

    def register(self, sequence, name):
        def decorator(fn):
            self.tests[name] = {"sequence": sequence, "test": fn}
            return fn

        return decorator

    def __iter__(self):
        def seq(key):
            return self.tests[key]["sequence"]

        for name in sorted(self.tests, key=seq):
            yield name, self.tests[name]["test"]

    def execute(self):
        for name, test in iter(self):
            status = True
            message = ""
            try:
                test()
            except SmokeTestFail as fail:
                status = False
                message = str(fail)
            yield {"name": name, "status": status, "message": message}


live_smoketests = SmokeTestRegistry()
ready_smoketests = SmokeTestRegistry()
