'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    const map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker(coords)
      .addTo(map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();
  }),
    function () {
      alert('Ваша геолокация не смогла быть загружена');
    };
}
