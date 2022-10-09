//var dir = 'http://mikidani.probaljaki.hu/wordpractice/';
var dir = 'http://localhost/wordpractice/';

class LoadData {
    dir;
    filename;
    url;
    data;
    dataDivId;
    constructor (filename, dataDivId) {
        this.dir = dir;
        this.filename = filename;
        this.url = dir+filename;
        this.dataDivId = dataDivId;

        this.loadData();
        //this.handoverData();
    }

    loadData = () => {
        let ajax = new XMLHttpRequest();
        ajax.open('get', this.url);
        ajax.send();

        ajax.onreadystatechange = () => {

            if (ajax.readyState == 4) {
                this.data = JSON.parse(ajax.responseText);
            }
        }
    }

    handoverData = () => {
        let szam = 0;
        this.myInterval = setInterval(() => {
            console.log(szam,' loading...');
            szam++;
            if (this.data) {
                console.log(this.data);
                clearInterval(this.myInterval);
                return this.data;
            }
        }, 1);
    }
}

class LoadSounds {
    audioElements;
    soundSwitch;
    constructor () {
        this.audioElements = [
            { id: "correct", src: "sounds/correct.mp3" },
            { id: "wrong", src: "sounds/wrong.mp3" }
        ];

        this.soundSwitch = true;
        this.soundLoad();
    }

    soundLoad() {
        for (let attribute of this.audioElements) {
            let audio = document.createElement('audio');
            for (let key in attribute) {
                audio.setAttribute(key, attribute[key]);
            }
            document.getElementById("audios").appendChild(audio);
        }
    }
    
    playAudio (soundname) {
        if (this.soundSwitch) {
            document.getElementById(soundname).play();
        }
    }

}

class Engine {
    questionNumber;
    wordsDataList;
    constructor() {
        this.logo = document.querySelector('.logo');
        this.startButton = document.querySelector('#start-button');
        this.nextButton = document.querySelector('#next-button');
        this.seeButton = document.querySelector('#see-button');
        this.questionNumberInput = document.querySelector('#questionNumber');
        this.input = document.querySelector('#input');
        this.message = document.querySelector('#message');
        this.langButtonInput = document.querySelector('#langButton');
        this.nowNumberDiv = document.querySelector('#nowNumber');
        this.enWordDiv = document.querySelector('#engWord');
        this.huWordDiv = document.querySelector('#huWord');
        this.response = document.querySelector('#response');
        this.soundSwitch = document.querySelector('#soundSwitch');
        this.modeInput = document.getElementsByName("mode");
        this.wordsButton = document.querySelector('#words-button');
        this.wordsDiv = document.querySelector('#words');
        this.transferDiv = document.querySelector('#transfer');
        this.optionsDiv = document.querySelector('#options');
        this.wordsDataDiv = document.querySelector('#words-data');
        this.searchWordInputEn = document.querySelector('#wordFinderEn');
        this.searchWordInputHu = document.querySelector('#wordFinderHu');
        this.searchWordInputsAll = document.getElementsByClassName('searchInput');
        this.switch = false;
        this.start = false;
        this.langSwitch = [0, 1];
        this.nowNumber=0;
        this.divSwitch();
        this.addEvents();
    }

    seeWord = () => {
        this.seeButton.style.display = 'none';
        this.nextButton.style.display = 'inline';
        this.input.style.display = 'none';
        this.huWordDiv.innerHTML = this.wordsDataList[this.nowNumber][this.langSwitch[1]];    
        if (this.input.value.length>0) {
            const wait = () => {
                setTimeout(() => {
                    this.response.innerHTML = '';
                }, 2000);
            }
            
            if (this.input.value.toLowerCase() == this.wordsDataList[this.nowNumber][this.langSwitch[1]].toLowerCase()) {
                this.response.innerHTML = '<h3 class="text-success">Correct!</h3>';
                loadSounds.playAudio('correct');
                //wait();
            } else {
                this.response.innerHTML = '<h3 class="text-danger">Wrong!</h3>';
                loadSounds.playAudio('wrong');
                wait();
            }
            this.input.value = '';
        }
    }

    nextWord = () => {
        this.nextButton.style.display ='none';
        this.seeButton.style.display ='inline';
        this.input.style.display = 'block';
        this.input.value = '';
        this.response.innerHTML = '';
        this.nowNumber = (this.questionNumber-1 > this.nowNumber) ? this.nowNumber+1 : 0 ;
        this.questionDraw();
    }

    questionDraw = () => {
        this.nowNumberDiv.innerHTML = this.nowNumber+1+'.';
        this.enWordDiv.innerHTML = this.wordsDataList[this.nowNumber][this.langSwitch[0]];
        this.huWordDiv.innerHTML = '';
    }

