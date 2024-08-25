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

    map.on('click', function (position) {
      const { lat, lng } = position.latlng;
      const pointCoords = [lat, lng];
      form.classList.remove('hidden');
      inputDistance.focus();
      inputType.addEventListener('change', function () {
        inputCadence.parentElement.classList.toggle('form__row--hidden');
        inputElevation.parentElement.classList.toggle('form__row--hidden');
        console.log(inputCadence.parentElement);
        console.log(inputCadence.parentNode);
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        inputDistance.value =
          inputDuration.value =
          inputCadence.value =
          inputElevation.value =
            '';
        L.marker(pointCoords)
          .addTo(map)
          .bindPopup(
            L.popup({
              content: 'Тренировка',
              autoClose: false,
              className: 'running-popup',
              closeOnClick: false,
            })
          )
          .openPopup();
      });
    }),
      function () {
        alert('Ваша геолокация не смогла быть загружена');
      };
  });
}
