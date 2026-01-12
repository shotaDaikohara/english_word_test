// VocabMaster - 英単語学習アプリ
class VocabMaster {
    constructor() {
        // 基本プロパティ
        this.currentScreen = 'home';
        this.currentQuestion = 0;
        this.questions = [];
        this.userAnswers = [];
        this.startTime = null;
        this.questionStartTime = null;
        this.timerInterval = null;
        this.streakCount = 0;
        
        // 設定
        this.settings = {
            targetUniversity: 'tokyo',
            difficultyLevel: 'standard',
            questionsPerSession: 10,
            timeLimit: 5,
            dailyReminder: false,
            soundEffects: true
        };

        // 単語データ
        this.wordDatabase = [
            { word: "abandon", meaning: "捨てる・放棄する", level: "basic", category: "verb", example: "He had to abandon his car." },
            { word: "ability", meaning: "能力", level: "basic", category: "noun", example: "She has great ability." },
            { word: "absence", meaning: "不在・欠席", level: "basic", category: "noun", example: "His absence was noticed." },
            { word: "absolute", meaning: "絶対の", level: "basic", category: "adjective", example: "There was absolute silence." },
            { word: "absorb", meaning: "吸収する", level: "basic", category: "verb", example: "Plants absorb water." },
            { word: "abstract", meaning: "抽象的な", level: "standard", category: "adjective", example: "The concept is abstract." },
            { word: "academic", meaning: "学術の", level: "standard", category: "adjective", example: "He pursued academic career." },
            { word: "accelerate", meaning: "加速する", level: "standard", category: "verb", example: "The car accelerated." },
            { word: "accept", meaning: "受け入れる", level: "basic", category: "verb", example: "I accept your apology." },
            { word: "access", meaning: "接近・アクセス", level: "standard", category: "noun", example: "Students have access to library." },
            { word: "accomplish", meaning: "達成する", level: "standard", category: "verb", example: "She accomplished her goal." },
            { word: "account", meaning: "説明・口座", level: "basic", category: "noun", example: "Give an account of events." },
            { word: "accurate", meaning: "正確な", level: "standard", category: "adjective", example: "The forecast was accurate." },
            { word: "achieve", meaning: "達成する", level: "basic", category: "verb", example: "He achieved his dreams." },
            { word: "acknowledge", meaning: "認める", level: "standard", category: "verb", example: "She acknowledged her mistake." },
            { word: "acquire", meaning: "獲得する", level: "standard", category: "verb", example: "He acquired new skills." },
            { word: "adapt", meaning: "適応する", level: "standard", category: "verb", example: "Animals adapt to environment." },
            { word: "adequate", meaning: "適切な", level: "standard", category: "adjective", example: "Salary is adequate." },
            { word: "adjust", meaning: "調整する", level: "standard", category: "verb", example: "Please adjust temperature." },
            { word: "admit", meaning: "認める", level: "basic", category: "verb", example: "He admitted his guilt." },
            { word: "adopt", meaning: "採用する", level: "standard", category: "verb", example: "They adopted a child." },
            { word: "adult", meaning: "大人", level: "basic", category: "noun", example: "Every adult should vote." },
            { word: "advance", meaning: "前進・進歩", level: "basic", category: "verb", example: "Technology advances." },
            { word: "advantage", meaning: "利点", level: "basic", category: "noun", example: "What's the advantage?" },
            { word: "adventure", meaning: "冒険", level: "basic", category: "noun", example: "They went on adventure." },
            { word: "affect", meaning: "影響を与える", level: "standard", category: "verb", example: "Rain affects picnic." },
            { word: "afford", meaning: "余裕がある", level: "basic", category: "verb", example: "I can't afford new car." },
            { word: "agent", meaning: "代理人", level: "standard", category: "noun", example: "Real estate agent helped." }
        ];

        // 大学別単語データ
        this.universityWords = {
            tokyo: [
                { word: "abandon", importance: 5 },
                { word: "ability", importance: 5 },
                { word: "abstract", importance: 5 },
                { word: "academic", importance: 5 },
                { word: "accomplish", importance: 4 },
                { word: "accurate", importance: 5 },
                { word: "achieve", importance: 5 },
                { word: "acknowledge", importance: 4 },
                { word: "acquire", importance: 5 },
                { word: "affect", importance: 5 }
            ],
            waseda: [
                { word: "abandon", importance: 4 },
                { word: "ability", importance: 5 },
                { word: "academic", importance: 5 },
                { word: "accomplish", importance: 4 },
                { word: "accurate", importance: 4 },
                { word: "achieve", importance: 5 },
                { word: "acquire", importance: 4 },
                { word: "adapt", importance: 3 },
                { word: "advance", importance: 4 },
                { word: "advantage", importance: 5 }
            ]
        };
    }    
// 初期化メソッド
    async initialize() {
        try {
            this.showLoadingScreen();
            this.loadUserData();
            this.setupEventListeners();
            this.updateDashboard();
            
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showScreen('home');
                this.showToast('VocabMasterへようこそ！', 'success');
            }, 1000);
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoadingScreen();
            this.showScreen('home');
            this.showToast('初期化エラーが発生しました', 'error');
        }
    }

    // ローディング画面表示
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    // ローディング画面非表示
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    // イベントリスナー設定
    setupEventListeners() {
        // ナビゲーション
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.showScreen(screen);
            });
        });

        // ホーム画面のボタン
        const startBtn = document.getElementById('startDrillBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startDrill());
        }

        const weakBtn = document.getElementById('weakPointBtn');
        if (weakBtn) {
            weakBtn.addEventListener('click', () => this.startDrill());
        }

        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.startDrill());
        }

        // ドリル画面のボタン
        const backBtn = document.getElementById('backToHomeBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showScreen('home'));
        }

        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipQuestion());
        }

        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
    } 
   // 画面切り替え
    showScreen(screenName) {
        this.stopTimer();
        
        // ナビゲーション更新
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // 画面切り替え
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        this.currentScreen = screenName;
    }

    // タイマー停止
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // ダッシュボード更新
    updateDashboard() {
        const stats = this.calculateStats();
        
        // 統計更新
        const todayElement = document.getElementById('todayCount');
        if (todayElement) todayElement.textContent = stats.todayCount;

        const accuracyElement = document.getElementById('accuracyRate');
        if (accuracyElement) accuracyElement.textContent = stats.accuracyRate + '%';

        const coverageElement = document.getElementById('passRate');
        if (coverageElement) coverageElement.textContent = this.calculateCoverageRate() + '%';

        const streakElement = document.getElementById('streakCount');
        if (streakElement) streakElement.textContent = this.streakCount;

        const univElement = document.getElementById('targetUniv');
        if (univElement) univElement.textContent = this.getUniversityName();
    }

    // 統計計算
    calculateStats() {
        const history = this.getStoredData('history') || [];
        const today = new Date().toDateString();
        
        const todayHistory = history.filter(h => new Date(h.date).toDateString() === today);
        
        let totalCorrect = 0;
        let totalQuestions = 0;

        history.forEach(session => {
            if (session.answers) {
                session.answers.forEach(answer => {
                    totalQuestions++;
                    if (answer.correct) totalCorrect++;
                });
            }
        });

        return {
            todayCount: todayHistory.reduce((sum, session) => sum + (session.answers ? session.answers.length : 0), 0),
            accuracyRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
        };
    }

    // カバー率計算
    calculateCoverageRate() {
        const universityWordList = this.universityWords[this.settings.targetUniversity] || [];
        if (universityWordList.length === 0) return 0;

        const history = this.getStoredData('history') || [];
        const masteredWords = this.getMasteredWords(history);
        
        // クリア単語が0の場合は0%を返す
        if (masteredWords.length === 0) return 0;
        
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

        return totalWeight > 0 ? Math.round((masteredWeight / totalWeight) * 100) : 0;
    }

    // 大学名取得
    getUniversityName() {
        const universities = {
            tokyo: "東京大学",
            kyoto: "京都大学", 
            waseda: "早稲田大学",
            keio: "慶應義塾大学",
            sophia: "上智大学",
            march: "MARCH",
            kansai: "関関同立"
        };
        return universities[this.settings.targetUniversity] || "志望大学";
    }   
 // マスター単語取得
    getMasteredWords(history) {
        const wordStats = {};
        
        history.forEach(session => {
            if (session.answers) {
                session.answers.forEach(answer => {
                    if (!wordStats[answer.word]) {
                        wordStats[answer.word] = { correct: 0, total: 0, level: answer.level };
                    }
                    wordStats[answer.word].total++;
                    if (answer.correct) wordStats[answer.word].correct++;
                });
            }
        });

        return Object.keys(wordStats)
            .filter(word => {
                const stats = wordStats[word];
                // 条件を緩和：2回以上出題で70%以上正答、または3回以上出題で80%以上正答
                return (stats.total >= 2 && (stats.correct / stats.total) >= 0.7) ||
                       (stats.total >= 3 && (stats.correct / stats.total) >= 0.8);
            })
            .map(word => ({ word, level: wordStats[word].level }));
    }

    // ドリル開始
    startDrill() {
        this.generateQuestions();
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        this.showScreen('drill');
        this.showQuestion();
    }

    // 問題生成
    generateQuestions() {
        let filteredWords = this.wordDatabase.filter(word => 
            word.level === this.settings.difficultyLevel || 
            (this.settings.difficultyLevel === 'standard' && word.level === 'basic')
        );

        if (filteredWords.length === 0) {
            filteredWords = this.wordDatabase;
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

    // 選択肢生成
    generateOptions(correctWord, wordDb) {
        const options = [correctWord.meaning];
        const otherWords = wordDb.filter(w => w.word !== correctWord.word);
        
        while (options.length < 4 && otherWords.length > 0) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            if (!options.includes(randomWord.meaning)) {
                options.push(randomWord.meaning);
            }
        }

        // シャッフル
        return options.sort(() => Math.random() - 0.5);
    }

    // 問題表示
    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.finishDrill();
            return;
        }

        const question = this.questions[this.currentQuestion];
        this.questionStartTime = Date.now();

        // プログレス更新
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }

        const questionNumber = document.getElementById('questionNumber');
        if (questionNumber) {
            questionNumber.textContent = `${this.currentQuestion + 1}/${this.questions.length}`;
        }

        // 問題内容更新
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.textContent = question.word;
        }

        const questionLevel = document.getElementById('questionLevel');
        if (questionLevel) {
            questionLevel.textContent = this.getLevelLabel(question.level);
        }

        const questionCategory = document.getElementById('questionCategory');
        if (questionCategory) {
            questionCategory.textContent = question.category;
        }

        const questionExample = document.getElementById('questionExample');
        if (questionExample) {
            questionExample.textContent = question.example;
        }

        // 選択肢表示
        const optionsContainer = document.getElementById('optionsContainer');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';

            question.options.forEach((option) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                button.addEventListener('click', () => this.selectAnswer(option));
                optionsContainer.appendChild(button);
            });
        }

        this.startQuestionTimer();
    } 
   // タイマー開始
    startQuestionTimer() {
        const timerElement = document.getElementById('timer');
        const timerCircle = document.getElementById('timerCircle');
        
        if (!timerElement || !timerCircle) return;

        const startTime = Date.now();
        let timeLeft = this.settings.timeLimit;

        this.stopTimer();

        timerCircle.classList.remove('warning', 'danger', 'timeout', 'success');
        timerElement.textContent = timeLeft;

        const updateTimer = () => {
            if (this.currentScreen !== 'drill') {
                this.stopTimer();
                return;
            }
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeLeft = Math.max(0, this.settings.timeLimit - elapsed);
            
            timerElement.textContent = timeLeft;

            timerCircle.classList.remove('warning', 'danger', 'timeout');
            if (timeLeft <= 0) {
                timerCircle.classList.add('timeout');
                this.stopTimer();
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
    }

    // 回答選択
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

    // 回答ハイライト
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

        if (selectedAnswer === correctAnswer && timerCircle) {
            timerCircle.classList.add('success');
        }
    }

    // タイムアウト処理
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

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    // 問題スキップ
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
    }

    // ヒント表示
    showHint() {
        const question = this.questions[this.currentQuestion];
        if (question) {
            const hint = question.correctAnswer.charAt(0) + '...';
            this.showToast(`ヒント: ${hint}`, 'info');
        }
    }    /
