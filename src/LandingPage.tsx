import { useEffect, useRef, useState, useCallback } from 'react'
import './landing.css'

// ── GRAIN OVERLAY ──────────────────────────────────────────
const NOISE_SVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43NSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=`

// ── INTERSECTION HOOK ──────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ── COUNT-UP HOOK ──────────────────────────────────────────
function useCountUp(target: number, duration = 2400, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setValue(Math.floor(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setValue(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return value
}

// ── COMPONENTS ────────────────────────────────────────────

function Grain() {
  return (
    <div
      className="grain-overlay"
      style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      aria-hidden
    />
  )
}

function Monogram() {
  return <div className="monogram" aria-hidden>AL</div>
}

function Divider() {
  const { ref, visible } = useReveal(0.3)
  return (
    <div ref={ref} className={`divider-line ${visible ? 'visible' : ''}`} aria-hidden />
  )
}

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: string
  style?: React.CSSProperties
}
function Reveal({ children, delay = 0, className = '', as: _as, style }: RevealProps) {
  const { ref, visible } = useReveal(0.08)
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  )
}

interface StatProps { value: string; label: string }
function HeroStat({ value, label }: StatProps) {
  return (
    <div className="hero-stat">
      <span className="hero-stat-val">{value}</span>
      <span className="hero-stat-lbl">{label}</span>
    </div>
  )
}

interface ProofItemProps { prefix?: string; target: number; suffix?: string; label: string; delay?: number }
function ProofItem({ prefix = '', target, suffix = '', label, delay = 0 }: ProofItemProps) {
  const { ref, visible } = useReveal(0.2)
  const count = useCountUp(target, 2400, visible)
  return (
    <div ref={ref} className={`proof-item reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}s` }}>
      <span className="proof-val">
        {prefix}{count}{suffix}
      </span>
      <span className="proof-lbl">{label}</span>
    </div>
  )
}

function MagneticBtn({ href, children }: { href: string; children: React.ReactNode }) {
  const el = useRef<HTMLAnchorElement>(null)
  const handleMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = el.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.28
    const y = (e.clientY - rect.top - rect.height / 2) * 0.28
    btn.style.transform = `translate(${x}px, ${y}px)`
    btn.style.transition = 'transform 0.1s ease'
  }, [])
  const handleLeave = useCallback(() => {
    if (!el.current) return
    el.current.style.transform = ''
    el.current.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), background 0.3s, color 0.3s'
  }, [])
  return (
    <a ref={el} href={href} className="btn-cta" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </a>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function LandingPage() {
  // Hero line reveal
  const heroRef = useRef<HTMLHeadingElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Grain />
      <Monogram />

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-inner">
          <h1 ref={heroRef} className="hero-headline">
            <span className={`hero-line ${heroVisible ? 'line-visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
              Eu não opero empresas.
            </span>
            <span className={`hero-line ${heroVisible ? 'line-visible' : ''}`} style={{ transitionDelay: '0.3s' }}>
              Eu <em>construo</em> os sistemas
            </span>
            <span className={`hero-line ${heroVisible ? 'line-visible' : ''}`} style={{ transitionDelay: '0.5s' }}>
              que fazem elas crescerem.
            </span>
          </h1>

          <div className={`hero-stats reveal ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.75s' }}>
            <HeroStat value="R$60M+" label="Movimentados" />
            <div className="hero-stat-sep" aria-hidden />
            <HeroStat value="100+" label="Automações" />
            <div className="hero-stat-sep" aria-hidden />
            <HeroStat value="10+" label="Mercados" />
          </div>

          <p className={`hero-tagline reveal ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '0.9s' }}>
            E você provavelmente nunca ouviu meu nome.
          </p>

          <div className={`reveal ${heroVisible ? 'visible' : ''}`} style={{ transitionDelay: '1.05s' }}>
            <MagneticBtn href="#agendar-call">Agendar Call</MagneticBtn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ 01 QUEM ESTÁ POR TRÁS ══════════════════════════ */}
      <section className="section" data-num="01">
        <div className="section-ghost-num" aria-hidden>01</div>
        <div className="section-inner">
          <Reveal className="section-label">01 — Quem está por trás</Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-h2">
              Sou o estrategista que aparece<br />
              quando o crescimento para<br />
              de <em>responder</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}><p className="section-p">Você não vai ver meu nome estampado no resultado. E esse é o ponto.</p></Reveal>
          <Reveal delay={0.15}><p className="section-p">Enquanto o mercado discute anúncio, criativo e tendência da semana, eu estou numa camada diferente: como o sistema inteiro funciona.</p></Reveal>
          <Reveal delay={0.2}><p className="section-p"><strong>Aquisição. Conversão. Retenção. Operação. Decisão.</strong></p></Reveal>
          <Reveal delay={0.25}><p className="section-p">Eu não crio mais atividade. Crio mais resultado com menos gente dependendo de mim para ele continuar.</p></Reveal>
        </div>
      </section>

      <Divider />

      {/* ══ 02 A PROVA ════════════════════════════════════ */}
      <section className="section section--wide" data-num="02">
        <div className="section-ghost-num" aria-hidden>02</div>
        <div className="section-inner wide">
          <Reveal className="section-label">02 — A prova</Reveal>
          <div className="proof-grid">
            <ProofItem prefix="R$" target={60} suffix="M+" label="Movimentados" delay={0} />
            <ProofItem target={100} suffix="+" label="Automações implementadas" delay={0.08} />
            <ProofItem target={20} suffix="+" label="Operações comerciais estruturadas" delay={0.16} />
            <ProofItem target={12} suffix="+" label="Produtos digitais validados e escalados" delay={0.24} />
            <ProofItem target={8} suffix="+" label="E-commerces com marca estruturada" delay={0.32} />
            <ProofItem target={15} suffix="+" label="Sistemas de IA implementados" delay={0.40} />
          </div>
          <Reveal delay={0.1}><p className="section-p">Diferentes mercados. Mesmo princípio.</p></Reveal>
          <Reveal delay={0.18}><p className="section-p proof-footnote">Parece muito pra alguém que você nunca viu.<br />É exatamente esse o ponto.</p></Reveal>
        </div>
      </section>

      <Divider />

      {/* ══ 03 A MAIOR MUDANÇA ════════════════════════════ */}
      <section className="section" data-num="03">
        <div className="section-ghost-num" aria-hidden>03</div>
        <div className="section-inner">
          <Reveal className="section-label">03 — A maior mudança dos próximos anos</Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-h2">
              Empresas não estão<br />
              competindo por clientes.<br />
              Estão competindo por <em>eficiência</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}><p className="section-p">Durante décadas, crescimento significou contratar mais pessoas. Mais vendedores. Mais atendimento. Mais gestores. Mais operação.</p></Reveal>
          <Reveal delay={0.15}><p className="section-p">Agora existe uma alternativa: sistemas de aquisição, automação de qualificação e conversão, inteligência artificial em toda etapa do processo.</p></Reveal>
          <Reveal delay={0.2}><p className="section-p"><strong>Quem entendeu isso primeiro não está competindo por clientes. Está construindo a infraestrutura que vai dominar o mercado.</strong></p></Reveal>
          <Reveal delay={0.25}><p className="section-p section-p--italic">Quem ignora, some.</p></Reveal>
        </div>
      </section>

      <Divider />

      {/* ══ 04 O MANIFESTO ════════════════════════════════ */}
      <section className="manifesto" data-num="04">
        <div className="section-ghost-num" style={{ right: '-40px', left: 'auto' }} aria-hidden>04</div>
        <div className="manifesto-inner">
          <Reveal className="section-label" style={{ textAlign: 'center', display: 'block' }}>04 — O manifesto</Reveal>
          <div className="manifesto-gap" />
          <Reveal delay={0}><p className="m-line m-line--accent">O ativo não é o tráfego.</p></Reveal>
          <Reveal delay={0.1}><p className="m-line m-line--accent">O ativo não é o CRM.</p></Reveal>
          <Reveal delay={0.2}><p className="m-line m-line--accent">O ativo não é a IA.</p></Reveal>
          <Reveal delay={0.3}><p className="m-line m-line--amber"><em>O ativo é o sistema.</em></p></Reveal>
          <div className="manifesto-break" />
          <Reveal delay={0.05}><p className="manifesto-body">Porque tráfego muda. Ferramentas mudam. Plataformas mudam.</p></Reveal>
          <Reveal delay={0.12}><p className="manifesto-body">Mas empresas que operam sobre sistemas continuam crescendo independentemente da ferramenta da vez.</p></Reveal>
          <div className="manifesto-gap" />
          <Reveal delay={0}><p className="m-line m-line--muted">Toda empresa de alto desempenho parece diferente por fora.</p></Reveal>
          <Reveal delay={0.1}><p className="m-line m-line--muted">Mas por dentro elas compartilham a mesma característica:</p></Reveal>
          <Reveal delay={0.2}><p className="m-line m-line--accent"><em>clareza operacional.</em></p></Reveal>
        </div>
      </section>

      <Divider />

      {/* ══ 05 COMO FUNCIONA ══════════════════════════════ */}
      <section className="section" data-num="05">
        <div className="section-ghost-num" aria-hidden>05</div>
        <div className="section-inner wide">
          <Reveal className="section-label">05 — Como funciona</Reveal>
          <Reveal delay={0.05}><h2 className="section-h2" style={{ marginBottom: '72px' }}>Quatro movimentos.<br /><em>Um sistema.</em></h2></Reveal>
          <div className="steps-grid">
            {[
              { n: '01', t: 'Mapear o gargalo', d: 'Toda empresa cresce até encontrar uma restrição. Meu trabalho é encontrá-la antes que ela custe mais do que deveria.' },
              { n: '02', t: 'Desenhar o sistema', d: 'Processos. Tecnologia. Automação. Fluxos. Cada peça no lugar certo, com a menor dependência humana possível.' },
              { n: '03', t: 'Eliminar dependência', d: 'Menos esforço manual. Menos retrabalho. Menos improviso. A operação continua quando você não está olhando.' },
              { n: '04', t: 'Criar alavancagem', d: 'Mais resultado por decisão tomada. Mais resultado por pessoa. Mais resultado por operação.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="step">
                <span className="step-num">{s.n}</span>
                <p className="step-title">{s.t}</p>
                <p className="step-text">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══ 06 POR QUE AGORA ══════════════════════════════ */}
      <section className="section" data-num="06">
        <div className="section-ghost-num" style={{ right: '-40px', left: 'auto' }} aria-hidden>06</div>
        <div className="section-inner">
          <Reveal className="section-label">06 — Por que agora</Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-h2">
              A distância entre empresas<br />
              eficientes e ineficientes<br />
              está <em>aumentando</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}><p className="section-p">A inteligência artificial acelerou isso. Automação acelerou isso. Software acelerou isso.</p></Reveal>
          <Reveal delay={0.15}><p className="section-p">Os próximos anos não serão definidos por quem trabalha mais. Mas por quem constrói sistemas melhores.</p></Reveal>
          <Reveal delay={0.2}><p className="section-p"><strong>Quem constrói o sistema agora define o padrão.</strong></p></Reveal>
          <Reveal delay={0.25}><p className="section-p section-p--italic">Quem espera, vai operar dentro do padrão de outro.</p></Reveal>
        </div>
      </section>

      <Divider />

      {/* ══ 07 POR QUE ME OUVIR ═══════════════════════════ */}
      <section className="section" data-num="07">
        <div className="section-ghost-num" aria-hidden>07</div>
        <div className="section-inner">
          <Reveal className="section-label">07 — Por que me ouvir</Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-h2">
              Eu não peço confiança.<br />
              Mostro o <em>resultado</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}><p className="section-p">R$60 milhões movimentados. Centenas de automações. Operações inteiras redesenhadas.</p></Reveal>
          <Reveal delay={0.15}><p className="section-p"><strong>Isso não é discurso. É histórico.</strong></p></Reveal>
          <Reveal delay={0.2}><p className="section-p">Não vendo produtividade. Não vendo atalho. Não vendo promessa.</p></Reveal>
          <Reveal delay={0.25}><p className="section-p">Eu opero sistemas. Sempre foi essa a única coisa que me interessou: <em>negócio, tecnologia, mercado, decisão, alavancagem.</em></p></Reveal>
        </div>
      </section>

      <Divider />

      {/* ══ 08 A PORTA ════════════════════════════════════ */}
      <section className="closing" id="agendar-call">
        <div className="closing-glow" aria-hidden />
        <div className="closing-inner">
          <Reveal className="section-label" style={{ textAlign: 'center', display: 'block' }}>08 — A porta</Reveal>
          <Reveal delay={0.05}>
            <h2 className="closing-h2">
              O sistema<br />
              já está <em>rodando</em>.
            </h2>
          </Reveal>
          <Reveal delay={0.12}><p className="closing-p">A pergunta é se você entra agora.</p></Reveal>
          <Reveal delay={0.18}><p className="closing-p">Alguém no seu mercado já está construindo o que você ainda está pensando em construir.</p></Reveal>
          <Reveal delay={0.24}><p className="closing-p">A diferença entre essa pessoa e o resto do mercado não é talento. É <em>tempo</em>.</p></Reveal>
          <Reveal delay={0.32}>
            <p className="closing-declaration">
              Não vendo fórmula. Não vendo hack. Não vendo promessa.<br />
              Compartilho o sistema com quem está construindo pra valer,<br />
              não com quem está esperando o momento perfeito.
            </p>
          </Reveal>
          <Reveal delay={0.42}>
            <MagneticBtn href="https://calendly.com/allanjhone77">Agendar Call</MagneticBtn>
          </Reveal>
        </div>
      </section>
    </>
  )
}
