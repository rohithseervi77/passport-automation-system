import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Passport Automation System'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#020617', // slate-950
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#3b82f6', marginBottom: 20, fontSize: 80, fontWeight: 'bold' }}>PAS</div>
        <div>Passport Automation System</div>
        <div style={{ fontSize: 32, color: '#94a3b8', marginTop: 20 }}>Government Digitized Processing Portal</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
