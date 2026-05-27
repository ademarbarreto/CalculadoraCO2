/**
 * UI - Global UI object for rendering and DOM manipulation
 * Contains utility methods and rendering functions for the calculator interface
 */

const UI = {

    // ─── Utilitários ────────────────────────────────────────────

    formatNumber: function(number, decimals = 2) {
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    formatCurrency: function(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    },

    showElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.remove('hidden');
    },

    hideElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.add('hidden');
    },

    scrollToElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ─── Renderização de resultados ──────────────────────────────

    renderResults: function(data) {
        const modeData = CONFIG.TRANSPORT_MODES[data.mode];

        let html = `
            <h2 class="section-title">Resultados da Emissão</h2>
            <div class="results__grid">
                <div class="results__card">
                    <div class="results__card-icon">🗺️</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Rota</h3>
                        <p class="results__card-value">${data.origin} → ${data.destination}</p>
                    </div>
                </div>
                <div class="results__card">
                    <div class="results__card-icon">📏</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Distância</h3>
                        <p class="results__card-value">${this.formatNumber(data.distance, 0)} km</p>
                    </div>
                </div>
                <div class="results__card results__card--highlight">
                    <div class="results__card-icon">🌿</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Emissão de CO₂</h3>
                        <p class="results__card-value results__card-value--large">${this.formatNumber(data.emission)} kg</p>
                    </div>
                </div>
                <div class="results__card">
                    <div class="results__card-icon">${modeData.icon}</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Meio de Transporte</h3>
                        <p class="results__card-value">${modeData.label}</p>
                    </div>
                </div>
        `;

        if (data.mode !== 'car' && data.savings && data.savings.savedKg > 0) {
            html += `
                <div class="results__card results__card--success">
                    <div class="results__card-icon">✅</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Economia vs Carro</h3>
                        <p class="results__card-value">${this.formatNumber(data.savings.savedKg)} kg</p>
                        <p class="results__card-subtitle">${this.formatNumber(data.savings.percentage)}% menos emissões</p>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    renderComparison: function(modesArray, selectedMode) {
        let html = `
            <h2 class="section-title">Comparação entre Meios de Transporte</h2>
            <div class="comparison__grid">
        `;

        const maxEmission = Math.max(...modesArray.map(m => m.emission));

        modesArray.forEach(modeObj => {
            const modeData  = CONFIG.TRANSPORT_MODES[modeObj.mode];
            const isSelected = modeObj.mode === selectedMode;
            const barWidth  = maxEmission > 0 ? (modeObj.emission / maxEmission) * 100 : 0;

            let barColor;
            if      (modeObj.percentageVsCar <= 25)  barColor = '#10b981';
            else if (modeObj.percentageVsCar <= 75)  barColor = '#f59e0b';
            else if (modeObj.percentageVsCar <= 100) barColor = '#fb923c';
            else                                      barColor = '#ef4444';

            html += `
                <div class="comparison__item${isSelected ? ' comparison__item--selected' : ''}">
                    <div class="comparison__header">
                        <span class="comparison__icon">${modeData.icon}</span>
                        <span class="comparison__label">${modeData.label}</span>
                        ${isSelected ? '<span class="comparison__badge">Selecionado</span>' : ''}
                    </div>
                    <div class="comparison__stats">
                        <div class="comparison__stat">
                            <span class="comparison__stat-label">Emissão</span>
                            <span class="comparison__stat-value">${this.formatNumber(modeObj.emission)} kg CO₂</span>
                        </div>
                        <div class="comparison__stat">
                            <span class="comparison__stat-label">vs Carro</span>
                            <span class="comparison__stat-value">${this.formatNumber(modeObj.percentageVsCar)}%</span>
                        </div>
                    </div>
                    <div class="comparison__bar-container">
                        <div class="comparison__bar" style="width: ${barWidth}%; background-color: ${barColor};"></div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="comparison__tip">
                <span class="comparison__tip-icon">💡</span>
                <p class="comparison__tip-text">
                    <strong>Dica:</strong> Escolher meios de transporte mais sustentáveis ajuda a reduzir
                    significativamente as emissões de CO₂ e contribui para um planeta mais saudável!
                </p>
            </div>
        `;

        return html;
    },

    renderCarbonCredits: function(creditsData) {
        return `
            <h2 class="section-title">Créditos de Carbono</h2>
            <div class="carbon-credits__grid">
                <div class="carbon-credits__card">
                    <div class="carbon-credits__card-header">
                        <span class="carbon-credits__icon">🌳</span>
                        <h3 class="carbon-credits__card-title">Créditos Necessários</h3>
                    </div>
                    <div class="carbon-credits__card-body">
                        <p class="carbon-credits__value">${this.formatNumber(creditsData.credits, 4)}</p>
                        <p class="carbon-credits__helper">1 crédito = 1.000 kg CO₂</p>
                    </div>
                </div>
                <div class="carbon-credits__card">
                    <div class="carbon-credits__card-header">
                        <span class="carbon-credits__icon">💰</span>
                        <h3 class="carbon-credits__card-title">Custo Estimado</h3>
                    </div>
                    <div class="carbon-credits__card-body">
                        <p class="carbon-credits__value">${this.formatCurrency(creditsData.price.average)}</p>
                        <p class="carbon-credits__helper">
                            Variação: ${this.formatCurrency(creditsData.price.min)} - ${this.formatCurrency(creditsData.price.max)}
                        </p>
                    </div>
                </div>
            </div>
            <div class="carbon-credits__info">
                <h4 class="carbon-credits__info-title">O que são Créditos de Carbono?</h4>
                <p class="carbon-credits__info-text">
                    Créditos de carbono são certificados que representam a redução de uma tonelada
                    de CO₂ da atmosfera. Ao comprar créditos, você compensa suas emissões financiando
                    projetos de preservação ambiental, reflorestamento e energia renovável.
                </p>
            </div>
            <div class="carbon-credits__action">
                <button class="carbon-credits__button" type="button">
                    🛒 Compensar Emissões
                </button>
            </div>
        `;
    },

    // ─── Histórico ───────────────────────────────────────────────

    HISTORY_KEY:  'co2_history',
    HISTORY_LIMIT: 5,

    /**
     * Salva um cálculo no histórico do localStorage.
     * Mantém apenas os 5 mais recentes.
     * @param {Object} data - Dados do cálculo (origin, destination, distance, emission, mode)
     */
    saveToHistory: function(data) {
        const history = this.getHistory();

        const entry = {
            id:          Date.now(),
            date:        new Date().toLocaleDateString('pt-BR'),
            time:        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            origin:      data.origin,
            destination: data.destination,
            distance:    data.distance,
            emission:    data.emission,
            mode:        data.mode
        };

        // Adiciona no início (mais recente primeiro) e limita a 5
        history.unshift(entry);
        const trimmed = history.slice(0, this.HISTORY_LIMIT);

        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmed));
    },

    /**
     * Retorna o histórico salvo no localStorage.
     * @returns {Array}
     */
    getHistory: function() {
        try {
            return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || [];
        } catch {
            return [];
        }
    },

    /**
     * Limpa todo o histórico do localStorage e re-renderiza a seção.
     */
    clearHistory: function() {
        localStorage.removeItem(this.HISTORY_KEY);
        this.renderHistorySection();
    },

    /**
     * Renderiza a seção de histórico no DOM.
     * Exibe até 5 entradas ou mensagem de vazio.
     */
    renderHistorySection: function() {
        const container = document.getElementById('history-content');
        if (!container) return;

        const history = this.getHistory();

        if (history.length === 0) {
            container.innerHTML = `
                <p class="history__empty">Nenhuma consulta realizada ainda. Calcule uma rota para começar!</p>
            `;
            return;
        }

        const rows = history.map(entry => {
            const modeData = CONFIG.TRANSPORT_MODES[entry.mode];
            return `
                <div class="history__item">
                    <div class="history__item-icon">${modeData.icon}</div>
                    <div class="history__item-body">
                        <p class="history__item-route">${entry.origin} → ${entry.destination}</p>
                        <p class="history__item-meta">${modeData.label} · ${this.formatNumber(entry.distance, 0)} km · ${entry.date} ${entry.time}</p>
                    </div>
                    <div class="history__item-emission">
                        <span class="history__item-value">${this.formatNumber(entry.emission)} kg</span>
                        <span class="history__item-label">CO₂</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="history__list">${rows}</div>
            <div class="history__actions">
                <button class="history__clear-btn" id="history-clear-btn" type="button">
                    🗑️ Limpar histórico
                </button>
            </div>
        `;

        // Listener do botão de limpar
        document.getElementById('history-clear-btn')
            .addEventListener('click', () => this.clearHistory());
    },


    // ─── Frequência ──────────────────────────────────────────────

    /**
     * Renderiza a seção de cálculo por frequência semanal.
     * @param {Object} freqData - Resultado de Calculator.calculateFrequency()
     * @param {string} mode     - Modal de transporte selecionado
     * @returns {string} HTML
     */
    renderFrequency: function(freqData, mode) {
        const modeData   = CONFIG.TRANSPORT_MODES[mode];
        const roundLabel = freqData.roundTrip ? ' (ida e volta)' : ' (somente ida)';

        return `
            <h2 class="section-title">📅 Emissão por Frequência</h2>
            <p class="frequency-section__subtitle">
                ${modeData.icon} ${modeData.label} · ${freqData.tripsPerWeek}× por semana${roundLabel}
            </p>

            <div class="frequency-section__grid">
                <div class="frequency-section__card">
                    <span class="frequency-section__card-period">Por viagem</span>
                    <span class="frequency-section__card-value">${this.formatNumber(freqData.perTrip)} kg</span>
                    <span class="frequency-section__card-label">CO₂</span>
                </div>
                <div class="frequency-section__card frequency-section__card--highlight">
                    <span class="frequency-section__card-period">Por semana</span>
                    <span class="frequency-section__card-value">${this.formatNumber(freqData.weekly)} kg</span>
                    <span class="frequency-section__card-label">CO₂</span>
                </div>
                <div class="frequency-section__card">
                    <span class="frequency-section__card-period">Por mês</span>
                    <span class="frequency-section__card-value">${this.formatNumber(freqData.monthly)} kg</span>
                    <span class="frequency-section__card-label">CO₂</span>
                </div>
                <div class="frequency-section__card">
                    <span class="frequency-section__card-period">Por ano</span>
                    <span class="frequency-section__card-value">${this.formatNumber(freqData.yearly)} kg</span>
                    <span class="frequency-section__card-label">CO₂</span>
                </div>
            </div>

            <div class="comparison__tip">
                <span class="comparison__tip-icon">🌍</span>
                <p class="comparison__tip-text">
                    <strong>Impacto anual:</strong> essa rotina gera
                    <strong>${this.formatNumber(freqData.yearly)} kg de CO₂ por ano</strong>.
                    Trocar por transporte público ou bicicleta pode eliminar grande parte dessas emissões!
                </p>
            </div>
        `;
    },

    // ─── Loading ─────────────────────────────────────────────────

    showLoading: function(buttonElement) {
        buttonElement.dataset.originalText = buttonElement.innerHTML;
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
    },

    hideLoading: function(buttonElement) {
        buttonElement.disabled = false;
        if (buttonElement.dataset.originalText) {
            buttonElement.innerHTML = buttonElement.dataset.originalText;
        }
    }
};
