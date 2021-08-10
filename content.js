//Can go back to using mutation observer for inset but add a time limiter for how many times it can be accessed?

//Fixed dynamic update issue, now just need to clean everything up and implement user preferences

//fixed issue that caused two instances of this script from running initially (from concept script reload and background trigger)
//Still issue where subs dont always show
//it's hard to reproduce the bug though. So far it seems like what happens when you go from a video with display subs immediately to one without (in betwee lines), the subs ARE injected but not display somehow
//Found out it's because the extensions created container is being made too early and it copies the wrong style properties. Fixed it by making waitforelement wait for actual text to show before doing anything but this causes
//a visible 1 second delay on the first message.. this is fine for now tbh

//Mostly done with preferences, considering doing distance slider instead of text side. Also, a font size for original subs
//Added distance slider, might want to add font size for original text as well
//Removed Distance slider.. for some reason getBoundingClientRect is not consistent. dont think this option is necessary though so I'm gonna remove it for now

console.log("New page!.. Waiting for captions");

window.initialFlag=1;
chrome.extension.sendMessage({"message": "prevent_waitfor"});



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
    chrome.storage.sync.get(setting,function(data){
        console.log("Fetching User Preference: " + setting);
        console.log("FETCHED: "+data[setting]);
        
        if (setting === "font_multiplier"){
            window.current_multiplier = parseFloat(data[setting]);
            console.log("Retrieved Font Multiplier From Storage: ",window.current_multiplier);
        }
        /*else if (setting === "sub_distance"){
            window.sub_distance= data[setting];
            console.log("Retrieved Sub Distance From Storage: ",window.sub_distance);
        }*/
        else if (setting === "text_color"){
            window.text_color = data[setting];
            //document.getElementsByName("llsubsb2")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
            //document.getElementsByName("llsubsb1")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
            //console.log("Retrieved Font Multiplier From Storage: ",window.text_color);
        }
        else if (setting === "opacity"){
            window.opacity = data[setting];
            console.log("Retrieved Opacity From Storage: ",window.opacity);
        }
        else{
            console.log("Setting: ", setting, " Does Not Exist");
        }

    });
}

function wait_for_player(){
    waitForElement("#appMountPoint > div > div > div:nth-child(1) > div > div > div.nfp.AkiraPlayer > div > div.VideoContainer > div > div > div > div").then(function(element) {
    console.log("Netflix Player Detected!");
   
    console.log("Starting Script");
    //getSetting('font_multiplier');
    //getSetting('left_or_right');
    getSetting('text_color');
    getSetting('opacity');
    getSetting('font_multiplier');
    //getSetting('sub_distance'); inconsistent functionality for some reason.. but I don't think people would need this option anyways so I'll disable for now
    llsubs();
    
});
}
wait_for_player();
function llsubs(){
    var id = "player-timedtext";

    const timedtext = document.getElementsByClassName(id)[0];

    //My container creation
    window.mysubs = timedtext.cloneNode();
    mysubs.setAttribute('class','mysubscontainer');
    timedtext.parentNode.appendChild(mysubs);
    //

    window.cleared=1; //Prevents constant refresh from original sub container from happening in my container 

    window.config = { attributes: true, childList: true, subtree:true};

    //Enables right click
    var elements = document.getElementsByTagName("*");
    for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }
    //

    const callback = function(mutationsList, observer){
        for (const mutation of mutationsList){
            if (mutation.type === 'childList' && mutation.target.className && mutation.target.className==="player-timedtext"){ //Observes removal/addition to subtitle container
                
                if (mutation.addedNodes.length===1){ //If added rather than removed..

                    this.disconnect(); //stop observer so I can add subs without triggering this infinitely
                    addSubs(timedtext); //add subs

                }
                else{
                
                    if (mutation.target.childElementCount===0){ //No children means the mutation was a subtitle CLEAR rather than refresh, double check necessary because refresh would make it here as well but with children
                        window.cleared=1;
                    }
                    while (mysubs.firstChild){ //clear my container (Netflix script does this anyways ? might not need)
                        mysubs.removeChild(mysubs.firstChild);
                    }
                }
                
                
            }
        }
    };

    window.observer = new MutationObserver(callback);

    window.observer.observe(timedtext,window.config);
}

