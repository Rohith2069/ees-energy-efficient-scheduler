# EES – Energy-Aware Adaptive CPU Scheduler (CSE316 Academic Project)

A professional, multi-page web application designed for a 2nd-year B.Tech Operating Systems course (CSE316). EES simulates, visualizes, and quantitatively compares traditional CPU scheduling algorithms (FCFS, SJF, Round Robin) against a novel proposed algorithm: **EAAS (Energy-Aware Adaptive Scheduling)** with Dynamic Voltage and Frequency Scaling (DVFS).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural design and user experience reflect all confirmed preferences from Phase 1:

- **Confirmed Decision 1 (Workload Presets)**: Integrated real-world mobile & embedded workload presets (e.g., *Mobile Video Streaming*, *IoT Periodic Sensor Sampling*, *Background Push Sync*, *Interactive UI Gaming*) alongside manual process creation and random generation.
- **Confirmed Decision 2 (Simulation Modes)**: Built-in dual-mode simulation visualizer featuring both **interactive tick-by-tick animated playback** (with Play, Pause, Step Next, and speed control) and **instant full batch execution** for rapid benchmarking.
- **Confirmed Decision 3 (Academic & Viva Tools)**: Comprehensive CSE316 academic report view formatted to university guidelines, including instant CSV dataset export and a 7-stage GitHub commit revision log for project defense and viva preparation.

---

## 1. Overview & Core Concept

### What It Does
EES is an educational CPU scheduling simulator that bridges classical Operating Systems theory with modern mobile energy efficiency. Traditional CPU scheduling algorithms (FCFS, SJF, Round Robin) focus solely on performance metrics like Waiting Time and Turnaround Time, running the CPU at maximum frequency ($f = 1.0$). 

EES introduces **EAAS**, which dynamically modulates CPU operational frequency ($f \in \{0.5, 0.75, 1.0\}$) using a cubic dynamic power model ($P(f) = k \cdot f^3$) and process slack/deadline analysis to save up to 40% energy with bounded slowdown ($\le 20\%$).

### Target Audience & Persona
- **CSE316 Operating Systems Students**: Demonstrating algorithm mechanics, Gantt charts, and energy-delay tradeoffs for lab evaluations and viva examinations.
- **Faculty & Evaluators**: Reviewing structured academic reports, verification test cases, and reproducible benchmarks.

### Key Value
- **Deep Academic Rigor**: Real scheduling mathematics, formal DVFS power models, and zero fake simulation numbers.
- **Clear Architectural Separation**: 3 distinct, interconnected functional modules accessible through persistent sidebar navigation, backed by HTML5 LocalStorage.
- **Viva Ready**: Includes algorithm pseudocode, limitations, assumptions, and university report generator right in the app.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Landing & Orientation**: The user arrives at the **Dashboard**, exploring project objectives, energy principles, and quick-action cards to jump to any module.
2. **Process Management (Module 1)**: The user defines processes manually or loads mobile presets. Form inputs validate $PID$, $Arrival \ge 0$, $Burst > 0$, $Priority \ge 1$, and $Deadline \ge Arrival + Burst$. Processes persist in browser storage.
3. **Simulation & DVFS Engine (Module 2)**: The user selects one or all algorithms (FCFS, SJF, Round Robin, EAAS), tunes quantum (for RR) or max acceptable slowdown (for EAAS), and triggers instant execution or tick-by-tick animated stepping through ready queues and CPU states.
4. **Performance Analysis (Module 3)**: Comparative Gantt charts render side-by-side with Recharts bar graphs (Waiting Time, Turnaround Time, Energy Joules, Savings %, Missed Deadlines).
5. **Academic Export & Viva Defense**: The student switches to the **University Report** tab to review the CSE316 standard format (Chapters 1–8, Appendices A–C), download simulation CSV data, and review git revision milestones.

