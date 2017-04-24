Autoform map
============

Edit location coordinates with autoForm.

### Setup ###
1) Install `meteor add bruceborrett:autoform-map`

2) Define your schema and set the `autoform` property like in the example below
```javascript
Schemas = {};

Cities = new Meteor.Collection('cities');

Schemas.Cities = new SimpleSchema({
    name: {
        type: String,
        max: 60
    },
    location: {
        type: String,
        autoform: {
            type: 'map',
            afFieldInput: {
                  geolocation: true,
                  searchBox: true,
                  autolocate: true
            {
        }
    }
});

Cities.attachSchema(Schemas.Cities);
```

3) Initialise Google Maps with the places library BEFORE rendering the form. Eg. on startup:
```javascript
if (Meteor.isClient) {
    Meteor.startup(function () {
        GoogleMaps.load({
            key: Meteor.settings.public.myGoogleMapsApiKey,
            libraries: 'places'
        });
    });
}
```

or in template created callback:
```javascript
Template.myExampleForm.onCreated(function () {
    GoogleMaps.load({
        key: Meteor.settings.public.myGoogleMapsApiKey,
        libraries: 'places'
    });
});
```

For more info see https://github.com/dburles/meteor-google-maps#usage-overview

4) Generate the form with `{{> quickform}}` or `{{#autoform}}`

e.g.
```handlebars
{{> quickForm collection="Cities" type="insert"}}
```

or

```handlebars
{{#autoForm collection="Cities" type="insert"}}
    {{> afQuickField name="name"}}
    {{> afQuickField name="location"}}
    <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}
```

Coordinates will be saved as string in format `latititude,longitude`. Alternatively it can be an object. See schema below:

```javascript
new SimpleSchema({
    location: {
        type: Object,
        autoform: {
            type: 'map',
            afFieldInput: {
                // options
            }
        }
    },
    'location.lat': {
        type: String
    },
    'location.lng': {
        type: String
    }
});
```

Or if you want to save lat and lng as a number:

```javascript
new SimpleSchema({
    location: {
        type: Object,
        autoform: {
            type: 'map',
            afFieldInput: {
                // options
            },
        },
    },
    'location.lat': {
        type: Number,
        decimal: true
    },
    'location.lng': {
        type: Number,
        decimal: true
    }
});
```

Or if you want to save lat and lng as a array, important for GEOJson:

```javascript
new SimpleSchema({
    location: {
        type: [Number],
        decimal: true,
        autoform: {
            type: 'map',
            afFieldInput: {
                // options
            }
        }
    }
});
```

### Options ###

**mapType** type of google map. Possible values: `'roadmap' 'satellite' 'hybrid' 'terrain'`. Defaults to `'roadmap'`

**width** **height** valid css values for width and height attributes of map. Default width is set to `'100%'` and height is `'200px'`

**defaultLat** default latitude. Defaults to `1`
**defaultLng** default longitude. Defaults to `1`

**geolocation** enables or disables geolocation feature. Defaults to `false`

**searchBox** enables or disables search box. Defaults to `false`

**zoom** zoom of the map. Defaults to `1`

**autolocate** if set to `true` will automatically ask for user's location. Defaults to `false`

**googleMap** google maps specific [options](https://developers.google.com/maps/documentation/javascript/reference#MapOptions).

**onRendered** function called when map is rendered. [google.maps.Map](https://developers.google.com/maps/documentation/javascript/reference#Map) will be passed as an argument.

**onPlaceChanged** function called when selected place has changed either by clicking on the map or selecting a place from the searchbox. A single object is passed to the function. The object contains the formatted address and the latlng coordinates of the selected place.

**reverse** if set to `true` lat.lng will be reversed to lng.lat. Works only with strings.


### Credits ###
This package is a fork of [yogiben:autoform-map](https://github.com/yogiben/meteor-autoform-map) with the following differences:
* Rewritten in plain javascript.
* Removed Google Maps initialization.
* Update searchbox when clicking on map.
* Added callback for when a new place has been selected.
* Improved readme.
* Updated to be compatible with Meteor 1.4

