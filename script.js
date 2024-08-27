'use strict';
import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');
const sidebar = document.querySelector('.sidebar');
const btnTrash = document.querySelector('.btn--trash');

class App {
  #mapEvent;
  #map;
  #workouts = [];

  constructor() {
    this.click = 0;
    this.timeOut = 0;
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    sidebar.addEventListener('click', this._hideWorkoutForm.bind(this));
    inputType.addEventListener('change', this._toggleClimbField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));
    this._getLocalStorageData();
    btnTrash.addEventListener('click', this._deleteAllWorkouts.bind(this));
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
    this.#workouts.forEach(workout => this._showPoint(workout));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    form.classList.add('hidden');
  }

  _toggleClimbField() {
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;

    const areNumbers = (...numbers) =>
      numbers.every(num => Number.isFinite(num));
    const areNumbersPositive = (...numbers) => numbers.every(num => num > 0);

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !areNumbers(distance, duration, cadence) ||
        !areNumbersPositive(distance, duration, cadence)
      )
        return alert('Введите положительное число!');
      workout = new Running(distance, duration, [lat, lng], cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !areNumbers(distance, duration, elevation) ||
        !areNumbersPositive(distance, duration)
      )
        return alert('Введите положительное число!');
      workout = new Cycling(distance, duration, [lat, lng], elevation);
    }
    this._showPoint(workout);
    this.#workouts.push(workout);
    this._addWorkoutsToLocalStorage.call(this);
    this._displayWorkoutToSidebar(workout);
    this._hideForm();
  }
  _showPoint(workout) {
    // CUSTOM ICON OF THE POPUP
    // const LeafIcon = L.Icon.extend({
    //   options: {
    //     iconSize: [64, 64],
    //     shadowSize: [51, 37],
    //     iconAnchor: [32, 37],
    //     shadowAnchor: [16, 37],
    //     popupAnchor: [0, -30],
    //   },
    // });
    // const icon = new LeafIcon({ iconUrl: './popup-img.png' });
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          content: `${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${
            workout.date
          }`,
          maxWidth: 110,
          maxHeight: 30,
          autoClose: false,
          className: `${workout.type}-popup`,
          closeOnClick: false,
        })
      )
      .openPopup();
  }
  _displayWorkoutToSidebar(workout) {
    const html = `<li class="workout workout--running" data-id="${workout._id}">
          <h2 class="workout__title">${
            workout.type === 'running' ? 'Пробежка' : 'Велотренировка'
          } ${workout.date}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃' : '🚵‍♂️'
            }</span>
            <span class="workout__value">${+workout.distance.toFixed(2)}</span>
            <span class="workout__unit">км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${Math.round(workout.duration)}</span>
            <span class="workout__unit">мин</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">📏</span>
            <span class="workout__value">${
              workout.type === 'running'
                ? `${+workout.pace.toFixed(2)}`
                : `${+workout.speed.toFixed(2)}`
            }</span>
            <span class="workout__unit">${
              workout.type === 'running' ? 'мин/км' : 'км/ч'
            }</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '⏱' : '🏔'
            }</span>
            <span class="workout__value">${
              workout.type === 'running'
                ? `${Math.round(workout.temp)}`
                : `${Math.round(workout.climb)}`
            }</span>
            <span class="workout__unit">${
              workout.type === 'running' ? 'шаг/мин' : 'м'
            }</span>
          </div>
        </li>`;
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToWorkout(e) {
    const workoutELement = e.target.closest('.workout');
    if (!workoutELement) return;
    this.click++;
    this.timeOut;
    if (this.click === 1) {
      this.timeOut = setTimeout(() => {
        const workout = this.#workouts.find(
          item => item._id == workoutELement.dataset.id
        );
        workout.click();
        this.#map.setView(workout.coords, 13, {
          animate: true,
          pan: {
            duration: 1,
          },
        });
        this.click = 0;
      }, 200);
    } else {
      this.click = 0;
      clearTimeout(this.timeOut);
      this._deleteWorkout.call(this, e);
    }
  }

  _addWorkoutsToLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorageData() {
    const localDate = JSON.parse(localStorage.getItem('workouts'));
    if (!localDate) return;
    localDate.forEach(date => {
      if (date.type === 'running') {
        this.#workouts.push(
          new Running(date.distance, date.duration, date.coords, date.temp)
        );
      }
      if (date.type === 'cycling') {
        this.#workouts.push(
          new Cycling(date.distance, date.duration, date.coords, date.climb)
        );
      }
    });

    this.#workouts.forEach(work => this._displayWorkoutToSidebar(work));
  }

  _reset() {
    localStorage.removeItem('workouts');
  }

  _deleteWorkout(e) {
    const workoutELement = e.target.closest('.workout');
    if (!workoutELement) return;
    const workoutIndex = this.#workouts.findIndex(
      item => item._id == workoutELement.dataset.id
    );
    this.#workouts.splice(workoutIndex, 1);
    this._reset();
    workoutELement.remove();
    this._addWorkoutsToLocalStorage();
    location.reload();
  }

  _deleteWorkoutPoint(workout) {}

  _clearAll(elements) {
    elements.forEach(el => el.remove());
  }

  _hideWorkoutForm(e) {
    if (
      e.target.classList.contains('sidebar') ||
      e.target.classList.contains('workouts') ||
      e.target.classList.contains('footer__copyright') ||
      e.target.classList.contains('icon')
    ) {
      form.classList.add('hidden');
    } else {
      return;
    }
  }

  _deleteAllWorkouts() {
    this._reset();
    location.reload();
  }
}

class Workout {
  _id = nanoid();
  clickNumber = 0;

  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = new Intl.DateTimeFormat('ru-RU').format(new Date());
  }

  click() {
    this.clickNumber++;
  }
}

class Running extends Workout {
  type = 'running';
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
  type = 'cycling';
  constructor(distance, duration, coords, climb) {
    super(distance, duration, coords);
    this.climb = climb;
    this.calculateSpeed();
  }
  calculateSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

const app = new App();
