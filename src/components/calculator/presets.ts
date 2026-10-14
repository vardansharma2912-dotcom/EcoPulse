import type { ReminderCategory } from '../../types'

export interface AppliancePreset {
  name: string
  watts: number
  category: ReminderCategory
  title: string
  typicalHours: number
}

export const PRESETS: readonly AppliancePreset[] = [
  { name: 'LED bulb (9 W)', watts: 9, category: 'lighting', title: 'Turn off LED bulb', typicalHours: 4 },
  { name: 'Tube light (36 W)', watts: 36, category: 'lighting', title: 'Switch off tube light', typicalHours: 4 },
  { name: 'Ceiling fan (75 W)', watts: 75, category: 'cooling', title: 'Switch off ceiling fan', typicalHours: 5 },
  { name: 'Laptop charger (65 W)', watts: 65, category: 'chargers', title: 'Unplug laptop charger', typicalHours: 3 },
  { name: 'Desktop PC (200 W)', watts: 200, category: 'computing', title: 'Power down desktop PC', typicalHours: 3 },
  { name: 'Monitor (30 W)', watts: 30, category: 'computing', title: 'Turn off external monitor', typicalHours: 4 },
  { name: 'AC 1.5 ton (1500 W)', watts: 1500, category: 'cooling', title: 'Power off air conditioner', typicalHours: 2 },
  { name: 'TV (100 W)', watts: 100, category: 'standby', title: 'Switch off TV power strip', typicalHours: 4 },
  { name: 'Phone charger (10 W)', watts: 10, category: 'chargers', title: 'Unplug phone charger', typicalHours: 8 },
  { name: 'Custom', watts: 100, category: 'other', title: 'Turn off appliance', typicalHours: 3 },
]
