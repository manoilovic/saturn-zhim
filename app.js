import {parseWeight, parseRepetitions, oneRepMax, weightForRepetitions} from './calculator.js';
const $ = id => document.getElementById(id);
const storageKey = 'saturn-zhim-approach-v1';
const number = new Intl.NumberFormat('ru-RU', {minimumFractionDigits:1, maximumFractionDigits:1});
const tableNumber = new Intl.NumberFormat('ru-RU', {maximumFractionDigits:2});
let persisted = true;
function save(data) { try { localStorage.setItem(storageKey, JSON.stringify(data)); return true; } catch { return false; } }
function readSaved() {
  try { const data = JSON.parse(localStorage.getItem(storageKey)); return data && typeof data.weight === 'string' && typeof data.repetitions === 'string' ? data : null; } catch { return null; }
}
function render(weight, repetitions, announce = true) {
  const maximum = oneRepMax(weight, repetitions);
  $('maximum').replaceChildren(document.createTextNode(number.format(maximum) + ' '));
  const unit = document.createElement('span'); unit.textContent = 'кг'; $('maximum').append(unit);
  $('approach').textContent = number.format(weight) + ' кг × ' + repetitions;
  $('result-ring').classList.add('is-calculated');
  const fragment = document.createDocumentFragment();
  for (let r = 1; r <= 20; r++) {
    const row = document.createElement('tr');
    if (r === repetitions) { row.className = 'selected'; row.setAttribute('aria-label', 'Твой подход'); }
    const repsCell = document.createElement('td'); repsCell.textContent = r;
    const weightCell = document.createElement('td'); weightCell.textContent = tableNumber.format(weightForRepetitions(maximum, r));
    row.append(repsCell, weightCell); fragment.append(row);
  }
  $('table-body').replaceChildren(fragment);
  $('breakdown').hidden = false;
  $('table-hint').hidden = repetitions <= 20;
  if (announce) $('status-text').textContent = persisted ? 'Расчёт сохранён · максимум ' + number.format(maximum) + ' кг' : 'Максимум ' + number.format(maximum) + ' кг · сохранение недоступно';
}
$('calculator').addEventListener('submit', event => {
  event.preventDefault();
  const weight = parseWeight($('weight').value), repetitions = parseRepetitions($('repetitions').value);
  for (const [id, valid] of [['weight', weight !== null], ['repetitions', repetitions !== null]]) {
    $(id).setAttribute('aria-invalid', String(!valid)); $(id + '-error').hidden = valid;
  }
  if (weight === null || repetitions === null) { (weight === null ? $('weight') : $('repetitions')).focus(); return; }
  persisted = save({weight:$('weight').value.trim(), repetitions:$('repetitions').value.trim()});
  render(weight, repetitions);
  document.activeElement?.blur();
});
for (const id of ['weight', 'repetitions']) {
  $(id).addEventListener('input', () => {
    $(id).removeAttribute('aria-invalid'); $(id + '-error').hidden = true;
    if ($('result-ring').classList.contains('is-calculated')) $('status-text').textContent = 'Подход изменён — нажми «Рассчитать максимум»';
  });
}
const saved = readSaved();
if (saved) {
  const weight = parseWeight(saved.weight), repetitions = parseRepetitions(saved.repetitions);
  if (weight !== null && repetitions !== null) {
    $('weight').value = saved.weight; $('repetitions').value = saved.repetitions;
    render(weight, repetitions, false);
    $('status-text').textContent = 'Последний расчёт восстановлен';
  }
}
const installSeenKey = 'saturn-zhim-install-seen-v1';
const trigger = $('install-trigger'), dialog = $('install-dialog');
function compactInstall() {
  trigger.classList.add('is-seen');
  $('install-label').textContent = 'Установка на iPhone';
}
try { if (localStorage.getItem(installSeenKey) === '1') compactInstall(); } catch {}
if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) trigger.hidden = true;
trigger.addEventListener('click', () => {
  compactInstall();
  try { localStorage.setItem(installSeenKey, '1'); } catch {}
  dialog.classList.remove('is-closing');
  dialog.showModal();
});
let closingDialog = false;
function closeInstall() {
  if (closingDialog || !dialog.open) return;
  closingDialog = true;
  dialog.classList.add('is-closing');
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
  window.setTimeout(() => { dialog.close(); dialog.classList.remove('is-closing'); closingDialog = false; }, delay);
}
$('install-close').addEventListener('click', closeInstall);
$('install-done').addEventListener('click', closeInstall);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeInstall(); });
dialog.addEventListener('click', event => { if (event.target === dialog) closeInstall(); });
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
    $('offline-state').textContent = 'Готово к работе без интернета';
  }).catch(() => { $('offline-state').textContent = 'Офлайн-режим недоступен в этом браузере'; });
}

