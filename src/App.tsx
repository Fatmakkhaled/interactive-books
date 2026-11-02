import { useEffect, useState } from 'react'
import './App.css'

const books = [
  { id: 'alice', title: 'Alice’s Adventures in Wonderland', author: 'Lewis Carroll', year: '1865', category: 'Fantasy', color: '#bd593c', mark: 'A', chapters: [
    { title: 'Down the Rabbit-Hole', text: 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.' },
    { title: 'The Pool of Tears', text: '“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!” (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).' },
  ] },
  { id: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen', year: '1813', category: 'Fiction', color: '#536b55', mark: 'P', chapters: [
    { title: 'A truth universally acknowledged', text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.' },
    { title: 'An early visit', text: 'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.' },
  ] },
  { id: 'sherlock', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', year: '1892', category: 'Mystery', color: '#385e72', mark: 'S', chapters: [
    { title: 'A Scandal in Bohemia', text: 'To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.' },
    { title: 'The Red-Headed League', text: 'I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year, and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair. With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.' },
  ] },
]
type Progress = Record<string, number>
function readProgress(): Progress {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('interactive-books-progress') || '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter(([id, chapter]) => {
      const book = books.find(item => item.id === id)
      return book && Number.isInteger(chapter) && chapter >= 0 && chapter < book.chapters.length
    }))
  } catch { return {} }
}
function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All books')
  const [selected, setSelected] = useState<string | null>(null)
  const [progress, setProgress] = useState<Progress>(readProgress)
  const [fontSize, setFontSize] = useState(20)
  const [dark, setDark] = useState(false)
  useEffect(() => {
    try { localStorage.setItem('interactive-books-progress', JSON.stringify(progress)) } catch { /* Reading remains available without storage. */ }
  }, [progress])
  const book = books.find(item => item.id === selected)
  const chapter = book ? progress[book.id] ?? 0 : 0
  const filtered = books.filter(item => (category === 'All books' || item.category === category) && `${item.title} ${item.author}`.toLowerCase().includes(query.toLowerCase()))
  function openBook(id: string) {
    setProgress(previous => ({ ...previous, [id]: previous[id] ?? 0 }))
    setSelected(id)
    window.scrollTo(0, 0)
  }
  return <div className={dark ? 'app dark' : 'app'}>
    <header className="header"><button className="brand" onClick={() => setSelected(null)} aria-label="Interactive Books home"><span className="brand-icon">▤</span> interactive books<span className="brand-dot">.</span></button><span className="header-note">A little space for a good story</span><button className="theme" onClick={() => setDark(!dark)} aria-label={dark ? 'Use light theme' : 'Use dark theme'}>{dark ? '☀' : '☾'}</button></header>
    <main>
      {book ? <>
        <div className="reader-toolbar"><button className="text-button" onClick={() => setSelected(null)}>← Back to library</button><div className="font-controls"><button aria-label="Decrease text size" disabled={fontSize <= 16} onClick={() => setFontSize(size => size - 2)}>A−</button><span>Text size</span><button aria-label="Increase text size" disabled={fontSize >= 30} onClick={() => setFontSize(size => size + 2)}>A+</button></div></div>
        <div className="reader-layout"><aside className="contents"><p className="eyebrow">CONTENTS</p><h2>{book.title}</h2><p>{book.author}</p>{book.chapters.map((item, index) => <button key={item.title} aria-current={chapter === index ? 'page' : undefined} className={chapter === index ? 'chapter active' : 'chapter'} onClick={() => setProgress(previous => ({ ...previous, [book.id]: index }))}><span>0{index + 1}</span>{item.title}</button>)}<small>Public-domain chapter excerpts</small></aside>
          <article className="reader"><p className="eyebrow">CHAPTER {chapter + 1} OF {book.chapters.length}</p><h1>{book.chapters[chapter].title}</h1><div className="reading-text" style={{ fontSize }}>{book.chapters[chapter].text.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="chapter-navigation"><button disabled={chapter === 0} onClick={() => setProgress(previous => ({ ...previous, [book.id]: chapter - 1 }))}>← Previous</button><span>{chapter + 1} / {book.chapters.length}</span><button disabled={chapter === book.chapters.length - 1} onClick={() => setProgress(previous => ({ ...previous, [book.id]: chapter + 1 }))}>Next chapter →</button></div><p className="saved-note">Your place is remembered on this device when browser storage is available.</p></article></div>
      </> : <>
        <section className="hero"><div><p className="eyebrow">YOUR PERSONAL READING ROOM</p><h1>A new chapter<br />starts <em>here.</em></h1><p className="hero-description">Step away from the everyday. Find a familiar favorite,<br className="desktop-break" /> wander somewhere new, and make time for a story.</p><a className="primary-button" href="#library">Explore the library <span>↗</span></a></div><div className="hero-art" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><div className="decor-book back-book">a world<br />of wonder</div><div className="decor-book front-book"><span>LEWIS CARROLL</span><strong>Alice’s<br />Adventures in<br /><i>Wonderland</i></strong><div className="book-flower">✳</div><small>THE CLASSICS COLLECTION</small></div><span className="art-star">✧</span><span className="art-caption">Lose yourself. Find a story.</span></div></section>
        <section id="library" className="library"><div className="library-heading"><div><p className="eyebrow">A SHELF OF POSSIBILITIES</p><h2>Your next good read</h2></div><label className="search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search books or authors" aria-label="Search books or authors" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
          <div className="filter-row"><div className="filters">{['All books', 'Fiction', 'Fantasy', 'Mystery'].map(item => <button key={item} className={category === item ? 'filter selected' : 'filter'} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="book-count">{filtered.length} {filtered.length === 1 ? 'book' : 'books'} to discover</span></div>
          <div className="book-grid">{filtered.map(item => <button key={item.id} className="book-card" onClick={() => openBook(item.id)}><div className="cover" style={{ backgroundColor: item.color }}><div className="cover-border"><span className="cover-author">{item.author}</span><strong>{item.title}</strong><span className="cover-mark">{item.mark}</span><small>THE CLASSICS COLLECTION</small></div></div><div className="book-meta"><span>{item.category} · {item.year}</span><span>↗</span></div><h3>{item.title}</h3><p>{item.author}</p><span className="read-link">{item.id in progress ? 'Continue reading' : 'Start reading'} →</span></button>)}</div>
          {filtered.length === 0 && <div className="empty"><h3>No books found</h3><p>Try another title, author, or category.</p><button onClick={() => { setQuery(''); setCategory('All books') }}>Show all books</button></div>}
        </section><div className="quote"><span>“</span><blockquote>There is no friend as loyal as a book.</blockquote><p>ERNEST HEMINGWAY</p></div>
      </>}
    </main><footer><span>interactive books.</span><p>Read a little. Discover a lot.</p><small>Three classics, selected public-domain excerpts.</small></footer>
  </div>
}
export default App
