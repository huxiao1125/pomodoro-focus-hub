/**
 * Pomodoro Focus Hub - Core Application Logic
 */

(function () {
  'use strict';

  // 常量与配置
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 130; // 816.814

  const THEMES = ['midnight', 'zen', 'sunset'];

  const DEFAULT_SETTINGS = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    cycleInterval: 4,
    theme: 'midnight'
  };

  // 状态初始化
  let settings = loadSettings();
  let currentMode = 'focus'; // 'focus' | 'shortBreak' | 'longBreak'
  let isRunning = false;
  let timeLeft = settings.focusTime * 60;
  let totalDuration = settings.focusTime * 60;
  let currentCycle = 1; // 1 ~ 4
  let todayTomatoes = 0;
  let totalFocusSeconds = 0;

  // 定时器引用与校准
  let timerId = null;
  let targetEndTime = null;

  // DOM 元素引用
  const timeDisplay = document.getElementById('time-display');
  const modeText = document.getElementById('mode-text');
  const timerProgress = document.getElementById('timer-progress');
  const focusCard = document.getElementById('focus-card');
  const sessionDots = document.getElementById('session-dots');

  const toggleBtn = document.getElementById('toggle-btn');
  const toggleIcon = document.getElementById('toggle-icon');
  const toggleText = document.getElementById('toggle-text');
  const resetBtn = document.getElementById('reset-btn');
  const skipBtn = document.getElementById('skip-btn');

  const tabFocus = document.getElementById('tab-focus');
  const tabShortBreak = document.getElementById('tab-short-break');
  const tabLongBreak = document.getElementById('tab-long-break');
  const allTabs = [tabFocus, tabShortBreak, tabLongBreak];

  const taskInput = document.getElementById('task-input');

  const themeBtn = document.getElementById('theme-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const statsBtn = document.getElementById('stats-btn');

  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const inputFocus = document.getElementById('setting-focus');
  const inputShort = document.getElementById('setting-short');
  const inputLong = document.getElementById('setting-long');
  const inputCycle = document.getElementById('setting-cycle');

  const statsModal = document.getElementById('stats-modal');
  const closeStatsBtn = document.getElementById('close-stats-btn');
  const statTotalTomatoes = document.getElementById('stat-total-tomatoes');
  const statFocusTime = document.getElementById('stat-focus-time');

  const soundChips = document.querySelectorAll('.sound-chip');
  const volumeSlider = document.getElementById('volume-slider');

  // 初始化加载
  function init() {
    loadStats();
    applyTheme(settings.theme);
    updateInputsFromSettings();
    updateSessionDots();
    updateDisplay();
    bindEvents();
    loadTask();
  }

  // 本地存储
  function loadSettings() {
    try {
      const saved = localStorage.getItem('focus_hub_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    localStorage.setItem('focus_hub_settings', JSON.stringify(settings));
  }

  function loadStats() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem('focus_hub_stats_' + today);
      if (saved) {
        const data = JSON.parse(saved);
        todayTomatoes = data.tomatoes || 0;
        totalFocusSeconds = data.seconds || 0;
      }
    } catch (e) {}
  }

  function saveStats() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('focus_hub_stats_' + today, JSON.stringify({
        tomatoes: todayTomatoes,
        seconds: totalFocusSeconds
      }));
    } catch (e) {}
  }

  function loadTask() {
    const saved = localStorage.getItem('focus_hub_current_task');
    if (saved) taskInput.value = saved;
  }

  // 模式与时间逻辑
  function getModeDuration(mode) {
    if (mode === 'focus') return settings.focusTime * 60;
    if (mode === 'shortBreak') return settings.shortBreakTime * 60;
    if (mode === 'longBreak') return settings.longBreakTime * 60;
    return 25 * 60;
  }

  function setMode(mode, autoStart = false) {
    pauseTimer();
    currentMode = mode;
    totalDuration = getModeDuration(mode);
    timeLeft = totalDuration;

    // 更新 Tab 样式
    allTabs.forEach(tab => {
      const isMatch = tab.dataset.mode === mode;
      tab.classList.toggle('active', isMatch);
      tab.setAttribute('aria-selected', isMatch);
    });

    // 动态调整主题变量
    const root = document.documentElement;
    if (mode === 'focus') {
      root.style.setProperty('--active-color', 'var(--color-focus)');
      root.style.setProperty('--active-glow', 'var(--color-focus-glow)');
      root.style.setProperty('--active-grad', 'var(--color-focus-grad)');
      modeText.textContent = '专注模式';
    } else if (mode === 'shortBreak') {
      root.style.setProperty('--active-color', 'var(--color-short-break)');
      root.style.setProperty('--active-glow', 'var(--color-short-break-glow)');
      root.style.setProperty('--active-grad', 'var(--color-short-break-grad)');
      modeText.textContent = '短休息';
    } else if (mode === 'longBreak') {
      root.style.setProperty('--active-color', 'var(--color-long-break)');
      root.style.setProperty('--active-glow', 'var(--color-long-break-glow)');
      root.style.setProperty('--active-grad', 'var(--color-long-break-grad)');
      modeText.textContent = '长休息';
    }

    updateDisplay();

    if (autoStart) {
      startTimer();
    }
  }

  function toggleTimer() {
    window.soundEngine.playClick();
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    focusCard.classList.add('running');
    toggleIcon.textContent = '⏸';
    toggleText.textContent = '暂停';

    targetEndTime = Date.now() + timeLeft * 1000;
    requestNotificationPermission();

    timerId = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((targetEndTime - now) / 1000));
      const elapsed = timeLeft - diff;

      // 准确按照实际流逝的秒数进行累加，避免 250ms 高频触发导致的时长虚增
      if (currentMode === 'focus' && elapsed > 0) {
        totalFocusSeconds += elapsed;
        if (totalFocusSeconds % 10 === 0) saveStats();
      }

      timeLeft = diff;

      updateDisplay();

      if (timeLeft <= 0) {
        handleTimerCompletion();
      }
    }, 250);
  }

  function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    focusCard.classList.remove('running');
    toggleIcon.textContent = '▶';
    toggleText.textContent = currentMode === 'focus' ? '继续专注' : '继续休息';
    clearInterval(timerId);
    timerId = null;
  }

  function resetTimer() {
    window.soundEngine.playClick();
    pauseTimer();
    timeLeft = totalDuration;
    toggleText.textContent = currentMode === 'focus' ? '开始专注' : '开始休息';
    updateDisplay();
  }

  function skipSession() {
    window.soundEngine.playClick();
    pauseTimer();
    advanceToNextMode();
  }

  // 桌面系统通知管理
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function sendDesktopNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
        });
      } catch (e) {}
    }
  }

  function handleTimerCompletion() {
    pauseTimer();
    window.soundEngine.playChime();

    if (currentMode === 'focus') {
      todayTomatoes++;
      saveStats();

      sendDesktopNotification('🍅 专注时段达成！', '太棒了，休息一下眼睛和身体吧。');

      if (currentCycle >= settings.cycleInterval) {
        currentCycle = 1;
        setMode('longBreak', false);
      } else {
        currentCycle++;
        setMode('shortBreak', false);
      }
    } else {
      sendDesktopNotification('☕ 休息结束！', '准备好开始新一轮高效专注了吗？');
      setMode('focus', false);
    }
    updateSessionDots();
    updateDisplay();
  }

  function advanceToNextMode() {
    if (currentMode === 'focus') {
      if (currentCycle >= settings.cycleInterval) {
        currentCycle = 1;
        setMode('longBreak', false);
      } else {
        currentCycle++;
        setMode('shortBreak', false);
      }
    } else {
      setMode('focus', false);
    }
    updateSessionDots();
  }

  function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    timeDisplay.textContent = timeStr;

    // 更新页面标题
    const modeName = currentMode === 'focus' ? '专注' : '休息';
    document.title = `(${timeStr}) ${modeName} · FocusHub`;

    // 更新圆环进度
    const progressFraction = totalDuration > 0 ? timeLeft / totalDuration : 0;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progressFraction);
    timerProgress.style.strokeDashoffset = offset;
  }

  function updateSessionDots() {
    sessionDots.innerHTML = '';
    for (let i = 1; i <= settings.cycleInterval; i++) {
      const dot = document.createElement('span');
      dot.className = 'session-dot' + (i <= currentCycle ? ' filled' : '');
      sessionDots.appendChild(dot);
    }
    sessionDots.title = `第 ${currentCycle} 轮专注周期 (共 ${settings.cycleInterval} 轮)`;
  }

  // 主题与弹窗
  function applyTheme(themeName) {
    if (themeName === 'midnight') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', themeName);
    }
    settings.theme = themeName;
    saveSettings();
  }

  function cycleTheme() {
    window.soundEngine.playClick();
    const currentIdx = THEMES.indexOf(settings.theme);
    const nextTheme = THEMES[(currentIdx + 1) % THEMES.length];
    applyTheme(nextTheme);
  }

  function updateInputsFromSettings() {
    inputFocus.value = settings.focusTime;
    inputShort.value = settings.shortBreakTime;
    inputLong.value = settings.longBreakTime;
    inputCycle.value = settings.cycleInterval;

    tabFocus.textContent = `专注 ${settings.focusTime}m`;
    tabShortBreak.textContent = `短休息 ${settings.shortBreakTime}m`;
    tabLongBreak.textContent = `长休息 ${settings.longBreakTime}m`;
  }

  function openSettings() {
    window.soundEngine.playClick();
    updateInputsFromSettings();
    settingsModal.classList.add('open');
  }

  function closeSettings() {
    settingsModal.classList.remove('open');
  }

  function saveSettingsFromModal() {
    window.soundEngine.playClick();
    const f = Math.max(1, Math.min(120, parseInt(inputFocus.value) || 25));
    const s = Math.max(1, Math.min(30, parseInt(inputShort.value) || 5));
    const l = Math.max(1, Math.min(60, parseInt(inputLong.value) || 15));
    const c = Math.max(2, Math.min(10, parseInt(inputCycle.value) || 4));

    settings.focusTime = f;
    settings.shortBreakTime = s;
    settings.longBreakTime = l;
    settings.cycleInterval = c;

    saveSettings();
    updateInputsFromSettings();
    updateSessionDots();
    setMode(currentMode);
    closeSettings();
  }

  function openStats() {
    window.soundEngine.playClick();
    loadStats();
    statTotalTomatoes.textContent = todayTomatoes;
    const hrs = Math.floor(totalFocusSeconds / 3600);
    const mins = Math.floor((totalFocusSeconds % 3600) / 60);
    statFocusTime.textContent = `${hrs}h ${mins}m`;
    statsModal.classList.add('open');
  }

  function closeStats() {
    statsModal.classList.remove('open');
  }

  // 事件监听
  function bindEvents() {
    toggleBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipSession);

    allTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        window.soundEngine.playClick();
        setMode(tab.dataset.mode);
      });
    });

    taskInput.addEventListener('input', (e) => {
      localStorage.setItem('focus_hub_current_task', e.target.value);
    });

    themeBtn.addEventListener('click', cycleTheme);
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettingsFromModal);

    statsBtn.addEventListener('click', openStats);
    closeStatsBtn.addEventListener('click', closeStats);

    [settingsModal, statsModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });

    // 白噪音控制
    soundChips.forEach(chip => {
      chip.addEventListener('click', () => {
        window.soundEngine.playClick();
        soundChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const soundType = chip.dataset.sound;
        window.soundEngine.setAmbient(soundType);
      });
    });

    volumeSlider.addEventListener('input', (e) => {
      window.soundEngine.setVolume(parseFloat(e.target.value));
    });

    // 快捷键支持
    window.addEventListener('keydown', (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        resetTimer();
      } else if (e.key === 's' || e.key === 'S') {
        skipSession();
      } else if (e.key === 'Escape') {
        closeSettings();
        closeStats();
      }
    });
  }

  // 启动应用
  init();
})();
