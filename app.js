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
        this.universityWords = {};
        this.streakCount = 0;
        this.timerInterval = null;
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
        try {
            this.showLoadingScreen();
            
            const loadingTimeout = setTimeout(() => {
                console.warn('Loading timeout, forcing app to start');
                this.hideLoadingScreen();
                this.showScreen('home');
                this.showToast('読み込みに時間がかかりました', 'warning');
            }, 5000);
            
            await this.loadWordDatabase();
            this.loadUserData();
            this.setupEventListeners();
            this.updateDashboard();
            
            clearTimeout(loadingTimeout);
            
            this.hideLoadingScreen();
            this.showScreen('home');
            this.showToast('VocabMasterへようこそ！', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            // フォールバック: エラーが発生してもアプリを開始
            try {
                this.hideLoadingScreen();
            } catch (e) {
                // ローディング画面の非表示に失敗した場合
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
            }
            this.showScreen('home');
            this.showToast('初期化エラーが発生しました', 'error');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        } else {
            console.warn('Loading screen element not found');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        } else {
            console.warn('Loading screen element not found');
        }
    }

    async loadWordDatabase() {
        try {
            console.log('Loading word database...');
            
            this.wordDatabase = this.getEmbeddedWords();
            this.universityWords = this.getEmbeddedUniversityWords();
            
            console.log(`Final word count: ${this.wordDatabase.length} words`);
            console.log(`University data loaded for: ${Object.keys(this.universityWords).join(', ')}`);

        } catch (error) {
            console.error('Critical error loading word database:', error);
            this.showToast('データ読み込みエラー、デフォルトデータを使用します', 'warning');
            this.wordDatabase = this.getEmbeddedWords();
            this.universityWords = this.getEmbeddedUniversityWords();
        }
    }

    getEmbeddedWords() {
        return [
            { word: "abandon", meaning: "捨てる・放棄する", level: "basic", frequency: "high", category: "verb", example: "He had to abandon his car." },
            { word: "ability", meaning: "能力", level: "basic", frequency: "high", category: "noun", example: "She has great ability." },
            { word: "absence", meaning: "不在・欠席", level: "basic", frequency: "high", category: "noun", example: "His absence was noticed." },
            { word: "absolute", meaning: "絶対の", level: "basic", frequency: "high", category: "adjective", example: "There was absolute silence." },
            { word: "absorb", meaning: "吸収する", level: "basic", frequency: "high", category: "verb", example: "Plants absorb water." },
            { word: "abstract", meaning: "抽象的な", level: "standard", frequency: "medium", category: "adjective", example: "The concept is abstract." },
            { word: "academic", meaning: "学術の", level: "standard", frequency: "medium", category: "adjective", example: "He pursued academic career." },
            { word: "accelerate", meaning: "加速する", level: "standard", frequency: "medium", category: "verb", example: "The car accelerated." },
            { word: "accept", meaning: "受け入れる", level: "basic", frequency: "high", category: "verb", example: "I accept your apology." },
            { word: "access", meaning: "接近・アクセス", level: "standard", frequency: "medium", category: "noun", example: "Students have access to library." },
            { word: "accommodate", meaning: "収容する", level: "standard", frequency: "medium", category: "verb", example: "Hotel accommodates 200 guests." },
            { word: "accompany", meaning: "同行する", level: "standard", frequency: "medium", category: "verb", example: "Music accompanies dance." },
            { word: "accomplish", meaning: "達成する", level: "standard", frequency: "medium", category: "verb", example: "She accomplished her goal." },
            { word: "account", meaning: "説明・口座", level: "basic", frequency: "high", category: "noun", example: "Give an account of events." },
            { word: "accurate", meaning: "正確な", level: "standard", frequency: "medium", category: "adjective", example: "The forecast was accurate." },
            { word: "achieve", meaning: "達成する", level: "basic", frequency: "high", category: "verb", example: "He achieved his dreams." },
            { word: "acknowledge", meaning: "認める", level: "standard", frequency: "medium", category: "verb", example: "She acknowledged her mistake." },
            { word: "acquire", meaning: "獲得する", level: "standard", frequency: "medium", category: "verb", example: "He acquired new skills." },
            { word: "adapt", meaning: "適応する", level: "standard", frequency: "medium", category: "verb", example: "Animals adapt to environment." },
            { word: "adequate", meaning: "適切な", level: "standard", frequency: "medium", category: "adjective", example: "Salary is adequate." },
            { word: "adjust", meaning: "調整する", level: "standard", frequency: "medium", category: "verb", example: "Please adjust temperature." },
            { word: "admit", meaning: "認める", level: "basic", frequency: "high", category: "verb", example: "He admitted his guilt." },
            { word: "adopt", meaning: "採用する", level: "standard", frequency: "medium", category: "verb", example: "They adopted a child." },
            { word: "adult", meaning: "大人", level: "basic", frequency: "high", category: "noun", example: "Every adult should vote." },
            { word: "advance", meaning: "前進・進歩", level: "basic", frequency: "high", category: "verb", example: "Technology advances." },
            { word: "advantage", meaning: "利点", level: "basic", frequency: "high", category: "noun", example: "What's the advantage?" },
            { word: "adventure", meaning: "冒険", level: "basic", frequency: "high", category: "noun", example: "They went on adventure." },
            { word: "affect", meaning: "影響を与える", level: "standard", frequency: "medium", category: "verb", example: "Rain affects picnic." },
            { word: "afford", meaning: "余裕がある", level: "basic", frequency: "high", category: "verb", example: "I can't afford new car." },
            { word: "agent", meaning: "代理人", level: "standard", frequency: "medium", category: "noun", example: "Real estate agent helped." }
        ];
    } 
   getEmbeddedUniversityWords() {
        return {
            tokyo: [
                { word: "abandon", frequency: "high", importance: 5 },
                { word: "ability", frequency: "high", importance: 5 },
                { word: "abstract", frequency: "high", importance: 5 },
                { word: "academic", frequency: "high", importance: 5 },
                { word: "accomplish", frequency: "high", importance: 4 },
                { word: "accurate", frequency: "high", importance: 5 },
                { word: "achieve", frequency: "high", importance: 5 },
                { word: "acknowledge", frequency: "high", importance: 4 },
                { word: "acquire", frequency: "high", importance: 5 },
                { word: "affect", frequency: "high", importance: 5 }
            ],
            kyoto: [
                { word: "abandon", frequency: "high", importance: 5 },
                { word: "ability", frequency: "high", importance: 5 },
                { word: "abstract", frequency: "medium", importance: 4 },
                { word: "academic", frequency: "high", importance: 5 },
                { word: "accomplish", frequency: "high", importance: 4 },
                { word: "accurate", frequency: "high", importance: 5 },
                { word: "achieve", frequency: "high", importance: 5 },
                { word: "acknowledge", frequency: "medium", importance: 4 },
                { word: "acquire", frequency: "high", importance: 4 },
                { word: "affect", frequency: "high", importance: 5 }
            ],
            waseda: [
                { word: "abandon", frequency: "medium", importance: 4 },
                { word: "ability", frequency: "high", importance: 5 },
                { word: "academic", frequency: "high", importance: 5 },
                { word: "accomplish", frequency: "high", importance: 4 },
                { word: "accurate", frequency: "high", importance: 4 },
                { word: "achieve", frequency: "high", importance: 5 },
                { word: "acquire", frequency: "medium", importance: 4 },
                { word: "adapt", frequency: "medium", importance: 3 },
                { word: "advance", frequency: "high", importance: 4 },
                { word: "advantage", frequency: "high", importance: 5 }
            ],
            keio: [
                { word: "abandon", frequency: "medium", importance: 4 },
                { word: "ability", frequency: "high", importance: 5 },
                { word: "academic", frequency: "high", importance: 5 },
                { word: "accomplish", frequency: "high", importance: 4 },
                { word: "accurate", frequency: "high", importance: 4 },
                { word: "achieve", frequency: "high", importance: 5 },
                { word: "acquire", frequency: "medium", importance: 4 },
                { word: "adapt", frequency: "medium", importance: 3 },
                { word: "advance", frequency: "high", importance: 4 },
                { word: "advantage", frequency: "high", importance: 5 }
            ],
            sophia: [
                { word: "ability", frequency: "high", importance: 5 },
                { word: "academic", frequency: "high", importance: 4 },
                { word: "accomplish", frequency: "medium", importance: 4 },
                { word: "accurate", frequency: "medium", importance: 4 },
                { word: "achieve", frequency: "high", importance: 5 },
                { word: "acquire", frequency: "medium", importance: 3 },
                { word: "adult", frequency: "high", importance: 5 },
                { word: "advance", frequency: "medium", importance: 4 },
                { word: "advantage", frequency: "high", importance: 4 },
                { word: "affect", frequency: "medium", importance: 4 }
            ],
            march: [
                { word: "ability", frequency: "high", importance: 4 },
                { word: "academic", frequency: "medium", importance: 4 },
                { word: "accomplish", frequency: "medium", importance: 3 },
                { word: "accurate", frequency: "medium", importance: 3 },
                { word: "achieve", frequency: "high", importance: 4 },
                { word: "adult", frequency: "high", importance: 4 },
                { word: "advance", frequency: "medium", importance: 3 },
                { word: "advantage", frequency: "high", importance: 4 },
                { word: "affect", frequency: "medium", importance: 3 },
                { word: "afford", frequency: "high", importance: 4 }
            ],
            kansai: [
                { word: "ability", frequency: "high", importance: 4 },
                { word: "academic", frequency: "medium", importance: 3 },
                { word: "accomplish", frequency: "medium", importance: 3 },
                { word: "accurate", frequency: "medium", importance: 3 },
                { word: "achieve", frequency: "high", importance: 4 },
                { word: "adult", frequency: "high", importance: 4 },
                { word: "advance", frequency: "medium", importance: 3 },
                { word: "advantage", frequency: "medium", importance: 3 },
                { word: "affect", frequency: "medium", importance: 3 },
                { word: "afford", frequency: "medium", importance: 3 }
            ]
        };
    }    se
