# Dual Subtitles for Netflix
[Now available here on the Chrome Extension Store](https://chrome.google.com/webstore/detail/netflix-language-learning/ljnmedkgcgidbbjhbkdonempgcgdhjfl?hl=en)

<sup> Latest Update: **v1.5.2** Tutorial button + major bug fixes </sup>

Works with the browser's built-in translator to enable dual language subtitles on Netflix

![demo](https://github.com/DeeFrancois/netflix-dual-subs/blob/master/DocumentImages/demo.gif)

<sup><sup>_Hjem Til Jul (2019)_</sup></sup>
#### *Does NOT Work when the original subtitles are inserted with images since the browser can't detect those*
<sup>(This includes: Arabic, Hebrew, Hindi, Japanese, Korean, Persian, Thai, Traditional Chinese, Vietnamese)</sup>

However, you can still use the **Alternate Method** mentioned below which works with **any language** but provides a less-than-ideal experience 

## Motivation
I'm learning Norwegian and I've found that dual subtitles are a really great language learning tool. Many people tend to watch foreign shows with their native subs on while using a seperate tab to constantly look up words they don't know. Having dual subtitles makes that process more efficient by bringing the translations directly onto the video.

After successfully adding dual subs to NRK TV with my [previous extension](https://chrome.google.com/webstore/detail/nrk-tv-language-learning/lmjfcijpnghdkpnoakgljodpjnimbakp), I figured I'd try making it work for Netflix as well so more people can benefit from this functionality.

## How to use

#### Recommended Method:
1. Turn on the subtitles for your Target Language
2. Right Click the page --> "Translate to [Native Language]"
(Does not work if your Target Language is: Arabic Hebrew Hindi Japanese Korean Persian Thai Chinese Vietnamese)

#### Alternate Method (Works with ALL LANGUAGES):
1. Turn on the subtitles in your Native Language
2. Right Click --> Translate to your target language

You can click the extension icon at the top right to customize text color, size, and opacity. 

![demo](https://github.com/DeeFrancois/netflix-dual-subs/blob/master/DocumentImages/settings.gif)



## There are plenty of Netflix Dual Subtitle Extensions already, why should I use this?
Unfortunately the other extensions are either sketchy/not open-source, cost money, or just too obtrusive. I wanted something more lightweight that felt like I was still watching Netflix normally rather than using a full blown language learning program.

Also, the other extensions work by downloading both language subtitle files and displaying them. The problem with this is that the subtitles are based on the audio tracks of the respective language. This means that often times the subtitles are entirely different sentences from eachother rather than direct translations. (This is why they usually need a "hover for translation feature")

While that is great for beginners getting familiar with the language, I feel like direct translations are better for active learning.

## More rambling

Incase you didn't know, you can browse for shows by subtitle/audio language here https://www.netflix.com/browse/subtitles. Finding a show through there will actually enable audio/subtitle tracks that are hidden by default. (But just putting the language in the search bar is better for finding actual foreign shows).

** You can also watch shows in your native language and then tell your browser to translate the secondary subtitles into whatever language you're learning (including languages that I said aren't supported). But I don't know if that's an effective way to learn and it's too many steps to ask of people so I don't advertise it as a main feature.

Google Translate is not perfect! The accuracy is fine for me, but I'm someone that already knows enough to notice the mistakes. The benefit of using the other dual subs extensions is that you are guaranteed to get sentences that make sense even if they aren't direct translations.

## Past Updates:

v1.2: Extension name change, Removed requirement of User History Permission

v1.2.5: Feedback button

v1.2.8: Netflix Update broke the extension, it's working now but without the bottom bar buttons (will be added back in next update)

v1.3.0: Edge compatibility

v1.3.5-v1.3.7: classname hotfixes (Netflix keeps adjusting the class names which breaks the extension)

v1.4.0: Bottom Bar Buttons + Preference/classname patches

v1.4.5: classname patch

Licensed under the [GPL-3.0 License](LICENSE).
