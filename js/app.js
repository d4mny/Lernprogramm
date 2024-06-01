document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const homeSection = document.getElementById('home');
    const quizSection = document.getElementById('quiz');
    const questionSection = document.getElementById('question');
    const resultSection = document.getElementById('result');
    const categoryTitle = document.getElementById('category-title');
    const quizQuestion = document.getElementById('quiz-question');
    const progressBar = document.getElementById('progress-bar');
    const correctAnswersSpan = document.getElementById('correct-answers');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const answerButtons = document.querySelectorAll('.quiz-button');

    const categories = {
        mathe: 'Mathematik',
        it: 'Internettechnologien',
        allgemein: 'Allgemeinwissen',
        noten: 'Noten'
    };

    let questions = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let useApi = false;

    // Initialisierung der Startseite
    const showHome = () => {
        homeSection.style.display = 'block';
        quizSection.style.display = 'none';
        questionSection.style.display = 'none';
        resultSection.style.display = 'none';
        currentQuestionIndex = 0;
        correctAnswers = 0; 
        progressBar.value = 0;
        document.getElementById('progress-container').classList.add('hide');
        document.getElementById('footer-title').innerText = 'Lernprogramm Danny Miersch';
    };

   // Zeige die Quiz-Kategorie an
const showCategory = (category) => {
    categoryTitle.textContent = categories[category];
    homeSection.style.display = 'none';
    quizSection.style.display = 'block';
    questionSection.style.display = 'none';
    resultSection.style.display = 'none';
    currentQuestionIndex = 0; // Setze den Frageindex zurück
    correctAnswers = 0; // Setze die korrekten Antworten zurück
    progressBar.value = 0; // Setze die Fortschrittsanzeige zurück
    document.getElementById('progress-container').classList.remove('hide');
    document.getElementById('footer-title').innerText = 'Lernfortschritt';
    document.getElementById('start-quiz-button').style.display = 'block';
};

    // Wechsel zwischen API und lokalen Fragen
    const toggleApi = () => {
        useApi = !useApi;
    };

    // Render-Funktion für Noten mit VexFlow
    const renderNote = (note, elementId) => {
        const VF = Vex.Flow;
    
        // Erstelle ein neues Noten-Rendering-Div
        const div = document.getElementById(elementId);
        div.innerHTML = ""; // Leere das Div für die neue Note
        const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    
        // Größe des Renderers
        renderer.resize(75, 100);
        const context = renderer.getContext();
        context.scale(0.6, 0.6);
        context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');
    
        // Zeichne eine Note
        const stave = new VF.Stave(10, 40, 100);
        stave.addClef('treble').setContext(context).draw();
    
        // Erstelle eine Note
        const notes = new VF.StaveNote({
            clef: 'treble',
            keys: [note],
            duration: 'q'
        });
    
        // Stimme hinzufügen (optional, um die Note optisch korrekt darzustellen)
        const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
        voice.addTickables([notes]);
    
        const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 100);
    
        voice.draw(context, stave);
    };

    // Lade Fragen aus einer JSON-Datei
    const loadQuestions = async (category) => {
        try {
            const response = await fetch('/data/questions.json');
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Fragen');
            }
            const data = await response.json();
            questions = data[category] || [];
        } catch (error) {
            console.error('Fehler beim Laden der Fragen:', error);
        }
    };

    //window macht die Funktionen global verfügbar
    window.startQuizAndHideButton = function() {
        // Starte das Quiz
        startQuiz();
    
        // Verstecke den "Quiz starten"-Button
        document.getElementById('start-quiz-button').style.display = 'none';
    }

    // Starte das Quiz
    const startQuiz = async () => {
        if (useApi) {
            await loadQuestionsFromApi();
        } else {
            const category = categoryTitle.textContent.toLowerCase().replace(' ', '');
            await loadQuestions(category);
        }
        currentQuestionIndex = 0;
        correctAnswers = 0;
        showQuestion();
    };

    // Zeige eine Frage an
    const showQuestion = () => {
        if (questions.length > 0) {
            if (currentQuestionIndex < questions.length) {
                const question = questions[currentQuestionIndex];
                const correctAnswer = question.l[0];  // Speichern der richtigen Antwort
                const answers = shuffleArray([...question.l]);  // Mischen der Antworten
                answerButtons.forEach((button, index) => {
                    button.dataset.answer = answers[index];  // Speichern der gemischten Antwort in einem Datenattribut
                    if (categoryTitle.textContent.toLowerCase() === 'noten') {
                        renderNote(answers[index].toLowerCase(), button.id);  // Erstellen der Note im Button
                    } else if (categoryTitle.textContent.toLowerCase() === 'mathematik') {
                        katex.render(answers[index], button);
                    } else {
                        button.textContent = answers[index];
                    }
                    if (answers[index] === correctAnswer) {  // Wenn die gemischte Antwort die richtige ist, speichern Sie diese in einem anderen Datenattribut
                        button.dataset.correct = 'true';
                    } else {
                        button.dataset.correct = 'false';
                    }
                });
                // Setzen Sie die Frage entsprechend der Kategorie
                if (categoryTitle.textContent.toLowerCase() === 'mathematik') {
                    katex.render(question.a, quizQuestion);
                } else {
                    quizQuestion.textContent = question.a;
                }
                questionSection.style.display = 'block';
            } else {
                showResult();
            }
        } else {
            console.log('Keine Fragen geladen.');
        }
    };
    
    const checkAnswer = (index) => {
        if (answerButtons[index].dataset.correct === 'true') {  // Überprüfen des Datenattributs anstelle des Textinhalts
            correctAnswers++;
        }
        currentQuestionIndex++;
        showQuestion();
        // Aktualisiere die Progress-Bar nach dem Beantworten der Frage
        if (currentQuestionIndex > 0) {
            progressBar.value = (currentQuestionIndex / questions.length) * 100;
        }
    };
    

    // Zeige das Ergebnis an
    const showResult = () => {
        questionSection.style.display = 'none';
        resultSection.style.display = 'block';
        correctAnswersSpan.textContent = correctAnswers;
        totalQuestionsSpan.textContent = questions.length;
    
        const totalQuestions = questions.length;
        const correctPercentage = (correctAnswers / totalQuestions) * 100;
    
        document.getElementById('percentage-text').textContent = correctPercentage.toFixed(0) + '%';
    
        const progressCircle = document.querySelector('.progress');
        const offset = 565.48 - (565.48 * correctPercentage / 100);
        progressCircle.style.strokeDashoffset = offset;
    
        let message;
        if (correctPercentage < 20) {
            message = "Oh Oh, da muss aber jemand noch fleißig lernen.";
        } else if (correctPercentage >= 20 && correctPercentage < 40) {
            message = "An einem guten Tag reicht's fürs Bestehen.";
        } else if (correctPercentage >= 40 && correctPercentage < 60) {
            message = "Hey! du weißt schonmal mehr als ich :)";
        } else if (correctPercentage >= 60 && correctPercentage < 80) {
            message = "Oha wie stark! Du kannst ja doch was.";
        } else if (correctPercentage >= 80 && correctPercentage < 100) {
            message = "Jetzt übertreib mal nicht, wen willst du hier beeindrucken, hmm?";
        } else if (correctPercentage === 100) {
            message = "Ja okay Man, ich hab's verstanden. Du bist besser als ich. Pfff.";
        }
    
        const messageElement = document.createElement('p');
    messageElement.textContent = message;
    resultSection.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 5000);  
};

    
    // Starte das Quiz neu
    const restartQuiz = () => {
        showHome();
    };

    // Lade Fragen von einer API
    const loadQuestionsFromApi = async () => {
        try {
            const response = await fetch('https://api.example.com/questions');
            const data = await response.json();
            questions = data;
        } catch (error) {
            console.error('Fehler beim Laden der Fragen:', error);
        }
    };

    // Mische ein Array
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Füge Funktionen dem globalen Objekt hinzu
    window.showHome = showHome;
    window.showCategory = showCategory;
    window.toggleApi = toggleApi;
    window.startQuiz = startQuiz;
    window.checkAnswer = checkAnswer;
    window.restartQuiz = restartQuiz;

    // Zeige die Startseite an
    showHome();
});
