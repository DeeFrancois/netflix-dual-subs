// background.js


//STORAGE VALUES

//First Run, store default settings

//Font Multiplier

chrome.storage.sync.get('font_multiplier',function(data){
  if(data.font_multiplier!=null){
    console.log("Preferences: Font_multiplier found: ");
    console.log(data.font_multiplier);
  }
  else{
    console.log("No Font Multiplier stored");
    chrome.storage.sync.set({'font_multiplier':1});
  }
});

// Text Color

chrome.storage.sync.get('text_color', function(data){
  if(data.text_color){
    console.log("Preferences: Text Color : " + data.text_color);
  }
  else{
    console.log("No Color Preference Found - Setting YELLOW");
    chrome.storage.sync.set({'text_color': '#FFFF00'});
  }
});

// Opacity

chrome.storage.sync.get('opacity', function(data){
  if(data.text_color){
    console.log("Preferences: Opacity : " + data.text_color);
  }
  else{
    console.log("No Opacity Preference Found - Setting to 1");
    chrome.storage.sync.set({'opacity': 1});
  }
});

//enabled disabled
chrome.storage.sync.get('on_off', function(data){
  if(data.on_off!=null){
    console.log("Preferences: on_off : " + data.on_off);
  }
  else{
    console.log("No Opacity Preference Found - Setting to ON");
    chrome.storage.sync.set({'on_off': 1});
  }
});

//Sub Distance

/*chrome.storage.sync.get('sub_distance', function(data){ //inconsistent functionality for some reason.. but I don't think people would need this option anyways so I'll disable for now
  if(data.sub_distance!=null){
    console.log("Preferences: Sub Distance Found - : " + data.sub_distance);
  }
  else{
    console.log("No Side Preference Found - Setting RIGHT");
    chrome.storage.sync.set({'sub_distance':10}); //1 = Right Side (Prepend New Span) 0= Left Side (Append New Span)
  }
  
});
*/


//Handles message sent to background script, typically for changing User Preference variables
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if( request.message === "update_on_off" ) 
      {

        console.log("Background.js recieved message from SLIDER to update on_off to " + request.value);
        chrome.storage.sync.set({'on_off':request.value});           //Store into local variables
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ //Pass message onto Content.js
          chrome.tabs.sendMessage(tabs[0].id, {
            "message":"update_on_off",
            "value":request.value});
        });

      }

      if( request.message === "update_font_multiplier" ) 
      {

        console.log("Background.js recieved message from SLIDER to update font multiplier to " + request.value);
        chrome.storage.sync.set({'font_multiplier':parseFloat(request.value)});           //Store into local variables
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ //Pass message onto Content.js
          chrome.tabs.sendMessage(tabs[0].id, {
            "message":"update_font_multiplier",
            "value":request.value});
        });

      }

      if(request.message === "update_text_color")
      {

        console.log("Background.js recieved  a message from COLORSELECTOR to update TEXT_COLOR to " + request.value);
        chrome.storage.sync.set({'text_color':request.value});
        
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){ //Pass message onto Content.js
          chrome.tabs.sendMessage(tabs[0].id, {
            "message":"update_text_color",
            "value":request.value}); 
        });

      }

      if(request.message === "update_opacity")
      {

        console.log("BACKGROUND.JS recieved a message from SIDESELECTOR to update TEXT_SIDE to " + request.value);
        chrome.storage.sync.set({'opacity': request.value});

        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
            "message": "update_opacity",
            "value": request.value});
          });
        
      }

      /*if(request.message === "update_sub_distance") 
      {

        console.log("BACKGROUND.JS recieved a message from SIDESLIDER to update SUB_DISTANCE to " + request.value);
        chrome.storage.sync.set({'sub_distance':request.value});

        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {
            "message": "update_sub_distance", 
            "value": request.value});
        });

      }*/


});
