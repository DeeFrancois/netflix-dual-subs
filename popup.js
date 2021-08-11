

document.addEventListener('DOMContentLoaded',function(){
    var slider = document.getElementById('mySlider');
    var slideValue = document.getElementById('mySliderValue');
    //var sideSlider = document.getElementById('sideSlider');
    //var sideSliderValue = document.getElementById('sideSliderValue');
    var opacitySlider = document.getElementById('opacitySlider');
    var opacitySliderValue = document.getElementById('opacitySliderValue');
    var colorPicker = document.getElementById('myColorPicker');
    var resetButton = document.getElementById('resetButton');
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

    chrome.storage.sync.get('text_color',function(data){
        colorPicker.value=data.text_color;

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

    colorPicker.addEventListener('input',function() {
        console.log("HERE COLOR PICKER");
        colorPicker.value = this.value;

        //chrome.storage.sync.set({"left_or_right":this.value});
        chrome.runtime.sendMessage({
            "message": "update_text_color",
            "value": this.value
        });
    }, false);

    resetButton.addEventListener('click',function() {

        //chrome.storage.sync.set({"left_or_right":this.value});
        colorPicker.value='#FFF000';
        colorPicker.dispatchEvent(new Event('input'));
        opacitySlider.value=1;
        opacitySlider.dispatchEvent(new Event('change'));
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