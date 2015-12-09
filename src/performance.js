function Performance(){
	this.link = 'https://docs.google.com/forms/d/1zM5mc8LTNeKKmpjUuzSUI6myvL6dz_aSNh3sIsqaNaY/viewform?formkey=dG01Ykt2UXlBMmo3UEh0VlNtZXZLWlE6MQ#gid=0';
	this.name = 'Performance Report';
}

Performance.prototype.isNew = function(){return false;}
Performance.prototype.getHref = function(){return this.link;}
Performance.prototype.getFullName = function(){return this.name;}