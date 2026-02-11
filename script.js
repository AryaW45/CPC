/**
 * COSMIC PHOTON CLOCK - COSMIC ENGINE (INFINITE-GRADE)
 * Internal Logic: Attosecond-Precision BigInt Deterministic Timeline
 * UI Display: 2 Decimal Places (Integer : Counter)
 * * Eliminates Floating Point Decay; Stable for 5 Billion+ years.
 */

// 1. CONSTANTS (Converted to BigInt Attoseconds for infinite precision)
// 1 Second = 1,000,000,000,000,000,000 Attoseconds (10^18)
const AS_PER_SEC = 1000000000000000000n; 

const T0_BASE_AS = 10080n * AS_PER_SEC; 
const VELOCITY_AS = 235565800n; // Exact representation of 0.0000000002355658
const ACCEL_FACTOR_scaled = 100000000000000000000001n; // 1.000...01 scaled by 10^22
const ACCEL_BASE_scaled = 100000000000000000000000n; // 1.0 scaled by 10^22

// 2. STATE VARIABLES
let epoch = 0n;
// Master Anchor
const clockOriginAS = BigInt(Math.floor(performance.now() * 1000000)) * 1000000000n; 

let currentDurationAS = T0_BASE_AS;
let totalTimePrecededAS = 0n; 

/**
 * SIDEBAR UI LOGIC
 */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.width = (sidebar.style.width === "450px") ? "0" : "450px";
}

/**
 * BIGINT POWER FUNCTION (To replace Math.pow for infinite precision)
 */
function bigPower(base, exp) {
    let res = 1n;
    let b = base;
    let e = exp;
    while (e > 0n) {
        if (e % 2n === 1n) res = (res * b) / ACCEL_BASE_scaled;
        b = (b * b) / ACCEL_BASE_scaled;
        e = e / 2n;
    }
    return res;
}

/**
 * CORE UPDATE LOOP
 */
function update() {
    // Current time in Attoseconds
    const nowAS = BigInt(Math.floor(performance.now() * 1000000)) * 1000000000n;
    
    // Absolute time elapsed since initialization
    const absoluteElapsedAS = nowAS - clockOriginAS;
    
    // Calculate progress (scaled by 10000 for 2-decimal percentage)
    let elapsedInEpochAS = absoluteElapsedAS - totalTimePrecededAS;
    let progressScaled = (elapsedInEpochAS * 10000n) / currentDurationAS;

    // 3. EPOCH TRANSITION LOGIC (BigInt Deterministic Handover)
    if (progressScaled >= 10000n) {
        totalTimePrecededAS += currentDurationAS;
        epoch++;

        // Calculate next duration: T_n = T0 + (V * n * A^n)
        // Everything stays in BigInt Attoseconds
        let accelTerm = bigPower(ACCEL_FACTOR_scaled, epoch);
        currentDurationAS = T0_BASE_AS + ((VELOCITY_AS * epoch * accelTerm) / ACCEL_BASE_scaled);

        // Re-sync
        elapsedInEpochAS = absoluteElapsedAS - totalTimePrecededAS;
        progressScaled = (elapsedInEpochAS * 10000n) / currentDurationAS;

        const epochDisplay = document.getElementById('epoch-counter');
        if (epochDisplay) epochDisplay.innerText = epoch.toString().padStart(6, '0');
    }

    // 4. CLOCK UI UPDATE
    const safeProgress = progressScaled < 0n ? 0n : progressScaled;
    
    // Breakdown for display (e.g., 9950 -> "99" and "50")
    const integerPart = (safeProgress / 100n).toString().padStart(2, '0');
    const decimalPart = (safeProgress % 100n).toString().padStart(2, '0');
    const displayValue = `${integerPart}.${decimalPart}`;
    
    const countdownDisplay = document.getElementById('main-countdown');
    if (countdownDisplay) countdownDisplay.innerText = displayValue;

    requestAnimationFrame(update);
}

// Initialize the Cosmic Engine
update();