GLOBAL_RESULT = [];

(async () => {
    localStorage.setItem('rootPathMangaReader', document.location.href);

    if (!searchIsEmpty()) {
        if (has((await getJSONUrl(document.location.href)), 'q')) await search((await getJSONUrl(document.location.href)).q, true);
    }
})();

getSingle('#navbar input').addEventListener('keydown', async (e) => {
    await search(e, false);
});

async function search(e, auto) {
    if (auto) {
        const searchValue = e;
        let mangas = [];
        GLOBAL_RESULT = mangas;

        if (isInSearchStorage(searchValue)) {
            mangas = getElementFromSearchStorage(searchValue);
        } else {
            mangas = await searchManga(searchValue);
            assingSearchResult(mangas);
        }

        removeChildsNode(getSingle('#results'));

        if (mangas.resultCount > 0) {
            changeURL(`${window.location.pathname}?q=${encodeURI(searchValue)}`);
            mangas.results.forEach(async manga => {
                getSingle('#results').appendChild(await createResultCards(manga));
            });
        }
        else if (mangas.length === 0)
            getSingle('#results').appendChild(await createDOMElement('span', fmt('No results for "%"!', [searchValue]), { class: 'no-results' }));
        else
            warn('No results!');
    }
    else if (!auto && e.key == 'Enter') {
        const searchValue = e.currentTarget.value.trim();
        let mangas = [];
        GLOBAL_RESULT = mangas;

        if (isInSearchStorage(searchValue)) {
            mangas = getElementFromSearchStorage(searchValue);
        } else {
            mangas = await searchManga(searchValue);
            assingSearchResult(mangas);
        }

        changeURL(`${window.location.pathname}?q=${encodeURI(searchValue)}`);
        removeChildsNode(getSingle('#results'));

        if (mangas.resultCount > 0) {
            mangas.results.forEach(async manga => {
                getSingle('#results').appendChild(await createResultCards(manga));
            });
        }
        else if (mangas.length === 0)
            getSingle('#results').appendChild(await createDOMElement('span', fmt('No results for "%"!', [searchValue]), { class: 'no-results' }));
        else
            warn('No results!');
    }
}


// DOM CREATION
async function createResultCards(data) {
    const parent_div = await createDOMElement('div', '', { id: data.resultUrl.split('/')[1], class: 'r-div-container' });
    const side_a = await createDOMElement('div', '', { class: 'side_a' });
    const side_b = await createDOMElement('div', '', { class: 'side_b' });

    const title = await createDOMElement('a', data.resultName, { class: 'r-title-card', href: data.resultFullUrl, target: '_blank' });
    const category = await createDOMElement('span', data.resultGenre, { class: 'r-category-card' });
    const read = await createDOMElement('a', 'Read', { class: 'r-read-card', href: 'chapter.html?c=' + data.resultUrl });

    const image = await createDOMElement('img', '', { src: '', class: 'r-img-card', name: 'referrer', content: 'no-referrer' });
    testImage(data.resultThumbImageUrl).then(x => image.src = x);

    side_a.appendChild(image);

    side_b.appendChild(title);
    side_b.appendChild(category);
    side_b.appendChild(read);

    parent_div.appendChild(side_a);
    parent_div.appendChild(side_b);
    return parent_div;
}

function testImage(url) {
    // Define the promise
    const imgPromise = new Promise(function imgPromise(resolve, reject) {
        const imgElement = new Image();
        imgElement.addEventListener('load', function imgOnLoad() {
            resolve(this.src);
        });
        imgElement.addEventListener('error', function imgOnError() {
            reject('https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png');
        });
        imgElement.src = url;
    });
    return imgPromise;
}


function assingSearchResult(data) {
    if (JSON.parse(localStorage.getItem('searchResults')) && Object.entries(JSON.parse(localStorage.getItem('searchResults'))).length < 63) {
        let resultSearch = JSON.parse(localStorage.getItem('searchResults'));
        resultSearch[data.searchTerm] = data;
        localStorage.setItem('searchResults', JSON.stringify(resultSearch));

        return true;
    } else if(JSON.parse(localStorage.getItem('searchResults')) && Object.entries(JSON.parse(localStorage.getItem('searchResults'))).length >= 63) {
        warn('Local storage searchResults overflowed');
        return false;
    } else if(!JSON.parse(localStorage.getItem('searchResults'))) {
        let resultSearch = {};
        resultSearch[data.searchTerm] = data;
        localStorage.setItem('searchResults', JSON.stringify(resultSearch));
        return true;
    }

    return false;
}

function isInSearchStorage(term) {
    const localSearch = localStorage.getItem('searchResults');
    if (JSON.parse(localSearch)) return JSON.parse(localSearch).hasOwnProperty(term);
    return false;
}

function getElementFromSearchStorage(term) {
    print('Get search result from local storage');
    return JSON.parse(localStorage.getItem('searchResults'))[term];
}
