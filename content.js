//After release I can think about adding original text size/color and sub_distance options

//Life Before Death, Strength Before Weakness, Journey Before Destination

//<button class="touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerBackTen" tabindex="0" role="button" aria-label="Seek Back">
//<svg class="svg-icon svg-icon-nfplayerBackTen" focusable="false"><use filter="" xlink:href="#nfplayerBackTen"></use></svg></button>

//MAJOR BUG: Multiple instances are created when going from a video --> search bar --> new video
//Figure out how to ensure only one instance is ever running

//fixed bug by making content script only ever ran by background.js calls which are triggered everytime the url changes to netflix.com/watch/...
//may need to find the "best practice" way to do it before release otherwise it probably wont get accepted by chrome store reviewer
//new problem, direct linking to video doesn't trigger historystateupdate..

//ACTUALL FIXED THIS TIME, had to change the structure so that content.js is only ever called using tabs.executeScript

window.initialFlag=0;
//chrome.extension.sendMessage({"message": "prevent_waitfor"});

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
        //console.log("Fetching User Preference: " + setting);
        //console.log("FETCHED: "+data[setting]);
        if (setting === "on_off"){
            window.on_off = data[setting];
            if (!window.on_off){
                document.getElementById("mybuttonDec").parentElement.style.display='none';
                document.getElementById("myButtonInc").parentElement.style.display='none';
            }
            else{
                document.getElementById("mybuttonDec").parentElement.style.display='block';
                document.getElementById("myButtonInc").parentElement.style.display='block';
            }
            
        }
        else if (setting === "font_multiplier"){
            window.current_multiplier = parseFloat(data[setting]);
            //console.log("Retrieved Font Multiplier From Storage: ",window.current_multiplier);
        }
        /*else if (setting === "sub_distance"){
            window.sub_distance= data[setting];
            console.log("Retrieved Sub Distance From Storage: ",window.sub_distance);
        }*/
        else if (setting === "text_color"){
            window.text_color = data[setting];
            document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
            document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);
            //console.log("Retrieved Font Multiplier From Storage: ",window.text_color);
        }
        else if (setting === "opacity"){
            window.opacity = data[setting];
            //console.log("Retrieved Opacity From Storage: ",window.opacity);
        }
        else{
            //console.log("Setting: ", setting, " Does Not Exist");
        }

    });
}

function wait_for_player(){
    
    waitForElement("#appMountPoint > div > div > div:nth-child(1) > div > div > div.nfp.AkiraPlayer > div > div.VideoContainer > div > div > div > div").then(function(element) {

        //console.log("Netflix Player Detected!");
        console.log("Starting Subtitle Script");

        getSetting('text_color');
        getSetting('opacity');
        getSetting('font_multiplier');
        getSetting('on_off');
        //getSetting('sub_distance'); disabled for now, unnecessary imo

        //BUTTON STUFF

        const button_row = document.getElementsByClassName("PlayerControlsNeo__button-control-row")[0];

        //Decrease font button

        $(".PlayerControlsNeo__button-control-row").children().eq(3).after("<button class='touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyDecrease PlayerControls--control-element-blurred' tabindex='0' role='button' aria-label='Decrease font size'>\
        <svg viewBox='0 0 24 24' id='mybuttonDec' width='1.500em' height='1.500em' aria-hidden='true' style='display:block;' focusable='false'>\
        <path fill='none' d='m 6.8 12 l 10.4 0 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0' stroke='yellow' stroke-width='2'></path></svg></button>")

        //Increase font button
        $(".PlayerControlsNeo__button-control-row").children().eq(4).after("<button class='touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyIncrease PlayerControls--control-element-blurred' tabindex='0' role='button' aria-label='Increase font size'>\
        <svg viewBox='0 0 24 24' id='myButtonInc' width='1.500em' height='1.500em' aria-hidden='true' style='display:block;' focusable='false'>\
        <path fill='none' d='m 6.8 12 l 10.2 0 M 12 6.8 l 0 10.2 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0' stroke='yellow' stroke-width='2'></path></svg></button>")

        //Listeners for button clicks
        var increase_font_size_button = document.getElementsByClassName("touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyIncrease PlayerControls--control-element-blurred")[0];
        
        increase_font_size_button.addEventListener("click", function() {
        
            window.current_multiplier+=.1;
            //Save Setting here
            chrome.storage.sync.set({"font_multiplier":window.current_multiplier.toFixed(2)}); //Save setting into storage on Change
            window.current_size=window.baseFont*window.current_multiplier+'px';
            update_style('font_size'); //Live Update the setting change

        });

        increase_font_size_button.addEventListener("mouseenter", function(){

            //console.log("Hovering increase button");
            increase_font_size_button.setAttribute('class','touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyIncrease')


        });

        increase_font_size_button.addEventListener("mouseleave", function(){

            //console.log("Left increase button");
            increase_font_size_button.setAttribute('class','touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyIncrease PlayerControls--control-element-blurred');


        });

        var decrease_font_size_button = document.getElementsByClassName("touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyDecrease PlayerControls--control-element-blurred")[0];
        
        decrease_font_size_button.addEventListener("click", function(){

            window.current_multiplier-=.1;
            chrome.storage.sync.set({"font_multiplier":window.current_multiplier.toFixed(2)});
            window.current_size=window.baseFont*window.current_multiplier+'px';
            update_style('font_size');

        });

        decrease_font_size_button.addEventListener("mouseenter", function(){

            //console.log("Hovering decrease button");
            decrease_font_size_button.setAttribute('class','touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyDecrease')


        });

        decrease_font_size_button.addEventListener("mouseleave", function(){

            //console.log("Left decrease button");
            decrease_font_size_button.setAttribute('class','touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyDecrease PlayerControls--control-element-blurred');


        });

        // PlayerControls--control-element-blurred
        // PlayerControls--control-element-active

        llsubs();
    
    });
}


