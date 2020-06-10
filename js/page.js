(async () => {
    if(has((await getJSONUrl(document.location.href)), 'p')) {
        const term = (await getJSONUrl(document.location.href)).p;
        await search(term);
        
        getSingle('#back').addEventListener('click', e => {
            if(similarity(e.currentTarget.href, document.location.href) == 100){
                e.preventDefault();
            }
        });

        getSingle('#next').addEventListener('click', e => {
            if(similarity(e.currentTarget.href, document.location.href) == 100){
                e.preventDefault();
            }
        });
    }
})();

async function search(e){
    const res = await getMangaChapterImageData(e);
}

/**
 * Gestures
 */
(async () => {
    var myRegion = new ZingTouch.Region(document.body);
    var myElement = document.getElementById('container');

    myRegion.bind(myElement, 'swipe',  (e) => {
        let grades = Math.floor(e.detail.data[0].currentDirection);
        if(grades >= 180 && grades <= 190) getSingle('#next').click();
        else if(grades >= 350 && grades <= 360) getSingle('#back').click();
    });
})();