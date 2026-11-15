export type SceneMusicKey = 'S0' | 'S1' | 'S2_RADAR' | 'S4' | 'S5';

const SCENE_TRACKS: Record<SceneMusicKey, string> = {
  S0: '/assets/music/s0.mp3',
  S1: '/assets/music/s1.mp3',
  S2_RADAR: '/assets/music/hud.mp3',
  S4: '/assets/music/s4.mp3',
  S5: '/assets/music/s5.mp3',
};

class BackgroundMusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  private muted = false;
  private volume = 0.25;

  public playScene(scene: SceneMusicKey) {
    if (typeof window === 'undefined') return;
    const src = SCENE_TRACKS[scene];
    if (!src) return;

    // Already playing this track
    if (this.audio && this.currentSrc === src) {
      if (this.audio.paused && !this.muted) {
        this.audio.play().catch(() => {});
      }
      return;
    }

    this.stop();

    const nextAudio = new Audio(src);
    nextAudio.loop = true;
    nextAudio.volume = this.muted ? 0 : this.volume;

    this.audio = nextAudio;
    this.currentSrc = src;

    if (!this.muted) {
      nextAudio.play().catch(() => {});
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.currentSrc = null;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (!this.audio) return;

    this.audio.volume = mute ? 0 : this.volume;
    if (mute) {
      this.audio.pause();
    } else {
      this.audio.play().catch(() => {});
    }
  }
}

export const bgMusic = new BackgroundMusicPlayer();
