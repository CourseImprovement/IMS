var ims = {

	xml: {
		getQuestionValue: function(){

		}
	},

	config: {
		getQuestionText: function(sid, qid){

		}
	},

	users: {
		getAnswer: function(sid, qid){

		}
	}
}

function test(path, callback){
	callback(path);
}


function User(email){
	this.email = email;
	this.getXml();
}

User.prototype.getXml = function(){

	var _this = this;


	test('master/' + this.email + '.xml', function(data){
		_this.xml = data;
	});

}

throw "test";