### Visual Identity & Theme
- **Color Discipline (60-30-10)**:
  - *60% Dominant Canvas*: Deep dark slate/navy (`#0B1120` and `#0F172A`).
  - *30% Structural Surfaces*: Charcoal cards (`#1E293B`), subtle hairline borders (`#334155`), and crisp typography.
  - *10% Focal Accents*: Electric Teal (`#0D9488` / `#14B8A6`) and Emerald (`#10B981`) for energy efficiency, with Amber (`#F59E0B`) for high frequency and Coral (`#EF4444`) for deadline alerts.
- **Typography**: `Plus Jakarta Sans` for clean, professional headings, `DM Sans` for body copy, and `JetBrains Mono` / `tabular-nums` for Gantt time markers, process IDs, and mathematical equations.
- **Zero-Pill Restraint**: Metadata rendered with clean unboxed text and typographic separators (`P1 · Arrival 0ms · Burst 6ms · Prio 2`). No decorative pulsing dots or pseudo-code comment headers.

---

## 3. Key Product Decisions & Trade-Offs

### Proposed Algorithm: EAAS (Energy-Aware Adaptive Scheduling)
- **Dynamic Power Model**:
  $$P(f) = k \cdot f^3$$
  Where $k$ is a normalized power coefficient ($k = 1.0$), and frequency levels are:
  - $f_{\text{low}} = 0.5$ (Power $P = 0.125$, relative execution time $2.0 \times$)
  - $f_{\text{med}} = 0.75$ (Power $P = 0.421875$, relative execution time $1.33 \times$)
  - $f_{\text{high}} = 1.0$ (Power $P = 1.0$, relative execution time $1.0 \times$)
- **Energy Equation**:
  $$E = P(f) \cdot T = k \cdot f^3 \cdot \frac{B}{f} = k \cdot f^2 \cdot B$$
- **Frequency Selection Logic**:
  For an arrived process $P_i$ with burst $B_i$, arrival $A_i$, and deadline $D_i$:
  1. *Laxity Check*: Slack $S_i(t) = D_i - (t + B_i / f)$. If $S_i(t) \ge 0$, frequency $f$ meets the deadline.
  2. *Slowdown Constraint*: Allowed execution time $T_{\text{max}} = (B_i / 1.0) \cdot (1 + \text{MaxSlowdown})$.
  3. *Greedy Energy Minimizer*: Select $\min(f)$ such that $(B_i / f) \le T_{\text{max}}$ AND $t + (B_i / f) \le D_i$ (if deadline specified). If low frequency causes deadline miss, step up to medium; if still tight, step up to high.
- **Limitations & Transparency (Mandatory for Viva)**:
  - Simulator assumes instantaneous frequency switching overhead (zero frequency transition latency).
  - Assumes purely dynamic CMOS switching power ($P \propto V^2 f \approx f^3$); static leakage current is documented as future scope.
  - Distinctly labeled as an educational algorithmic model, not direct mobile silicon driver measurements.

---

