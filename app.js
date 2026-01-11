// 英単語学習ドリルアプリ
class VocabularyDrillApp {
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
        this.settings = {
            targetUniversity: 'tokyo',
            difficultyLevel: 'standard',
            questionsPerSession: 10
        };
        
        // ローカルストレージからデータを読み込み
        this.loadData();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // 初期画面を表示
        this.showScreen('home');
        this.updateDashboard();
    }

    // 大学受験レベルの英単語データベース
    getWordDatabase() {
        return [
            // 基礎レベル
            { word: "abandon", meaning: "捨てる、放棄する", level: "basic", frequency: "high" },
            { word: "ability", meaning: "能力", level: "basic", frequency: "high" },
            { word: "absence", meaning: "不在、欠席", level: "basic", frequency: "high" },
            { word: "absolute", meaning: "絶対の", level: "basic", frequency: "high" },
            { word: "absorb", meaning: "吸収する", level: "basic", frequency: "high" },
            
            // 標準レベル
            { word: "accelerate", meaning: "加速する", level: "standard", frequency: "medium" },
            { word: "accommodate", meaning: "収容する、適応させる", level: "standard", frequency: "medium" },
            { word: "accomplish", meaning: "達成する", level: "standard", frequency: "medium" },
            { word: "accumulate", meaning: "蓄積する", level: "standard", frequency: "medium" },
            { word: "acknowledge", meaning: "認める", level: "standard", frequency: "medium" },
            
            // 上級レベル
            { word: "ambiguous", meaning: "曖昧な", level: "advanced", frequency: "low" },
            { word: "arbitrary", meaning: "任意の、恣意的な", level: "advanced", frequency: "low" },
            { word: "articulate", meaning: "明確に表現する", level: "advanced", frequency: "low" },
            { word: "authentic", meaning: "本物の", level: "advanced", frequency: "low" },
            { word: "autonomous", meaning: "自律的な", level: "advanced", frequency: "low" },
            
            // 追加の単語
            { word: "benefit", meaning: "利益、恩恵", level: "basic", frequency: "high" },
            { word: "challenge", meaning: "挑戦", level: "basic", frequency: "high" },
            { word: "contribute", meaning: "貢献する", level: "standard", frequency: "medium" },
            { word: "demonstrate", meaning: "実証する", level: "standard", frequency: "medium" },
            { word: "elaborate", meaning: "詳しく説明する", level: "advanced", frequency: "low" }
        ];
    }

    // 大学別の合格基準データ
    getUniversityData() {
        return {
            tokyo: { name: "東京大学", requiredAccuracy: 90, requiredSpeed: 3 },
            kyoto: { name: "京都大学", requiredAccuracy: 88, requiredSpeed: 3.5 },
            waseda: { name: "早稲田大学", requiredAccuracy: 85, requiredSpeed: 4 },
            keio: { name: "慶應義塾大学", requiredAccuracy: 85, requiredSpeed: 4 },
            sophia: { name: "上智大学", requiredAccuracy: 82, requiredSpeed: 4.5 }
        };
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // ナビゲーション
        document.getElementById('homeBtn').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('drillBtn').addEventListener('click', () => this.showScreen('drill'));
        document.getElementById('analysisBtn').addEventListener('click', () => this.showScreen('analysis'));
        document.getElementById('settingsBtn').addEventListener('click', () => this.showScreen('settings'));

        // ホーム画面のボタン
        document.getElementById('startDrillBtn').addEventListener('click', () => this.startDrill());
        document.getElementById('weakPointBtn').addEventListener('click', () => this.startWeakPointDrill());
        document.getElementById('reviewBtn').addEventListener('click', () => this.startReview());

        // ドリル画面のボタン
        document.getElementById('skipBtn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());

        // 設定画面
        document.getElementById('targetUniversity').addEventListener('change', (e) => {
            this.settings.targetUniversity = e.target.value;
            this.saveData();
            this.updateDashboard();
        });

        document.getElementById('difficultyLevel').addEventListener('change', (e) => {
            this.settings.difficultyLevel = e.target.value;
            this.saveData();
        });

        document.getElementById('questionsPerSession').addEventListener('input', (e) => {
            this.settings.questionsPerSession = parseInt(e.target.value);
            document.getElementById('questionsCount').textContent = e.target.value;
            this.saveData();
        });

        // 分析画面のタブ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showAnalysisTab(tabName);
            });
        });

        // 単語別分析の検索とソート
        document.addEventListener('input', (e) => {
            if (e.target.id === 'wordSearchInput') {
                this.updateWordAnalysis();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'chartTypeSelect' || e.target.id === 'levelFilter') {
                this.updateWordAnalysis();
            }
        });
    }

    // 画面切り替え
    showScreen(screenName) {
        // 全ての画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // ナビゲーションボタンの状態更新
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 指定された画面を表示
        document.getElementById(screenName + 'Screen').classList.add('active');
        document.getElementById(screenName + 'Btn').classList.add('active');

        this.currentScreen = screenName;

        // 画面固有の初期化処理
        if (screenName === 'analysis') {
            this.initializeAnalysis();
        } else if (screenName === 'settings') {
            this.initializeSettings();
        }
    }

    // ダッシュボードの更新
    updateDashboard() {
        const stats = this.calculateStats();
        const universityData = this.getUniversityData();
        const targetUniv = universityData[this.settings.targetUniversity];

        document.getElementById('todayCount').textContent = stats.todayCount;
        document.getElementById('accuracyRate').textContent = stats.accuracyRate + '%';
        document.getElementById('avgTime').textContent = stats.avgTime + 's';
        document.getElementById('targetUniv').textContent = targetUniv.name;

        // 合格可能性の計算
        const passRate = this.calculatePassRate(stats, targetUniv);
        document.getElementById('passRate').textContent = passRate + '%';
    }

    // 統計の計算
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
                totalTime += answer.responseTime;
            });
        });

        return {
            todayCount: todayHistory.reduce((sum, session) => sum + session.answers.length, 0),
            accuracyRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            avgTime: totalQuestions > 0 ? Math.round(totalTime / totalQuestions / 1000) : 0
        };
    }

    // 合格可能性の計算
    calculatePassRate(stats, targetUniv) {
        const accuracyScore = Math.min(stats.accuracyRate / targetUniv.requiredAccuracy, 1) * 50;
        const speedScore = Math.min(targetUniv.requiredSpeed / stats.avgTime, 1) * 50;
        return Math.round(accuracyScore + speedScore);
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

    // 苦手問題ドリル開始
    startWeakPointDrill() {
        const weakWords = this.getWeakWords();
        if (weakWords.length === 0) {
            alert('苦手な単語がありません。通常のドリルを開始します。');
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

    // 復習開始
    startReview() {
        const history = this.getStoredData('history') || [];
        if (history.length === 0) {
            alert('復習する履歴がありません。');
            return;
        }

        const recentIncorrect = this.getRecentIncorrectWords();
        this.generateQuestionsFromWords(recentIncorrect);
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        this.showScreen('drill');
        this.showQuestion();
    }

    // 問題生成
    generateQuestions() {
        const wordDb = this.getWordDatabase();
        const filteredWords = wordDb.filter(word => 
            word.level === this.settings.difficultyLevel || 
            (this.settings.difficultyLevel === 'standard' && word.level === 'basic')
        );

        this.questions = [];
        const usedWords = new Set();

        for (let i = 0; i < this.settings.questionsPerSession; i++) {
            let word;
            do {
                word = filteredWords[Math.floor(Math.random() * filteredWords.length)];
            } while (usedWords.has(word.word) && usedWords.size < filteredWords.length);

            usedWords.add(word.word);

            // 選択肢を生成
            const options = this.generateOptions(word, filteredWords);
            
            this.questions.push({
                word: word.word,
                correctAnswer: word.meaning,
                options: options,
                level: word.level
            });
        }
    }

    // 特定の単語から問題生成
    generateQuestionsFromWords(words) {
        const wordDb = this.getWordDatabase();
        this.questions = [];

        words.slice(0, this.settings.questionsPerSession).forEach(wordText => {
            const word = wordDb.find(w => w.word === wordText);
            if (word) {
                const options = this.generateOptions(word, wordDb);
                this.questions.push({
                    word: word.word,
                    correctAnswer: word.meaning,
                    options: options,
                    level: word.level
                });
            }
        });
    }

    // 選択肢生成
    generateOptions(correctWord, wordDb) {
        const options = [correctWord.meaning];
        const otherWords = wordDb.filter(w => w.word !== correctWord.word);
        
        while (options.length < 4) {
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

        // プログレスバー更新
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('questionNumber').textContent = 
            `${this.currentQuestion + 1}/${this.questions.length}`;

        // 問題文表示
        document.getElementById('questionText').textContent = question.word;

        // 選択肢表示
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(option));
            optionsContainer.appendChild(button);
        });

        // タイマー開始
        this.startQuestionTimer();
    }

    // 回答選択
    selectAnswer(selectedAnswer) {
        const question = this.questions[this.currentQuestion];
        const responseTime = Date.now() - this.questionStartTime;
        const isCorrect = selectedAnswer === question.correctAnswer;

        // 回答を記録
        this.userAnswers.push({
            word: question.word,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.correctAnswer,
            correct: isCorrect,
            responseTime: responseTime,
            level: question.level
        });

        // 選択肢の色を変更
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });

        // タイマーを停止
        const timerCircle = document.getElementById('timerCircle');
        if (isCorrect && responseTime <= 5000) {
            timerCircle.classList.add('success');
        }

        // 1.5秒後に次の問題へ
        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    // 問題スキップ
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

        // 正解を表示
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct');
            }
            btn.disabled = true;
        });

        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    // ヒント表示
    showHint() {
        const question = this.questions[this.currentQuestion];
        const hint = question.correctAnswer.charAt(0) + '...';
        alert(`ヒント: ${hint}`);
    }

    // ドリル終了
    finishDrill() {
        const totalTime = Date.now() - this.startTime;
        const correctCount = this.userAnswers.filter(a => a.correct).length;
        const accuracy = Math.round((correctCount / this.userAnswers.length) * 100);

        // 結果を保存
        this.saveSession({
            date: new Date().toISOString(),
            answers: this.userAnswers,
            totalTime: totalTime,
            accuracy: accuracy
        });

        // 結果表示
        alert(`ドリル完了!\n正答率: ${accuracy}%\n正解数: ${correctCount}/${this.userAnswers.length}`);

        // ホーム画面に戻る
        this.showScreen('home');
        this.updateDashboard();
    }

    // 問題タイマー
    startQuestionTimer() {
        const timerElement = document.getElementById('timer');
        const timerCircle = document.getElementById('timerCircle');
        const startTime = Date.now();
        let timeLeft = 5;

        // 初期状態をリセット
        timerCircle.classList.remove('warning', 'danger', 'timeout');
        timerElement.textContent = timeLeft;

        const updateTimer = () => {
            if (this.currentScreen !== 'drill') return;
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeLeft = Math.max(0, 5 - elapsed);
            
            timerElement.textContent = timeLeft;

            // 色の変更
            timerCircle.classList.remove('warning', 'danger', 'timeout');
            if (timeLeft <= 0) {
                timerCircle.classList.add('timeout');
                // 5秒経過で自動的に次の問題へ（不正解として記録）
                if (elapsed === 5) {
                    this.timeoutQuestion();
                }
            } else if (timeLeft <= 2) {
                timerCircle.classList.add('danger');
            } else if (timeLeft <= 3) {
                timerCircle.classList.add('warning');
            }

            if (timeLeft > 0) {
                setTimeout(updateTimer, 100);
            }
        };

        updateTimer();
    }

    // タイムアウト時の処理
    timeoutQuestion() {
        const question = this.questions[this.currentQuestion];
        const responseTime = Date.now() - this.questionStartTime;

        // タイムアウトとして記録
        this.userAnswers.push({
            word: question.word,
            selectedAnswer: null,
            correctAnswer: question.correctAnswer,
            correct: false,
            responseTime: responseTime,
            level: question.level,
            timeout: true
        });

        // 正解を表示
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct');
            }
            btn.disabled = true;
        });

        // 1.5秒後に次の問題へ
        setTimeout(() => {
            this.currentQuestion++;
            this.showQuestion();
        }, 1500);
    }

    // 分析画面の初期化
    initializeAnalysis() {
        this.showAnalysisTab('performance');
    }

    // 分析タブ表示
    showAnalysisTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブパネルの表示切り替え
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');

        // タブ固有の処理
        if (tabName === 'performance') {
            this.showPerformanceChart();
        } else if (tabName === 'speed') {
            this.showSpeedChart();
        } else if (tabName === 'wordAnalysis') {
            this.showWordAnalysis();
        } else if (tabName === 'weakness') {
            this.showWeaknessList();
        }
    }

    // 成績分析チャート表示
    showPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const history = this.getStoredData('history') || [];
        
        // 既存のチャートを破棄
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        if (history.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('学習データがありません', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        // 最新10セッションのデータを取得
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
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '正答率 (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'セッション'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '学習成績の推移'
                    }
                }
            }
        });
    }

    // 速度分析チャート表示
    showSpeedChart() {
        const ctx = document.getElementById('speedChart').getContext('2d');
        const history = this.getStoredData('history') || [];
        
        // 既存のチャートを破棄
        if (this.speedChart) {
            this.speedChart.destroy();
        }

        if (history.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('学習データがありません', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        // 単語レベル別の平均回答時間を計算
        const levelStats = { basic: [], standard: [], advanced: [] };
        
        history.forEach(session => {
            session.answers.forEach(answer => {
                if (answer.level && answer.responseTime) {
                    levelStats[answer.level].push(answer.responseTime / 1000); // ミリ秒を秒に変換
                }
            });
        });

        // 各レベルの平均時間を計算
        const avgTimes = {};
        Object.keys(levelStats).forEach(level => {
            if (levelStats[level].length > 0) {
                avgTimes[level] = levelStats[level].reduce((sum, time) => sum + time, 0) / levelStats[level].length;
            } else {
                avgTimes[level] = 0;
            }
        });

        // 最新5セッションの回答時間推移
        const recentSessions = history.slice(-5);
        const sessionLabels = recentSessions.map((_, index) => `セッション${index + 1}`);
        const sessionAvgTimes = recentSessions.map(session => {
            const totalTime = session.answers.reduce((sum, answer) => sum + answer.responseTime, 0);
            return totalTime / session.answers.length / 1000; // 秒に変換
        });

        this.speedChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['基礎レベル', '標準レベル', '上級レベル', ...sessionLabels],
                datasets: [{
                    label: 'レベル別平均時間',
                    data: [avgTimes.basic, avgTimes.standard, avgTimes.advanced],
                    backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
                    borderColor: ['#27ae60', '#e67e22', '#c0392b'],
                    borderWidth: 1
                }, {
                    label: 'セッション別平均時間',
                    data: [null, null, null, ...sessionAvgTimes],
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#3498db',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '平均回答時間 (秒)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '回答速度分析'
                    },
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    // 単語別分析表示
    showWordAnalysis() {
        this.updateWordAnalysis();
    }

    // 単語別分析の更新
    updateWordAnalysis() {
        const allData = this.getWordAnalysisData();
        const filteredData = this.filterWordAnalysisData(allData);
        this.showWordAnalysisChart(filteredData);
        this.renderWordAnalysisList(filteredData);
    }

    // 単語別分析データのフィルタリング
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

    // 単語別分析チャート表示
    showWordAnalysisChart(data) {
        const ctx = document.getElementById('wordAnalysisChart').getContext('2d');
        const chartType = document.getElementById('chartTypeSelect')?.value || 'scatter';

        // 既存のチャートを破棄
        if (this.wordAnalysisChart) {
            this.wordAnalysisChart.destroy();
        }

        if (data.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('表示するデータがありません', ctx.canvas.width / 2, ctx.canvas.height / 2);
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

    // 散布図の作成
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
                        title: {
                            display: true,
                            text: '平均回答時間 (秒)'
                        },
                        beginAtZero: true
                    },
                    y: {
                        title: {
                            display: true,
                            text: '正答率 (%)'
                        },
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '単語別分析：正答率 vs 回答時間'
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

    // 棒グラフの作成
    createBarChart(ctx, data) {
        const sortedData = [...data].sort((a, b) => a.accuracy - b.accuracy);
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
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '正答率 (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '単語'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '単語別正答率（低い順）'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // バブルチャートの作成
    createBubbleChart(ctx, data) {
        const datasets = this.groupDataByLevel(data).map(group => ({
            label: this.getLevelLabel(group.level),
            data: group.data.map(item => ({
                x: item.avgTime,
                y: item.accuracy,
                r: Math.max(5, Math.min(20, item.attempts * 2)), // 出題回数に応じてバブルサイズ調整
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
                        title: {
                            display: true,
                            text: '平均回答時間 (秒)'
                        },
                        beginAtZero: true
                    },
                    y: {
                        title: {
                            display: true,
                            text: '正答率 (%)'
                        },
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '単語別分析：正答率 vs 回答時間 (バブルサイズ = 出題回数)'
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

    // レベル別にデータをグループ化
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

    // レベル別の色を取得
    getLevelColor(level, alpha = 1) {
        const colors = {
            basic: `rgba(46, 204, 113, ${alpha})`,    // 緑
            standard: `rgba(243, 156, 18, ${alpha})`, // オレンジ
            advanced: `rgba(231, 76, 60, ${alpha})`,  // 赤
            unknown: `rgba(149, 165, 166, ${alpha})`  // グレー
        };
        return colors[level] || colors.unknown;
    }

    // 単語別分析リスト表示（簡略版）
    renderWordAnalysisList(data) {
        const container = document.getElementById('wordAnalysisList');

        if (data.length === 0) {
            container.innerHTML = '<p class="no-data">表示するデータがありません。</p>';
            return;
        }

        // 上位10件のみ表示
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

    // 単語別分析データの取得
    getWordAnalysisData() {
        const history = this.getStoredData('history') || [];
        const wordStats = {};
        const wordDb = this.getWordDatabase();

        // 単語データベースから意味を取得するためのマップを作成
        const wordMeaningMap = {};
        wordDb.forEach(word => {
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
                if (answer.responseTime && !answer.skipped) {
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

    // 単語別分析の描画
    renderWordAnalysis() {
        const container = document.getElementById('wordAnalysisList');
        const data = this.currentWordAnalysisData || [];

        if (data.length === 0) {
            container.innerHTML = '<p class="no-data">学習データがありません。</p>';
            return;
        }

        container.innerHTML = data.map(wordData => `
            <div class="word-analysis-item" data-level="${wordData.level}">
                <div class="word-header">
                    <div class="word-main">
                        <span class="word-text">${wordData.word}</span>
                        <span class="word-meaning">${wordData.meaning}</span>
                    </div>
                    <div class="word-level level-${wordData.level}">${this.getLevelLabel(wordData.level)}</div>
                </div>
                <div class="word-stats">
                    <div class="stat-item">
                        <span class="stat-label">正答率</span>
                        <span class="stat-value accuracy-${this.getAccuracyClass(wordData.accuracy)}">${wordData.accuracy}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">平均時間</span>
                        <span class="stat-value">${wordData.avgTime}s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">出題回数</span>
                        <span class="stat-value">${wordData.attempts}回</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">正解数</span>
                        <span class="stat-value">${wordData.correct}/${wordData.total}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // レベルラベルの取得
    getLevelLabel(level) {
        const labels = {
            basic: '基礎',
            standard: '標準',
            advanced: '上級',
            unknown: '不明'
        };
        return labels[level] || '不明';
    }

    // 正答率に基づくクラス名の取得
    getAccuracyClass(accuracy) {
        if (accuracy >= 80) return 'high';
        if (accuracy >= 60) return 'medium';
        return 'low';
    }

    // 単語分析のフィルタリング
    filterWordAnalysis() {
        const searchTerm = document.getElementById('wordSearchInput').value.toLowerCase();
        const allData = this.getWordAnalysisData();
        
        this.currentWordAnalysisData = allData.filter(wordData => 
            wordData.word.toLowerCase().includes(searchTerm) ||
            wordData.meaning.toLowerCase().includes(searchTerm)
        );
        
        this.sortWordAnalysis();
    }

    // 単語分析のソート
    sortWordAnalysis() {
        const sortBy = document.getElementById('sortSelect').value;
        
        if (!this.currentWordAnalysisData) {
            this.currentWordAnalysisData = this.getWordAnalysisData();
        }

        this.currentWordAnalysisData.sort((a, b) => {
            switch (sortBy) {
                case 'accuracy':
                    return a.accuracy - b.accuracy; // 正答率の低い順
                case 'speed':
                    return b.avgTime - a.avgTime; // 回答時間の長い順
                case 'frequency':
                    return b.attempts - a.attempts; // 出題回数の多い順
                case 'alphabetical':
                    return a.word.localeCompare(b.word); // アルファベット順
                default:
                    return 0;
            }
        });

        this.renderWordAnalysis();
    }

    // 苦手単語リスト表示
    showWeaknessList() {
        const weakWords = this.getDetailedWeakWords();
        const container = document.getElementById('weaknessList');
        container.innerHTML = '';

        if (weakWords.length === 0) {
            container.innerHTML = '<p>苦手な単語はありません。</p>';
            return;
        }

        weakWords.forEach(wordData => {
            const item = document.createElement('div');
            item.className = 'weakness-item';
            item.innerHTML = `
                <div class="weakness-word">${wordData.word}</div>
                <div class="weakness-stats">
                    正答率: ${wordData.accuracy}% | 
                    平均回答時間: ${wordData.avgTime}s | 
                    出題回数: ${wordData.attempts}回 | 
                    苦手理由: ${wordData.reason}
                </div>
            `;
            container.appendChild(item);
        });
    }

    // 設定画面の初期化
    initializeSettings() {
        document.getElementById('targetUniversity').value = this.settings.targetUniversity;
        document.getElementById('difficultyLevel').value = this.settings.difficultyLevel;
        document.getElementById('questionsPerSession').value = this.settings.questionsPerSession;
        document.getElementById('questionsCount').textContent = this.settings.questionsPerSession;
    }

    // 苦手単語の取得（正答率と回答時間を考慮）
    getWeakWords() {
        const history = this.getStoredData('history') || [];
        const wordStats = {};

        // 全体の平均回答時間を計算
        let totalResponseTime = 0;
        let totalResponses = 0;

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (answer.responseTime && !answer.skipped) {
                    totalResponseTime += answer.responseTime;
                    totalResponses++;
                }
            });
        });

        const avgResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 5000;

        // 単語ごとの統計を計算
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
                if (answer.responseTime && !answer.skipped) {
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
                
                // 苦手条件：正答率60%未満 OR 平均回答時間が全体平均の1.5倍以上
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
                const aTime = aStats.responses > 0 ? aStats.totalTime / aStats.responses : 0;
                const bTime = bStats.responses > 0 ? bStats.totalTime / bStats.responses : 0;
                
                // 正答率が低い順、同じなら回答時間が長い順
                if (Math.abs(aRate - bRate) < 0.1) {
                    return bTime - aTime;
                }
                return aRate - bRate;
            });
    }

    // 詳細な苦手単語データの取得
    getDetailedWeakWords() {
        const history = this.getStoredData('history') || [];
        const wordStats = {};

        // 全体の平均回答時間を計算
        let totalResponseTime = 0;
        let totalResponses = 0;

        history.forEach(session => {
            session.answers.forEach(answer => {
                if (answer.responseTime && !answer.skipped) {
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
                if (answer.responseTime && !answer.skipped) {
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
                
                // 苦手条件：正答率70%未満 OR 平均回答時間が全体平均の1.3倍以上
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
                // 正答率が低い順、同じなら回答時間が長い順
                if (Math.abs(a.accuracy - b.accuracy) < 5) {
                    return b.avgTime - a.avgTime;
                }
                return a.accuracy - b.accuracy;
            });
    }

    // 最近の間違った単語の取得
    getRecentIncorrectWords() {
        const history = this.getStoredData('history') || [];
        const recentSessions = history.slice(-5); // 最近5セッション
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

    // データの読み込み
    loadData() {
        const savedSettings = this.getStoredData('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    }

    // データの保存
    saveData() {
        this.setStoredData('settings', this.settings);
    }

    // ローカルストレージからデータ取得
    getStoredData(key) {
        try {
            const data = localStorage.getItem('vocabularyDrill_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('データの読み込みに失敗しました:', e);
            return null;
        }
    }

    // ローカルストレージにデータ保存
    setStoredData(key, data) {
        try {
            localStorage.setItem('vocabularyDrill_' + key, JSON.stringify(data));
        } catch (e) {
            console.error('データの保存に失敗しました:', e);
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new VocabularyDrillApp();
});