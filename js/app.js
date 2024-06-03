document.addEventListener('DOMContentLoaded', () => {
    'use strict';

     // Element-Referenzen für verschiedene Abschnitte der Anwendung
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

    // Kategorien für die Quizfragen
    const categories = {
        htwfragen: 'Fragen von Server',
        mathe: 'Mathematik',
        it: 'Internettechnologien',
        allgemein: 'Allgemeinwissen',
        noten: 'Noten'
    };

    // Globale Variablen zur Verwaltung des Quiz-Zustands
    let questions = [];
    let originalQuestions = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let useApi = false;
    let currentCategory = null;
    let QuizId;


    // Funktion zum Anzeigen der Startseite
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

   // Funktion zum Anzeigen der ausgewählten Quiz-Kategorie
const showCategory = (category) => {
    currentCategory = category;
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
    const enableApi = () => {
        useApi = true;
    };

    const disableApi = () => {
        useApi = false;
    }

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
    
        // Zeichnen der Note
        const stave = new VF.Stave(10, 40, 100);
        stave.addClef('treble').setContext(context).draw();
    
        // Erstellen der Note
        const notes = new VF.StaveNote({
            clef: 'treble',
            keys: [note],
            duration: 'q'
        });
    
        // Stimme hinzufügen
        const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
        voice.addTickables([notes]);
    
        const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 100);
    
        voice.draw(context, stave);
    };

    // Lade Fragen aus einer lokalen JSON-Datei
     //"a": ist die Frage, welche angezgeigt wird. "l": sind die Antwortmöglichkeiten. Die Antwortmöglichkeit ist immer die richtige Antwort. Fromattierung muss für korrekte Funktionalität beibehalten werden.
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

    // Funktion zum Ausblenden des Start-Quiz-Buttons
    window.startQuizAndHideButton = function() { //Window macht die Funktionen global verfügbar
        startQuiz();
        document.getElementById('start-quiz-button').style.display = 'none';
    }

    // Starte das Quiz
    const startQuiz = async () => {
        if (useApi===true) {
            await loadQuestionsFromApi();
        } else {
            const category = categoryTitle.textContent.toLowerCase().replace(' ', '');
            await loadQuestions(category);
        }
        currentQuestionIndex = 0;
        correctAnswers = 0;
        showQuestion();
    };

    //Anzeigen der Frage
    const showQuestion = () => {
        if (questions.length > 0) {
            if (currentQuestionIndex < questions.length) {
                const question = questions[currentQuestionIndex];
                const correctAnswer = question.l[0];  // Speichern der richtigen Antwort
                const answers = shuffleArrayWithOriginalIndices(question.l);  // Mischen der Antworten und Speichern der ursprünglichen Indizes
                answerButtons.forEach((button, index) => {
                    button.dataset.answer = answers[index].value;  // Speichern der gemischten Antwort in einem Datenattribut
                    button.dataset.originalIndex = answers[index].originalIndex;  // Speichern des ursprünglichen Index
                    if (categoryTitle.textContent.toLowerCase() === 'noten') {
                        renderNote(answers[index].value.toLowerCase(), button.id);  // Erstellen der Note im Button
                    } else if (categoryTitle.textContent.toLowerCase() === 'mathematik') {
                        katex.render(answers[index].value, button);
                    } else {
                        button.textContent = answers[index].value;
                    }
                    if (answers[index].value === correctAnswer) {  // Wenn die gemischte Antwort die richtige ist, speichert es in einem anderen Datenattribut
                        button.dataset.correct = 'true';
                    } else {
                        button.dataset.correct = 'false';
                    }
                });
                // Frage mit Katex rendering in mathe
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
            if (useApi === true) {
                console.log('Keine Fragen geladen.');
                loadQuestionsFromApi();
                console.log('Lade Fragen erneut...');
                showQuestion();
            }
        }
    };


    // Funktion zum Mischen eines Arrays und Speichern der ursprünglichen Indizes
const shuffleArrayWithOriginalIndices = (array) => {
    const originalArray = array.map((value, index) => ({ value, originalIndex: index }));
    for (let i = originalArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [originalArray[i], originalArray[j]] = [originalArray[j], originalArray[i]];
    }
    return originalArray;
};
    
    // Funktion zur Überprüfung der Antwort
    const checkAnswer = async (index) => {
        if (useApi) {
            const originalIndex = parseInt(answerButtons[index].dataset.originalIndex, 10);
            const result = await checkAnswerExternHTW(originalIndex); // Übergib den ursprünglichen Index des gedrückten Knopfes
            if (result === 1) {
                correctAnswers++;
            }
        } else {
            if (answerButtons[index].dataset.correct === 'true') {
                correctAnswers++;
            }
        }
        currentQuestionIndex++;
        showQuestion();
        // Aktualisieren der Progress-Bar nach dem Beantworten der Frage
        if (currentQuestionIndex > 0) {
            progressBar.value = (currentQuestionIndex / questions.length) * 100;
        }
    };
    

    // Funktion zum Anzeigen des Ergebnisses
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

        // Bestimme die Nachricht basierend auf dem prozentualen Ergebnis
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

// Funktion zum Neustarten des Quiz
const restartQuiz = () => {
    if (currentCategory) {
        showCategory(currentCategory);
    } else {
        showHome();
    }
};

// Lade Fragen von einer API
const loadQuestionsFromApi = async () => {
    QuizId = Math.floor(Math.random() * 101);
    const url = "https://idefix.informatik.htw-dresden.de:8888/api/quizzes/?page=" + QuizId;
    console.log('URL:', url);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("test@gmail.com:secret"),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const questionsFromApi = data.content.map(q => ({
            a: q.text,
            l: q.options,
            id: q.id,
        }));

        // Wenn keine Fragen geladen wurden, rufe die Funktion erneut auf
        if (questionsFromApi.length === 0) {
            console.log('Keine Fragen geladen, versuche es erneut...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return loadQuestionsFromApi();
        }

        questions = questionsFromApi;
        console.log(questions);
    } catch (error) {
        console.error('Error:', error);
    }
};



// Funktion zum Überprüfen der Antwort über eine externe API
async function checkAnswerExternHTW(index) {
    // URL für die Anfrage an die API
    const url = "https://idefix.informatik.htw-dresden.de:8888/api/quizzes/" + questions[currentQuestionIndex].id + "/solve";
    
    // Antwort des Benutzers
    let answer = [index]; 

    console.log('Sende Anfrage an URL:', url);
    console.log('Gesendete Antwort:', answer);

    try {
        // Senden der Anfrage an die API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("test@gmail.com:secret")
            },
            body: JSON.stringify(answer)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Verarbeiten der Antwort der API
        const results = await response.json();
        console.log('Antwort des Servers:', results);

        // Rückgabe des Ergebnisses (1 für korrekte Antwort, null für falsche Antwort)
        return results.success ? 1 : null;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}



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
    window.enableApi = enableApi;
    window.disableApi = disableApi;
    window.startQuiz = startQuiz;
    window.checkAnswer = checkAnswer;
    window.restartQuiz = restartQuiz;
    window.loadQuestionsFromApi = loadQuestionsFromApi;

    // Zeige die Startseite an
    showHome();
});
