export default {
  content: ['./index.html', './src/**/*.{jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        'bg-base':     '#0a0a0f',
        'bg-elevated': 'rgba(255,255,255,0.04)',
        accent: {
          DEFAULT: '#8b5cf6',
          hover:   '#a78bfa',
          dim:     'rgba(139,92,246,0.15)',
          border:  'rgba(139,92,246,0.4)',
        },
        threat: {
          DEFAULT: '#ef4444',
          text:    '#fca5a5',
          dim:     'rgba(239,68,68,0.15)',
          border:  'rgba(239,68,68,0.3)',
        },
        safe: {
          DEFAULT: '#22c55e',
          text:    '#86efac',
          dim:     'rgba(34,197,94,0.15)',
          border:  'rgba(34,197,94,0.3)',
        },
        warn: {
          DEFAULT: '#eab308',
          text:    '#fde68a',
          dim:     'rgba(234,179,8,0.15)',
          border:  'rgba(234,179,8,0.3)',
        },
        info: {
          DEFAULT: '#3b82f6',
          text:    '#93c5fd',
          dim:     'rgba(59,130,246,0.15)',
          border:  'rgba(59,130,246,0.3)',
        },
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139,92,246,0.3)',
        'glow-red':    '0 0 20px rgba(239,68,68,0.3)',
        'glow-blue':   '0 0 20px rgba(59,130,246,0.25)',
        'glow-green':  '0 0 16px rgba(34,197,94,0.25)',
      },
    },
  },
  plugins: [],
};
