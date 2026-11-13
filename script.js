// ==========================================================================
// KERNEL ESTADÍSTICO // UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
// FACULTAD DE INGENIERÍA EN SISTEMAS
// ESTUDIANTE: DAVID EMANUEL BALTAZAR GASPAR
// ==========================================================================

// --- RELOJ DE KERNEL EN VIVO ---
function initKernelClock() {
    function update() {
        const el = document.getElementById('system-clock');
        if (!el) return;
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const sec = String(now.getSeconds()).padStart(2, '0');
        el.textContent = `${hrs}:${min}:${sec} UTC-6`;
    }
    update();
    setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', initKernelClock);

// --- ATAJOS DE TECLADO Y CARGA INICIAL ---
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        // Cerrar modal flotante con tecla Escape
        if (e.key === 'Escape') {
            cerrarModalImpresion();
            return;
        }

        // Interceptar Ctrl+P o Cmd+P para abrir el Centro de Impresión Inteligente
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            abrirModalImpresion();
            return;
        }

        // Si el usuario presiona números 1 a 8 cambia de pestaña según el modo activo
        if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            const isCalcMode = document.getElementById('btn-mode-calc')?.classList.contains('active');
            if (isCalcMode) {
                const calcTabs = ['calc-binomial', 'calc-binomial-neg', 'calc-poisson', 'calc-exponencial', 'calc-normal'];
                const idx = parseInt(e.key, 10) - 1;
                if (idx >= 0 && idx < calcTabs.length) {
                    openTab(calcTabs[idx]);
                }
            } else {
                const tabId = 'ej' + e.key;
                openTab(tabId);
            }
        }
        // Atajo 'A' para ejecutar todos
        if ((e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            ejecutarTodosLosModulos();
        }
    });
}

// --- INICIALIZACIÓN Y SMART NAVBAR (HIDE ON SCROLL DOWN, SHOW ON SCROLL UP) ---
function initSmartHeader() {
    const header = document.querySelector('.app-header');
    if (!header) return;

    let lastY = 0;

    function handleScrollEvent(currentY) {
        if (currentY <= 40) {
            header.classList.remove('header-hidden');
            lastY = currentY;
            return;
        }

        if (currentY > lastY + 8) {
            // Bajando -> Ocultar encabezado
            header.classList.add('header-hidden');
        } else if (currentY < lastY - 8) {
            // Subiendo -> Mostrar encabezado
            header.classList.remove('header-hidden');
        }
        lastY = currentY;
    }

    window.addEventListener('scroll', () => {
        const y = window.pageYOffset || document.documentElement.scrollTop || 0;
        handleScrollEvent(y);
    }, { passive: true });

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('scroll', () => {
            handleScrollEvent(mainContent.scrollTop);
        }, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initKernelClock();
    initKeyboardShortcuts();
    initSmartHeader();
});

// --- GENERADORES DE GRÁFICOS SVG NATIVOS ---
function generarGraficoBinomialSVG(n, p, umbralCorte) {
    const ancho = 580, alto = 180, padX = 40, padY = 25;
    const maxX = 8; // Mostrar hasta 8 donde se concentra la masa
    let puntos = [];
    let maxProb = 0;

    for (let x = 0; x <= maxX; x++) {
        let prob = probBinomial(n, x, p);
        if (prob > maxProb) maxProb = prob;
        puntos.push({ x, prob });
    }

    const escalaY = (alto - 2 * padY) / maxProb;
    const pasoX = (ancho - 2 * padX) / maxX;

    let barras = puntos.map(pt => {
        let h = pt.prob * escalaY;
        let xPos = padX + pt.x * pasoX - 12;
        let yPos = alto - padY - h;
        let esAlerta = pt.x >= umbralCorte;
        let fill = esAlerta ? '#f43f5e' : '#00f0ff';
        let glow = esAlerta ? 'rgba(244,63,94,0.4)' : 'rgba(0,240,255,0.4)';
        let etiqueta = (pt.prob * 100).toFixed(1) + '%';

        return `
            <g>
                <rect x="${xPos}" y="${yPos}" width="24" height="${h}" rx="3" fill="${fill}" style="filter: drop-shadow(0 0 6px ${glow}); transition: all 0.3s;" />
                <text x="${xPos + 12}" y="${yPos - 6}" fill="#94a3b8" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">${etiqueta}</text>
                <text x="${xPos + 12}" y="${alto - 8}" fill="${esAlerta ? '#f43f5e' : '#cbd5e1'}" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">x=${pt.x}</text>
            </g>
        `;
    }).join('');

    return `
        <div class="chart-container">
            <div class="chart-header">
                <span class="chart-title">// TELEMETRÍA GRÁFICA : DISTRIBUCIÓN DE MASA P(X=x)</span>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color blue"></span> Operación Normal (x &lt; ${umbralCorte})</span>
                    <span class="legend-item"><span class="legend-color red"></span> Suspensión Liberación (x &ge; ${umbralCorte})</span>
                </div>
            </div>
            <svg class="chart-svg" viewBox="0 0 ${ancho} ${alto}">
                <!-- Línea base eje X -->
                <line x1="${padX - 10}" y1="${alto - padY}" x2="${ancho - padX + 20}" y2="${alto - padY}" stroke="#334155" stroke-width="1.5" />
                ${barras}
            </svg>
        </div>
    `;
}

function generarGraficoNormalSVG(mu, sigma, xSla) {
    const ancho = 580, alto = 180, padX = 40, padY = 30;
    const minX = mu - 3.5 * sigma;
    const maxX = mu + 3.5 * sigma;
    const maxDensity = 1 / (sigma * Math.sqrt(2 * Math.PI));

    const toSvgX = (x) => padX + ((x - minX) / (maxX - minX)) * (ancho - 2 * padX);
    const toSvgY = (y) => (alto - padY) - (y / maxDensity) * (alto - 2 * padY);

    let pathD = "";
    let areaSlaD = `M ${toSvgX(minX)} ${alto - padY}`;

    for (let x = minX; x <= maxX; x += 1.5) {
        let z = (x - mu) / sigma;
        let y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
        let sx = toSvgX(x);
        let sy = toSvgY(y);

        if (pathD === "") pathD = `M ${sx} ${sy}`;
        else pathD += ` L ${sx} ${sy}`;

        if (x <= xSla) {
            areaSlaD += ` L ${sx} ${sy}`;
        }
    }
    areaSlaD += ` L ${toSvgX(xSla)} ${alto - padY} Z`;

    const xSlaPos = toSvgX(xSla);
    const xMuPos = toSvgX(mu);

    return `
        <div class="chart-container">
            <div class="chart-header">
                <span class="chart-title">// CURVA GAUSSIANA & COBERTURA SLA CONTRACTUAL</span>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color green"></span> SLA Cumplido (≤ 300 ms : 95.67%)</span>
                    <span class="legend-item"><span class="legend-color red"></span> Excedente SLA (> 300 ms : 4.33%)</span>
                </div>
            </div>
            <svg class="chart-svg" viewBox="0 0 ${ancho} ${alto}">
                <defs>
                    <linearGradient id="slaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
                        <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
                    </linearGradient>
                </defs>
                <!-- Área bajo la curva SLA -->
                <path d="${areaSlaD}" fill="url(#slaGradient)"></path>
                <!-- Curva Campana -->
                <path d="${pathD}" fill="none" stroke="#00f0ff" stroke-width="2.5" style="filter: drop-shadow(0 0 6px rgba(0,240,255,0.6));"></path>
                <!-- Línea Media Mu -->
                <line x1="${xMuPos}" y1="${alto - padY}" x2="${xMuPos}" y2="${toSvgY(maxDensity)}" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,4"/>
                <text x="${xMuPos}" y="${toSvgY(maxDensity) - 6}" fill="#a855f7" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">μ=240 ms</text>
                <!-- Línea SLA 300ms -->
                <line x1="${xSlaPos}" y1="${alto - padY}" x2="${xSlaPos}" y2="${padY}" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,3"/>
                <text x="${xSlaPos}" y="${padY - 8}" fill="#f43f5e" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Límite SLA (300 ms)</text>
                <!-- Eje X -->
                <line x1="${padX}" y1="${alto - padY}" x2="${ancho - padX}" y2="${alto - padY}" stroke="#334155" stroke-width="1.5"/>
                <text x="${padX}" y="${alto - 10}" fill="#64748b" font-size="9" font-family="'JetBrains Mono', monospace">135 ms</text>
                <text x="${xMuPos}" y="${alto - 10}" fill="#94a3b8" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">240 ms</text>
                <text x="${ancho - padX}" y="${alto - 10}" fill="#64748b" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="end">345 ms</text>
            </svg>
        </div>
    `;
}

