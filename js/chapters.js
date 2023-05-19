gestures(localStorage.getItem('rootPathMangaReader'));

(async () => {
    if (has((await getJSONUrl(document.location.href)), 'c')) {
        const term = (await getJSONUrl(document.location.href)).c;
        await search(term);
    }
})();

async function search(e) {
    let res = await getMangaChapters(e);
    if(res.hasOwnProperty('last_read') || res.hasOwnProperty('lastUpdated')){
        delete res['last_read'];
        delete res['lastUpdated'];
        res = Object.values(res);
    }
    
    if(res) res = res.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)).filter(n => n.pages > 0);
    else return;

    if (res.length > 0) getSingle('#chapters').appendChild(await genList(res));
}

async function genList(data) {
    const term = (await getJSONUrl(document.location.href)).c;
    const div = await createDOMElement('div', '', { id: term });
    const ol = await createDOMElement('ol', '', { class: 'ol-list' })

    if(data){
        data.forEach(async chapter => {
            const li = await createDOMElement('li', '', { id: chapter.title.split(' ').join('')+'-'+chapter.chapterNumber });
            const a = await createDOMElement('a', chapter.title, { href: './page.html?p=' + encodeURI(chapter.id) });
            li.appendChild(a);
            ol.appendChild(li);
        });
    
        div.appendChild(ol);
    }
    return div;
}
