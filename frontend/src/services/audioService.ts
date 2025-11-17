/**
 * Audio Service for Game Sound Effects
 * Generates procedural sounds using Web Audio API
 */

class AudioService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Initialize on first user interaction to comply with browser autoplay policies
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.initAudioContext(), { once: true });
    }
  }

  /**
   * Initialize Audio Context
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Get or create audio context
   */
  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    return this.audioContext!;
  }

  /**
   * Play a frequency tone
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volumeOverride?: number
  ): void {
    if (!this.enabled) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const vol = volumeOverride !== undefined ? volumeOverride : this.volume;
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * Play multiple tones in sequence
   */
  private playSequence(notes: Array<{ freq: number; duration: number; type?: OscillatorType }>): void {
    if (!this.enabled) return;

    let currentTime = this.getContext().currentTime;
    notes.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type || 'sine');
      }, (currentTime - this.getContext().currentTime) * 1000);
      currentTime += note.duration;
    });
  }

  /**
   * Correct answer sound - triumphant chime
   */
  correct(): void {
    this.playSequence([
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.3 },  // G5
    ]);
  }

  /**
   * Incorrect answer sound - descending buzz
   */
  incorrect(): void {
    this.playTone(150, 0.5, 'sawtooth', this.volume * 0.7);
  }

  /**
   * Buzz-in sound - short beep
   */
  buzzIn(): void {
    this.playTone(800, 0.1, 'square', this.volume * 0.6);
  }

  /**
   * Timer tick sound
   */
  tick(): void {
    this.playTone(440, 0.05, 'sine', this.volume * 0.3);
  }

  /**
   * Timer warning sound (last 5 seconds)
   */
  timerWarning(): void {
    this.playTone(880, 0.1, 'sine', this.volume * 0.5);
  }

  /**
   * Timer expired sound
   */
  timeUp(): void {
    this.playSequence([
      { freq: 400, duration: 0.2, type: 'sawtooth' },
      { freq: 350, duration: 0.2, type: 'sawtooth' },
      { freq: 300, duration: 0.4, type: 'sawtooth' },
    ]);
  }

  /**
   * Question selected sound - click
   */
  questionSelect(): void {
    this.playTone(600, 0.08, 'sine', this.volume * 0.4);
  }

  /**
   * Round advance sound - ascending scale
   */
  roundAdvance(): void {
    this.playSequence([
      { freq: 261.63, duration: 0.1 }, // C4
      { freq: 329.63, duration: 0.1 }, // E4
      { freq: 392.00, duration: 0.1 }, // G4
      { freq: 523.25, duration: 0.2 }, // C5
    ]);
  }

  /**
   * Game complete sound - victory fanfare
   */
  gameComplete(): void {
    this.playSequence([
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
      { freq: 783.99, duration: 0.15 }, // G5
      { freq: 1046.50, duration: 0.4 }, // C6
    ]);
  }

  /**
   * Zero-Day Event sound (Daily Double) - dramatic alert
   */
  zeroDay(): void {
    this.playSequence([
      { freq: 220, duration: 0.15, type: 'square' },
      { freq: 440, duration: 0.15, type: 'square' },
      { freq: 220, duration: 0.15, type: 'square' },
      { freq: 440, duration: 0.15, type: 'square' },
      { freq: 880, duration: 0.3, type: 'square' },
    ]);
  }

  /**
   * Final Jeopardy sound - thinking music intro
   */
  finalJeopardy(): void {
    this.playSequence([
      { freq: 392.00, duration: 0.3 }, // G4
      { freq: 440.00, duration: 0.3 }, // A4
      { freq: 493.88, duration: 0.3 }, // B4
      { freq: 523.25, duration: 0.5 }, // C5
    ]);
  }

  /**
   * Achievement unlocked sound
   */
  achievement(): void {
    this.playSequence([
      { freq: 659.25, duration: 0.1 },  // E5
      { freq: 783.99, duration: 0.1 },  // G5
      { freq: 1046.50, duration: 0.1 }, // C6
      { freq: 1318.51, duration: 0.3 }, // E6
    ]);
  }

  /**
   * Error/warning sound
   */
  error(): void {
    this.playTone(200, 0.3, 'sawtooth', this.volume * 0.5);
  }

  /**
   * Notification sound
   */
  notify(): void {
    this.playSequence([
      { freq: 880, duration: 0.1 },
      { freq: 1046.50, duration: 0.15 },
    ]);
  }

  /**
   * Tile flip sound (for question reveal)
   */
  tileFlip(): void {
    this.playTone(700, 0.05, 'sine', this.volume * 0.3);
  }

  /**
   * Hover sound (subtle)
   */
  hover(): void {
    this.playTone(1000, 0.03, 'sine', this.volume * 0.2);
  }

  /**
   * Enable sound
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable sound
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Toggle sound
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Check if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Resume audio context (for browsers that suspend it)
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