/ ドリル終了
    finishDrill() {
        const totalTime = Date.now() - this.startTime;
        const correctCount = this.userAnswers.filter(a => a.correct).length;
        const accuracy = Math.round((correctCount / this.userAnswers.length) * 100);

        // セッション保存
        this.saveSession({
            date: new Date().toISOString(),
            answers: this.userAnswers,
            totalTime: totalTime,
            accuracy: accuracy
        });

        // ストリーク更新
        if (accuracy >= 70) {
            this.streakCount++;
        } else {
            this.streakCount = 0;
        }
        this.saveUserData();

        // 結果表示
        this.showToast(`ドリル完了! 正答率: ${accuracy}% (${correctCount}/${this.userAnswers.length})`, 'success');
        
        // ホーム画面に戻る
        this.showScreen('home');
        this.updateDashboard();
    }

    // レベルラベル取得
    getLevelLabel(level) {
        const labels = {
            basic: '基礎',
            standard: '標準', 
            advanced: '上級'
        };
        return labels[level] || '不明';
    }

    // セッション保存
    saveSession(sessionData) {
        const history = this.getStoredData('history') || [];
        history.push(sessionData);
        
        // 最新100セッションのみ保持
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        this.setStoredData('history', history);
    }

    // ユーザーデータ読み込み
    loadUserData() {
        const savedSettings = this.getStoredData('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        
        this.streakCount = this.getStoredData('streakCount') || 0;
    }

    // ユーザーデータ保存
    saveUserData() {
        this.setStoredData('settings', this.settings);
        this.setStoredData('streakCount', this.streakCount);
    }

    // ローカルストレージからデータ取得
    getStoredData(key) {
        try {
            const data = localStorage.getItem('vocabMaster_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load data:', e);
            return null;
        }
    }

    // ローカルストレージにデータ保存
    setStoredData(key, data) {
        try {
            localStorage.setItem('vocabMaster_' + key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    }

    // トースト通知表示
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

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('VocabMaster初期化中...');
        const app = new VocabMaster();
        await app.initialize();
        console.log('VocabMaster初期化完了');
    } catch (error) {
        console.error('VocabMaster初期化失敗:', error);
        
        // フォールバック処理
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        alert('アプリの初期化に失敗しました。ページを再読み込みしてください。');
    }
});