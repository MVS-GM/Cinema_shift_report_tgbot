function calculateOvertimeCost(overtime, baseRate) {
    let totalCost = 0;
    let breakdown = [];
    if (overtime <= 8) {
        totalCost = overtime * baseRate;
        breakdown.push(`${overtime.toFixed(2)} ч × ${baseRate} руб/ч (100%) = ${(overtime * baseRate).toFixed(2)} руб`);
    } else if (overtime <= 13) {
        totalCost = (8 * baseRate) + ((overtime - 8) * baseRate * 2);
        breakdown.push(`8 ч × ${baseRate} руб/ч (100%) = ${(8 * baseRate).toFixed(2)} руб`);
        breakdown.push(`${(overtime - 8).toFixed(2)} ч × ${baseRate * 2} руб/ч (200%) = ${((overtime - 8) * baseRate * 2).toFixed(2)} руб`);
    } else {
        totalCost = (8 * baseRate) + (5 * baseRate * 2) + ((overtime - 13) * baseRate * 4);
        breakdown.push(`8 ч × ${baseRate} руб/ч (100%) = ${(8 * baseRate).toFixed(2)} руб`);
        breakdown.push(`5 ч × ${baseRate * 2} руб/ч (200%) = ${(5 * baseRate * 2).toFixed(2)} руб`);
        breakdown.push(`${(overtime - 13).toFixed(2)} ч × ${baseRate * 4} руб/ч (400%) = ${((overtime - 13) * baseRate * 4).toFixed(2)} руб`);
    }
    return { totalCost, breakdown };
}

function calculateShift() {
    const project = document.getElementById("project").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const position = document.getElementById("position").value;
    let baseShift = parseFloat(document.getElementById("baseShift").value);
    const startTimeInput = document.getElementById("startTime").value;
    const endTimeInput = document.getElementById("endTime").value;
    const shiftCost = parseFloat(document.getElementById("shiftCost").value);
    const overtimeCost = parseFloat(document.getElementById("overtimeCost").value);
    const lunchBreak = document.getElementById("lunchBreak").checked;
    const loadingCost = parseFloat(document.getElementById("loadingCost").value) || 0;
    const resultDiv = document.getElementById("result");

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

    const startHour = startTime.getHours();
    const isNightShift = (startHour >= 16 || startHour < 4);
    if (isNightShift) {
        baseShift -= 1;
    }

    const diffMs = endTime - startTime;
    const totalHours = diffMs / (1000 * 60 * 60);
    let overtime = totalHours > baseShift ? totalHours - baseShift : 0;
    if (lunchBreak) overtime += 1;

    const baseShiftCost = shiftCost;
    const overtimeResult = calculateOvertimeCost(overtime, overtimeCost);
    const overtimeTotalCost = overtimeResult.totalCost;
    const overtimeBreakdown = overtimeResult.breakdown;

    let transportCost = 0;
    const transportItems = [];
    document.querySelectorAll("#transportList .item").forEach(item => {
        const name = item.querySelector(".transport-name").value;
        const cost = parseFloat(item.querySelector(".transport-cost").value) || 0;
        if (name || cost) {
            transportItems.push({ name, cost });
            transportCost += cost;
        }
    });

    let equipmentCost = 0;
    const equipmentItems = [];
    document.querySelectorAll("#equipmentList .item").forEach(item => {
        const name = item.querySelector(".equipment-name").value;
        const cost = parseFloat(item.querySelector(".equipment-cost").value) || 0;
        if (name || cost) {
            equipmentItems.push({ name, cost });
            equipmentCost += cost;
        }
    });

    const totalCost = baseShiftCost + overtimeTotalCost + loadingCost + transportCost + equipmentCost;

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

    resultDiv.innerHTML = formatReport(data);
    saveToHistory(data);
    tg.sendData(JSON.stringify(data));
}

export { calculateShift, calculateOvertimeCost };