# PLATAFORMA DE SIMULACIÓN ESTADÍSTICA COMPUTACIONAL
### PROYECTO FINAL // CURSO DE ESTADÍSTICA
**Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación**  
**Universidad Mariano Gálvez de Guatemala (UMG)**  

---

## 📌 Datos Generales del Proyecto

* **Institución:** Universidad Mariano Gálvez de Guatemala (UMG)
* **Facultad:** Ingeniería en Sistemas de Información y Ciencias de la Computación
* **Curso:** Estadística
* **Estudiante:** David Emanuel Baltazar Gaspar
* **Número de Carnet:** `0902 - 25 - 20049`
* **Tecnologías:** HTML5 Semántico, CSS3 Puro (Cyber-Tech Dark UI / Glassmorphism), JavaScript (Vanilla ES6+), Gráficos Vectoriales SVG Dinámicos.

---

## 🎯 Descripción del Proyecto

El presente proyecto consiste en el desarrollo de una plataforma interactiva de **Simulación y Auditoría Estadística Computacional**, diseñada con un enfoque de ingeniería de software de alto nivel. La aplicación permite modelar, calcular y evaluar fenómenos estocásticos reales del ámbito tecnológico (ciberseguridad, protocolos de red, monitoreo SOC, infraestructura cloud, rendimiento de APIs REST, aseguramiento de calidad QA, sistemas de mensajería distribuida y contratos SLA de bases de datos).

La interfaz cuenta con una estética **Cyber-Tech Futurista en Modo Oscuro**, con animaciones de cómputo en kernel holográfico, visualizaciones gráficas vectoriales SVG nativas para cada distribución matemática, un encabezado inteligente retráctil y un centro de exportación a PDF optimizado con cero hojas en blanco y membrete oficial de la UMG.

---

## 📚 Módulos y Ejercicios Implementados

A continuación se detallan los 8 problemas de ingeniería evaluados por la plataforma, indicando su modelo matemático, variables y conclusiones técnicas:

---

### Módulo 01: Detección de Vulnerabilidades en Ciberseguridad
* **Área:** Ciberseguridad & Auditoría Bancaria
* **Distribución Probabilística:** **Distribución Binomial** $X \sim B(n = 18, p = 0.12)$
* **Parámetros del Sistema:** Muestra $n = 18$ componentes de software; Probabilidad de vulnerabilidad crítica $p = 0.12$; Criterio de suspensión: $X \ge 4$.
* **Cálculos Resueltos:**
  * **a)** $P(X = 3) = \binom{18}{3} (0.12)^3 (0.88)^{15} = 0.2072$ ($20.72\ \%$)
  * **b)** $P(X \le 2) = P(0) + P(1) + P(2) = 0.6384$ ($63.84\ \%$)
  * **c)** $P(X \ge 4) = 1 - P(X \le 3) = 0.1569$ ($15.69\ \%$)
  * **d)** $P(X \ge 1) = 1 - P(X = 0) = 0.8988$ ($89.88\ \%$)
  * **e) Evaluación de Riesgo:** Dado que $15.69\ \% > 10\ \%$ (umbral máximo permitido), el proyecto **NO CUMPLE** con el criterio de seguridad aceptable.
  * **f) Dictamen de Arquitectura:** Si los componentes comparten una misma biblioteca (ej. Log4j), se anula el principio de independencia probabilística, invalidando el modelo binomial.

---

