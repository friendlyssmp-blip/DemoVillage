import { Howl } from 'howler';

type SoundName = 
  | 'click' | 'primary' | 'secondary' | 'critical' 
  | 'build' | 'collect' | 'claim' | 'open' | 'close' 
  | 'error' | 'wind' | 'village' | 'combat' | 'upgrade' | 'attack'
  | 'victory' | 'defeat' | 'music_ambient' | 'music_battle';

class AudioService {
  private sounds: Record<string, Howl> = {};
  private currentMusic: string | null = null;
  private enabled = true;
  private sfxVolume = 0.8;
  private musicVolume = 0.4;

  constructor() {
    this.init();
  }

  private init() {
    this.sounds = {
      // UI
      click: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-16.mp3'] }),
      primary: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-3.mp3'] }),
      secondary: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-10.mp3'] }),
      critical: new Howl({ src: ['https://www.soundjay.com/misc/sounds/bell-1.mp3'] }),
      open: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-11.mp3'] }),
      close: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-10.mp3'] }),
      error: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-11.mp3'] }),

      // Gameplay
      build: new Howl({ src: ['https://www.soundjay.com/mechanical/sounds/hammering-1.mp3'], volume: 0.5 }),
      collect: new Howl({ src: ['https://www.soundjay.com/misc/sounds/coins-dropped-on-table-1.mp3'] }),
      claim: new Howl({ src: ['https://www.soundjay.com/misc/sounds/bell-1.mp3'] }),
      upgrade: new Howl({ src: ['https://www.soundjay.com/misc/sounds/magic-chime-01.mp3'] }),
      combat: new Howl({ src: ['https://www.soundjay.com/misc/sounds/sword-clash-1.mp3'] }),
      attack: new Howl({ src: ['https://www.soundjay.com/weapon/sounds/sword-slap-1.mp3'], volume: 0.6 }),
      victory: new Howl({ src: ['https://www.soundjay.com/misc/sounds/trumpet-fanfare-1.mp3'] }),
      defeat: new Howl({ src: ['https://www.soundjay.com/misc/sounds/fail-trombone-01.mp3'] }),

      // Ambience
      wind: new Howl({ src: ['https://www.soundjay.com/nature/sounds/wind-1.mp3'], loop: true, volume: 0.2 }),
      village: new Howl({ src: ['https://www.soundjay.com/nature/sounds/cricket-chirping-1.mp3'], loop: true, volume: 0.1 }),

      // Music (Using placeholders from soundjay nature/misc as true music usually requires heavy files or specific licenses, but these work as atmospheric loops)
      music_ambient: new Howl({ src: ['https://www.soundjay.com/nature/sounds/river-1.mp3'], loop: true, html5: true, volume: 0.4 }),
      music_battle: new Howl({ src: ['https://www.soundjay.com/nature/sounds/storm-1.mp3'], loop: true, html5: true, volume: 0.5 }),
    };
  }

  play(name: SoundName, options?: { pitch?: number; volume?: number; randomized?: boolean }) {
    if (!this.enabled || !this.sounds[name]) return;
    
    const sound = this.sounds[name];
    
    if (name.startsWith('music_')) {
      this.playMusic(name);
      return;
    }

    if (options?.randomized) {
      const p = (options.pitch || 1) * (1 + (Math.random() * 0.1 - 0.05));
      const v = (options.volume || 1) * (1 + (Math.random() * 0.06 - 0.03));
      sound.rate(p);
      sound.volume(v * this.sfxVolume);
    } else {
      sound.rate(options?.pitch || 1);
      sound.volume((options?.volume || 1) * this.sfxVolume);
    }

    sound.play();
  }

  private playMusic(name: string) {
    if (this.currentMusic === name) return;
    
    if (this.currentMusic && this.sounds[this.currentMusic]) {
      this.sounds[this.currentMusic].fade(this.musicVolume, 0, 1000);
      const prev = this.currentMusic;
      setTimeout(() => this.sounds[prev].stop(), 1000);
    }

    this.currentMusic = name;
    this.sounds[name].volume(0);
    this.sounds[name].play();
    this.sounds[name].fade(0, this.musicVolume, 1000);
  }

  stop(name: SoundName) {
    if (this.sounds[name]) {
      this.sounds[name].stop();
    }
  }

  setSFXVolume(v: number) {
    this.sfxVolume = v;
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.currentMusic && this.sounds[this.currentMusic]) {
      this.sounds[this.currentMusic].volume(v);
    }
  }

  setEnabled(e: boolean) {
    this.enabled = e;
    if (!e) {
      Object.values(this.sounds).forEach(s => s.stop());
    } else {
      this.play('wind');
      this.play('village');
      this.play('music_ambient');
    }
  }
}

export const audioService = new AudioService();
