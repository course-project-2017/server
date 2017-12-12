/**
* Создание сервера и работа с БД
*/
'use strict';
const http = require('http');
const url = require('url');
const port = process.env.PORT || 5000;

var server = http.createServer( function(request, response){
	/**
	* Принимает запрос от клиента и записывает данные в input.
	* Обрабатывает данные.
	* Подключается к БД и отправляет к ней запрос.
	* Получение ответа от БД и его обработка.
	* Отправление данных клиенту
	* @param request запрос
	* @param response ответ
	*/

  	response.setHeader('Content-Type', 'application/json');
	var input = url.parse(request.url, true);
	var from = '', where = '', when = '0001-01-01';
	if (!input)
		response.end(JSON.stringify("No request"));
	else 
	{
		from = input.query.from;
		where = input.query.where;
		when = input.query.when;

		const { Client } = require('pg');
		const client = new Client({
 			connectionString: process.env.DATABASE_URL,
  			ssl: true,
		});
		client.connect();
		
        	var query = "SELECT Flights.id, Flights.date_flight, Flights.cost, Flights.time_flight, C1.Country AS country_from, Cit1.City AS city_from, C2.Country AS country_to, Cit2.City AS city_to " + 
			"FROM Flights, Countries AS C1, Cities AS Cit1, Countries AS C2, Cities AS Cit2 WHERE (Cit1.Country=C1.ID and Flights.city_to=Cit1.ID) AND (Cit2.Country=C2.ID and Flights.city_from=Cit2.ID)"
        		+ "AND Cit1.City='" + from + "' AND Cit2.City='" + where + "' AND Flights.date_flight ='" + when + "'";
        	client.query(query, (err, res) => {
        		if (err)
				throw err;
			var message = '', str = '';
        		for (let row of res.rows)
			{
        			str = JSON.stringify(row);
				message += str + ", ";
			}
			if (!message)
				message = JSON.stringify("No tickets!");
			else
				message = '[' + message.substring(0, message.length - 2) + ']';
			client.end();
       			response.end(message);
       		});
	}	
})
server.listen(port);
console.log('Server is running');
