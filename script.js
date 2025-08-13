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
        this.currentLanguage = 'zh'; // 默认中文

        // Timers
        this.mainTimer = null;
        this.clockTimer = null;
        this.marketCheckTimer = null;

        // Audio - 使用项目中的音频文件
        this.tickAudio = null;
        this.finalTickAudio = null;
        this.audioInitialized = false;

        // 多语言配置
        this.translations = {
            zh: {
                title: 'PACountdown',
                subtitle: '精准的5分钟间隔倒计时器',
                marketStatus: '市场状态',
                currentTime: '当前时间',
                marketOpen: '市场开放',
                marketClosed: '市场关闭',
                checking: '检查中...',
                soundOn: '🔊 声音开启',
                soundOff: '🔇 声音关闭',
                audioLoading: '⏳ 音频加载中...',
                testSound: '🎵 测试声音',
                marketMode: '📈 仅交易时间',
                allDayMode: '🌍 全天运行',
                reset: '🔄 重置',
                notificationTime: '提前通知时间',
                seconds: '秒',
                audioNotInitialized: '音频尚未初始化，请点击页面任意位置后再试',
                enableSoundFirst: '请先开启声音功能',
                sun: '☀️',
                moon: '🌙'
            },
            en: {
                title: 'PACountdown',
                subtitle: 'Precise 5-Minute Interval Timer',
                marketStatus: 'Market Status',
                currentTime: 'Current Time',
                marketOpen: 'Market Open',
                marketClosed: 'Market Closed',
                checking: 'Checking...',
                soundOn: '🔊 Sound On',
                soundOff: '🔇 Sound Off',
                audioLoading: '⏳ Audio Loading...',
                testSound: '🎵 Test Sound',
                marketMode: '📈 Trading Hours Only',
                allDayMode: '🌍 All Day',
                reset: '🔄 Reset',
                notificationTime: 'Early Notification',
                seconds: 'seconds',
                audioNotInitialized: 'Audio not initialized, please click anywhere on the page first',
                enableSoundFirst: 'Please enable sound first',
                sun: '☀️',
                moon: '🌙'
            }
        };

        this.init();
    }

    init() {
        this.detectLanguage();
        this.setupEventListeners();
        this.loadSettings();
        this.initTheme();
        this.initAudio();
        this.startClockTimer();
        this.startMarketCheckTimer();
        this.checkMarketHours();
        this.updateLanguageUI();
    }

    detectLanguage() {
        // 从本地存储加载保存的语言设置
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            // 根据浏览器语言自动检测
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('zh')) {
                this.currentLanguage = 'zh';
            } else {
                this.currentLanguage = 'en';
            }
        }
    }

    getText(key) {
        return this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    }

    updateLanguageUI() {
        // 更新页面标题
        document.title = this.getText('title') + ' - ' + this.getText('subtitle');

        // 更新主标题
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = this.getText('title');
        }

        // 更新副标题
        const subtitleElement = document.querySelector('p');
        if (subtitleElement) {
            subtitleElement.textContent = this.getText('subtitle');
        }

        // 更新状态标签
        const marketStatusLabel = document.querySelector('.text-blue-600, .text-blue-200');
        if (marketStatusLabel) {
            marketStatusLabel.textContent = this.getText('marketStatus');
        }

        const currentTimeLabel = document.querySelector('.text-green-600, .text-green-200');
        if (currentTimeLabel) {
            currentTimeLabel.textContent = this.getText('currentTime');
        }

        // 更新市场状态文本
        const marketStatusElement = document.getElementById('market-status');
        if (marketStatusElement && marketStatusElement.textContent !== '--:--:--') {
            if (this.isMarketOpen()) {
                marketStatusElement.textContent = this.getText('marketOpen');
            } else {
                marketStatusElement.textContent = this.getText('marketClosed');
            }
        }

        // 更新按钮文本
        this.updateUI();

        // 更新通知设置文本
        const notificationContainer = document.querySelector('.text-purple-600, .text-purple-200');
        if (notificationContainer) {
            const notificationTimeElement = document.getElementById('notification-time');
            if (notificationTimeElement) {
                notificationContainer.innerHTML = this.getText('notificationTime') + ': <span class="font-medium" id="notification-time">' + this.preNotificationSeconds + '</span> ' + this.getText('seconds');
            }
        }

        // 更新语言切换按钮文本
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            const span = languageToggle.querySelector('span');
            if (span) {
                span.textContent = this.currentLanguage === 'zh' ? '中/En' : 'En/中';
            }
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        localStorage.setItem('language', this.currentLanguage);
        this.updateLanguageUI();
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
        document.getElementById('language-toggle').addEventListener('click', () => this.toggleLanguage());

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
            document.getElementById('market-status').textContent = this.getText('marketOpen');
            this.startMainTimer();
        } else {
            document.getElementById('market-status').textContent = this.getText('marketClosed');
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
            alert(this.getText('audioNotInitialized'));
            return;
        }

        if (!this.soundEnabled) {
            alert(this.getText('enableSoundFirst'));
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
            soundBtn.textContent = this.soundEnabled ? this.getText('soundOn') : this.getText('soundOff');
        } else {
            soundBtn.textContent = this.getText('audioLoading');
        }

        // Update market mode button
        const marketBtn = document.getElementById('market-toggle');
        marketBtn.textContent = this.marketModeOnly ? this.getText('marketMode') : this.getText('allDayMode');

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