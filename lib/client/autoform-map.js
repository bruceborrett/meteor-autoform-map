AutoForm.addInputType('map', {
    template: 'afMap',
    valueOut: function () {
        let node = $(this.context);
        
        let lat = node.find('.js-lat').val();
        let lng = node.find('.js-lng').val();
        
        if ((lat != null ? lat.length : void 0) > 0 && (lng != null ? lng.length : void 0) > 0) {
            return {
                lat: lat,
                lng: lng
            };
        }
    },
    contextAdjust: function (ctx) {
        ctx.loading = new ReactiveVar(false);
        return ctx;
    },
    valueConverters: {
        string: function (value) {
            if (this.attr('reverse')) {
                return value.lng + "," + value.lat;
            } else {
                return value.lat + "," + value.lng;
            }
        },
        numberArray: function (value) {
            return [value.lng, value.lat];
        }
    }
});

let initTemplateAndGoogleMaps = function (tpl) {
    let defaults = {
        mapType: 'roadmap',
        defaultLat: 1,
        defaultLng: 1,
        geolocation: false,
        searchBox: false,
        autolocate: false,
        zoom: 1
    };
    
    tpl.options = _.extend({}, defaults, tpl.data.atts);
    tpl.data.marker = void 0;
    
    tpl.setMarker = function (map, location, zoom) {
        if (zoom == null) {
            zoom = 0;
        }
        
        tpl.$('.js-lat').val(location.lat());
        tpl.$('.js-lng').val(location.lng());
        
        if (tpl.data.marker) {
            tpl.data.marker.setMap(null);
        }
        
        tpl.data.marker = new google.maps.Marker({
            position: location,
            map: map
        });
        
        if (zoom > 0) {
            tpl.map.setZoom(zoom);
        }
    };
    
    let mapOptions = {
        zoom: 0,
        mapTypeId: google.maps.MapTypeId[tpl.options.mapType],
        streetViewControl: false
    };
    
    if (tpl.data.atts.googleMap) {
        _.extend(mapOptions, tpl.data.atts.googleMap);
    }

    tpl.map = new google.maps.Map(tpl.find('.js-map'), mapOptions);
    tpl.map.setCenter(new google.maps.LatLng(tpl.options.defaultLat, tpl.options.defaultLng));
    tpl.map.setZoom(tpl.options.zoom);
    
    if (tpl.data.atts.searchBox) {
        let input = tpl.find('.js-search');
        
        tpl.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        let searchBox = new google.maps.places.SearchBox(input);
        
        google.maps.event.addListener(searchBox, 'places_changed', function () {
            let location = searchBox.getPlaces()[0].geometry.location;
            tpl.setMarker(tpl.map, location);
            tpl.map.setCenter(location);
        });
        
        $(input).removeClass('af-map-search-box-hidden');
    }
    
    if (tpl.data.atts.autolocate && navigator.geolocation && !tpl.data.value) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            tpl.setMarker(tpl.map, location, tpl.options.zoom);
            tpl.map.setCenter(location);
        });
    }
    
    if (typeof tpl.data.atts.rendered === 'function') {
        tpl.data.atts.rendered(tpl.map);
    }
    
    google.maps.event.addListener(tpl.map, 'click', function (e) {
        tpl.setMarker(tpl.map, e.latLng);
    });
    
    tpl.$('.js-map').closest('form').on('reset', function () {
        var ref;
        tpl.data.marker && tpl.data.marker.setMap(null);
        tpl.map.setCenter(new google.maps.LatLng(tpl.options.defaultLat, tpl.options.defaultLng));
        tpl.map.setZoom(((ref = tpl.options) != null ? ref.zoom : void 0) || 0);
    });
    
    tpl.mapReady.set(true);
};

Template.afMap.onCreated(function () {
    let tpl = this;
    
    tpl.mapReady = new ReactiveVar(false);
    
    GoogleMaps.load({
        libraries: 'places'
    });

    tpl._stopInterceptValue = false;
    
    tpl._interceptValue = function (ctx) {
        var location;
        
        if (tpl.mapReady.get() && ctx.value && !tpl._stopInterceptValue) {
            location = typeof ctx.value === 'string' ? ctx.value.split(',') : ctx.value.hasOwnProperty('lat') ? [ctx.value.lat, ctx.value.lng] : [ctx.value[1], ctx.value[0]];
            location = new google.maps.LatLng(parseFloat(location[0]), parseFloat(location[1]));
            tpl.setMarker(tpl.map, location, tpl.options.zoom);
            tpl.map.setCenter(location);
            tpl._stopInterceptValue = true;
        }
    };
});

Template.afMap.onRendered(function () {
    let tpl = this;
    console.log(tpl);
    tpl.autorun(function () {
        if (GoogleMaps.loaded()) {
            initTemplateAndGoogleMaps(tpl);          
        }
    });
});

Template.afMap.helpers({
    schemaKey: function () {
        Template.instance()._interceptValue(this);
        return this.atts['data-schema-key'];
    },
    width: function () {
        if (typeof this.atts.width === 'string') {
            return this.atts.width;
        } else if (typeof this.atts.width === 'number') {
            return this.atts.width + 'px';
        } else {
            return '100%';
        }
    },
    height: function () {
        if (typeof this.atts.height === 'string') {
            return this.atts.height;
        } else if (typeof this.atts.height === 'number') {
            return this.atts.height + 'px';
        } else {
            return '200px';
        }
    },
    loading: function () {
        return this.loading.get();
    }
});

Template.afMap.events({
    'click .js-locate': function (e, tpl) {
        e.preventDefault();
        
        if (!navigator.geolocation) {
            return false;
        }
        
        tpl.loading.set(true);
                
        navigator.geolocation.getCurrentPosition(function (position) {
            var location, ref;
            location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            tpl.setMarker(tpl.map, location, (ref = tpl.options) != null ? ref.zoom : void 0);
            tpl.map.setCenter(location);
            tpl.loading.set(false);
        });
    },
    'keydown .js-search': function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }
});
