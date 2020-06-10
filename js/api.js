const F_CORS_HEROKU = 'https://cors-anywhere.herokuapp.com/';
const ROOT_API_HEROKU = 'https://mighty-journey-70253.herokuapp.com/';
const ROOT_API_MANGA = 'http://www.mangareader.net';
let URL_SEARCH_TERMS = 'https://mighty-journey-70253.herokuapp.com/search?t=';


async function searchManga(name) {
    let search_term = fmt('^^^', [F_CORS_HEROKU, URL_SEARCH_TERMS, encodeURI(name)], false, '^');

    if((await ping('http://localhost:3003')) == true)
        search_term = fmt('^^^', ['http://localhost:3003/', 'search/?t=', encodeURI(name)], false, '^');

    const res = await axios.get(search_term);
    if (res && res.data.resultCount != 0) return res.data;
    return [];
}

async function getMangaChapters(name) {
    const FORMAT = 'comic/?c=';
    let search_term = fmt('^^^^^', [F_CORS_HEROKU, ROOT_API_HEROKU, FORMAT, ROOT_API_MANGA, encodeURI(name)], false, '^');

    if((await ping('http://localhost:3003')) == true)
        search_term = fmt('^^^', ['http://localhost:3003/', FORMAT, ROOT_API_MANGA+encodeURI(name)], false, '^');

    const res = await axios.get(search_term);
    if (res && res.data.resultCount != 0) {
        localStorage.setItem('manga', JSON.stringify(res.data));
        return res.data;
    }
    return [];
}

async function getMangaChapterImageData(params) {
    try{
        let search_chapters = fmt('^^^^', [F_CORS_HEROKU, ROOT_API_HEROKU, 'chapters/?c=', encodeURI(params)], false, '^');

        if((await ping('http://localhost:3003')) == true)
            search_term = fmt('^^^', ['http://localhost:3003/', 'chapters/?c=', encodeURI(name)], false, '^');
    
        const res_chapters = await axios.get(search_chapters);

        if (res_chapters && res_chapters.data.pageCount > 0) {
            obj_dame = {};

            localStorage.setItem('links', '');
            res_chapters.data.pages.forEach((page, i) => {
                ping('http://localhost:3003').then(ping_res => {
                    let search_pages = fmt('^^^^', [F_CORS_HEROKU, ROOT_API_HEROKU, 'page/?p=', encodeURI(page.pageFullUrl)], false, '^');
                    if(ping_res == true) search_pages = fmt('^^^', ['http://localhost:3003/', 'page/?p=', encodeURI(page.pageFullUrl)], false, '^');
                    axios.get(search_pages).then(page_res => {
                        if (page_res && page_res.status == 200 && page_res.data) {
                            let temp = page_res.data.pageImage.imageAlt;
                            if(i == 1)
                                localStorage.setItem('links', localStorage.getItem('links')+';'+temp.substring(temp.lastIndexOf(' ')+1)+'+'+page_res.data.pageImage.imageSource+';');
                            localStorage.setItem('links', localStorage.getItem('links')+';'+temp.substring(temp.lastIndexOf(' ')+1)+'+'+page_res.data.pageImage.imageSource);
                            
                        }
                    })
                }); 
            });

            setTimeout(() => {
                let atemp = localStorage.getItem('links').split(';');
                atemp.forEach(ll => obj_dame[ll.split('+')[0]] = ll.split('+')[1]);
                Object.entries(obj_dame).forEach(l => {
                    createDOMElement('img', '', {class: 'generic-manga-page', src: l[1], alt: l[0]})
                    .then(dom => {
                        if(l[1] != undefined)
                            getSingle('#pages').appendChild(dom);
                    });
                })
            }, 4000)
        }
        
        setTimeout(()=>{
            getSingle('#controls').style.display = 'flex';
            const posCur = JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl).indexOf(params);
            const posMax = JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl).length;

            print(posCur);
            if(posCur == 0){
                getSingle('#back').href = './page.html?p='+encodeURI(JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl)[posCur]);
                getSingle('#next').href = './page.html?p='+encodeURI(JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl)[posCur+1]);
            }else if(posCur > 0 && posCur < posMax-1){
                getSingle('#back').href = './page.html?p='+encodeURI(JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl)[posCur-1]);
                getSingle('#next').href = './page.html?p='+encodeURI(JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl)[posCur+1]);
            }else if(posCur == posMax-1){
                getSingle('#back').href = './page.html?p='+encodeURI(JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl)[posCur-1]);
                getSingle('#next').href = './page.html?p='+encodeURI(JSON.parse(localStorage.getItem('manga')).chapters.map(x => x.chapterFullUrl)[posCur]);
            }
        }, 5000);
    
    }catch(err){
        warn(err);
    }
    
    return [];
}

