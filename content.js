//8-7-21 4:35AM - IT WORKS (kind of)
// RIght now it works if you use the "enable right click" extension to allow for google translate option
// And MAJOR PROBLEM: It flickers. For some reason Netflix constantly refreshes the subtitles, the refresh is fast but noticable when google translate has to work on every refresh
// Distinguish between a refresh and a subtitle change, keep addedSubs onscreen until subtitle change rather than refresh (clear happens when childelementcount === 0)
// Also, the subs have a tendency to overlap during long lines. Could do a font size change but I also want to add a way to drag the added text. Use that script to make it a draggable element.

//Latest Update:
//Made it so the extension creates its own caption container (player-timedtext) and it can properly update and clear at the proper times. BUT a script is STILL making it refresh even..
//Store the translation strings until clear, apply those on refresh, clear stored on sub clear

//IT WORKS PERFECTLY!!!!!!!!!!!!!!!!!!!!!!!!
//Next I need to address spacing 
console.log("New page!.. Waiting for captions");

window.initialFlag=1;



function waitForElement(selector) {
    return new Promise(function(resolve, reject) {
      var element = document.querySelector(selector);
  
      if(element) {
        resolve(element);
        return;
      }

      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var nodes = Array.from(mutation.addedNodes);
          for(var node of nodes) {
            if(node.matches && node.matches(selector)) {
              observer.disconnect();
              resolve(node);
              return;
            }
          };
        });
      });
  
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
}
function getSetting(setting){
    var value;
    chrome.storage.sync.get(setting,function(data){
        console.log("Fetching User Preference: " + setting);
        console.log("FETCHED: "+data[setting]);
        
        if (setting === "font_multiplier"){
            window.current_multiplier = parseFloat(data[setting]);
            window.current_size = window.baseFont*window.current_multiplier+'px';
            console.log("Retrieved Font Multiplier From Storage: ",window.current_multiplier);
            console.log("Before running, the current_size is: ",window.current_size);
        }
        else if (setting === "left_or_right"){
            window.left_or_right = data[setting];
            console.log("Retrieved Font Multiplier From Storage: ",window.left_or_right);
        }
        else if (setting === "text_color"){
            window.text_color = data[setting];
            document.getElementsByName("llsubsb2")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
            document.getElementsByName("llsubsb1")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
            console.log("Retrieved Font Multiplier From Storage: ",window.text_color);
        }
        else if (setting === "opacity"){
            window.opacity = data[setting];
            console.log("Retrieved Font Multiplier From Storage: ",window.opacity);
        }
        else{
            console.log("Setting: ", setting, " Does Not Exist");
        }

    });
}
waitForElement("#appMountPoint > div > div > div:nth-child(1) > div > div > div.nfp.AkiraPlayer > div > div.VideoContainer > div").then(function(element) {
    console.log("Netflix Player Detected!");
   
    console.log("Starting Script");

    llsubs();

    
});



function llsubs(){
    var id = "player-timedtext";
    var slider = document.getElementById("myFontSize");
    window.recent_add=0;
    window.old_text = ["",""];
    const timedtext = document.getElementsByClassName(id)[0];

    window.mysubs = timedtext.cloneNode();
    mysubs.setAttribute('class','MYSUBSBRO')
    timedtext.parentNode.appendChild(mysubs);
    timedtext.style.left='80%';
    window.cleared=1;
    var dupe =timedtext.cloneNode(true);
    dupe.setAttribute('class','TESTSTETSETES');

    window.config = { attributes: true, childList: true, subtree:true};

    const callback = function(mutationsList, observer){
        for (const mutation of mutationsList){
            if (mutation.type === 'childList' && mutation.target.className && mutation.target.className==="player-timedtext"){// && mutation.target.className && mutation.target.className==="player-timedtext") { //Found out I could do the mutation.target === stuff really late so there might be some of the checks add_subs could be redundant
                //console.log('A child node has been added or removed.');
                
                //console.log("Mutation Observed");
                if (mutation.addedNodes.length===1){
                    //window.cleared=0;
                    this.disconnect();
                    //console.log("Added Nodes");
                    //console.log(mutation.addedNodes[0].className);
                    
                    addSubs(timedtext);
                    console.log("ADDED TARGET: ",mutation.target);
                }
                else{
                    console.log("Removed Nodes");
                    console.log(mutation);
                    console.log("Children: ",mutation.target.childElementCount); // When this is ZERO it was a CLEAR
                    if (mutation.target.childElementCount===0){
                        window.cleared=1;
                    }
                    while (mysubs.firstChild){
                        mysubs.removeChild(mysubs.firstChild);
                    }
                }
                
                
            }
           
        }
    };

    window.observer = new MutationObserver(callback);

    window.observer.observe(timedtext,window.config);
}

