var KEY_ENTER, defaults, initTemplateAndGoogleMaps;

KEY_ENTER = 13;

defaults = {
    mapType: 'roadmap',
    defaultLat: 1,
    defaultLng: 1,
    geolocation: false,
    searchBox: false,
    autolocate: false,
    zoom: 1
};

AutoForm.addInputType('map', {
    template: 'afMap',
    valueOut: function () {
        var lat, lng, node;
        
        node = $(this.context);
        
        lat = node.find('.js-lat').val();
        lng = node.find('.js-lng').val();
        
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

initTemplateAndGoogleMaps = function () {
    var input, mapOptions, searchBox;
    
    this.options = _.extend({}, defaults, this.data.atts);
    this.data.marker = void 0;
    
    this.setMarker = (function(_this) {
        return function(map, location, zoom) {
            if (zoom == null) {
                zoom = 0;
            }
            
            _this.$('.js-lat').val(location.lat());
            _this.$('.js-lng').val(location.lng());
            
            if (_this.data.marker) {
                _this.data.marker.setMap(null);
            }
            
            _this.data.marker = new google.maps.Marker({
                position: location,
                map: map
            });
            
            if (zoom > 0) {
                return _this.map.setZoom(zoom);
            }
        };
    })(this);
    
    mapOptions = {
        zoom: 0,
        mapTypeId: google.maps.MapTypeId[this.options.mapType],
        streetViewControl: false
    };
    
    if (this.data.atts.googleMap) {
        _.extend(mapOptions, this.data.atts.googleMap);
    }
    
    this.map = new google.maps.Map(this.find('.js-map'), mapOptions);
    this.map.setCenter(new google.maps.LatLng(this.options.defaultLat, this.options.defaultLng));
    this.map.setZoom(this.options.zoom);
    
    if (this.data.atts.searchBox) {
        input = this.find('.js-search');
        
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        searchBox = new google.maps.places.SearchBox(input);
        
        google.maps.event.addListener(searchBox, 'places_changed', (function(_this) {
            return function() {
                var location;
                location = searchBox.getPlaces()[0].geometry.location;
                _this.setMarker(_this.map, location);
                return _this.map.setCenter(location);
            };
        })(this));
        
        $(input).removeClass('af-map-search-box-hidden');
    }
    
    if (this.data.atts.autolocate && navigator.geolocation && !this.data.value) {
        navigator.geolocation.getCurrentPosition((function(_this) {
            return function(position) {
                var location;
                location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                _this.setMarker(_this.map, location, _this.options.zoom);
                return _this.map.setCenter(location);
            };
        })(this));
    }
    
    if (typeof this.data.atts.rendered === 'function') {
        this.data.atts.rendered(this.map);
    }
    
    google.maps.event.addListener(this.map, 'click', (function(_this) {
        return function(e) {
            return _this.setMarker(_this.map, e.latLng);
        };
    })(this));
    
    this.$('.js-map').closest('form').on('reset', (function(_this) {
        return function() {
            var ref;
            _this.data.marker && _this.data.marker.setMap(null);
            _this.map.setCenter(new google.maps.LatLng(_this.options.defaultLat, _this.options.defaultLng));
            return _this.map.setZoom(((ref = _this.options) != null ? ref.zoom : void 0) || 0);
        };
    })(this));
    
    return this.mapReady.set(true);
};

Template.afMap.onCreated(function () {
    this.mapReady = new ReactiveVar(false);
    
    GoogleMaps.load({
        libraries: 'places'
    });

    this._stopInterceptValue = false;
    
    return this._interceptValue = function (ctx) {
        var location, t;
        
        t = Template.instance();
        
        if (t.mapReady.get() && ctx.value && !t._stopInterceptValue) {
            location = typeof ctx.value === 'string' ? ctx.value.split(',') : ctx.value.hasOwnProperty('lat') ? [ctx.value.lat, ctx.value.lng] : [ctx.value[1], ctx.value[0]];
            location = new google.maps.LatLng(parseFloat(location[0]), parseFloat(location[1]));
            t.setMarker(t.map, location, t.options.zoom);
            t.map.setCenter(location);
            return t._stopInterceptValue = true;
        }
    };
});

Template.afMap.onRendered(function () {
    return this.autorun((function (_this) {
        return function () {
            return GoogleMaps.loaded() && initTemplateAndGoogleMaps.apply(_this);
        };
    })(this));
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
        
        this.loading.set(true);
                
        return navigator.geolocation.getCurrentPosition((function(_this) {
            return function(position) {
                var location, ref;
                location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                tpl.setMarker(tpl.map, location, (ref = _this.options) != null ? ref.zoom : void 0);
                tpl.map.setCenter(location);
                return _this.loading.set(false);
            };
        })(this));
    },
    'keydown .js-search': function (e) {
        if (e.keyCode === KEY_ENTER) {
            return e.preventDefault();
        }
    }
});
