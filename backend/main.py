import Millennium

class Plugin:
    def _front_end_loaded(self):
        pass

    def _load(self):
        Millennium.ready() 

    def _unload(self):
        pass