const addSubs = function(caption_row){ // COPY AND PLACEMENT IS GOOD!

    if(caption_row.firstChild!=null){// && (window.recent_add == 0 && window.cleared==1)){ // Ensures Subs were added rather than removed
        
        caption_row.firstChild.setAttribute('style','display: block; white-space: nowrap; text-align: center; position: absolute; left: 1%; bottom: 10%;'); // move original to left

        if (window.cleared === 1){ //If cleared subs recent, pull new subs, store, display

            window.stored_subs = caption_row.firstChild.cloneNode(true);
            stored_subs.setAttribute('class','mysubs');
            stored_subs.setAttribute('translate','yes');
            stored_subs.setAttribute('style','display: block;white-space: nowrap;text-align: center; position: absolute; right: 1%;bottom: 10%;');
            mysubs.appendChild(stored_subs);
            window.cleared=0;
        }
        else{// not cleared so just place 
            mysubs.appendChild(stored_subs);
        }
        //var current_span = caption_row;
        //console.log(current_span.getAttribute('style'));
        //current_span.firstChild.setAttribute('style','display: block; white-space: nowrap; text-align: center; position: absolute; left: 1%; bottom: 10%;'); // move original to left
        //var new_span = current_span.firstChild.cloneNode(true); //Clone actually sub element
        //new_span.setAttribute('class','MYSUBS!!!!');
        //new_span.setAttribute('translate','yes'); //modify so it's translatable
        //new_span.setAttribute('style','display: block; white-space: nowrap; text-align: center; position: absolute; right: 1%; bottom: 10%;')
        //mysubs.appendChild(new_span);
        
        //Finish Modifying Subtitle Row
        
    }
    else{
        console.log("DONT ADD SUBS");
        window.old_text=["",""]; //clear old_text since subtitle row was removed, otherwise this would not work when a character repeats something
        
    }

    window.observer.observe(caption_row,window.config);
}

function update_style(setting){ //This just applies stored values, update preference should just change stored values
    //default style="font-size: 0.898472rem; bottom: 5%; padding-left: 2%;color:yellow"
    //console.log("Update Element: ",element);
    
    const lines = document.getElementsByClassName("ludo-captions__line");

    if (setting === 'font_size'){

        for (var i = 0; i<lines.length;i++){
            console.log(lines[i]);
            lines[i].children[0].style["font-size"]=window.current_size;
            lines[i].children[1].style["font-size"]=window.current_size;

        }
        //console.log("Hmm..");
        console.log("Updated Lines");
    }
    if (setting === "text_color"){ //Not quite sure how to pick the color yet..

        for (var i = 0; i<lines.length;i++){
            console.log(lines[i]);
            if (window.left_or_right == 0){
                lines[i].children[1].style["color"]=window.text_color;
            }
            else{
                lines[i].children[0].style["color"]=window.text_color;
            }

        }
        document.getElementsByName("llsubsb2")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
        document.getElementsByName("llsubsb1")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
        //$("[name=llsubsb2]").children.style["stroke"]=window.text_color;


    }

    if (setting === "opacity"){ //Not quite sure how to pick the color yet..

        for (var i = 0; i<lines.length;i++){
            console.log(lines[i]);
            if (window.left_or_right == 0){ //Original Text Side Left
                //lines[i].children[0].style["opacity"]=window.opacity;
                console.log("Original Text is on LEFT, changing children[1] See: ",window.left_or_right);
                lines[i].children[1].style["opacity"]=window.opacity;
            }
            else{
                console.log(window.left_or_right);
                lines[i].children[0].style["opacity"]=window.opacity;
                //lines[i].children[1].style["opacity"]=window.opacity; 
            }

        }


    }

    if (setting === "text_side"){ //Not quite sure how to pick the color yet..
        for (var i = 0; i<lines.length;i++){
            //console.log(lines[i].childList);
            lines[i].appendChild(lines[i].children[0]) //https://stackoverflow.com/questions/7742305/changing-the-order-of-elements
            // It works BUT it triggers the observer...
            //lines[i].children[1].style["color"]=window.current_size;

        }
    }

}


chrome.runtime.onMessage.addListener( //Listens for messages sent from background script (Settings Controller)
    function (request, sendRespone, sendResponse){
        
        if (request.message==='update_font_multiplier'){
            console.log("Recieved Message from BACKGROUND.JS to CHANGE font_multiplier to " + request.value);
            //updatePreference('font_size',request.value);
            window.current_multiplier=parseFloat(request.value);
            window.current_size=window.baseFont*request.value+'px'
            //StoreSetting('current_size',window.current_size)
            update_style('font_size');
            //ludo_captions = document.getElementsByClassName("ludo-captions");
        }

        if (request.message ==='update_text_side'){
            console.log("Recieved Message from BACKGROUND.JS to CHANGE side to " + request.value);
            window.left_or_right=parseInt(request.value);
            //StoreSetting('current_size',window.current_size)
            update_style('text_side');
        }

        if (request.message ==='update_text_color'){
            console.log("Recieved Message from BACKGROUND.JS to CHANGE color to " + request.value);
            window.text_color=request.value;
            //StoreSetting('current_size',window.current_size)
            update_style('text_color');
        }

        if (request.message ==='update_opacity'){
            console.log("Recieved Message from BACKGROUND.JS to CHANGE opacity to " + request.value);
            window.opacity=parseFloat(request.value);
            //StoreSetting('current_size',window.current_size)
            update_style('opacity');
        }
});