    questionListMake = () => {
        let loadData = wordsData.data;
        let arrayData = [];
        let wordsDataList = [];

        Object.keys(loadData).forEach(element => {
            arrayData.push([element, loadData[element]]);
        });

        if (this.mode == '01') {
            this.start = true;
            for (var i = 0; i < this.questionNumber; i++) {
                let rand = Math.floor(Math.random() * arrayData.length);
                wordsDataList.push(arrayData[rand]);
            }
        }
        
        if (this.mode == '02') {
            if (this.questionNumberInput.value <= arrayData.length) {
                this.start = true;
                let copyArrayData = arrayData;
                for (var i = 0; i < this.questionNumberInput.value; i++) {
                    let rand = Math.floor(Math.random() * copyArrayData.length);
                    wordsDataList.push(arrayData[rand]);
                    copyArrayData.splice(rand,1);
                }   
            } else {
                this.message.innerHTML = 'Maximum '+arrayData.length+' questions can be.<br>The wordbook is so long now.';
            }
        }
        // if (wordsDataList.length>0) { console.log(wordsDataList); }
        return wordsDataList;
    }

    getRadioValue() {
        let value;
        for (var i = 0; i < this.modeInput.length; i++) {
            (this.modeInput[i].checked) ? value = this.modeInput[i].value : null ;
        }
        return value;
    }

    divSwitch = (switchOn) => {
        if (switchOn) { this.switch = (this.switch == true) ? false : true ; }

        if (this.switch == true) {
            this.transferDiv.style.display="block";
            this.optionsDiv.style.display="none";
        } else {
            this.transferDiv.style.display="none";
            this.optionsDiv.style.display="block";
        }
    }

    searchWord = () => {
        this.wordsDataDiv.innerHTML = '';

        let drawText = `<table class="table table-sm"><tr class="border-top"><td class="w-50 ps-3"><strong>English</strong></td><td class="w-50"><strong>Hungary</strong></td></tr>`;

        // filtration words
        if (this.searchWordInputEn.value.length>0 || this.searchWordInputHu.value.length>0) {

            let en = this.searchWordInputEn.value.toLowerCase(); let hu = this.searchWordInputHu.value.toLowerCase();
            this.searchWordInputEn.value = en; this.searchWordInputHu.value = hu;

            Object.keys(wordsData.data).forEach(element => {
                let toLowElement = element.toLowerCase();
                if ((en.length>0 && toLowElement.includes(en)) || 
                    (hu.length>0 && wordsData.data[toLowElement].includes(hu))) {
                    drawText += `<tr><td class="ps-3">${toLowElement}</td><td>${wordsData.data[toLowElement]}</td></tr>`;
                }
            });
        
        } else {
            // all words
            Object.keys(wordsData.data).forEach(element => {
                let toLowElement = element.toLowerCase();
                drawText += `<tr><td class="ps-3">${toLowElement}</td><td>${wordsData.data[toLowElement]}</td></tr>`;
            });
        }

        drawText += `</table>`;
        this.wordsDataDiv.innerHTML = drawText;
    }

    // add events
    addEvents = () => {
        this.logo.addEventListener('click', () => {
            location.reload();
        });
        
        this.startButton.addEventListener('click', () => {
            if (this.questionNumberInput.value > 0 && this.questionNumberInput.value <= 100) {
                
                this.mode = this.getRadioValue();
                this.questionNumber = this.questionNumberInput.value;
                this.wordsDataList = this.questionListMake();
                
                if (this.start) {
                    this.questionDraw();
                    this.divSwitch(true);
                }

            } else {
                this.message.innerHTML = 'There should be at least 1 question.<br> There can be a maximum of 100 questions.';
            }
        });

        this.langButtonInput.addEventListener('click', () => {
            if (this.langSwitch[0] == 0) {
                this.langSwitch = [1, 0];
                this.langButtonInput.innerHTML = "hu-en".toLocaleUpperCase();
            } else {
                this.langSwitch = [0, 1];
                this.langButtonInput.innerHTML = "en-hu".toLocaleUpperCase();
            }
        });
        
        this.seeButton.addEventListener('click', () => { this.seeWord(); });
        this.input.addEventListener('keypress', (e) => { if (e.keyCode === 13) { this.seeWord(); } });
        this.nextButton.addEventListener('click', () => { this.nextWord(); });
        
        this.soundSwitch.addEventListener('click', () => {
            if (loadSounds.soundSwitch) {
                loadSounds.soundSwitch=false;
                this.soundSwitch.src = "img/volume-off.svg";
            } else {
                loadSounds.soundSwitch=true;
                this.soundSwitch.src = "img/volume-on.svg";
            }
        });

        this.wordsButton.addEventListener('click', () => { 
            this.wordsDiv.style.display = 'block';
            this.optionsDiv.style.display = 'none';
            this.searchWord(); // first see
        });

        // search inputs en and hu
        for (let searchInput of this.searchWordInputsAll) {
            searchInput.addEventListener('keyup', () => {
                this.searchWord();
            });
        }
    }
}

// start
const loadSounds = new LoadSounds();
const wordsData = new LoadData('md-words.json');
const translater = new Engine();