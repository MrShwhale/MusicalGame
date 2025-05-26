// ADD A KEY THAT MAPS NUMBER TO SONG TITLE INSTEAD OF BEING GOOD AT AUTOCOMPLETE
// YOU CAME UP WITH THIS ALL ALONE AND IT'S A BANGER
console.log("Loading...")
function updateAll(json) {
    // Update header
    document.getElementById('musical').innerText = json.musical;
    // Update line
    document.getElementById('line').innerText = json.line;
    // Update autocomplete
    songs = json.songs;
    songs.forEach(element => {
        return element.replaceAll(" ", "&nbsp;")
    });
    // Update list
    document.getElementById('songlist').innerHTML = `<p>${songs.join("|")}</p>`;
}

async function make_guess(e) {
    let guess = document.getElementById('guess-input').value;
    guess = guess.length == 0 ? " " : guess;
    document.getElementById('guess-input').value = "";
    const url = document.URL + `api/line?guess=${guess}`;
    const encoded = encodeURI(url);
    try {
        const response = await fetch(encoded);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        updateAll(json)
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}

document.getElementById('guess').addEventListener("click", make_guess);

document.getElementById('give-up').addEventListener("click", async function (e) {
    document.getElementById('guess-input').value = "";
    const url = document.URL + "api/give_up";
    const encoded = encodeURI(url);
    try {
        const response = await fetch(encoded);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        updateAll(json)
        console.log(json);
        console.log("It was: ", json["old_name"]);
    } catch (error) {
        console.error(error.message);
    }
});

var songs = [];
var selected = 0;
// Stolen from <https://www.geeksforgeeks.org/javascript-auto-complete-suggestion-feature/>
function ac(value) {
    // Setting datalist empty at the start 
    // of function. If we skip this step, 
    // same name will be repeated
    document.getElementById('datalist').innerHTML = '';
    let count = songs.length;

    value = value.originalTarget.value;

    // Input query length
    let length = value.length;

    for (let i = 0; i < count; i++) {
        if (((songs[i].toLowerCase()).indexOf(
        value.toLowerCase())) > -1) {
            let node = document.createElement("option");
            // HERE IS WHERE YOU ADD THE EVENTLISTENERS
            let val = document.createTextNode(songs[i]);
            node.appendChild(val);

            document.getElementById("datalist")
                .appendChild(node);
        }
    }
}
document.addEventListener('keyup', ac);

function closeAc() {
    document.activeElement.blur();
    document.getElementById('datalist').innerHTML = '';
    selected = 0;
}

document.addEventListener('keyup', (e) => {
    console.log("document", e)
    console.log("selected", selected)
    console.log("songs", songs)
    if (e.code === "ArrowUp") {
        selected -= 1;
        if (selected < 0) {
            selected = songs.length - 1;
        }
        else if (selected >= songs.length) {
            selected = 0;
        }
    }
    else if (e.code === "ArrowDown") {
        selected += 1;
        if (selected < 0) {
            selected = songs.length - 1;
        }
        else if (selected >= songs.length) {
            selected = 0;
        }
    }
    else if (e.code === "Enter") {
        if (document.getElementById("datalist").innerHTML) {
            document.getElementById('guess-input').value = document.getElementById("datalist").children.item(selected).innerHTML;
            closeAc();
        }
        else {
            make_guess();
        }
    }

    for (const option of document.getElementById("datalist").children) {
        option.classList.remove("selected");
    }
    document.getElementById("datalist").children.item(selected).classList.add("selected");
});

// document.addEventListener('mouseup', closeAc);

(async() => {

    // Load the thing up
    const url = document.URL + `api/line`;
    const encoded = encodeURI(url);
    console.log(encoded);
    try {
        const response = await fetch(encoded);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        updateAll(json)
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
})();
