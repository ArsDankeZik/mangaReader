GLOBAL_RESULT = [];

(async () => {
    localStorage.setItem('rootPathMangaReader', document.location.href);

    if (!searchIsEmpty()) {
        if (has((await getJSONUrl(document.location.href)), 'q')) await search((await getJSONUrl(document.location.href)).q, true);
    } else recommendationList();
})();


document.addEventListener('keydown', (e) => {
    if (e.key == 'Escape') {
        getSingle('#navbar input').value = '';
        removeChildsNode(getSingle('#results'));
        recommendationList();
    }
});

getSingle('#navbar input').addEventListener('keydown', async (e) => {
    await search(e, false);
});

async function search(e, auto) {
    document.querySelector('.recommendationList').innerHTML = '';
    if(auto && e == '') {
        recommendationList();
        return;
    }

    if(!auto && e.key == 'Enter' && e.currentTarget.value == '') {
        recommendationList();
        return;
    }

    if (auto) {
        const searchValue = e;
        const localSearch = searchValue ? mangaSessionStorage.search(searchValue) : null;
        let mangas = [];
        GLOBAL_RESULT = mangas;

        if (localSearch) {
            print('Local search');
            mangas = localSearch;
            GLOBAL_RESULT = mangas;
        } else {
            print('Remote search');
            mangas = await searchManga(searchValue);
            GLOBAL_RESULT = mangas;
            assingSearchResult(mangas);
        }

        if(!localSearch){
            print('Fill session storage');
            const giveFormat = (m) => {
                return {[m.title]: {
                    id: m?.id,
                    title: m?.title,
                    contentRating: m?.contentRating,
                    lastChapter: m?.lastChapter,
                    releaseDate: m?.releaseDate,
                    status: m?.status
                }};
            };

            mangas.map(m => {
                let formated = giveFormat(m);
                let title = Object.keys(formated)[0];
                mangaSessionStorage.writeManga(title, formated[title]);
            });

            print(mangaSessionStorage.read('mangas'));
            print(mangaSessionStorage.size());
        }

        removeChildsNode(getSingle('#results'));

        if (Object.values(mangas).length > 0) {
            changeURL(`${window.location.pathname}?q=${encodeURI(searchValue)}`);
            Object.values(mangas).forEach(async manga => {
                getSingle('#results').appendChild(await createResultCards(manga));
            });
        }
        else if (Object.values(mangas).length === 0)
            getSingle('#results').appendChild(await createDOMElement('span', fmt('No results for "%"!', [searchValue]), { class: 'no-results' }));
        else
            warn('No results!');
    }
    else if (!auto && e.key == 'Enter') {
        const searchValue = e.currentTarget.value.trim();
        const localSearch = searchValue ? mangaSessionStorage.search(searchValue) : null;
        let mangas = [];
        GLOBAL_RESULT = mangas;

        if (localSearch) {
            print('Local search');
            mangas = localSearch;
            GLOBAL_RESULT = mangas;
        } else {
            print('Remote search');
            mangas = await searchManga(searchValue);
            GLOBAL_RESULT = mangas;
            assingSearchResult(mangas);
        }

        if(!localSearch){
            print('Fill session storage');
            const giveFormat = (m) => {
                return {[m.title]: {
                    id: m?.id,
                    title: m?.title,
                    contentRating: m?.contentRating,
                    lastChapter: m?.lastChapter,
                    releaseDate: m?.releaseDate,
                    status: m?.status
                }};
            };

            mangas.map(m => {
                let formated = giveFormat(m);
                let title = Object.keys(formated)[0];
                mangaSessionStorage.writeManga(title, formated[title]);
            });
            
            print(mangaSessionStorage.read('mangas'));
            print(mangaSessionStorage.size());
        }

        removeChildsNode(getSingle('#results'));
        
        if (Object.values(mangas).length > 0) {
            changeURL(`${window.location.pathname}?q=${encodeURI(searchValue)}`);
            Object.values(mangas).forEach(async manga => {
                getSingle('#results').appendChild(await createResultCards(manga));
            });
        }
        else if (Object.values(mangas).length === 0)
            getSingle('#results').appendChild(await createDOMElement('span', fmt('No results for "%"!', [searchValue]), { class: 'no-results' }));
        else
            warn('No results!');
    }
}


