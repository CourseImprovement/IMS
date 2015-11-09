MSG=

chase:
	git checkout master
	git merge chase
	git checkout gh-pages
	git pull origin master
	git checkout chase

grant:
	git checkout master
	git merge grant
	git checkout gh-pages
	git pull origin master
	git checkout grant

docs:
	grunt
	jsdoc build/admin3.js
	make d

d:
	grunt assert

open:
	start out/index.html

.PHONY: docs