/* =========================================================
   KIR RECREATION TOURNAMENT 2026
   めちゃむずキーボード早打ち駅伝
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const GAME_ID = "KIR-KAI-2026";

const VALID_TEAMS = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
];

const SECTION_FILES = [
    "data/section1.csv",
    "data/section2.csv",
    "data/section3.csv",
    "data/section4.csv",
    "data/section5.csv",
    "data/section6.csv"
];


/*
 * 1人 = 1区間
 * 各区間 2分30秒
 */
const PLAYER_TIME = 150000;


/*
 * カウントダウン
 */
const COUNTDOWN_STEP = 1000;


/*
 * 問題切り替え演出
 */
const NEXT_QUESTION_DELAY = 200;


/*
 * 区間結果表示まで
 */
const NEXT_SECTION_DELAY = 500;


/* =========================================================
   DOM
========================================================= */

function $(id) {

    return document.getElementById(id);

}


const DOM = {

    sectionNumber:
        $("section-number"),

    teamName:
        $("team-name"),

    timer:
        $("timer"),

    runner:
        $("runner"),

    runnerImage:
        $("runner-image"),

    finishFlag:
        $("finish-flag"),


    questionNumber:
        $("question-number"),

    questionGenre:
        $("question-genre"),

    questionText:
        $("question-text"),

    romajiProgress:
        $("romaji-progress"),


    nextKey:
        $("next-key"),

    nextKeyCombo:
        $("next-key-combo"),


    score:
        $("score"),

    miss:
        $("miss"),

    combo:
        $("combo"),

    comboSideValue:
        $("combo-side-value"),

    accuracy:
        $("accuracy"),


    progressPercent:
        $("progress-percent"),

    progressFill:
        $("progress-fill"),

    progressCurrent:
        $("progress-current"),

    progressTotal:
        $("progress-total"),


    goodEffect:
        $("good-effect"),

    missEffect:
        $("miss-effect"),

    boostEffect:
        $("boost-effect"),


    countdownOverlay:
        $("countdown-overlay"),

    countdown:
        $("countdown"),


    titleOverlay:
        $("title-overlay"),

    titleSection:
        $("title-section"),

    titlePressEnter:
        $("title-press-enter"),


    errorOverlay:
        $("error-overlay"),

    errorMessage:
        $("error-message"),

    errorReloadButton:
        $("error-reload-button"),


    resultOverlay:
        $("result-overlay"),

    resultSection:
        $("result-section"),

    resultTime:
        $("result-time"),

    resultScore:
        $("result-score"),

    resultMiss:
        $("result-miss"),

    resultNextButton:
        $("result-next-button"),


    finalOverlay:
        $("final-overlay"),

    finalTime:
        $("final-time"),

    finalScore:
        $("final-score"),

    finalMiss:
        $("final-miss"),

    restartButton:
        $("restart-button"),


    typingInput:
        $("typing-input"),


    teamButtons:
        document.querySelectorAll(".team-select"),


    /*
     * 旧仮想キーボードDOM
     *
     * UIではdisplay:none。
     * 既存構造との互換用。
     */
    keys:
        document.querySelectorAll(".key")

};


/* =========================================================
   STATE
========================================================= */

const state = {

    initialized:
        false,


    /*
     * TEAM
     */
    team:
        "A",


    /*
     * CSV
     */
    sectionsData:
        [],


    /*
     * 現在区間
     *
     * 0 = 第1区
     */
    currentSection:
        0,


    /*
     * 現在区間の問題
     */
    sectionQuestions:
        [],


    /*
     * 現在問題
     */
    currentQuestionIndex:
        0,


    /*
     * 現在問題の正解
     */
    currentAnswer:
        "",


    /*
     * 現在の入力位置
     */
    currentPosition:
        0,


    /*
     * 区間スコア
     */
    score:
        0,


    /*
     * 区間MISS
     */
    miss:
        0,


    /*
     * COMBO
     */
    combo:
        0,


    /*
     * 全区間合計
     */
    totalScore:
        0,

    totalMiss:
        0,


    /*
     * 現在区間の総文字数
     */
    sectionTotalChars:
        0,


    /*
     * 現在区間で入力済み文字数
     */
    sectionCharsTyped:
        0,


    /*
     * 区間開始時刻
     */
    sectionStartTime:
        0,


    /*
     * 区間経過時間
     */
    sectionElapsed:
        0,


    /*
     * 区間タイマー
     */
    timerInterval:
        null,


    /*
     * 現在の区間が実際に走っているか
     */
    sectionActive:
        false,


    /*
     * ゲーム入力可能
     */
    gameStarted:
        false,


    /*
     * 区間結果表示中
     */
    sectionFinished:
        false,


    /*
     * 初期 / 区間タイトル画面
     */
    titleScreen:
        true,


    /*
     * CSVロード済み
     */
    dataReady:
        false,


    /*
     * 3-2-1-GO中
     */
    countdownRunning:
        false,


    /*
     * 問題処理中
     */
    processingAnswer:
        false,


    /*
     * 2:30到達
     */
    timeExpired:
        false,


    /*
     * 2:30時点の位置を保存
     */
    savedQuestionIndex:
        0,

    savedInputPosition:
        0,


    /*
     * 各区間タイム
     */
    sectionTimes:
        [],


    /*
     * 最終結果
     */
    finalFinished:
        false

};


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    try {

        checkDOM();

        bindEvents();

        readTeamFromURL();

        applyTeam();

        resetWholeGame();

        await loadAllSections();

        state.initialized = true;

    }
    catch (error) {

        console.error(error);

        showError(
            error instanceof Error
                ? error.message
                : String(error)
        );

    }

}


