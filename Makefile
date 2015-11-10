MSG=

chase:
	make chase1
	make chase2
	make chase3

grant:
	make grant1
	make grant2
	make grant3

chase1:
	git add .
	git commit -m '$(MSG)'
	git push

chase2:
	git checkout master
	git merge chase
	git pull
	git add .
	git commit -m '$(MSG)'

grant1:
	git add .
	git commit -m '$(MSG)'
	git push

grant2:
	git checkout master
	git merge grant
	git pull
	git add .
	git commit -m '$(MSG)'

chase3: 
	git push
	git checkout gh-pages
	git pull origin master
	git checkout chase

grant3: 
	git push
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