tupEventListeners() {
        // Bottom Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
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
    }

    showScreen(screenName) {
        if (screenName !== 'drill') {
            this.stopTimer();
        }
        
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-screen="${screenName}"]`)?.classList.add('active');

        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenName + 'Screen')?.classList.add('active');

        this.currentScreen = screenName;
    }

    updateDashboard() {
        const stats = this.calculateStats();
        const universityData = this.getUniversityData();
        const targetUniv = universityData[this.settings.targetUniversity];

        document.getElementById('todayCount').textContent = stats.todayCount;
        document.getElementById('accuracyRate').textContent = stats.accuracyRate + '%';
        
        document.getElementById('targetUniv').textContent = targetUniv.name;
        const coverageRate = Math.round(this.calculateWordCoverageRate());
        document.getElementById('passRate').textContent = coverageRate + '%';

        document.getElementById('streakCount').textContent = this.streakCount;
    }

    calculateStats() {
        const history = this.getStoredData('history') || [];
        const today = new Date().toDateString();
        
        const todayHistory = history.filter(h => new Date(h.date).toDateString() === today);
        const allHistory = history;

        let totalCorrect = 0;
        let totalQuestions = 0;

        allHistory.forEach(session => {
            session.answers.forEach(answer => {
                totalQuestions++;
                if (answer.correct) totalCorrect++;
            });
        });

        return {
            todayCount: todayHistory.reduce((sum, session) => sum + session.answers.length, 0),
            accuracyRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
        };
    }    g
etUniversityData() {
        return {
            tokyo: { name: "東京大学", requiredCoverage: 90 },
            kyoto: { name: "京都大学", requiredCoverage: 85 },
            waseda: { name: "早稲田大学", requiredCoverage: 80 },
            keio: { name: "慶應義塾大学", requiredCoverage: 80 },
            sophia: { name: "上智大学", requiredCoverage: 75 },
            march: { name: "MARCH", requiredCoverage: 70 },
            kansai: { name: "関関同立", requiredCoverage: 65 }
        };
    }

    calculateWordCoverageRate() {
        return this.calculateCoverageRate(this.settings.targetUniversity);
    }

    calculateCoverageRate(university) {
        const universityWordList = this.universityWords[university];
        if (!universityWordList) return 0;

        const history = this.getStoredData('history') || [];
        const masteredWords = this.getMasteredWords(history);
        const masteredWordSet = new Set(masteredWords.map(w => w.word));

        let totalWeight = 0;
        let masteredWeight = 0;

        universityWordList.forEach(wordData => {
            const weight = wordData.importance;
            totalWeight += weight;
            
            if (masteredWordSet.has(wordData.word)) {
                masteredWeight += weight;
            }
        });

        return totalWeight > 0 ? (masteredWeight / totalWeight) * 100 : 0;
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

        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('questionNumber').textContent = 
            `${this.currentQuestion + 1}/${this.questions.length}`;

        document.getElementById('questionText').textContent = question.word;
        document.getElementById('questionLevel').textContent = this.getLevelLabel(question.level);
        document.getElementById('questionCategory').textContent = question.category;
        document.getElementById('questionExample').textContent = question.example;

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

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        timerCircle.classList.remove('warning', 'danger', 'timeout', 'success');
        timerElement.textContent = timeLeft;

        const updateTimer = () => {
            if (this.currentScreen !== 'drill') {
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
                return;
            }
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeLeft = Math.max(0, this.settings.timeLimit - elapsed);
            
            timerElement.textContent = timeLeft;

            timerCircle.classList.remove('warning', 'danger', 'timeout');
            if (timeLeft <= 0) {
                timerCircle.classList.add('timeout');
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
                this.timeoutQuestion();
                return;
            } else if (timeLeft <= 1) {
                timerCircle.classList.add('danger');
            } else if (timeLeft <= 2) {
                timerCircle.classList.add('warning');
            }
        };

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 100);
    }    stopTime
r() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    selectAnswer(selectedAnswer) {
        this.stopTimer();
        
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
        this.stopTimer();
        
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

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    skipQuestion() {
        this.stopTimer();
        
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
    }    s
howHint() {
        const question = this.questions[this.currentQuestion];
        const hint = question.correctAnswer.charAt(0) + '...';
        this.showToast(`ヒント: ${hint}`, 'info');
    }

    finishDrill() {
        const totalTime = Date.now() - this.startTime;
        const correctCount = this.userAnswers.filter(a => a.correct).length;
        const accuracy = Math.round((correctCount / this.userAnswers.length) * 100);

        this.saveSession({
            date: new Date().toISOString(),
            answers: this.userAnswers,
            totalTime: totalTime,
            accuracy: accuracy
        });

        this.updateStreak(accuracy);
        this.showToast(`ドリル完了! 正答率: ${accuracy}%`, 'success');
        this.showScreen('home');
        this.updateDashboard();
    }

    updateStreak(accuracy) {
        if (accuracy >= 70) {
            this.streakCount++;
        } else {
            this.streakCount = 0;
        }
        this.saveUserData();
    }

    startWeakPointDrill() {
        this.showToast('苦手問題機能は開発中です', 'info');
        this.startDrill();
    }

    startReview() {
        this.showToast('復習機能は開発中です', 'info');
        this.startDrill();
    }

    getLevelLabel(level) {
        const labels = {
            basic: '基礎',
            standard: '標準',
            advanced: '上級',
            unknown: '不明'
        };
        return labels[level] || '不明';
    }

    saveSession(sessionData) {
        const history = this.getStoredData('history') || [];
        history.push(sessionData);
        
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        this.setStoredData('history', history);
    }

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

    showToast(message, type = 'info') {
        try {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;

            const container = document.getElementById('toastContainer');
            if (container) {
                container.appendChild(toast);

                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 3000);
            } else {
                console.log(`Toast: ${message}`);
            }
        } catch (error) {
            console.log(`Toast: ${message}`);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing VocabMaster...');
        new VocabMaster();
    } catch (error) {
        console.error('Failed to initialize VocabMaster:', error);
        // フォールバック: 最低限の表示
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        alert('アプリの初期化に失敗しました。ページを再読み込みしてください。');
    }
});