/* =========================================================
   DOM CHECK
========================================================= */

function checkDOM() {

    const required = [

        ["section-number", DOM.sectionNumber],
        ["team-name", DOM.teamName],
        ["timer", DOM.timer],

        ["runner", DOM.runner],
        ["runner-image", DOM.runnerImage],

        ["question-number", DOM.questionNumber],
        ["question-genre", DOM.questionGenre],
        ["question-text", DOM.questionText],
        ["romaji-progress", DOM.romajiProgress],

        ["next-key", DOM.nextKey],
        ["next-key-combo", DOM.nextKeyCombo],

        ["score", DOM.score],
        ["miss", DOM.miss],
        ["combo", DOM.combo],
        ["combo-side-value", DOM.comboSideValue],
        ["accuracy", DOM.accuracy],

        ["progress-percent", DOM.progressPercent],
        ["progress-fill", DOM.progressFill],
        ["progress-current", DOM.progressCurrent],
        ["progress-total", DOM.progressTotal],

        ["good-effect", DOM.goodEffect],
        ["miss-effect", DOM.missEffect],
        ["boost-effect", DOM.boostEffect],

        ["countdown-overlay", DOM.countdownOverlay],
        ["countdown", DOM.countdown],

        ["title-overlay", DOM.titleOverlay],
        ["title-section", DOM.titleSection],
        ["title-press-enter", DOM.titlePressEnter],

        ["error-overlay", DOM.errorOverlay],
        ["error-message", DOM.errorMessage],
        ["error-reload-button", DOM.errorReloadButton],

        ["result-overlay", DOM.resultOverlay],
        ["result-section", DOM.resultSection],
        ["result-time", DOM.resultTime],
        ["result-score", DOM.resultScore],
        ["result-miss", DOM.resultMiss],
        ["result-next-button", DOM.resultNextButton],

        ["final-overlay", DOM.finalOverlay],
        ["final-time", DOM.finalTime],
        ["final-score", DOM.finalScore],
        ["final-miss", DOM.finalMiss],
        ["restart-button", DOM.restartButton],

        ["typing-input", DOM.typingInput]

    ];


    const missing = required
        .filter(item => !item[1])
        .map(item => item[0]);


    if (missing.length > 0) {

        throw new Error(
            "HTML要素が見つかりません:\n" +
            missing.join(", ")
        );

    }

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    document.addEventListener(
        "keydown",
        handleKeyDown
    );


    DOM.teamButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    state.sectionActive ||
                    state.countdownRunning
                ) {

                    return;

                }


                const team =
                    button.dataset.team;


                if (
                    VALID_TEAMS.includes(team)
                ) {

                    state.team = team;

                    applyTeam();

                }

            }
        );

    });


    DOM.resultNextButton.addEventListener(
        "click",
        handleResultNext
    );


    DOM.restartButton.addEventListener(
        "click",
        () => {

            location.reload();

        }
    );


    DOM.errorReloadButton.addEventListener(
        "click",
        () => {

            location.reload();

        }
    );


    /*
     * 旧仮想キーボード
     *
     * UI上は非表示。
     */
    DOM.keys.forEach(key => {

        key.addEventListener(
            "mousedown",
            event => {

                event.preventDefault();

            }
        );

    });


    window.addEventListener(
        "blur",
        clearPressedKeys
    );

}


/* =========================================================
   KEYBOARD INPUT
========================================================= */

