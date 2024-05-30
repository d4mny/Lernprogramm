document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/js/service-worker.js').then(() => {
            console.log('Service Worker registriert');
        });
    }

    const homeSection = document.getElementById('home');
    const quizSection = document.getElementById('quiz');
    const questionSection = document.getElementById('question');
    const resultSection = document.getElementById('result');
    const categoryTitle = document.getElementById('category-title');
    const quizQuestion = document.getElementById('quiz-question');
    const progressBar = document.getElementById('progress-bar');
    const correctAnswersSpan = document.getElementById('correct-answers');
    const totalQuestionsSpan = document.getElementById('total-questions');
    
    let questions = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let useApi = false;

    const categories = {
        mathe: 'Mathematik',
        it: 'Internettechnologien',
        allgemein: 'Allgemeinwissen',
        noten: 'Noten'
    };

    function showHome() {
        homeSection.style.display = 'block';
        quizSection.style.display = 'none';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    function showCategory(category) {
        categoryTitle.textContent = categories[category];
        homeSection.style.display = 'none';
        quizSection.style.display = 'block';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    function toggleApi() {
        useApi = !useApi;
    }

    function startQuiz() {
        if (useApi) {
            loadQuestionsFromApi().then(() => {
                currentQuestionIndex = 0;
                correctAnswers = 0;
                showQuestion();
            });
        } else {
            loadQuestions().then(() => {
                currentQuestionIndex = 0;
                correctAnswers = 0;
                showQuestion();
            });
        }
    }

    function showQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            quizQuestion.textContent = question.a;
            const answers = shuffleArray(question.l);
            answers.forEach((answer, index) => {
                document.getElementById(`answer${index}`).textContent = answer;
            });
            progressBar.value = (currentQuestionIndex / questions.length) * 100;
            questionSection.style.display = 'block';
        } else {
            showResult();
        }
    }

    function checkAnswer(index) {
        const question = questions[currentQuestionIndex];
        if (document.getElementById(`answer${index}`).textContent === question.l[0]) {
            correctAnswers++;
        }
        currentQuestionIndex++;
        showQuestion();
    }

    function showResult() {
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        correctAnswersSpan.textContent = correctAnswers;
        totalQuestionsSpan.textContent = questions.length;
    }

    function restartQuiz() {
        showHome();
    }

    function loadQuestions() {
        return fetch('/data/questions.json')
            .then(response => response.json())
            .then(data => {
                questions = data['teil-mathe']; // Hier kann die Kategorie dynamisch gesetzt werden
            });
    }

    function loadQuestionsFromApi() {
        // REST-API-Aufruf implementieren, um Fragen zu laden
        // Beispiel:
        return fetch('https://api.example.com/questions')
            .then(response => response.json())
            .then(data => {
                questions = data;
            });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    window.showHome = showHome;
    window.showCategory = showCategory;
    window.toggleApi = toggleApi;
    window.startQuiz = startQuiz;
    window.checkAnswer = checkAnswer;
    window.restartQuiz = restartQuiz;

    showHome();
});
