if(mangaSessionStorage.recentlyReadMangas() && mangaSessionStorage.recentlyReadMangas().length > 0) recentlyReaded();

async function recentlyReaded(){
    const container = getSingle('#manga-container');
    container.innerHTML = '';

    const recentlyReadedMangas = mangaSessionStorage.recentlyReadMangas();

    print(recentlyReadedMangas)
    if(recentlyReadedMangas && recentlyReadedMangas.length > 0){
        // ===================
        const div = await createDOMElement('div', '', { id: recentlyReadedMangas.id, style: 'margin-top: 6rem;display:flex;flex-direction:row;justify-content:center;align-items: center;' })
        const ol = await createDOMElement('ol', '', { class: 'ol-list' })

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

        // ===================
        // recentlyReadedMangas.forEach(async (data) => {
        //     const card = await createDOMElement('div', '', { class: 'card', id: data.mal_id});
        //     const cardImage = await createDOMElement('img', '', { class: 'card-img', src: '', alt: data.title, loading: 'lazy' });
        //     const cardTitle = await createDOMElement('h4', data.title, { class: 'card-title' });
        //     const cardButton = await createDOMElement('a', 'Read', { class: 'card-button', href: './index.html?q=' + `${data.title}` });

            
        //     card.appendChild(cardImage);
        //     card.appendChild(cardTitle);
        //     card.appendChild(cardButton);
            
        //     const observer = new IntersectionObserver((entries) => {
        //         entries.forEach((entry) => {
        //             if (entry.isIntersecting) {
        //                 cardImage.src = data.images.webp.image_url;
        //             }
        //         });
        //     });
        //     observer.observe(card);

        //     container.appendChild(card);
        // })
    }
}
