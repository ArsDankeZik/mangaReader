(async () => {
    if(has((await getJSONUrl(document.location.href)), 'c')) {
        const term = (await getJSONUrl(document.location.href)).c;
        await search(term);
    }
})();

async function search(e){
    const res = await getMangaChapters(e);
    // print(res);

    if(res.chapterCount > 0){
        getSingle('#chapters').appendChild(await genList(res));
    }
}

async function genList(data){
    const term = (await getJSONUrl(document.location.href)).c.split('/')[1];
    const div = await createDOMElement('div', '', { id: term });
    const ol = await createDOMElement('ol', '', { class: 'ol-list' })
    
    data.chapters.forEach(async chapter => {
        const li = await createDOMElement('li', '', { id: chapter.chapterTitle.split(' ').join('') });
        const a = await createDOMElement('a', chapter.chapterTitle + ' - '+ (chapter.chapterDate), { href: './page.html?p='+encodeURI(chapter.chapterFullUrl), target: '_blank' });
        li.appendChild(a);
        ol.appendChild(li);
    });

    div.appendChild(ol);
    return div;
}