// DOM CREATION
async function createResultCards(data) {
    const parent_div = await createDOMElement('div', '', { id: data.id, class: 'r-div-container' });
    const side_a = await createDOMElement('div', '', { class: 'side_a' });
    const side_b = await createDOMElement('div', '', { class: 'side_b' });

    const title = await createDOMElement('span', data.title, { class: 'r-title-card' });
    const category = await createDOMElement('span', data.contentRating, { class: 'r-category-card' });
    const read = await createDOMElement('a', 'Read', { class: 'r-read-card', href: 'chapter.html?c=' + `${data.id}` });

    // const image = await createDOMElement('img', '', { src: '', class: 'r-img-card', name: 'referrer', content: 'no-referrer' });
    // testImage(data.resultThumbImageUrl).then(x => image.src = x);

    // side_a.appendChild(image);

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
        data.map(name => resultSearch[name.title.toLowerCase()] = name)
        localStorage.setItem('searchResults', JSON.stringify(resultSearch));

        return true;
    } else if(JSON.parse(localStorage.getItem('searchResults')) && Object.entries(JSON.parse(localStorage.getItem('searchResults'))).length >= 63) {
        warn('Local storage searchResults overflowed');
        return false;
    } else if(!JSON.parse(localStorage.getItem('searchResults'))) {
        let resultSearch = {};
        data.map(name => resultSearch[name.title.toLowerCase()] = name)
        localStorage.setItem('searchResults', JSON.stringify(resultSearch));
        return true;
    }

    return false;
}

function isInSearchStorage(term) {
    const localSearch = localStorage.getItem('searchResults');
    if (!localSearch) return false;
    return localSearch.includes(`"${term}"`);
}

function getElementFromSearchStorage(term) {
    print('Get search result from local storage');
    return Object.values(JSON.parse(localStorage.getItem('searchResults')));
}



async function recommendationList() {
    const saveToLocalStorage = (o) => {
        const temp_localStorageObj = {
          recommendations: o,
          lastUpdated: new Date().getTime()
        };
        localStorage.setItem('recommendations', JSON.stringify(temp_localStorageObj));
      };
    
      const lastUpdatedData = JSON.parse(localStorage.getItem('recommendations'));
      const lastUpdated = lastUpdatedData ? lastUpdatedData.lastUpdated : -1;
      const hours = Math.floor((new Date().getTime() - lastUpdated) / (1000 * 60 * 60));
      print(`Last updated: ${hours} hours ago`);

    
      if (!lastUpdatedData || hours > 24 || lastUpdated === -1) {
        const res = await axios.get(`${JIKAN_API}recommendations/manga`);
        const data = res ? res.data.data.map(k => k.entry).flat().map((obj) => ({ ...obj })) : [];
        print('Recommendations updated!');
        saveToLocalStorage(data);
      }
    
      const storedData = JSON.parse(localStorage.getItem('recommendations'));
      let data = storedData ? storedData.recommendations : [];

      const removeDuplicates = (arr, prop) => {
        return arr.filter((obj, index, self) => self.findIndex((o) => o[prop] === obj[prop]) === index);
      } 

    if(data.length > 0) {
        document.querySelector('.recommendationList').innerHTML = '';

        // console.log(data)
        data = removeDuplicates(data, 'mal_id');
        data.forEach(async (data) => {
            const card = await createDOMElement('div', '', { class: 'card', id: data.mal_id});
            const cardImage = await createDOMElement('img', '', { class: 'card-img', src: '', alt: data.title, loading: 'lazy' });
            const cardTitle = await createDOMElement('h4', data.title, { class: 'card-title' });
            const cardButton = await createDOMElement('a', 'Read', { class: 'card-button', href: `./index.html?q=${data.title}` });

            
            card.appendChild(cardImage);
            card.appendChild(cardTitle);
            card.appendChild(cardButton);
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        cardImage.src = data.images.webp.image_url;
                    }
                });
            });
            observer.observe(card);

            document.querySelector('.recommendationList').appendChild(card);
        })

    }

    return;
}