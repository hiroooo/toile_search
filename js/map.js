var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var nowPosition;
  
function initialize() {
    var mapOptions = {
        zoom: 17,
        disableDefaultUI: true,
        streetViewControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    // Try HTML5 geolocation
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            nowPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // トイレ追加ボタン表示
            var toileControlDiv = document.createElement('div');
			var toileControl = new addToileControl(toileControlDiv, map);
			toileControlDiv.index = 1;
			map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toileControlDiv);

			// 現在地アイコン表示
            var marker = new google.maps.Marker({
				position:nowPosition,
				map: map,
				title: '現在地',
				icon: 'img/here.png' 
			});


            // 周辺トイレマーカー表示
            var request = {
				location: nowPosition,
				radius: 500,
				keyword: 'トイレ'
				// types: ['store']
			};

			var service = new google.maps.places.PlacesService(map);
			service.search(request, callback);

			directionsDisplay = new google.maps.DirectionsRenderer();
			directionsDisplay.setMap(map);

            // var infowindow = new google.maps.InfoWindow({
				//  map: map,
				//  position: pos,
				//  content: 'Location found using HTML5.'
            // });

            map.setCenter(nowPosition);
        }, function() {
			handleNoGeolocation(true);
        });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
}


function calcRoute(endLat, endLng) {
	// var start = document.getElementById('start').value;
	// var end = document.getElementById('end').value;
	var endPosition = new google.maps.LatLng(endLat, endLng);
	var request = {
		origin:nowPosition,
		destination:endPosition,
		travelMode: google.maps.DirectionsTravelMode.WALKING
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			alert(
				'距離:' + response.routes[0].legs[0].distance.text + 
				'\n徒歩:' + response.routes[0].legs[0].duration.text
			);
			directionsDisplay.setDirections(response);
		}
	});
}

function addToileControl(controlDiv, map) {

	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map
	controlDiv.style.padding = '5px';

	// Set CSS for the control border
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to set the map to Home';
	controlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var controlText = document.createElement('div');
	controlText.style.fontFamily = 'Arial,sans-serif';
	controlText.style.fontSize = '12px';
	controlText.style.paddingLeft = '4px';
	controlText.style.paddingRight = '4px';
	controlText.innerHTML = '<b>トイレ追加</b>';
	controlUI.appendChild(controlText);

	// Setup the click event listeners: simply set the map to
	// Chicago
	google.maps.event.addDomListener(controlUI, 'click', function() {
		addMarker(map.getCenter());
	});
}

function addMarker(position){
	new google.maps.Marker({
		position: position,
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP
	});
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			createToileMarker(results[i]);
		}
	}
}

function createToileMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		icon: 'img/toile.png' ,
		position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		var infowindow = new google.maps.InfoWindow();	
		infowindow.setContent(
			'<div><p>' + place.name + '</p><input type="button" value="ここまでの道順" onClick="calcRoute(\'' + this.getPosition().Sa + '\',\'' + this.getPosition().Ta + '\')" />'
		);
		infowindow.open(map, this);
	});
}

function handleNoGeolocation(errorFlag) {
	var content = '';
	if (errorFlag) {
		content = 'Error: The Geolocation service failed.';
	} else {
		content = 'Error: Your browser doesn\'t support geolocation.';
	}

	var options = {
		map: map,
		position: new google.maps.LatLng(35.689488, 139.691706),
		content: content
	};

	var infowindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);