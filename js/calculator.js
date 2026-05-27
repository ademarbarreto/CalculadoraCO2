/**
 * Calculator - Global calculator object for CO2 emissions
 * Contains all calculation methods for emissions, comparisons, carbon credits, and frequency.
 */

const Calculator = {

    /**
     * Calculate CO2 emission for a given distance and transport mode.
     * @param {number} distanceKm
     * @param {string} transportMode
     * @returns {number} kg CO2, rounded to 2 decimal places
     */
    calculateEmission: function(distanceKm, transportMode) {
        const emissionFactor = CONFIG.EMISSION_FACTORS[transportMode];
        const emission = distanceKm * emissionFactor;
        return Math.round(emission * 100) / 100;
    },

    /**
     * Calculate emissions for all transport modes sorted by emission (lowest first).
     * @param {number} distanceKm
     * @returns {Array<{ mode, emission, percentageVsCar }>}
     */
    calculateAllModes: function(distanceKm) {
        const results = [];
        const carEmission = this.calculateEmission(distanceKm, 'car');

        for (const mode in CONFIG.EMISSION_FACTORS) {
            const emission = this.calculateEmission(distanceKm, mode);
            const percentageVsCar = carEmission > 0
                ? Math.round((emission / carEmission) * 100 * 100) / 100
                : 0;
            results.push({ mode, emission, percentageVsCar });
        }

        results.sort((a, b) => a.emission - b.emission);
        return results;
    },

    /**
     * Calculate CO2 savings vs a baseline emission.
     * @param {number} emission
     * @param {number} baselineEmission
     * @returns {{ savedKg: number, percentage: number }}
     */
    calculateSavings: function(emission, baselineEmission) {
        const savedKg = baselineEmission - emission;
        const percentage = baselineEmission > 0
            ? (savedKg / baselineEmission) * 100
            : 0;
        return {
            savedKg:    Math.round(savedKg    * 100) / 100,
            percentage: Math.round(percentage * 100) / 100
        };
    },

    /**
     * Calculate carbon credits needed to offset the emission.
     * @param {number} emissionKg
     * @returns {number} credits, rounded to 4 decimal places
     */
    calculateCarbonCredits: function(emissionKg) {
        const credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
        return Math.round(credits * 10000) / 10000;
    },

    /**
     * Estimate the price range for carbon credits in BRL.
     * @param {number} credits
     * @returns {{ min, max, average }}
     */
    estimateCreditPrice: function(credits) {
        const min     = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
        const max     = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
        const average = (min + max) / 2;
        return {
            min:     Math.round(min     * 100) / 100,
            max:     Math.round(max     * 100) / 100,
            average: Math.round(average * 100) / 100
        };
    },

    /**
     * Calculate accumulated CO2 emissions based on weekly trip frequency.
     * @param {number} emissionPerTrip - kg CO2 per single trip (one way)
     * @param {number} tripsPerWeek    - number of trips per week (e.g. 5 for weekdays)
     * @param {boolean} roundTrip      - if true, doubles the emission per day
     * @returns {{
     *   perTrip:   number,  // kg CO2 per single trip
     *   weekly:    number,  // kg CO2 per week
     *   monthly:   number,  // kg CO2 per month (× 4.33)
     *   yearly:    number,  // kg CO2 per year  (× 52)
     *   tripsPerWeek: number,
     *   roundTrip: boolean
     * }}
     */
    calculateFrequency: function(emissionPerTrip, tripsPerWeek, roundTrip = false) {
        const tripEmission = roundTrip
            ? Math.round(emissionPerTrip * 2 * 100) / 100
            : emissionPerTrip;

        const weekly  = Math.round(tripEmission * tripsPerWeek * 100) / 100;
        const monthly = Math.round(weekly * 4.33 * 100) / 100;   // média de semanas/mês
        const yearly  = Math.round(weekly * 52   * 100) / 100;   // 52 semanas/ano

        return { perTrip: tripEmission, weekly, monthly, yearly, tripsPerWeek, roundTrip };
    }
};
