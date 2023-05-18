const ROOT_API_MANGA = 'https://consumet-gamma.vercel.app/manga/mangadex/';


async function searchManga(name) {
    let search_term = fmt('^^', [ROOT_API_MANGA, encodeURI(name)], false, '^');

    // const res = await axios.get(search_term);
    const res = await axios({
        method: 'get',
        url: search_term,
        responseType: 'json'
      });

    if (res && res.data.resultCount != 0) return res.data.results;
    return [];
}

async function getMangaChapters(id) {
    const localStorageUrl = JSON.parse(sessionStorage.getItem('manga')) ? JSON.parse(sessionStorage.getItem('manga')).url : null;
    
    if(localStorageUrl == id) {
        print('Get manga chapters from local storage!');

        if(ROOT_API_MANGA.includes('mangahere')) return JSON.parse(sessionStorage.getItem('manga')).chapters.map((obj) => {
            const chapterNumber = parseFloat(obj.title.match(/Ch\.(\d+(?:\.\d+)?)/)[1], 10);
            return { ...obj, chapterNumber };
          });

        return JSON.parse(sessionStorage.getItem('manga')).chapters;
    }

    const FORMAT = ROOT_API_MANGA.includes('mangahere') ? 'info?id=' : 'info/';
    let search_term = fmt('^^^', [ROOT_API_MANGA, FORMAT, encodeURI(id)], false, '^');

    const res = await axios.get(search_term);

    print(res.data)
    if (res && res.data && res.data.chapters.length != 0) {
        let temp_o = {};
        temp_o['chapters'] = res.data.chapters;
        temp_o['url'] = id;
        sessionStorage.setItem('manga', JSON.stringify(temp_o));

        if(ROOT_API_MANGA.includes('mangahere')) return res.data.chapters.map((obj) => {
            const chapterNumber = parseFloat(obj.title.match(/Ch\.(\d+(?:\.\d+)?)/)[1], 10);
            return { ...obj, chapterNumber };
          });

        return res.data.chapters;
    }
    return [];
}

async function getMangaChapterImageData(params) {
    timeStart('GetImages');
    try {
        const FORMAT = ROOT_API_MANGA.includes('mangahere') ? 'read?chapterId=' : 'read/';

        let search_chapters = fmt('^^^', [ROOT_API_MANGA, FORMAT, encodeURI(params)], false, '^');
        print(search_chapters);
        
        const res_chapters = {};
        res_chapters['chapter_url'] = params;

        if(!JSON.parse(sessionStorage.getItem('chapter_data')) || !Object.keys(JSON.parse(sessionStorage.getItem('chapter_data'))).includes(params)) {
            res_chapters['data'] = (await axios.get(search_chapters)).data;
            const temp_sess = {};
            temp_sess[params] = res_chapters['data'];

            !sessionStorage.getItem('chapter_data') ? sessionStorage.setItem('chapter_data', JSON.stringify(temp_sess)) : sessionStorage.setItem('chapter_data', JSON.stringify(Object.assign(JSON.parse(sessionStorage.getItem('chapter_data')), temp_sess)));
            
        }
        else {
            print('Get manga chapter images from local storage!');
            res_chapters['data'] = JSON.parse(sessionStorage.getItem('chapter_data'))[params];
        }

        if (res_chapters && res_chapters.data.length > 0) {
            const lastImgPage = JSON.parse(sessionStorage.getItem('chapter_data'))[params].findLast(n => n.page);

            res_chapters.data.forEach((page, i) => {
                createDOMElement('img', '', { width: 700, class: 'generic-manga-page', class: 'lazy',src: page.img, 'data-src': page.img, loading: 'lazy', alt: `Page ${page.page}`, referrerpolicy: "no-referrer" })
                    .then(dom => {
                        if(lastImgPage.page == page.page) dom.style.marginBottom = '4rem';
                        if(page.page > 2) {
                            setTimeout(() => {
                                if (page.img != undefined) getSingle('#pages').appendChild(dom);
                            }, 2500);
                        }

                });
                
            });
        }

        setTimeout(() => {
            getSingle('#controls').style.display = 'flex';
            const sortedTempStorage = JSON.parse(sessionStorage.getItem('manga')).chapters.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber));
            const posCur = sortedTempStorage.map(x => x.id).indexOf(params);
            const posMax = sortedTempStorage.map(x => x.id).length;

            if (posCur == 0) {
                getSingle('#back').href = './page.html?p=' + encodeURI(sortedTempStorage.map(x => x.id)[posCur]);
                getSingle('#next').href = './page.html?p=' + encodeURI(sortedTempStorage.map(x => x.id)[posCur + 1]);
            } else if (posCur > 0 && posCur < posMax - 1) {
                getSingle('#back').href = './page.html?p=' + encodeURI(sortedTempStorage.map(x => x.id)[posCur - 1]);
                getSingle('#next').href = './page.html?p=' + encodeURI(sortedTempStorage.map(x => x.id)[posCur + 1]);
            } else if (posCur == posMax - 1) {
                getSingle('#back').href = './page.html?p=' + encodeURI(sortedTempStorage.map(x => x.id)[posCur - 1]);
                getSingle('#next').href = './page.html?p=' + encodeURI(sortedTempStorage.map(x => x.id)[posCur]);
            }
        }, 500);

    } catch (err) {
        warn(err);
    }
    timeEnd('GetImages');
    return [];
}

