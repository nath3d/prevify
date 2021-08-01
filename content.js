var overlay = null,
    frame = null;
	mainSection = '._6c8744e2ec860b2c766f3d26cc5e1969-scss'
	cardSection = '._3802c04052af0bb5d03956299250789e-scss'
	cardTitle = '._3cfbde1fd9fecaaa77935664eeb6e346-scss, ._45331a50e3963ecc26575a06f1fd5292-scss'
	cardArtist = '._3cfbde1fd9fecaaa77935664eeb6e346-scss'
	cardArtwork = '._0de6546a8c9a0ed2cc34a83aa2c4a47a-scss, ._810778d3df9b3dbdff12618620765fdf-scss'

window.__PREVYOU_LOADED = true

// Event send by the inner `<object>` script
window.addEventListener('message', e => {
    if (e.data && e.data.type === 'find_card') {
        findCard()
    }
})

// Event send by the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == "popup") {
        //console.log(request);
        showPopup();
    } else if (request.type === 'close_popup') {
        hidePopup();
    }
    return true;
});

function showPopup() {
    
	if (document.querySelector(".py-popup-overlay")) {
        hidePopup();
        return false;
    }

    overlay = document.createElement('div');
    frame = document.createElement('object');

    overlay.className = "py-popup-overlay";
    frame.className = "py-popup-container";
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("frameborder", "0");

    // file need to be added in manifest web_accessible_resources
    frame.data = chrome.runtime.getURL("popup.html");
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", hidePopup);
}

function hidePopup() {
    // Remove EventListener
    overlay.removeEventListener("click", hidePopup);
    // Remove the elements:
    document.querySelector(".py-popup-overlay").remove();
    // Clean up references:
    overlay = null;
    frame = null;
}

function findCard() {
	
    chrome.storage.local.get('thumbnailProperties', (result) => {

        if(result.thumbnailProperties.title == '')
            return
        if(result.thumbnailProperties.channelName == '')
            return
        if(result.thumbnailProperties.thumbnail == null)
            return

        // Select a random a card in between a range
        let cardPositionIndex = 0
        const activeScreen = document.querySelector(mainSection)
        // Target only card section element with id content for the main page
        let cards = activeScreen.querySelectorAll(cardSection)

        if (result.thumbnailProperties.shuffle) {
            const min = 1
            const max = cards.length - 1
            cardPositionIndex = Math.floor(Math.random() * (max - min + 1)) + min
        }
        let target = cards[cardPositionIndex]
		
		//Track artwork
        const thumbnail = target.querySelector(cardArtwork)
        if(thumbnail !== null)
            thumbnail.src = result.thumbnailProperties.thumbnail
		//Track title
        const title = target.querySelector(cardTitle)
        if(title !== null)
		title.textContent = result.thumbnailProperties.title
		//Track artist
        let artist = target.querySelector(cardArtist)
        if(artist !== null)
            artist.textContent = result.thumbnailProperties.channelName
		//Scroll down to the card
		cards[cardPositionIndex].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
		
        hidePopup()
    })
}

showPopup()
