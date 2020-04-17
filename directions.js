var placeSearch, originautocomplete, selectedVan;
var distance;
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name',
};

function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    originautocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById('originautocomplete')),
        {
            types: ['geocode'],
        }
    );
    // Set initial restrict to the greater list of countries.
    originautocomplete.setComponentRestrictions({
        country: ['gb'],
    });

    destinationautocomplete = new google.maps.places.Autocomplete(
        document.getElementById('destinationautocomplete'),
        {
            types: ['geocode'],
        }
    );

    destinationautocomplete.setComponentRestrictions({
        country: ['gb'],
    });
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy,
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}

function selectVan(typeOfVan) {
    selectedVan = typeOfVan;
}

function convertKilometersToMiles(valueKilometers) {
    return valueKilometers * 0.62137;
}

function getMultiplyValue(typeOfVan, distance) {
    if (distance <= 35) {
        return 0;
    } else if (typeOfVan === 'svan') {
        if (distance > 35 && distance <= 50) {
            return 0.90;
        } else {
            return 0.75;
        }
    } else if (typeOfVan === 'mvan') {
        if (distance > 35) {
            return 0.95;
        }
    } else if (typeOfVan === 'lvan') {
        if (distance > 35 && distance <= 50) {
            return 1.30;
        } else {
            return 0.95;
        }
    } else if (typeOfVan === 'xlvan') {
        if (distance > 35 && distance <= 50) {
            return 1.50;
        } else {
            return 1.20;
        }
    }
}

function clearFields() {
    document.getElementById('originautocomplete').value = null;
    document.getElementById('destinationautocomplete').value = null;
    var radios = document.getElementsByName("selectedvan");
    for (var i = 0; i < radios.length; i++)
        radios[i].checked = false;
}

function calculatePrice() {
    var outputDivError = document.querySelector('#errorMesasge');
    var outputDivPrice = document.querySelector('#totalPrice')
    var origin = document.getElementById('originautocomplete').value;
    var destination = document.getElementById('destinationautocomplete').value;
    var geocoder = new google.maps.Geocoder();
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false,
            avoidFerries: false,
        },
        function (response, status) {
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;
            if (originList[0].length > 0 && destinationList[0].length > 0 && selectedVan) {
                //Display distance recommended value
                for (var i = 0; i < originList.length; i++) {
                    var results = response.rows[i].elements;
                    for (var j = 0; j < results.length; j++) {
                        distance = convertKilometersToMiles(results[j].distance.value / 1000);
                        var multiplyValue = getMultiplyValue(selectedVan, distance);
                        if (multiplyValue > 0) {
                            var totalPrice = distance * multiplyValue;
                            outputDivPrice.innerHTML = 'Delivery fee for ' + distance.toFixed(2) + " miles is " + totalPrice.toFixed(2);
                        } else {
                            outputDivPrice.innerHTML = "Please call the company for a special quote because your distance is less than 35 miles. Thank you.";
                        }
                        outputDivError.innerHTML = null;
                    }
                }
                clearFields();
            } else {
                outputDivPrice.innerHTML = null;
                outputDivError.innerHTML = 'Please use correct values for pick up and drop off addresses and select one type of vans';
            }
        }
    );
}