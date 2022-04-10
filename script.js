'use strict';
(() => {
	const kanjiNumber = (number) => {
		const pos0 = number % 10;
		const pos1 = Math.floor(number / 10);
		const kanji = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
		const kanjiTen = "十";
		if (pos1 == 0) return kanji[pos0];
		if (pos1 == 1) return kanjiTen + kanji[pos0];
		return kanji[pos1] + kanjiTen + kanji[pos0];
	}

	const kanaNumber = (counter, number) => {
		if (counter.exceptions) {
			const exc = counter.exceptions.find(e => e.number === number);
			if (exc) return exc.reading;
		}
		const pos0 = number % 10;
		const pos1 = Math.floor(number / 10);
		const kana = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
		const kanaTen = "じゅう";
		let conj = counter.conjunctions;
		if (conj === "default") conj = ["じゅう", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"]
			.map(s => s + counter.furi);

		if (pos1 == 0) return conj[pos0]; // 1-9
		if (number == 10) return conj[0]; // 10
		if (pos1 == 1) return kanaTen + conj[pos0]; // 11-19
		if (pos0 == 0) return kana[pos1] + conj[0]; // 20, 30,.. 90
		return kana[pos1] + kanaTen + conj[pos0]; // 21, 22,..
	}

	const randomFlashcardCount = () => {
		const rand = Math.random();
		if (rand < 0.36) return Math.ceil(rand / 0.36 * 10); // 1 to 10
		if (rand < 0.63) return Math.ceil((rand - 0.36) / 0.27 * 10 + 10); // 11 to 20
		if (rand < 0.765) return Math.floor((rand - 0.63) / 0.135 * 7 + 3) * 10; // 30, 40... to 90
		if (rand < 0.9) return Math.floor((rand - 0.765) / 0.135 * 79 + 21); // 21, 22... to 99
		return -1; // interrogative (e.g. nankai)
	}

	const createDateFlashcard = () => {
		let month = Math.floor(Math.random() * 12 + 1); // 1 = Jan
		let maxDays;
		switch (month) {
			case 1: case 3: case 5: case 7: case 8: case 10: case 12:
				maxDays = 31; break;
			case 4: case 6: case 9: case 11:
				maxDays = 30; break;
			default: maxDays = 28; break;
		}
		let day = Math.ceil(Math.random() * maxDays);
		if (Math.random() < 0.00069) { // lucky enough for Feb 29?
			month = 2;
			day = 29;
		}
		let suffixEn;
		switch (day) {
			case 1: case 21: case 31: suffixEn = "st"; break;
			case 2: case 22: suffixEn = "nd"; break;
			default: suffixEn = "th"; break;
		}

		const monthNamesJa = ["いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ", "ろくがつ",
			"しちがつ", "はちがつ", "くがつ", "じゅうがつ", "じゅういちがつ", "じゅうにがつ"];
		const monthNamesEn = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"];
		const dayReadings = ["ついたち", "ふつか", "みっか", "よっか", "いつか", "むいか",
			"なのか", "ようか", "ここのか", "とおか", "じゅういちにち", "じゅうににち", "じゅうさんにち",
			"じゅうよっか", "じゅうごにち", "じゅうろくにち", "じゅうななにち", "じゅうはちにち",
			"じゅうくにち", "はつか", "にじゅういちにち", "にじゅうににち", "にじゅうさんにち",
			"にじゅうよっか", "にじゅうごにち", "にじゅうろくにち", "にじゅうななにち",
			"にじゅうはちにち", "にじゅうくにち", "さんじゅうにち", "さんじゅういちにち"];

		return {
			"japanese": kanjiNumber(month) + "月" + kanjiNumber(day) + "日",
			"furigana": monthNamesJa[month - 1] + dayReadings[day - 1],
			"translation": day + suffixEn + " of " + monthNamesEn[month - 1],
			"image": null
		}
	};

	const createCounterGroupFlashcard = (counter, number) => {
		const example = counter.examples[Math.floor(Math.random() * counter.examples.length)];
		if (number == -1) return {
			"japanese": "何" + counter.word + "の" + example.word,
			"furigana": counter.howMany + "の" + example.furi,
			"translation": "how many " + example.translation_en[1] + "?",
			"image": "counter-images/" + example.image
		};
		return {
			"japanese": kanjiNumber(number) + counter.word + "の" + example.word,
			"furigana": kanaNumber(counter, number) + "の" + example.furi,
			"translation": number + " " + example.translation_en[number == 1 ? 0 : 1],
			"image": "counter-images/" + example.image
		};
	};

	const createSelfCounterFlashcard = (counter, number) => {
		if (number == -1) return {
			"japanese": "何" + counter.word,
			"furigana": counter.howMany,
			"translation": "how many " + counter.translation_en[1] + "?",
			"image": null
		};
		return {
			"japanese": kanjiNumber(number) + counter.word,
			"furigana": kanaNumber(counter, number),
			"translation": number + " " + counter.translation_en[number == 1 ? 0 : 1],
			"image": null
		};
	};

	const createRandomFlashcard = () => {
		// +1 counter is the special case for month & day
		const countersTotal = counters.counterGroups.length + counters.selfCounters.length + 1;
		let drawIndex = Math.floor(Math.random() * countersTotal) - 1;
		if (drawIndex == -1) return createDateFlashcard();
		const randomCount = randomFlashcardCount();

		if (drawIndex < counters.counterGroups.length)
			return createCounterGroupFlashcard(counters.counterGroups[drawIndex], randomCount);
		drawIndex -= counters.counterGroups.length;
		return createSelfCounterFlashcard(counters.selfCounters[drawIndex], randomCount);
	};

	const flashcardDom = {
		flashcard: document.querySelector(".flashcard"),
		jp: document.querySelector(".flashcard .japanese rb"),
		jpFuri: document.querySelector(".flashcard .japanese rt"),
		translation: document.querySelector(".flashcard .translation"),
		image: document.querySelector(".flashcard .card-image img")
	}

	let isAnswerShown = true;
	let currentCard;

	const assignNewFlashcard = () => {
		currentCard = createRandomFlashcard();
		flashcardDom.flashcard.classList.add("hide-answer");
		flashcardDom.jp.innerHTML = "　";
		flashcardDom.jpFuri.innerHTML = "　";
		flashcardDom.translation.innerHTML = currentCard.translation;
		flashcardDom.image.style.visibility = currentCard.image === null ? "hidden" : "visible";
		flashcardDom.image.src = currentCard.image === null ? "" : currentCard.image;
	}

	const showAnswer = () => {
		flashcardDom.flashcard.classList.remove("hide-answer");
		flashcardDom.jp.innerHTML = currentCard.japanese;
		flashcardDom.jpFuri.innerHTML = currentCard.furigana;
	}

	const onContinueClicked = () => {
		if (isAnswerShown) assignNewFlashcard();
		else showAnswer();
		isAnswerShown = !isAnswerShown;
	};

	document.querySelector(".continue-button").onclick = e => onContinueClicked();
	document.body.addEventListener('keypress', e => { if (e.code === "Space") onContinueClicked() });
})();
