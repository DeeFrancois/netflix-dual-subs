document.addEventListener('DOMContentLoaded',function(){
    if (window.location.pathname === "/update.html"){ // to stop popup js from running when update.html is opened and causing errors 
        return;
    }
    window.addEventListener('click',function(e){
        if(e.target.href!==undefined){
          chrome.tabs.create({url:e.target.href});
        }
      });
   
    //I know i know, I really need to fix these variable names. I'll get around to it eventually..)
    var slider = document.getElementById('mySlider');
    var slideValue = document.getElementById('mySliderValue');

    var opacitySlider = document.getElementById('opacitySlider');
    var opacitySliderValue = document.getElementById('opacitySliderValue');

    var originalOpacitySlider = document.getElementById('originalOpacitySlider');
    var originalOpacitySliderValue = document.getElementById('originalOpacitySliderValue');

    var colorPicker = document.getElementById('myColorPicker');
    var originalColorPicker = document.getElementById('myOriginalColorPicker');

    var resetButton = document.getElementById('resetButton');
    var onSwitch = document.getElementById("switchValue");
    var button_onSwitch = document.getElementById("button_switchValue");
    var button_upDownMode = document.getElementById("button_upDownValue");

    chrome.storage.sync.get('font_multiplier',function(data){
            slideValue.innerHTML=data.font_multiplier;
            slider.value=data.font_multiplier;

    });

    /*chrome.storage.sync.get('sub_distance',function(data){
        sideSlider.value=data.sub_distance;
        sideSliderValue.innerHTML=data.sub_distance;

    });
    */

    chrome.storage.sync.get('opacity',function(data){
        opacitySlider.value=data.opacity;
        opacitySliderValue.innerHTML=data.opacity;

    });

    chrome.storage.sync.get('originaltext_opacity',function(data){
        originalOpacitySlider.value=data.originaltext_opacity;
        originalOpacitySliderValue.innerHTML=data.originaltext_opacity;

    });

    chrome.storage.sync.get('text_color',function(data){
        colorPicker.value=data.text_color;

    });

    chrome.storage.sync.get('originaltext_color',function(data){
        originalColorPicker.value=data.originaltext_color;

    });

    chrome.storage.sync.get('on_off',function(data){
        console.log("Stored value is: ",data.on_off);
        onSwitch.checked=data.on_off;

    });

    chrome.storage.sync.get('button_on_off',function(data){
        console.log("Stored value is: ",data.button_on_off);
        button_onSwitch.checked=data.button_on_off;

    });

    chrome.storage.sync.get('button_up_down_mode',function(data){
        console.log("Stored value is: ",data.button_up_down_mode);
        button_upDownMode.checked=data.button_up_down_mode;

    });
    

    slider.addEventListener('change', function() {
        mySliderValue.innerHTML=this.value;
        slider.value=this.value;
        //Send Message to background to store this value
        //chrome.storage.sync.set({"font_multiplier":this.value});
        chrome.runtime.sendMessage({
            "message": "update_font_multiplier",
            "value": this.value
        });
        
    }, false);

    /*sideSlider.addEventListener('change',function() {
        sideSliderValue.innerHTML=this.value;
        sideSlider.value = this.value;

        //chrome.storage.sync.set({"left_or_right":this.value});
        chrome.runtime.sendMessage({
            "message": "update_sub_distance",
            "value": this.value
        });
    }, false);*/

    opacitySlider.addEventListener('change',function() {
        opacitySliderValue.innerHTML=this.value;
        opacitySlider.value = this.value;

        //chrome.storage.sync.set({"left_or_right":this.value});
        chrome.runtime.sendMessage({
            "message": "update_opacity",
            "value": this.value
        });
    }, false);

    originalOpacitySlider.addEventListener('change',function() {
        originalOpacitySliderValue.innerHTML=this.value;
        originalOpacitySlider.value = this.value;

        //chrome.storage.sync.set({"left_or_right":this.value});
        chrome.runtime.sendMessage({
            "message": "update_originaltext_opacity",
            "value": this.value
        });
    }, false);

    colorPicker.addEventListener('input',function() {
        console.log("HERE COLOR PICKER");
        colorPicker.value = this.value;

        //chrome.storage.sync.set({"left_or_right":this.value});
        chrome.runtime.sendMessage({
            "message": "update_text_color",
            "value": this.value
        });
    }, false);

    originalColorPicker.addEventListener('input',function() {
        console.log("HERE COLOR PICKER");
        originalColorPicker.value = this.value;

        //chrome.storage.sync.set({"left_or_right":this.value});
        chrome.runtime.sendMessage({
            "message": "update_originaltext_color",
            "value": this.value
        });
    }, false);

    onSwitch.addEventListener('change',function() {

        //chrome.storage.sync.set({"left_or_right":this.value});
       chrome.runtime.sendMessage({
           "message":"update_on_off",
           "value": this.checked
       });
        

    }, false);

    button_onSwitch.addEventListener('change',function() {

        //chrome.storage.sync.set({"left_or_right":this.value});
       chrome.runtime.sendMessage({
           "message":"update_button_on_off",
           "value": this.checked
       });
        

    }, false);

    button_upDownMode.addEventListener('change',function() {

        //chrome.storage.sync.set({"left_or_right":this.value});
       chrome.runtime.sendMessage({
           "message":"update_button_up_down_mode",
           "value": this.checked
       });
        

    }, false);

    resetButton.addEventListener('click',function() {

        //chrome.storage.sync.set({"left_or_right":this.value});
        colorPicker.value='#FFFFFF';
        colorPicker.dispatchEvent(new Event('input'));

        originalColorPicker.value='#FFF000';
        originalColorPicker.dispatchEvent(new Event('input'));

        opacitySlider.value=.8;
        opacitySlider.dispatchEvent(new Event('change'));
        originalOpacitySlider.value=1;
        originalOpacitySlider.dispatchEvent(new Event('change'));

        slider.value=1;
        slider.dispatchEvent(new Event('change'));
        //sideSlider.value=10;
        //sideSlider.dispatchEvent(new Event('change'));
        //chrome.runtime.sendMessage({
        //    "message": "default_settings",
        //    "value": 0
        //});
    }, false);



}, false);