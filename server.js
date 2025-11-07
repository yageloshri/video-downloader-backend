const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API לקבלת מידע על הסרטון
app.post('/api/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true
    });
    
    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
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

    const options = {
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    };

    if (format === 'mp3') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.audioQuality = 0;
    } else {
      const formatMap = {
        '360p': '18',
        '720p': '22', 
        '1080p': '137+140'
      };
      options.format = formatMap[quality] || 'best';
    }

    const output = await youtubedl(url, {
      ...options,
      output: '-'
    });

    res.header('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    res.send(output);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'שגיאה בהורדת הקובץ' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
