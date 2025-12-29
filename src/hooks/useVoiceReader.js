// 语音朗读 Hook
// 封装语音朗读功能

import { useState, useCallback, useEffect } from 'react';
import voiceService from '../services/voiceService';
import { prepareForSpeech } from '../services/promptEnhancer';

export function useVoiceReader() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentText, setCurrentText] = useState('');

    // 组件卸载时停止朗读
    useEffect(() => {
        return () => {
            voiceService.stop();
        };
    }, []);

    /**
     * 开始朗读
     * @param {string} text - 要朗读的文本
     */
    const speak = useCallback(async (text) => {
        if (!text) return;

        const preparedText = prepareForSpeech(text);
        setCurrentText(preparedText);

        try {
            await voiceService.speak(preparedText, {
                onStart: () => {
                    setIsPlaying(true);
                    setIsPaused(false);
                },
                onEnd: () => {
                    setIsPlaying(false);
                    setIsPaused(false);
                },
                onPause: () => {
                    setIsPaused(true);
                },
                onResume: () => {
                    setIsPaused(false);
                },
                onError: (error) => {
                    console.error('语音朗读错误:', error);
                    setIsPlaying(false);
                    setIsPaused(false);
                }
            });
        } catch (error) {
            console.error('语音朗读失败:', error);
        }
    }, []);

    /**
     * 暂停朗读
     */
    const pause = useCallback(() => {
        voiceService.pause();
    }, []);

    /**
     * 继续朗读
     */
    const resume = useCallback(() => {
        voiceService.resume();
    }, []);

    /**
     * 停止朗读
     */
    const stop = useCallback(() => {
        voiceService.stop();
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    /**
     * 切换播放/暂停
     */
    const toggle = useCallback(() => {
        if (isPlaying) {
            if (isPaused) {
                resume();
            } else {
                pause();
            }
        } else if (currentText) {
            speak(currentText);
        }
    }, [isPlaying, isPaused, currentText, speak, pause, resume]);

    return {
        speak,
        pause,
        resume,
        stop,
        toggle,
        isPlaying,
        isPaused,
        currentText
    };
}

export default useVoiceReader;
