const STORAGE_KEY = 'contador_vasos_v1';
const GOAL = 8; // meta fija de 7 vasos

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function saveAll(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const datePicker = document.getElementById('datePicker');
const countEl = document.getElementById('count');
const addBtn = document.getElementById('add');
const decrBtn = document.getElementById('decr');
const prevDay = document.getElementById('prevDay');
const nextDay = document.getElementById('nextDay');
const resetDay = document.getElementById('resetDay');
const resetAll = document.getElementById('resetAll');
const todayLabel = document.getElementById('todayLabel');

// --- NUEVO: elementos de progreso ---
let progressBar, progressText;

// crea barra si no existe
function ensureProgressElements() {
  if (!progressBar) {
    const section = document.querySelector('.card');
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-wrapper';
    wrapper.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <div id="progressText" class="progress-text"></div>
    `;
    section.insertBefore(wrapper, section.querySelector('.big'));
    progressBar = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
  }
}

let store = loadAll();

function setDate(dateStr) {
  datePicker.value = dateStr;
  const isToday = dateStr === todayISO();
  todayLabel.textContent = isToday ? 'Hoy' : '';
  render();
}

function render() {
  ensureProgressElements();

  const key = datePicker.value;
  const val = store[key] || 0;
  countEl.textContent = val;

  // progreso visual
  const percent = Math.min((val / GOAL) * 100, 100);
  progressBar.style.width = percent + '%';
  progressBar.style.background =
    percent >= 100 ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#06b6d4,#3b82f6)';
  progressText.textContent =
    percent >= 100 ? 'Meta alcanzada 💧' : `Faltan ${Math.max(GOAL - val, 0)} vasos`;
}

function change(delta) {
  const key = datePicker.value;
  const current = store[key] || 0;
  let next = current + delta;
  if (next < 0) next = 0;
  store[key] = next;
  saveAll(store);
  render();
}

// events
addBtn.addEventListener('click', () => change(1));
decrBtn.addEventListener('click', () => change(-1));

prevDay.addEventListener('click', () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 1);
  setDate(d.toISOString().slice(0, 10));
});
nextDay.addEventListener('click', () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 1);
  setDate(d.toISOString().slice(0, 10));
});

goToday.addEventListener('click', () => {
  setDate(todayISO());
});

datePicker.addEventListener('change', render);

resetDay.addEventListener('click', () => {
  const key = datePicker.value;
  if (confirm('Resetear contador de hoy?')) {
    delete store[key];
    saveAll(store);
    render();
  }
});

resetAll.addEventListener('click', () => {
  if (confirm('Borrar todo el historial?')) {
    store = {};
    saveAll(store);
    render();
  }
});

// inicialización
setDate(todayISO());

// accesibilidad: soporte para teclado
document.addEventListener('keydown', (e) => {
  if (e.key === '+') change(1);
  if (e.key === '-') change(-1);
});