const addSubs = function(caption_row){ 

    if(caption_row.firstChild!=null){// && (window.recent_add == 0 && window.cleared==1)){ // Ensures Subs were added rather than removed, probably redundant
        
        caption_row.firstChild.setAttribute('style','display: inline; text-align: center; position: absolute; left: 5%; bottom: 10%;'); // move original to left 
        

        if (window.cleared === 1){ //If CLEARED subs recently, pull new subs, store, display

            window.stored_subs = caption_row.firstChild.cloneNode(true);
            stored_subs.setAttribute('class','mysubs');
            stored_subs.setAttribute('translate','yes');
            //window.baseOffset = parseInt(caption_row.firstChild.firstChild.getBoundingClientRect().right);
            var current_dist = parseInt(caption_row.firstChild.getBoundingClientRect().right)+20;
            console.log(caption_row.firstChild.getBoundingClientRect().right);
            stored_subs.setAttribute('style',`display: block;text-align: center; position: inherit; left: ${current_dist+'px'} ;bottom: 10%;`); //Room here for User Preference "Distance between subs"  
            mysubs.style.inset=caption_row.style.inset; //Better to do this than mutation observer catching EVERY attribute change (which is ALOT)
            mysubs.appendChild(stored_subs);
            window.baseFont = parseFloat(stored_subs.firstChild.style.fontSize.replace('px','')); //font size changes way easily than on nrk so will take basefont after every clear instead (if change inset update, change this as well)
            console.log("base offset is: ",window.baseOffset);
            window.current_size = window.baseFont*window.current_multiplier+'px';
            update_style('text_color');
            update_style('opacity');
            update_style('font_size');

            
            
            window.cleared=0;
            
        }
        else{// Just a refresh so just place stored instead 
            mysubs.appendChild(stored_subs);
        }

        
        //Finish Modifying Subtitle Row
        
    }

    window.observer.observe(caption_row,window.config);
}

///
function update_style(setting){
    
    const lines = document.getElementsByClassName("mysubs")[0].children; //lines are this elements children
    if (setting === 'font_size'){

        for (var i = 0; i<lines.length;i++){

            lines[i].style["font-size"]=window.current_size;

        }
    }
    if (setting === "text_color"){ 

        for (var i = 0; i<lines.length;i++){

            lines[i].style["color"]=window.text_color;

        }
        //document.getElementsByName("llsubsb2")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);
        //document.getElementsByName("llsubsb1")[0].firstElementChild.firstElementChild.setAttribute('stroke',window.text_color);


    }

    if (setting === "opacity"){

        for (var i = 0; i<lines.length;i++){

            lines[i].style["opacity"]=window.opacity;

        }

    }

    /*if (setting === "sub_distance"){ //Not quite sure how to pick the color yet..
        var test = parseInt(window.baseOffset)+parseInt(window.sub_distance);
        document.getElementsByClassName("mysubs")[0].style.left=test+'px';
        console.log("Set sub distance");
    }
    */

}


chrome.runtime.onMessage.addListener( //Listens for messages sent from background script (Settings Controller)
    function (request, sendRespone, sendResponse){
        
        if (request.message === 'trigger_wait'){
            //console.log("Recieved msg from background to wait for player");
            wait_for_player();
        }
        
        if (request.message==='update_font_multiplier'){
            console.log("Recieved Message from BACKGROUND.JS to CHANGE font_multiplier to " + request.value);
            //updatePreference('font_size',request.value);
            window.current_multiplier=parseFloat(request.value);
            window.current_size=window.baseFont*request.value+'px'
            //StoreSetting('current_size',window.current_size)
            update_style('font_size');
            //ludo_captions = document.getElementsByClassName("ludo-captions");
        }

        /*if (request.message ==='update_sub_distance'){ inconsistent functionality for some reason.. but I don't think people would need this option anyways so I'll disable for now
            console.log("Recieved Message from BACKGROUND.JS to CHANGE side to " + request.value);
            window.sub_distance=parseInt(request.value);
            //StoreSetting('current_size',window.current_size)
            update_style('sub_distance');
        }
        */

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
