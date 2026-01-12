// VocabMaster - Professional English Vocabulary Learning Platform
class VocabMaster {
    constructor() {
        this.currentScreen = 'home';
        this.currentQuestion = 0;
        this.questions = [];
        this.userAnswers = [];
        this.startTime = null;
        this.questionStartTime = null;
        this.performanceChart = null;
        this.speedChart = null;
        this.wordAnalysisChart = null;
        this.wordDatabase = [];
        this.streakCount = 0;
        this.settings = {
            targetUniversity: 'tokyo',
            difficultyLevel: 'standard',
            questionsPerSession: 10,
            timeLimit: 5,
            dailyReminder: false,
            soundEffects: true
        };
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.loadWordDatabase();
        this.loadUserData();
        this.setupEventListeners();
        this.updateDashboard();
        this.hideLoadingScreen();
        this.showScreen('home');
        this.showToast('VocabMasterへようこそ！', 'success');
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }

    async loadWordDatabase() {
        try {
            const response = await fetch('words.csv');
            const csvText = await response.text();
            this.wordDatabase = this.parseCSV(csvText);
        } catch (error) {
            console.error('Failed to load word database:', error);
            this.showToast('単語データの読み込みに失敗しました', 'error');
            // Fallback to embedded data
            this.wordDatabase = this.getFallbackWords();
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const words = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= 6) {
                words.push({
                    word: values[0],
                    meaning: values[1],
                    level: values[2],
                    frequency: values[3],
                    category: values[4],
                    example: values[5].replace(/"/g, '')
                });
            }
        }
        return words;
    }

