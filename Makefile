MSG=

docs:
	grunt
	jsdoc build/admin3.js
	make d

d:
	grunt assert

open:
	start out/index.html

.PHONY: docs