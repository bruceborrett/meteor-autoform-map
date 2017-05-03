Package.describe({
  name: 'bruceborrett:autoform-map',
  summary: 'Edit location coordinates with autoForm',
  version: '0.5.0',
  git: 'https://github.com/bruceborrett/meteor-autoform-map'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use([
  	'templating',
    'reactive-var',
  	'aldeed:autoform@5.6.0',
  	'ecmascript@0.5.8'
  ], 'client');

  api.imply([
    'dburles:google-maps@1.1.5'
  ], 'client');

  api.addFiles([
  	'lib/client/autoform-map.html',
    'lib/client/autoform-map.css',
  	'lib/client/autoform-map.js'
  ], 'client');
});