function handleKeyDown(event) {

    /*
     * Ctrl / Alt / Meta は無視
     */
    if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
    ) {

        return;

    }


    /*
     * FINAL
     */
    if (
        event.key === "Enter" &&
        state.finalFinished
    ) {

        location.reload();

        return;

    }


    /*
     * 区間スタート画面
     */
    if (
        event.key === "Enter" &&
        state.titleScreen
    ) {

        event.preventDefault();

        if (
            state.dataReady &&
            !state.countdownRunning
        ) {

            startCountdown();

        }

        return;

    }


    /*
     * 区間結果
     */
    if (
        event.key === "Enter" &&
        state.sectionFinished
    ) {

        event.preventDefault();

        handleResultNext();

        return;

    }


    /*
     * ゲーム中でなければ入力不可
     */
    if (
        !state.gameStarted ||
        !state.sectionActive ||
        state.countdownRunning ||
        state.sectionFinished ||
        state.finalFinished
    ) {

        return;

    }


    /*
     * Enter
     */
    if (event.key === "Enter") {

        event.preventDefault();

        return;

    }


    /*
     * Shift単独
     */
    if (event.key === "Shift") {

        return;

    }


    /*
     * 1文字取得
     */
    const key =
        normalizeKey(event.key);


    if (!key) {

        return;

    }


    /*
     * 1文字以外は無視
     */
    if (key.length !== 1) {

        return;

    }


    event.preventDefault();


    flashPressedKey(key);

    checkCharacter(key);

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalizeKey(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .toLowerCase();

}


/* =========================================================
   TEAM URL
========================================================= */

function readTeamFromURL() {

    try {

        const params =
            new URLSearchParams(
                location.search
            );


        const team =
            String(
                params.get("team") || "A"
            ).toUpperCase();


        if (
            VALID_TEAMS.includes(team)
        ) {

            state.team = team;

        }

    }
    catch {

        state.team = "A";

    }

}


/* =========================================================
   APPLY TEAM
========================================================= */

function applyTeam() {

    DOM.teamName.textContent =
        `TEAM ${state.team}`;


    DOM.runnerImage.src =
        `img/character/${state.team}team.png`;


    DOM.runnerImage.alt =
        `TEAM ${state.team}`;


    DOM.teamButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.team === state.team
        );

    });

}


/* =========================================================
   RESET
========================================================= */

function resetWholeGame() {

    stopTimer();

    state.currentSection = 0;

    state.sectionQuestions = [];

    state.currentQuestionIndex = 0;

    state.currentAnswer = "";

    state.currentPosition = 0;

    state.score = 0;

    state.miss = 0;

    state.combo = 0;

    state.totalScore = 0;

    state.totalMiss = 0;

    state.sectionTotalChars = 0;

    state.sectionCharsTyped = 0;

    state.sectionStartTime = 0;

    state.sectionElapsed = 0;

    state.sectionTimes = [];

    state.sectionActive = false;

    state.gameStarted = false;

    state.sectionFinished = false;

    state.titleScreen = true;

    state.dataReady = false;

    state.countdownRunning = false;

    state.processingAnswer = false;

    state.timeExpired = false;

    state.savedQuestionIndex = 0;

    state.savedInputPosition = 0;

    state.finalFinished = false;


    hideAllOverlays();


    document.body.classList.add(
        "ready"
    );


    updateSectionNumber();

    resetHUD();

    resetProgress();

    resetRunner();

    resetQuestionUI();


    DOM.titleSection.textContent =
        "第1区スタート";


    DOM.titlePressEnter.textContent =
        "LOADING...";


    focusInput();

}


/* =========================================================
   RESET QUESTION UI
========================================================= */

function resetQuestionUI() {

    DOM.questionGenre.textContent =
        "---";


    DOM.questionText.textContent =
        "LOADING...";


    DOM.romajiProgress.textContent =
        "CSV DATA LOADING...";


    DOM.nextKey.textContent =
        "—";


    DOM.nextKeyCombo.textContent =
        "—";

}


/* =========================================================
   LOAD ALL CSV
========================================================= */

async function loadAllSections() {

    const loadedSections = [];


    try {

        for (
            let index = 0;
            index < SECTION_FILES.length;
            index++
        ) {

            const file =
                SECTION_FILES[index];


            const response =
                await fetch(
                    `${file}?v=${Date.now()}`
                );


            if (!response.ok) {

                throw new Error(
                    `CSV読み込み失敗: ${file}\n` +
                    `HTTP ${response.status}`
                );

            }


            const text =
                await response.text();


            const questions =
                parseCSV(text);


            if (
                questions.length === 0
            ) {

                throw new Error(
                    `${file} に有効な問題がありません。`
                );

            }


            loadedSections.push(
                questions
            );

        }


        state.sectionsData =
            loadedSections;


        state.dataReady = true;


        prepareSection(0);


        showSectionTitle();


    }
    catch (error) {

        console.error(error);

        showError(
            error instanceof Error
                ? error.message
                : String(error)
        );

    }

}


