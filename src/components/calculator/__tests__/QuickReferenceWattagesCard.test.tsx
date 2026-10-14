import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { QuickReferenceWattagesCard } from '../QuickReferenceWattagesCard'
import { PRESETS } from '../presets'

describe('QuickReferenceWattagesCard', () => {
  it('renders all presets with their name and wattage', () => {
    const handleSelect = vi.fn()
    const html = renderToString(
      <QuickReferenceWattagesCard
        selectedPreset="Ceiling fan (75 W)"
        onSelectPreset={handleSelect}
      />
    )

    expect(html).toContain('Quick Reference: Appliance Wattages')

    for (const preset of PRESETS) {
      expect(html).toContain(preset.name)
      expect(html).toContain(`${preset.watts}W`)
    }

    expect(html).toContain(
      'Typical ratings. Check the label on your own appliance.'
    )
  })

  it('highlights the selected preset in the rendered markup', () => {
    const handleSelect = vi.fn()
    const html = renderToString(
      <QuickReferenceWattagesCard
        selectedPreset="TV (100 W)"
        onSelectPreset={handleSelect}
      />
    )

    expect(html).toContain('TV (100 W)')
    // Selected button has bg-emerald-800 styling
    expect(html).toContain('bg-emerald-800')
  })
})