    getFallbackWords() {
        return [
            { word: "abandon", meaning: "捨てる・放棄する", level: "basic", frequency: "high", category: "verb", example: "He had to abandon his car." },
            { word: "ability", meaning: "能力", level: "basic", frequency: "high", category: "noun", example: "She has great ability." }
        ];
    } 
   setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.showScreen(screen);
            });
        });

        // Home screen actions
        document.getElementById('startDrillBtn').addEventListener('click', () => this.startDrill());
        document.getElementById('weakPointBtn').addEventListener('click', () => this.startWeakPointDrill());
        document.getElementById('reviewBtn').addEventListener('click', () => this.startReview());

        // Drill screen
        document.getElementById('backToHomeBtn').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('skipBtn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());

        // Settings
        this.setupSettingsListeners();

        // Analysis tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showAnalysisTab(tabName);
            });
        });

        // Word analysis controls
        document.getElementById('wordSearchInput')?.addEventListener('input', () => this.updateWordAnalysis());
        document.getElementById('chartTypeSelect')?.addEventListener('change', () => this.updateWordAnalysis());
        document.getElementById('levelFilter')?.addEventListener('change', () => this.updateWordAnalysis());

        // Modal controls
        document.getElementById('closeResultsModal')?.addEventListener('click', () => this.hideModal('resultsModal'));
        document.getElementById('continueStudyBtn')?.addEventListener('click', () => {
            this.hideModal('resultsModal');
            this.startDrill();
        });
        document.getElementById('reviewMistakesBtn')?.addEventListener('click', () => {
            this.hideModal('resultsModal');
            this.startReview();
        });
    }

    setupSettingsListeners() {
        const settings = ['targetUniversity', 'difficultyLevel', 'questionsPerSession', 'timeLimit', 'dailyReminder', 'soundEffects'];
        
        settings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                const eventType = element.type === 'range' ? 'input' : 'change';
                element.addEventListener(eventType, (e) => {
                    const value = e.target.type === 'checkbox' ? e.target.checked : 
                                  e.target.type === 'range' ? parseInt(e.target.value) : e.target.value;
                    this.settings[setting] = value;
                    this.saveUserData();
                    this.updateSettingsDisplay();
                    if (setting === 'targetUniversity') {
                        this.updateDashboard();
                    }
                });
            }
        });

        // Data management buttons
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn')?.addEventListener('click', () => this.importData());
        document.getElementById('resetDataBtn')?.addEventListener('click', () => this.resetData());
    }

    showScreen(screenName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-screen="${screenName}"]`)?.classList.add('active');

        // Update screens
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenName + 'Screen')?.classList.add('active');

        this.currentScreen = screenName;

        // Screen-specific initialization
        if (screenName === 'analysis') {
            this.initializeAnalysis();
        } else if (screenName === 'settings') {
            this.initializeSettings();
        }
    }

    updateDashboard() {
        const stats = this.calculateStats();
        const universityData = this.getUniversityData();
        const targetUniv = universityData[this.settings.targetUniversity];

        // Update stat cards
        document.getElementById('todayCount').textContent = stats.todayCount;
        document.getElementById('accuracyRate').textContent = stats.accuracyRate + '%';
        document.getElementById('avgTime').textContent = stats.avgTime + 's';
        document.getElementById('targetUniv').textContent = targetUniv.name;

        // Calculate and display pass rate
        const passRate = this.calculatePassRate(stats, targetUniv);
        document.getElementById('passRate').textContent = passRate + '%';

        // Update streak counter
        document.getElementById('streakCount').textContent = this.streakCount;

        // Update progress bars
        this.updateLevelProgress();
    }

    calculateStats() {
        const history = this.getStoredData('history') || [];
        const today = new Date().toDateString();
        
        const todayHistory = history.filter(h => new Date(h.date).toDateString() === today);
        const allHistory = history;

        let totalCorrect = 0;
        let totalQuestions = 0;
        let totalTime = 0;

        allHistory.forEach(session => {
            session.answers.forEach(answer => {
                totalQuestions++;
                if (answer.correct) totalCorrect++;
                totalTime += answer.responseTime || 0;
            });
        });

        return {
            todayCount: todayHistory.reduce((sum, session) => sum + session.answers.length, 0),
            accuracyRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            avgTime: totalQuestions > 0 ? Math.round(totalTime / totalQuestions / 1000) : 0
        };
    }

    getUniversityData() {
        return {
            tokyo: { name: "東京大学", requiredAccuracy: 90, requiredSpeed: 3 },
            kyoto: { name: "京都大学", requiredAccuracy: 88, requiredSpeed: 3.5 },
            waseda: { name: "早稲田大学", requiredAccuracy: 85, requiredSpeed: 4 },
            keio: { name: "慶應義塾大学", requiredAccuracy: 85, requiredSpeed: 4 },
            sophia: { name: "上智大学", requiredAccuracy: 82, requiredSpeed: 4.5 },
            march: { name: "MARCH", requiredAccuracy: 80, requiredSpeed: 5 },
            kansai: { name: "関関同立", requiredAccuracy: 78, requiredSpeed: 5.5 }
        };
    }

    calculatePassRate(stats, targetUniv) {
        const accuracyScore = Math.min(stats.accuracyRate / targetUniv.requiredAccuracy, 1) * 50;
        const speedScore = Math.min(targetUniv.requiredSpeed / Math.max(stats.avgTime, 1), 1) * 50;
        return Math.round(accuracyScore + speedScore);
    }

    updateLevelProgress() {
        const history = this.getStoredData('history') || [];
        const masteredWords = this.getMasteredWords(history);
        
        const levels = ['basic', 'standard', 'advanced'];
        levels.forEach(level => {
            const totalWords = this.wordDatabase.filter(w => w.level === level).length;
            const masteredCount = masteredWords.filter(w => w.level === level).length;
            const percentage = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;
            
            const progressFill = document.getElementById(level + 'Progress');
            const progressText = document.getElementById(level + 'ProgressText');
            
            if (progressFill) progressFill.style.width = percentage + '%';
            if (progressText) progressText.textContent = `${masteredCount}/${totalWords}`;
        });
    }

    getMasteredWords(history) {
        const wordStats = {};
        
        history.forEach(session => {
            session.answers.forEach(answer => {
                if (!wordStats[answer.word]) {
                    wordStats[answer.word] = { correct: 0, total: 0, level: answer.level };
                }
                wordStats[answer.word].total++;
                if (answer.correct) wordStats[answer.word].correct++;
            });
        });

        return Object.keys(wordStats)
            .filter(word => {
                const stats = wordStats[word];
                return stats.total >= 3 && (stats.correct / stats.total) >= 0.8;
            })
            .map(word => ({ word, level: wordStats[word].level }));
    }

    startDrill() {
        this.generateQuestions();
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        this.showScreen('drill');
        this.showQuestion();
    }

    generateQuestions() {
        let filteredWords = [];
        
        if (this.settings.difficultyLevel === 'mixed') {
            filteredWords = this.wordDatabase;
        } else {
            filteredWords = this.wordDatabase.filter(word => 
                word.level === this.settings.difficultyLevel || 
                (this.settings.difficultyLevel === 'standard' && word.level === 'basic')
            );
        }

        this.questions = [];
        const usedWords = new Set();

        for (let i = 0; i < this.settings.questionsPerSession; i++) {
            let word;
            do {
                word = filteredWords[Math.floor(Math.random() * filteredWords.length)];
            } while (usedWords.has(word.word) && usedWords.size < filteredWords.length);

            usedWords.add(word.word);
            const options = this.generateOptions(word, filteredWords);
            
            this.questions.push({
                word: word.word,
                meaning: word.meaning,
                correctAnswer: word.meaning,
                options: options,
                level: word.level,
                category: word.category,
                example: word.example
            });
        }
    }

    generateOptions(correctWord, wordDb) {
        const options = [correctWord.meaning];
        const otherWords = wordDb.filter(w => w.word !== correctWord.word && w.level === correctWord.level);
        
        while (options.length < 4 && otherWords.length > 0) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            if (!options.includes(randomWord.meaning)) {
                options.push(randomWord.meaning);
            }
            otherWords.splice(otherWords.indexOf(randomWord), 1);
        }

        // Fill remaining slots if needed
        while (options.length < 4) {
            const randomWord = wordDb[Math.floor(Math.random() * wordDb.length)];
            if (!options.includes(randomWord.meaning)) {
                options.push(randomWord.meaning);
            }
        }

        return this.shuffleArray(options);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.finishDrill();
            return;
        }

        const question = this.questions[this.currentQuestion];
        this.questionStartTime = Date.now();

        // Update progress
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('questionNumber').textContent = 
            `${this.currentQuestion + 1}/${this.questions.length}`;

        // Update question content
        document.getElementById('questionText').textContent = question.word;
        document.getElementById('questionLevel').textContent = this.getLevelLabel(question.level);
        document.getElementById('questionCategory').textContent = question.category;
        document.getElementById('questionExample').textContent = question.example;

        // Generate options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(option));
            optionsContainer.appendChild(button);
        });

        this.startQuestionTimer();
    }

    startQuestionTimer() {
        const timerElement = document.getElementById('timer');
        const timerCircle = document.getElementById('timerCircle');
        const startTime = Date.now();
        let timeLeft = this.settings.timeLimit;

        timerCircle.classList.remove('warning', 'danger', 'timeout', 'success');
        timerElement.textContent = timeLeft;

        const updateTimer = () => {
            if (this.currentScreen !== 'drill') return;
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeLeft = Math.max(0, this.settings.timeLimit - elapsed);
            
            timerElement.textContent = timeLeft;

            timerCircle.classList.remove('warning', 'danger', 'timeout');
            if (timeLeft <= 0) {
                timerCircle.classList.add('timeout');
                this.timeoutQuestion();
                return;
            } else if (timeLeft <= 1) {
                timerCircle.classList.add('danger');
            } else if (timeLeft <= 2) {
                timerCircle.classList.add('warning');
            }

            setTimeout(updateTimer, 100);
        };

        updateTimer();
    }

    selectAnswer(selectedAnswer) {
        const question = this.questions[this.currentQuestion];
        const responseTime = Date.now() - this.questionStartTime;
        const isCorrect = selectedAnswer === question.correctAnswer;

        this.userAnswers.push({
            word: question.word,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.correctAnswer,
            correct: isCorrect,
            responseTime: responseTime,
            level: question.level
        });

        this.highlightAnswer(selectedAnswer, question.correctAnswer);
        
        if (this.settings.soundEffects) {
            this.playSound(isCorrect ? 'correct' : 'incorrect');
        }

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    highlightAnswer(selectedAnswer, correctAnswer) {
        const optionBtns = document.querySelectorAll('.option-btn');
        const timerCircle = document.getElementById('timerCircle');
        
        optionBtns.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });

        if (selectedAnswer === correctAnswer) {
            timerCircle.classList.add('success');
        }
    }

    timeoutQuestion() {
        const question = this.questions[this.currentQuestion];
        const responseTime = Date.now() - this.questionStartTime;

        this.userAnswers.push({
            word: question.word,
            selectedAnswer: null,
            correctAnswer: question.correctAnswer,
            correct: false,
            responseTime: responseTime,
            level: question.level,
            timeout: true
        });

        this.highlightAnswer(null, question.correctAnswer);
        
        if (this.settings.soundEffects) {
            this.playSound('timeout');
        }

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    skipQuestion() {
        const question = this.questions[this.currentQuestion];
        const responseTime = Date.now() - this.questionStartTime;

        this.userAnswers.push({
            word: question.word,
            selectedAnswer: null,
            correctAnswer: question.correctAnswer,
            correct: false,
            responseTime: responseTime,
            level: question.level,
            skipped: true
        });

        this.highlightAnswer(null, question.correctAnswer);

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    showHint() {
        const question = this.questions[this.currentQuestion];
        const hint = question.correctAnswer.charAt(0) + '...';
        this.showToast(`ヒント: ${hint}`, 'info');
    }

    finishDrill() {
        const totalTime = Date.now() - this.startTime;
        const correctCount = this.userAnswers.filter(a => a.correct).length;
        const accuracy = Math.round((correctCount / this.userAnswers.length) * 100);
        const avgTime = Math.round(totalTime / this.userAnswers.length / 1000);
        const fastestTime = Math.min(...this.userAnswers.map(a => a.responseTime)) / 1000;

        // Save session
        this.saveSession({
            date: new Date().toISOString(),
            answers: this.userAnswers,
            totalTime: totalTime,
            accuracy: accuracy
        });

        // Update streak
        this.updateStreak(accuracy);

        // Show results modal
        this.showResults(correctCount, accuracy, avgTime, fastestTime);

        // Update dashboard
        this.updateDashboard();
    }

    showResults(correctCount, accuracy, avgTime, fastestTime) {
        document.getElementById('resultScore').textContent = correctCount;
        document.getElementById('resultAccuracy').textContent = accuracy + '%';
        document.getElementById('resultAvgTime').textContent = avgTime + 's';
        document.getElementById('resultFastestTime').textContent = fastestTime.toFixed(1) + 's';
        
        this.showModal('resultsModal');
        
        if (accuracy >= 80) {
            this.showToast('素晴らしい成績です！', 'success');
        } else if (accuracy >= 60) {
            this.showToast('良い調子です！', 'info');
        } else {
            this.showToast('復習して頑張りましょう！', 'warning');
        }
    }

    updateStreak(accuracy) {
        if (accuracy >= 70) {
            this.streakCount++;
        } else {
            this.streakCount = 0;
        }
        this.saveUserData();
    }

    // Analysis methods
    initializeAnalysis() {
        this.showAnalysisTab('performance');
        this.updateAnalysisSummary();
    }

    updateAnalysisSummary() {
        const history = this.getStoredData('history') || [];
        const totalTime = history.reduce((sum, session) => sum + (session.totalTime || 0), 0);
        const masteredWords = this.getMasteredWords(history);

        document.getElementById('totalStudyTime').textContent = Math.round(totalTime / 60000) + '分';
        document.getElementById('masteredWords').textContent = masteredWords.length + '語';
    }

    showAnalysisTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(tabName + 'Tab')?.classList.add('active');

        switch (tabName) {
            case 'performance':
                this.showPerformanceChart();
                break;
            case 'speed':
                this.showSpeedChart();
                break;
            case 'wordAnalysis':
                this.updateWordAnalysis();
                break;
            case 'weakness':
                this.showWeaknessList();
                break;
        }
    }

    showPerformanceChart() {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (!ctx) return;

        const history = this.getStoredData('history') || [];
        
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        if (history.length === 0) {
            this.showNoDataMessage(ctx, '学習データがありません');
            return;
        }

        const recentSessions = history.slice(-10);
        const labels = recentSessions.map((_, index) => `セッション${index + 1}`);
        const accuracyData = recentSessions.map(session => session.accuracy);

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '正答率 (%)',
                    data: accuracyData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '学習成績の推移',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f3f4f6' },
                        ticks: { font: { size: 12 } }
                    },
                    x: {
                        grid: { color: '#f3f4f6' },
                        ticks: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    showSpeedChart() {
        const ctx = document.getElementById('speedChart')?.getContext('2d');
        if (!ctx) return;

        const history = this.getStoredData('history') || [];
        
        if (this.speedChart) {
            this.speedChart.destroy();
        }

        if (history.length === 0) {
            this.showNoDataMessage(ctx, '学習データがありません');
            return;
        }

        const levelStats = { basic: [], standard: [], advanced: [] };
        
        history.forEach(session => {
            session.answers.forEach(answer => {
                if (answer.level && answer.responseTime && !answer.timeout) {
                    levelStats[answer.level].push(answer.responseTime / 1000);
                }
            });
        });

        const avgTimes = {};
        Object.keys(levelStats).forEach(level => {
            if (levelStats[level].length > 0) {
                avgTimes[level] = levelStats[level].reduce((sum, time) => sum + time, 0) / levelStats[level].length;
            } else {
                avgTimes[level] = 0;
            }
        });

        this.speedChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['基礎レベル', '標準レベル', '上級レベル'],
                datasets: [{
                    label: '平均回答時間 (秒)',
                    data: [avgTimes.basic, avgTimes.standard, avgTimes.advanced],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderColor: ['#059669', '#d97706', '#dc2626'],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'レベル別平均回答時間',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f3f4f6' },
                        ticks: { font: { size: 12 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    showNoDataMessage(ctx, message) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    // Utility methods
    getLevelLabel(level) {
        const labels = {
            basic: '基礎',
            standard: '標準',
            advanced: '上級',
            unknown: '不明'
        };
        return labels[level] || '不明';
    }

    playSound(type) {
        // Simple sound feedback using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const frequencies = {
            correct: 800,
            incorrect: 300,
            timeout: 200
        };

        oscillator.frequency.setValueAtTime(frequencies[type] || 400, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Data management
    loadUserData() {
        const savedSettings = this.getStoredData('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        
        this.streakCount = this.getStoredData('streakCount') || 0;
    }

    saveUserData() {
        this.setStoredData('settings', this.settings);
        this.setStoredData('streakCount', this.streakCount);
    }

    saveSession(sessionData) {
        const history = this.getStoredData('history') || [];
        history.push(sessionData);
        
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        this.setStoredData('history', history);
    }

    getStoredData(key) {
        try {
            const data = localStorage.getItem('vocabMaster_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load data:', e);
            return null;
        }
    }

    setStoredData(key, data) {
        try {
            localStorage.setItem('vocabMaster_' + key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    }

    // Settings management
    initializeSettings() {
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
        this.updateSettingsDisplay();
    }

    updateSettingsDisplay() {
        const questionsCount = document.getElementById('questionsCount');
        const timeLimitValue = document.getElementById('timeLimitValue');
        
        if (questionsCount) questionsCount.textContent = this.settings.questionsPerSession;
        if (timeLimitValue) timeLimitValue.textContent = this.settings.timeLimit;
    }

    exportData() {
        const data = {
            settings: this.settings,
            history: this.getStoredData('history') || [],
            streakCount: this.streakCount,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocabmaster_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('データをエクスポートしました', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.settings) this.settings = data.settings;
                        if (data.history) this.setStoredData('history', data.history);
                        if (data.streakCount) this.streakCount = data.streakCount;
                        
                        this.saveUserData();
                        this.updateDashboard();
                        this.initializeSettings();
                        this.showToast('データをインポートしました', 'success');
                    } catch (error) {
                        this.showToast('データの読み込みに失敗しました', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    resetData() {
        if (confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) {
            localStorage.clear();
            this.streakCount = 0;
            this.settings = {
                targetUniversity: 'tokyo',
                difficultyLevel: 'standard',
                questionsPerSession: 10,
                timeLimit: 5,
                dailyReminder: false,
                soundEffects: true
            };
            this.saveUserData();
            this.updateDashboard();
            this.initializeSettings();
            this.showToast('データをリセットしました', 'info');
        }
    }

    // Additional drill methods
    startWeakPointDrill() {
        const weakWords = this.getWeakWords();
        if (weakWords.length === 0) {
            this.showToast('苦手な単語がありません。通常のドリルを開始します。', 'info');
            this.startDrill();
            return;
        }
        
        this.generateQuestionsFromWords(weakWords);
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        this.showScreen('drill');
        this.showQuestion();
    }

    startReview() {
        const history = this.getStoredData('history') || [];
        if (history.length === 0) {
            this.showToast('復習する履歴がありません。', 'warning');
            return;
        }

        const recentIncorrect = this.getRecentIncorrectWords();
        if (recentIncorrect.length === 0) {
            this.showToast('復習する単語がありません。', 'info');
            return;
        }

        this.generateQuestionsFromWords(recentIncorrect);
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        this.showScreen('drill');
        this.showQuestion();
    }

    generateQuestionsFromWords(words) {
        this.questions = [];
        const wordObjects = words.slice(0, this.settings.questionsPerSession).map(wordText => {
            return this.wordDatabase.find(w => w.word === wordText) || {
                word: wordText,
                meaning: '意味不明',
                level: 'unknown',
                category: 'unknown',
                example: ''
            };
        });

        wordObjects.forEach(word => {
            const options = this.generateOptions(word, this.wordDatabase);
            this.questions.push({
                word: word.word,
                meaning: word.meaning,
                correctAnswer: word.meaning,
                options: options,
                level: word.level,
                category: word.category,
                example: word.example
            });
        });
    }

    getWeakWords() {
        const history = this.getStoredData('history') || [];
        const wordStats = {};

        let totalResponseTime = 0;
        let totalResponses = 0;

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (answer.responseTime && !answer.skipped && !answer.timeout) {
                    totalResponseTime += answer.responseTime;
                    totalResponses++;
                }
            });
        });

        const avgResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 5000;

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (!wordStats[answer.word]) {
                    wordStats[answer.word] = { 
                        correct: 0, 
                        total: 0, 
                        totalTime: 0,
                        responses: 0
                    };
                }
                wordStats[answer.word].total++;
                if (answer.correct) {
                    wordStats[answer.word].correct++;
                }
                if (answer.responseTime && !answer.skipped && !answer.timeout) {
                    wordStats[answer.word].totalTime += answer.responseTime;
                    wordStats[answer.word].responses++;
                }
            });
        });

        return Object.keys(wordStats)
            .filter(word => {
                const stats = wordStats[word];
                const accuracyRate = stats.correct / stats.total;
                const avgWordTime = stats.responses > 0 ? stats.totalTime / stats.responses : 0;
                
                return stats.total >= 2 && (
                    accuracyRate < 0.6 || 
                    (avgWordTime > avgResponseTime * 1.5 && stats.responses >= 2)
                );
            })
            .sort((a, b) => {
                const aStats = wordStats[a];
                const bStats = wordStats[b];
                const aRate = aStats.correct / aStats.total;
                const bRate = bStats.correct / bStats.total;
                return aRate - bRate;
            });
    }

    getRecentIncorrectWords() {
        const history = this.getStoredData('history') || [];
        const recentSessions = history.slice(-5);
        const incorrectWords = [];

        recentSessions.forEach(session => {
            session.answers.forEach(answer => {
                if (!answer.correct && !incorrectWords.includes(answer.word)) {
                    incorrectWords.push(answer.word);
                }
            });
        });

        return incorrectWords;
    }

    // Word analysis methods
    updateWordAnalysis() {
        const allData = this.getWordAnalysisData();
        const filteredData = this.filterWordAnalysisData(allData);
        this.showWordAnalysisChart(filteredData);
        this.renderWordAnalysisList(filteredData);
    }

    getWordAnalysisData() {
        const history = this.getStoredData('history') || [];
        const wordStats = {};

        const wordMeaningMap = {};
        this.wordDatabase.forEach(word => {
            wordMeaningMap[word.word] = word.meaning;
        });

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (!wordStats[answer.word]) {
                    wordStats[answer.word] = {
                        word: answer.word,
                        meaning: wordMeaningMap[answer.word] || '不明',
                        correct: 0,
                        total: 0,
                        totalTime: 0,
                        responses: 0,
                        level: answer.level || 'unknown'
                    };
                }
                
                wordStats[answer.word].total++;
                if (answer.correct) {
                    wordStats[answer.word].correct++;
                }
                if (answer.responseTime && !answer.skipped && !answer.timeout) {
                    wordStats[answer.word].totalTime += answer.responseTime;
                    wordStats[answer.word].responses++;
                }
            });
        });

        return Object.values(wordStats)
            .filter(stats => stats.total > 0)
            .map(stats => ({
                ...stats,
                accuracy: Math.round((stats.correct / stats.total) * 100),
                avgTime: stats.responses > 0 ? Math.round(stats.totalTime / stats.responses / 1000) : 0,
                attempts: stats.total
            }));
    }

    filterWordAnalysisData(data) {
        const searchTerm = document.getElementById('wordSearchInput')?.value.toLowerCase() || '';
        const levelFilter = document.getElementById('levelFilter')?.value || 'all';

        return data.filter(wordData => {
            const matchesSearch = wordData.word.toLowerCase().includes(searchTerm) ||
                                wordData.meaning.toLowerCase().includes(searchTerm);
            const matchesLevel = levelFilter === 'all' || wordData.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }

    showWordAnalysisChart(data) {
        const ctx = document.getElementById('wordAnalysisChart')?.getContext('2d');
        if (!ctx) return;

        const chartType = document.getElementById('chartTypeSelect')?.value || 'scatter';

        if (this.wordAnalysisChart) {
            this.wordAnalysisChart.destroy();
        }

        if (data.length === 0) {
            this.showNoDataMessage(ctx, '表示するデータがありません');
            return;
        }

        switch (chartType) {
            case 'scatter':
                this.createScatterChart(ctx, data);
                break;
            case 'bar':
                this.createBarChart(ctx, data);
                break;
            case 'bubble':
                this.createBubbleChart(ctx, data);
                break;
        }
    }

    createScatterChart(ctx, data) {
        const datasets = this.groupDataByLevel(data).map(group => ({
            label: this.getLevelLabel(group.level),
            data: group.data.map(item => ({
                x: item.avgTime,
                y: item.accuracy,
                word: item.word
            })),
            backgroundColor: this.getLevelColor(group.level),
            borderColor: this.getLevelColor(group.level),
            pointRadius: 6,
            pointHoverRadius: 8
        }));

        this.wordAnalysisChart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: '平均回答時間 (秒)' },
                        beginAtZero: true,
                        grid: { color: '#f3f4f6' }
                    },
                    y: {
                        title: { display: true, text: '正答率 (%)' },
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f3f4f6' }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '単語別分析：正答率 vs 回答時間',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.parsed;
                                const word = context.raw.word;
                                return `${word}: 正答率${point.y}%, 平均時間${point.x}s`;
                            }
                        }
                    }
                }
            }
        });
    }

    createBarChart(ctx, data) {
        const sortedData = [...data].sort((a, b) => a.accuracy - b.accuracy).slice(0, 20);
        const labels = sortedData.map(item => item.word);
        const accuracyData = sortedData.map(item => item.accuracy);
        const colors = sortedData.map(item => this.getLevelColor(item.level));

        this.wordAnalysisChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '正答率 (%)',
                    data: accuracyData,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f3f4f6' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '単語別正答率（低い順・上位20語）',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: false }
                }
            }
        });
    }

    createBubbleChart(ctx, data) {
        const datasets = this.groupDataByLevel(data).map(group => ({
            label: this.getLevelLabel(group.level),
            data: group.data.map(item => ({
                x: item.avgTime,
                y: item.accuracy,
                r: Math.max(5, Math.min(20, item.attempts * 2)),
                word: item.word,
                attempts: item.attempts
            })),
            backgroundColor: this.getLevelColor(group.level, 0.6),
            borderColor: this.getLevelColor(group.level),
            borderWidth: 2
        }));

        this.wordAnalysisChart = new Chart(ctx, {
            type: 'bubble',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: '平均回答時間 (秒)' },
                        beginAtZero: true,
                        grid: { color: '#f3f4f6' }
                    },
                    y: {
                        title: { display: true, text: '正答率 (%)' },
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f3f4f6' }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '単語別分析：正答率 vs 回答時間 (バブルサイズ = 出題回数)',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.parsed;
                                const word = context.raw.word;
                                const attempts = context.raw.attempts;
                                return `${word}: 正答率${point.y}%, 平均時間${point.x}s, 出題${attempts}回`;
                            }
                        }
                    }
                }
            }
        });
    }

    groupDataByLevel(data) {
        const groups = {};
        data.forEach(item => {
            if (!groups[item.level]) {
                groups[item.level] = [];
            }
            groups[item.level].push(item);
        });

        return Object.keys(groups).map(level => ({
            level,
            data: groups[level]
        }));
    }

    getLevelColor(level, alpha = 1) {
        const colors = {
            basic: `rgba(16, 185, 129, ${alpha})`,
            standard: `rgba(245, 158, 11, ${alpha})`,
            advanced: `rgba(239, 68, 68, ${alpha})`,
            unknown: `rgba(107, 114, 128, ${alpha})`
        };
        return colors[level] || colors.unknown;
    }

    renderWordAnalysisList(data) {
        const container = document.getElementById('wordAnalysisList');
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = '<p class="no-data">表示するデータがありません。</p>';
            return;
        }

        const topWords = [...data]
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 10);

        container.innerHTML = `
            <h4>苦手単語トップ10</h4>
            <div class="word-summary-list">
                ${topWords.map(wordData => `
                    <div class="word-summary-item">
                        <span class="word-name">${wordData.word}</span>
                        <span class="word-accuracy accuracy-${this.getAccuracyClass(wordData.accuracy)}">${wordData.accuracy}%</span>
                        <span class="word-time">${wordData.avgTime}s</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getAccuracyClass(accuracy) {
        if (accuracy >= 80) return 'high';
        if (accuracy >= 60) return 'medium';
        return 'low';
    }

    showWeaknessList() {
        const weakWords = this.getDetailedWeakWords();
        const container = document.getElementById('weaknessList');
        if (!container) return;

        if (weakWords.length === 0) {
            container.innerHTML = '<p class="no-data">苦手な単語はありません。</p>';
            return;
        }

        container.innerHTML = weakWords.map(wordData => `
            <div class="weakness-item">
                <div class="weakness-word">${wordData.word}</div>
                <div class="weakness-stats">
                    正答率: ${wordData.accuracy}% | 
                    平均回答時間: ${wordData.avgTime}s | 
                    出題回数: ${wordData.attempts}回 | 
                    苦手理由: ${wordData.reason}
                </div>
            </div>
        `).join('');
    }

    getDetailedWeakWords() {
        const history = this.getStoredData('history') || [];
        const wordStats = {};

        let totalResponseTime = 0;
        let totalResponses = 0;

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (answer.responseTime && !answer.skipped && !answer.timeout) {
                    totalResponseTime += answer.responseTime;
                    totalResponses++;
                }
            });
        });

        const avgResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 5000;

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (!wordStats[answer.word]) {
                    wordStats[answer.word] = { 
                        correct: 0, 
                        total: 0, 
                        totalTime: 0,
                        responses: 0
                    };
                }
                wordStats[answer.word].total++;
                wordStats[answer.word].totalTime += answer.responseTime || 0;
                if (answer.responseTime && !answer.skipped && !answer.timeout) {
                    wordStats[answer.word].responses++;
                }
                if (answer.correct) {
                    wordStats[answer.word].correct++;
                }
            });
        });

        return Object.keys(wordStats)
            .filter(word => {
                const stats = wordStats[word];
                const accuracyRate = stats.correct / stats.total;
                const avgWordTime = stats.responses > 0 ? stats.totalTime / stats.responses : 0;
                
                return stats.total >= 2 && (
                    accuracyRate < 0.7 || 
                    (avgWordTime > avgResponseTime * 1.3 && stats.responses >= 2)
                );
            })
            .map(word => {
                const stats = wordStats[word];
                const avgWordTime = stats.responses > 0 ? stats.totalTime / stats.responses : 0;
                const isSlowResponse = avgWordTime > avgResponseTime * 1.3;
                
                return {
                    word: word,
                    accuracy: Math.round((stats.correct / stats.total) * 100),
                    avgTime: Math.round(avgWordTime / 1000),
                    attempts: stats.total,
                    reason: isSlowResponse && stats.correct / stats.total >= 0.7 ? '回答時間' : '正答率'
                };
            })
            .sort((a, b) => {
                if (Math.abs(a.accuracy - b.accuracy) < 5) {
                    return b.avgTime - a.avgTime;
                }
                return a.accuracy - b.accuracy;
            });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new VocabMaster();
});