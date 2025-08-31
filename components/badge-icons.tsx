"use client"

export const BadgeIcons = {
  verified: "✓",
  premium: "💎",
  developer: "💻",
  designer: "🎨",
  influencer: "⭐",
  gamer: "🎮",
  streamer: "📺",
  creator: "✨",
  artist: "🎭",
  musician: "🎵",
  writer: "✍️",
  photographer: "📸",
  videographer: "🎬",
  podcaster: "🎙️",
  entrepreneur: "🚀",
  student: "🎓",
  teacher: "👨‍🏫",
  engineer: "⚙️",
  scientist: "🔬",
  doctor: "👨‍⚕️",
  lawyer: "⚖️",
  default: "★"
}

export function getBadgeIcon(badgeName: string): string {
  const name = badgeName.toLowerCase()
  
  for (const [key, icon] of Object.entries(BadgeIcons)) {
    if (name.includes(key)) {
      return icon
    }
  }
  
  return BadgeIcons.default
}
