'use strict';
const http = require('http');
const port = process.env.PORT || 5000;
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
	
		const { Client } = require('pg');

		const client = new Client({
 			connectionString: process.env.DATABASE_URL,
  			ssl: true,
		});

		from = "Moscow";
		where = "Paris";
		when = "2018-01-04";
		client.connect();
		var query = "SELECT Flights.id, Flights.date_flight, Flights.time_flight, C1.Country, Cit1.City, C2.Country, Cit2.City, Flights.cost FROM Flight, Countries AS C1, Cities AS Cit1, Countries AS C2, Cities AS Cit2 WHERE (Cit1.Country=C1.ID and Flights.city_to=Cit1.ID) AND (Cit2.Country=C2.ID and Flights.city_from=Cit2.ID)"
		+ "AND Cit1.City='" + from + "' AND Cit2.City='" + where + "' AND Flight.date_flight ='" + when + "'";

		client.query(query, (err, res) => {
  			if (err) throw err;
  			for (let row of res.rows) {
    				console.log(JSON.stringifyrow);
  			}
 		 	client.end();
		});

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
	
server.listen(port);
console.log('Server is running');