## 4. Technical Architecture & System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EES OPERATING SYSTEMS SIMULATOR                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────┐   ┌──────────────────────────────────────────────┐  │
│  │ Navigation Sidebar │   │ Current Page / Active View                   │  │
│  │                    │   │                                              │  │
│  │ ❖ Home / Dashboard │   │  [Page 1: Dashboard & Objectives]            │  │
│  │ ❖ Process Manager  │─► │  [Page 2: Module 1 - Process Management]     │  │
│  │ ❖ Scheduling Engine│   │  [Page 3: Module 2 - CPU & Energy Engine]    │  │
│  │ ❖ Analytics        │   │  [Page 4: Module 3 - Performance & Gantt]    │  │
│  │ ❖ University Report│   │  [Page 5: CSE316 Academic Report & Git Log]  │  │
│  └────────────────────┘   └──────────────────────────────────────────────┘  │
│                                       ▲                                     │
│                                       │ (Reactive State Hooks)              │
│  ┌────────────────────────────────────┴──────────────────────────────────┐  │
│  │ Unified Process State & LocalStorage Store                            │  │
│  │  - Process List [PID, Arrival, Burst, Priority, Deadline]             │  │
│  │  - Active Engine Config [Time Quantum, Max Slowdown, Power Constant]  │  │
│  │  - Simulation Run History & Benchmark Comparison Records              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                       ▲                                     │
│                                       │                                     │
│  ┌────────────────────────────────────┴──────────────────────────────────┐  │
│  │ Scheduling & Energy Engine Library (Pure TypeScript Core)             │  │
│  │  ├─ simulateFCFS()                                                    │  │
│  │  ├─ simulateSJF()                                                     │  │
│  │  ├─ simulateRoundRobin(quantum)                                       │  │
│  │  ├─ simulateEAAS(maxSlowdown, frequencyLevels)                        │  │
│  │  └─ calculateEnergyMetrics(timeline, frequencyProfile)                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Breakdown
1. **Module 1 – Process Management (`/src/pages/ProcessManager.tsx`)**:
   - Comprehensive CRUD table for processes.
   - Field validations: duplicate PID check, integer arrival $\ge 0$, burst $> 0$, priority $\ge 1$, deadline consistency.
   - 5 Preset Workloads: Mobile Video Streaming (soft deadlines), Periodic IoT Sensor (strict deadlines), Interactive Gaming (high burst/priority), Background Cloud Sync (high slack), and Mixed OS Workload.
   - LocalStorage auto-save and reset to default sample dataset.
2. **Module 2 – CPU Scheduling & Energy Engine (`/src/pages/SchedulingEngine.tsx`)**:
   - Algorithm toggles: FCFS, SJF, Round Robin, EAAS.
   - Dynamic parameter controls: Round Robin Time Quantum ($q = 1 \dots 10$), EAAS Max Acceptable Slowdown ($0\% \dots 50\%$).
   - Dual execution engine:
     - *Tick-by-tick step playback*: Play, Pause, Step Next, Reset, Speed Slider (100ms - 1000ms per tick), Ready Queue inspector, and live CPU active frequency indicator ($0.5x, 0.75x, 1.0x$).
     - *Batch instant run*: Runs all 4 algorithms instantly for fast comparison.
   - Mathematical formula cards explaining $P(f) = k \cdot f^3$ and DVFS frequency choice logic.
3. **Module 3 – Performance Analysis (`/src/pages/PerformanceAnalysis.tsx`)**:
   - Side-by-side visual Gantt charts with color-coded processes and frequency markers.
   - Quantitative comparative metrics grid:
     - Average Waiting Time (AWT)
     - Average Turnaround Time (TAT)
     - Average Response Time (ART)
     - CPU Utilization (%)
     - Estimated Energy Consumption (Joules)
     - Energy-Saving Percentage relative to baseline FCFS ($1.0x$)
     - Deadline Misses count and percentage
   - Recharts Visualizations: Energy Consumption bar chart, TAT vs AWT bar chart, Energy-Delay Product (EDP) curve, and EAAS Frequency Distribution pie/bar.
   - CSV export button to download the simulation results table for lab assignments.
4. **University Report & Viva Hub (`/src/pages/UniversityReport.tsx`)**:
   - Formatted CSE316 University Project Report containing all 8 standard sections:
     1. Project Overview
     2. Module-Wise Breakdown
     3. Functionalities
     4. Technology Used
     5. Flow Diagram
     6. Revision Tracking on GitHub (7 verified commit stages)
     7. Conclusion and Future Scope
     8. References
     - Appendices: A (Project Elaboration), B (Problem Statement), C (Complete Source Logic & Pseudocode).
   - "Print Report / Export PDF" print stylesheet for instant physical printout or PDF generation.

---

## 5. Folder & File Structure

