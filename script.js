class PACountdownTimer {
    constructor() {
        // Core timer properties
        this.timeRemaining = 300; // 5 minutes in seconds
        this.isTimerRunning = false;
        this.lastSecond = -1;

        // Settings
        this.soundEnabled = true;
        this.marketModeOnly = true;
        this.preNotificationSeconds = 10;
        this.isDarkMode = false;

        // Timers
        this.mainTimer = null;
        this.clockTimer = null;
        this.marketCheckTimer = null;

        // Audio - 使用项目中的音频文件
        this.tickAudio = null;
        this.finalTickAudio = null;
        this.audioInitialized = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.initTheme();
        this.initAudio();
        this.startClockTimer();
        this.startMarketCheckTimer();
        this.checkMarketHours();
    }

    initTheme() {
        // 检查本地存储的主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            this.isDarkMode = savedTheme === 'dark';
            this.applyTheme();
        } else {
            // 跟随系统
            this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme();
        }
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.isDarkMode = e.matches;
                this.applyTheme();
            }
        });
    }

    applyTheme() {
        const html = document.documentElement;
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');

        if (this.isDarkMode) {
            html.classList.remove('light');
            html.classList.add('dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            html.classList.remove('dark');
            html.classList.add('light');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    initAudio() {
        // 创建音频对象
        this.tickAudio = new Audio('tick.wav');
        this.finalTickAudio = new Audio('final_tick.wav');

        // 设置音频属性
        this.tickAudio.preload = 'auto';
        this.finalTickAudio.preload = 'auto';
        this.tickAudio.volume = 0.7;
        this.finalTickAudio.volume = 0.8;

        // 添加音频加载事件监听
        this.tickAudio.addEventListener('canplaythrough', () => {
            console.log('Tick音频加载完成');
        });
        this.finalTickAudio.addEventListener('canplaythrough', () => {
            console.log('Final tick音频加载完成');
        });

        // 添加错误处理
        this.tickAudio.addEventListener('error', (e) => {
            console.error('Tick音频加载失败:', e);
        });
        this.finalTickAudio.addEventListener('error', (e) => {
            console.error('Final tick音频加载失败:', e);
        });

        // 用户交互后初始化音频
        const initAudioOnInteraction = () => {
            if (this.audioInitialized) return;

            try {
                // 尝试播放静音音频来解锁音频上下文
                const unlockAudio = () => {
                    this.tickAudio.muted = true;
                    this.finalTickAudio.muted = true;

                    Promise.all([
                        this.tickAudio.play(),
                        this.finalTickAudio.play()
                    ]).then(() => {
                        this.tickAudio.pause();
                        this.finalTickAudio.pause();
                        this.tickAudio.muted = false;
                        this.finalTickAudio.muted = false;
                        this.audioInitialized = true;
                        console.log('音频上下文已解锁');
                        this.updateUI(); // 更新UI显示
                    }).catch(e => {
                        console.log('音频解锁失败:', e);
                        this.audioInitialized = true; // 即使失败也标记为已初始化
                        this.updateUI(); // 更新UI显示
                    });
                };

                unlockAudio();
            } catch (e) {
                console.log('音频初始化失败:', e);
                this.audioInitialized = true;
                this.updateUI(); // 更新UI显示
            }
        };

        // 监听多种用户交互事件
        const events = ['click', 'touchstart', 'keydown', 'mousedown'];
        events.forEach(event => {
            document.addEventListener(event, initAudioOnInteraction, { once: true });
        });

        // 如果页面已经可见且用户可能已经交互过，尝试初始化
        if (!document.hidden) {
            setTimeout(initAudioOnInteraction, 1000);
        }
    }

    setupEventListeners() {
        document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('test-sound').addEventListener('click', () => this.testSound());
        document.getElementById('market-toggle').addEventListener('click', () => this.toggleMarketMode());
        document.getElementById('reset-timer').addEventListener('click', () => this.resetTimer());
        document.getElementById('notification-slider').addEventListener('input', (e) => this.updateNotificationTime(e.target.value));
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.resetTimer();
            }
        });
    }

    loadSettings() {
        const savedSound = localStorage.getItem('soundEnabled');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
        }

        const savedMarketMode = localStorage.getItem('marketModeOnly');
        if (savedMarketMode !== null) {
            this.marketModeOnly = savedMarketMode === 'true';
        }

        const savedNotificationTime = localStorage.getItem('preNotificationSeconds');
        if (savedNotificationTime !== null) {
            this.preNotificationSeconds = parseInt(savedNotificationTime);
            document.getElementById('notification-slider').value = this.preNotificationSeconds;
        }

        this.updateUI();
    }

    saveSettings() {
        localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        localStorage.setItem('marketModeOnly', this.marketModeOnly.toString());
        localStorage.setItem('preNotificationSeconds', this.preNotificationSeconds.toString());
    }

    startMainTimer() {
        if (this.isTimerRunning) return;

        this.isTimerRunning = true;
        this.calculateAndSetInitialTime();
        this.lastSecond = new Date().getSeconds();

        // Use high-frequency timer to check for second changes (like Swift version)
        this.mainTimer = setInterval(() => {
            const currentSecond = new Date().getSeconds();

            // Only proceed if the system clock's second has changed
            if (currentSecond !== this.lastSecond) {
                this.lastSecond = currentSecond;

                // Decrement the timer
                this.timeRemaining -= 1;

                if (this.timeRemaining < 0) {
                    this.calculateAndSetInitialTime();
                    return;
                }

                // Handle sound notifications
                if (this.soundEnabled) {
                    if (this.timeRemaining === 0) {
                        // Play final sound when timer hits zero
                        this.playFinalTickSound();
                    } else if (this.timeRemaining <= this.preNotificationSeconds && this.timeRemaining > 0) {
                        // Play tick sound during notification period (but not at zero)
                        this.playTickSound();
                    }
                }

                this.updateCountdownDisplay();

                // Reset timer for next 5-minute interval after it hits zero
                if (this.timeRemaining === 0) {
                    setTimeout(() => {
                        this.calculateAndSetInitialTime();
                        this.updateCountdownDisplay();
                    }, 500);
                }
            }
        }, 50); // 50ms interval for high precision
    }

    stopMainTimer() {
        this.isTimerRunning = false;
        if (this.mainTimer) {
            clearInterval(this.mainTimer);
            this.mainTimer = null;
        }
        this.lastSecond = -1;
    }

    calculateAndSetInitialTime() {
        const now = new Date();
        const minute = now.getMinutes();
        const second = now.getSeconds();

        const secondsIntoInterval = (minute % 5) * 60 + second;

        // Ensure timeRemaining is never negative
        this.timeRemaining = Math.max(0, 300 - secondsIntoInterval);
    }

    startClockTimer() {
        this.updateCurrentTime();
        this.clockTimer = setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    startMarketCheckTimer() {
        this.marketCheckTimer = setInterval(() => {
            this.checkMarketHours();
        }, 60000); // Check every minute
    }

    checkMarketHours() {
        if (this.isMarketOpen()) {
            document.getElementById('market-status').textContent = '市场开放';
            this.startMainTimer();
        } else {
            document.getElementById('market-status').textContent = '市场关闭';
            if (this.marketModeOnly) {
                this.stopMainTimer();
            } else {
                this.startMainTimer();
            }
        }
    }

    isMarketOpen() {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

        const weekday = easternTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        if (weekday === 0 || weekday === 6) return false; // Weekend

        const hour = easternTime.getHours();
        const minute = easternTime.getMinutes();
        const currentTimeInMinutes = hour * 60 + minute;

        const marketOpenTimeInMinutes = 9 * 60 + 30; // 9:30 AM
        const marketCloseTimeInMinutes = 16 * 60; // 4:00 PM

        return currentTimeInMinutes >= marketOpenTimeInMinutes && currentTimeInMinutes < marketCloseTimeInMinutes;
    }

    updateCurrentTime() {
        const now = new Date();
        // 显示系统本地时间
        const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
        document.getElementById('current-time').textContent = timeString;
    }

    updateCountdownDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('countdown').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    playTickSound() {
        if (this.soundEnabled && this.audioInitialized && this.tickAudio) {
            try {
                this.tickAudio.currentTime = 0;
                this.tickAudio.play().catch(e => {
                    console.log('Tick音频播放失败:', e);
                    // 如果播放失败，尝试重新初始化
                    if (e.name === 'NotAllowedError') {
                        this.audioInitialized = false;
                        this.initAudio();
                    }
                });
            } catch (e) {
                console.log('Tick音频播放错误:', e);
            }
        }
    }

    playFinalTickSound() {
        if (this.soundEnabled && this.audioInitialized && this.finalTickAudio) {
            try {
                this.finalTickAudio.currentTime = 0;
                this.finalTickAudio.play().catch(e => {
                    console.log('Final tick音频播放失败:', e);
                    // 如果播放失败，尝试重新初始化
                    if (e.name === 'NotAllowedError') {
                        this.audioInitialized = false;
                        this.initAudio();
                    }
                });
            } catch (e) {
                console.log('Final tick音频播放错误:', e);
            }
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateUI();
        this.saveSettings();
    }

    toggleMarketMode() {
        this.marketModeOnly = !this.marketModeOnly;
        this.updateUI();
        this.saveSettings();
        this.checkMarketHours(); // Re-check market hours with new setting
    }

    testSound() {
        if (!this.audioInitialized) {
            alert('音频尚未初始化，请点击页面任意位置后再试');
            return;
        }

        if (!this.soundEnabled) {
            alert('请先开启声音功能');
            return;
        }

        this.playTickSound();
        console.log('测试音频播放');
    }

    resetTimer() {
        this.stopMainTimer();
        this.checkMarketHours();
    }

    updateNotificationTime(value) {
        this.preNotificationSeconds = parseInt(value);
        document.getElementById('notification-time').textContent = value;
        this.saveSettings();
    }

    updateUI() {
        // Update sound button
        const soundBtn = document.getElementById('sound-toggle');
        if (this.audioInitialized) {
            soundBtn.textContent = this.soundEnabled ? '🔊 声音开启' : '🔇 声音关闭';
        } else {
            soundBtn.textContent = '⏳ 音频加载中...';
        }

        // Update market mode button
        const marketBtn = document.getElementById('market-toggle');
        marketBtn.textContent = this.marketModeOnly ? '📈 仅交易时间' : '🌍 全天运行';

        // Update notification time display
        document.getElementById('notification-time').textContent = this.preNotificationSeconds;

        // Update countdown display
        this.updateCountdownDisplay();
    }
}

// Initialize the timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PACountdownTimer();
}); 