import { Pipe, PipeTransform } from '@angular/core'

const EMOJIS = [
  '🏖️', '🏠', '🚗', '🎓', '💻', '🏥', '✈️', '🎮',
  '👶', '💍', '🐱', '🌴', '🎸', '📚', '🎨', '🏋️',
  '🌸', '🍕', '🎁', '💎', '🌟', '🔥', '🌈', '🛒',
  '🎵', '📱', '👟', '🎂', '🌊', '🍃', '🎈', '💡',
]

@Pipe({
  name: 'goalEmoji',
  standalone: true,
})
export class GoalEmojiPipe implements PipeTransform {
  transform(name: string): string {
    if (!name) return EMOJIS[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i)
      hash |= 0
    }
    return EMOJIS[Math.abs(hash) % EMOJIS.length]
  }
}
