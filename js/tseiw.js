var tseiw = {
	data: false,
	cities: false,
	movies: false,
	init: function(url) {
		$.ajax(url)
			.done(function(data){
				//load data and sort data
				tseiw.data = data;
				tseiw.sortDateTime();
				//extract movies
				tseiw.movies = $.map(tseiw.data,function(item, index){
					return item.movie.titleRaw;
				}).filter(onlyUnique).sort();
				//extract cities
				tseiw.cities = $.map(tseiw.data,function(item, index){
					return item.cinema.city;
				}).filter(onlyUnique).sort();
				//create DOM
				tseiw.createFilters();
				tseiw.createTimeTable();
			});
	},
	sortDateTime: function() {
		tseiw.data = tseiw.data.sort(function(a,b){
			if (a.datetime < b.datetime)
				return -1;
			if (a.datetime > b.datetime)
				return 1;
			return 0;
		});
	},
	createFilters: function() {
		//list all unique movies in data
		tseiw.movies.forEach(function(m){
			$('ul#movies').append($('<li/>',{text: m}));
		});
		//list all unique cities in data
		tseiw.cities.forEach(function(c){
			$('ul#cities').append($('<li/>',{text: c}));
		});
	},
	createTimeTable: function() {
		var tmpday;
		tseiw.data.forEach(function(item){
			//print date if it changes
			itemdate = moment(item.datetime);
			if(tmpday != itemdate.day()){
				$('div#screenings').append($('<h3/>', {text: itemdate.format('D. MMM YYYY')}));
				$('div#screenings').append($('<ul class="scale clearfix"><li>0:00</li><li>&nbsp;</li><li>&nbsp;</li><li>3:00</li><li>&nbsp;</li><li>&nbsp;</li><li>6:00</li><li>&nbsp;</li><li>&nbsp;</li><li>9:00</li><li>&nbsp;</li><li>&nbsp;</li><li>12:00</li><li>&nbsp;</li><li>&nbsp;</li><li>15:00</li><li>&nbsp;</li><li>&nbsp;</li><li>18:00</li><li>&nbsp;</li><li>&nbsp;</li><li>21:00</li><li>&nbsp;</li><li>&nbsp;</li></ul>'));
				$('div#screenings').append($('<ul/>', {class: 'screenings'}));
				tmpday = itemdate.day();
			}
			//print row in timetable
			$('ul.screenings:last-child()')
				.append($('<li/>')
					.append($('<div/>', {class: 'metadata', text: itemdate.format('H:mm') + ": " + item.movie.titleRaw + " "})
						.append($('<a/>', {target: '_blank', href: item.link})
							.append($('<span/>', {text: item.cinema.name}))
						)
					)
					.append($('<div/>', {class: 'timeduration ' + (item.movie.duration?'defined':'undefined')})
						.css({
							left: (itemdate.hours()*60+itemdate.minutes())/1440*100 + "%",
							width: 120/1440*100 + "%"
						})
					)
				);
		});
	}
};