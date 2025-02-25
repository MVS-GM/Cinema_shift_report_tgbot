import { calculateOvertimeCost } from './calculations.js';

function addTransport(listId) {
    const transportList = document.getElementById(listId);
    const newItem = document.createElement("div");
    newItem.className = "item";
    newItem.innerHTML = `
        <input type="text" class="transport-name" placeholder="Название">
        <input type="number" class="transport-cost" min="0" step="1" placeholder="Стоимость">
    `;
    transportList.appendChild(newItem);
}

function addEquipment(listId) {
    const equipmentList = document.getElementById(listId);
    const newItem = document.createElement("div");
    newItem.className = "item";
    newItem.innerHTML = `
        <input type="text" class="equipment-name" placeholder="Название">
        <input type="number" class="equipment-cost" min="0" step="1" placeholder="Стоимость">
    `;
    equipmentList.appendChild(newItem);
}

function formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ч ${m} мин`;
}

function formatDateTimeForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTimeForDisplay(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
}

function fillForm(data, formPrefix = '') {
    document.getElementById(`${formPrefix}project`).value = data.project;
    document.getElementById(`${formPrefix}firstName`).value = data.firstName;
    document.getElementById(`${formPrefix}lastName`).value = data.lastName;
    document.getElementById(`${formPrefix}position`).value = data.position;
    document.getElementById(`${formPrefix}baseShift`).value = data.baseShift;
    document.getElementById(`${formPrefix}startTime`).value = formatDateTimeForInput(data.startTime);
    document.getElementById(`${formPrefix}endTime`).value = formatDateTimeForInput(data.endTime);
    document.getElementById(`${formPrefix}shiftCost`).value = data.shiftCost;
    document.getElementById(`${formPrefix}overtimeCost`).value = data.overtimeCost;
    document.getElementById(`${formPrefix}lunchBreak`).checked = data.lunchBreak;
    document.getElementById(`${formPrefix}loadingCost`).value = data.loadingCost;

    const transportList = document.getElementById(`${formPrefix}transportList`);
    transportList.innerHTML = '';
    data.transport.forEach(item => {
        const newItem = document.createElement("div");
        newItem.className = "item";
        newItem.innerHTML = `
            <input type="text" class="transport-name" value="${item.name}">
            <input type="number" class="transport-cost" min="0" step="1" value="${item.cost}">
        `;
        transportList.appendChild(newItem);
    });

    const equipmentList = document.getElementById(`${formPrefix}equipmentList`);
    equipmentList.innerHTML = '';
    data.equipment.forEach(item => {
        const newItem = document.createElement("div");
        newItem.className = "item";
        newItem.innerHTML = `
            <input type="text" class="equipment-name" value="${item.name}">
            <input type="number" class="equipment-cost" min="0" step="1" value="${item.cost}">
        `;
        equipmentList.appendChild(newItem);
    });
}

function fillEditForm(data) {
    fillForm(data, 'edit');
}

function formatReport(data) {
    const totalTimeFormatted = formatTime(data.totalHours);
    const overtimeFormatted = formatTime(data.overtime);
    const transportDetails = data.transport.length ? data.transport.map(item => `${item.name}: ${item.cost} руб`).join("<br>  ") + `<br>  Сумма: ${data.transport.reduce((sum, item) => sum + item.cost, 0)} руб` : "Нет";
    const equipmentDetails = data.equipment.length ? data.equipment.map(item => `${item.name}: ${item.cost} руб`).join("<br>  ") + `<br>  Сумма: ${data.equipment.reduce((sum, item) => sum + item.cost, 0)} руб` : "Нет";
    return `
        <div class="section">
            <strong>Проект:</strong> ${data.project} (${formatDateTimeForDisplay(data.startTime)} - ${formatDateTimeForDisplay(data.endTime)})${data.isNightShift ? " (ночная смена)" : ""}
        </div>
        <div class="section">
            <strong>Сотрудник:</strong> ${data.firstName} ${data.lastName} (${data.position})
        </div>
        <div class="section">
            <strong>Общая продолжительность смены:</strong> ${totalTimeFormatted}
        </div>
        <div class="section">
            <strong>Переработка:</strong> ${overtimeFormatted}${data.lunchBreak ? " (текущий обед)" : ""}
        </div>
        <div class="section">
            <strong>Стоимость базовой смены:</strong> ${data.shiftCost} руб${data.isNightShift ? " (ночная смена, базовая смена уменьшена на 1 час)" : ""}
        </div>
        <div class="section">
            <strong>Стоимость переработки:</strong> ${calculateOvertimeCost(data.overtime, data.overtimeCost).totalCost.toFixed(2)} руб<br>  ${data.overtimeBreakdown.join("<br>  ")}
        </div>
        <div class="section">
            <strong>Погрузка/разгрузка:</strong> ${data.loadingCost} руб
        </div>
        <div class="section">
            <strong>Такси/транспорт:</strong><br>  ${transportDetails}
        </div>
        <div class="section">
            <strong>Доп. оборудование:</strong><br>  ${equipmentDetails}
        </div>
        <div class="section">
            <strong>Итоговая стоимость:</strong> ${data.totalCost} руб
        </div>
    `;
}

export { addTransport, addEquipment, formatTime, formatDateTimeForInput, formatDateTimeForDisplay, fillForm, fillEditForm, formatReport };