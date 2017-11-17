    'use strict';
    const http = require('http');
	
  var server = http.createServer( function(request, response){

	var input = '';
  	response.setHeader('Content-Type', 'application/json');
  	request.on('data', (data) => { 
   		input += data;
 	});

	request.on('end', () => {
		var substr = input.split("\n"), pos = 0, from = null, where = null, when = null;
        	for (var i = 0; i < substr.length; i++){
        		if (substr[i].indexOf("&") == 0) {
                		pos = substr[i].indexOf("&", 1); 
                        	from = substr[i].substring(1, pos);
                        	substr[i] = substr[i].substring(pos+1, substr[i].length);
                        	pos = substr[i].indexOf("&");
                        	where = substr[i].substring(0, pos);
                        	substr[i] = substr[i].substring(pos+1, substr[i].length);
                        	when = substr[i].substring(0, substr[i].length);
			}
		}
	
		response.writeHead(200, {'Content-Type': 'text/html'});
		var message = from +"&" + where + "&" + when + "&" + "a&b&c|";
		var result = "HTTP/1.1 200 OK\r\n" +
		"Server: YarServer/2009-09-09\r\n" +
		"Content-Type: text/html\r\n" +
		"Content-Length: " + message.length +  "\r\n" +
		"Connection: close\r\n\r\n" + message;

       		response.end(result);	
	});
})
	
server.listen(8080);
console.log('Server running on 8080');