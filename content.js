//Life Before Death, Strength Before Weakness, Journey Before Destination

// Emergency Patch since there was a netflix update, no control bar buttons for now
// I last worked on this almost 2 weeks ago and I can't remember what was wrong with it..
// but I was correct, using my own container rather than cloning the existing one from the page makes Edge's translator more reliable

// Just need time to find the bugs again and add the buttons back

// Most bugs fixed, what's left is just fixing up initialization
// off button needs to be updated

// IMPORTANT: Broken for videos that use two containers (example: Community with English subs)
// Also sub distance is not correct after reaching a certain size window

//BREAKTHROUGH, sub distance ended up being inaccurate because a margin was being added in certain situations,
// accounting for getBoundingClientRect().x != 0 was the trick. all that work for one line.. isn't programming great 

//10-4-21: This version is now officially working with Edge. Need some time to make sure there aren't any more bugs before I submit for review

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

        // The following line was impementing when I used background.js to inject the script manually, but now I use content scripts so this isn't necessary.. I'll try removing it later on, don't want to break anything 
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

function create_buttons(){

        //Enables right click
        var elements = document.getElementsByTagName("*");
        for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }

        wait_for_player();

}

function llsubs(){
    //console.log("Starting llsubs");
    var elements = document.getElementsByTagName("*");
    for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }

    //Pull Original Sub Container
    var id = "player-timedtext";
    const timedtext = document.getElementsByClassName(id)[0]; //Original Container

    //My container creation my-timedtext-container

    $(".my-timedtext-container").remove(); // should actually do this after video exit rather than before video start since it will fix the text lingering a bit on exit

    $(".watch-video").append(`<div class='my-timedtext-container' style='display: block; white-space: pre-wrap; text-align: center; position: absolute; font-size:21px;line-height:normal;font-weight:normal;color:#ffffff;text-shadow:#000000 0px 0px 7px;font-family:Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif;font-weight:bolder'><span id=my_subs_innertext></span></div>`)
    window.my_timedtext_element= document.getElementsByClassName('my-timedtext-container')[0];
    
    my_timedtext_element.setAttribute('translate','yes');

    window.last_subs = '';

    
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
                        document.getElementsByClassName('my-timedtext-container')[0].innerText = "";
                        window.last_subs="";
                        

                    }
                    //window.my_timedtext_element.innerText = "";
                    
                }
                
                
            }
            
            else if(mutation.type==='attributes' && mutation.target.className==="player-timedtext" && mutation.target.firstChild && mutation.target.style.inset != window.old_inset){ //For adjusting subtitle style when window is resized
                   // Oh.. now I remember where the bugs were lol
                    //Script breaks sometimes due to this section. Working on a proper fix, but for now a big try/catch should be sufficient 
                    
                    window.baseFont = parseFloat(mutation.target.firstChild.firstChild.style.fontSize.replace('px','')); //font size changes way more often than on nrk so will take basefont after every clear instead (if inset updates, update this as well)
                    window.current_size = window.baseFont*window.current_multiplier+'px';
                    update_style('font_size');
                    
                    window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().x)+ (parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.025);
                    //const test = parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10;

                    var sub_dist = (parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10);
                    var sub_bot = parseFloat(document.getElementsByClassName('player-timedtext')[0].style.inset.split(' ')[0].replace('px','')) + parseFloat('.'+document.getElementsByClassName('player-timedtext')[0].firstChild.style['bottom'])*document.getElementsByClassName('player-timedtext')[0].getBoundingClientRect().height;
                    window.my_timedtext_element.style['left']=sub_dist+'px';
                    window.my_timedtext_element.style['bottom']=sub_bot+'px';
                //}catch(e){}
                    //mysubs.firstChild.style['left']=test+'px';
                    //if (child_count==2){

                    //    const test_two = parseInt(document.getElementsByClassName("player-timedtext")[0].children[1].getBoundingClientRect().width)+(window.original_subs_placement)+10;
                    //    mysubs.children[1].style['left']=test_two+'px';

                    //}
                
            }
            
            
        }
    };

    window.observer = new MutationObserver(callback);
    window.observer.observe(timedtext,window.config);

}

var addSubs = function(caption_row){ 

   if(caption_row.firstChild!=null && window.on_off){ // Ensures Subs were added rather than removed, probably redundant
        var container_count = caption_row.childElementCount;

        old_style = caption_row.firstChild.style
        //console.log(old_style);

        caption_row.firstChild.setAttribute('translate','no'); 
        caption_row.firstChild.style['left']='2.5%';
        //caption_row.firstChild.style['bottom']='10%'; this hardlocks the captiosn there so that on hover the text cant move away from the bottom bar..
        // need to do something like that but without the hardlock because there are shows where the subs appear above
        
        if(container_count==2){

            caption_row.firstChild.style['bottom']='20%'; //Dual-container subs are a bit too big so I gotta shift them up a little
            caption_row.children[1].setAttribute('style','display: inline; text-align: center; position: absolute; left: 2.5%; top: 80%;'); 

        }

        window.original_subs = caption_row.firstChild.innerText;
        //console.log("Original Subs: ",original_subs);
        if (original_subs !== window.last_subs){
            window.last_subs = original_subs;
            window.my_timedtext_element.innerText = original_subs;
            console.log("CHANGED");
        }
        else if (original_subs===''){
            window.my_timedtext_element=original_subs;
        }

        window.baseFont = parseFloat(caption_row.firstChild.firstChild.style.fontSize.replace('px','')); //font size changes way easily than on nrk so will take basefont after every clear instead (if change inset update, change this as well)
        window.current_size = window.baseFont*window.current_multiplier+'px';
        window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().x)+ (parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.025);


        var sub_dist = (parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10);
        var sub_bot = parseFloat(document.getElementsByClassName('player-timedtext')[0].style.inset.split(' ')[0].replace('px','')) + parseFloat('.'+document.getElementsByClassName('player-timedtext')[0].firstChild.style['bottom'])*document.getElementsByClassName('player-timedtext')[0].getBoundingClientRect().height;
        window.my_timedtext_element.style['left']=sub_dist+'px';
        window.my_timedtext_element.style['bottom']=sub_bot+'px';

        window.my_timedtext_element.style['font-size']=current_size;
        window.my_timedtext_element.style['color']='yellow';
        
        /*
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
        */
        
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
                try{
                lines_two[i].style["font-size"]=window.current_size;
                }
                catch(e){}
            }

        }
    }
    if (setting === "text_color"){

        
        for (var i = 0; i<lines.length;i++){

            lines[i].style["color"]=window.text_color;
            if (secondary){
                try{
                lines_two[i].style["color"]=window.text_color;
                }
                catch(e){}
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
                try{
                lines_two[i].style["opacity"]=window.opacity;
                }
                catch(e){}
                
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

        if (request.message === "new_update"){
            console.log("New update");
            alert("Dual Subtitles for Netflix: Hey guys, it should be working again. Sorry about that, the Netflix update broke the extension. The bottom bar buttons will be back later, just wanted to get this out as fast as possible.");
        }
        
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