// 九条梦境航线:主页摩天轮、航线目录、航线详情共用的唯一数据源
export interface Voyage {
  slug: string
  title: string
  desc: string
  color: string
  story: string
  duration: string
  departure: string
}

export const VOYAGES: Voyage[] = [
  { slug: 'hidden-realms', title: 'Hidden Realms', desc: 'Luminous sanctuaries unseen by wandering eyes', color: '#f3cdd6', story: 'Beyond the last lighthouse of waking thought lie sanctuaries that glow only for those who arrive asleep. Our navigators chart the narrow hours between midnight and memory, where every door opens inward.', duration: 'One full night', departure: 'From the edge of sleep' },
  { slug: 'wild-solitudes', title: 'Wild Solitudes', desc: 'Dissolve into untamed horizons and deep calm', color: '#dcedc2', story: 'There are horizons no waking foot has bent the grass toward. Here the silence is not empty but inhabited — by weather, by distance, by the slow breathing of a world that has never been named.', duration: 'Three quiet hours', departure: 'From the first deep breath' },
  { slug: 'silent-havens', title: 'Silent Havens', desc: 'Remote escapes far beyond ordinary reach', color: '#c3e3f4', story: 'Certain harbors accept no ships, only sleepers. Moored past the reach of maps, they keep a stillness so complete that even your oldest worries arrive too tired to speak.', duration: 'Until the second dream', departure: 'From any closed eyelid' },
  { slug: 'bespoke-quests', title: 'Bespoke Quests', desc: 'Journeys shaped around your vision and soul', color: '#f0e4c0', story: 'Bring us a longing you cannot explain and we will build the country it belongs to. Every quest is cut to the grain of one dreamer — its rivers run in your handwriting.', duration: 'Tailored to the dreamer', departure: 'By private appointment' },
  { slug: 'vivid-drifts', title: 'Vivid Drifts', desc: 'Surreal passages through breathtaking terrain', color: '#dcd2f2', story: 'The drift begins where gravity forgets its manners. Valleys fold into skies, stairways pour like waterfalls, and the horizon politely steps aside to let you through.', duration: 'A single held breath', departure: 'From the tilt of falling', },
  { slug: 'mystic-crests', title: 'Mystic Crests', desc: 'Timeless ridgelines wrapped in cloud and myth', color: '#f3cdd6', story: 'These ridgelines were old before stories learned to walk. Climb with us through cloud-belts where myths still nest, and watch dawn arrive from underneath.', duration: 'From dusk to legend', departure: 'From the foot of the sky' },
  { slug: 'deep-currents', title: 'Deep Currents', desc: 'Glowing depths alive with uncharted wonder', color: '#c3e3f4', story: 'Below the floor of ordinary sleep run currents lit from within. Shoals of unremembered thoughts pass like lanterns; the pressure here is only the weight of wonder.', duration: 'Twenty fathoms of night', departure: 'From the deep end of quiet' },
  { slug: 'gilded-dusk', title: 'Gilded Dusk', desc: 'Amber horizons that stretch past all reason', color: '#f0e4c0', story: 'We hold the evening open a little longer than physics allows. Amber light pools on every surface, and the sun agrees, just this once, not to finish setting.', duration: 'One suspended sunset', departure: 'From the last warm hour' },
  { slug: 'glassy-tides', title: 'Glassy Tides', desc: 'Calm waters holding skies of pure stillness', color: '#dcedc2', story: 'The sea here has practiced stillness for ten thousand years. Walk its mirrored surface and the sky beneath your feet will match you, step for silent step.', duration: 'Between two heartbeats', departure: 'From the shore of stillness' },
]
