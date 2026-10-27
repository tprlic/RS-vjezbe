
"use strict";

const STORAGE_KEY = "it-lab-equipment-v1";

const initialEquipment = [
    {
        id: 1,
        name: "Dell OptiPlex 7010",
        inventoryNumber: "RAC-001",
        category: "Računalo",
        location: "Učionica 12",
        status: "Ispravno"
    },
    {
        id: 2,
        name: "HP ProBook 450",
        inventoryNumber: "RAC-002",
        category: "Računalo",
        location: "Kabinet 5",
        status: "Ispravno"
    },
    {
        id: 3,
        name: "Cisco Catalyst 2960",
        inventoryNumber: "MRZ-001",
        category: "Mrežna oprema",
        location: "Mrežni ormar",
        status: "Ispravno"
    },
    {
        id: 4,
        name: "TP-Link Archer C6",
        inventoryNumber: "MRZ-002",
        category: "Mrežna oprema",
        location: "Učionica 12",
        status: "Na servisu"
    },
    {
        id: 5,
        name: "Logitech K120",
        inventoryNumber: "PER-001",
        category: "Periferija",
        location: "Učionica 12",
        status: "Ispravno"
    },
    {
        id: 6,
        name: "Lenovo ThinkCentre",
        inventoryNumber: "RAC-003",
        category: "Računalo",
        location: "Kabinet 5",
        status: "Neispravno"
    }
];

const $ = (selector) => document.querySelector(selector);

const tableBody = $("#equipmentTable");
const searchInput = $("#searchInput");
const categoryFilter = $("#categoryFilter");
const statusFilter = $("#statusFilter");
const dialog = $("#equipmentDialog");
const form = $("#equipmentForm");
const formError = $("#formError");
const toast = $("#toast");

let equipment = loadEquipment();
let toastTimer;

function loadEquipment() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            return initialEquipment.map(item => ({ ...item }));
        }

        const parsed = JSON.parse(saved);

        if (
            !Array.isArray(parsed) ||
            !parsed.every(item =>
                item &&
                Number.isSafeInteger(item.id) &&
                ["name", "inventoryNumber", "category", "location", "status"]
                    .every(key => typeof item[key] === "string")
            )
        ) {
            return initialEquipment.map(item => ({ ...item }));
        }

        return parsed;
    } catch (error) {
        console.error("Učitavanje podataka nije uspjelo:", error);
        return initialEquipment.map(item => ({ ...item }));
    }
}

function saveEquipment() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
        return true;
    } catch (error) {
        console.error("Spremanje podataka nije uspjelo:", error);
        showToast("Podaci nisu spremljeni u preglednik.");
        return false;
    }
}

// Siguran prikaz teksta koji je unio korisnik.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getDeviceIcon(category) {
    const icons = {
        "Računalo": "▣",
        "Mrežna oprema": "⌘",
        "Periferija": "⌨"
    };

    return icons[category] || "▦";
}

function getStatusClass(status) {
    const classes = {
        "Ispravno": "ispravno",
        "Na servisu": "na-servisu",
        "Neispravno": "neispravno"
    };

    return classes[status] || "";
}

