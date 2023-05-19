const ROOT_API_MANGA = 'https://consumet-gamma.vercel.app/manga/mangadex/';
const JIKAN_API = 'https://api.jikan.moe/v4/';


async function searchManga(name) {
    let search_term = fmt('^^', [ROOT_API_MANGA, encodeURI(name)], false, '^');

    const res = await axios({
        method: 'get',
        url: search_term,
        responseType: 'json'
      });

    if (res && res.data.resultCount != 0) return res.data.results;
    return [];
}

async function getMangaChapters(id) {
    const manga = mangaSessionStorage.mangaExists(id) ? mangaSessionStorage.getMangaById(id) : null;

    if(manga && Object.values(manga.chapters).length > 2 ) {
        print('Get manga chapters from local storage!');
        return manga.chapters;
    }
    print('Get manga chapters from API!');

    const FORMAT = 'info/';
    let search_term = fmt('^^^', [ROOT_API_MANGA, FORMAT, encodeURI(id)], false, '^');

    const res = await axios.get(search_term);

    if (res && res.data && res.data.chapters.length != 0) {
        res.data.chapters.map(chapter => {
            Object.assign(chapter, {pages_loaded: {}})
            Object.assign(chapter, {manga_id: manga.id})
            Object.assign(chapter, {manga_title: manga.title})
            mangaSessionStorage.writeChapterToSessionStorage(manga.title, chapter.id, chapter)
        });

        return res.data.chapters;
    }
    return [];
}

async function getMangaChapterImageData(params) {
    timeStart('GetImages');
    try {
        const FORMAT = 'read/';
        let search_chapters = fmt('^^^', [ROOT_API_MANGA, FORMAT, encodeURI(params)], false, '^');
        
        const mangaInfo = mangaSessionStorage.getMangaByChapterId(params);
        const lastMangaReaded = mangaSessionStorage.getLastReadChapterId(mangaInfo.title)
        
        if(lastMangaReaded == -1 || lastMangaReaded != params) mangaSessionStorage.setLastReadChapterId(mangaInfo.title, params);
        
        document.title = `${mangaInfo.title} - ${mangaInfo.chapters[params].chapterNumber}`;
        
        // Check if chapter is in local storage and has all pages loaded
        if(mangaInfo.chapters[params] && Object.keys(mangaInfo.chapters[params].pages_loaded).length == mangaInfo.chapters[params].pages) {
            print('Get manga chapter images from local storage!');
          } else {
            print('Get manga chapter images from API!');
            const res = (await axios.get(search_chapters)).data;
            if(res) mangaSessionStorage.writePagesLoaded(mangaInfo.title, params, res)
            else warn('No chapter found!');
          }
          
          const mangaPagesLoaded = mangaSessionStorage.readPagesLoaded(mangaInfo.title, params);
          
          if (mangaPagesLoaded && mangaPagesLoaded.length > 0) {
            const lastImgPage = mangaPagesLoaded.findLast(n => n.page);
            print(`${lastImgPage.page} images!`);

            mangaPagesLoaded.forEach((page, i) => {
                createDOMElement('img', '', { width: 700, class: 'generic-manga-page', class: 'lazy',src: '', 'data-src': page.img, loading: 'lazy', alt: `Page ${page.page}`, referrerpolicy: "no-referrer" })
                    .then(dom => {

                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach((entry) => {
                                if (entry.isIntersecting) dom.src = page.img;
                            });
                        });
                        observer.observe(dom);

                        if(lastImgPage.page == page.page) dom.style.marginBottom = '4rem';

                        if(page.img) getSingle('#pages').appendChild(dom);
                        else warn('No image found! ('+page.img+')');

                });
                
            });
        }

        setTimeout(() => {
            getSingle('#controls').style.display = 'flex';
            const ids = mangaSessionStorage.getAdjacentChapters(params);

            getSingle('#chapter-list').href = './chapter.html?c=' + encodeURI(mangaInfo.chapters[params].manga_id);
            if(ids.prev) getSingle('#back').href = './page.html?p=' + encodeURI(ids.prev);
            if(ids.next)  getSingle('#next').href = './page.html?p=' + encodeURI(ids.next);
        }, 500);

    } catch (err) {
        warn(err);
    }
    timeEnd('GetImages');
    return [];
}

