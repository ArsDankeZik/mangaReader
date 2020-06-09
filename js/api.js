const F_CORS_HEROKU = 'https://cors-anywhere.herokuapp.com/';
const ROOT_API_HEROKU = 'https://mighty-journey-70253.herokuapp.com/';
const ROOT_API_MANGA = 'http://www.mangareader.net';
let URL_SEARCH_TERMS = 'https://mighty-journey-70253.herokuapp.com/search?t=';


async function searchManga(name){
    const search_term  = fmt('^^^', [F_CORS_HEROKU, URL_SEARCH_TERMS, encodeURI(name)], false, '^');
    const res = await axios.get(search_term);
    if(res && res.data.resultCount != 0) return res.data;
    return [];
}

async function getMangaChapters(name){
    const FORMAT = 'comic/?c=';
    const search_term  = fmt('^^^^^', [F_CORS_HEROKU, ROOT_API_HEROKU, FORMAT, ROOT_API_MANGA,encodeURI(name)], false, '^');
    const res = await axios.get(search_term);
    print(res);
    if(res && res.data.resultCount != 0) return res.data;
    return [];
}

async function getMangaChapterImageData(params){
    const search_chapters = fmt('^^^^', [F_CORS_HEROKU, ROOT_API_HEROKU, 'chapters/?c=', encodeURI(params)], false, '^');
    const res_chapters = await axios.get(search_chapters);
    let images = [];
    print(res_chapters);

    if(res_chapters && res_chapters.data.pageCount > 0){
        res_chapters.data.pages.forEach(async (page, i) => {
            const search_pages  = fmt('^^^^', [F_CORS_HEROKU, ROOT_API_HEROKU, 'page/?p=', encodeURI(page.pageFullUrl)], false, '^');
            print(search_pages);
            setTimeout(async () => {
                const page_res = await axios.get(search_pages);
    
                print(page_res.data.pageImage.imageSource);
                if(page_res && page_res.status == 200 &&  page_res.data) images.push(page_res.data.pageImage.imageSource);
                if(i == images.length)
                    return images;
            }, 320);
        });

    }

    // const res = await axios.get(search_term);
    // if(res.status == 200 && res.data) return res.data;
    return [];
}

