const print = io => console.log(io);
const error = error => console.error(error);
const warn = warn => console.warn(warn);
const count = title => console.count(title);
const clear = () => console.clear();
const timeStart = title => console.time(title);
const timeEnd = title => console.timeEnd(title);
const replaceUrl = (title, url) => url.replace('query', title);
const resetContainer = (id, list) => removeChildsNode(id, list);
const getMulti = (query) => document.querySelectorAll(query);
const getSingle = (query) => document.querySelector(query);
const create = (type) => document.createElement(type);
const txt = (text) => document.createTextNode(text);
const has = (obj, prop) => obj.hasOwnProperty(prop);
const changeURL = (url) => window.history.pushState("Test", "API", url);
const toBit = (value) => typeof (value) === 'number' ? value.toString(2) : value.split('').map((char) => char.charCodeAt(0).toString(2)).join('');
const listener = (e) => JSON.parse(fmt('{"%": "%"}', [e.key, e.keyCode]));
const eql = (str_1, str_2) => typeof (str_1) == 'string' ? str_1.toLowerCase() == str_2.toLowerCase() : str_1 == str_2;
const searchIsEmpty = () => document.location.search.length == 0;


const ping = (URL) =>  {
    return new Promise(resolve => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(true);
            } 
            else if(this.readyState == 4 && this.status != 200) resolve(false);
        };
        xhttp.open("GET", URL, true);
        xhttp.timeout = 1000;
        xhttp.send();
    });
}

const ajax = {
    get: (URL) => {
        return new Promise(resolve => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    print(this);
                    resolve(JSON.parse(this.responseText));
                } 
                else if(this.readyState == 4 && this.status != 200) resolve(this.responseText);
            };
            xhttp.open("GET", URL, true);
            xhttp.timeout = 2000;
            xhttp.send();
        });
    },
    post: (URL, PARAMS) => {
        return new Promise(resolve => {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    resolve(this.responseText);
                } 
                else if(this.readyState == 4 && this.status != 200) resolve(this.responseText);
            };
            xhttp.open("POST", URL, true);
            xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhttp.setRequestHeader("Access-Control-Allow-Headers", "X-PINGOTHER");
            xhttp.setRequestHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.setRequestHeader("Data-Type", "application/json");
            xhttp.send(PARAMS);
        });
    }
}


const range = (start, end) => {
    let aux = [];
    for (let i = start; i < end; i++) aux.push(i);
    return aux;
}

//generateIntervalString(somenode, 'Esto es una prueba', 100);
const generateIntervalString = (node, str, interval) => {
    if (!node) {
        warn('Element passed is not a valid element!');
        return;
    }

    try {
        const maxInterval = str.length;
        node.innerText = '';

        let increment = 0;

        const doThing = () => {
            str.length == increment ? clearInterval(ival) : node.innerHTML += str[increment];
            increment++;
        };

        let ival = setInterval(doThing, interval);
    } catch (e) {
        warn('Something went wrong!\n' + e.message);
    }
}

function similarity(a, b) {
    try {
        let equivalency = 0;
        let minLength = (a.length > b.length) ? b.length : a.length;
        let maxLength = (a.length < b.length) ? b.length : a.length;
        for (let i = 0; i < minLength; i++) a[i] == b[i] ? equivalency++ : 0;

        return ((equivalency / maxLength) * 100);
    } catch (e) {
        warn('Can\'t process similarity!');
    }
}

function findAll(arr, search) {
    if (Array.isArray(arr) && arr.includes(search)) {
        let results = [];

        arr.filter((x, i) => {
            if (x == search) {
                results.push(i);
            }
        });
        return results;
    }
    return [];
}

const numberAcotation = (n) => {
    if (!n.toString().includes('+') || !n.toString().length > 14) {
        const len = n.toString().length;
        if (len < 4) return n;
        return fmt('%k', [n.toString().substring(0, len - 3)]);
    }

    return -1;
}

/* document.body.appendChild( 
        await createDOMElement('a', 'Go to home', {
            class: 'link', 
            target: '_blank', 
            id: 'title-link', 
            href: window.location.pathname
        }, {
            click: (e) => fmt('You have clicked on this link: %', [e.currentTarget.href], true)
        }) 
    );
*/
const createDOMElement = (tag, text, attributes, evts) => {
    return new Promise(resolve => {
        var e = create(tag);

        if (text) e.appendChild(txt(text));

        for (var a in attributes) e.setAttribute(a, attributes[a]);
        for (var evt in evts) e.addEventListener(evt, evts[evt]);

        resolve(e);
    });
}

const getJSONUrl = (str) => {
    return new Promise(resolve => {
        let aux = {};
        if (typeof (str) === 'string' && str.length > 1) {
            const URL_OBJECT = new URL(str) ? new URL(str) : null;
            for (const i of new URLSearchParams(URL_OBJECT.search)) {
                aux[i[0]] = i[1];
            }
        }
        resolve(aux);
    });
};

const fmt = (text, items, on = false, term = '%') => {
    if (items.length > 0) {
        items.forEach(x => {
            if (text.includes('%20') && term == '%') {
                error('You\'re using encoded string with the replacement term of %');
                warn('Consider changing the term or use another function and not fmt()');
                return;
            }
            text = text.replace(term, x);
        });
        on ? print(text) : null;
        return text;
    }
    return;
};

/*
node: Single node
save: Multiple nodes for delete exception
*/
function removeChildsNode(node, save) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    save && (save.length > 0) ? save.forEach(x => node.appendChild(x)) : null;
}

const selectIndexFromURL = (value, node) => {
    for (let i of node.options) {
        if (i.value == value) {
            node.options[i.index].selected = true;
            return;
        }
    }
}


function gestureRL(){
    startMove = -1;
    endMove = -1;

    document.body.addEventListener('touchmove', (e) => {
        endMove = e.touches[0].clientX;
        
        if((startMove - endMove) > 100){
            getSingle('#next').click();
        }else if((startMove - endMove) < -100){
            getSingle('#back').click();
        }
    });

    document.body.addEventListener('touchstart', (e) => {
        startMove = e.touches[0].clientX;
    });
}

function gestures(left=null, right=null){
    startMove = -1;
    endMove = -1;

    document.body.addEventListener('touchmove', (e) => {
        endMove = e.touches[0].clientX;
        
        if(right && (startMove - endMove) > 100){
            window.location.replace(right);
        }else if(left && (startMove - endMove) < -100){
            window.location.replace(left);
        }
    });

    document.body.addEventListener('touchstart', (e) => {
        startMove = e.touches[0].clientX;
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
      alert("Welcome again " + user);
    } else {
      user = prompt("Please enter your name:", "");
      if (user != "" && user != null) {
        setCookie("username", user, 365);
      }
    }
  }