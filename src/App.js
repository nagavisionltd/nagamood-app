import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- IMPORTANT API KEYS ---
// For the app to function, you need to get API keys from the developer consoles
// for both YouTube and Spotify.
const YOUTUBE_API_KEY = "AIzaSyAXSZEAG03n4Eyeg8lx0zbB7xJd_hdw8L4"; // <-- PASTE YOUR YOUTUBE API KEY HERE
const SPOTIFY_CLIENT_ID = "ed56d165904e485b83bbf4f027517986"; // <-- PASTE YOUR SPOTIFY CLIENT ID HERE
const SPOTIFY_CLIENT_SECRET = "9fa36a609cae4224bcf71ec6e61502a3"; // <-- PASTE YOUR SPOTIFY CLIENT SECRET HERE
const GEMINI_API_KEY = "AIzaSyBVLfN0C85pPU0KSZ7PyeZgscI1wvyBVIs"; // <-- PASTE YOUR GEMINI API KEY HERE


// --- HELPER COMPONENTS & DATA ---

const Icons = {
  mic: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>,
  watch: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  listen: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
  read: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  learn: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  chat: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  connect: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  play: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  close: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  externalLink: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
  send: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  analytics: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
};

const moods = [
  { emoji: '😊', name: 'Happy' }, { emoji: '🙂', name: 'Calm' }, { emoji: '😐', name: 'Neutral' },
  { emoji: '😟', name: 'Worried' }, { emoji: '😢', name: 'Sad' }, { emoji: '😠', name: 'Angry' },
  { emoji: '🤩', name: 'Excited' }, { emoji: '😴', name: 'Tired' },
];

const activities = [
  { name: 'Watch', icon: 'watch', screen: 'watch', gradient: 'from-rose-400 via-fuchsia-500 to-indigo-500' }, 
  { name: 'Listen', icon: 'listen', screen: 'listen', gradient: 'from-blue-400 via-teal-400 to-green-400' }, 
  { name: 'Read', icon: 'read', screen: 'read', gradient: 'from-yellow-400 via-orange-500 to-red-500' },
  { name: 'Learn', icon: 'learn', screen: 'learn', gradient: 'from-lime-400 via-emerald-500 to-cyan-500' }, 
  { name: 'Chat', icon: 'chat', screen: 'chat', gradient: 'from-sky-400 via-violet-500 to-purple-500' }, 
  { name: 'Play', icon: 'play', screen: 'play', gradient: 'from-amber-400 via-red-500 to-rose-500' },
  { name: 'Connect', icon: 'connect', screen: 'connect', gradient: 'from-pink-500 via-fuchsia-700 to-black' },
  { name: 'Analytics', icon: 'analytics', screen: 'analytics', gradient: 'from-indigo-400 via-sky-400 to-teal-400' },
];

// --- API HELPER FUNCTIONS ---
const searchYouTube = async (query) => {
    if (!YOUTUBE_API_KEY) { console.error("YouTube API Key is missing."); return { title: `(API Key Needed) ${query}`, description: "Please add a YouTube API key to see real videos.", videoId: null, thumbnail: `https://placehold.co/320x180/e2e8f0/475569?text=YouTube+Video` }; }
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("YouTube API request failed");
      const data = await response.json();
      if (data.items && data.items.length > 0) { const item = data.items[0]; return { title: item.snippet.title, description: item.snippet.description, videoId: item.id.videoId, thumbnail: item.snippet.thumbnails.medium.url }; }
      return null;
    } catch (err) { console.error("YouTube search failed:", err); return null; }
};

const getSpotifyToken = async () => {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return null;
    const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET) }, body: 'grant_type=client_credentials' });
    const data = await response.json();
    return data.access_token;
};

