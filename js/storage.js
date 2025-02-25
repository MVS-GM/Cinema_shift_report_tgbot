import { formatReport } from './ui.js';
import { editEntry, copyEntry } from './main.js';

function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
    history.unshift(data);
    localStorage.setItem('shiftHistory', JSON.stringify(history));
}

function updateHistory(index, data) {
    let history = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
    history[index] = data;
    localStorage.setItem('shiftHistory', JSON.stringify(history));
    loadHistory();
}

function deleteFromHistory(index) {
    if (confirm("Вы уверены, что хотите удалить эту запись?")) {
        let history = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
        history.splice(index, 1);
        localStorage.setItem('shiftHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
    historyList.innerHTML = '';
    history.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const title = `${entry.project}_${formatDate(entry.startTime)}_${entry.firstName} ${entry.lastName}_${entry.totalCost} руб`;
        item.innerHTML = `
            <div class="history-header" onclick="toggleDetails(${index})">${title}</div>
            <div class="history-actions">
                <button class="action-btn edit-btn" onclick="editEntry(${index}); event.stopPropagation();">Изменить</button>
                <button class="action-btn copy-btn" onclick="copyEntry(${index}); event.stopPropagation();">Копировать</button>
                <button class="action-btn delete-btn" onclick="deleteFromHistory(${index}); event.stopPropagation();">Удалить</button>
            </div>
            <div class="history-details" id="details-${index}">${formatReport(entry)}</div>
        `;
        historyList.appendChild(item);
    });
}

function toggleDetails(index) {
    const details = document.getElementById(`details-${index}`);
    details.style.display = details.style.display === 'block' ? 'none' : 'block';
}

function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export { saveToHistory, updateHistory, deleteFromHistory, loadHistory, toggleDetails };