### Módulo 02: Recuperación de Paquetes en Telecomunicaciones
* **Área:** Redes Computacionales & Protocolos de Transporte
* **Distribución Probabilística:** **Distribución Binomial Negativa** $X \sim BN(r = 5, p = 0.75)$
* **Parámetros del Sistema:** Éxitos requeridos $r = 5$ paquetes correctos; Probabilidad de retransmisión exitosa $p = 0.75$; Política máxima: $8$ intentos.
* **Cálculos Resueltos:**
  * **a)** $P(X = 7) = \binom{6}{4} (0.75)^5 (0.25)^2 = 0.1978$ ($19.78\ \%$)
  * **b)** $P(X \le 8) = \sum_{x=5}^{8} P(X=x) = 0.8928$ ($89.28\ \%$)
  * **c)** $P(X \ge 9) = 1 - P(X \le 8) = 0.1072$ ($10.72\ \%$)
  * **d)** $P(X = 5) = (0.75)^5 = 0.2373$ ($23.73\ \%$)
  * **e) Evaluación de SLA:** Al ser $89.28\ \% < 95.00\ \%$, el protocolo **NO CUMPLE** con el requisito de confiabilidad contractual.
  * **f) Análisis de Congestión:** Las ráfagas de pérdida temporal introducen dependencia temporal entre intentos sucesivos, requiriendo modelos de Cadenas de Markov (Gilbert-Elliott).

---

### Módulo 03: Monitoreo de Incidentes en el SOC
* **Área:** Centro de Operaciones de Seguridad (SOC) & SIEM
* **Distribución Probabilística:** **Distribución de Poisson**
* **Parámetros del Sistema:** Tasa base: 9 alertas en 15 min ($\lambda = 0.6$ alertas/min). En 20 min: $\lambda = 12$; en 5 min: $\lambda = 3$. Umbral de riesgo: $X > 15$.
* **Cálculos Resueltos:**
  * **a)** Número promedio en 20 minutos: $\lambda_{20} = 12.00$ alertas.
  * **b)** $P(X = 12; \lambda = 12) = \frac{e^{-12} 12^{12}}{12!} = 0.1144$ ($11.44\ \%$)
  * **c)** $P(X > 15) = 1 - P(X \le 15) = 0.1556$ ($15.56\ \%$)
  * **d)** $P(X \le 3; \lambda = 3) = 0.6472$ ($64.72\ \%$)
  * **e) Análisis de Falsas Alarmas:** La probabilidad de $15.56\ \%$ es muy superior a la meta del $5\ \%$, provocando fatiga de alertas (*alert fatigue*). Se recomienda elevar el umbral a $\ge 18$.
  * **f) Dictamen Técnico:** Un incremento de eventos puede reflejar la varianza natural estocástica del proceso ($\text{Var}(X) = \lambda$) o tráfico legítimo, no necesariamente un ataque.

---

### Módulo 04: Disponibilidad de Servidores Cloud
* **Área:** Infraestructura & Computación en la Nube
* **Distribución Probabilística:** **Distribución Binomial** $X \sim B(n = 20, p = 0.08)$
* **Parámetros del Sistema:** Cluster de $n = 20$ servidores; Probabilidad de falla $p = 0.08$; Tolerancia de redundancia: $X \le 3$.
* **Cálculos Resueltos:**
  * **a)** $P(X = 4) = \binom{20}{4} (0.08)^4 (0.92)^{16} = 0.0543$ ($5.43\ \%$)
  * **b)** $P(X \le 3) = \sum_{x=0}^{3} P(X=x) = 0.9294$ ($92.94\ \%$)
  * **c)** $P(X \ge 5) = 1 - P(X \le 4) = 0.0163$ ($1.63\ \%$)
  * **d) Evaluación de Disponibilidad:** Con $92.94\ \% < 95.00\ \%$, el cluster **NO CUMPLE** con la directiva de alta disponibilidad exigida.
  * **e) Esperanza Matemática:** $E(X) = n \cdot p = 20 \cdot 0.08 = 1.6$ servidores. La probabilidad de fallo total simultáneo es prácticamente nula ($\approx 10^{-22}$).
  * **f) Punto Único de Falla (SPOF):** Una fuente eléctrica unificada destruye la redundancia calculada, volviendo la probabilidad condicional de caída masiva igual a 1.

---

