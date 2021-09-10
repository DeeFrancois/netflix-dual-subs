//Life Before Death, Strength Before Weakness, Journey Before Destination

// Emergency Patch since there was a netflix update, no control bar buttons for now

window.player_active=0;
function waitForElement(selector) {
    return new Promise(function(resolve, reject) {
      var element = document.querySelector(selector);

      if(element) {
        resolve(element);
        return;
      }

      var observer = new MutationObserver(function(mutations) {

        mutations.forEach(function(mutation){
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

        if (setting === "on_off"){
            window.on_off = data[setting];
            
            /* Broken for now
            if (!window.on_off){
                document.getElementById("mybuttonDec").parentElement.style.display='none';
                document.getElementById("myButtonInc").parentElement.style.display='none';
            }
            else{
                document.getElementById("mybuttonDec").parentElement.style.display='block';
                document.getElementById("myButtonInc").parentElement.style.display='block';
            }
            */
            
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
            
            //document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
            //document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);
            
            
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
    
    waitForElement("#appMountPoint > div > div >div > div > div > div:nth-child(1) > div > div > div > div").then(function(element) {
        //console.log("Player detected");
        //console.log("Subs Detected");

        //These usually go with button creation but button creation is currently broken
        getSetting('on_off');
        getSetting('text_color');
        
        //
        getSetting('opacity');
        getSetting('font_multiplier');
        //getSetting('sub_distance'); disabled for now, unnecessary imo

        llsubs();
    
    });
}
//wait_for_player();

//Button Stuff
//Need an observer to wait until the control button row element is created, then the buttons are added, and THEN we can wait for subtitles
//This observer was made "quick and dirty", worked the first try so I'll just leave it and worry about more efficient approach later (as if I haven't been saying this for literally everything this whole time)
window.initial_config = {childList:true, subtree:true,}
var last_url=location.href;

var callback = function(mutationsList, observer){


    for (const mutation of mutationsList){
      //Started this approach so I didn't need to use the Browser History permission
      //Problem is that this observer runs the entire time. THis could be very demanding.
        if (window.player_active===1 && !location.href.includes('netflix.com/watch/') || (location.href.includes('netflix.com/watch/') && location.href != last_url)){ //Constantly checking url during playblack seems demanding, maybe use a timer
            last_url=location.href;
            //console.log("Video hard exit");
            window.player_active=0;
            try{
            window.observer.disconnect();
            }
            catch(e){}
        }
        
        if ( mutation.type === 'childList' && mutation.target.className===" ltr-op8orf" && mutation.removedNodes.length){ //Remove observer when changing video
            window.player_active = 0;
            //console.log("Soft exit"); //Soft exit means disconnect subs listener, but don't redraw buttons after
            window.observer.disconnect();
        }
        else if( mutation.type === 'childList' && mutation.target.className===" ltr-op8orf" && mutation.addedNodes.length){ //New video opened, start script
            //console.log("New video: ",window.player_active);
            if(!window.player_active){
                //console.log("Video started");
                window.player_active=1;
                create_buttons();
            }

        }
        
    }
}
window.initial_observer = new MutationObserver(callback);
window.initial_observer.observe(document.documentElement,window.initial_config);
//console.log("Running initial observer");

function create_buttons(){

        //Enables right click
        var elements = document.getElementsByTagName("*");
        for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }

        /*
        if ($("#mybuttonDec").length){ //When next episode button is used, don't need to recreate (and surprisingly, don't need to refresh listeners)
            //console.log("Buttons already exist");
            wait_for_player();
            return;
        }
        //Decrease font size
        $(".PlayerControlsNeo__button-control-row").children().eq(3).after("<button class='touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyDecrease PlayerControls--control-element-blurred' tabindex='0' role='button' aria-label='Decrease font size'>\
        <svg viewBox='0 0 24 24' id='mybuttonDec' width='1.500em' height='1.500em' aria-hidden='true' style='display:block;' focusable='false'>\
        <path fill='none' d='m 6.8 12 l 10.4 0 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0' stroke='yellow' stroke-width='2'></path></svg></button>")
        //Increase font button
        $(".PlayerControlsNeo__button-control-row").children().eq(4).after("<button class='touchable PlayerControls--control-element nfp-button-control default-control-button button-nfplayerMyIncrease PlayerControls--control-element-blurred' tabindex='0' role='button' aria-label='Increase font size'>\
        <svg viewBox='0 0 24 24' id='myButtonInc' width='1.500em' height='1.500em' aria-hidden='true' style='display:block;' focusable='false'>\
        <path fill='none' d='m 6.8 12 l 10.2 0 M 12 6.8 l 0 10.2 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0' stroke='yellow' stroke-width='2'></path></svg></button>")
        getSetting('text_color');
        getSetting('on_off');
        
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
        */
        wait_for_player();

}

function llsubs(){
    //console.log("Starting llsubs");
    var elements = document.getElementsByTagName("*");
    for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }

    //Pull Original Sub Container
    var id = "player-timedtext";
    const timedtext = document.getElementsByClassName(id)[0]; //Original Container

    //My container creation
    window.mysubs = timedtext.cloneNode();
    mysubs.setAttribute('class','mysubscontainer');
    timedtext.parentNode.appendChild(mysubs);

    //For Placement
    window.old_inset = timedtext.style.inset;
    window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.025; //Original text is placed at Left:5%, using .right on original subs wasn't consistent

    window.cleared=1; //Only takes new subs on clear, necessary because subs are constantly refreshed 

    window.config = { attributes: true, childList: true, subtree:true,attributeFilter: [ "style"]};

    window.old_text = "";

    const callback = function(mutationsList, observer){ //Observes original text box for changes
        for (const mutation of mutationsList){
            if (mutation.type === 'childList' && mutation.target.className && mutation.target.className==="player-timedtext"){ //track removal/addition to subtitle container
                
                if (mutation.addedNodes.length===1){ //If added rather than removed..

                    if (mutation.target.innerText!==window.old_text){ 
                        //I added this functionality last but it's much better than the clear flag, eventually i'll make this the only way to trigger a sub update,
                        //but for now I'll just make it support the current clear flag functionality

                        window.old_text=mutation.target.innerText;
                        window.cleared=1;
                        //console.log("Sub changed detected");

                    }

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
            else if(mutation.type==='attributes' && mutation.target.className==="player-timedtext" && mutation.target.style.inset != window.old_inset){ //For adjusting subtitle style when window is resized

                    var child_count = mysubs.childElementCount;

                    window.old_inset = mutation.target.style.inset;
                    mysubs.style.inset=window.old_inset;

                    window.baseFont = parseFloat(mutation.target.firstChild.firstChild.style.fontSize.replace('px','')); //font size changes way more often than on nrk so will take basefont after every clear instead (if inset updates, update this as well)
                    window.current_size = window.baseFont*window.current_multiplier+'px';
                    update_style('font_size');
                    
                    window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.05;
                    const test = parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10;
                    
                    mysubs.firstChild.style['left']=test+'px';
                    if (child_count==2){

                        const test_two = parseInt(document.getElementsByClassName("player-timedtext")[0].children[1].getBoundingClientRect().width)+(window.original_subs_placement)+10;
                        mysubs.children[1].style['left']=test_two+'px';

                    }
                
            }
            
        }
    };

    window.observer = new MutationObserver(callback);
    window.observer.observe(timedtext,window.config);

}

var addSubs = function(caption_row){ 

    //console.log("Adding Subs");
    //console.log("Hmm: ",caption_row.firstChild!=null);
    //console.log(window.on_off);
    if(caption_row.firstChild!=null && window.on_off){ // Ensures Subs were added rather than removed, probably redundant
        //console.log("Adding Subs");
        var container_count = caption_row.childElementCount;
        //console.log("wtf");
        //console.log("Their subs container?:", document.getElementsByClassName("player-timedtext")[0].firstChild);
        caption_row.firstChild.setAttribute('style','display: block; white-space: nowrap; text-align: center; position: absolute; left: 2.5%; bottom: 15%;'); // move original to left 
        caption_row.firstChild.setAttribute('translate','no'); 
        //display: block; white-space: nowrap; text-align: center; position: absolute; left: 36.0531%; bottom: 10%;
        
        if(container_count==2){

            caption_row.firstChild.style['bottom']='20%'; //Dual-container subs are a bit too big so I gotta shift them up a little
            caption_row.children[1].setAttribute('style','display: inline; text-align: center; position: absolute; left: 2.5%; top: 80%;'); 

        }

        if (window.cleared === 1){ //If CLEARED subs recently, pull new subs, store, and display

            const sub_dist =window.original_subs_placement+caption_row.firstChild.getBoundingClientRect().width+10;
            var container_count = caption_row.childElementCount;
            
            window.stored_subs = caption_row.firstChild.cloneNode(true);
            stored_subs.setAttribute('class','mysubs');
            stored_subs.setAttribute('translate','yes');
            stored_subs.setAttribute('style',`display: block;text-align: center; position: inherit; left: ${sub_dist+'px'} ;bottom: 15%;`); 

            if(container_count==2){

                const sub_dist_two =window.original_subs_placement+caption_row.children[1].getBoundingClientRect().width+10;
            
                window.secondary_stored_subs= caption_row.children[1].cloneNode(true);
                secondary_stored_subs.setAttribute('class','mysubs2');
                secondary_stored_subs.setAttribute('translate','yes');
                stored_subs.style['bottom']='20%';
                secondary_stored_subs.setAttribute('style',`display: block;text-align: center; position: inherit; left: ${sub_dist_two+'px'} ;top: 80%;`); 

            }

            mysubs.style.inset=caption_row.style.inset;
            
            mysubs.appendChild(stored_subs);
            if(container_count===2){
                mysubs.appendChild(secondary_stored_subs);
            }

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
            if (container_count==2){
                mysubs.appendChild(secondary_stored_subs);
            }

        }
        
    }

    window.observer.observe(caption_row,window.config);

}

function update_style(setting){


    if (!document.getElementsByClassName("mysubs")[0]){
        if(setting==="text_color"){
            //document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
            //document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);
        }
        return;
    }

    var secondary = false; //Some videos use two player-timedtext-container's, this is part of supporting those as well 
    

    const lines = document.getElementsByClassName("mysubs")[0].children; //Subtitle lines
    var lines_two=null;

    if(document.getElementsByClassName("mysubs2")[0]){
        secondary=true;
        lines_two=document.getElementsByClassName("mysubs2")[0].children;
    }


    if (setting === 'font_size'){

        for (var i = 0; i<lines.length;i++){

            lines[i].style["font-size"]=window.current_size;
            if (secondary){
                lines_two[i].style["font-size"]=window.current_size;
            }

        }
    }
    if (setting === "text_color"){

        
        for (var i = 0; i<lines.length;i++){

            lines[i].style["color"]=window.text_color;
            if (secondary){
                lines_two[i].style["color"]=window.text_color;
            }

        }
        //Change button color also
        //document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
        //document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);


    }

    if (setting === "opacity"){

        for (var i = 0; i<lines.length;i++){

            lines[i].style["opacity"]=window.opacity;
            if (secondary){
                lines_two[i].style["opacity"]=window.opacity;
            }

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
                //document.getElementById("mybuttonDec").parentElement.style.display='none';
                //document.getElementById("myButtonInc").parentElement.style.display='none';
            }
            else{
                //document.getElementById("mybuttonDec").parentElement.style.display='block';
                //document.getElementById("myButtonInc").parentElement.style.display='block';
            }
        }
        
        if (request.message==='update_font_multiplier'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE font_multiplier to " + request.value);

            window.current_multiplier=parseFloat(request.value);
            window.current_size=window.baseFont*request.value+'px'
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
            update_style('text_color');

        }

        if (request.message ==='update_opacity'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE opacity to " + request.value);
            window.opacity=parseFloat(request.value);
            update_style('opacity');

        }
});