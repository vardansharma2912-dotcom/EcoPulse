import React from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import {
  Lightbulb,
  Fan,
  PowerOff,
  BatteryCharging,
  Laptop,
  Thermometer,
  Sun,
  Users,
  ToggleLeft,
  Globe,
  Info,
} from 'lucide-react'

interface LearnTopic {
  id: string
  title: string
  category: string
  icon: React.ReactNode
  importance: string
  habit: string
  note?: string
}

const TOPICS: LearnTopic[] = [
  {
    id: 'lights',
    title: 'Room & Corridor Lighting',
    category: 'Lighting',
    icon: <Lightbulb className="w-5 h-5 text-amber-800" />,
    importance:
      'Lighting left running in empty study bedrooms, labs, and washrooms consumes electricity continuously without providing any utility.',
    habit:
      'Make it an automatic habit to flip off light switches every time you leave a room, even for short intervals like lunch or discussions.',
    note: 'Power consumption varies by appliance (e.g. incandescent bulbs draw far more power than modern LEDs). Check lamp fixtures for rated wattage.',
  },
  {
    id: 'fans',
    title: 'Ceiling & Desk Fans',
    category: 'Cooling',
    icon: <Fan className="w-5 h-5 text-emerald-800" />,
    importance:
      'Fans cool people by accelerating convective heat loss and sweat evaporation on the skin, not by cooling ambient room air. Running a fan in an empty room cools nothing.',
    habit:
      'Always switch off ceiling fans and personal desk fans immediately when vacating a room.',
    note: 'Wattage varies by motor type and speed setting (traditional induction motors draw more power than BLDC fans).',
  },
  {
    id: 'standby',
    title: 'Standby Power (Phantom Load)',
    category: 'Standby Power',
    icon: <PowerOff className="w-5 h-5 text-rose-800" />,
    importance:
      'Many electronics continue drawing power in standby mode to power digital clocks, status LEDs, and remote sensors even when turned "off" via a remote.',
    habit:
      'Turn off TVs, computer monitors, microwave displays, and entertainment consoles at the main socket switch when not in active use.',
    note: 'Standby draw varies by appliance age, efficiency rating, and circuitry design.',
  },
  {
    id: 'chargers',
    title: 'Device & Phone Chargers',
    category: 'Chargers',
    icon: <BatteryCharging className="w-5 h-5 text-blue-800" />,
    importance:
      'Power adapters and smartphone chargers contain switch-mode transformers that draw small amounts of idle current whenever plugged into an active socket, even if no phone is connected.',
    habit:
      'Unplug chargers from wall outlets or switch off the socket rocker switch as soon as charging completes.',
    note: 'Idle power consumption varies by charger design and manufacturer quality standards.',
  },
  {
    id: 'laptop',
    title: 'Laptop & Computer Power Settings',
    category: 'Computing',
    icon: <Laptop className="w-5 h-5 text-indigo-800" />,
    importance:
      'High-performance power profiles keep CPUs, dedicated GPUs, and display backlights at full throttle even during reading or idling.',
    habit:
      'Enable OS sleep or hibernate after brief inactivity, dim screen brightness indoors, and disconnect secondary external monitors when idle.',
    note: 'Power draw varies significantly depending on workload, CPU utilization, and hardware configuration.',
  },
  {
    id: 'ac',
    title: 'Air Conditioner Temperature Set-Points',
    category: 'Thermal Comfort',
    icon: <Thermometer className="w-5 h-5 text-cyan-800" />,
    importance:
      'Setting an air conditioner to very low set-points causes the compressor to run for prolonged cycles to maintain unnatural thermal gradients against ambient heat.',
    habit:
      'Maintain moderate set-points (such as 24°C–26°C) and pair AC operation with a ceiling fan on low speed for comfortable airflow.',
    note: 'Actual cooling efficiency and compressor load vary by room insulation, sun exposure, and unit star rating.',
  },
  {
    id: 'daylight',
    title: 'Leveraging Natural Daylight',
    category: 'Lighting',
    icon: <Sun className="w-5 h-5 text-amber-700" />,
    importance:
      'Using electric lighting during bright daytime hours when windows provide ample natural illumination is unnecessary duplication of energy.',
    habit:
      'Position study desks near windows, open curtains or blinds during morning and afternoon hours, and keep artificial lights off until dusk.',
    note: 'Ensure window shading blocks harsh direct glare while allowing diffuse daylight.',
  },
  {
    id: 'shared',
    title: 'Shared Campus & Dorm Spaces',
    category: 'Shared Spaces',
    icon: <Users className="w-5 h-5 text-emerald-800" />,
    importance:
      'In shared campus environments (libraries, computer labs, departmental corridors, dining halls), individuals often assume someone else will turn off switches.',
    habit:
      'Take collective ownership. If you are the last person leaving a lecture hall, project room, or shared reading area, turn off fixtures.',
    note: 'Encouraging peers and establishing common shared habits multiplies cumulative savings.',
  },
  {
    id: 'switch',
    title: 'Switching Off Directly at the Plug Socket',
    category: 'Habits',
    icon: <ToggleLeft className="w-5 h-5 text-teal-800" />,
    importance:
      'Using appliance power buttons alone leaves internal power supplies energized up to the circuit board. Wall rocker switches physically disconnect line voltage.',
    habit:
      'Develop the muscle memory of turning off the mechanical switch on the wall socket or power strip rather than just tapping device power buttons.',
    note: 'Surge protector power strips with master rocker switches allow switching off entire workstation desks with a single click.',
  },
  {
    id: 'environmental',
    title: 'Why Energy Conservation Matters',
    category: 'Environmental Context',
    icon: <Globe className="w-5 h-5 text-emerald-900" />,
    importance:
      'Electricity generation relies heavily on thermal and fossil resources. Every unit of electricity conserved immediately reduces fuel consumption and cooling water demand at power plants.',
    habit:
      'Treat energy conservation not as self-deprivation, but as mindful elimination of passive waste and unnecessary consumption.',
    note: 'Specific emissions intensity varies widely across regional power grids and generation mixes.',
  },
]

export const LearnPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy Conservation Guide"
        description="Practical conservation habits, mindful appliance practices, and environmental principles for college and campus living."
      />

      {/* Intro Note Card */}
      <Card variant="glass" className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-800/10 text-emerald-800 mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0f2819]">
              Everyday Mindful Energy Management
            </h2>
            <p className="text-xs text-[#1e3f2b] mt-1 leading-relaxed">
              Conserving electricity does not require sacrificing comfort or academic productivity. Rather, it centers on eliminating waste: turning off appliances when they are not in use, curbing passive standby consumption, and using equipment intentionally.
            </p>
          </div>
        </div>
      </Card>

      {/* Grid of Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOPICS.map((topic) => (
          <Card key={topic.id} variant="glass" className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 border border-white/80 shadow-xs">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0f2819]">
                      {topic.title}
                    </h3>
                    <Badge variant="neutral" size="sm" className="mt-0.5">
                      {topic.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-[#0f2819]">Why it matters: </span>
                  <span className="text-[#1e3f2b] leading-relaxed">{topic.importance}</span>
                </div>

                <div className="rounded-xl bg-emerald-800/5 p-2.5 border border-emerald-800/10">
                  <span className="font-semibold text-emerald-950">Practical action: </span>
                  <span className="text-emerald-900 leading-relaxed">{topic.habit}</span>
                </div>
              </div>
            </div>

            {topic.note && (
              <p className="text-[11px] text-[#1e3f2b]/80 italic pt-1 border-t border-black/5">
                Note: {topic.note}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