const mangaSessionStorage = {
    read(key) {
      const data = sessionStorage.getItem(key);
      return JSON.parse(data);
    },

    search(keyName) {
        const mangaData = this.read('mangas');
        if (!mangaData) return null;

        const similarKeys = Object.keys(mangaData).filter((key) =>
          key.toLowerCase().includes(keyName.toLowerCase())
        );
    
        const result = {};
        similarKeys.forEach((key) => {
          result[key] = mangaData[key];
        });

        if (Object.keys(result).length === 0) return null;
        if(result && (new Date().getTime() - Object.values(result)[0].lastUpdated > (12 * 60 * 60 * 1000))) return null;

        return result;
    },

    
    size() {
        return Object.keys(this.read('mangas')).length;
    },
  
    write(key, value) {
      const data = JSON.stringify(value);
      sessionStorage.setItem(key, data);
    },

    writeManga(mangaTitle, mangaData) {
        const existingMangaData = this.read('mangas') || {};
    
        if (!existingMangaData[mangaTitle]) {
          existingMangaData[mangaTitle] = {
            id: null,
            title: null,
            contentRating: null,
            releaseDate: -1,
            lastChapter: -1,
            lastUpdated: new Date().getTime(),
            status: null,
            chapters: {
              last_read: -1,
              lastUpdated: new Date().getTime()
            }
          };
        }
    
        // Update the existing properties with new values
        Object.assign(existingMangaData[mangaTitle], mangaData);
    
        this.write('mangas', existingMangaData);
    },
  
    readChapter(mangaTitle, chapterId) {
      const mangaData = this.read('mangas');
      if (mangaData && mangaData[mangaTitle] && mangaData[mangaTitle].chapters && mangaData[mangaTitle].chapters[chapterId]) {
        return mangaData[mangaTitle].chapters[chapterId];
      }
      return null;
    },

    mangaExists(mangaId) {
        const mangaData = mangaSessionStorage.read('mangas');
        return mangaData && Object.values(mangaData).some(manga => manga.id === mangaId);
    },

    getMangaById(mangaId) {
        const mangaData = mangaSessionStorage.read('mangas');
        if (!mangaData) return null;
      
        return Object.values(mangaData).find(manga => manga.id === mangaId) || null;
    },

    getMangaByChapterId(chapterId) {
        const mangaData = mangaSessionStorage.read('mangas');
        if (!mangaData) return null;
      
        return Object.values(mangaData).find(manga => {
          const chapters = manga.chapters || {};
          return Object.values(chapters).some(chapter => chapter.id === chapterId);
        }) || null;
    },
  
    writeChapterToSessionStorage(mangaTitle, chapterId, chapterData) {
        const mangaData = this.read('mangas') || {};
        if (!mangaData[mangaTitle]) {
          mangaData[mangaTitle] = {
            id: null,
            title: null,
            contentRating: null,
            releaseDate: -1,
            lastChapter: -1,
            lastUpdated: new Date().getTime(),
            status: null,
            chapters: {
              last_read: -1,
              lastUpdated: new Date().getTime(),
            }
          };
        }
        
        const existingChapterData = mangaData[mangaTitle].chapters[chapterId];
    
        // Merge existing chapter data with new data
        if (existingChapterData) Object.assign(existingChapterData, chapterData);
        // Add new chapter data
        else mangaData[mangaTitle].chapters[chapterId] = chapterData;
    
        mangaData[mangaTitle].chapters[chapterId].lastUpdated = new Date().getTime();
        mangaData[mangaTitle].lastUpdated = new Date().getTime();

        this.write('mangas', mangaData);
      },
  
    getLastReadChapterId(mangaTitle) {
      const mangaData = this.read('mangas');
      if (mangaData && mangaData[mangaTitle] && mangaData[mangaTitle].chapters && mangaData[mangaTitle].chapters.last_read) {
        return mangaData[mangaTitle].chapters.last_read;
      }
      return null;
    },
  
    setLastReadChapterId(mangaTitle, chapterId) {
      const mangaData = this.read('mangas');
      if (mangaData && mangaData[mangaTitle] && mangaData[mangaTitle].chapters) {
        mangaData[mangaTitle].chapters.last_read = chapterId;
        this.write('mangas', mangaData);
      }
    },

    readPagesLoaded(mangaTitle, chapterId) {
        const mangaData = mangaSessionStorage.read('mangas');
        if (mangaData && mangaData[mangaTitle] && mangaData[mangaTitle].chapters && mangaData[mangaTitle].chapters[chapterId]) {
          return mangaData[mangaTitle].chapters[chapterId].pages_loaded;
        }
        return null;
    },

    writePagesLoaded(mangaTitle, chapterId, pagesLoaded) {
        const mangaData = mangaSessionStorage.read('mangas');

        if (mangaData && mangaData[mangaTitle] && mangaData[mangaTitle].chapters && mangaData[mangaTitle].chapters[chapterId]) {
            mangaData[mangaTitle].chapters[chapterId].pages_loaded = pagesLoaded;
            this.write('mangas', mangaData);
        }
    },

    recentlyReadMangas() {
        const mangaData = this.read('mangas');
        if (!mangaData) return null;

        const recentlyReadMangas = Object.values(mangaData).filter(manga => manga.chapters.last_read != -1).sort((a, b) => b.lastUpdated - a.lastUpdated);
        return recentlyReadMangas;
    },

    sortChapters(chapters) {
      if(chapters.hasOwnProperty('last_read')) delete(chapters.last_read);
      if(chapters.hasOwnProperty('lastUpdated')) delete(chapters.lastUpdated);
      chapters = Object.values(chapters);
      
      return chapters.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber));
    },

    getAdjacentChapters(currentChapterId) {
      const chapters = this.sortChapters(this.getMangaByChapterId(currentChapterId).chapters);
      const currentChapterIndex = chapters.findIndex(chapter => chapter.id === currentChapterId);
      const lastChapterIndex = chapters.length - 1;
      const previousChapter = (currentChapterIndex - 1) < 0 ? chapters[currentChapterIndex - 1]?.id : chapters[currentChapterIndex]?.id;
      const nextChapter = (currentChapterIndex + 1) < lastChapterIndex ? chapters[currentChapterIndex + 1]?.id : chapters[currentChapterIndex]?.id;

      return {
        prev: previousChapter,
        next: nextChapter
      }
    }
  };