wait_for_player();

function llsubs(){

    //Pull Original Sub Container
    var id = "player-timedtext";
    const timedtext = document.getElementsByClassName(id)[0]; //Original Container

    //My container creation
    window.mysubs = timedtext.cloneNode();
    mysubs.setAttribute('class','mysubscontainer');
    timedtext.parentNode.appendChild(mysubs);
    //For Placement
    window.old_inset = timedtext.style.inset;
    window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.05; //Original text is placed at Left:5%, using .right on original subs wasn't consistent

    window.cleared=1; //Only takes new subs on clear, necessary because subs are constantly refreshed 

    window.config = { attributes: true, childList: true, subtree:true,attributeFilter: [ "style"],
    attributeOldValue: true};

    //Enables right click
    var elements = document.getElementsByTagName("*");
    for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }
    //

    const callback = function(mutationsList, observer){ //Observes original text box for changes
        for (const mutation of mutationsList){
            if (mutation.type === 'childList' && mutation.target.className && mutation.target.className==="player-timedtext"){ //track removal/addition to subtitle container
                
                if (mutation.addedNodes.length===1){ //If added rather than removed..

                    this.disconnect(); //stop observer so I can add subs without triggering this infinitely
                    addSubs(timedtext); //add subs

                }
                else{
                
                    if (mutation.target.childElementCount===0){ //No children means the mutation was a subtitle CLEAR rather than refresh, double check necessary because refresh would make it here as well but with children (..i think? I forget at this point)
                        
                        window.cleared=1;

                    }
                    while (mysubs.firstChild){ //clear my container (Netflix script does this anyways ? might not need)
                        
                        mysubs.removeChild(mysubs.firstChild);

                    }
                }
                
                
            }
            else if(mutation.type==='attributes' && mutation.target.className==="player-timedtext" && mutation.target.style.inset != window.old_inset){ 
                // Refresh styles on window resize (takes a lot of processing power to track every attribute change so I'd rather not do this but then the extension looks poorly made)
                // Will test if it's a problem for other computers before release, fine for now
                    
                    window.old_inset = mutation.target.style.inset;
                    mysubs.style.inset=window.old_inset;

                    window.baseFont = parseFloat(mutation.target.firstChild.firstChild.style.fontSize.replace('px','')); //font size changes way more often than on nrk so will take basefont after every clear instead (if inset updates, update this as well)
                    window.current_size = window.baseFont*window.current_multiplier+'px';
                    update_style('font_size');
                    
                    window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.05;
                    const test = parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10;
                    mysubs.firstChild.style['left']=test+'px';

                
            }
            
        }
    };

    window.observer = new MutationObserver(callback);
    window.observer.observe(timedtext,window.config);

}

