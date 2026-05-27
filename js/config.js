/**
 * CONFIG - Global configuration object
 * Contains emission factors, transport mode metadata, and utility functions
 */

const CONFIG = {
    /**
     * OpenRouteService API key
     * Obtenha a sua em: https://openrouteservice.org/dev/#/signup
     */
    ORS_API_KEY: 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYyYWNmMWExNjQ4ZTQ2YzQ4OGFlYjY0NDEyMzkxY2QyIiwiaCI6Im11cm11cjY0In0=',

    /**
     * CO2 emission factors in kg per kilometer for each transport mode
     */
    EMISSION_FACTORS: {
        bicycle: 0,
        car: 0.12,
        bus: 0.089,
        truck: 0.96,
        plane: 0.18
    },

    /**
     * Transport mode metadata for UI rendering
     */
    TRANSPORT_MODES: {
        bicycle: { label: "Bicicleta",     icon: "🚲", color: "#10b981" },
        car:     { label: "Carro",         icon: "🚗", color: "#3b82f6" },
        bus:     { label: "Ônibus",        icon: "🚌", color: "#f59e0b" },
        truck:   { label: "Caminhão",      icon: "🚚", color: "#ef4444" },
        plane:   { label: "Avião (dom.)",  icon: "✈️", color: "#8b5cf6" }
    },

    /**
     * Carbon credit configuration
     */
    CARBON_CREDIT: {
        KG_PER_CREDIT: 1000,
        PRICE_MIN_BRL: 50,
        PRICE_MAX_BRL: 150
    },

    /**
     * Debounce helper — evita chamar a API a cada tecla digitada.
     * Aguarda `delay` ms após a última chamada antes de executar `fn`.
     */
    debounce: function(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Busca sugestões de cidades na API do ORS para autocomplete.
     * Retorna até 5 resultados restritos ao Brasil.
     * @param {string} query - Texto digitado pelo usuário
     * @returns {Promise<Array<{ label: string, coords: [number, number] }>>}
     */
    searchCities: async function(query) {
        if (!query || query.length < 3) return [];

        const url = `https://api.openrouteservice.org/geocode/autocomplete?` +
            `api_key=${this.ORS_API_KEY}` +
            `&text=${encodeURIComponent(query)}` +
            `&boundary.country=BR` +
            `&size=5`;

        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        if (!data.features || data.features.length === 0) return [];

        // Retorna label legível e coordenadas de cada sugestão
        return data.features.map(f => ({
            label: f.properties.label,
            coords: f.geometry.coordinates // [lng, lat]
        }));
    },

    /**
     * Geocode a city name to [longitude, latitude] coordinates.
     * Usado no getDistance quando o usuário digita livremente sem selecionar sugestão.
     * @param {string} cityName
     * @returns {Promise<[number, number]>}
     */
    geocodeCity: async function(cityName) {
        const url = `https://api.openrouteservice.org/geocode/search?` +
            `api_key=${this.ORS_API_KEY}` +
            `&text=${encodeURIComponent(cityName)}` +
            `&boundary.country=BR` +
            `&size=1`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na geocodificação: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.features || data.features.length === 0) {
            throw new Error(`Cidade não encontrada: "${cityName}"`);
        }

        return data.features[0].geometry.coordinates;
    },

    /**
     * Calcula a distância em km entre duas cidades via API do ORS.
     * @param {string} origin
     * @param {string} destination
     * @returns {Promise<{ distanceKm: number, source: 'api' }>}
     */
    getDistance: async function(origin, destination) {
        console.log(`🌐 Consultando API para: ${origin} → ${destination}`);

        const [originCoords, destCoords] = await Promise.all([
            this.geocodeCity(origin),
            this.geocodeCity(destination)
        ]);

        console.log(`📍 Coordenadas: ${origin} → [${originCoords}] | ${destination} → [${destCoords}]`);

        const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': this.ORS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates: [originCoords, destCoords] })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Erro na API de direções: ${response.status} — ${errorData.error?.message || response.statusText}`
            );
        }

        const data = await response.json();
        const distanceKm = Math.round((data.routes[0].summary.distance / 1000) * 10) / 10;

        console.log(`✅ Distância obtida via API: ${distanceKm} km`);
        return { distanceKm, source: 'api' };
    },

    /**
     * Inicializa o autocomplete para um campo de input.
     * Cria um dropdown com sugestões da API enquanto o usuário digita.
     * @param {string} inputId   - ID do campo de texto
     * @param {string} dropdownId - ID do elemento <ul> de sugestões
     */
    setupAutocomplete: function(inputId, dropdownId) {
        const input    = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);

        if (!input || !dropdown) return;

        // Fecha o dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('autocomplete__hidden');
            }
        });

        // Busca com debounce de 350ms para não chamar a API a cada tecla
        const debouncedSearch = this.debounce(async (query) => {
            if (query.length < 3) {
                dropdown.classList.add('autocomplete__hidden');
                return;
            }

            // Indicador de carregamento
            dropdown.innerHTML = '<li class="autocomplete__item autocomplete__item--loading">🔍 Buscando...</li>';
            dropdown.classList.remove('autocomplete__hidden');

            const suggestions = await this.searchCities(query);

            if (suggestions.length === 0) {
                dropdown.innerHTML = '<li class="autocomplete__item autocomplete__item--empty">Nenhuma cidade encontrada</li>';
                return;
            }

            // Renderiza as sugestões
            dropdown.innerHTML = suggestions
                .map((s, i) => `<li class="autocomplete__item" data-index="${i}" data-label="${s.label}">${s.label}</li>`)
                .join('');

            // Clique em uma sugestão preenche o campo e fecha o dropdown
            dropdown.querySelectorAll('.autocomplete__item[data-label]').forEach(item => {
                item.addEventListener('click', () => {
                    input.value = item.dataset.label;
                    dropdown.classList.add('autocomplete__hidden');

                    // Dispara evento 'input' para atualizar o helper text
                    input.dispatchEvent(new Event('input'));
                });
            });
        }, 350);

        // Escuta digitação no campo
        input.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });

        // Navegação por teclado (↑ ↓ Enter Esc)
        input.addEventListener('keydown', (e) => {
            const items = [...dropdown.querySelectorAll('.autocomplete__item[data-label]')];
            if (items.length === 0) return;

            const active = dropdown.querySelector('.autocomplete__item--active');
            let idx = active ? parseInt(active.dataset.index) : -1;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                idx = (idx + 1) % items.length;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                idx = (idx - 1 + items.length) % items.length;
            } else if (e.key === 'Enter' && active) {
                e.preventDefault();
                input.value = active.dataset.label;
                dropdown.classList.add('autocomplete__hidden');
                input.dispatchEvent(new Event('input'));
                return;
            } else if (e.key === 'Escape') {
                dropdown.classList.add('autocomplete__hidden');
                return;
            } else {
                return;
            }

            // Atualiza item ativo visualmente
            items.forEach(item => item.classList.remove('autocomplete__item--active'));
            items[idx].classList.add('autocomplete__item--active');
            items[idx].scrollIntoView({ block: 'nearest' });
        });
    },

    /**
     * Setup do helper text e checkbox de distância manual.
     */
    setupDistanceAutofill: function() {
        const originInput      = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        const distanceInput    = document.getElementById('distance');
        const manualCheckbox   = document.getElementById('manual-distance');
        const helperText       = document.querySelector('.form-group__helper-text');

        const onCityChange = () => {
            const origin      = originInput.value.trim();
            const destination = destinationInput.value.trim();

            if (origin && destination && !manualCheckbox.checked) {
                distanceInput.value    = '';
                distanceInput.readOnly = true;

                if (helperText) {
                    helperText.textContent = '🔍 A distância será calculada automaticamente ao clicar em "Calcular Emissão".';
                    helperText.style.color = '#6b7280';
                }
            }
        };

        originInput.addEventListener('input', onCityChange);
        destinationInput.addEventListener('input', onCityChange);

        manualCheckbox.addEventListener('change', function() {
            if (this.checked) {
                distanceInput.readOnly = false;
                distanceInput.value    = '';
                distanceInput.focus();
                if (helperText) {
                    helperText.textContent = 'Digite a distância manualmente em km.';
                    helperText.style.color = '#6b7280';
                }
            } else {
                distanceInput.readOnly = true;
                distanceInput.value    = '';
                onCityChange();
            }
        });

        // Inicializa autocomplete nos dois campos de cidade
        this.setupAutocomplete('origin', 'origin-dropdown');
        this.setupAutocomplete('destination', 'destination-dropdown');
    }
};
