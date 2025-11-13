# Assets Directory

This directory is for storing game assets such as:

- **Images**: Logos, backgrounds, icons
- **Audio**: Sound effects, background music
- **Fonts**: Custom typography files
- **Other media**: Videos, animations

## Suggested Assets

### Images
- `logo.png` - Game logo
- `background.jpg` - Custom background
- `team-icons/` - Team avatar icons

### Audio
- `correct.mp3` - Correct answer sound
- `incorrect.mp3` - Wrong answer sound
- `timer.mp3` - Countdown timer
- `theme.mp3` - Background music

### Usage

To use assets in the game, reference them from HTML/CSS/JS:

```html
<!-- HTML -->
<img src="assets/logo.png" alt="Game Logo">
```

```css
/* CSS */
.game-board {
  background-image: url('../assets/background.jpg');
}
```

```javascript
// JavaScript
const audio = new Audio('assets/correct.mp3');
audio.play();
```

## File Organization

Keep assets organized by type:
```
assets/
├── images/
│   ├── logo.png
│   └── backgrounds/
├── audio/
│   ├── sfx/
│   └── music/
└── fonts/
```

## Optimization Tips

- Compress images (use PNG for logos, JPG for photos)
- Optimize audio files (MP3 or OGG format)
- Keep file sizes reasonable for web delivery
- Use lazy loading for large assets
- Consider CDN hosting for production

## Legal Considerations

- Ensure you have rights to all assets
- Credit sources appropriately
- Follow licensing requirements
- Respect copyright and trademarks