### Módulo 05: Saturación de Peticiones en API REST
* **Área:** Backend, Rate Limiting & Microservicios
* **Distribución Probabilística:** **Proceso de Poisson**
* **Parámetros del Sistema:** 18 solicitudes cada 3 minutos ($\lambda = 6.00$ reqs/min). Para 30 seg: $\lambda = 3$. Umbral de alerta: $X > 10$.
* **Cálculos Resueltos:**
  * **a)** Promedio por minuto: $\lambda = 18 / 3 = 6.00$ solicitudes/minuto.
  * **b)** $P(X = 8; \lambda = 6) = \frac{e^{-6} 6^8}{8!} = 0.1033$ ($10.33\ \%$)
  * **c)** $P(X > 10) = 1 - P(X \le 10) = 0.0426$ ($4.26\ \%$)
  * **d)** En 30 seg, $P(X = 0; \lambda = 3) = e^{-3} = 0.0498$ ($4.98\ \%$)
  * **e) Decisión de Rate Limit:** Como $4.26\ \% < 5.00\ \%$, el umbral de 10 reqs/min **está correctamente configurado** y no es necesario modificarlo.
  * **f) Escala Temporal:** La intensidad $\lambda$ es estrictamente proporcional a la longitud del intervalo; usar 18 en 1 minuto sobreestimaría el tráfico 3 veces.

---

### Módulo 06: Validación de Módulos QA
* **Área:** Testing de Software & Aseguramiento de Calidad
* **Distribución Probabilística:** **Distribución Binomial Negativa** $X \sim BN(r = 6, p = 0.65)$
* **Parámetros del Sistema:** Éxitos objetivo $r = 6$ pruebas OK; Probabilidad unitaria $p = 0.65$; Presupuesto máximo: 8 pruebas.
* **Cálculos Resueltos:**
  * **a)** $P(X = 10) = \binom{9}{5} (0.65)^6 (0.35)^4 = 0.1116$ ($11.16\ packaging$)
  * **b)** $P(X \le 8) = \sum_{x=6}^{8} P(X=x) = 0.3804$ ($38.04\ \%$)
  * **c)** $P(X > 10) = 1 - P(X \le 10) = 0.3703$ ($37.03\ \%$)
  * **d)** Riesgo de no completar con 8 pruebas: $1 - P(X \le 8) = 0.6196$ ($61.96\ \%$)
  * **e) Fundamento Teórico:** La cantidad de pruebas $X$ es una variable aleatoria, mientras que los éxitos $r=6$ son deterministas.
  * **f) Maduración de Software:** Al corregir defectos, $p$ aumenta progresivamente, lo cual requeriría modelos de fiabilidad como Jelinski-Moranda o Goel-Okumoto.

---

### Módulo 07: Tiempo de Espera en Mensajería Asíncrona
* **Área:** Redes & Arquitecturas Distribuidas (Event Streaming / Kafka / RabbitMQ)
* **Distribución Probabilística:** **Distribución Exponencial**
* **Parámetros del Sistema:** Tasa de mensajes: 12 msg/min ($\lambda = 0.20$ msg/segundo). Tiempo medio entre arribos $E(T) = 1/\lambda = 5.00$ segundos.
* **Cálculos Resueltos:**
  * **a)** $P(T < 4) = 1 - e^{-0.20 \cdot 4} = 0.5507$ ($55.07\ \%$)
  * **b)** $P(T > 10) = e^{-0.20 \cdot 10} = 0.1353$ ($13.53\ \%$)
  * **c)** $P(3 < T < 8) = (1 - e^{-1.6}) - (1 - e^{-0.6}) = 0.3469$ ($34.69\ \%$)
  * **d)** Percentil 90: $1 - e^{-0.20t} = 0.90 \implies t = \frac{-\ln(0.10)}{0.20} = 11.51$ segundos.
  * **e) Evaluación de Timeout:** $P(T > 15) = e^{-0.20 \cdot 15} = 0.0498$ ($4.98\ \%$). Es una alerta rara; por tanto, es un buen umbral de timeout.
  * **f) Arribo en Lotes (Batches):** Rompe la propiedad sin memoria (*memoryless*) y la continuidad puntual, requiriendo modelos de colas avanzadas $M/G/1$.

---

