var overlay = null,
    frame = null;

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
    // Select a random a card in between a range
    let cardPositionIndex = 0
	console.log(document)
	const activeScreen = document.querySelector('._6424f268be3505ebab663700d60ebaa6-scss._7321ea8cd8e8baded34054347ab0be48-scss')
	
    // Target only ytd-rich-item-renderer element and not ytd-rich-item-renderer with id content for the main page
    let cards = activeScreen.querySelectorAll('._3802c04052af0bb5d03956299250789e-scss')
	console.log(cards)
    /*if (cards.length === 0) {
        cards = activeScreen.getElementsByTagName('ytd-grid-video-renderer')
    }
    if (cards.length === 0) {
        cards = activeScreen.getElementsByTagName('ytd-compact-video-renderer')
    }*/

    chrome.storage.local.get('thumbnailProperties', (result) => {

        if (result.thumbnailProperties.shuffle) {
            const min = 1
            const max = 12
            cardPositionIndex = Math.floor(Math.random() * (max - min + 1)) + min
        }
        let target = cards[cardPositionIndex]
		console.log(target)
        const thumbnail = target.querySelector('._0de6546a8c9a0ed2cc34a83aa2c4a47a-scss, ._810778d3df9b3dbdff12618620765fdf-scss')
		console.log(thumbnail)
        thumbnail.src = result.thumbnailProperties.thumbnail

        const title = target.querySelector('._3cfbde1fd9fecaaa77935664eeb6e346-scss, ._45331a50e3963ecc26575a06f1fd5292-scss')
		console.log(thumbnail)
        let channelName = target.querySelector('._3cfbde1fd9fecaaa77935664eeb6e346-scss a')
        /*if (!channelName) {
            channelName = target.querySelector('.ytd-channel-name')
        }*/

        title.textContent = result.thumbnailProperties.title
        channelName.textContent = result.thumbnailProperties.channelName

        /*// Channel's thumbnail management
        let channelThumbnailFromExtension = result.thumbnailProperties.channelThumbnail
        let channelThumbnailFromYoutube = document.querySelector('#avatar-btn .yt-img-shadow')

        // By default, we get the image from the extension
        let channelThumbnailValue = channelThumbnailFromExtension

        // But if there's no image then we try to get the real YT thumbnail
        // => Thumbnail from YT is null if not logged in so we check for it
        if (channelThumbnailValue == null && channelThumbnailFromYoutube != null) {
            channelThumbnailValue = channelThumbnailFromYoutube.src
        }

        // Finally, set the channel's thumbnail in the preview
        let avatar = target.querySelector('#avatar-link img')
        if (avatar) {
            avatar.src = channelThumbnailValue
        }*/

        hidePopup()
    })
}

showPopup()
