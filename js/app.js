/**
 * app.js - Main application file
 * Handles initialization and form submission for the CO2 calculator
 */

document.addEventListener('DOMContentLoaded', function() {

    // Configura feedback visual, autocomplete e checkbox manual
    CONFIG.setupDistanceAutofill();

    const calculatorForm = document.getElementById('calculator-form');
    calculatorForm.addEventListener('submit', handleFormSubmit);

    console.log('✅ Calculadora inicializada!');

    // ─── Validação inline ────────────────────────────────────────

    /**
     * Exibe mensagem de erro inline abaixo de um campo.
     * Cria o elemento <span> se ainda não existir.
     * @param {string} fieldId - ID do campo com erro
     * @param {string} message - Mensagem a exibir
     */
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Marca o campo visualmente
        field.classList.add('form-group__input--error');

        // Cria ou reutiliza o span de erro
        const errorId = `${fieldId}-error`;
        let errorEl = document.getElementById(errorId);
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.id = errorId;
            errorEl.className = 'form-group__error-text';
            field.parentNode.insertBefore(errorEl, field.nextSibling);
        }
        errorEl.textContent = message;

        // Remove o erro quando o usuário começa a corrigir
        field.addEventListener('input', () => clearFieldError(fieldId), { once: true });
    }

    /**
     * Remove a mensagem de erro de um campo.
     * @param {string} fieldId - ID do campo
     */
    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) field.classList.remove('form-group__input--error');

        const errorEl = document.getElementById(`${fieldId}-error`);
        if (errorEl) errorEl.remove();
    }

    /**
     * Remove todos os erros inline do formulário.
     */
    function clearAllErrors() {
        ['origin', 'destination', 'distance'].forEach(clearFieldError);

        const transportError = document.getElementById('transport-error');
        if (transportError) transportError.remove();
    }

    /**
     * Valida os campos do formulário e exibe erros inline.
     * @returns {boolean} true se válido, false se há erros
     */
    function validateForm(origin, destination, transportMode, manualChecked, distanceValue) {
        let valid = true;

        clearAllErrors();

        if (!origin) {
            showFieldError('origin', '⚠️ Informe a cidade de origem.');
            valid = false;
        }

        if (!destination) {
            showFieldError('destination', '⚠️ Informe a cidade de destino.');
            valid = false;
        }

        if (origin && destination && origin.toLowerCase() === destination.toLowerCase()) {
            showFieldError('destination', '⚠️ Origem e destino não podem ser iguais.');
            valid = false;
        }

        if (!transportMode) {
            // Erro abaixo do grid de transporte
            const grid = document.querySelector('.transport-grid');
            if (grid && !document.getElementById('transport-error')) {
                const errorEl = document.createElement('span');
                errorEl.id = 'transport-error';
                errorEl.className = 'form-group__error-text';
                errorEl.textContent = '⚠️ Selecione um meio de transporte.';
                grid.parentNode.insertBefore(errorEl, grid.nextSibling);
            }
            valid = false;
        }

        if (manualChecked) {
            const dist = parseFloat(distanceValue);
            if (!dist || dist <= 0) {
                showFieldError('distance', '⚠️ Insira uma distância válida maior que zero.');
                valid = false;
            }
        }

        return valid;
    }

    // ─── Submit handler ──────────────────────────────────────────

    async function handleFormSubmit(event) {
        event.preventDefault();

        const origin         = document.getElementById('origin').value.trim();
        const destination    = document.getElementById('destination').value.trim();
        const manualCheckbox = document.getElementById('manual-distance');
        const distanceInput  = document.getElementById('distance');
        const helperText     = document.querySelector('.form-group__helper-text');

        const transportModeInput = document.querySelector('input[name="transport"]:checked');
        const transportMode      = transportModeInput ? transportModeInput.value : null;

        // Validação inline — para aqui se houver erros
        if (!validateForm(origin, destination, transportMode, manualCheckbox.checked, distanceInput.value)) {
            return;
        }

        // Loading state
        const submitButton = calculatorForm.querySelector('.form-submit');
        UI.showLoading(submitButton);
        UI.hideElement('results');
        UI.hideElement('comparison');
        UI.hideElement('carbon-credits');

        try {
            let distance;
            let distanceSource;

            if (manualCheckbox.checked) {
                distance       = parseFloat(distanceInput.value);
                distanceSource = 'manual';
                if (helperText) {
                    helperText.textContent = `✓ Distância inserida manualmente: ${distance} km`;
                    helperText.style.color = '#6b7280';
                }
            } else {
                if (helperText) {
                    helperText.textContent = '⏳ Buscando distância...';
                    helperText.style.color = '#3b82f6';
                }

                const result   = await CONFIG.getDistance(origin, destination);
                distance       = result.distanceKm;
                distanceSource = result.source;
                distanceInput.value = distance;

                if (helperText) {
                    helperText.textContent = `✓ Distância calculada via API: ${distance} km`;
                    helperText.style.color = '#10b981';
                }
            }

            if (!distance || distance <= 0) {
                throw new Error('Distância inválida retornada.');
            }

            // Cálculos
            const emission           = Calculator.calculateEmission(distance, transportMode);
            const carEmission        = Calculator.calculateEmission(distance, 'car');
            const savings            = transportMode !== 'car'
                ? Calculator.calculateSavings(emission, carEmission) : null;
            const allModesComparison = Calculator.calculateAllModes(distance);
            const carbonCredits      = Calculator.calculateCarbonCredits(emission);
            const creditPrice        = Calculator.estimateCreditPrice(carbonCredits);

            const resultsData = { origin, destination, distance, emission, mode: transportMode, savings, distanceSource };
            const creditsData = { credits: carbonCredits, price: creditPrice };

            // Renderização
            document.getElementById('results-content').innerHTML      = UI.renderResults(resultsData);
            document.getElementById('comparison-content').innerHTML   = UI.renderComparison(allModesComparison, transportMode);
            document.getElementById('carbon-credits-content').innerHTML = UI.renderCarbonCredits(creditsData);

            UI.showElement('results');
            UI.showElement('comparison');
            UI.showElement('carbon-credits');
            UI.scrollToElement('results');

            console.log('✅ Cálculo concluído:', { emission, carbonCredits, savings, distanceSource });

        } catch (error) {
            console.error('❌ Erro ao calcular emissões:', error);

            const isNotFound = error.message.toLowerCase().includes('não encontrada') ||
                               error.message.toLowerCase().includes('not found');

            // Erro inline no campo de origem em vez de alert
            if (isNotFound) {
                showFieldError('origin', '⚠️ Cidade não encontrada. Verifique o nome ou insira a distância manualmente.');
            } else {
                if (helperText) {
                    helperText.textContent = '⚠️ Erro ao buscar a distância. Tente inserir manualmente.';
                    helperText.style.color = '#ef4444';
                }
            }

            // Ativa modo manual como saída de emergência
            if (!manualCheckbox.checked) {
                manualCheckbox.checked = true;
                distanceInput.readOnly = false;
                distanceInput.focus();
            }

        } finally {
            UI.hideLoading(submitButton);
        }
    }

});