// Generador SVG para Procesos de Poisson
function generarGraficoPoissonSVG(lambda, umbralRiesgo, maxK, titulo) {
    const ancho = 580, alto = 180, padX = 40, padY = 25;
    let puntos = [];
    let maxProb = 0;

    for (let x = 0; x <= maxK; x++) {
        let prob = probPoisson(lambda, x);
        if (prob > maxProb) maxProb = prob;
        puntos.push({ x, prob });
    }

    const escalaY = (alto - 2 * padY) / maxProb;
    const pasoX = (ancho - 2 * padX) / maxK;

    let barras = puntos.map(pt => {
        let h = pt.prob * escalaY;
        let xPos = padX + pt.x * pasoX - 8;
        let yPos = alto - padY - h;
        let esRiesgo = pt.x > umbralRiesgo;
        let fill = esRiesgo ? '#f43f5e' : '#00f0ff';
        let glow = esRiesgo ? 'rgba(244,63,94,0.4)' : 'rgba(0,240,255,0.4)';

        return `
            <g>
                <rect x="${xPos}" y="${yPos}" width="16" height="${h}" rx="2" fill="${fill}" style="filter: drop-shadow(0 0 5px ${glow});" />
                <text x="${xPos + 8}" y="${alto - 8}" fill="${esRiesgo ? '#f43f5e' : '#94a3b8'}" font-size="8.5" font-family="'JetBrains Mono', monospace" font-weight="${esRiesgo ? '700' : '400'}" text-anchor="middle">${pt.x}</text>
            </g>
        `;
    }).join('');

    return `
        <div class="chart-container">
            <div class="chart-header">
                <span class="chart-title">// TELEMETRÍA POISSON : ${titulo} (λ=${lambda})</span>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color blue"></span> Frecuencia Normal (x &le; ${umbralRiesgo})</span>
                    <span class="legend-item"><span class="legend-color red"></span> Alerta / Riesgo (x &gt; ${umbralRiesgo})</span>
                </div>
            </div>
            <svg class="chart-svg" viewBox="0 0 ${ancho} ${alto}">
                <line x1="${padX - 10}" y1="${alto - padY}" x2="${ancho - padX + 15}" y2="${alto - padY}" stroke="#334155" stroke-width="1.5" />
                ${barras}
            </svg>
        </div>
    `;
}

// Generador SVG para Binomial Negativa
function generarGraficoBinomialNegativaSVG(r, p, maxTolerado, maxK, titulo) {
    const ancho = 580, alto = 180, padX = 40, padY = 25;
    let puntos = [];
    let maxProb = 0;

    for (let x = r; x <= maxK; x++) {
        let prob = probBinomialNeg(x, r, p);
        if (prob > maxProb) maxProb = prob;
        puntos.push({ x, prob });
    }

    const escalaY = (alto - 2 * padY) / maxProb;
    const pasoX = (ancho - 2 * padX) / (maxK - r + 1);

    let barras = puntos.map((pt, idx) => {
        let h = pt.prob * escalaY;
        let xPos = padX + idx * pasoX;
        let yPos = alto - padY - h;
        let esOk = pt.x <= maxTolerado;
        let fill = esOk ? '#10b981' : '#f59e0b';
        let glow = esOk ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)';
        let etiqueta = (pt.prob * 100).toFixed(1) + '%';

        return `
            <g>
                <rect x="${xPos}" y="${yPos}" width="22" height="${h}" rx="3" fill="${fill}" style="filter: drop-shadow(0 0 6px ${glow});" />
                <text x="${xPos + 11}" y="${yPos - 5}" fill="#94a3b8" font-size="8.5" font-family="'JetBrains Mono', monospace" text-anchor="middle">${etiqueta}</text>
                <text x="${xPos + 11}" y="${alto - 8}" fill="${esOk ? '#10b981' : '#f59e0b'}" font-size="9.5" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">i=${pt.x}</text>
            </g>
        `;
    }).join('');

    return `
        <div class="chart-container">
            <div class="chart-header">
                <span class="chart-title">// MODELADO ESTOCÁSTICO : ${titulo} (r=${r}, p=${p})</span>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color green"></span> Dentro de Tolerancia (i &le; ${maxTolerado})</span>
                    <span class="legend-item"><span class="legend-color red"></span> Excede Límite (i &gt; ${maxTolerado})</span>
                </div>
            </div>
            <svg class="chart-svg" viewBox="0 0 ${ancho} ${alto}">
                <line x1="${padX - 10}" y1="${alto - padY}" x2="${ancho - padX + 15}" y2="${alto - padY}" stroke="#334155" stroke-width="1.5" />
                ${barras}
            </svg>
        </div>
    `;
}

