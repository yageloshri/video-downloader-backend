const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API לקבלת מידע על הסרטון
app.post('/api/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    // חלץ את ה-video ID מה-URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    
    if (!videoId) {
      return res.status(400).json({ error: 'קישור לא תקין' });
    }

    // השתמש ב-YouTube oEmbed API לקבלת מידע בסיסי
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    
    res.json({
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId: videoId,
      formats: {
        audio: ['mp3'],
        video: ['360p', '720p', '1080p']
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'שגיאה בטעינת המידע' });
  }
});

// API להפניה להורדה
app.post('/api/download', async (req, res) => {
  try {
    const { url, format, quality } = req.body;
    
    // חלץ video ID
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    
    if (!videoId) {
      return res.status(400).json({ error: 'קישור לא תקין' });
    }

    // השתמש ב-API חיצוני חינמי
    let downloadUrl;
    
    if (format === 'mp3') {
      // הפנה ל-API להורדת MP3
      downloadUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
    } else {
      // הפנה ל-API להורדת MP4
      downloadUrl = `https://api.vevioz.com/api/button/${quality}/${videoId}`;
    }

    res.json({ 
      success: true,
      downloadUrl: downloadUrl,
      message: 'הקישור להורדה מוכן'
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'שגיאה ביצירת קישור הורדה' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
