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
});

Hooks.once('ready', () => {
    console.log("Number Status Bar | Ready");

    // Добавление кнопки для мастера игры
    if (game.user.isGM) {
        const button = document.createElement('div');
        button.id = "number-status-bar";
        button.textContent = `Number: ${game.settings.get("number-status-bar", "displayNumber")}`;
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px;
            background: #333;
            color: white;
            font-size: 16px;
            border-radius: 8px;
            cursor: pointer;
            z-index: 1000;
        `;
        button.onclick = () => {
            new NumberConfigDialog().render(true);
        };

        document.body.appendChild(button);

        // Обновление значения на изменение настройки
        Hooks.on("updateSetting", (setting) => {
            if (setting.key === "number-status-bar.displayNumber") {
                button.textContent = `Number: ${setting.value}`;
            }
        });
    }
});

// Диалоговое окно для изменения числа
class NumberConfigDialog extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "number-config-dialog",
            title: "Set Display Number",
            template: "modules/number-status-bar/templates/settings.html",
            width: 300
        });
    }

    getData() {
        return {
            number: game.settings.get("number-status-bar", "displayNumber")
        };
    }

    async _updateObject(event, formData) {
        const number = Math.max(1, Math.min(5, parseInt(formData.number)));
        await game.settings.set("number-status-bar", "displayNumber", number);
    }
}