/* =========================================================
   CSV PARSER
========================================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let cell = "";

    let inQuotes = false;


    /*
     * BOM除去
     */
    text =
        String(text || "")
            .replace(/^\uFEFF/, "");


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        /*
         * "" → "
         */
        if (
            char === '"' &&
            inQuotes &&
            next === '"'
        ) {

            cell += '"';

            i++;

            continue;

        }


        /*
         * クォート開始 / 終了
         */
        if (char === '"') {

            inQuotes =
                !inQuotes;

            continue;

        }


        /*
         * CSVカンマ
         */
        if (
            char === "," &&
            !inQuotes
        ) {

            row.push(cell);

            cell = "";

            continue;

        }


        /*
         * 改行
         */
        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !inQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(cell);

            cell = "";


            if (
                row.some(
                    value =>
                        String(value).trim() !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            continue;

        }


        cell += char;

    }


    /*
     * 最終行
     */
    if (
        cell !== "" ||
        row.length > 0
    ) {

        row.push(cell);


        if (
            row.some(
                value =>
                    String(value).trim() !== ""
            )
        ) {

            rows.push(row);

        }

    }


    if (rows.length < 2) {

        return [];

    }


    /*
     * HEADER
     */
    const headers =
        rows[0].map(
            value =>
                String(value)
                    .trim()
                    .toLowerCase()
        );


    const questionNoIndex =
        headers.indexOf("question_no");


    const sectionIndex =
        headers.indexOf("section");


    const genreIndex =
        headers.indexOf("genre");


    const displayIndex =
        headers.indexOf("display");


    const answerIndex =
        headers.indexOf("answer");


    if (
        questionNoIndex === -1 ||
        sectionIndex === -1 ||
        genreIndex === -1 ||
        displayIndex === -1 ||
        answerIndex === -1
    ) {

        throw new Error(
            "CSVのヘッダーが新仕様ではありません。\n" +
            "必要列: question_no, section, genre, display, answer"
        );

    }


    const result = [];


    /*
     * DATA
     */
    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const currentRow =
            rows[i];


        const questionNo =
            String(
                currentRow[
                    questionNoIndex
                ] ?? i
            ).trim();


        const section =
            String(
                currentRow[
                    sectionIndex
                ] ?? ""
            ).trim();


        const genre =
            decodeSpecialSpaces(
                String(
                    currentRow[
                        genreIndex
                    ] ?? ""
                ).trim()
            );


        const display =
            decodeSpecialSpaces(
                String(
                    currentRow[
                        displayIndex
                    ] ?? ""
                ).trim()
            );


        const answer =
            decodeSpecialSpaces(
                String(
                    currentRow[
                        answerIndex
                    ] ?? ""
                ).trim()
            ).toLowerCase();


        /*
         * answerなしはスキップ
         */
        if (!answer) {

            console.warn(
                "answerが空のCSV行をスキップ:",
                i + 1
            );

            continue;

        }


        result.push({

            questionNo:
                questionNo,

            section:
                section,

            genre:
                genre,

            display:
                display,

            answer:
                answer

        });

    }


    return result;

}


/* =========================================================
   SPECIAL SPACE
========================================================= */

function decodeSpecialSpaces(value) {

    return String(value)

        .replace(
            /\[半角スペース\]/g,
            " "
        )

        .replace(
            /\[全角スペース\]/g,
            "　"
        );

}


/* =========================================================
   PREPARE SECTION
========================================================= */

function prepareSection(sectionIndex) {

    stopTimer();


    if (
        sectionIndex < 0 ||
        sectionIndex >= state.sectionsData.length
    ) {

        finishRace();

        return;

    }


    state.currentSection =
        sectionIndex;


    state.sectionQuestions =
        state.sectionsData[
            sectionIndex
        ];


    state.currentQuestionIndex = 0;

    state.currentAnswer = "";

    state.currentPosition = 0;


    state.score = 0;

    state.miss = 0;

    state.combo = 0;


    state.sectionCharsTyped = 0;

    state.sectionTotalChars =
        state.sectionQuestions.reduce(
            (total, question) =>
                total + question.answer.length,
            0
        );


    state.sectionElapsed = 0;

    state.sectionStartTime = 0;


    state.sectionActive = false;

    state.gameStarted = false;

    state.sectionFinished = false;

    state.titleScreen = true;

    state.countdownRunning = false;

    state.processingAnswer = false;

    state.timeExpired = false;


    state.savedQuestionIndex = 0;

    state.savedInputPosition = 0;


    clearInput();

    clearPressedKeys();


    updateSectionNumber();

    resetHUD();

    resetProgress();

    resetRunner();


    showQuestion();

    showSectionTitle();

}


/* =========================================================
   SECTION TITLE
========================================================= */

function showSectionTitle() {

    const sectionNo =
        state.currentSection + 1;


    DOM.titleSection.textContent =
        `第${sectionNo}区スタート`;


    DOM.titlePressEnter.textContent =
        "PRESS ENTER";


    DOM.titleOverlay.classList.remove(
        "hidden"
    );


    DOM.countdownOverlay.classList.add(
        "hidden"
    );


    state.titleScreen = true;


    document.body.classList.add(
        "ready"
    );

}