```
/src
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               // Responsive navigation sidebar with active page indicators
│   │   ├── TopHeader.tsx             // Clean 3-zone header with course tag & reset state CTA
│   │   └── MetricCard.tsx            // Academic metric display with tabular numerals
│   ├── visualizers/
│   │   ├── GanttChart.tsx            // Custom CSS/SVG Gantt chart with time scale & frequency badges
│   │   ├── StepPlaybackControls.tsx  // Play, Pause, Step, Speed slider
│   │   └── CpuStateInspector.tsx     // Real-time ready queue and active core frequency
│   └── report/
│       └── UniversityReportView.tsx  // Printable academic CSE316 report template
├── engine/
│   ├── types.ts                      // Shared Process, ScheduleEvent, SimulationResult interfaces
│   ├── powerModel.ts                 // P(f) = k*f^3, energy, and slowdown mathematical models
│   ├── fcfs.ts                       // First-Come, First-Served scheduling implementation
│   ├── sjf.ts                        // Shortest Job First scheduling implementation
│   ├── roundRobin.ts                 // Round Robin with configurable quantum
│   ├── eaas.ts                       // Proposed Energy-Aware Adaptive Scheduling with DVFS
│   └── presets.ts                    // Real-world mobile workload benchmark presets
├── pages/
│   ├── Dashboard.tsx                 // Home page, project overview, objectives, quick links
│   ├── ProcessManager.tsx            // Module 1: Process CRUD, presets, input validation
│   ├── SchedulingEngine.tsx          // Module 2: Interactive simulator, step player, DVFS config
│   ├── PerformanceAnalysis.tsx       // Module 3: Comparative metrics, Gantt charts, Recharts graphs
│   └── UniversityReport.tsx          // CSE316 university report, viva guide, and GitHub log
├── context/
│   └── SimulationContext.tsx         // Shared React state for processes, active results, and storage
├── App.tsx                           // Root router and view container
├── index.css                         // Tailwind CSS and tabular numeral configuration
└── main.tsx                          // React 19 bootstrap
```

---

## 6. Implementation Roadmap

- [ ] **Phase 1: Project Setup & Core State Foundation**
  - Install `recharts` for data visualization.
  - Define unified TypeScript interfaces (`Process`, `ScheduleEvent`, `SimulationMetrics`, `SimulationResult`).
  - Implement `SimulationContext` with HTML5 LocalStorage persistence and 5 mobile workload presets.
  - Implement `Sidebar` and `TopHeader` navigation with 5 distinct pages.
- [ ] **Phase 2: Scheduling Algorithms & DVFS Power Engine**
  - Implement the normalized power model ($P(f) = k \cdot f^3, E = P \cdot T$).
  - Implement pure scheduling functions for FCFS, SJF, Round Robin, and EAAS.
  - Add comprehensive unit checks for each algorithm with known textbook test cases.
- [ ] **Phase 3: Module 1 – Process Management UI**
  - Build the process entry form with strict validation (positive burst, non-negative arrival, unique PID).
  - Build the process table with sorting, editing, deletion, and quick preset loaders.
- [ ] **Phase 4: Module 2 – CPU Scheduling & Energy Engine UI**
  - Build the interactive simulator with dual execution modes (tick-by-tick step visualizer + instant run).
  - Build the Ready Queue visualizer, active CPU frequency state card, and live event log.
  - Present the EAAS mathematical breakdown, pseudocode, and frequency selection criteria.
- [ ] **Phase 5: Module 3 – Performance Analysis UI**
  - Build side-by-side Gantt charts displaying process execution intervals and CPU frequency levels.
  - Build comparative metric cards (AWT, TAT, ART, CPU Utilization, Energy Joules, Energy Savings %).
  - Render Recharts charts for energy comparison and time metrics.
  - Implement CSV export for simulation data.
- [ ] **Phase 6: CSE316 Academic Report, Viva Preparation & GitHub Tracker**
  - Build the complete University Report view following the exact 8-chapter CSE316 university outline.
  - Include the 7-stage GitHub commit history with clear messages and change rationale.
  - Add Print/PDF stylesheet for clean university submission printing.
- [ ] **Phase 7: Verification & Final Polish**
  - Verify all navigation links, buttons, and state synchronizations.
  - Compile the applet and verify with linting.
