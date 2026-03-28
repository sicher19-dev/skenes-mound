import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Skenes 2024 Pitch Data (Baseball Savant) ───
// Movement in inches. Convention: negative = 3B side (arm side for RHP), positive = 1B side
const PITCH_CATALOG = {
  FF: { name: '4-Seam FB', color: '#ff4444', velo: 100.2, pfx: -9.8, ivb: 16.2, shortName: 'FF' },
  SL: { name: 'Sweeper', color: '#44aaff', velo: 88.1, pfx: 14.2, ivb: 1.8, shortName: 'SL' },
  CH: { name: 'Changeup', color: '#44dd66', velo: 89.4, pfx: -14.6, ivb: 28.1, shortName: 'CH' },
  SP: { name: 'Splinker', color: '#ffaa44', velo: 93.7, pfx: -11.8, ivb: 22.4, shortName: 'SP' },
}
