// We are going to animate the poem
// Making one span at a time appear
// triggering the onmouseover event, 
// then the onmouseout event
// render as normal but let display = none

function getSubstring(str, start, end) {
    let substr;
    if(end === undefined) {
        substr = str.substring(start);
    } else {
        substr = str.substring(start, end);
    }
    return substr.replace(/ /g, "&nbsp;");
}

function renderPoem(data, imgs) {
    document.body.style.backgroundImage = "url(" + imgs["1"] + ")";
    // assume an object called data exists with
    // { title, by, poem, glossary }
    // where poem is an array of strings
    // glossary has the form { "1": [ [start, end,  "word", "definition" ] ] }

    // assume a container element exists with id="poem"
    // Each line of the poem should be wrapped in a <p class="line"></p> element
    // span constructed as follows:
    let poemContainer = document.getElementById("poem");
    let poemTextContainer = poemContainer.querySelector("#text");
    let title = poemContainer.querySelector("#title")
    let by = poemContainer.querySelector("#by")
    title.innerHTML = data.title;
    by.innerHTML = 'BY '+ "<a href=" + data.by_url +">" + data.by + "</a>"
    let elems = [title, by];
    let mouseoverEvents = {};
    let mouseoutEvents = {};

    elems.forEach((el) => {
        mouseoverEvents[el.id] = function() {
            let backgroundImgStyle = "url(" + imgs["1"] + ")";
            if(document.body.style.backgroundImage !== backgroundImgStyle){
                document.body.style.backgroundImage = backgroundImgStyle;
            }
        }
    })

    poemTextContainer.innerHTML = "";
    let glossContainer = document.createElement("div");
    glossContainer.classList.add("gloss");
    document.body.appendChild(glossContainer);
    glossContainer.style.display = "none";
    glossContainer.style.position = "fixed";
    data.poem.forEach((line, lineId) => {
        let i = lineId + 1;
        let lineContainer = document.createElement("div");
        lineContainer.classList.add("line");
        
        // let lineOuter = document.createElement("div");
        // lineOuter.classList.add("line-outer");
        // poemTextContainer.appendChild(lineOuter);

        if((""+i) in data.glossary) {
            let gloss = data.glossary[i];
            if(gloss.length > 0 && gloss[0][0] > 0) {
                let span = document.createElement("span");
                span.innerHTML = getSubstring(line, 0, gloss[0][0]);
                lineContainer.appendChild(span);
            }
            gloss.forEach((glossaryItem, idx) => {
                let [start, end, term, definition] = glossaryItem;
                let span = document.createElement("span");
                span.innerHTML = getSubstring(line,start, end);
                span.classList.add("tooltip");
                span.id = 'line-' + i + '' + start + '-' + end;

                let associatedImg;
                let j, j2Str;
                // go backwards through the glossary to find the first image
                for(j = lineId; j >= 0; j--) {
                    j2Str = (j + 1) + "";
                    if(j2Str in imgs) {
                        associatedImg = imgs[j2Str];
                        break;
                    }
                }
                
                mouseoverEvents[span.id] = function() {
                    if(!span.classList.contains("highlight")) span.classList.add("highlight");
                    glossContainer.innerHTML = definition;
                    let backgroundImgStyle = "url(" + associatedImg + ")";
                    if(document.body.style.backgroundImage !== backgroundImgStyle){
                        document.body.style.backgroundImage = backgroundImgStyle;
                    }
                    // move glossContainer to the right of the span
                    let rect = lineContainer.getBoundingClientRect();
                    let spanRect = span.getBoundingClientRect();
                    glossContainer.style.left = rect.right + "px";
                    glossContainer.style.top = spanRect.top + "px";
                    glossContainer.style.display = "block";
                    glossContainer.style.maxWidth = lineContainer.offsetWidth - spanRect.left + "px";

                    
                }
                mouseoutEvents[span.id] = function() {
                    span.classList.remove("highlight");
                    glossContainer.innerHTML = "";
                    glossContainer.style.display = "none";
                }
                lineContainer.appendChild(span);
                // add the next block from end to next start if not last block
                if(idx < (gloss.length - 1)) {
                    let span2 = document.createElement("span");
                    // replace spaces with &nbsp;
                    span2.innerHTML = getSubstring(line, end, gloss[idx + 1][0])
                    lineContainer.appendChild(span2);
                }
            })
            if (gloss.length > 0 && gloss[gloss.length - 1][1] < line.length) {
                let span = document.createElement("span");
                span.innerHTML = getSubstring(line, gloss[gloss.length - 1][1])
                lineContainer.appendChild(span);
            }

            
        } else {
            lineContainer.classList.add("line");
            lineContainer.innerHTML = line;
        }

        // lineOuter.appendChild(lineContainer);
        // lineOuter.appendChild(glossContainer);
        // lineOuter.style.height = lineContainer.offsetHeight + "px";
        poemTextContainer.appendChild(lineContainer);

    });

    
    
    // hide all spans
    // redefine onmouseover and onmouseout as separate functions
    // they will not be active when animation is running
    // but the functions can be called from the animation
    // make an object that maps the span id to the onmouseover and onmouseout functions


    // At the start no events are active
    // After play is done, all events are active
    // If play is clicked again, all events are removed
    
    // Assume a button with id="play" exists

    let spans = document.querySelectorAll(".line span");
    let playButton = document.getElementById("play");
    playButton.onclick = animate;

    function addGlossEvents() {
        for(let elemIdx in mouseoverEvents) {
            let elem = document.getElementById(elemIdx);
            elem.onmouseover = mouseoverEvents[elemIdx];
            elem.onmouseout = mouseoutEvents[elemIdx];
            if(elem.tagName==="SPAN") {
                elem.classList.add("dotted");
            }
        }
    }

    function removeGlossEvents() {
        for(let elemIdx in mouseoverEvents) {
            let elem = document.getElementById(elemIdx);
            elem.onmouseover = null;
            elem.onmouseout = null;
            if(elem.tagName==="SPAN") {
                elem.classList.remove("dotted");
            }
        }
    }

    let currentSpanIdx = 0;
    let timeOut;
    let timeOutTime = 1000;

    function pauseAnimation() {
        clearTimeout(timeOut);
        // play emoji
        playButton.innerHTML = '<i class="fa fa-play"></i>';
        playButton.onclick = animate;
    }

    function animate() {
        
        if(currentSpanIdx === 0) {
            // let by = document.querySelector("#by");
            // by.style.display = "none";
            // scroll to top
            window.scrollTo(0, 0);
            
            // spans.forEach(span => {
            //     if (span.parentElement.style.display !== "none") {
            //         span.parentElement.style.display = "none";
            //     }
                // if (span.style.display !== "none") {
                //     span.style.display = "none";
                // }
            // });
            playButton.innerHTML = '<i class="fa fa-pause"></i>';
            removeGlossEvents();
            playButton.onclick = pauseAnimation;

            // currentSpanIdx++;
            // timeOut = setTimeout(() => {
            //     by.style.display = "block";
            //     window.scrollBy(0, 5);
            //     animate();
            // }, timeOutTime);

            // return;
        }

        let currentSpan = spans[currentSpanIdx];
        // if (currentSpan.parentElement.style.display === "none") {
        //     currentSpan.parentElement.style.display = "block";
        // }
        // currentSpan.style.display = "inline";
        

        
        let mouseoverEvent = null;
        let mouseoutEvent = null;
        if(currentSpan.classList.contains("tooltip")) {
            currentSpan.classList.add("highlight");
            mouseoverEvent = mouseoverEvents[currentSpan.id];
            mouseoutEvent = mouseoutEvents[currentSpan.id];
        }
        if(mouseoverEvent !== null) mouseoverEvent();
        

        if(currentSpanIdx === spans.length - 1) {
            currentSpanIdx = 0;
            playButton.onclick = null;
            timeOut = setTimeout(() => {
                if (mouseoutEvent !== null) mouseoutEvent();
                addGlossEvents();
                playButton.innerHTML = "<i class='fa fa-play'></i>";
                playButton.onclick = animate;
            }, timeOutTime);
            
        } else {
            currentSpanIdx++;

            if(timeOut !== undefined) clearTimeout(timeOut);
            
            timeOut = setTimeout(() => {
                // gradually scroll down
                window.scrollBy(0, 5, "smooth");

                if (mouseoutEvent !== null) mouseoutEvent();
                animate();
            }, timeOutTime);
        }

    }

}

window.onload = function() {
    renderPoem(data, imgs);
}