/* =========================================================
   SHOW QUESTION
========================================================= */

function showQuestion() {

    const question =
        state.sectionQuestions[
            state.currentQuestionIndex
        ];


    if (!question) {

        finishSection();

        return;

    }


    /*
     * ==============================================
     * ジャンル
     *
     * CSV:
     * genre
     * ==============================================
     */
    DOM.questionGenre.textContent =
        question.genre || "---";


    /*
     * ==============================================
     * 日本語 / 表示用お題
     * ==============================================
     */
    DOM.questionText.textContent =
        question.display;


    /*
     * ==============================================
     * 実際の入力文字列
     *
     * CSV:
     * answer
     * ==============================================
     */
    state.currentAnswer =
        question.answer.toLowerCase();


    /*
     * 新しい問題なので0から
     */
    state.currentPosition = 0;


    DOM.questionNumber.textContent =
        `${state.currentQuestionIndex + 1} / ${state.sectionQuestions.length}`;


    updateRomajiProgress();

    updateRequiredKey();

    clearInput();

    focusInput();

}


/* =========================================================
   ROMAJI PROGRESS
========================================================= */

function updateRomajiProgress() {

    const answer =
        state.currentAnswer;


    const position =
        state.currentPosition;


    if (!answer) {

        DOM.romajiProgress.textContent =
            "";

        return;

    }


    DOM.romajiProgress.innerHTML =
        "";


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < answer.length;
        i++
    ) {

        const span =
            document.createElement("span");


        span.textContent =
            answer[i];


        if (
            i < position
        ) {

            span.className =
                "typed";

        }
        else if (
            i === position
        ) {

            span.className =
                "current";

        }
        else {

            span.className =
                "remaining";

        }


        fragment.appendChild(
            span
        );

    }


    DOM.romajiProgress.appendChild(
        fragment
    );

}


/* =========================================================
   CHECK CHARACTER
========================================================= */

function checkCharacter(input) {

    if (
        state.processingAnswer ||
        !state.gameStarted ||
        !state.sectionActive
    ) {

        return;

    }


    const expected =
        state.currentAnswer[
            state.currentPosition
        ];


    if (!expected) {

        return;

    }


    if (
        input === expected
    ) {

        handleCorrect(
            input
        );

    }
    else {

        handleMiss();

    }

}


/* =========================================================
   CORRECT
========================================================= */

function handleCorrect(input) {

    state.currentPosition++;

    state.sectionCharsTyped++;

    state.combo++;


    /*
     * スコア
     */
    state.score += 10;


    /*
     * コンボボーナス
     */
    if (
        state.combo > 1
    ) {

        state.score +=
            Math.min(
                state.combo,
                20
            );

    }


    flashEffect(
        DOM.goodEffect
    );


    if (
        state.combo > 0 &&
        state.combo % 10 === 0
    ) {

        flashEffect(
            DOM.boostEffect
        );

    }


    updateHUD();

    updateProgress();

    updateRomajiProgress();

    updateRequiredKey();


    /*
     * 問題完了
     */
    if (
        state.currentPosition >=
        state.currentAnswer.length
    ) {

        completeQuestion();

    }

}


/* =========================================================
   MISS
========================================================= */

function handleMiss() {

    state.miss++;

    state.combo = 0;


    flashEffect(
        DOM.missEffect
    );


    updateHUD();

}


/* =========================================================
   COMPLETE QUESTION
========================================================= */

async function completeQuestion() {

    if (
        state.processingAnswer
    ) {

        return;

    }


    state.processingAnswer = true;


    const isLastQuestion =
        state.currentQuestionIndex >=
        state.sectionQuestions.length - 1;


    await sleep(
        NEXT_QUESTION_DELAY
    );


    /*
     * 2:30がこの処理中に到達
     */
    if (
        state.timeExpired
    ) {

        state.processingAnswer = false;

        finishSection();

        return;

    }


    /*
     * 全問題終了
     */
    if (
        isLastQuestion
    ) {

        state.processingAnswer = false;

        finishSection();

        return;

    }


    /*
     * 次の問題
     */
    state.currentQuestionIndex++;

    state.processingAnswer = false;

    showQuestion();

}


/* =========================================================
   START COUNTDOWN
========================================================= */

