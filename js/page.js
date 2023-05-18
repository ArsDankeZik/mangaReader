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

document.addEventListener('keydown', function (event) {
  if (event.key === '+') {
    document.querySelectorAll('img').forEach(img => img.style.width = (parseFloat(img.width) * 1.02) + 'px');
  }
})

document.addEventListener('keydown', function (event) {
  if (event.key === '-') {
    document.querySelectorAll('img').forEach(img => img.style.width = (parseFloat(img.width) / 1.02) + 'px');
  }
})

gestureRL();

async function search(e){
    const res = await getMangaChapterImageData(e);
}