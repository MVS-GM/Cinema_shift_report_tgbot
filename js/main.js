import { calculateShift, calculateOvertimeCost } from './calculations.js';
import { saveToHistory, updateHistory, deleteFromHistory, loadHistory } from './storage.js';
import { fillForm, fillEditForm, addTransport, addEquipment, formatReport, formatDateTimeForDisplay, formatTime } from './ui.js';

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let currentEditIndex = null;

// Привязка событий для вкладок
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
});

// Привязка остальных событий
document.getElementById('calculateBtn').addEventListener('click', () => calculateShift(saveToHistory, tg));
document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
document.getElementById('addTransportBtn').addEventListener('click', () => addTransport('transportList'));
document.getElementById('addEquipmentBtn').addEventListener('click', () => addEquipment('equipmentList'));
document.getElementById('editAddTransportBtn').addEventListener('click', () => addTransport('editTransportList'));
document.getElementById('editAddEquipmentBtn').addEventListener('click', () => addEquipment('editEquipmentList'));

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'history') loadHistory(editEntry, copyEntry, deleteFromHistory);
}

function editEntry(index) {
    const history = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
    const entry = history[index];
    currentEditIndex = index;
    fillEditForm(entry);
    document.getElementById('editTab').classList.remove('hidden');
    showTab('edit');
}

function copyEntry(index) {
    const history = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
    const entry = history[index];
    fillForm(entry);
    showTab('calculation');
}

function saveEdit() {
    const project = document.getElementById("editProject").value;
    const firstName = document.getElementById("editFirstName").value;
    const lastName = document.getElementById("editLastName").value;
    const position = document.getElementById("editPosition").value;
    let baseShift = parseFloat(document.getElementById("editBaseShift").value);
    const startTimeInput = document.getElementById("editStartTime").value;
    const endTimeInput = document.getElementById("editEndTime").value;
    const shiftCost = parseFloat(document.getElementById("editShiftCost").value);
    const overtimeCost = parseFloat(document.getElementById("editOvertimeCost").value);
    const lunchBreak = document.getElementById("editLunchBreak").checked;
    const loadingCost = parseFloat(document.getElementById("editLoadingCost").value) || 0;
    const resultDiv = document.getElementById("editResult");

    // Валидация
    if (!project || !firstName || !lastName || !position || !baseShift || !shiftCost || !overtimeCost || !startTimeInput || !endTimeInput) {
        resultDiv.innerHTML = "Пожалуйста, заполните все обязательные поля корректно.";
        return;
    }

    const startTime = new Date(startTimeInput);
    const endTime = new Date(endTimeInput);
    if (endTime <= startTime) {
        resultDiv.innerHTML = "Время окончания должно быть позже начала.";
        return;
    }

    // Проверка ночной смены (16:00 - 03:59)
    const startHour = startTime.getHours();
    const isNightShift = (startHour >= 16 || startHour < 4);
    if (isNightShift) {
        baseShift -= 1;
    }

    // Расчет времени на основе введенных значений
    const diffMs = endTime - startTime;
    const totalHours = diffMs / (1000 * 60 * 60);
    let overtime = totalHours > baseShift ? totalHours - baseShift : 0;
    if (lunchBreak) overtime += 1;

    // Расчет стоимости с прогрессивной шкалой
    const baseShiftCost = shiftCost;
    const overtimeResult = calculateOvertimeCost(overtime, overtimeCost);
    const overtimeTotalCost = overtimeResult.totalCost;
    const overtimeBreakdown = overtimeResult.breakdown;

    let transportCost = 0;
    const transportItems = [];
    document.querySelectorAll("#editTransportList .item").forEach(item => {
        const name = item.querySelector(".transport-name").value;
        const cost = parseFloat(item.querySelector(".transport-cost").value) || 0;
        if (name || cost) {
            transportItems.push({ name, cost });
            transportCost += cost;
        }
    });

    let equipmentCost = 0;
    const equipmentItems = [];
    document.querySelectorAll("#editEquipmentList .item").forEach(item => {
        const name = item.querySelector(".equipment-name").value;
        const cost = parseFloat(item.querySelector(".equipment-cost").value) || 0;
        if (name || cost) {
            equipmentItems.push({ name, cost });
            equipmentCost += cost;
        }
    });

    const totalCost = baseShiftCost + overtimeTotalCost + loadingCost + transportCost + equipmentCost;

    // Данные для обновления с учетом введенного времени
    const data = {
        project,
        firstName,
        lastName,
        position,
        baseShift,
        isNightShift,
        startTime: startTimeInput,
        endTime: endTimeInput,
        totalHours: totalHours.toFixed(2),
        overtime: overtime.toFixed(2),
        shiftCost,
        overtimeCost,
        lunchBreak,
        loadingCost,
        transport: transportItems,
        equipment: equipmentItems,
        overtimeBreakdown: overtimeBreakdown,
        totalCost: totalCost.toFixed(2)
    };

    resultDiv.innerHTML = formatReport(data); // Показываем результат перед сохранением
    updateHistory(currentEditIndex, data);
    document.getElementById('editTab').classList.add('hidden');
    showTab('history');
    currentEditIndex = null;
}

export { editEntry, copyEntry, saveEdit, currentEditIndex };
