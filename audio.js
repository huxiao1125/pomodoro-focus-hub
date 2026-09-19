/**
 * Pomodoro Focus Hub - Web Audio API Sound Engine
 * 完全基于浏览器原生 Web Audio API，无须加载任何外部 MP3/WAV 音频文件。
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGainNode = null;
    this.ambientFilterNode = null;
    this.currentAmbientType = 'none';
    this.ambientVolume = 0.4;
    this.chimeVolume = 0.6;
    this.isInitialized = false;
  }

  // 用户首次交互（如点击开始）时初始化音频上下文
  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isInitialized = true;
  }

  /**
   * 播放清脆柔和的禅钟提示音（多谐波正弦和弦）
   */
  playChime() {
    this.initContext();
    const now = this.ctx.currentTime;
    
    // 和弦频率：C5, E5, G5, C6 (营造空灵清透的完成感)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // 泛音衰减包络
      const attack = 0.03;
      const decay = 2.2 - idx * 0.3;
      const peakGain = (this.chimeVolume * 0.25) / (idx + 1);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + idx * 0.08 + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + attack + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + attack + decay + 0.1);
    });
  }

  /**
   * 播放轻微的按键触觉反馈音 (Click sound)
   */
  playClick() {
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * 设置并播放背景白噪音/环境声
   * @param {'none'|'rain'|'pink'|'waves'} type 
   */
  setAmbient(type) {
    this.initContext();
    this.stopAmbient();
    this.currentAmbientType = type;

    if (type === 'none') return;

    // 创建5秒可循环的噪声缓冲区
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'pink') {
      // 1/f 粉红噪音算法 (Paul Kellet's filtered white noise)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    } else if (type === 'rain' || type === 'waves') {
      // 基础白噪音
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // 滤波器配置
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);

    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.Q.setValueAtTime(1, this.ctx.currentTime);
    } else if (type === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      
      // 添加低频正弦波调制产生浪花拍打的潮汐感
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 约 8 秒一个周期
      lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
      lfo.connect(filter.frequency);
      lfo.start();
      this.ambientLfo = lfo;
    }

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    whiteNoise.start();
    this.ambientSource = whiteNoise;
    this.ambientGainNode = gainNode;
    this.ambientFilterNode = filter;
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
    if (this.ambientLfo) {
      try {
        this.ambientLfo.stop();
        this.ambientLfo.disconnect();
      } catch (e) {}
      this.ambientLfo = null;
    }
    this.currentAmbientType = 'none';
  }

  setVolume(volume) {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.1);
    }
  }
}

window.soundEngine = new SoundEngine();
