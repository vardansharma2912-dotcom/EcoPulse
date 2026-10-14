export interface SafeTip {
  title: string
  text: string
}

/**
 * Tips derived strictly from the existing in-app sidebar tips array.
 * Filtered to contain NO percentages or invented statistics.
 */
export const SAFE_TIPS: SafeTip[] = [
  {
    title: 'Standby Power Drain',
    text: 'Switch off wall sockets to stop idle phantom electricity draw.',
  },
  {
    title: 'Unplug Idle Chargers',
    text: 'Unplug charging bricks once phones and laptops reach full charge.',
  },
  {
    title: 'Laptop Power Saver',
    text: 'Enable battery saver and sleep displays when stepping away.',
  },
  {
    title: 'Daylight Harvesting',
    text: 'Open window blinds to illuminate study spaces with sunlight.',
  },
]