async function startCountdown() {

    if (
        state.countdownRunning ||
        state.sectionActive ||
        state.sectionFinished ||
        state.finalFinished
    ) {

        return;

    }


    if (
        !state.dataReady ||
        state.sectionQuestions.length === 0
    ) {

        return;

    }


    state.titleScreen = false;

    state.countdownRunning = true;


    DOM.titleOverlay.classList.add(
        "hidden"
    );


    DOM.countdownOverlay.classList.remove(
        "hidden"
    );


    const sequence = [
        "3",
        "2",
        "1",
        "GO!!"
    ];


    for (
        let i = 0;
        i < sequence.length;
        i++
    ) {

        if (
            state.sectionFinished
        ) {

            state.countdownRunning = false;

            return;

        }


        DOM.countdown.textContent =
            sequence[i];


        /*
         * アニメーション再起動
         */
        DOM.countdown.style.animation =
            "none";


        void DOM.countdown.offsetWidth;


        DOM.countdown.style.animation =
            "";


        if (
            sequence[i] === "GO!!"
        ) {

            await sleep(500);

        }
        else {

            await sleep(
                COUNTDOWN_STEP
            );

        }

    }


    DOM.countdownOverlay.classList.add(
        "hidden"
    );


    state.countdownRunning = false;


    /*
     * 区間開始
     */
    startSection();

}


/* =========================================================
   START SECTION
========================================================= */

function startSection() {

    if (
        state.sectionFinished
    ) {

        return;

    }


    state.sectionActive = true;

    state.gameStarted = true;

    state.timeExpired = false;


    document.body.classList.remove(
        "ready"
    );


    state.sectionStartTime =
        performance.now();


    startTimer();

    focusInput();

}


/* =========================================================
   SECTION TIMER
========================================================= */

function startTimer() {

    stopTimer();


    state.sectionStartTime =
        performance.now();


    updateTimer();


    state.timerInterval =
        setInterval(
            updateTimer,
            10
        );

}


/* =========================================================
   UPDATE TIMER
========================================================= */

function updateTimer() {

    if (
        !state.sectionActive ||
        !state.sectionStartTime
    ) {

        return;

    }


    const elapsed =
        performance.now() -
        state.sectionStartTime;


    state.sectionElapsed =
        elapsed;


    DOM.timer.textContent =
        formatTime(
            elapsed
        );


    /*
     * 2:30到達
     */
    if (
        elapsed >= PLAYER_TIME &&
        !state.timeExpired
    ) {

        handleTimeExpired();

    }

}


/* =========================================================
   TIME EXPIRED
========================================================= */

function handleTimeExpired() {

    if (
        !state.sectionActive ||
        state.timeExpired
    ) {

        return;

    }


    /*
     * ★重要
     *
     * その瞬間の
     *
     * 問題番号
     * 入力位置
     *
     * を保存
     */
    state.savedQuestionIndex =
        state.currentQuestionIndex;


    state.savedInputPosition =
        state.currentPosition;


    state.timeExpired = true;


    /*
     * 入力停止
     */
    state.gameStarted = false;


    clearInput();

    clearPressedKeys();


    /*
     * 問題切り替え処理中なら
     * 現在位置を変更しない
     */
    if (
        state.processingAnswer
    ) {

        return;

    }


    /*
     * 即座に区間終了
     */
    finishSection();

}


/* =========================================================
   STOP TIMER
========================================================= */

function stopTimer() {

    if (
        state.timerInterval !== null
    ) {

        clearInterval(
            state.timerInterval
        );

        state.timerInterval = null;

    }

}


/* =========================================================
   FINISH SECTION
========================================================= */

function finishSection() {

    if (
        state.sectionFinished
    ) {

        return;

    }


    stopTimer();


    /*
     * 現在時間を確定
     */
    if (
        state.sectionStartTime
    ) {

        state.sectionElapsed =
            Math.min(
                performance.now() -
                state.sectionStartTime,
                PLAYER_TIME
            );

    }


    state.sectionActive = false;

    state.gameStarted = false;

    state.countdownRunning = false;

    state.sectionFinished = true;

    state.titleScreen = false;


    clearInput();

    clearPressedKeys();


    /*
     * 2:30で終了した場合
     */
    if (
        state.timeExpired
    ) {

        state.currentQuestionIndex =
            state.savedQuestionIndex;


        state.currentPosition =
            state.savedInputPosition;


        updateRomajiProgress();

        updateRequiredKey();

    }


    DOM.resultSection.textContent =
        String(
            state.currentSection + 1
        );


    DOM.resultTime.textContent =
        formatTime(
            state.sectionElapsed
        );


    DOM.resultScore.textContent =
        String(
            state.score
        );


    DOM.resultMiss.textContent =
        String(
            state.miss
        );


    DOM.titleOverlay.classList.add(
        "hidden"
    );


    DOM.countdownOverlay.classList.add(
        "hidden"
    );


    DOM.resultOverlay.classList.remove(
        "hidden"
    );


    updateHUD();

}


/* =========================================================
   NEXT SECTION
========================================================= */

