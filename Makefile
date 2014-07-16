init:
	echo "❯ Initializing..."
	(sudo pip install virtualenv)
	(virtualenv env)
	(source env/bin/activate)
	pip install -r requirements.txt
	(cp config.py.example config.py)
	@ npm install

update:
	@ echo "❯ Updating..."
	@ npm update

watch:
	@ echo "❯ Watching..."
	@ grunt watch

dist:
	@ echo "❯ Distribution..."
	@ grunt

run:
	@ echo "❯ Sarting..."
	@ python run.py
