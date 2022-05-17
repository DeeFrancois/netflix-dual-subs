//Life Before Death, Strength Before Weakness, Journey Before Destination
// v1.4 - Bottom Bar buttons are back!
//DEV LOG: there's a problem with the error catching for the buttons, haven't been able to reproduce it yet, probably too many random try/catch's
//TODO: Button creation would feel more polished if it was done right away, doing it after "player detected" feels too late
//5-13 Netflix update again.. changed it so subtitle styles are placed one element deeper (just had to add another .firstChild at every "captionRow"/"player-timedtext" retrieval)
//Also, there seems to be two possible "classname modes", one that is normal and one that has everything ending with "Css"..
//Compensating for both these changes has led to a ton of sloppy code just in an effort ot get everythign to work finally (which it does, at least for the "weird mode") will have to go back to cleanup code tomorrow
// Will also need to test more on the non "weird classname mode", not sure if everythign works for that as well
//5-17 - Fixed english subs, very sloppy code since I want to get this update out fast, will clean up later
window.player_active=0;
window.weird_classname_mode=0;

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

        else if (setting === "button_on_off"){
            window.button_on_off = data[setting];
        }

        else if (setting === "font_multiplier"){
            window.current_multiplier = parseFloat(data[setting]);
            //console.log("Retrieved Font Multiplier From Storage: ",window.current_multiplier);
        }

        /*else if (setting === "sub_distance"){
            window.sub_distance= data[setting];
           // console.log("Retrieved Sub Distance From Storage: ",window.sub_distance);
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
        else if (setting === "originaltext_opacity"){
            window.originaltext_opacity = data[setting];
            //console.log("Retrieved Opacity From Storage: ",window.opacity);
        }
        else if (setting === "originaltext_color"){
            window.originaltext_color = data[setting];
            //console.log("Retrieved Opacity From Storage: ",window.opacity);
        }

        else{
            //console.log("Setting: ", setting, " Does Not Exist");
        }

    });
}

function wait_for_player(){
    
    waitForElement("#appMountPoint > div > div >div > div > div > div:nth-child(1) > div > div > div > div").then(function(element) {
       // console.log("Player detected");
        //console.log("Subs Detected");
        
        try{
        actual_create_buttons();      
        }
        catch(e){
           // console.log("Error creating buttons, likely no bar visible");
        }  
        
        getSetting('text_color');
        getSetting('opacity');
        getSetting('originaltext_opacity');
        getSetting('font_multiplier');

        //getSetting('text_side');
        window.original_text_side = 0; //Can change this to flip the text, don't like the feature since the text moves too much but maybe I can improve it later

        //getSetting('sub_distance'); disabled for now, unnecessary imo
        
        initialize_button_observer();
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

    //console.log("Debug - Waiting for Video");
    for (const mutation of mutationsList){

        try {var current_id = location.href.split('/watch/')[1].split('?')[0];}catch(e){var current_id=0;}

        //console.log(mutation.target.className);
        // New way to determine video changes, way more efficient
        // To be fair though, this wouldn't have worked before the netflix interface update as the observers would have persisted and caused endless instances to be created  
        if (mutation.type === 'childList' && (mutation.target.className===" ltr-1b8gkd7-videoCanvasCss" || mutation.target.className== " ltr-op8orf") && mutation.addedNodes.length){
            //console.log("New Video!");
            if(mutation.target.className===" ltr-1b8gkd7-videoCanvasCss"){
                window.weird_classname_mode=1;
               // console.log("WEIRD MODE NOW");
            }
           // console.log(mutation.target.className);
            create_buttons();
        }
        if (mutation.target.parentNode && (mutation.target.parentNode.className=== " ltr-1b8gkd7-videoCanvasCss"|| mutation.target.className== " ltr-op8orf")){
            //console.log(mutation);
            if (mutation.previousSibling && mutation.addedNodes[0].id != mutation.previousSibling.id){
                //console.log("Video Change");
                if(mutation.target.parentNode.className===" ltr-1b8gkd7-videoCanvasCss"){
                    window.weird_classname_mode=1;
                   // console.log("WEIRD MODE NOW");
                }
               // console.log(mutation.target.className+" *");
                create_buttons();
            }
        }
        //addedNodes id previous sibling id
        
    }
}
window.initial_observer = new MutationObserver(callback);
window.initial_observer.observe(document.documentElement,window.initial_config);

function create_buttons(){
        //Enables right click
        var elements = document.getElementsByTagName("*");
        for(var id = 0; id < elements.length; ++id) { elements[id].addEventListener('contextmenu',function(e){e.stopPropagation()},true);elements[id].oncontextmenu = null; }

        getSetting('on_off');
        getSetting('originaltext_color');
        getSetting('button_on_off');
        //Use to be able to create buttons before bottom bar was visible, can't anymore so button creation
        //is moved to after player is detected now

        wait_for_player();


}

function actual_create_buttons(){
   // console.log("Creating buttons..");
    if (!window.on_off || !window.button_on_off){
        return;
    }
    if (document.getElementById('myDecreaseButton') || document.getElementById('myIncreaseButton')){
       // console.log("Buttons alreayd made");
        return;
    }

    let buttonSpacing = document.createElement('DIV');
    buttonSpacing.innerHTML='<div class="ltr-1i33xgl" style="min-width: 3rem; width: 3rem;"></div>';
    buttonSpacing=buttonSpacing.firstElementChild;
    try{
    document.querySelector('button[aria-label="Seek Back"]').parentElement.parentElement.appendChild(buttonSpacing);
    }
    catch(e){
       // console.log("No bar 1");
        return;
    }

    let buttonOne = document.createElement('DIV');
    buttonOne.innerHTML ='<div class="medium ltr-1dcjcj4" id="myDecreaseButton"><button aria-label="Decrease Font Size" class=" ltr-1enhvti" data-uia="control-fontsize-minus"><div class="control-medium ltr-18dhnor" role="presentation"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path clip-rule="evenodd" d="m 6.8 12 l 10.4 0 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0" fill="none" stroke="yellow" stroke-width="2"></path></svg></div></button></div>'; 
    
    if (window.weird_classname_mode){
        buttonOne.innerHTML='<div class="medium ltr-7s9m83-controlContainerCss" id="myDecreaseButton"><button aria-label="Increase Font Size" class=" ltr-1njvkwl-controlButtonCss" data-uia="control-fontsize-minus"><div class="control-medium ltr-ae5w18-baseCss" role="presentation"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path clip-rule="evenodd" d="m 6.8 12 l 10.4 0 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0" fill="none" stoke="yellow" stroke-width="2"></path></svg></div></button></div>';

    }
    buttonOne=buttonOne.firstElementChild;

    try{
    document.querySelector('button[aria-label="Seek Back"]').parentElement.parentElement.appendChild(buttonOne);
    }
    catch(e){
       // console.log("No bar 2");
        return;
    }
    buttonOne.onmouseenter=function(){
        if (window.weird_classname_mode){
            buttonOne.firstChild.className='active ltr-1njvkwl-controlButtonCss';
        }
        else{
            buttonOne.firstChild.className='active ltr-1enhvti';
        }
    }
    buttonOne.onmouseleave=function(){
        if (window.weird_classname_mode){
        buttonOne.firstChild.className=' ltr-1njvkwl-controlButtonCss';
    }
    else{
        buttonOne.firstChild.className=' ltr-1enhvti';
    }
    }

    buttonSpacing = document.createElement('DIV');
    buttonSpacing.innerHTML='<div class="ltr-1i33xgl" style="min-width: 3rem; width: 3rem;"></div>';
    buttonSpacing=buttonSpacing.firstElementChild;

    try{
    document.querySelector('button[aria-label="Seek Back"]').parentElement.parentElement.appendChild(buttonSpacing);
    }
    catch(e){
       // console.log("No bar 3");
        return;
    }

    let buttonTwo = document.createElement('DIV');
    buttonTwo.innerHTML ='<div class="medium ltr-1dcjcj4" id="myIncreaseButton"><button aria-label="Increase Font Size" class=" ltr-1enhvti" data-uia="control-fontsize-minus"><div class="control-medium ltr-18dhnor" role="presentation"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path clip-rule="evenodd" d="m 6.8 12 l 10.2 0 M 12 6.8 l 0 10.2 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0" fill="none" stroke="yellow" stroke-width="2"></path></svg></div></button></div>'; 
    
    if (window.weird_classname_mode){
        buttonTwo.innerHTML='<div class="medium ltr-7s9m83-controlContainerCss" id="myIncreaseButton"><button aria-label="Increase Font Size" class=" ltr-1njvkwl-controlButtonCss" data-uia="control-fontsize-minus"><div class="control-medium ltr-ae5w18-baseCss" role="presentation"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path clip-rule="evenodd" d="m 6.8 12 l 10.2 0 M 12 6.8 l 0 10.2 M 2.4 12 a 1 1 0 0 1 19.2 0 a 1 1 1 0 1 -19.2 0" fill="none" stoke="yellow" stroke-width="2"></path></svg></div></button></div>';

    }
    buttonTwo=buttonTwo.firstElementChild;
    
    try{
    document.querySelector('button[aria-label="Seek Back"]').parentElement.parentElement.appendChild(buttonTwo);
    }
    catch(e){
       // console.log("No bar 4");
        return;
    }
    buttonTwo.onmouseenter=function(){
        if (window.weird_classname_mode){
            buttonTwo.firstChild.className='active ltr-1njvkwl-controlButtonCss';
        }
        else{
            buttonTwo.firstChild.className='active ltr-1enhvti';
        }
    }

    buttonTwo.onmouseleave=function(){
        if (window.weird_classname_mode){
        buttonTwo.firstChild.className=' ltr-1njvkwl-controlButtonCss';
     }
    else{
        buttonTwo.firstChild.className=' ltr-1enhvti';
        }
    }
   // console.log("Creating buttons with color: " + window.originaltext_color);
    if (window.originaltext_color){
    document.getElementById('myDecreaseButton').firstChild.firstChild.firstChild.firstElementChild.setAttribute('stroke',window.originaltext_color);
    document.getElementById('myIncreaseButton').firstChild.firstChild.firstChild.firstElementChild.setAttribute('stroke',window.originaltext_color);
    }
    
    //listeners for clicks
    buttonTwo.addEventListener("click", function() {
    
        window.current_multiplier+=.1;
        //Save Setting here
        chrome.storage.sync.set({"font_multiplier":window.current_multiplier.toFixed(2)}); //Save setting into storage on Change
        window.current_size=window.baseFont*window.current_multiplier+'px';
        update_style('font_size'); //Live Update the setting change

    });

    buttonOne.addEventListener("click", function() {
    
        window.current_multiplier-=.1;
        //Save Setting here
        chrome.storage.sync.set({"font_multiplier":window.current_multiplier.toFixed(2)}); //Save setting into storage on Change
        window.current_size=window.baseFont*window.current_multiplier+'px';
        update_style('font_size'); //Live Update the setting change

    });

        
}
function initialize_button_observer(){
   // console.log("Button Creator Observer HERE");
    var id = "watch-video--player-view";
    const bottom_bar = document.getElementsByClassName(id)[0];

    window.button_config = {subtree:true,childList:false,attributes:true,attributeFilter:["class"]};

    const callback = function(mutationsList,button_observer){
        for (const mutation of mutationsList){
           
             if (mutation.target.className==='active ltr-fntwn3' || mutation.target.className==='active ltr-gwjau2-playerCss'){
                 //console.log("Bottom bar visible");
                if (mutation.target.className==='active ltr-gwjau2-playerCss'){
                    window.netflix_mode = 2;
                }
                actual_create_buttons();
             }
           
        }
       
    };
     window.button_observer = new MutationObserver(callback);
    window.button_observer.observe(bottom_bar,window.button_config);
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
            
            else if(window.on_off && mutation.type==='attributes' && mutation.target.className==="player-timedtext" && mutation.target.firstChild && mutation.target.style.inset != window.old_inset){ //For adjusting subtitle style when window is resized
                    //Netflix constantly refreshes the text so I have to constantly reapply them

                    const caption_row = document.getElementsByClassName("player-timedtext")[0];
                    var container_count = caption_row.childElementCount;
                    if (container_count == 2){ // Why work around Netflix sometimes using a seperate container for each row when I can just force it back into using one.. wish I'd done this earlier
                        document.getElementsByClassName('player-timedtext-text-container')[0].firstChild.innerText= document.getElementsByClassName('player-timedtext-text-container')[0].firstChild.innerText + '\n '+ document.getElementsByClassName("player-timedtext-text-container")[1].firstChild.innerText;
                        $('.player-timedtext-text-container')[1].remove();    
                        container_count=0;
                    }


                    window.baseFont = parseFloat(mutation.target.firstChild.firstChild.firstChild.style.fontSize.replace('px','')); //font size changes way more often than on nrk so will take basefont after every clear instead (if inset updates, update this as well)
                    window.current_size = window.baseFont*window.current_multiplier+'px';
                    update_style('font_size');
                    //update_style('originaltext_opacity');
                    //update_style('originaltext_color');
                    

                    if (window.original_text_side == 0){
                        window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().x)+ (parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.025);
                        var sub_dist = (parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10);
                        window.my_timedtext_element.style['left']=sub_dist+'px';

                    }
                    else{
                        window.original_subs_placement = parseInt(my_timedtext_element.getBoundingClientRect().x)+ parseInt(my_timedtext_element.getBoundingClientRect().width);
                        var sub_dist = (window.original_subs_placement)+10 - parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().x);
                        document.getElementsByClassName("player-timedtext")[0].firstChild.style['left']=sub_dist+'px';
                    }

                
            }
            
        }
    };

    window.observer = new MutationObserver(callback);
    window.observer.observe(timedtext,window.config);

}

// var coalesce_containers = function(caption_row){

//     return new Promise((resolve,reject)=>{
//          //new netflix update, can use many containers New girl 17:48
//     let count = caption_row.childElementCount;
//     let final_innerText = '';
    
//     //let caption_row = document.getElementsByClassName('player-timedtext')[0];
//     let final_style = caption_row.firstChild.firstChild.firstChild.getAttribute('style');

//     for (let i = 0; i<caption_row.childElementCount;i++){
        
//         final_innerText+=document.getElementsByClassName('player-timedtext-text-container')[i].firstChild.innerText;
//         if (i<caption_row.childElementCount-1){
//             final_innerText+='\n';
//         }
//     }
//     document.getElementsByClassName('player-timedtext-text-container')[0].firstChild.innerText=final_innerText;

//     for (let j = 0; j<caption_row.childElementCount;j++){
//         document.getElementsByClassName('player-timedtext-text-container')[1].remove();
//     }
//     document.getElementsByClassName('player-timedtext-text-container')[0].firstChild.setAttribute('style',final_style);
//     console.log('Coalesced ' + count + ' rows');
//     });
   
// }
var addSubs = function(caption_row){ 

   if(caption_row.firstChild!=null && window.on_off){ // Ensures Subs were added rather than removed, probably redundant
        var container_count = caption_row.childElementCount; 
        try{
        window.baseFont = parseFloat(caption_row.firstChild.firstChild.firstChild.style.fontSize.replace('px',''));
        }
        catch(e){
            window.baseFont = parseFloat(caption_row.firstChild.firstChild.style.fontSize.replace('px',''));
            //console.log('error getting font');
        }
        if (container_count >1){ // Why work around Netflix sometimes using a seperate container for each row when I can just force it back into using one.. wish I'd done this earlier
            
    // Coalesce Function - didn't bother with actually making it its own function since that would involve incorporating async/await or Promise stuff.. can do that later
            //let caption_row = document.getElementsByClassName('player-timedtext')[0];
            let count = caption_row.childElementCount;
            let final_innerText = '';
            
            //let caption_row = document.getElementsByClassName('player-timedtext')[0];
            let final_style = caption_row.firstChild.firstChild.firstChild.getAttribute('style');

            for (let i = 0; i<count;i++){
                
                final_innerText+=document.getElementsByClassName('player-timedtext-text-container')[i].firstChild.innerText;
                if (i<caption_row.childElementCount-1){
                    final_innerText+='\n';
                }
            }
            document.getElementsByClassName('player-timedtext-text-container')[0].firstChild.innerText=final_innerText;

            for (let j = 0; j<caption_row.childElementCount;j++){
                document.getElementsByClassName('player-timedtext-text-container')[1].remove();
            }
            document.getElementsByClassName('player-timedtext-text-container')[0].firstChild.setAttribute('style',final_style);
            //console.log('Coalesced ' + count + ' rows');
            //console.log(caption_row);



    //
            
        }

        old_style = caption_row.firstChild.style
        //console.log(old_style);

        caption_row.firstChild.setAttribute('style','display: block; white-space: nowrap; text-align: center; position: absolute; left: 2.5%; bottom: 18%;');
        caption_row.firstChild.setAttribute('translate','no'); 

        window.original_subs = caption_row.firstChild.innerText;


        if (original_text_side == 1){
            caption_row.firstChild.style['left']='97.5%';
        }
        

        //console.log("Original Subs: ",original_subs);
        if (original_subs !== window.last_subs){
            window.last_subs = original_subs;
            window.my_timedtext_element.innerText = original_subs;
            //console.log("CHANGED");
        }
        else if (original_subs===''){
            window.my_timedtext_element=original_subs;
        }
        console.log(caption_row);
        //window.baseFont = parseFloat(caption_row.firstChild.firstChild.firstChild.style.fontSize.replace('px','')); //font size changes way easily than on nrk so will take basefont after every clear instead (if change inset update, change this as well)
        window.current_size = window.baseFont*window.current_multiplier+'px';


        
        if(window.original_text_side == 0){
            window.original_subs_placement = parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().x)+ (parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().width)*.025);
            var sub_dist = (parseInt(document.getElementsByClassName("player-timedtext")[0].firstChild.getBoundingClientRect().width)+(window.original_subs_placement)+10);
            window.my_timedtext_element.style['left']=sub_dist+'px';

        }
        else{
            window.my_timedtext_element.style['left']='2.5%';

            //Same but applied to my element instead
            window.original_subs_placement = parseInt(my_timedtext_element.getBoundingClientRect().x) + parseInt(my_timedtext_element.getBoundingClientRect().width);
            var sub_dist = (window.original_subs_placement)+10 - parseInt(document.getElementsByClassName("player-timedtext")[0].getBoundingClientRect().x);
            caption_row.firstChild.style['left']=sub_dist+'px';

        }
        
        
        var sub_bot = parseFloat(document.getElementsByClassName('player-timedtext')[0].style.inset.split(' ')[0].replace('px','')) + parseFloat('.'+document.getElementsByClassName('player-timedtext')[0].firstChild.style['bottom'])*document.getElementsByClassName('player-timedtext')[0].getBoundingClientRect().height;

        window.my_timedtext_element.style['bottom']=sub_bot+'px';        
        
        update_style('text_color');
        update_style('opacity');
        update_style('font_size');
        //update_style('original_font_size');//I'll do this later, currently a bit tricky since the current font size modification is uses the original subs as the base value 
        
        
    }

    window.observer.observe(caption_row,window.config);

}

function update_style(setting){
    
    var lines = window.my_timedtext_element;
    var original_lines = document.getElementsByClassName("player-timedtext")[0].firstChild.firstChild;

    if (setting === 'font_size'){

        lines.style["font-size"]=window.current_size;
        
    }
    if (setting === "text_color"){

        lines.style['color']=window.text_color;
        
        //following line is for multi-container support, but doesn't affect single container mode so I didn't bother with an if(container_count)
        document.getElementsByClassName('player-timedtext')[0].firstChild.firstChild.style['color']=window.originaltext_color;

        for (let i =0;i<document.getElementsByClassName("player-timedtext")[0].firstChild.firstChild.children.length;i++){
            original_lines.children[i].style['color']=window.originaltext_color;
        }
        //original_lines.style["color"]=window.originaltext_color;

        //Change button color also
        //document.getElementById("mybuttonDec").firstElementChild.setAttribute('stroke',window.text_color);
        //document.getElementById("myButtonInc").firstElementChild.setAttribute('stroke',window.text_color);

    }

    if (setting === "opacity"){

            lines.style["opacity"]=window.opacity;
            original_lines.style["opacity"]=window.originaltext_opacity;

    }

    /*if (setting === "sub_distance"){ //Not quite sure how to pick the color yet..
        var test = parseInt(window.baseOffset)+parseInt(window.sub_distance);
        document.getElementsByClassName("mysubs")[0].style.left=test+'px';
       // console.log("Set sub distance");
    }
    */

}

