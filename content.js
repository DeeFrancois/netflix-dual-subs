//Basically works well enough now, just need to do the user preferences
//oh wait, need to figure out how to enable right click on netflix
//There's a problem where the translations don't always show up without refreshing
//Also maybe figure out how to request from google translate directly so it doesn't need the browser to do the translations
//Can go back to using mutation observer for inset but add a time limiter for how many times it can be accessed?

//Fixed Right Click but found new issue. Netflix page updates dynamically which prevents content script from running when changing videos (until refresh), add event listener for url change in background js, trigger a call to waitforelement
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
    mysubs.setAttribute('class','mysubscontainer')
    timedtext.parentNode.appendChild(mysubs);
    //timedtext.style.left='80%';
    window.cleared=1;
    var dupe =timedtext.cloneNode(true);
    dupe.setAttribute('class','TESTSTETSETES');

    window.config = { attributes: true, childList: true, subtree:true};

    var elements = document.getElementsByTagName("*");
    for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }
    
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
                    //console.log("ADDED TARGET: ",mutation.target);
                }
                else{
                    //console.log("Removed Nodes");
                    //console.log(mutation);
                    //console.log("Children: ",mutation.target.childElementCount); // When this is ZERO it was a CLEAR
                    if (mutation.target.childElementCount===0){
                        window.cleared=1;
                    }
                    while (mysubs.firstChild){
                        mysubs.removeChild(mysubs.firstChild);
                    }
                }
                
                
            }
            //else if(mutation.type === 'attributes' && mutation.target.className ==="player-timedtext" && mutation.attributeName === "style"){
            //    //console.log(mutation);
            //    mysubs.style.inset=timedtext.style.inset;
            //    //mysubs.style.fontSize = timedtext.style.fontSize;
            //    //mysubs.setAttribute('style',timedtext.getAttribute('style'));
            //}
        }
    };

    window.observer = new MutationObserver(callback);

    window.observer.observe(timedtext,window.config);
}

const addSubs = function(caption_row){ // COPY AND PLACEMENT IS GOOD!

    if(caption_row.firstChild!=null){// && (window.recent_add == 0 && window.cleared==1)){ // Ensures Subs were added rather than removed
        
        caption_row.firstChild.setAttribute('style','display: inline; text-align: center; position: absolute; left: 5%; bottom: 10%;'); // move original to left
        //console.log(caption_row.firstChild.getBoundingClientRect());
        

        if (window.cleared === 1){ //If cleared subs recent, pull new subs, store, display

            window.stored_subs = caption_row.firstChild.cloneNode(true);
            stored_subs.setAttribute('class','mysubs');
            stored_subs.setAttribute('translate','yes');
            stored_subs.setAttribute('style',`display: block;text-align: center; position: inherit; left: ${caption_row.firstChild.getBoundingClientRect().right+10+'px'} ;bottom: 10%;`); //Room here for User Preference "Distance between subs"
             
            stored_subs.firstChild.style.color='yellow';
            if (stored_subs.childElementCount>1){
                stored_subs.children[1].style.color='yellow';
            }
            mysubs.style.inset=caption_row.style.inset; //Better to do this than mutation observer catching EVERY attribute change (which is ALOT)
            mysubs.appendChild(stored_subs);
            window.cleared=0;
            
        }
        else{// not cleared so just place 
            mysubs.appendChild(stored_subs);
        }

        
        //Finish Modifying Subtitle Row
        
    }

    window.observer.observe(caption_row,window.config);
}

///
function update_style(setting){
    
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