const searchSpotify = async (query, token) => {
    if (!token) { console.error("Spotify token is missing."); return { title: `(API Key Needed) ${query}`, description: "Please add Spotify credentials to see real content.", spotifyUri: null, thumbnail: `https://placehold.co/320x180/e2e8f0/475569?text=Spotify+Content` }; }
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,show,episode&limit=1`;
    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) { const errorBody = await response.json().catch(() => ({ error: { message: `Request failed with status: ${response.status}` }})); const errorMessage = errorBody.error?.message || 'Spotify API request failed'; throw new Error(errorMessage); }
        const data = await response.json();
        const item = data.tracks?.items[0] || data.episodes?.items[0] || data.shows?.items[0];
        if (item) {
            let description, thumbnail;
            if (item.type === 'track') { description = item.artists.map(a => a.name).join(', '); thumbnail = item.album.images[0]?.url; } 
            else if (item.type === 'episode' || item.type === 'show') { description = item.publisher; thumbnail = item.images[0]?.url; }
            return { title: item.name, description: description, spotifyUri: `${item.type}/${item.id}`, thumbnail: thumbnail };
        }
        return null;
    } catch (err) { console.error("Spotify search failed:", err); return null; }
};

const getGeminiSuggestions = async (prompt, schema) => {
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: schema } };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) { const errorText = await response.text(); throw new Error(`API error: ${response.statusText} - ${errorText}`); }
        const result = await response.json();
        if (!result.candidates?.[0]?.content?.parts?.[0]) throw new Error("Unexpected response structure from Gemini API.");
        return JSON.parse(result.candidates[0].content.parts[0].text);
    } catch(err) { console.error("Gemini suggestion API call failed:", err); throw err; }
};

// Decide best activity given mood and (optional) details
const chooseActivityForUser = async (mood, details) => {
    const allowed = ['watch','listen','read','learn','chat','play','connect'];
    const prompt = `You are Aura, a supportive wellness assistant. The user feels "${mood}". Details: "${details || 'none'}".
Based on their state, pick ONE best next activity from: watch, listen, read, learn, chat, play, connect.
Return a JSON object with fields: screen (one of the allowed strings) and reason (short sentence).`;
    const schema = { type: "OBJECT", properties: { screen: { type: "STRING" }, reason: { type: "STRING" } } };
    try {
        const result = await getGeminiSuggestions(prompt, schema);
        const chosen = (result.screen || '').toLowerCase();
        if (allowed.includes(chosen)) { return { screen: chosen, reason: result.reason || '' }; }
        // Fallback: if invalid, default by mood
        switch (mood) {
            case 'Sad': case 'Worried': return { screen: 'watch', reason: 'Calming content first' };
            case 'Angry': return { screen: 'listen', reason: 'Soothing audio to decompress' };
            case 'Tired': return { screen: 'read', reason: 'Low-effort reading' };
            case 'Happy': case 'Excited': return { screen: 'play', reason: 'Channel energy playfully' };
            default: return { screen: 'learn', reason: 'Light engagement' };
        }
    } catch {
        return { screen: 'watch', reason: 'Fallback choice' };
    }
};


// --- UI COMPONENTS ---

const MoodLogger = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodDetails, setMoodDetails] = useState('');

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center"><h1 className="text-3xl md:text-4xl font-bold text-gray-800">How are you feeling?</h1><p className="text-gray-500 mt-2">Select a mood to get started</p></div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">{moods.map((mood) => <button key={mood.name} onClick={() => setSelectedMood(mood.name)} className={`flex flex-col items-center justify-center space-y-2 p-3 rounded-2xl transition-all duration-200 ease-in-out transform hover:scale-105 w-24 h-24 ${selectedMood === mood.name ? 'bg-gradient-to-br from-sky-500 to-fuchsia-500 text-white shadow-glow ring-2 ring-white/50' : 'bg-white/70 text-gray-700 hover:bg-white shadow-card border border-white/40'}`}><span className="text-4xl">{mood.emoji}</span><span className="font-medium text-sm">{mood.name}</span></button>)}</div>
      <div className="space-y-4"><label htmlFor="mood-details" className="block text-lg font-medium text-gray-700">Want to add more detail?</label><div className="relative"><textarea id="mood-details" rows="3" value={moodDetails} onChange={(e) => setMoodDetails(e.target.value)} placeholder="e.g., Feeling tired after a long day at work..." className="w-full bg-white/70 border border-white/50 rounded-xl p-4 pr-12 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:outline-none transition shadow-inner" /><button className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">{Icons.mic}</button></div></div>
      <button onClick={() => onMoodLogged(selectedMood, moodDetails)} disabled={!selectedMood} className="w-full bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl text-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:from-pink-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-pink-500/40 transition-all duration-300 transform hover:scale-105 shadow-glow">Continue</button>
    </div>
  );
};

const ActivityHub = ({ mood, onBack, onNavigate }) => {
  const [isChoosing, setIsChoosing] = useState(false);
  const [chooseError, setChooseError] = useState('');
  const greeting = useMemo(() => {
    switch (mood) {
      case 'Happy': case 'Excited': return "Let's keep the good vibes going!";
      case 'Sad': case 'Worried': return "Let's find something to lift your spirits.";
      case 'Tired': return "Time to relax and recharge.";
      default: return "What would you like to do now?";
    }
  }, [mood]);

  const handleChooseForMe = async () => {
    setChooseError('');
    setIsChoosing(true);
    try {
      const { screen } = await chooseActivityForUser(mood, undefined);
      onNavigate(screen);
    } catch (e) {
      setChooseError('Could not choose right now. Please try again.');
    } finally {
      setIsChoosing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="text-center"><h1 className="text-3xl md:text-4xl font-bold text-gray-800">You're feeling <span className="text-sky-500">{mood}</span>.</h1><p className="text-gray-500 mt-2">{greeting}</p><p className="text-gray-500">What would you like to do?</p></div>
      <div className="grid grid-cols-1">
        <button onClick={handleChooseForMe} disabled={isChoosing} className="w-full bg-gradient-to-r from-sky-600 to-fuchsia-600 text-white font-bold py-3 rounded-xl text-md hover:from-sky-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-sky-500/40 transition-all duration-300 disabled:bg-gray-300 shadow-glow">{isChoosing ? 'Choosing…' : 'Choose for me'}</button>
        {chooseError && <p className="text-center text-red-600 mt-2">{chooseError}</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">{activities.map(activity => ( 
        <button key={activity.name} onClick={() => onNavigate(activity.screen)} 
          className={`relative group flex flex-col items-center justify-center space-y-4 p-4 rounded-2xl text-white transition-all duration-300 ease-in-out transform hover:scale-105 overflow-hidden bg-gradient-to-br ${activity.gradient} shadow-card`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
          <div className="relative z-10 drop-shadow-lg">{Icons[activity.icon]}</div>
          <span className="relative z-10 font-semibold text-lg drop-shadow-md">{activity.name}</span>
          <div className={`absolute -top-8 -right-8 w-24 h-24 bg-white/30 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`}></div>
        </button> 
      ))}</div>
      <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Log a different mood</button>
    </div>
  );
};

// --- MEDIA PLAYER MODALS ---
const VideoPlayerModal = ({ videoId, onClose }) => ( <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}><div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-4 border border-gray-700" onClick={e => e.stopPropagation()}><div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title={`YouTube video ${videoId}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg"></iframe></div><button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:scale-110 transition-transform">{Icons.close}</button></div></div> );
const SpotifyPlayerModal = ({ embedUri, onClose }) => ( <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}><div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-4 border border-gray-700" onClick={e => e.stopPropagation()}><iframe title={`Spotify embed ${embedUri}`} style={{borderRadius: '12px'}} src={`https://open.spotify.com/embed/${embedUri}`} width="100%" height="352" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:scale-110 transition-transform">{Icons.close}</button></div></div> );
const ArticleViewerModal = ({ article, onClose }) => ( <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}><div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] p-4 border border-white/30 flex flex-col" onClick={e => e.stopPropagation()}><div className="flex-shrink-0 flex justify-between items-center pb-3 border-b border-gray-300"><h3 className="text-gray-800 font-bold text-lg truncate">{article.title}</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800">{Icons.close}</button></div><div className="flex-grow my-4 bg-white rounded-md"><iframe src={article.embedUrl || article.href} title={article.title} className="w-full h-full rounded-md border-0" sandbox="allow-scripts allow-same-origin"></iframe></div><div className="flex-shrink-0 text-center"><p className="text-xs text-gray-500 mb-2">If the article doesn't load, you can open it in a new tab.</p><a href={article.href || article.embedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors">{Icons.externalLink} Open in New Tab</a></div></div></div> );

// --- GENERIC CONTENT PAGE & CARD COMPONENTS ---
const SuggestionCard = ({ icon, title, description, thumbnail, onPlay }) => ( <button onClick={onPlay} disabled={!onPlay} className="group relative bg-white/60 p-4 rounded-xl flex gap-4 items-start w-full text-left hover:bg-white transition-all disabled:cursor-default disabled:hover:bg-white/60 shadow-card border border-white/40 hover:-translate-y-0.5">{thumbnail ? ( <img src={thumbnail} alt={title} className="w-24 h-24 object-cover rounded-md flex-shrink-0" /> ) : ( <div className="text-teal-500 mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center">{icon}</div> )}<div><h4 className="font-bold text-gray-800">{title}</h4><p className="text-gray-500 text-sm line-clamp-3">{description}</p></div></button> );
const LoadingSkeleton = () => ( <div className="space-y-4">{[...Array(5)].map((_, i) => (<div key={i} className="h-32 bg-gray-200/80 rounded-lg animate-pulse"></div>))}</div> );

