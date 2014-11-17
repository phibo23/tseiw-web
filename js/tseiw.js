var tseiw = {
	data: false,
	filteredData: false,
	movies: false,
	cities: false,
	cinemas: false,
	init: function(url) {
		$('form#search').submit(function(e){
			e.preventDefault();
			tseiw.applyFilters($('input[name="movie"]').val(), $('input[name="city"]').val());
			tseiw.createTimeTable();
		});

		$.ajax({
			url: url,
			beforeSend: function(jqXHR, settings){
				$('#content').addClass('loading');
			},
			success: function(data){
				//load data and sort data
				tseiw.data = data;
				tseiw.filteredData = data;
				tseiw.sortDateTime();
				//extract movies
				tseiw.movies = $.map(tseiw.data,function(item, index){
					return item.movie.title?item.movie.title:item.movie.titleRaw;
				}).filter(onlyUnique).sort();
				//extract cities
				tseiw.cities = $.map(tseiw.data,function(item, index){
					return item.cinema.city;
				}).filter(onlyUnique).sort();
				//extract cinemas
				tseiw.cinemas = $.map(tseiw.data,function(item, index){
					return item.cinema.name + ' (item.cinema.city)';
				}).filter(onlyUnique).sort();
				//create DOM
				tseiw.createFilters();
				tseiw.createMeta();
				tseiw.createTimeTable();
			},
			complete: function(){
				$('#content').removeClass('loading');
			}
		});
	},
	sortDateTime: function() {
		tseiw.filteredData = tseiw.filteredData.sort(function(a,b){
			if (a.datetime < b.datetime)
				return -1;
			if (a.datetime > b.datetime)
				return 1;
			return 0;
		});
	},
	createFilters: function() {
		//prepare autocompleter
		$('#search input[name="movie"]')
			.autocomplete({
				source: tseiw.movies,
				minLength: 0,
				select: function( event, ui ) {
					this.value = ui.item.value;
					return false;
				}
			})
			.focus(function() {
				$(this).autocomplete('search', $(this).val())
			})
		$('#search input[name="city"]')
			.autocomplete({
				source: tseiw.cities,
				minLength: 0,
				select: function( event, ui ) {
					this.value = ui.item.value;
					return false;
				}
			})
			.focus(function() {
				$(this).autocomplete('search', $(this).val())
			})
	},
	createMeta: function() {
		$('#meta')
			.append($('<div/>', {class: 'module'})
				.append($('<span/>', {class: 'count', text: tseiw.movies.length}))
				.append($('<span/>', {class: 'label', text: (tseiw.movies.length==1?'Movie':'Movies')}))
				.append($('<span/>', {class: 'count', text: tseiw.cities.length}))
				.append($('<span/>', {class: 'label', text: (tseiw.cities.length==1?'City':'Cities')}))
				.append($('<span/>', {class: 'count', text: tseiw.cinemas.length}))
				.append($('<span/>', {class: 'label', text: (tseiw.cinemas.length==1?'Cinema':'Cinemas')}))
				.append($('<span/>', {class: 'count', text: tseiw.data.length}))
				.append($('<span/>', {class: 'label', text: (tseiw.data.length==1?'Screening':'Screenings')}))
			);
	},
	createTimeTable: function() {
		$('#screenings').empty();
		var tmpday;
		tseiw.filteredData.forEach(function(item){
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
					.append($('<div/>', {class: 'metadata'})
						.append($('<span/>', {class: 'small time', text: itemdate.format('H:mm')}))
						.append($('<span/>', {class: 'big', text: item.movie.title?item.movie.title:item.movie.titleRaw}))
						.append(function(){if(item.threeD){return $('<span/>', {class: 'small feature', text: '3D'})}})
						.append(function(){if(item.fourK){return $('<span/>', {class: 'small feature', text: '4K'})}})
						.append(function(){if(item.hfr){return $('<span/>', {class: 'small feature', text: 'HFR'})}})
						.append(function(){if(item.imax){return $('<span/>', {class: 'small feature', text: 'IMAX'})}})
						.append(function(){if(item.omu){return $('<span/>', {class: 'small feature', text: 'OmU'})}})
						.append($('<span/>', {class: 'small', text: item.cinema.name}))
						.append($('<a/>', {target: '_blank', href: item.link})
							.append($('<span/>', {class: 'fa fa-fw fa-ticket'})))
						.append($('<a/>', {target: '_blank', href: 'https://maps.google.com/maps?q=' + item.cinema.street + ' ' + item.cinema.streetNo + ' ' + item.cinema.postalCode + ' ' + item.cinema.city})
							.append($('<span/>', {class: 'fa fa-fw fa-map-marker'})))
					)
					.append($('<div/>', {class: 'timeduration ' + (item.movie.duration?'defined':'undefined')})
						.css({
							left: (itemdate.hours()*60+itemdate.minutes())/1440*100 + "%",
							width: 120/1440*100 + "%"
						})
					)
				);
		});
	},
	applyFilters: function(movie, city) {
		console.log(movie);
		console.log(city);
		tseiw.filteredData = tseiw.data.filter(function(value, index, self){
			var matchMovie = false;
			if (movie) {
				matchMovie = ((value.movie.title == movie) || (value.movie.titleRaw == movie));
			} else {
				matchMovie = true;
			}
			var matchCity = false;
			if (city) {
				matchCity = value.cinema.city == city;
			} else {
				matchCity = true;
			}
			return (matchMovie && matchCity);
		});
	}
};