import { Howl } from 'howler';

class AudioService {
  private sounds: Record<string, Howl> = {};
  private enabled = true;
  private volume = 0.8;

  constructor() {
    this.init();
  }

  private init() {
    this.sounds = {
      click: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-16.mp3'] }),
      build: new Howl({ src: ['https://www.soundjay.com/mechanical/sounds/hammering-1.mp3'], volume: 0.5 }),
      collect: new Howl({ src: ['https://www.soundjay.com/misc/sounds/coins-dropped-on-table-1.mp3'] }),
      claim: new Howl({ src: ['https://www.soundjay.com/misc/sounds/bell-1.mp3'] }),
      open: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-11.mp3'] }),
      close: new Howl({ src: ['https://www.soundjay.com/buttons/sounds/button-10.mp3'] }),
      wind: new Howl({ src: ['https://www.soundjay.com/nature/sounds/wind-1.mp3'], loop: true, volume: 0.2 }),
      village: new Howl({ src: ['https://www.soundjay.com/nature/sounds/cricket-chirping-1.mp3'], loop: true, volume: 0.1 }),
      combat: new Howl({ src: ['https://www.soundjay.com/misc/sounds/sword-clash-1.mp3'] }),
    };
  }

  play(name: string) {
    if (!this.enabled || !this.sounds[name]) return;
    this.sounds[name].play();
  }

  stop(name: string) {
    if (this.sounds[name]) {
      this.sounds[name].stop();
    }
  }

  setVolume(v: number) {
    this.volume = v;
    Object.values(this.sounds).forEach(s => s.volume(this.volume * (s as any)._volume));
  }

  setEnabled(e: boolean) {
    this.enabled = e;
    if (!e) {
      Object.values(this.sounds).forEach(s => s.stop());
    } else {
      this.play('wind');
      this.play('village');
    }
  }
}

export const audioService = new AudioService();
