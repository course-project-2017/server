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
		var substr = input.split("\n"), pos = 0, from = '', where = '', when = '0001-01-01';
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
		
        	var line = '';
        	client.connect();
        	var message = '', country = '';
        	client.query(("SELECT Countries.Country FROM Countries, Cities WHERE Countries.id = Cities.country AND Cities.city = '" + where + "'"), (err, res) => {
        		if (err) throw err;
        		for (let row of res.rows) {
        			country = JSON.stringify(row);
        			country = country.substring( country.indexOf(":") + 2, country.length - 2);
        		}
        		var query = "SELECT Flights.id, Flights.date_flight, Flights.cost, Flights.time_flight,C1.Country, Cit1.City, C2.Country, Cit2.City FROM Flights, Countries AS C1, Cities AS Cit1, Countries AS C2, Cities AS Cit2 WHERE (Cit1.Country=C1.ID and Flights.city_to=Cit1.ID) AND (Cit2.Country=C2.ID and Flights.city_from=Cit2.ID)"
        				+ "AND Cit1.City='" + where + "' AND Cit2.City='" + from + "' AND Flights.date_flight ='" + when + "'";
        		client.query(query, (err, res) => {
        			if (err) throw err;
        			for (let row of res.rows) {
        				var num = 0, pos1 = 0, pos2 = 0;
        				var str = JSON.stringify(row);
        				while (str.indexOf(":") != -1) 
        				{
        					pos1 = str.indexOf(":", num); 
        					pos2 = str.indexOf(",", num);
        					if (pos2 == -1)
        						line = str.substring(pos1 + 1, str.length - 1);
                        			else 
                        				line = str.substring(pos1 + 1, pos2);
        					if (line.indexOf('"') != -1)
        						line = line.substring(1, line.length - 1);
        					str = str.substring(pos2 + 1, str.length);
        					if (pos2 == -1)
        						str = str.substring(pos1 + 1, str.length);	
        					message += line + "&";	 
        				}
        				message += country + "&" + where+ "|";  
        			}
        			client.end();
        			response.writeHead(200, {'Content-Type': 'text/html'});
				if (!message)
					message = "No tickets!";
       				response.end(message);	
        		});
        	});
	});
})
	
server.listen(port);
console.log('Server is running');