function handleResultNext() {

    if (
        !state.sectionFinished
    ) {

        return;

    }


    /*
     * 現在区間を合計
     */
    state.totalScore +=
        state.score;


    state.totalMiss +=
        state.miss;


    state.sectionTimes[
        state.currentSection
    ] =
        state.sectionElapsed;


    DOM.resultOverlay.classList.add(
        "hidden"
    );


    /*
     * 次の区間
     */
    const nextSection =
        state.currentSection + 1;


    if (
        nextSection >=
        state.sectionsData.length
    ) {

        finishRace();

        return;

    }


    setTimeout(
        () => {

            prepareSection(
                nextSection
            );

        },
        NEXT_SECTION_DELAY
    );

}


/* =========================================================
   FINAL
========================================================= */

function finishRace() {

    stopTimer();


    state.sectionActive = false;

    state.gameStarted = false;

    state.sectionFinished = false;

    state.titleScreen = false;

    state.finalFinished = true;


    clearInput();

    clearPressedKeys();


    const totalTime =
        state.sectionTimes.reduce(
            (total, time) =>
                total + (
                    Number(time) || 0
                ),
            0
        );


    /*
     * 最終表示
     */
    DOM.finalTime.textContent =
        formatTime(
            totalTime
        );


    DOM.finalScore.textContent =
        String(
            state.totalScore
        );


    DOM.finalMiss.textContent =
        String(
            state.totalMiss
        );


    DOM.finalOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   HUD
========================================================= */

function resetHUD() {

    DOM.score.textContent =
        "0";

    DOM.miss.textContent =
        "0";

    DOM.combo.textContent =
        "0";

    DOM.comboSideValue.textContent =
        "0";

    DOM.accuracy.textContent =
        "100.0%";

}


function updateHUD() {

    DOM.score.textContent =
        String(
            state.score
        );


    DOM.miss.textContent =
        String(
            state.miss
        );


    DOM.combo.textContent =
        String(
            state.combo
        );


    DOM.comboSideValue.textContent =
        String(
            state.combo
        );


    const attempts =
        state.sectionCharsTyped +
        state.miss;


    const accuracy =
        attempts > 0
            ? (
                state.sectionCharsTyped /
                attempts
            ) * 100
            : 100;


    DOM.accuracy.textContent =
        `${accuracy.toFixed(1)}%`;

}


/* =========================================================
   PROGRESS
========================================================= */

function resetProgress() {

    DOM.progressCurrent.textContent =
        "0";


    DOM.progressTotal.textContent =
        String(
            state.sectionTotalChars
        );


    DOM.progressPercent.textContent =
        "0%";


    DOM.progressFill.style.width =
        "0%";

}


function updateProgress() {

    const total =
        state.sectionTotalChars;


    const current =
        state.sectionCharsTyped;


    const percent =
        total > 0
            ? Math.min(
                100,
                (
                    current /
                    total
                ) * 100
            )
            : 0;


    DOM.progressCurrent.textContent =
        String(
            current
        );


    DOM.progressTotal.textContent =
        String(
            total
        );


    DOM.progressPercent.textContent =
        `${percent.toFixed(0)}%`;


    DOM.progressFill.style.width =
        `${percent}%`;


    /*
     * ランナー位置
     */
    const runnerPercent =
        Math.min(
            92,
            2 + (
                percent *
                .9
            )
        );


    DOM.runner.style.left =
        `${runnerPercent}%`;

}


/* =========================================================
   SECTION NUMBER
========================================================= */

function updateSectionNumber() {

    DOM.sectionNumber.textContent =
        String(
            state.currentSection + 1
        );

}


/* =========================================================
   RUNNER
========================================================= */

function resetRunner() {

    DOM.runner.style.left =
        "2%";

}


/* =========================================================
   NEXT KEY
========================================================= */

/*
 * CSVの answer に入っている
 * 実際に入力する1文字をそのまま表示。
 *
 * 例:
 *
 * "
 * [
 * ]
 * :
 * ;
 *
 * すべてCSV answerを基準にする。
 */


/*
 * NEXT KEY下段のキー操作表示
 *
 * JISキーボード：
 * のような接頭辞は付けない。
 */
function getKeyGuide(character) {

    const map = {

        " ":
            "SPACE",

        "!":
            "Shift + 1",

        '"':
            "Shift + 2",

        "#":
            "Shift + 3",

        "$":
            "Shift + 4",

        "%":
            "Shift + 5",

        "&":
            "Shift + 6",

        "'":
            "Shift + 7",

        "(":
            "Shift + 8",

        ")":
            "Shift + 9",

        "=":
            "Shift + -",

        "~":
            "Shift + ^",

        "|":
            "Shift + \\",

        "`":
            "Shift + @",

        "{":
            "Shift + [",

        "}":
            "Shift + ]",

        "+":
            "Shift + ;",

        "*":
            "Shift + :",

        "<":
            "Shift + ,",

        ">":
            "Shift + .",

        "?":
            "Shift + /",

        "_":
            "Shift + \\"

    };


    if (
        Object.prototype.hasOwnProperty.call(
            map,
            character
        )
    ) {

        return map[character];

    }


    if (
        /^[a-z]$/i.test(
            character
        )
    ) {

        return character.toUpperCase();

    }


    if (
        /^[0-9]$/.test(
            character
        )
    ) {

        return character;

    }


    /*
     * 通常の記号
     */
    return character;

}


function updateRequiredKey() {

    clearCurrentKeys();


    /*
     * 入力完了
     */
    if (
        !state.currentAnswer ||
        state.currentPosition >=
        state.currentAnswer.length
    ) {

        DOM.nextKey.textContent =
            "✓";


        DOM.nextKeyCombo.textContent =
            "COMPLETE";


        return;

    }


    /*
     * 次に入力すべき文字
     */
    const required =
        state.currentAnswer[
            state.currentPosition
        ];


    /*
     * ==============================================
     * 新UI
     * ==============================================
     */
    DOM.nextKey.textContent =
        required;


    DOM.nextKeyCombo.textContent =
        getKeyGuide(
            required
        );


    /*
     * ==============================================
     * 旧仮想キーボード
     *
     * display:noneのため画面には出ない。
     * ==============================================
     */
    DOM.keys.forEach(key => {

        if (
            key.dataset.key ===
            required
        ) {

            key.classList.add(
                "current"
            );

        }

    });

}


/* =========================================================
   KEY EFFECT
========================================================= */

function flashPressedKey(keyValue) {

    let target = null;


    DOM.keys.forEach(key => {

        if (
            key.dataset.key ===
            keyValue
        ) {

            target = key;

        }

    });


    if (!target) {

        return;

    }


    target.classList.add(
        "pressed"
    );


    setTimeout(
        () => {

            target.classList.remove(
                "pressed"
            );

        },
        100
    );

}


function clearCurrentKeys() {

    DOM.keys.forEach(key => {

        key.classList.remove(
            "current"
        );

    });

}


function clearPressedKeys() {

    DOM.keys.forEach(key => {

        key.classList.remove(
            "pressed"
        );

    });

}


/* =========================================================
   EFFECT
========================================================= */

function flashEffect(element) {

    if (!element) {

        return;

    }


    element.classList.remove(
        "show"
    );


    void element.offsetWidth;


    element.classList.add(
        "show"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "show"
            );

        },
        600
    );

}


