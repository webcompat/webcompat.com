init:
	echo "❯ Initializing..."
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