const ContentPage = ({ title, icon, mood, details, onBack, fetchFunction }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => { const loadContent = async () => { setLoading(true); setError(null); try { const fetchedItems = await fetchFunction(mood, details, []); setItems(fetchedItems); } catch (err) { console.error(`Failed to load ${title} content:`, err); setError(`Sorry, couldn't load ${title} suggestions. Please try again.`); } finally { setLoading(false); } }; loadContent(); }, [mood, details, title, fetchFunction]);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        setError(null);
        try {
            const existingTitles = items.map(i => i.title);
            const newItems = await fetchFunction(mood, details, existingTitles);
            setItems(prev => [...prev, ...newItems]);
        } catch (err) {
            console.error(`Failed to load more ${title} content:`, err);
            setError(`Sorry, couldn't load more suggestions. Please try again.`);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return ( 
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
            <div className="text-center"><h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">{icon} {title}</h1><p className="text-gray-500 mt-2">AI-powered suggestions based on your mood.</p></div>
            {loading && <LoadingSkeleton />}
            {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>}
            {!loading && !error && ( <div className="space-y-4">{items.map((item, index) => ( <SuggestionCard key={index} icon={icon} {...item} /> ))}</div> )}
            <button onClick={handleLoadMore} disabled={isLoadingMore} className="w-full bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-3 rounded-xl text-md hover:from-pink-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-pink-500/40 transition-all duration-300 disabled:bg-gray-300 shadow-glow">
                {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
            <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Back to Activities</button>
        </div> 
    );
};

// --- PAGE-SPECIFIC FETCH LOGIC ---
const fetchWatchContent = async (mood, details, existingTitles) => { 
    let prompt;
    if (mood === 'Angry') {
        prompt = `A user is feeling "Angry". They added these details: "${details || 'No details provided'}". Suggest 5 specific, searchable calming videos, like nature documentaries, ambient scenes, or guided meditations on YouTube. Do not suggest any of the following titles: ${existingTitles.join(', ')}.`;
    } else {
        prompt = `A user is feeling "${mood}". They added these details: "${details || 'No details provided'}". Suggest 5 specific, searchable video titles for YouTube that fit their mood. Do not suggest any of the following titles: ${existingTitles.join(', ')}.`;
    }
    const schema = { type: "OBJECT", properties: { suggestions: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" } } } } } }; 
    const geminiResult = await getGeminiSuggestions(prompt, schema); 
    const promises = geminiResult.suggestions.map(item => searchYouTube(item.title)); 
    const results = await Promise.all(promises); 
    return results.filter(Boolean).map(item => ({ ...item, onPlay: () => window.dispatchEvent(new CustomEvent('playVideo', { detail: item.videoId })) })); 
};

const fetchListenContent = async (mood, details, existingTitles) => { 
    let prompt;
    if (mood === 'Angry') {
        prompt = `A user is feeling "Angry". They added these details: "${details || 'No details provided'}". Suggest 5 specific, searchable calming songs, classical music pieces, or ambient tracks suitable for calming down. Do not suggest any of the following titles: ${existingTitles.join(', ')}.`;
    } else {
        prompt = `A user is feeling "${mood}". They added these details: "${details || 'No details provided'}". Suggest 5 specific, searchable songs or podcasts that fit their mood. Do not suggest any of the following titles: ${existingTitles.join(', ')}.`;
    }
    const schema = { type: "OBJECT", properties: { suggestions: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" } } } } } }; 
    const geminiResult = await getGeminiSuggestions(prompt, schema); 
    const spotifyToken = await getSpotifyToken(); 
    const promises = geminiResult.suggestions.map(item => searchSpotify(item.title, spotifyToken)); 
    const results = await Promise.all(promises); 
    return results.filter(Boolean).map(item => ({ ...item, onPlay: () => window.dispatchEvent(new CustomEvent('playSpotify', { detail: item.spotifyUri })) })); 
};

const EMBEDDABLE_SOURCES = [
    'medium.com',
    'dev.to',
    'hashnode.com',
    'notion.site',
    'substack.com',
    'smashingmagazine.com',
    'css-tricks.com',
    'observablehq.com',
    'wikipedia.org'
];

const toReaderEmbed = (url) => {
    // Simple reader proxy to increase embeddability; replace with your own if needed
    return `https://r.jina.ai/${encodeURIComponent(url)}`;
};

const fetchReadContent = async (mood, details, existingTitles) => { 
    const guidance = mood === 'Angry'
        ? 'Prioritize calming, mindfulness, and anger-management topics.'
        : 'Match the topic tone to their mood.';

    const prompt = `The user feels "${mood}". Details: "${details || 'none'}".
Return 5 embeddable article suggestions that can be iframed. Prefer sources among: ${EMBEDDABLE_SOURCES.join(', ')}.
For each suggestion, include: title, description (1-2 sentences), and a direct url. Avoid duplicates: ${existingTitles.join(', ')}.
${guidance}`;

    const schema = { type: "OBJECT", properties: { suggestions: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" }, url: { type: "STRING" } } } } } }; 
    const geminiResult = await getGeminiSuggestions(prompt, schema); 

    return (geminiResult.suggestions || []).map(s => {
        const href = s.url || `https://www.google.com/search?q=${encodeURIComponent(s.title)}`;
        const host = (() => { try { return new URL(href).hostname.replace('www.', ''); } catch { return ''; } })();
        const isEmbeddableHost = EMBEDDABLE_SOURCES.some(src => host.endsWith(src));
        const embedUrl = isEmbeddableHost ? href : toReaderEmbed(href);
        return { title: s.title, description: s.description, href, embedUrl, onPlay: () => window.dispatchEvent(new CustomEvent('viewArticle', { detail: { title: s.title, href, embedUrl } })) };
    });
};

const LearnPage = ({ onBack }) => {
    const FACTS_POOL_KEY = 'learnFactsPoolV1';
    const FACTS_ORDER_KEY = 'learnFactsOrderV1';
    const FACTS_INDEX_KEY = 'learnFactsIndexV1';

    const [pool, setPool] = useState([]);
    const [order, setOrder] = useState([]);
    const [index, setIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const buildImageUrl = (keyword, seed = 1) => {
        const seedText = encodeURIComponent(`${keyword}-${seed}`);
        return `https://picsum.photos/seed/${seedText}/800/600`;
    };
    const buildFallbackUrl = (keyword, seed = 1) => {
        const txt = encodeURIComponent((keyword || 'image').slice(0, 24));
        return `https://placehold.co/800x600?text=${txt}`;
    };

    const shuffle = (arr) => {
        const a = [...arr];
        for (let i=a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; }
        return a;
    };

    const generateFactsPool = async () => {
        const categories = [
            'Space', 'Oceans', 'Brain', 'History', 'Culture', 'Animals', 'Plants', 'Math', 'Physics', 'Chemistry',
            'Geography', 'Music', 'Art', 'Literature', 'Technology', 'Medicine', 'Food', 'Languages', 'Inventions', 'Sports',
            'Psychology', 'Astronomy', 'Geology', 'Ecology', 'Architecture'
        ];
        const templates = [
            'In {cat}, a surprising truth: {snippet}.',
            'A quick {cat} nugget: {snippet}.',
            'Did you know? {snippet} ({cat}).',
            '{cat} fact: {snippet}.',
            'Curiosity in {cat}: {snippet}.',
            'Tiny {cat} insight: {snippet}.',
            'Fun {cat} note: {snippet}.',
            'Quick {cat} bite: {snippet}.'
        ];
        const snippets = [
            'Honey never spoils and has been found in ancient tombs',
            'Bananas are berries, botanically speaking',
            'Octopuses have three hearts and blue blood',
            'Sharks existed before trees did',
            'The Eiffel Tower grows taller in summer heat',
            'Lightning can be hotter than the surface of the sun',
            'A teaspoon of neutron star would weigh billions of tons',
            'Humans share about 60% of their DNA with bananas',
            'The shortest war in history lasted 38 minutes',
            'The heart of a blue whale is the size of a small car',
            'Some metals can be liquid at room temperature',
            'There are more possible chess games than atoms in the universe',
            'Your brain uses about 20% of your body’s energy',
            'A day on Venus is longer than a year on Venus',
            'Hot water can sometimes freeze faster than cold (Mpemba effect)',
            'Wombat poop is cube-shaped',
            'Butterflies taste with their feet',
            'Oxford University is older than the Aztec Empire',
            'A group of flamingos is called a flamboyance',
            'Glass is a supercooled liquid—sort of',
            'Blood makes up about 8% of your body weight',
            'The Great Wall of China is not visible from space with the naked eye',
            'Antarctica is the largest desert on Earth',
            'Tomatoes were once thought to be poisonous in Europe',
            'There are more trees on Earth than stars in the Milky Way',
            'Cows have best friends and get stressed when separated',
            'Jellyfish have existed for more than 500 million years',
            'Some turtles can breathe through their rear end',
            'A leap year keeps our calendar aligned with Earth’s orbit',
            'Sound travels faster in water than in air',
            'A sneeze can travel up to 100 mph',
            'Dolphins have names for each other',
            'Peanuts are legumes, not nuts',
            'Saturn could float in water due to its low density',
            'Blood doesn’t appear red in your veins—skin filters the color',
            'Some frogs can survive being frozen',
            'Mona Lisa has no clearly visible eyebrows',
            'Bamboo can grow up to a meter in a single day',
            'Humans are bioluminescent, but the light is too weak to see',
            'Potatoes were the first vegetable grown in space',
            'Ravens can solve puzzles and plan ahead',
            'There are earthquakes on the Moon—moonquakes',
            'The fastest recorded raindrops fall near 18 mph',
            'Koalas have fingerprints similar to humans',
            'Bees can recognize human faces',
            'Squid have doughnut-shaped brains',
            'The hottest Chile pepper can cause hallucinations',
            'Sea otters hold hands while sleeping so they don’t drift apart',
            'A day on Mars is just over 24 hours',
            'An adult human has fewer bones than a baby',
            'Cats can rotate their ears 180 degrees'
        ];
        const items = [];
        for (let i = 0; i < 100; i++) {
            const cat = categories[i % categories.length];
            const t = templates[i % templates.length];
            const snip = snippets[i % snippets.length];
            const title = `${cat} ${i+1}`;
            const fact = t.replace('{cat}', cat).replace('{snippet}', snip);
            items.push({ title, fact });
        }
        return items;
    };

    const loadOrInit = async () => {
        setIsLoading(true);
        try {
            const savedPool = JSON.parse(localStorage.getItem(FACTS_POOL_KEY) || 'null');
            const savedOrder = JSON.parse(localStorage.getItem(FACTS_ORDER_KEY) || 'null');
            const savedIndexRaw = localStorage.getItem(FACTS_INDEX_KEY);
            const savedIndex = savedIndexRaw ? parseInt(savedIndexRaw, 10) : 0;

            if (Array.isArray(savedPool) && savedPool.length > 0 && Array.isArray(savedOrder) && savedOrder.length === savedPool.length) {
                setPool(savedPool);
                setOrder(savedOrder);
                setIndex(Math.min(Math.max(0, savedIndex), savedOrder.length - 1));
            } else {
                const newPool = await generateFactsPool();
                const newOrder = shuffle(newPool.map((_, i) => i));
                setPool(newPool);
                setOrder(newOrder);
                setIndex(0);
                localStorage.setItem(FACTS_POOL_KEY, JSON.stringify(newPool));
                localStorage.setItem(FACTS_ORDER_KEY, JSON.stringify(newOrder));
                localStorage.setItem(FACTS_INDEX_KEY, '0');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadOrInit(); }, []);

    const current = (pool.length && order.length) ? pool[order[index]] : null;
    const total = order.length || 0;

    const goNext = () => {
        if (!total) return;
        const next = index + 1;
        if (next < total) {
            setIndex(next);
            localStorage.setItem(FACTS_INDEX_KEY, String(next));
        } else {
            // cycle completed: reshuffle order and reset index
            const newOrder = shuffle(order);
            setOrder(newOrder);
            setIndex(0);
            localStorage.setItem(FACTS_ORDER_KEY, JSON.stringify(newOrder));
            localStorage.setItem(FACTS_INDEX_KEY, '0');
        }
    };

    const goPrev = () => {
        if (!total) return;
        const prev = index - 1;
        if (prev >= 0) {
            setIndex(prev);
            localStorage.setItem(FACTS_INDEX_KEY, String(prev));
        } else {
            const last = Math.max(0, total - 1);
            setIndex(last);
            localStorage.setItem(FACTS_INDEX_KEY, String(last));
        }
    };

    const resetLibrary = async () => {
        setIsLoading(true);
        const newPool = await generateFactsPool();
        const newOrder = shuffle(newPool.map((_, i) => i));
        setPool(newPool);
        setOrder(newOrder);
        setIndex(0);
        localStorage.setItem(FACTS_POOL_KEY, JSON.stringify(newPool));
        localStorage.setItem(FACTS_ORDER_KEY, JSON.stringify(newOrder));
        localStorage.setItem(FACTS_INDEX_KEY, '0');
        setIsLoading(false);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (isLoading || !current) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isLoading, current, index, total]);

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">{Icons.learn} Learn Something New</h1>
                <p className="text-gray-500 mt-2">{total ? `Fact ${index+1} of ${total}` : 'Loading your fact library...'}</p>
            </div>

            {isLoading || !current ? (
                <div className="rounded-2xl overflow-hidden bg-white/70 border border-white/40 shadow-card">
                    <div className="w-full aspect-video bg-gray-200 animate-pulse" />
                    <div className="p-6 space-y-3">
                        <div className="h-5 w-2/3 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden bg-white/70 border border-white/40 shadow-card">
                    <div className="aspect-video overflow-hidden">
                        <img src={buildImageUrl(current.title || current.fact, order[index] ?? index)} alt={current.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = buildFallbackUrl(current.title || current.fact, order[index] ?? index); }} />
                    </div>
                    <div className="p-6 space-y-3">
                        <h3 className="text-xl font-semibold text-gray-800">{current.title}</h3>
                        <p className="text-gray-600 text-base">{current.fact}</p>
                        {total > 0 && (
                          <div className="space-y-1">
                            <div className="w-full h-2 bg-gray-200/70 rounded-full overflow-hidden border border-white/50">
                              <div className="h-full bg-gradient-to-r from-sky-500 to-fuchsia-500" style={{ width: `${Math.round(((index+1)/total)*100)}%` }} />
                            </div>
                            <div className="text-xs text-gray-500">{index+1} of {total}</div>
                          </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <button onClick={goPrev} disabled={isLoading || !current} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Previous</button>
                <button onClick={goNext} disabled={isLoading || !current} className="w-full bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-3 rounded-xl text-md hover:from-pink-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-pink-500/40 transition-all duration-300 disabled:bg-gray-300 shadow-glow">{isLoading ? 'Loading…' : 'Next'}</button>
                <button onClick={resetLibrary} disabled={isLoading} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Reset</button>
                <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Back</button>
            </div>
        </div>
    );
};

const PlaceholderPage = ({ title, icon, onBack }) => ( <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in text-center"><h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">{icon} {title}</h1><p className="text-gray-500 mt-2 text-xl">This feature is coming soon!</p><button onClick={onBack} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transition-all duration-300 mt-8">Back to Activities</button></div> );

// --- ANALYTICS PAGE ---
const AnalyticsPage = ({ moodHistory = [], onBack }) => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const grouped = useMemo(() => {
        const byDay = Array.from({ length: 7 }, () => ({ total: 0, counts: {} }));
        for (const entry of moodHistory) {
            const d = new Date(entry.ts);
            const day = d.getDay();
            const bucket = byDay[day];
            bucket.total += 1;
            bucket.counts[entry.mood] = (bucket.counts[entry.mood] || 0) + 1;
        }
        return byDay.map((b, i) => ({ day: days[i], total: b.total, counts: b.counts }));
    }, [moodHistory]);

    const sortedMoods = useMemo(() => {
        const set = new Set();
        moodHistory.forEach(e => set.add(e.mood));
        return Array.from(set);
    }, [moodHistory]);

    // Mood scoring for averages and trend (1-5 scale)
    const MOOD_SCORES = useMemo(() => ({
        'Angry': 1,
        'Sad': 1,
        'Worried': 2,
        'Tired': 2,
        'Neutral': 3,
        'Calm': 4,
        'Happy': 5,
        'Excited': 5,
    }), []);

    const dailyTrend = useMemo(() => {
        const toKey = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth()+1).padStart(2,'0');
            const da = String(d.getDate()).padStart(2,'0');
            return `${y}-${m}-${da}`;
        };
        const agg = new Map();
        for (const e of moodHistory) {
            const key = toKey(new Date(e.ts));
            const score = MOOD_SCORES[e.mood] ?? 3;
            const cur = agg.get(key) || { sum: 0, count: 0 };
            cur.sum += score; cur.count += 1; agg.set(key, cur);
        }
        const daysBack = 14;
        const series = [];
        for (let i = daysBack - 1; i >= 0; i--) {
            const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
            const key = toKey(d);
            const val = agg.has(key) ? (agg.get(key).sum / agg.get(key).count) : null;
            series.push({ key, date: new Date(d), value: val });
        }
        return series;
    }, [moodHistory, MOOD_SCORES]);

    const sparkline = useMemo(() => {
        const width = 600; const height = 80; const minV = 1; const maxV = 5;
        const vals = dailyTrend;
        if (!vals.length) return { width, height, path: '' };
        const stepX = width / Math.max(1, vals.length - 1);
        let path = '';
        vals.forEach((pt, i) => {
            if (pt.value == null) return; // skip missing
            const x = i * stepX;
            const norm = (pt.value - minV) / (maxV - minV);
            const y = height - norm * height;
            path += (path ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`);
        });
        return { width, height, path };
    }, [dailyTrend]);

    const handleExportCsv = () => {
        const rows = [['timestamp','iso','mood','details']].concat(
            moodHistory.map(e => [
                e.ts,
                new Date(e.ts).toISOString(),
                (e.mood || '').replace(/\"/g,'"'),
                (e.details || '').replace(/\"/g,'"')
            ])
        );
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'mood-history.csv'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handlePrint = () => { window.print(); };

    const mailBody = encodeURIComponent(
        `Weekly Mood Summary\n\n` +
        grouped.map(g => `${g.day}: ${g.total} entries`).join('\n') +
        `\n\nDetails:\n` +
        moodHistory.slice(-50).map(e => {
            const d = new Date(e.ts).toLocaleString();
            return `- ${d}: ${e.mood}${e.details?` - ${e.details}`:''}`;
        }).join('\n')
    );
    const mailto = `mailto:?subject=${encodeURIComponent('Weekly Mood Summary')}&body=${mailBody}`;

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">{Icons.analytics} Analytics</h1>
                <p className="text-gray-500 mt-2">Mood entries this week and quick export to your GP.</p>
            </div>

            <div className="bg-white/70 rounded-2xl border border-white/40 shadow-card p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Daily Average Mood (last 14 days)</h3>
                <div className="w-full overflow-hidden rounded-md border border-white/50 bg-white/80">
                    <svg viewBox={`0 0 ${sparkline.width} ${sparkline.height}`} preserveAspectRatio="none" className="w-full h-20">
                        <defs>
                            <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#e879f9" />
                            </linearGradient>
                        </defs>
                        <path d={sparkline.path} fill="none" stroke="url(#sparkGrad)" strokeWidth="3" />
                    </svg>
                </div>
                <p className="text-xs text-gray-500 mt-2">Scale: 1 (low) to 5 (high)</p>
            </div>

            <div className="bg-white/70 rounded-2xl border border-white/40 shadow-card p-4">
                <div className="grid grid-cols-7 gap-2">
                    {grouped.map((g, idx) => {
                        const max = Math.max(1, ...grouped.map(x => x.total));
                        const h = (g.total / max) * 120;
                        return (
                            <div key={idx} className="flex flex-col items-center justify-end gap-2">
                                <div className="w-8 bg-gradient-to-t from-sky-500 to-fuchsia-500 rounded-md" style={{ height: `${Math.max(4,h)}px` }} />
                                <span className="text-xs text-gray-600">{g.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {sortedMoods.length > 0 && (
                <div className="bg-white/70 rounded-2xl border border-white/40 shadow-card p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Breakdown by Mood</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sortedMoods.map(m => {
                            const total = grouped.reduce((acc,g)=> acc + (g.counts[m]||0), 0);
                            return (
                                <div key={m} className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-2 border border-white/50">
                                    <span className="text-gray-700">{m}</span>
                                    <span className="text-gray-900 font-semibold">{total}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a href={mailto} className="w-full text-center bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-3 rounded-xl text-md hover:from-pink-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-pink-500/40 transition-all duration-300 shadow-glow">Send Summary to GP</a>
                <button onClick={handleExportCsv} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Export CSV</button>
                <button onClick={handlePrint} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Print / Save PDF</button>
                <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Back to Activities</button>
            </div>
        </div>
    );
};

// --- AURA: THE CHATBOT AGENT ---
const AURA_SYSTEM_PROMPT = `You are Aura, an empathetic and supportive wellness chatbot for an app called MoodApp. Your personality is warm, caring, and a little bit wise. You are not a doctor, but a friend who listens. Keep your responses concise, gentle, and encouraging. Sometimes, you can suggest an activity from the app. The available sections are Watch, Listen, Read, and Play. When you suggest one, end your message with a special tag like [NAVIGATE_TO:watch], [NAVIGATE_TO:listen], [NAVIGATE_TO:read], or [NAVIGATE_TO:play]. For example: 'A calming nature documentary might be nice. [NAVIGATE_TO:watch]'`;

const getAuraResponse = async (chatHistory, mood, details) => {
    const payload = {
        contents: chatHistory,
        systemInstruction: {
            parts: [{ text: `${AURA_SYSTEM_PROMPT} The user is currently feeling "${mood}". Their details: "${details || 'none'}"` }]
        }
    };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) { const errorText = await response.text(); throw new Error(`API error: ${response.statusText} - ${errorText}`); }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) { return result.candidates[0].content.parts[0].text; } 
        else { throw new Error("Unexpected response structure from API."); }
    } catch (err) { console.error("Aura (Gemini) API call failed:", err); return "I'm having a little trouble connecting right now. Please give me a moment."; }
};

const ChatView = ({ mood, details, onBack, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  useEffect(() => {
    const getGreeting = async () => {
        setIsLoading(true);
        const prompt = `You are Aura, an empathetic and supportive wellness chatbot. The user has just started a chat. They are feeling "${mood}". Their details: "${details || 'none'}". Greet them warmly, introduce yourself as Aura, and ask them what's on their mind.`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorText = await response.text(); throw new Error(`API error: ${response.statusText} - ${errorText}`); }
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]) {
                const greetingText = result.candidates[0].content.parts[0].text;
                setMessages([{ role: 'model', text: greetingText }]);
            } else {
                throw new Error("Unexpected response structure from API.");
            }
        } catch (err) {
            console.error("Aura Greeting API call failed:", err);
            setMessages([{ role: 'model', text: "Hello! I'm Aura. I'm having a little trouble connecting right now, but I'm here to listen." }]);
        } finally {
            setIsLoading(false);
        }
    };
    getGreeting();
  }, [mood, details]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    const newMessages = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);
    const auraText = await getAuraResponse(newMessages.map(m => ({role: m.role, parts: [{text: m.text}]})), mood, details);
    setMessages(prev => [...prev, { role: 'model', text: auraText }]);
    setIsLoading(false);
  };

  const navRegex = /\[NAVIGATE_TO:(\w+)\]/;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 flex flex-col h-[85vh] animate-fade-in">
        <div className="text-center mb-4"><h1 className="text-3xl font-bold text-gray-800">Chat with Aura</h1><p className="text-gray-500">Your empathetic AI companion</p></div>
        <div className="flex-grow bg-white/70 rounded-xl p-4 overflow-y-auto space-y-4 border border-white/40 shadow-inner">
            {messages.map((msg, index) => {
                const match = msg.text.match(navRegex);
                const cleanText = msg.text.replace(navRegex, '').trim();
                return (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-sky-600 to-fuchsia-600 text-white rounded-br-lg shadow-card' : 'bg-white/90 text-gray-800 shadow-card rounded-bl-lg border border-white/60'}`}>
                            <p>{cleanText}</p>
                            {match && (
                                <button onClick={() => onNavigate(match[1])} className="mt-2 w-full text-left bg-sky-100 text-sky-700 font-bold p-2 rounded-lg hover:bg-sky-200 transition-colors">
                                    Go to {match[1].charAt(0).toUpperCase() + match[1].slice(1)}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            {isLoading && (<div className="flex justify-start"><div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white shadow-sm rounded-bl-lg"><div className="flex items-center justify-center gap-2"><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span></div></div></div>)}
            <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type your message..." className="flex-grow bg-white/70 border border-white/50 rounded-xl p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition shadow-inner" disabled={isLoading} />
            <button type="submit" className="bg-gradient-to-r from-sky-600 to-fuchsia-600 text-white p-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-sky-500 hover:to-fuchsia-500 transition shadow-glow" disabled={isLoading || !userInput.trim()}>{Icons.send}</button>
        </form>
        <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40 mt-4">Back to Activities</button>
    </div>
  );
};

const PlayPage = ({ onNavigate, onBack }) => (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">{Icons.play} Play a Game</h1>
            <p className="text-gray-500 mt-2">Take a break and relax with a classic game.</p>
        </div>
        <div className="space-y-4">
            <button onClick={() => onNavigate('tetris')} className="w-full text-left p-6 bg-white/70 hover:bg-white rounded-xl transition-colors shadow-card border border-white/40">
                <h2 className="text-2xl font-bold text-pink-500">BlockFall</h2>
                <p className="text-gray-500">The classic block-stacking puzzle game.</p>
            </button>
            <button onClick={() => onNavigate('bubbleShooter')} className="w-full text-left p-6 bg-white/70 hover:bg-white rounded-xl transition-colors shadow-card border border-white/40">
                <h2 className="text-2xl font-bold text-sky-400">Bubble Pop</h2>
                <p className="text-gray-500">Aim, shoot, and match colors to clear the board.</p>
            </button>
        </div>
        <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40">Back to Activities</button>
    </div>
);

const TetrisGame = ({ onBack }) => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const gameRef = useRef(null);

    const BLOCK = 30;
    const COLS = 10;
    const ROWS = 20;
    const COLORS = ['#e11d48', '#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6'];
    const SHAPES = [
      // I, J, L, O, S, T, Z
      [[1,1,1,1]],
      [[1,0,0],[1,1,1]],
      [[0,0,1],[1,1,1]],
      [[1,1],[1,1]],
      [[0,1,1],[1,1,0]],
      [[0,1,0],[1,1,1]],
      [[1,1,0],[0,1,1]]
    ];

    const rotateMatrix = (m) => m[0].map((_, i) => m.map(row => row[i]).reverse());

    const spawnPiece = () => {
      const idx = Math.floor(Math.random()*SHAPES.length);
      const color = COLORS[idx % COLORS.length];
      const base = SHAPES[idx];
      const piece = { shape: base, x: Math.floor((COLS - base[0].length)/2), y: -1, color };
      return piece;
    };

    const newGame = (ctx) => {
      const board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
      const state = { ctx, board, current: spawnPiece(), nextDrop: 0, dropInterval: 800, gameOver: false, score: 0 };
      return state;
    };

    const collides = (board, piece, offX=0, offY=0, shapeOverride=null) => {
      const shape = shapeOverride || piece.shape;
      for (let y=0; y<shape.length; y++) {
        for (let x=0; x<shape[y].length; x++) {
          if (!shape[y][x]) continue;
          const nx = piece.x + x + offX;
          const ny = piece.y + y + offY;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && board[ny][nx]) return true;
        }
      }
      return false;
    };

    const merge = (board, piece) => {
      piece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val) {
            const by = piece.y + y;
            if (by >= 0) board[by][piece.x + x] = piece.color;
          }
        });
      });
    };

    const clearLines = (state) => {
      let cleared = 0;
      for (let y = ROWS-1; y >= 0; y--) {
        if (state.board[y].every(cell => cell)) {
          state.board.splice(y,1);
          state.board.unshift(Array(COLS).fill(null));
          cleared++;
          y++;
        }
      }
      if (cleared > 0) {
        state.score += [0,40,100,300,1200][cleared] || 0;
        state.dropInterval = Math.max(150, state.dropInterval - cleared*10);
      }
    };

    const drawCell = (ctx, x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK, BLOCK);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.strokeRect(x*BLOCK, y*BLOCK, BLOCK, BLOCK);
    };

    const draw = (state) => {
      const { ctx } = state;
      ctx.clearRect(0,0,COLS*BLOCK, ROWS*BLOCK);
      // board
      for (let y=0; y<ROWS; y++) for (let x=0; x<COLS; x++) {
        const c = state.board[y][x];
        if (c) drawCell(ctx, x, y, c);
      }
      // piece
      const p = state.current;
      p.shape.forEach((row, y) => row.forEach((val, x) => {
        if (val && p.y + y >= 0) drawCell(ctx, p.x + x, p.y + y, p.color);
      }));

      // grid overlay
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let x=0; x<=COLS; x++) { ctx.beginPath(); ctx.moveTo(x*BLOCK,0); ctx.lineTo(x*BLOCK, ROWS*BLOCK); ctx.stroke(); }
      for (let y=0; y<=ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*BLOCK); ctx.lineTo(COLS*BLOCK, y*BLOCK); ctx.stroke(); }
    };

    const tick = (timestamp) => {
      const state = gameRef.current;
      if (!state || state.gameOver) return;
      if (!state.nextDrop) state.nextDrop = timestamp + state.dropInterval;
      if (timestamp >= state.nextDrop) {
        if (!collides(state.board, state.current, 0, 1)) {
          state.current.y += 1;
        } else {
          merge(state.board, state.current);
          clearLines(state);
          state.current = spawnPiece();
          if (collides(state.board, state.current, 0, 0)) {
            state.gameOver = true;
          }
        }
        state.nextDrop = timestamp + state.dropInterval;
      }
      draw(state);
      animRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // crisp for dpr
      const dpr = window.devicePixelRatio || 1;
      canvas.width = COLS*BLOCK*dpr;
      canvas.height = ROWS*BLOCK*dpr;
      canvas.style.width = `${COLS*BLOCK}px`;
      canvas.style.height = `${ROWS*BLOCK}px`;
      ctx.scale(dpr, dpr);

      gameRef.current = newGame(ctx);

      const handleKey = (e) => {
        const state = gameRef.current; if (!state || state.gameOver) return;
        if (e.key === 'ArrowLeft') {
          if (!collides(state.board, state.current, -1, 0)) state.current.x -= 1;
        } else if (e.key === 'ArrowRight') {
          if (!collides(state.board, state.current, 1, 0)) state.current.x += 1;
        } else if (e.key === 'ArrowDown') {
          if (!collides(state.board, state.current, 0, 1)) state.current.y += 1;
        } else if (e.key === 'ArrowUp' || e.key === ' ') {
          const rotated = rotateMatrix(state.current.shape);
          if (!collides(state.board, state.current, 0, 0, rotated)) state.current.shape = rotated;
        }
        draw(state);
      };
      window.addEventListener('keydown', handleKey);
      animRef.current = requestAnimationFrame(tick);
      return () => { window.removeEventListener('keydown', handleKey); cancelAnimationFrame(animRef.current); };
    }, []);

    const moveLeft = () => { const s = gameRef.current; if (!s) return; if (!collides(s.board, s.current, -1, 0)) { s.current.x -= 1; draw(s); } };
    const moveRight = () => { const s = gameRef.current; if (!s) return; if (!collides(s.board, s.current, 1, 0)) { s.current.x += 1; draw(s); } };
    const rotate = () => { const s = gameRef.current; if (!s) return; const r = rotateMatrix(s.current.shape); if (!collides(s.board, s.current, 0, 0, r)) { s.current.shape = r; draw(s); } };
    const drop = () => { const s = gameRef.current; if (!s) return; while (!collides(s.board, s.current, 0, 1)) { s.current.y += 1; } draw(s); };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-pink-500">BlockFall</h1>
            <canvas ref={canvasRef} className="bg-gray-900 rounded-lg mx-auto block border-2 border-gray-700"></canvas>
            <p className="text-center text-gray-500 text-sm">Use Arrow Keys or on-screen controls.</p>
            <div className="grid grid-cols-3 gap-4 items-center">
                <button onTouchStart={moveLeft} onClick={moveLeft} className="bg-white/70 p-4 rounded-lg text-gray-800 font-bold text-2xl shadow-md">&larr;</button>
                <button onTouchStart={drop} onClick={drop} className="bg-white/70 p-4 rounded-lg text-gray-800 font-bold text-2xl shadow-md">&darr;</button>
                <button onTouchStart={moveRight} onClick={moveRight} className="bg-white/70 p-4 rounded-lg text-gray-800 font-bold text-2xl shadow-md">&rarr;</button>
                <button onTouchStart={rotate} onClick={rotate} className="col-span-3 bg-white/70 p-4 rounded-lg text-gray-800 font-bold text-2xl shadow-md">Rotate</button>
            </div>
            <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40 mt-4">Back to Games</button>
        </div>
    );
};

const BubbleShooterGame = ({ onBack }) => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const gameRef = useRef(null);

    const R = 16; // bubble radius
    const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'];

    const newGame = (ctx, width, height) => {
      const cols = Math.floor(width / (R*2));
      const grid = [];
      const rows = 8;
      for (let r=0; r<rows; r++) {
        const row = [];
        for (let c=0; c<cols - (r%2?1:0); c++) {
          row.push({ color: COLORS[Math.floor(Math.random()*COLORS.length)] });
        }
        grid.push(row);
      }
      const shooter = { x: width/2, y: height-40, angle: -Math.PI/2 };
      const current = { x: shooter.x, y: shooter.y, vx: 0, vy: 0, moving: false, color: COLORS[Math.floor(Math.random()*COLORS.length)] };
      return { ctx, width, height, cols, grid, shooter, current };
    };

    const draw = (s) => {
      const { ctx, width, height, grid } = s;
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,width,height);
      // draw bubbles
      let y = R + 10;
      for (let r=0; r<grid.length; r++) {
        const offset = (r%2) ? R : 0;
        let x = R + 10 + offset;
        for (let c=0; c<grid[r].length; c++) {
          const b = grid[r][c];
          if (b) { ctx.beginPath(); ctx.fillStyle = b.color; ctx.arc(x, y, R-1, 0, Math.PI*2); ctx.fill(); }
          x += R*2;
        }
        y += R*2 - 2;
      }
      // shooter base
      ctx.fillStyle = '#1f2937'; ctx.fillRect(0, height-30, width, 30);
      // aim line
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(s.shooter.x, s.shooter.y);
      ctx.lineTo(s.shooter.x + Math.cos(s.shooter.angle)*60, s.shooter.y + Math.sin(s.shooter.angle)*60);
      ctx.stroke();
      // current ball
      ctx.beginPath(); ctx.fillStyle = s.current.color; ctx.arc(s.current.x, s.current.y, R-1, 0, Math.PI*2); ctx.fill();
    };

    const neighbors = (grid, r, c) => {
      const res = [];
      const isOdd = r % 2 === 1;
      const deltas = isOdd
        ? [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]
        : [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]];
      for (const [dr, dc] of deltas) {
        const nr = r + dr, nc = c + dc;
        if (grid[nr] && grid[nr][nc]) res.push([nr,nc]);
      }
      return res;
    };

    const bfsCluster = (grid, r, c, color) => {
      const q = [[r,c]]; const seen = new Set([`${r},${c}`]);
      while (q.length) {
        const [rr,cc] = q.shift();
        for (const [nr,nc] of neighbors(grid, rr, cc)) {
          const key = `${nr},${nc}`;
          if (!seen.has(key) && grid[nr][nc].color === color) { seen.add(key); q.push([nr,nc]); }
        }
      }
      return [...seen].map(s => s.split(',').map(Number));
    };

    const removeFloating = (grid) => {
      const rows = grid.length;
      const cols = Math.max(...grid.map(r => r.length));
      const attached = new Set();
      const pushTopNeighbors = (r,c) => {
        for (const [nr,nc] of neighbors(grid, r, c)) {
          const key = `${nr},${nc}`;
          if (!attached.has(key)) { attached.add(key); pushTopNeighbors(nr,nc); }
        }
      };
      for (let c=0;c<(grid[0]?.length||0);c++) { if (grid[0][c]) { const key = `0,${c}`; if (!attached.has(key)) { attached.add(key); pushTopNeighbors(0,c); } } }
      for (let r=0;r<rows;r++) for (let c=0;c<(grid[r]?.length||0);c++) {
        if (grid[r][c] && !attached.has(`${r},${c}`)) grid[r][c] = null;
      }
    };

    const snapToGrid = (s, x, y) => {
      // approximate row by vertical position
      let row = Math.max(0, Math.round((y - (R+10)) / (R*2 - 2)));
      const offset = (row%2)? R : 0;
      let col = Math.round((x - (R+10+offset)) / (R*2));
      if (!s.grid[row]) s.grid[row] = [];
      if (col < 0) col = 0;
      if (col >= (s.grid[row].length || Math.floor(s.width/(R*2)) - (row%2?1:0))) {
        col = (s.grid[row].length || Math.floor(s.width/(R*2)) - (row%2?1:0)) - 1;
        if (col < 0) col = 0;
      }
      return [row, col];
    };

    const collideAny = (s, x, y) => {
      // check top boundary
      if (y <= R + 10) return true;
      // check neighbors
      let yy = R + 10;
      for (let r=0; r<s.grid.length; r++) {
        const offset = (r%2)? R : 0;
        let xx = R + 10 + offset;
        for (let c=0; c<s.grid[r].length; c++) {
          const b = s.grid[r][c]; if (!b) { xx += R*2; continue; }
          const dx = x - xx; const dy = y - yy;
          if (Math.hypot(dx,dy) <= R*2 - 1) return true;
          xx += R*2;
        }
        yy += R*2 - 2;
      }
      return false;
    };

    const addBallToGrid = (s, x, y, color) => {
      const [row, col] = snapToGrid(s, x, y);
      if (!s.grid[row]) s.grid[row] = [];
      if (!s.grid[row][col]) s.grid[row][col] = { color };
      // cluster removal
      const cluster = bfsCluster(s.grid, row, col, color);
      if (cluster.length >= 3) {
        for (const [r,c] of cluster) s.grid[r][c] = null;
        removeFloating(s.grid);
      }
    };

    const step = () => {
      const s = gameRef.current; if (!s) return;
      if (s.current.moving) {
        s.current.x += s.current.vx;
        s.current.y += s.current.vy;
        // wall bounce
        if (s.current.x <= R+10 || s.current.x >= s.width - (R+10)) s.current.vx *= -1;
        // collision
        if (collideAny(s, s.current.x, s.current.y)) {
          // move back one step
          s.current.x -= s.current.vx; s.current.y -= s.current.vy;
          addBallToGrid(s, s.current.x, s.current.y, s.current.color);
          // new ball
          s.current = { x: s.shooter.x, y: s.shooter.y, vx: 0, vy: 0, moving: false, color: COLORS[Math.floor(Math.random()*COLORS.length)] };
        }
        // bottom clamp
        if (s.current.y >= s.height - 40 - R) { s.current.y = s.height - 40 - R; s.current.vy *= -1; }
      }
      draw(s);
      animRef.current = requestAnimationFrame(step);
    };

    useEffect(() => {
      const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
      const widthCss = 500; const heightCss = 600; const dpr = window.devicePixelRatio || 1;
      canvas.width = widthCss * dpr; canvas.height = heightCss * dpr; canvas.style.width = widthCss+'px'; canvas.style.height = heightCss+'px'; ctx.scale(dpr,dpr);
      gameRef.current = newGame(ctx, widthCss, heightCss);

      const handleMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches? e.touches[0].clientY : e.clientY) - rect.top;
        const s = gameRef.current; if (!s) return;
        s.shooter.angle = Math.atan2(y - s.shooter.y, x - s.shooter.x);
      };
      const handleShoot = (e) => {
        const s = gameRef.current; if (!s || s.current.moving) return;
        const speed = 7;
        s.current.vx = Math.cos(s.shooter.angle) * speed;
        s.current.vy = Math.sin(s.shooter.angle) * speed;
        s.current.moving = true;
      };
      canvas.addEventListener('mousemove', handleMove);
      canvas.addEventListener('touchmove', handleMove, { passive: true });
      canvas.addEventListener('click', handleShoot);
      canvas.addEventListener('touchstart', handleShoot, { passive: true });

      animRef.current = requestAnimationFrame(step);
      return () => {
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('click', handleShoot);
        canvas.removeEventListener('touchstart', handleShoot);
        cancelAnimationFrame(animRef.current);
      };
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8 space-y-4 animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-sky-400">Bubble Pop</h1>
            <canvas ref={canvasRef} className="bg-gray-900 rounded-lg mx-auto block border-2 border-gray-700 cursor-pointer"></canvas>
            <p className="text-center text-gray-500 text-sm">Move to aim, click/tap to shoot. Match 3+ to pop.</p>
            <button onClick={onBack} className="w-full bg-white/70 text-gray-700 font-bold py-3 rounded-xl text-md hover:bg-white transition-colors shadow-card border border-white/40 mt-4">Back to Games</button>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('logger');
  const [loggedMood, setLoggedMood] = useState(null);
  const [loggedDetails, setLoggedDetails] = useState('');
  const [moodHistory, setMoodHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('moodHistory') || '[]'); } catch { return []; }
  });
  
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [playingSpotifyUri, setPlayingSpotifyUri] = useState(null);
  const [viewingArticle, setViewingArticle] = useState(null);

  useEffect(() => {
    const playVideo = (e) => setPlayingVideoId(e.detail);
    const playSpotify = (e) => setPlayingSpotifyUri(e.detail);
    const viewArticle = (e) => setViewingArticle({ ...e.detail, href: `https://www.google.com/search?q=${encodeURIComponent(e.detail.title)}` });
    window.addEventListener('playVideo', playVideo);
    window.addEventListener('playSpotify', playSpotify);
    window.addEventListener('viewArticle', viewArticle);
    return () => { window.removeEventListener('playVideo', playVideo); window.removeEventListener('playSpotify', playSpotify); window.removeEventListener('viewArticle', viewArticle); };
  }, []);

  const handleNavigate = (screen) => { setCurrentScreen(screen); }
  const handleMoodLogged = (mood, details) => { 
    setLoggedMood(mood); setLoggedDetails(details); setCurrentScreen('hub');
    const entry = { mood, details, ts: Date.now() };
    setMoodHistory(prev => {
      const updated = [...prev, entry];
      try { localStorage.setItem('moodHistory', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };
  
  const renderScreen = () => {
    const pageProps = { mood: loggedMood, details: loggedDetails, onBack: () => handleNavigate('hub'), moodHistory };
    switch(currentScreen) {
        case 'logger': return <MoodLogger onMoodLogged={handleMoodLogged} />;
        case 'hub': return <ActivityHub {...pageProps} onBack={() => handleNavigate('logger')} onNavigate={handleNavigate} />;
        case 'watch': return <ContentPage {...pageProps} title="Watch" icon={Icons.watch} fetchFunction={fetchWatchContent} />;
        case 'listen': return <ContentPage {...pageProps} title="Listen" icon={Icons.listen} fetchFunction={fetchListenContent} />;
        case 'read': return <ContentPage {...pageProps} title="Read" icon={Icons.read} fetchFunction={fetchReadContent} />;
        case 'learn': return <LearnPage {...pageProps} />;
        case 'connect': return <PlaceholderPage {...pageProps} title="Connect" icon={Icons.connect} />;
        case 'analytics': return <AnalyticsPage moodHistory={moodHistory} onBack={() => handleNavigate('hub')} />;
        case 'chat': return <ChatView {...pageProps} onNavigate={handleNavigate} />;
        case 'play': return <PlayPage onNavigate={handleNavigate} onBack={() => handleNavigate('hub')} />;
        case 'tetris': return <TetrisGame onBack={() => handleNavigate('play')} />;
        case 'bubbleShooter': return <BubbleShooterGame onBack={() => handleNavigate('play')} />;
        default: return <MoodLogger onMoodLogged={handleMoodLogged} />;
    }
  }

  return (
    <main className="bg-gradient-to-br from-cyan-200 via-purple-200 to-rose-200 min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-16 w-72 h-72 bg-rose-300/40 blur-3xl rounded-full animate-blob mix-blend-multiply" />
        <div className="absolute -bottom-24 -right-10 w-96 h-96 bg-sky-300/40 blur-3xl rounded-full animate-blob [animation-delay:200ms] mix-blend-multiply" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-fuchsia-300/40 blur-3xl rounded-full animate-blob [animation-delay:400ms] mix-blend-multiply" />
      </div>

      <header className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-fuchsia-600 to-rose-600 drop-shadow-sm">
            MoodApp
          </h1>
        </div>
      </header>
      
      {playingVideoId && <VideoPlayerModal videoId={playingVideoId} onClose={() => setPlayingVideoId(null)} />}
      {playingSpotifyUri && <SpotifyPlayerModal embedUri={playingSpotifyUri} onClose={() => setPlayingSpotifyUri(null)} />}
      {viewingArticle && <ArticleViewerModal article={viewingArticle} onClose={() => setViewingArticle(null)} />}

      <div className="w-full max-w-2xl bg-white/60 rounded-3xl shadow-card backdrop-blur-xl border border-white/40">
        <div className="p-2 md:p-3">{renderScreen()}</div>
      </div>
      <footer className="text-center mt-8"><p className="text-gray-600/80 font-medium">MoodApp <span className="font-bold text-gray-700/80">by Medifit</span></p></footer>
    </main>
  );
}
