const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API לקבלת מידע על הסרטון
app.post('/api/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'קישור לא תקין' });
    }

    const info = await ytdl.getInfo(url);
    
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: info.videoDetails.lengthSeconds,
      formats: {
        audio: ['128kbps', '320kbps'],
        video: ['360p', '720p', '1080p']
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'שגיאה בטעינת המידע' });
  }
});

// API להורדת הקובץ
app.post('/api/download', async (req, res) => {
  try {
    const { url, format, quality } = req.body;

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'קישור לא תקין' });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    if (format === 'mp3') {
      res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
      
      ytdl(url, {
        quality: 'highestaudio',
        filter: 'audioonly'
      }).pipe(res);
      
    } else {
      const qualityMap = {
        '360p': '18',
        '720p': '22',
        '1080p': '137'
      };
      
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      
      ytdl(url, {
        quality: qualityMap[quality] || 'highest',
        filter: format => format.container === 'mp4'
      }).pipe(res);
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'שגיאה בהורדת הקובץ' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

