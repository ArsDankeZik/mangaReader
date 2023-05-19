if(mangaSessionStorage.recentlyReadMangas() && mangaSessionStorage.recentlyReadMangas().length > 0) recentlyReaded();

async function recentlyReaded(){
    const container = getSingle('#manga-container');
    container.innerHTML = '';

    const recentlyReadedMangas = mangaSessionStorage.recentlyReadMangas();

    if(recentlyReadedMangas && recentlyReadedMangas.length > 0){
        
        const div = await createDOMElement('div', '', { id: 'list-recently-added', style: 'margin-top: 6rem;display:flex;flex-direction:column;justify-content:center;align-items: center;' })
        const ol = await createDOMElement('ol', '', { class: 'ol-list', style: 'width:40rem' })

        recentlyReadedMangas.forEach(async (data) => {
          const li = await createDOMElement('li', '', {
            id:
              data.title.split(' ').join('') +
              '-' +
              data.chapterNumber,
          })
          const a = await createDOMElement('a', data.title, {
            href: './page.html?p=' + encodeURI(data.chapters.last_read),
          })
          li.appendChild(a)
          ol.appendChild(li)
        })

        div.appendChild(ol)
        container.appendChild(div)
    }
}