function renderEquipment() {
    const query = searchInput.value.trim().toLocaleLowerCase("hr");
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;

    const filtered = equipment.filter(item => {
        const searchableText = [
            item.name,
            item.inventoryNumber,
            item.category,
            item.location,
            item.status
        ].join(" ").toLocaleLowerCase("hr");

        const matchesSearch = searchableText.includes(query);
        const matchesCategory =
            selectedCategory === "Sve" ||
            item.category === selectedCategory;
        const matchesStatus =
            selectedStatus === "Sve" ||
            item.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    $("#totalCount").textContent = equipment.length;

    $("#computerCount").textContent = equipment.filter(
        item => item.category === "Računalo"
    ).length;

    $("#networkCount").textContent = equipment.filter(
        item => item.category === "Mrežna oprema"
    ).length;

    $("#workingCount").textContent = equipment.filter(
        item => item.status === "Ispravno"
    ).length;

    $("#resultCount").textContent =
        `Prikazano ${filtered.length} od ${equipment.length} uređaja`;

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Nema uređaja koji odgovaraju odabranim kriterijima.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(item => `
        <tr>
            <td>
                <div class="device-cell">
                    <span class="device-icon" aria-hidden="true">
                        ${getDeviceIcon(item.category)}
                    </span>
                    <span>${escapeHTML(item.name)}</span>
                </div>
            </td>
            <td>
                <span class="inventory-number">
                    ${escapeHTML(item.inventoryNumber)}
                </span>
            </td>
            <td>
                <span class="category-tag">
                    ${escapeHTML(item.category)}
                </span>
            </td>
            <td>${escapeHTML(item.location)}</td>
            <td>
                <span class="status-tag ${getStatusClass(item.status)}">
                    ${escapeHTML(item.status)}
                </span>
            </td>
            <td>
                <div class="row-actions">
                    <button class="icon-button" type="button"
                            data-action="edit" data-id="${item.id}"
                            aria-label="Uredi ${escapeHTML(item.name)}">
                        Uredi
                    </button>
                    <button class="icon-button delete" type="button"
                            data-action="delete" data-id="${item.id}"
                            aria-label="Obriši ${escapeHTML(item.name)}">
                        Obriši
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");

    toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2800);
}

function openAddDialog() {
    form.reset();
    $("#editId").value = "";
    $("#dialogTitle").textContent = "Dodaj opremu";
    formError.textContent = "";
    dialog.showModal();
}

function openEditDialog(id) {
    const item = equipment.find(device => device.id === id);

    if (!item) {
        showToast("Uređaj nije pronađen.");
        return;
    }

    form.reset();
    $("#editId").value = item.id;
    $("#equipmentName").value = item.name;
    $("#inventoryNumber").value = item.inventoryNumber;
    $("#equipmentCategory").value = item.category;
    $("#equipmentLocation").value = item.location;
    $("#equipmentStatus").value = item.status;
    $("#dialogTitle").textContent = "Uredi opremu";
    formError.textContent = "";
    dialog.showModal();
}

function deleteEquipment(id) {
    const item = equipment.find(device => device.id === id);

    if (!item) {
        return;
    }

    const confirmed = window.confirm(
        `Želiš li obrisati uređaj "${item.name}" (${item.inventoryNumber})?`
    );

    if (!confirmed) {
        return;
    }

    const previousEquipment = equipment;
    equipment = equipment.filter(device => device.id !== id);

    if (!saveEquipment()) {
        equipment = previousEquipment;
        return;
    }

    renderEquipment();
    showToast("Uređaj je obrisan.");
}

function handleFormSubmit(event) {
    event.preventDefault();
    formError.textContent = "";

    const editId = $("#editId").value;
    const name = $("#equipmentName").value.trim();
    const inventoryNumber = $("#inventoryNumber").value.trim();
    const category = $("#equipmentCategory").value;
    const location = $("#equipmentLocation").value.trim();
    const status = $("#equipmentStatus").value;

    if (!name || !inventoryNumber || !location) {
        formError.textContent = "Popuni sva obavezna polja.";
        return;
    }

    const duplicate = equipment.some(item =>
        item.inventoryNumber.toLocaleLowerCase("hr") ===
            inventoryNumber.toLocaleLowerCase("hr") &&
        String(item.id) !== editId
    );

    if (duplicate) {
        formError.textContent =
            "Taj inventarski broj već postoji. Unesi drugi broj.";
        return;
    }

    const previousEquipment = equipment;
    let successMessage;

    if (editId !== "") {
        const id = Number(editId);

        equipment = equipment.map(item =>
            item.id === id
                ? { ...item, name, inventoryNumber, category, location, status }
                : item
        );

        successMessage = "Podaci o uređaju su ažurirani.";
    } else {
        const nextId = equipment.reduce(
            (maxId, item) => Math.max(maxId, item.id), 0
        ) + 1;

        equipment = [
            ...equipment,
            { id: nextId, name, inventoryNumber, category, location, status }
        ];

        successMessage = "Novi uređaj je dodan.";
    }

    if (!saveEquipment()) {
        equipment = previousEquipment;
        return;
    }

    dialog.close();
    renderEquipment();
    showToast(successMessage);
}

$("#addButton").addEventListener("click", openAddDialog);

$("#closeDialog").addEventListener("click", () => dialog.close());
$("#cancelButton").addEventListener("click", () => dialog.close());

form.addEventListener("submit", handleFormSubmit);

searchInput.addEventListener("input", renderEquipment);
categoryFilter.addEventListener("change", renderEquipment);
statusFilter.addEventListener("change", renderEquipment);

tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);

    if (!Number.isSafeInteger(id)) {
        return;
    }

    if (button.dataset.action === "edit") {
        openEditDialog(id);
    } else if (button.dataset.action === "delete") {
        deleteEquipment(id);
    }
});

$("#resetButton").addEventListener("click", () => {
    const confirmed = window.confirm(
        "Želiš li vratiti početne podatke? " +
        "Svi dodani, izmijenjeni i obrisani zapisi bit će resetirani."
    );

    if (!confirmed) {
        return;
    }

    const previousEquipment = equipment;
    equipment = initialEquipment.map(item => ({ ...item }));

    if (!saveEquipment()) {
        equipment = previousEquipment;
        return;
    }

    searchInput.value = "";
    categoryFilter.value = "Sve";
    statusFilter.value = "Sve";

    renderEquipment();
    showToast("Početni podaci su vraćeni.");
});

renderEquipment();


const API_BASE_URL = "https://rs-vjezbe-it-api.onrender.com";

const apiStatus = document.querySelector("#apiStatus");
const loadApiButton = document.querySelector("#loadApiButton");
const apiEquipmentResult = document.querySelector("#apiEquipmentResult");
const apiMessage = document.querySelector("#apiMessage");
const sendApiButton = document.querySelector("#sendApiButton");
const apiPostResult = document.querySelector("#apiPostResult");

// GET: provjera dostupnosti API-ja i dohvat opreme.
loadApiButton.addEventListener("click", async () => {
    loadApiButton.disabled = true;
    apiStatus.textContent = "Provjeravam vezu...";
    apiEquipmentResult.textContent = "Dohvaćam podatke...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/equipment`);

        if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();

        apiStatus.textContent = "Povezivanje uspješno.";
        apiEquipmentResult.textContent =
            `Backend je vratio ${data.count} uređaja: ` +
            data.equipment.map(item => item.name).join(", ");
    } catch (error) {
        console.error("GET zahtjev nije uspio:", error);
        apiStatus.textContent = "Pogreška pri povezivanju.";
        apiEquipmentResult.textContent =
            "Nije moguće dohvatiti opremu. Provjeri dostupnost backenda i CORS postavke.";
    } finally {
        loadApiButton.disabled = false;
    }
});

// POST: slanje poruke backendu.
sendApiButton.addEventListener("click", async () => {
    const message = apiMessage.value.trim();

    if (!message) {
        apiPostResult.textContent = "Najprije upiši poruku.";
        return;
    }

    sendApiButton.disabled = true;
    apiPostResult.textContent = "Šaljem zahtjev...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/echo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();

        apiPostResult.textContent =
            `Odgovor backenda: ${data.received}. Status: ${data.status}.`;
    } catch (error) {
        console.error("POST zahtjev nije uspio:", error);
        apiPostResult.textContent =
            "Slanje nije uspjelo. Provjeri dostupnost backenda i CORS postavke.";
    } finally {
        sendApiButton.disabled = false;
    }
});

