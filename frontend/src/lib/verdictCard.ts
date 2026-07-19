// Renders the shareable verdict card entirely on canvas — no external image
// assets, so nothing to license or fetch. Palette and type mirror the
// site's own CSS theme (see index.css @theme) so the exported PNG reads as
// the same object, not a bolted-on graphic.

export interface VerdictCardParams {
  verdict: 'cleared' | 'broken'
  caseNo: string
  stakeLabel: string
  durationLabel: string
}

const PALETTE = {
  void: '#0b0b0c',
  citation: '#f2c41c',
  verdictRed: '#c81e3a',
  cleared: '#2f7a4d',
  paper: '#edeae2',
  steel: '#8a8d91',
}

const WIDTH = 1200
const HEIGHT = 675

async function loadFonts() {
  const specs = [
    '700 36px Anton',
    '700 108px Anton',
    '400 15px "Space Mono"',
    '700 14px "Space Mono"',
    '700 42px "Space Mono"',
  ]
  await Promise.all(specs.map((spec) => document.fonts.load(spec)))
  await document.fonts.ready
}

function drawHazardStripe(ctx: CanvasRenderingContext2D, y: number, h: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, y, WIDTH, h)
  ctx.clip()
  ctx.fillStyle = PALETTE.void
  ctx.fillRect(0, y, WIDTH, h)
  ctx.fillStyle = PALETTE.citation
  for (let x = -HEIGHT; x < WIDTH + HEIGHT; x += 20) {
    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.lineTo(x + 10, y + h)
    ctx.lineTo(x + 10 + h, y)
    ctx.lineTo(x + h, y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export async function generateVerdictCardBlob(params: VerdictCardParams): Promise<Blob> {
  await loadFonts()

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable.')

  const verdictColor = params.verdict === 'cleared' ? PALETTE.cleared : PALETTE.verdictRed

  ctx.fillStyle = PALETTE.void
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const glow = ctx.createRadialGradient(WIDTH * 0.25, HEIGHT * 0.2, 50, WIDTH * 0.25, HEIGHT * 0.2, 700)
  glow.addColorStop(0, `${verdictColor}22`)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  drawHazardStripe(ctx, 0, 10)
  drawHazardStripe(ctx, HEIGHT - 10, 10)

  // sparse grain scatter for a bit of grit
  ctx.fillStyle = PALETTE.paper
  for (let i = 0; i < 250; i++) {
    ctx.globalAlpha = Math.random() * 0.04
    ctx.fillRect(Math.random() * WIDTH, Math.random() * HEIGHT, 1.5, 1.5)
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = PALETTE.paper
  ctx.font = '700 36px Anton'
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = '3px'
  ctx.fillText('FOCUS STAKE', 60, 78)
  ctx.letterSpacing = '0px'

  ctx.font = '400 15px "Space Mono"'
  ctx.fillStyle = PALETTE.steel
  ctx.textAlign = 'right'
  ctx.fillText(`CASE No. ${params.caseNo}`, WIDTH - 60, 55)
  ctx.fillStyle = PALETTE.citation
  ctx.fillText('● MONAD TESTNET', WIDTH - 60, 78)
  ctx.textAlign = 'left'

  ctx.save()
  ctx.translate(WIDTH / 2, 300)
  ctx.rotate((-7 * Math.PI) / 180)
  ctx.lineWidth = 7
  ctx.strokeStyle = verdictColor
  const rw = 560
  const rh = 170
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-rw / 2, -rh / 2, rw, rh, 10)
  else ctx.rect(-rw / 2, -rh / 2, rw, rh)
  ctx.stroke()
  ctx.fillStyle = verdictColor
  ctx.font = '700 108px Anton'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '4px'
  ctx.fillText(params.verdict === 'cleared' ? 'CLEARED' : 'BROKEN', 0, 8)
  ctx.letterSpacing = '0px'
  ctx.restore()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  const stat = (x: number, label: string, value: string) => {
    ctx.font = '700 14px "Space Mono"'
    ctx.fillStyle = PALETTE.steel
    ctx.letterSpacing = '2px'
    ctx.fillText(label, x, 495)
    ctx.letterSpacing = '0px'
    ctx.font = '700 42px "Space Mono"'
    ctx.fillStyle = PALETTE.paper
    ctx.fillText(value, x, 545)
  }
  stat(280, 'STAKE', params.stakeLabel)
  stat(680, 'DURATION', params.durationLabel)

  ctx.strokeStyle = PALETTE.steel
  ctx.setLineDash([8, 8])
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, 590)
  ctx.lineTo(WIDTH - 60, 590)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.font = '400 15px "Space Mono"'
  ctx.fillStyle = PALETTE.steel
  ctx.textAlign = 'center'
  ctx.fillText('STAKE YOUR FOCUS · FOCUS-STAKE.APP', WIDTH / 2, 630)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to encode verdict card image.'))
    }, 'image/png')
  })
}
