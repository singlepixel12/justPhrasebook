# JustPhrasebook

A beautiful, mobile-first phrasebook web application with a modern dark glass UI design. Learn essential phrases in Korean, Japanese, and Chinese with pronunciation guides and polite/casual variants.

## 🌟 Features

- **Multi-language Support**: Korean, Japanese, and Chinese (Simplified)
- **Pronunciation Guides**: Syllable-by-syllable pronunciation with visual chips
- **Polite/Casual Variants**: Toggle between formal and informal speech styles
- **Offline-First**: Works completely offline with service worker caching
- **Modern UI**: Dark glass morphism design with Tailwind CSS
- **Mobile Optimized**: Responsive design optimized for mobile devices
- **Persistent Storage**: Uses IndexedDB for offline data persistence
- **Real-time Status**: Connection status indicator

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Storage**: IndexedDB for offline data persistence
- **Caching**: Service Worker for offline functionality
- **Deployment**: GitHub Pages

## 📱 Screenshots

The app features a sleek dark glass UI with:
- Sticky header with language selector and polite toggle
- Pronunciation chips for easy reading
- Smooth animations and transitions
- Connection status indicator
- Responsive design for all screen sizes

## 🎯 Usage

1. **Language Selection**: Use the dropdown in the top-right to switch between Korean, Japanese, and Chinese
2. **Polite Toggle**: Click the "Polite" button to show/hide formal speech variants
3. **Pronunciation**: Each phrase displays syllable-by-syllable pronunciation in easy-to-read chips
4. **Offline Mode**: The app works completely offline after initial load

## 📁 Project Structure

```
justPhrasebook/
├── index.html          # Main HTML file
├── app.js              # Core application logic
├── data/
│   └── phrases.js      # Phrase data and language definitions
├── sw.js               # Service Worker for offline functionality
└── README.md           # This file
```


### Adding New Phrases

To add new phrases, edit the `data/phrases.js` file. Each phrase follows this structure:

```javascript
{
  id: "unique_id",
  en: "English phrase",
  koCasual: "Korean casual",
  koPolite: "Korean polite", 
  koPronCasual: "ko-re-an pro-nun-ci-a-tion",
  koPronPolite: "ko-re-an po-lite pro-nun-ci-a-tion",
  // Repeat for ja (Japanese) and zh (Chinese)
}
```

### Adding New Languages

1. Add the language to the `supportedLanguages` array in `data/phrases.js`
2. Add corresponding phrase translations for each phrase
3. Update the language code in the phrase objects



Built with ❤️ for language learners everywhere.
