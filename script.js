'use strict';
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');

class App {
  #workouts;
  #mapEvent;
  #map;

  constructor() {
    this._getPosition();
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this));
    } else {
      alert('Ваша геолокация не смогла быть загружена');
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
    inputType.addEventListener('change', this._toggleClimbField.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
  }

  _toggleClimbField() {
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          content: 'Тренировка',
          autoClose: false,
          className: 'running-popup',
          closeOnClick: false,
        })
      )
      .openPopup();
  }
}

class Workout {
  #id = nanoid();

  constructor(distance, duration, coords, date, name) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = date;
    this.name = name;
  }
}

class Running extends Workout {
  constructor(distance, duration, coords, temp) {
    super(distance, duration, coords);
    this.temp = temp;
    this.calculatePace();
  }
  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(distance, duration, coords, climb) {
    super(distance, duration, coords);
    this.climb = climb;
    this.calculateSpeed();
  }
  calculateSpeed() {
    this.speed = this.distance / this.duration / 60;
  }
}

const app = new App();
