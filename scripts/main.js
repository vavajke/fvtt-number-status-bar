Hooks.once('init', () => {
    console.log("Number Status Bar | Initializing");

    // Регистрация настройки
    game.settings.register("number-status-bar", "displayNumber", {
        name: "Displayed Number",
        hint: "Set the number to display (1-5).",
        scope: "world",
        config: true,
        default: 1,
        type: Number,
        range: {
            min: 1,
            max: 5,
            step: 1
        }
    });

    // Регистрация настройки для фиксированной позиции
    game.settings.register("number-status-bar", "position", {
        name: "Position of the display bar",
        scope: "client",
        config: false,
        default: { top: "20px", left: "20px" },
        type: Object
    });

    // Регистрация настройки для состояния замка
    game.settings.register("number-status-bar", "isLocked", {
        name: "Lock state of the display bar",
        scope: "client",
        config: false,
        default: true,
        type: Boolean
    });
});

Hooks.once('ready', () => {
    console.log("Number Status Bar | Ready");

    // Добавляем плашку только для GM
    if (game.user.isGM) {
        createDisplayBar();
    }
});

function createDisplayBar() {
    const value = game.settings.get("number-status-bar", "displayNumber");
    const isLocked = game.settings.get("number-status-bar", "isLocked");
    const position = game.settings.get("number-status-bar", "position");

    // Создаём HTML элемент плашки
    const bar = document.createElement('div');
    bar.id = "number-status-bar";
    bar.style.cssText = `
        position: fixed;
        top: ${position.top};
        left: ${position.left};
        padding: 10px;
        background: #333;
        color: white;
        font-size: 16px;
        border: 2px solid #888;
        border-radius: 4px;
        z-index: 1000;
        width: 100px;
        text-align: center;
        cursor: ${isLocked ? "default" : "move"};
    `;
    bar.draggable = !isLocked;

    bar.innerHTML = `
        <div id="number-status-bar-minus" style="cursor: pointer;">-</div>
        <div id="number-status-bar-value">УП ${value}</div>
        <div id="number-status-bar-plus" style="cursor: pointer;">+</div>
        <div id="number-status-bar-lock" style="position: absolute; top: -10px; left: -10px; cursor: pointer;">🔒</div>
    `;

    document.body.appendChild(bar);

    // Событие изменения значения
    document.getElementById("number-status-bar-plus").onclick = () => updateValue(1);
    document.getElementById("number-status-bar-minus").onclick = () => updateValue(-1);

    // Событие для замка
    document.getElementById("number-status-bar-lock").onclick = () => toggleLock(bar);

    // Обработка перетаскивания
    if (!isLocked) {
        bar.onmousedown = (event) => dragElement(event, bar);
    }

    // Слушатель для обновления значения
    Hooks.on("updateSetting", (setting) => {
        if (setting.key === "number-status-bar.displayNumber") {
            document.getElementById("number-status-bar-value").textContent = `УП ${setting.value}`;
        }
    });
}

function updateValue(delta) {
    const currentValue = game.settings.get("number-status-bar", "displayNumber");
    const newValue = Math.min(5, Math.max(1, currentValue + delta));
    game.settings.set("number-status-bar", "displayNumber", newValue);
}

function toggleLock(bar) {
    const isLocked = game.settings.get("number-status-bar", "isLocked");
    game.settings.set("number-status-bar", "isLocked", !isLocked);

    const lockIcon = document.getElementById("number-status-bar-lock");
    lockIcon.textContent = isLocked ? "🔒" : "🔓";

    bar.style.cursor = isLocked ? "move" : "default";
    bar.draggable = !isLocked;

    if (!isLocked) {
        bar.onmousedown = (event) => dragElement(event, bar);
    } else {
        bar.onmousedown = null;
    }
}

function dragElement(event, element) {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const rect = element.getBoundingClientRect();

    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    const moveHandler = (moveEvent) => {
        element.style.top = `${moveEvent.clientY - offsetY}px`;
        element.style.left = `${moveEvent.clientX - offsetX}px`;
    };

    const upHandler = () => {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);

        // Сохранение позиции
        const position = { top: element.style.top, left: element.style.left };
        game.settings.set("number-status-bar", "position", position);
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
}