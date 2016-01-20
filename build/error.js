window.onerror = function(msg, url, row, col){
	if (typeof msg != 'string' || msg.length == 0) return;

	$.ajax({
		url: window.location.href.split('Shared%20Documents')[0] + '/Instructor%20Reporting/config/config.xml',
		method: 'GET'
	}).always(function(txt){
		var xml;
		if (arguments[2].responseText.indexOf('<errors>') == -1){
			xml = '<errors></errors>';
			var parser = new DOMParser();
			xml = parser.parseFromString(xml, "text/xml");
		}
		$(xml).find('errors').append('<error date="' + new Date().toISOString() + '" msg="' + msg + '" row="' + row + '" col="' + col + '" url="' + window.location.href + '" file="' + url + '" />');
		var buffer = new TextEncoder('utf8').encode((new XMLSerializer()).serializeToString(xml));
		var postUrl = "../_api/Web/GetFolderByServerRelativeUrl('" + window.location.pathname.split('Shared%20Documents/index.aspx')[0] + "Instructor%20Reporting/config')/Files/add(overwrite=true, url='err.xml')";
		$.ajax({
			url: '../_api/contextinfo',
			headers: {
				accept: 'application/json; odata=verbose',
				'content-type': 'application/json;odata=verbose'
			},
			type: 'POST',
			contentType: 'application/json:charset=utf-8'
		}).done(function(d){
			$.ajax({
				url: postUrl,
				type: 'POST',
				data: buffer,
				processData: false,
				headers: {
					'accept': 'application/json;odata=verbose',
					'X-RequestDigest': $(d).find('d\\:FormDigestValue, FormDigestValue').text()
				}
			});
		})
	})
}