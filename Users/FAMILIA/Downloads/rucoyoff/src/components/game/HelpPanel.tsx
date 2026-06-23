import { Overlay, ModalHeader, ModalFooter } from './QuestPanel'

const BINDINGS = [
  { key: 'WASD / ↑↓←→', desc: 'Mover personagem' },
  { key: 'Clique',       desc: 'Atacar inimigo' },
  { key: '1 / 2 / 3 / 4', desc: 'Habilidades' },
  { key: 'I',            desc: 'Inventário' },
  { key: 'B',            desc: 'Loja' },
  { key: 'M',            desc: 'Mapa Mundi' },
  { key: 'Q',            desc: 'Missões' },
  { key: 'A',            desc: 'Conquistas' },
  { key: 'P',            desc: 'Passivas' },
  { key: 'C',            desc: 'Crafting' },
  { key: 'S',            desc: 'Status' },
  { key: 'H',            desc: 'Ajuda' },
  { key: 'F2',           desc: 'Editor de Mundo' },
  { key: 'F9',           desc: 'Modo Dev (imortalidade)' },
  { key: 'ESC',          desc: 'Fechar painéis' },
]

const TIPS = [
  'Derrote monstros para ganhar XP e subir de nível.',
  'Colete materiais: slimes → Gel, lobos → Pele, dragões → Escama.',
  'Passivas são desbloqueadas automaticamente ao subir de nível.',
  'Chefes têm barra de HP especial no topo da tela.',
  'Fique longe dos inimigos para regenerar HP/MP mais rápido.',
  'Use o Mapa Mundi [M] para viajar entre os 9 biomas.',
  'O Abismo Eterno (Lv 22) tem os drops lendários mais raros.',
  'Kill Streaks acima de 3 aparecem no topo da tela.',
  'O Ferreiro [C] cria equipamentos com materiais coletados.',
  'Cada classe tem 4 habilidades únicas — experimente todas!',
]

interface Props { onClose: () => void }

export default function HelpPanel({ onClose }: Props) {
  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 580, maxHeight: '84vh', display: 'flex', flexDirection: 'column', background: 'rgba(6,8,18,0.98)', border: '1.5px solid rgba(30,46,80,0.7)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}>
        <ModalHeader title="AJUDA  ·  CONTROLES" accent="#6090c0" onClose={onClose} />

        <div style={{ overflowY: 'auto', padding: '14px 16px', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Controls */}
          <div>
            <div style={{ color: '#3a5070', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 10 }}>CONTROLES</div>
            {BINDINGS.map(b => (
              <div key={b.key} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
                <span style={{
                  background: 'rgba(14,20,38,0.8)', border: '1px solid rgba(36,50,80,0.6)',
                  borderRadius: 5, padding: '1px 8px', fontSize: 10, fontFamily: 'monospace',
                  color: '#5080a0', whiteSpace: 'nowrap', flexShrink: 0,
                }}>{b.key}</span>
                <span style={{ color: '#4a6070', fontSize: 11, lineHeight: '20px' }}>{b.desc}</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div>
            <div style={{ color: '#2a5030', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 10 }}>DICAS</div>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ background: 'rgba(6,14,8,0.5)', borderRadius: 6, padding: '6px 10px', marginBottom: 6, border: '1px solid rgba(16,28,18,0.6)' }}>
                <span style={{ color: '#2a5030', marginRight: 6, fontSize: 10 }}>▸</span>
                <span style={{ color: '#3a6040', fontSize: 11 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <ModalFooter hint="[H] ou [ESC] para fechar" />
      </div>
    </Overlay>
  )
}