// Generador SVG para Distribución Exponencial
function generarGraficoExponencialSVG(lambda, corteT, maxT) {
    const ancho = 580, alto = 180, padX = 40, padY = 30;
    const maxDensity = lambda;

    const toSvgX = (t) => padX + (t / maxT) * (ancho - 2 * padX);
    const toSvgY = (y) => (alto - padY) - (y / maxDensity) * (alto - 2 * padY);

    let pathD = "";
    let areaColaD = `M ${toSvgX(corteT)} ${alto - padY}`;

    for (let t = 0; t <= maxT; t += 0.25) {
        let y = lambda * Math.exp(-lambda * t);
        let sx = toSvgX(t);
        let sy = toSvgY(y);

        if (pathD === "") pathD = `M ${sx} ${sy}`;
        else pathD += ` L ${sx} ${sy}`;

        if (t >= corteT) {
            areaColaD += ` L ${sx} ${sy}`;
        }
    }
    areaColaD += ` L ${toSvgX(maxT)} ${alto - padY} Z`;

    const xCortePos = toSvgX(corteT);

    return `
        <div class="chart-container">
            <div class="chart-header">
                <span class="chart-title">// TIEMPO DE INTERARRIBO CONTINUO : F(t) = λe^(-λt) (λ=0.20 msg/s)</span>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color blue"></span> Flujo Normal de Eventos</span>
                    <span class="legend-item"><span class="legend-color red"></span> Umbral Alerta Timeout (T &gt; ${corteT}s : 4.98%)</span>
                </div>
            </div>
            <svg class="chart-svg" viewBox="0 0 ${ancho} ${alto}">
                <defs>
                    <linearGradient id="expTailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.5"/>
                        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.05"/>
                    </linearGradient>
                </defs>
                <!-- Área cola crítica -->
                <path d="${areaColaD}" fill="url(#expTailGrad)"></path>
                <!-- Curva Exponencial -->
                <path d="${pathD}" fill="none" stroke="#00f0ff" stroke-width="2.5" style="filter: drop-shadow(0 0 6px rgba(0,240,255,0.5));"></path>
                <!-- Línea Umbral 15s -->
                <line x1="${xCortePos}" y1="${alto - padY}" x2="${xCortePos}" y2="${padY}" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,3"/>
                <text x="${xCortePos}" y="${padY - 8}" fill="#f43f5e" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">Timeout (${corteT}s)</text>
                <!-- Eje X -->
                <line x1="${padX}" y1="${alto - padY}" x2="${ancho - padX}" y2="${alto - padY}" stroke="#334155" stroke-width="1.5"/>
                <text x="${padX}" y="${alto - 10}" fill="#64748b" font-size="9" font-family="'JetBrains Mono', monospace">0s</text>
                <text x="${toSvgX(5)}" y="${alto - 10}" fill="#94a3b8" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="middle">Media (5s)</text>
                <text x="${xCortePos}" y="${alto - 10}" fill="#f43f5e" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">${corteT}s</text>
                <text x="${ancho - padX}" y="${alto - 10}" fill="#64748b" font-size="9" font-family="'JetBrains Mono', monospace" text-anchor="end">${maxT}s</text>
            </svg>
        </div>
    `;
}