var addSubs = function(caption_row){ 

    if(caption_row.firstChild!=null && window.on_off){ // Ensures Subs were added rather than removed, probably redundant
        
        caption_row.firstChild.setAttribute('style','display: inline; text-align: center; position: absolute; left: 5%; bottom: 10%;'); // move original to left 
        
        if (window.cleared === 1){ //If CLEARED subs recently, pull new subs, store, and display

            const sub_dist =window.original_subs_placement+caption_row.firstChild.getBoundingClientRect().width+10;
            
            window.stored_subs = caption_row.firstChild.cloneNode(true);
            stored_subs.setAttribute('class','mysubs');
            stored_subs.setAttribute('translate','yes');
            stored_subs.setAttribute('style',`display: block;text-align: center; position: inherit; left: ${sub_dist+'px'} ;bottom: 10%;`); 

            mysubs.style.inset=caption_row.style.inset;
            mysubs.appendChild(stored_subs);

            window.baseFont = parseFloat(stored_subs.firstChild.style.fontSize.replace('px','')); //font size changes way easily than on nrk so will take basefont after every clear instead (if change inset update, change this as well)
            window.current_size = window.baseFont*window.current_multiplier+'px';

            //Apply changes to onscreen subs
            update_style('text_color');
            update_style('opacity');
            update_style('font_size'); 
            
            window.cleared=0;
            
        }
        else{// Just a refresh so place stored instead 

            mysubs.appendChild(stored_subs);

        }
        
    }

    window.observer.observe(caption_row,window.config);
}

function update_style(setting){

    if (!document.getElementsByClassName("mysubs")[0]){
        if(setting==="text_color"){
            document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
            document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);
        }
        return;
    }
    const lines = document.getElementsByClassName("mysubs")[0].children; //Subtitle lines

    if (setting === 'font_size'){

        for (var i = 0; i<lines.length;i++){

            lines[i].style["font-size"]=window.current_size;

        }
    }
    if (setting === "text_color"){

        
        for (var i = 0; i<lines.length;i++){

            lines[i].style["color"]=window.text_color;

        }
        //Change button color also
        document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
        document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);


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

chrome.runtime.onMessage.addListener( //Listens for messages sent from background script (Preferences Controller)
    function (request, sendRespone, sendResponse){
        
        if (request.message === "update_on_off"){
            window.on_off = request.value;
            if (!window.on_off){
                document.getElementById("mybuttonDec").parentElement.style.display='none';
                document.getElementById("myButtonInc").parentElement.style.display='none';
            }
            else{
                document.getElementById("mybuttonDec").parentElement.style.display='block';
                document.getElementById("myButtonInc").parentElement.style.display='block';
            }
        }
        
        if (request.message === 'trigger_wait'){ //Retriggers the script on url change rather than just page refresh (netflix loads pages dynamically)

            //console.log("IN CONTENT WAITING");
            wait_for_player();
            

        }
        
        if (request.message==='update_font_multiplier'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE font_multiplier to " + request.value);

            window.current_multiplier=parseFloat(request.value);
            window.current_size=window.baseFont*request.value+'px'
            //StoreSetting('current_size',window.current_size)
            update_style('font_size');

        }

        /*if (request.message ==='update_sub_distance'){ inconsistent functionality for some reason.. but I don't think people would need this option anyways so I'll disable for now
            console.log("Recieved Message from BACKGROUND.JS to CHANGE side to " + request.value);
            window.sub_distance=parseInt(request.value);
            //StoreSetting('current_size',window.current_size)
            update_style('sub_distance');
        }
        */

        if (request.message ==='update_text_color'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE color to " + request.value);
            window.text_color=request.value;
            //StoreSetting('current_size',window.current_size)
            update_style('text_color');

        }

        if (request.message ==='update_opacity'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE opacity to " + request.value);
            window.opacity=parseFloat(request.value);
            //StoreSetting('current_size',window.current_size)
            update_style('opacity');

        }
});
