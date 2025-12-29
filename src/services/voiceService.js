// 语音朗读服务
// 使用 Web Speech API 实现中文语音合成

class VoiceService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.voices = [];
        this.selectedVoice = null;

        // 默认配置（适合幼儿）
        this.config = {
            rate: 0.8,      // 语速（较慢，便于理解）
            pitch: 1.1,     // 音调（稍高，更亲切）
            volume: 1.0     // 音量
        };

        // 加载语音
        this.loadVoices();
    }

    /**
     * 加载可用的语音
     */
    loadVoices() {
        // 语音可能异步加载
        const loadVoiceList = () => {
            this.voices = this.synth.getVoices();
            // 优先选择中文语音
            this.selectedVoice = this.voices.find(v =>
                v.lang.includes('zh') || v.lang.includes('cmn')
            ) || this.voices[0];
        };

        loadVoiceList();

        // 某些浏览器需要等待 voiceschanged 事件
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoiceList;
        }
    }

    /**
     * 获取可用的中文语音
     * @returns {Array}
     */
    getChineseVoices() {
        return this.voices.filter(v =>
            v.lang.includes('zh') || v.lang.includes('cmn')
        );
    }

    /**
     * 设置语音
     * @param {SpeechSynthesisVoice} voice 
     */
    setVoice(voice) {
        this.selectedVoice = voice;
    }

    /**
     * 设置语速
     * @param {number} rate - 0.1 到 2.0
     */
    setRate(rate) {
        this.config.rate = Math.max(0.1, Math.min(2.0, rate));
    }

    /**
     * 朗读文本
     * @param {string} text - 要朗读的文本
     * @param {object} callbacks - 回调函数
     * @returns {Promise<void>}
     */
    speak(text, callbacks = {}) {
        return new Promise((resolve, reject) => {
            // 停止之前的朗读
            this.stop();

            if (!text) {
                reject(new Error('没有要朗读的文本'));
                return;
            }

            this.utterance = new SpeechSynthesisUtterance(text);

            // 应用配置
            this.utterance.voice = this.selectedVoice;
            this.utterance.rate = this.config.rate;
            this.utterance.pitch = this.config.pitch;
            this.utterance.volume = this.config.volume;
            this.utterance.lang = 'zh-CN';

            // 事件处理
            this.utterance.onstart = () => {
                this.isPlaying = true;
                this.isPaused = false;
                callbacks.onStart?.();
            };

            this.utterance.onend = () => {
                this.isPlaying = false;
                this.isPaused = false;
                callbacks.onEnd?.();
                resolve();
            };

            this.utterance.onerror = (event) => {
                this.isPlaying = false;
                this.isPaused = false;
                callbacks.onError?.(event);
                reject(event);
            };

            this.utterance.onpause = () => {
                this.isPaused = true;
                callbacks.onPause?.();
            };

            this.utterance.onresume = () => {
                this.isPaused = false;
                callbacks.onResume?.();
            };

            // 开始朗读
            this.synth.speak(this.utterance);
        });
    }

    /**
     * 暂停朗读
     */
    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.synth.pause();
        }
    }

    /**
     * 继续朗读
     */
    resume() {
        if (this.isPaused) {
            this.synth.resume();
        }
    }

    /**
     * 停止朗读
     */
    stop() {
        this.synth.cancel();
        this.isPlaying = false;
        this.isPaused = false;
    }

    /**
     * 切换播放/暂停
     */
    toggle() {
        if (this.isPlaying) {
            if (this.isPaused) {
                this.resume();
            } else {
                this.pause();
            }
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            isSpeaking: this.synth.speaking
        };
    }
}

// 单例模式
const voiceService = new VoiceService();
export default voiceService;

export { VoiceService };