### Módulo 08: Rendimiento y SLA de Base de Datos
* **Área:** Base de Datos, Optimización de Consultas & SLA
* **Distribución Probabilística:** **Distribución Normal Gaussiana** $X \sim N(\mu = 240\text{ ms}, \sigma = 35\text{ ms})$
* **Parámetros del Sistema:** Tiempo medio $\mu = 240$ ms; Desviación estándar $\sigma = 35$ ms; SLA contractual: $\ge 95\ \%$ en $\le 300$ ms.
* **Cálculos Resueltos:**
  * **a)** $Z = \frac{300 - 240}{35} = 1.714 \implies P(X > 300) = 1 - \Phi(1.714) = 0.0433$ ($4.33\ \%$)
  * **b)** $P(210 < X < 280) = \Phi(1.143) - \Phi(-0.857) = 0.6782$ ($67.82\ \%$)
  * **c)** $P(X < 200) = \Phi(-1.143) = 0.1265$ ($12.65\ \%$)
  * **d)** Percentil 95: $Z_{0.95} \approx 1.645 \implies X_{95} = 240 + (1.645 \cdot 35) = 297.57$ ms.
  * **e) Dictamen de SLA:** Al ser $297.57\text{ ms} \le 300\text{ ms}$ (cobertura real del $95.67\ \%$), la base de datos **SÍ CUMPLE** con el SLA.
  * **f) Caso Alternativo ($\mu = 220\text{ ms}, \sigma = 55\text{ ms}$):** $P(X \le 300) = \Phi(1.455) = 0.9271$ ($92.71\ \%$). **NO ES MEJOR**; la alta dispersión provoca que se incumpla la meta del $95\ \%$.

---

## 💻 Características del Sistema y Arquitectura Web

1. **Diseño Visual Cyber-Tech:**
   * Paleta dark mode profunda (`#060911`, `#0c1220`) con acentos en cian cuántico, verde esmeralda y púrpura tecnológico.
   * Logotipo institucional oficial de la UMG (`umg.png`) integrado en favicon, barra superior, pie de página, modal de exportación y membrete imprimible.
2. **Cyber Loader (Carga Dinámica Holográfica):**
   * Barra de progreso animada de 0% a 100% con simulación de 4 fases de telemetría de consola en tiempo real al procesar cada ejercicio.
3. **Smart Header Retráctil:**
   * Se oculta suavemente al hacer scroll hacia abajo y reaparece automáticamente al subir o regresar a la parte superior.
4. **Centro de Exportación PDF con Modal Flotante:**
   * Opciones para exportar únicamente el **Ejercicio Actual** o **Todos los Ejercicios (01 al 08)**.
   * Reglas de impresión (`@media print`) diseñadas para **eliminar completamente hojas en blanco** y preservar los colores de los gráficos con `print-color-adjust: exact`.
5. **Gráficos SVG Nativos:**
   * Curvas de Gauss, diagramas de barras binomiales y proyecciones de decaimiento exponencial generados en SVG nativo sin librerías externas.
6. **Atajos de Teclado:**
   * Teclas `1` a `8`: Salto rápido entre módulos.
   * Tecla `A`: Computar todos los ejercicios simultáneamente.
   * `Ctrl + P` / `Cmd + P`: Apertura automática del Centro de Impresión Inteligente.
   * Tecla `Escape`: Cerrar el modal flotante.

---

## 🚀 Instrucciones de Ejecución

1. Clona o descarga la carpeta del proyecto.
2. Asegúrate de que los siguientes archivos se encuentren en el mismo directorio raíz:
   * `index.html`
   * `styles.css`
   * `script.js`
   * `umg.png`
3. Abre el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari). No requiere instalación de dependencias ni servidores backend.

---

## 🏛️ Créditos y Autoría

* **Estudiante:** David Emanuel Baltazar Gaspar
* **Carnet:** `0902 - 25 - 20049`
* **Carrera:** Ingeniería en Sistemas de Información y Ciencias de la Computación
* **Institución:** Universidad Mariano Gálvez de Guatemala (UMG)
* **Año:** 2026