/* =========================================================
   INPUT
========================================================= */

function clearInput() {

    if (
        DOM.typingInput
    ) {

        DOM.typingInput.value =
            "";

    }

}


function focusInput() {

    if (
        state.finalFinished
    ) {

        return;

    }


    try {

        DOM.typingInput.focus({
            preventScroll: true
        });

    }
    catch {

        DOM.typingInput.focus();

    }

}


/* =========================================================
   OVERLAY
========================================================= */

function hideAllOverlays() {

    DOM.titleOverlay.classList.add(
        "hidden"
    );

    DOM.countdownOverlay.classList.add(
        "hidden"
    );

    DOM.errorOverlay.classList.add(
        "hidden"
    );

    DOM.resultOverlay.classList.add(
        "hidden"
    );

    DOM.finalOverlay.classList.add(
        "hidden"
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    console.error(
        "[KIR ERROR]",
        message
    );


    /*
     * DOM初期化前でも二次エラーを
     * 起こさない。
     */
    const errorMessage =
        document.getElementById(
            "error-message"
        );


    const errorOverlay =
        document.getElementById(
            "error-overlay"
        );


    if (errorMessage) {

        errorMessage.textContent =
            String(message);

    }


    if (errorOverlay) {

        errorOverlay.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(milliseconds) {

    const safe =
        Math.max(
            0,
            Number(milliseconds) || 0
        );


    const minutes =
        Math.floor(
            safe / 60000
        );


    const seconds =
        Math.floor(
            (
                safe % 60000
            ) / 1000
        );


    const millis =
        Math.floor(
            safe % 1000
        );


    return (

        String(minutes)
            .padStart(2, "0")

        + ":" +

        String(seconds)
            .padStart(2, "0")

        + "." +

        String(millis)
            .padStart(3, "0")

    );

}


/* =========================================================
   SLEEP
========================================================= */

function sleep(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================================
   DEBUG
========================================================= */

window.KIR_GAME = {

    state,


    restart() {

        location.reload();

    },


    start() {

        if (
            state.titleScreen &&
            state.dataReady
        ) {

            startCountdown();

        }

    },


    finishSection() {

        finishSection();

    }

};