# netflix-dual-subs
Enables dual language subtitles on Netflix
Using my NRKTV extension as a foundation so there's currently a lot of unrelated files/code in here

## Motivation
I've been learning Norwegian and I've found that dual subtitles are a really great learning tool. I started with making a dual subtitle extension specifically for NRK TV
but realized the algorithm I came up with could be used for anything. So I figured I'd try it on Netflix as well so more people can benefit from this (and so I can watch Hjem til Jul).








## The Journey
since it might be interesting for people to have a peek into the process. Not inclined to make a youtube video so this will have to do.
### Day 1
- Got to the point where I can properly manipulate the subtitle container (track when subtitles are removed/added and insert my own). Unfortunately Netflix disables right click
so I can't activate the translator...ugh

- Okay, for now I will use the extension "Allow Right Click". I'll figure out how to do it myself later. 

- The functionality is good now but it flickers.. For some reason netflix has the subtitles refreshing every second while they are still up. 
It happens fast so you normally don't notice but it's resetting the translation every time..

### Day 2
- Okay, fixed the flickering by storing the translation on first appearance and inserting the same translated text everytime so there's no visual indication 
of the constant refresh. NICE

- Also made it so I have my own subtitle container instead of appending children into the original one, way easier to clear/add subtitles this way 

- Okay the extension is officially usable at this point. WOOOO! just need to address spacing next because the subtitles tend to overlap a lot. 
The rare long single line is my enemy right now. 

### Day 3
- After hours of messing around with the css properties trying to find what values will fit both containers the best, I've realized I can just get the pixel value of the right side
of the original text's container, add an offset, and use absolute positioning to place the new subs there. Also changed the display option for the added subs so they don't go off the screen. 
IT'S BEAUTIFUL NOW


- Everything works well enough for me to happily use this on my own BUT since I'm releasing this, it's time to add the customization options and fix some bugs.

- For now I will upload to github and outline the remaining tasks which are:
  
  - Fix bug where the subtitles dont show when opening a new video unless you refresh (probably a flag issue)
  - Figure out how to enable right click without the other extension
  - User Preferences like in the NRK but for: Font size/distance between original subs and translation subs/text color
  - remove old code/files from nrk project,
  - new icons


