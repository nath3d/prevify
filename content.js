var overlay = null,
    frame = null,
    //datatestid
    cardId = 'card-click-handler',
    cardImageId = 'card-image',
    //class
    mainSection = '.Root__main-view', //'._6c8744e2ec860b2c766f3d26cc5e1969-scss',
    cardSection = '.OALAQFKvC7XQOVYpklB4', //'._3802c04052af0bb5d03956299250789e-scss',
    cardTitle = '.PPveH9n_yqp3k1Zk7rbj, .RTMaUOOWPswmV1oG8f1S', //'._3cfbde1fd9fecaaa77935664eeb6e346-scss, ._45331a50e3963ecc26575a06f1fd5292-scss',
    cardArtist = '.PPveH9n_yqp3k1Zk7rbj', //'._3cfbde1fd9fecaaa77935664eeb6e346-scss',
    cardArtwork = '.DeZUaoyaDtLMNKg6osSk, .gQd409_bPb3_EmGGIHZf';//'._0de6546a8c9a0ed2cc34a83aa2c4a47a-scss, ._810778d3df9b3dbdff12618620765fdf-scss';

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
        if (!checkForm(result))
            return
        if (findCardByClassName(result)) {
            hidePopup()
            return
        }
        if (findCardByDivId(result)) {
            hidePopup()
            return
        }
    })
}

function checkForm(result) {
    if (result.thumbnailProperties.title == '')
        return false
    if (result.thumbnailProperties.channelName == '')
        return false
    if (result.thumbnailProperties.thumbnail == null)
        return false
    return true
}

function findCardByClassName(result) {
    let cardPositionIndex = 0
    var activeScreen = document.querySelector(mainSection)
    if (activeScreen == null)
        activeScreen = document

    // Target only card section element
    let cards = activeScreen.querySelectorAll(cardSection)
    if (cards == null) {
        console.error('Error with the Spotify artwork extension : ' + cardSection + ' section not found')
        return false
    }
    if (cards.length == 0) {
        console.error('Error with the Spotify artwork extension : ' + cardSection + ' section not found')
        return false
    }
    // Select a random a card in between a range
    if (result.thumbnailProperties.shuffle) {
        const min = 1
        const max = cards.length - 1
        cardPositionIndex = Math.floor(Math.random() * (max - min + 1)) + min
    }
    let target = cards[cardPositionIndex]

    // Track artwork
    const thumbnail = target.querySelector(cardArtwork)
    if (thumbnail !== null)
        thumbnail.src = result.thumbnailProperties.thumbnail
    else {
        console.error('Error with the Spotify artwork extension : ' + cardArtwork + ' section not found')
        return false
    }
    // Track title
    const title = target.querySelector(cardTitle)
    if (title !== null)
        title.textContent = result.thumbnailProperties.title
    else {
        console.error('Error with the Spotify artwork extension : ' + cardTitle + ' section not found')
        return false
    }
    // Track artist
    let artist = target.querySelector(cardArtist)
    if (artist !== null)
        artist.textContent = result.thumbnailProperties.channelName
    else {
        console.error('Error with the Spotify artwork extension : ' + cardArtist + ' section not found')
        return false
    }
    // Scroll down to the card
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    return true
}

function findCardByDivId(result) {

    let cardPositionIndex = 0
    var activeScreen = document.querySelector(mainSection)
    if (activeScreen == null)
        activeScreen = document

    // Target only card section element
    let cards = activeScreen.querySelectorAll('[data-testid=' + cardId + ']')
    if (cards == null) {
        console.error('Error with the Spotify artwork extension : ' + cardId + ' id not found')
        return false
    }
    if (cards.length == 0) {
        console.error('Error with the Spotify artwork extension : ' + cardId + ' id not found')
        return false
    }
    // Select a random a card in between a range
    if (result.thumbnailProperties.shuffle) {
        const min = 1
        const max = cards.length - 1
        cardPositionIndex = Math.floor(Math.random() * (max - min + 1)) + min
    }
    let target = cards[cardPositionIndex]
    // Track artwork
    var cardImage = target.parentNode.querySelector('[data-testid=' + cardImageId + ']')
    if (cardImage == null) {
        console.error('Error with the Spotify artwork extension : ' + cardImageId + ' id not found')
        return false
    }
    cardImage.src = result.thumbnailProperties.thumbnail
    const cardImageParent = cardImage.parentNode.parentNode.parentNode

    // Track title & track artist
    let cardChilds = target.parentNode.childNodes
    if (cardChilds == null) {
        console.error('Error with the Spotify artwork extension : set track and artist name failed')
        return false
    }
    for (var cardChildIndex = 0; cardChildIndex < cardChilds.length; cardChildIndex++) {
        if (cardChilds[cardChildIndex] !== target && cardChilds[cardChildIndex] !== cardImageParent) {
            let cardTexts = cardChilds[cardChildIndex].childNodes
            if (cardTexts.length > 1) {
                // Track title 
                let cardTrackTitles = cardTexts[0].childNodes
                if (cardTrackTitles == null)
                    console.error('Error with the Spotify artwork extension : set track title failed')
                else {
                    if (cardTexts.length > 0)
                        cardTrackTitles[0].textContent = result.thumbnailProperties.title
                }
                // Track artist
                cardTexts[1].textContent = result.thumbnailProperties.channelName
            }
        }
    }

    // Scroll down to the card
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    return true
}

showPopup()
