from jinja2 import Environment
from jinja2 import PackageLoader
from jinja2 import select_autoescape

env = Environment(
    loader=PackageLoader('tools.archive', 'templates/archive'),
    autoescape=select_autoescape(['html'])
)

