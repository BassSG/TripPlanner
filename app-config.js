/** PUBLIC SETTINGS ONLY. API secrets go in GAS Script Properties (see apps-script/Code.gs). */
window.TRIP_APP_CONFIG = Object.freeze({
  appName: 'TripPlanner',
  version: '8.4.0',
  /** Public, keyless map services. Set a compatible Photon host and tile URL here if needed. */
  placeSearchUrl: 'https://photon.komoot.io',
  mapTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  gasUrl: 'https://script.google.com/macros/s/AKfycbzQvAenA1EFR85qv5CTy88BxJIR0EL0KKm7GWkY5lFnLWZJdQBpsV7rcjGumQyYCxvfgw/exec',
  gasEditorUrl: 'https://script.google.com/home/projects/1KMuYaHImc-CAzdRQwJye8kYO27sYch9QSjqb-_OaSDkfJFHZNTonprU6/edit',
  githubUrl: 'https://github.com/BassSG/TripPlanner',
  webUrl: 'https://basssg.github.io/TripPlanner/',
  maxSavedPlans: 30,
  connectTimeoutMs: 30000,
  requestTimeoutMs: 300000
});