// Ejecutar todos los 8 módulos simultáneamente
function ejecutarTodosLosModulos() {
    calcularEj1();
    calcularEj2();
    calcularEj3();
    calcularEj4();
    calcularEj5();
    calcularEj6();
    calcularEj7();
    calcularEj8();
}
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function combinatoria(n, k) {
    if (k < 0 || k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function probBinomial(n, x, p) {
    return combinatoria(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

function probBinomialNeg(x, r, p) {
    return combinatoria(x - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, x - r);
}

function probPoisson(lambda, x) {
    return (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial(x);
}

function normalCDF(x, mu, sigma) {
    let z = (x - mu) / sigma;
    let t = 1 / (1 + 0.2316419 * Math.abs(z));
    let d = 0.3989423 * Math.exp(-z * z / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - prob : prob;
}

function probExponencialCDF(lambda, t) {
    if (t <= 0) return 0;
    return 1 - Math.exp(-lambda * t);
}

function exponencialInvCDF(lambda, p) {
    if (p <= 0) return 0;
    if (p >= 1) return Infinity;
    return -Math.log(1 - p) / lambda;
}

// Inversa de la Normal Estándar Z_p usando aproximación racional de alta precisión (Acklam)
function normalInvCDF(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;

    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    const p_low = 0.02425;
    const p_high = 1 - p_low;
    let q, r;

    if (p < p_low) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= p_high) {
        q = p - 0.5;
        r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
}

function format(num) {
    return (num * 100).toFixed(2) + " %";
}

function getNumber(id) {
    const element = document.getElementById(id);
    return element ? Number(element.value) : NaN;
}

function mostrarResultadoCalculadora(loaderId, resultId, title, lines) {
    const result = document.getElementById(resultId);
    const loader = document.getElementById(loaderId);
    if (!result) {
        console.error(`No se encontró el contenedor de resultados: ${resultId}`);
        return;
    }
    if (loader) loader.style.display = 'none';
    result.innerHTML = `
        <div class="results-header-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${title}
        </div>
        ${lines.map(line => `<div class="inciso"><div class="math"><span class="math-icon">&gt;_</span>${line}</div></div>`).join('')}
    `;
    result.style.display = 'block';
}

function validarNumeros(values, message) {
    if (values.some(value => !Number.isFinite(value))) {
        window.alert(message);
        return false;
    }
    return true;
}

function sumDiscrete(probability, start, end) {
    let total = 0;
    for (let value = start; value <= end; value++) total += probability(value);
    return total;
}

function evaluarBinomial(n, p, op, x, b) {
    const cdf = (limit) => sumDiscrete(value => probBinomial(n, value, p), 0, Math.floor(limit));
    if (op === 'eq') return probBinomial(n, x, p);
    if (op === 'lte') return cdf(x);
    if (op === 'lt') return cdf(x - 1);
    if (op === 'gte') return 1 - cdf(x - 1);
    if (op === 'gt') return 1 - cdf(x);
    if (op === 'between') return sumDiscrete(value => probBinomial(n, value, p), Math.ceil(x), Math.floor(b));
    return 1;
}

function evaluarBinomialNeg(r, p, op, x, b) {
    const minimum = r;
    const pmf = value => value < minimum ? 0 : probBinomialNeg(value, r, p);
    const cdf = limit => sumDiscrete(pmf, minimum, Math.floor(limit));
    if (op === 'eq') return pmf(x);
    if (op === 'lte') return cdf(x);
    if (op === 'gte') return 1 - cdf(x - 1);
    if (op === 'gt') return 1 - cdf(x);
    if (op === 'between') return sumDiscrete(pmf, Math.ceil(x), Math.floor(b));
    return 1;
}

function evaluarPoisson(lambda, op, x, b) {
    const cdf = limit => sumDiscrete(value => probPoisson(lambda, value), 0, Math.floor(limit));
    if (op === 'eq') return probPoisson(lambda, x);
    if (op === 'lte') return cdf(x);
    if (op === 'gte') return 1 - cdf(x - 1);
    if (op === 'gt') return 1 - cdf(x);
    if (op === 'between') return sumDiscrete(value => probPoisson(lambda, value), Math.ceil(x), Math.floor(b));
    return 1;
}

function ejecutarCalcBinomial(btn) {
    const n = getNumber('bin_n'), p = getNumber('bin_p');
    const op = document.getElementById('bin_op').value;
    const x = getNumber('bin_x'), b = getNumber('bin_b');
    if (!validarNumeros([n, p, x, b], 'Ingrese valores numéricos válidos.') || n < 1 || p < 0 || p > 1) return;
    const probability = evaluarBinomial(Math.floor(n), p, op, x, b);
    ejecutarProcesamientoConLoader('calc_binomial', btn, () => mostrarResultadoCalculadora(
        'loader_calc_binomial', 'res_calc_binomial', 'CÁLCULO BINOMIAL COMPLETADO',
        [`P(X ${op} ${x}) = ${(probability * 100).toFixed(4)} %`, `Parámetros: n = ${n}, p = ${p}`]
    ));
}

function ejecutarCalcBinomialNeg(btn) {
    const r = getNumber('nb_r'), p = getNumber('nb_p');
    const op = document.getElementById('nb_op').value;
    const x = getNumber('nb_x'), b = getNumber('nb_b');
    if (!validarNumeros([r, p, x, b], 'Ingrese valores numéricos válidos.') || r < 1 || p <= 0 || p > 1 || x < r) return;
    const probability = evaluarBinomialNeg(Math.floor(r), p, op, x, b);
    ejecutarProcesamientoConLoader('calc_nb', btn, () => mostrarResultadoCalculadora(
        'loader_calc_nb', 'res_calc_nb', 'CÁLCULO BINOMIAL NEGATIVO COMPLETADO',
        [`P(X ${op} ${x}) = ${(probability * 100).toFixed(4)} %`, `Parámetros: r = ${r}, p = ${p}`]
    ));
}

function ejecutarCalcPoisson(btn) {
    const lambda = getNumber('poi_lambda'), x = getNumber('poi_x'), b = getNumber('poi_b');
    const op = document.getElementById('poi_op').value;
    if (!validarNumeros([lambda, x, b], 'Ingrese valores numéricos válidos.') || lambda <= 0) return;
    const probability = evaluarPoisson(lambda, op, x, b);
    ejecutarProcesamientoConLoader('calc_poisson', btn, () => mostrarResultadoCalculadora(
        'loader_calc_poisson', 'res_calc_poisson', 'CÁLCULO DE POISSON COMPLETADO',
        [`P(X ${op} ${x}) = ${(probability * 100).toFixed(4)} %`, `Parámetro: λ = ${lambda}`]
    ));
}

function ejecutarCalcExponencial(btn) {
    const input = getNumber('exp_val');
    const lambda = document.getElementById('exp_mode').value === 'mean' ? 1 / input : input;
    const op = document.getElementById('exp_op').value;
    const t = getNumber('exp_t'), b = getNumber('exp_b'), target = getNumber('exp_p');
    if (!validarNumeros([input, t, b, target], 'Ingrese valores numéricos válidos.') || input <= 0 || target <= 0 || target >= 1) return;
    let value;
    if (op === 'inv') value = exponencialInvCDF(lambda, target);
    else if (op === 'lte') value = probExponencialCDF(lambda, t);
    else if (op === 'gt') value = 1 - probExponencialCDF(lambda, t);
    else if (op === 'between') value = probExponencialCDF(lambda, b) - probExponencialCDF(lambda, t);
    else value = 1;
    const label = op === 'inv' ? `Percentil ${target}: t = ${value.toFixed(4)}` : `P(T ${op} ${t}) = ${(value * 100).toFixed(4)} %`;
    ejecutarProcesamientoConLoader('calc_exp', btn, () => mostrarResultadoCalculadora(
        'loader_calc_exp', 'res_calc_exp', 'CÁLCULO EXPONENCIAL COMPLETADO',
        [label, `Tasa utilizada: λ = ${lambda.toFixed(6)}`]
    ));
}

function ejecutarCalcNormal(btn) {
    const mu = getNumber('norm_mu'), sigma = getNumber('norm_sigma');
    const op = document.getElementById('norm_op').value;
    const x = getNumber('norm_x'), b = getNumber('norm_b'), target = getNumber('norm_p');
    if (!validarNumeros([mu, sigma, x, b, target], 'Ingrese valores numéricos válidos.') || sigma <= 0 || target <= 0 || target >= 1) return;
    let value;
    if (op === 'inv') value = mu + sigma * normalInvCDF(target);
    else if (op === 'lte') value = normalCDF(x, mu, sigma);
    else if (op === 'gte' || op === 'gt') value = 1 - normalCDF(x, mu, sigma);
    else if (op === 'between') value = normalCDF(b, mu, sigma) - normalCDF(x, mu, sigma);
    else value = normalCDF(x, mu, sigma);
    const label = op === 'inv' ? `Percentil ${target}: x = ${value.toFixed(4)}` : `P(X ${op} ${x}) = ${(value * 100).toFixed(4)} %`;
    ejecutarProcesamientoConLoader('calc_normal', btn, () => mostrarResultadoCalculadora(
        'loader_calc_normal', 'res_calc_normal', 'CÁLCULO NORMAL COMPLETADO',
        [label, `Parámetros: μ = ${mu}, σ = ${sigma}`]
    ));
}

function cargarPresetBinomial(n, p, op, x) {
    document.getElementById('bin_n').value = n;
    document.getElementById('bin_p').value = p;
    document.getElementById('bin_op').value = op;
    document.getElementById('bin_x').value = x;
    toggleBinomialInputs();
}

function cargarPresetBinomialNeg(r, p, op, x) {
    document.getElementById('nb_r').value = r;
    document.getElementById('nb_p').value = p;
    document.getElementById('nb_op').value = op;
    document.getElementById('nb_x').value = x;
    toggleBinomialNegInputs();
}

function cargarPresetPoisson(lambda, op, x) {
    document.getElementById('poi_lambda').value = lambda;
    document.getElementById('poi_op').value = op;
    document.getElementById('poi_x').value = x;
    togglePoissonInputs();
}

function cargarPresetExponencial(value, op, target) {
    document.getElementById('exp_val').value = value;
    document.getElementById('exp_op').value = op;
    if (op === 'inv') document.getElementById('exp_p').value = target;
    else document.getElementById('exp_t').value = target;
    toggleExpInputs();
}

function cargarPresetNormal(mu, sigma, op, x, b) {
    document.getElementById('norm_mu').value = mu;
    document.getElementById('norm_sigma').value = sigma;
    document.getElementById('norm_op').value = op;
    if (op === 'inv') document.getElementById('norm_p').value = x;
    else document.getElementById('norm_x').value = x;
    if (b !== undefined) document.getElementById('norm_b').value = b;
    toggleNormalInputs();
}

function toggleInputGroup(operationId, xWrapId, bWrapId, inverseWrapId) {
    const operation = document.getElementById(operationId).value;
    const xWrap = document.getElementById(xWrapId);
    const bWrap = document.getElementById(bWrapId);
    if (xWrap) xWrap.style.display = operation === 'inv' ? 'none' : '';
    if (bWrap) bWrap.style.display = operation === 'between' ? '' : 'none';
    if (inverseWrapId) {
        const inverseWrap = document.getElementById(inverseWrapId);
        if (inverseWrap) inverseWrap.style.display = operation === 'inv' ? '' : 'none';
    }
}

function toggleBinomialInputs() { toggleInputGroup('bin_op', 'wrap_bin_x', 'wrap_bin_b'); }
function toggleBinomialNegInputs() { toggleInputGroup('nb_op', 'wrap_nb_x', 'wrap_nb_b'); }
function togglePoissonInputs() { toggleInputGroup('poi_op', 'wrap_poi_x', 'wrap_poi_b'); }
function toggleExpInputs() { toggleInputGroup('exp_op', 'wrap_exp_t', 'wrap_exp_b', 'wrap_exp_p'); }
function toggleNormalInputs() { toggleInputGroup('norm_op', 'wrap_norm_x', 'wrap_norm_b', 'wrap_norm_p'); }
function toggleExpMode() {}
function togglePoissonHelper() {
    const body = document.getElementById('helper-poi-body');
    if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}
function aplicarEscalaPoisson() {
    const base = getNumber('poi_help_k'), baseTime = getNumber('poi_help_t1'), targetTime = getNumber('poi_help_t2');
    if (validarNumeros([base, baseTime, targetTime], 'Complete los datos de escala temporal.') && baseTime > 0) {
        const lambda = (base / baseTime) * targetTime;
        const field = document.getElementById('poi_lambda');
        if (field) field.value = lambda.toFixed(4);
    }
}

// --- NAVEGACIÓN Y CONTROL DE PESTAÑAS ---
function switchAppMode(mode) {
    const isCasesMode = mode === 'cases';
    const calcGroup = document.getElementById('nav-calc-group');
    const casesGroup = document.getElementById('nav-cases-group');
    const calcButton = document.getElementById('btn-mode-calc');
    const casesButton = document.getElementById('btn-mode-cases');
    const sidebarLabel = document.getElementById('sidebar-sub-label');

    if (!calcGroup || !casesGroup || !calcButton || !casesButton) {
        console.error('No se pudo cambiar el modo: faltan elementos de navegación.');
        return;
    }

    calcGroup.style.display = isCasesMode ? 'none' : '';
    casesGroup.style.display = isCasesMode ? '' : 'none';
    calcButton.classList.toggle('active', !isCasesMode);
    casesButton.classList.toggle('active', isCasesMode);

    if (sidebarLabel) {
        sidebarLabel.textContent = isCasesMode ? 'EJERCICIOS DEL EXAMEN' : 'CALCULADORA UNIVERSAL';
    }

    const firstTabId = isCasesMode ? 'ej1' : 'calc-binomial';
    openTab(firstTabId);
}

function openTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const found = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (found) found.classList.add('active');
    }
}

// Barra Dinámica Holográfica de Cómputo Futurista
function ejecutarProcesamientoConLoader(ejId, btn, callback) {
    const loader = document.getElementById('loader_' + ejId);
    const results = document.getElementById('res_' + ejId);

    // Si se invoca en modo instantáneo (para exportación / impresión a PDF)
    if (btn === 'instant') {
        callback();
        if (results) results.style.display = 'block';
        if (loader) loader.style.display = 'none';
        return;
    }

    if (results) results.style.display = 'none';

    let origBtnHTML = "";
    if (btn) {
        origBtnHTML = btn.innerHTML;
        btn.innerHTML = `
            <svg class="btn-icon" style="animation: spin 0.8s infinite linear;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
            </svg>
            <span>PROCESANDO...</span>
        `;
        btn.disabled = true;
    }

    if (!loader) {
        callback();
        if (results) results.style.display = 'block';
        if (btn) {
            btn.innerHTML = origBtnHTML;
            btn.disabled = false;
        }
        return;
    }

    loader.innerHTML = `
        <div class="loader-header">
            <div class="loader-title-box">
                <div class="loader-spinner"></div>
                <span class="loader-title">// COMPUTANDO MATRICES DE PROBABILIDAD</span>
            </div>
            <span class="loader-percent" id="pct_${ejId}">0 %</span>
        </div>
        <div class="loader-progress-track">
            <div class="loader-progress-fill" id="bar_${ejId}"></div>
        </div>
        <div class="loader-console">
            <span class="loader-prompt">&gt;_</span>
            <span class="loader-log-text" id="log_${ejId}">[01/04] Conectando procesos matemático y extrayendo parámetros...</span>
        </div>
    `;
    loader.style.display = 'block';

    const bar = document.getElementById('bar_' + ejId);
    const pct = document.getElementById('pct_' + ejId);
    const log = document.getElementById('log_' + ejId);

    setTimeout(() => {
        if (bar) bar.style.width = '35%';
        if (pct) pct.textContent = '35 %';
        if (log) log.textContent = '[02/04] Resolviendo modelos matemáticos y densidades continuas/discretas...';
    }, 280);

    setTimeout(() => {
        if (bar) bar.style.width = '72%';
        if (pct) pct.textContent = '72 %';
        if (log) log.textContent = '[03/04] Generando telemetría gráfica SVG y contrastando umbrales de SLA...';
    }, 600);

    setTimeout(() => {
        if (bar) bar.style.width = '100%';
        if (pct) pct.textContent = '100 %';
        if (log) log.textContent = '[04/04] Validación completada. Desplegando informe de ingeniería...';
    }, 920);

    setTimeout(() => {
        loader.style.display = 'none';
        callback();
        if (results) {
            results.style.display = 'block';
        }
        if (btn) {
            btn.innerHTML = origBtnHTML;
            btn.disabled = false;
        }
    }, 1150);
}

// ==========================================================================
// MÓDULOS DE SOLUCIÓN ESTADÍSTICA
// ==========================================================================

function calcularEj1(btn) {
    ejecutarProcesamientoConLoader('ej1', btn, () => {
        let n = 18, p = 0.12;
        let p3 = probBinomial(n, 3, p);
        let pMax2 = probBinomial(n, 0, p) + probBinomial(n, 1, p) + probBinomial(n, 2, p);
        let pMax3 = pMax2 + p3;
        let pActiva = 1 - pMax3; // P(X >= 4)
        let pAlMenos1 = 1 - probBinomial(n, 0, p);

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA Y AUDITORÍA CIBERNÉTICA PROCESADA
            </div>

            ${generarGraficoBinomialSVG(n, p, 4)}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine la probabilidad de encontrar exactamente 3 componentes con vulnerabilidades críticas.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 3 | n = 18, p = 0.12) = C(18, 3) * (0.12)³ * (0.88)¹⁵ = ${p3.toFixed(4)} (${format(p3)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de que se encuentren como máximo 2 componentes vulnerables.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≤ 2 | n = 18, p = 0.12) = P(0) + P(1) + P(2) = ${pMax2.toFixed(4)} (${format(pMax2)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine la probabilidad de que se active la política de suspensión del lanzamiento (X ≥ 4).</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≥ 4 | n = 18, p = 0.12) = 1 - P(X ≤ 3) = ${pActiva.toFixed(4)} (${format(pActiva)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Calcule la probabilidad de que al menos 1 componente presente una vulnerabilidad crítica.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≥ 1 | n = 18, p = 0.12) = 1 - P(X = 0) = ${pAlMenos1.toFixed(4)} (${format(pAlMenos1)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Si la empresa considera aceptable un riesgo máximo del 10 % de suspender la liberación, determine si el proyecto cumple este criterio.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// EVALUACIÓN DE RIESGO OPERACIONAL:</span>
                    La probabilidad de suspensión calculada en el inciso c es de <strong>${format(pActiva)}</strong>. Dado que 16.18 % es <strong>MAYOR</strong> al umbral máximo permitido del 10 %, el proyecto <strong>NO CUMPLE</strong> con el criterio de seguridad aceptable.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">Explique cómo podría cambiar el modelo si varios componentes compartieran una misma biblioteca vulnerable.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// ANÁLISIS DE ARQUITECTURA DE SOFTWARE:</span>
                    Si múltiples componentes comparten librerías o dependencias comunes, las fallas se propagan en cascada. Esto rompe la <strong>independencia de eventos</strong> e invalida el modelo binomial, ya que la probabilidad de fallo ya no sería del 12% constante.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej1');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj2(btn) {
    ejecutarProcesamientoConLoader('ej2', btn, () => {
        let r = 5, p = 0.75;
        let p7 = probBinomialNeg(7, r, p);
        let pMax8 = 0; for (let i = 5; i <= 8; i++) pMax8 += probBinomialNeg(i, r, p);
        let pAlMenos9 = 1 - pMax8; // P(X >= 9)
        let p5 = Math.pow(p, 5);

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA EN REDES COMPUTACIONALES PROCESADA
            </div>

            ${generarGraficoBinomialNegativaSVG(r, p, 8, 12, 'RETRANSMISIONES DE PAQUETES')}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine la probabilidad de que la quinta retransmisión exitosa ocurra exactamente en el séptimo intento.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 7 | r = 5, p = 0.75) = C(6, 4) * (0.75)⁵ * (0.25)² = ${p7.toFixed(4)} (${format(p7)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de completar las 5 retransmisiones exitosas en un máximo de 8 intentos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≤ 8 | r = 5, p = 0.75) = P(5) + P(6) + P(7) + P(8) = ${pMax8.toFixed(4)} (${format(pMax8)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine la probabilidad de necesitar al menos 9 intentos para completar las 5 retransmisiones exitosas.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≥ 9 | r = 5, p = 0.75) = 1 - P(X ≤ 8) = ${pAlMenos9.toFixed(4)} (${format(pAlMenos9)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Calcule la probabilidad de completar las 5 retransmisiones exitosas exactamente en el quinto intento.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 5 | r = 5, p = 0.75) = C(4, 4) * (0.75)⁵ * (0.25)⁰ = ${p5.toFixed(4)} (${format(p5)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Si el protocolo requiere una probabilidad mínima del 95 % de completar la recuperación dentro de los 8 intentos, determine si cumple con el requisito.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// DICTAMEN DE SLA EN PROTOCOLO:</span>
                    La probabilidad alcanzada es <strong>${format(pMax8)}</strong>. Dado que 88.62 % es <strong>MENOR</strong> al umbral mandatorio del 95.00 %, el protocolo de capa de transporte <strong>NO CUMPLE</strong> con la directiva de confiabilidad requerida.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">¿Qué sucedería si la pérdida de paquetes estuviera relacionada con períodos de congestión y los intentos consecutivos dejaran de ser independientes?</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// IMPACTO EN DISTRIBUCIÓN MATEMÁTICA:</span>
                    El modelo Binomial Negativo dejaría de ser válido, ya que exige independencia. En redes congestionadas, los fallos ocurren en "ráfagas" (no aleatorios), por lo que la probabilidad "p" ya no sería constante.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej2');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj3(btn) {
    ejecutarProcesamientoConLoader('ej3', btn, () => {
        let l_20 = (9 / 15) * 20; // lambda = 12
        let l_5 = (9 / 15) * 5;   // lambda = 3
        let p12 = probPoisson(l_20, 12);
        let pMax15 = 0; for (let i = 0; i <= 15; i++) pMax15 += probPoisson(l_20, i);
        let pRiesgo = 1 - pMax15; // P(X >= 16) o P(X > 15)
        let pMax3 = 0; for (let i = 0; i <= 3; i++) pMax3 += probPoisson(l_5, i);

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA DE INCIDENTES SOC PROCESADA
            </div>

            ${generarGraficoPoissonSVG(l_20, 15, 24, 'ALERTAS EN SOC (20 MIN)')}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine el número promedio de alertas esperadas durante 20 minutos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> λ₂₀ = (9 alertas / 15 min) * 20 min = ${l_20.toFixed(2)} alertas esperadas.</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de registrar exactamente 12 alertas durante 20 minutos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 12 | λ = 12) = (e⁻¹² * 12¹²) / 12! = ${p12.toFixed(4)} (${format(p12)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine la probabilidad de que el sistema identifique una situación de riesgo elevado durante ese intervalo (> 15 alertas).</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X > 15 | λ = 12) = 1 - P(X ≤ 15) = ${pRiesgo.toFixed(4)} (${format(pRiesgo)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Calcule la probabilidad de recibir como máximo 3 alertas durante un período de 5 minutos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≤ 3 | λ = 3) = P(0) + P(1) + P(2) + P(3) = ${pMax3.toFixed(4)} (${format(pMax3)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Si el SOC desea que las falsas alarmas asociadas únicamente a la frecuencia normal sean inferiores al 5 %, analice si el umbral establecido resulta adecuado.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// AUDITORÍA DE POLÍTICA SIEM / SOC:</span>
                    La tasa de falsas alarmas calculada es de <strong>${format(pRiesgo)}</strong>. Al superar el límite del 5.00 %, el umbral actual <strong>NO ES ADECUADO</strong>, ya que producirá una saturación excesiva de alertas. Se sugiere elevar el umbral.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">Análisis técnico: Explique por qué un aumento en la frecuencia de alertas no necesariamente implica que se esté produciendo un ataque informático.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// DIAGNÓSTICO ESTOCÁSTICO EN INFRAESTRUCTURA:</span>
                    En Poisson, la varianza es igual a la media (Var = λ). Estadísticamente, los eventos pueden agruparse creando picos temporales sin cambiar la tasa promedio real, causados por eventos benignos (reinicios, actualizaciones, configuraciones).
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej3');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj4(btn) {
    ejecutarProcesamientoConLoader('ej4', btn, () => {
        let n = 20, p = 0.08;
        let p4 = probBinomial(n, 4, p);
        let pMax3 = probBinomial(n, 0, p) + probBinomial(n, 1, p) + probBinomial(n, 2, p) + probBinomial(n, 3, p);
        let pMax4 = pMax3 + p4;
        let pAlMenos5 = 1 - pMax4; // P(X >= 5)

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA EN CLOUD INFRASTRUCTURE PROCESADA
            </div>

            ${generarGraficoBinomialSVG(n, p, 4)}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine la probabilidad de que exactamente 4 servidores presenten fallas.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 4 | n = 20, p = 0.08) = C(20, 4) * (0.08)⁴ * (0.92)¹⁶ = ${p4.toFixed(4)} (${format(p4)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de que fallen como máximo 3 servidores (operación normal).</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≤ 3 | n = 20, p = 0.08) = P(0) + P(1) + P(2) + P(3) = ${pMax3.toFixed(4)} (${format(pMax3)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine la probabilidad de que fallen al menos 5 servidores.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≥ 5 | n = 20, p = 0.08) = 1 - P(X ≤ 4) = ${pAlMenos5.toFixed(4)} (${format(pAlMenos5)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Si la empresa exige una disponibilidad operativa del 95 % durante estas ventanas, ¿el sistema cumple el requisito?</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// INFORME DE DISPONIBILIDAD (UPTIME SLA):</span>
                    La probabilidad de operar en rango tolerable (fallos ≤ 3) es de <strong>${format(pMax3)}</strong>. Como 92.95 % es <strong>INFERIOR</strong> a la exigencia del 95.00 %, el cluster en la nube <strong>NO CUMPLE</strong> con la garantía de servicio.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Explique por qué el hecho de tener 20 servidores no significa que necesariamente se presentarán fallas en todos ellos.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// FUNDAMENTACIÓN MATEMÁTICA:</span>
                    Cada servidor falla de manera independiente. El valor esperado de fallas es n*p = 20*0.08 = <strong>1.6 servidores</strong>. La probabilidad conjunta de que los 20 fallen (0.08²⁰) es un número virtualmente cero.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">¿Qué sucedería con la confiabilidad del modelo si los servidores dependieran de un mismo suministro eléctrico y pudieran fallar simultáneamente?</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// FALLA DE PUNTO ÚNICO (SPOF):</span>
                    Se violaría el **principio de independencia**. Si el suministro cae, la probabilidad de falla deja de ser individual y constante (8%), invalidando por completo el modelo binomial y reduciendo drásticamente la confiabilidad real.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej4');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj5(btn) {
    ejecutarProcesamientoConLoader('ej5', btn, () => {
        let l_1 = 18 / 3; // lambda = 6
        let l_05 = 6 / 2; // lambda = 3
        let p8 = probPoisson(l_1, 8);
        let pMax10 = 0; for (let i = 0; i <= 10; i++) pMax10 += probPoisson(l_1, i);
        let pAlerta = 1 - pMax10; // P(X > 10)
        let p0_30s = probPoisson(l_05, 0);

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA EN BACKEND & RATE LIMITING PROCESADA
            </div>

            ${generarGraficoPoissonSVG(l_1, 10, 16, 'SOLICITUDES API REST (1 MIN)')}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine la cantidad promedio de solicitudes esperadas durante un minuto.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> λ₁ = (18 solicitudes / 3 minutos) = ${l_1.toFixed(2)} solicitudes / minuto.</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de que exactamente 8 solicitudes lleguen durante un minuto.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 8 | λ = 6) = (e⁻⁶ * 6⁸) / 8! = ${p8.toFixed(4)} (${format(p8)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine la probabilidad de que el sistema active la alerta en un minuto (> 10 solicitudes).</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X > 10 | λ = 6) = 1 - P(X ≤ 10) = ${pAlerta.toFixed(4)} (${format(pAlerta)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Calcule la probabilidad de que durante un intervalo de 30 segundos no se reciba ninguna solicitud.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 0 | λ_30s = 3) = e⁻³ = ${p0_30s.toFixed(4)} (${format(p0_30s)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Si la probabilidad de activar la alerta supera el 5 %, el equipo considera necesario revisar el umbral. ¿Qué recomendaría?</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// RECOMENDACIÓN DE ARQUITECTURA BACKEND:</span>
                    La tasa calculada es de <strong>${format(pAlerta)}</strong>. Al ser menor que el umbral del 5.00 %, el mecanismo <strong>NO</strong> generará un volumen excesivo de falsas alarmas. Se recomienda <strong>mantener el umbral actual</strong>.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">Explique por qué sería incorrecto utilizar directamente el promedio de 18 solicitudes para calcular una probabilidad correspondiente a un intervalo de un minuto.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// PRINCIPIO DE ESCALA TEMPORAL:</span>
                    En Poisson, la tasa (λ) es proporcional al tiempo estudiado. Usar λ=18 para 1 minuto asume que el tráfico es el triple del real, sobreestimando drásticamente las probabilidades de saturación.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej5');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj6(btn) {
    ejecutarProcesamientoConLoader('ej6', btn, () => {
        let r = 6, p = 0.65;
        let p10 = probBinomialNeg(10, r, p);
        let pMax8 = 0; for (let i = 6; i <= 8; i++) pMax8 += probBinomialNeg(i, r, p);
        let pMax10_acum = 0; for (let i = 6; i <= 10; i++) pMax10_acum += probBinomialNeg(i, r, p);
        let pMas10 = 1 - pMax10_acum; // P(X > 10)
        let pRiesgo = 1 - pMax8; // P(X > 8)

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA EN QA & QUALITY ASSURANCE PROCESADA
            </div>

            ${generarGraficoBinomialNegativaSVG(r, p, 8, 14, 'PRUEBAS DE VALIDACIÓN QA')}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Calcule la probabilidad de que la sexta prueba satisfactoria ocurra exactamente en el décimo intento.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X = 10 | r = 6, p = 0.65) = C(9, 5) * (0.65)⁶ * (0.35)⁴ = ${p10.toFixed(4)} (${format(p10)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Determine la probabilidad de completar las 6 pruebas satisfactorias en un máximo de 8 intentos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≤ 8 | r = 6, p = 0.65) = P(6) + P(7) + P(8) = ${pMax8.toFixed(4)} (${format(pMax8)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Calcule la probabilidad de necesitar más de 10 intentos para alcanzar las 6 pruebas satisfactorias.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X > 10 | r = 6, p = 0.65) = 1 - P(X ≤ 10) = ${pMas10.toFixed(4)} (${format(pMas10)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Si el equipo dispone de recursos para ejecutar únicamente 8 pruebas, ¿cuál es el riesgo de no completar la validación?</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> Riesgo = P(X > 8 | r = 6, p = 0.65) = 1 - P(X ≤ 8) = ${pRiesgo.toFixed(4)} (${format(pRiesgo)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Explique por qué el número total de pruebas no se conoce de antemano, aunque sí la cantidad de éxitos esperados.</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// NATURALEZA DE BINOMIAL NEGATIVA:</span>
                    En la distribución binomial negativa, el número de éxitos ($r=6$) está fijo. Como cada prueba tiene una aleatoriedad (35% de fallar), el total de intentos requeridos se vuelve la variable aleatoria incierta.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">¿Qué limitación tendría este modelo si las pruebas repetidas fueran sobre el mismo módulo y los errores corregidos modificaran la probabilidad de éxito?</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// MODELADO DE MADUREZ DE SOFTWARE:</span>
                    El modelo exige probabilidad constante ($p=0.65$). Si la corrección de errores mejora el módulo, su probabilidad de éxito aumenta, invalidando la distribución estadística planteada y el supuesto de independencia.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej6');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj7(btn) {
    ejecutarProcesamientoConLoader('ej7', btn, () => {
        let l_seg = 12 / 60; // lambda = 0.2
        let pMenos4 = 1 - Math.exp(-l_seg * 4);
        let pMas10 = Math.exp(-l_seg * 10);
        let pEntre = (1 - Math.exp(-l_seg * 8)) - (1 - Math.exp(-l_seg * 3));
        let t90 = -Math.log(1 - 0.90) / l_seg;
        let pAlerta = Math.exp(-l_seg * 15);

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA EN SISTEMAS DISTRIBUIDOS PROCESADA
            </div>

            ${generarGraficoExponencialSVG(l_seg, 15, 25)}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine la probabilidad de que el siguiente mensaje llegue antes de 4 segundos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(T < 4 | λ = 0.20) = 1 - e^(-0.20 * 4) = ${pMenos4.toFixed(4)} (${format(pMenos4)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de que transcurran más de 10 segundos sin recibir un nuevo mensaje.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(T > 10 | λ = 0.20) = e^(-0.20 * 10) = ${pMas10.toFixed(4)} (${format(pMas10)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine la probabilidad de que el siguiente mensaje llegue entre 3 y 8 segundos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(3 < T < 8 | λ = 0.20) = P(T < 8) - P(T < 3) = ${pEntre.toFixed(4)} (${format(pEntre)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Calcule el tiempo de espera (t) para el cual existe un 90 % de probabilidad de que el siguiente mensaje ya haya llegado.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(T ≤ t) = 0.90 ➔ 1 - e^(-0.20 * t) = 0.90 ➔ t = -ln(0.10) / 0.20 = ${t90.toFixed(2)} segundos.</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Un desarrollador propone generar una alerta si transcurren más de 15 segundos sin recibir mensajes. ¿Sería una alerta frecuente?</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(T > 15 | λ = 0.20) = e^(-0.20 * 15) = ${pAlerta.toFixed(4)} (${format(pAlerta)})</div>
                <div class="teoria">
                    <span class="teoria-label">// EVALUACIÓN TÉCNICA DE LATENCIA:</span>
                    La probabilidad calculada es del <strong>${format(pAlerta)}</strong>. <strong>SÍ SERÍA FRECUENTE</strong>. En condiciones normales con 12 mensajes/minuto, casi un 5% de las veces la alerta sonará innecesariamente, causando fatiga de alertas.
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">Justifique por qué es indispensable convertir correctamente las unidades y qué sucedería si los mensajes llegaran en lotes (batches).</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// HOMOGENEIDAD TEMPORAL Y PROPIEDAD SIN MEMORIA:</span>
                    El exponente en e^(-λ*t) debe ser adimensional. Si los mensajes llegan en "lotes", se rompe el principio de **independencia** aleatoria continua del modelo Exponencial, ya que el arribo de uno garantizaría el del resto instantáneamente.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej7');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

function calcularEj8(btn) {
    ejecutarProcesamientoConLoader('ej8', btn, () => {
        let mu = 240, sigma = 35;
        let pMas300 = 1 - normalCDF(300, mu, sigma);
        let pEntre = normalCDF(280, mu, sigma) - normalCDF(210, mu, sigma);
        let pMenos200 = normalCDF(200, mu, sigma);
        let z95 = 1.64485;
        let max95 = mu + (z95 * sigma);
        let pAlt_SLA = normalCDF(300, 220, 55);

        let html = `
            <div class="results-header-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SOLUCIÓN MATEMÁTICA EN BASE DE DATOS & SLA PROCESADA
            </div>

            ${generarGraficoNormalSVG(mu, sigma, 300)}

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO A</span>
                    <span class="inciso-text">Determine la probabilidad de que una consulta tarde más de 300 milisegundos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> Z = (300 - 240) / 35 = 1.71. P(X > 300 | μ=240, σ=35) = 1 - Φ(1.71) = ${pMas300.toFixed(4)} (${format(pMas300)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO B</span>
                    <span class="inciso-text">Calcule la probabilidad de que una consulta tenga un tiempo entre 210 y 280 milisegundos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(210 < X < 280 | μ=240, σ=35) = Φ(1.14) - Φ(-0.86) = ${pEntre.toFixed(4)} (${format(pEntre)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO C</span>
                    <span class="inciso-text">Determine el porcentaje de consultas que responden en menos de 200 milisegundos.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> Z = (200 - 240) / 35 = -1.14. P(X < 200 | μ=240, σ=35) = Φ(-1.14) = ${pMenos200.toFixed(4)} (${format(pMenos200)})</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO D</span>
                    <span class="inciso-text">Calcule el tiempo máximo de respuesta correspondiente al percentil 95 de la distribución.</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> Para 95%, Z ≈ 1.645. X₉₅ = 240 + (1.645 * 35) = ${max95.toFixed(2)} ms.</div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO E</span>
                    <span class="inciso-text">Con base en los resultados, determine si la base de datos cumple el SLA establecido (≤ 300 ms en ≥ 95%).</span>
                </div>
                <div class="teoria">
                    <span class="teoria-label">// CUMPLIMIENTO DE CONTRATO DE SERVICIO (SLA):</span>
                    El tiempo al percentil 95 es de <strong>${max95.toFixed(2)} ms</strong>, el cual es <strong>MENOR</strong> al umbral máximo permitido de 300 ms. Por lo tanto, la base de datos <strong>SÍ CUMPLE</strong> con el SLA establecido (tiene un 95.64% de eficiencia real).
                </div>
            </div>

            <div class="inciso">
                <div class="inciso-label">
                    <span class="inciso-tag">INCISO F</span>
                    <span class="inciso-text">Análisis técnico: Si la media disminuyera a 220 ms pero la desviación aumentara a 55 ms, ¿sería mejor el rendimiento respecto al SLA?</span>
                </div>
                <div class="math"><span class="math-icon">&gt;_</span> P(X ≤ 300 | μ=220, σ=55) = Φ((300 - 220) / 55) = Φ(1.45) = ${pAlt_SLA.toFixed(4)} (${format(pAlt_SLA)})</div>
                <div class="teoria">
                    <span class="teoria-label">// ANÁLISIS DE DISPERSIÓN Y COLA LARGA:</span>
                    <strong>NO SERÍA MEJOR</strong>. Aunque el tiempo promedio mejoró (220 ms), el gran aumento de la desviación (55 ms) hace al sistema más inestable, logrando apenas un <strong>${format(pAlt_SLA)}</strong> bajo los 300 ms. <strong>INCUMPLE</strong> el SLA de 95%.
                </div>
            </div>
        `;
        const res = document.getElementById('res_ej8');
        res.innerHTML = html;
        res.style.display = 'block';
    });
}

// ==========================================================================
// CONTROLADOR DE EXPORTACIÓN A PDF & MODAL FLOTANTE
// ==========================================================================

function abrirModalImpresion() {
    const modal = document.getElementById('modal-impresion');
    if (!modal) return;

    // Detectar ejercicio activo para contextualizar el modal
    const activeTab = document.querySelector('.tab-content.active');
    const badgeActive = document.getElementById('badge-active-ej');
    const infoActive = document.getElementById('info-active-ej');

    if (activeTab) {
        const h3 = activeTab.querySelector('h3');
        const ejTitle = h3 ? h3.textContent.trim() : 'Módulo Seleccionado';
        if (badgeActive) badgeActive.textContent = activeTab.id.toUpperCase();
        if (infoActive) infoActive.textContent = `Imprime exclusivamente: "${ejTitle}", sin hojas en blanco innecesarias.`;
    }

    // Por defecto seleccionar 'single'
    seleccionarOpcionImpresion('single');

    modal.style.display = 'flex';
}

function cerrarModalImpresion() {
    const modal = document.getElementById('modal-impresion');
    if (modal) modal.style.display = 'none';
}

function cerrarModalPorFondo(event) {
    if (event.target && event.target.id === 'modal-impresion') {
        cerrarModalImpresion();
    }
}

function seleccionarOpcionImpresion(modo) {
    const cardSingle = document.getElementById('opt-card-single');
    const cardAll = document.getElementById('opt-card-all');
    const radioSingle = document.getElementById('scope-single');
    const radioAll = document.getElementById('scope-all');

    if (modo === 'single') {
        if (cardSingle) cardSingle.classList.add('active');
        if (cardAll) cardAll.classList.remove('active');
        if (radioSingle) radioSingle.checked = true;
    } else {
        if (cardAll) cardAll.classList.add('active');
        if (cardSingle) cardSingle.classList.remove('active');
        if (radioAll) radioAll.checked = true;
    }
}

function computarModuloDirecto(idOrNum) {
    if (typeof idOrNum === 'string' && idOrNum.startsWith('calc-')) {
        if (idOrNum === 'calc-binomial') ejecutarCalcBinomial('instant');
        else if (idOrNum === 'calc-binomial-neg') ejecutarCalcBinomialNeg('instant');
        else if (idOrNum === 'calc-poisson') ejecutarCalcPoisson('instant');
        else if (idOrNum === 'calc-exponencial') ejecutarCalcExponencial('instant');
        else if (idOrNum === 'calc-normal') ejecutarCalcNormal('instant');
        return;
    }
    const num = String(idOrNum).replace('ej', '');
    const fnName = 'calcularEj' + num;
    if (typeof window[fnName] === 'function') {
        // Ejecutar de forma instantánea sin animación para imprimir de inmediato
        window[fnName]('instant');
    }
}

function ejecutarImpresionDesdeModal() {
    const radioSingle = document.getElementById('scope-single');
    const esSingle = radioSingle ? radioSingle.checked : true;

    cerrarModalImpresion();

    if (esSingle) {
        // Imprimir únicamente la pestaña actualmente activa (sea calculadora o ejercicio)
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            computarModuloDirecto(activeTab.id);
        }
        document.body.classList.remove('print-mode-all');
        document.body.classList.add('print-mode-single');
    } else {
        // Imprimir todos los 8 ejercicios
        for (let i = 1; i <= 8; i++) {
            computarModuloDirecto(i);
        }
        document.body.classList.remove('print-mode-single');
        document.body.classList.add('print-mode-all');
    }

    // Pequeño timeout para que el DOM aplique estilos y renderice gráficos antes de abrir el diálogo de impresión
    setTimeout(() => {
        window.print();
    }, 180);
}

// Limpiar clases al cerrar el diálogo de impresión del navegador
window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-mode-single', 'print-mode-all');
});