chrome.runtime.onMessage.addListener( //Listens for messages sent from background script (Preferences Controller)
    function (request, sendRespone, sendResponse){

        if (request.message === "update_on_off"){
            window.on_off = request.value;
            if (!window.on_off){
                
                try{
                window.my_timedtext_element.style['display']='none';
                    for (let i =0;i<document.getElementsByClassName("player-timedtext")[0].firstChild.children.length;i++){
                        
                        document.getElementsByClassName("player-timedtext")[0].firstChild.children[i].style['color']='#FFFFFF';
                    
                    }
                }
                catch(e){
                   // console.log(e);
                }
                try{
                document.getElementById("myDecreaseButton").style.display='none';
                document.getElementById("myIncreaseButton").style.display='none';
                }
                catch(e){
                   // console.log(e);
                }
            }
            else{
                try{
                window.my_timedtext_element.style['display']='block';
                for (let i =0;i<document.getElementsByClassName("player-timedtext")[0].firstChild.children.length;i++){
                    document.getElementsByClassName("player-timedtext")[0].firstChild.children[i].style['color']=window.originaltext_color;
                }
            }
            catch(e){
               // console.log(e);
            }
                try{
                document.getElementById("myDecreaseButton").style.display='block';
                document.getElementById("myIncreaseButton").style.display='block';
                }
                catch(e){
                   // console.log(e);
                    actual_create_buttons();
                }
            }
        }

        if (request.message === "update_button_on_off"){
            window.button_on_off = request.value;
            if (!window.button_on_off){
                
                try{
                document.getElementById("myDecreaseButton").style.display='none';
                document.getElementById("myIncreaseButton").style.display='none';
                }
                catch(e){
                   // console.log(e);
                }
            }
            else{
                
                try{
                document.getElementById("myDecreaseButton").style.display='block';
                document.getElementById("myIncreaseButton").style.display='block';
                }
                catch(e){
                   // console.log(e);
                    actual_create_buttons();
                }
            }
        }
        
        if (request.message==='update_font_multiplier'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE font_multiplier to " + request.value);

            window.current_multiplier=parseFloat(request.value);
            window.current_size=window.baseFont*request.value+'px'
            update_style('font_size');

        }

        /*if (request.message ==='update_sub_distance'){ inconsistent functionality for some reason.. but I don't think people would need this option anyways so I'll disable for now
           // console.log("Recieved Message from BACKGROUND.JS to CHANGE side to " + request.value);
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

        if (request.message ==='update_originaltext_opacity'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE opacity to " + request.value);
            window.originaltext_opacity=parseFloat(request.value);
            update_style('opacity');

        }

        if (request.message ==='update_originaltext_color'){

            //console.log("Recieved Message from BACKGROUND.JS to CHANGE opacity to " + request.value);
            window.originaltext_color=request.value;
            
            update_style('text_color');
            try{
            document.getElementById('myDecreaseButton').firstChild.firstChild.firstChild.firstElementChild.setAttribute('stroke',window.originaltext_color);
            document.getElementById('myIncreaseButton').firstChild.firstChild.firstChild.firstElementChild.setAttribute('stroke',window.originaltext_color);
            }
            catch(e){
               // console.log(e);
            }
        }
});