import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Issa Hareb — Building Intelligent Systems'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          backgroundImage:
            'radial-gradient(60% 55% at 30% 20%, rgba(125,165,235,0.22), transparent 70%), radial-gradient(55% 55% at 75% 80%, rgba(167,139,250,0.22), transparent 70%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: 'rgba(125,165,235,0.9)',
            marginBottom: 28,
          }}
        >
          Issa Hareb
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            color: '#f5f5f5',
            letterSpacing: -1.5,
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          Building Intelligent Systems
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: 'rgba(245,245,245,0.6)',
            marginTop: 32,
          }}
        >
          Full-stack product engineer · Autonomous agents · High-end interfaces
        </div>
      </div>
    ),
    { ...size },
  )
}
