(async () => {
    if(has((await getJSONUrl(document.location.href)), 'p')) {
        const term = (await getJSONUrl(document.location.href)).p;
        await search(term);
    }
})();

async function search(e){
    const res = await getMangaChapterImageData(e);
}

async function genList(data){
    return await createDOMElement('img', '', {class: 'generic-manga-page', src: data});
}