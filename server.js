const express = require('express');
const session = require('express-session');
const fs = require('fs').promises;
const path = require('path');
const FileStore = require('session-file-store')(session);
const app = express();
const crypto = require('crypto');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  store: new FileStore({
    path: './sessions',
    retries: 0
  }),
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.set('view engine', 'ejs');

const log = (...args) => {
  console.log('\n[DEBUG]', ...args, '\n');
};

const requireAuth = (req, res, next) => {
  log('🔒 Auth Check:', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.username,
    sessionID: req.sessionID
  });
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.use((req, res, next) => {
  if (req.session) {
    req.session.previousPath = req.session.currentPath || '/';
    req.session.currentPath = req.path;
  }
  next();
});

const createNewDayData = () => ({
  date: new Date().toISOString().split('T')[0],
  count: 0,
  visitors: {
    sessions: new Set(),
    ips: new Set()
  }
});

app.use(async (req, res, next) => {
  try {
    let visitorData;
    
    try {
      visitorData = JSON.parse(await fs.readFile('./data/visitors.json', 'utf8'));
      if (visitorData.dailyVisits.visitors) {
        visitorData.dailyVisits.visitors.sessions = new Set(visitorData.dailyVisits.visitors.sessions);
        visitorData.dailyVisits.visitors.ips = new Set(visitorData.dailyVisits.visitors.ips);
      }
    } catch (err) {
      visitorData = { dailyVisits: createNewDayData() };
    }

    const today = new Date().toISOString().split('T')[0];
    
    if (visitorData.dailyVisits.date !== today) {
      visitorData.dailyVisits = createNewDayData();
    }

    const sessionId = req.sessionID;
    const ip = req.ip;
    const visitorHash = crypto
      .createHash('sha256')
      .update(sessionId + ip)
      .digest('hex');

    const isNewSession = !visitorData.dailyVisits.visitors.sessions.has(visitorHash);
    const isNewIp = !visitorData.dailyVisits.visitors.ips.has(ip);

    if (isNewSession && isNewIp && !req.path.startsWith('/login')) {
      visitorData.dailyVisits.count++;
      visitorData.dailyVisits.visitors.sessions.add(visitorHash);
      visitorData.dailyVisits.visitors.ips.add(ip);

      const dataToStore = {
        dailyVisits: {
          date: visitorData.dailyVisits.date,
          count: visitorData.dailyVisits.count,
          visitors: {
            sessions: Array.from(visitorData.dailyVisits.visitors.sessions),
            ips: Array.from(visitorData.dailyVisits.visitors.ips)
          }
        }
      };

      await fs.writeFile('./data/visitors.json', JSON.stringify(dataToStore, null, 2));
    }

    res.locals.visitorCount = visitorData.dailyVisits.count;
    next();
  } catch (err) {
    console.error('Error tracking visitors:', err);
    res.locals.visitorCount = '?';
    next();
  }
});

// Routes
app.get('/', async (req, res) => {
  const data = JSON.parse(await fs.readFile('./data/posts.json', 'utf8'));
  res.render('index', { posts: data.posts });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  log('🔑 Login Attempt:', { username });
  
  const users = JSON.parse(await fs.readFile('./data/users.json', 'utf8'));
  const user = users.users.find(u => 
    u.username === username && u.password === password
  );

  if (user) {
    req.session.regenerate((err) => {
      if (err) {
        log('❌ Session regeneration failed:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      
      req.session.isAuthenticated = true;
      req.session.username = username;
      
      req.session.save((err) => {
        if (err) {
          log('❌ Session save failed:', err);
          return res.status(500).json({ error: 'Session error' });
        }
        
        log('✅ Login Success:', {
          username,
          sessionID: req.sessionID,
          session: req.session
        });
        res.redirect('/editor');
      });
    });
  } else {
    log('❌ Login Failed');
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/editor', requireAuth, (req, res) => {
  res.render('editor');
});

app.post('/post', requireAuth, async (req, res) => {
  if (!req.session.username) {
    log('❌ Missing username in session!', req.session);
    return res.redirect('/login');
  }

  log('📝 Creating Post:', {
    username: req.session.username,
    sessionID: req.sessionID,
    fullSession: req.session
  });
  
  const { title, content } = req.body;
  const data = JSON.parse(await fs.readFile('./data/posts.json', 'utf8'));
  
  const formattedContent = content.replace(/\r?\n/g, '<br>');
  
  const newPost = {
    id: Date.now(),
    title,
    content: formattedContent,
    date: new Date().toISOString(),
    author: req.session.username
  };
  
  log('📦 New Post Object:', newPost);
  
  data.posts.unshift(newPost);
  await fs.writeFile('./data/posts.json', JSON.stringify(data, null, 2));
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      log('❌ Logout failed:', err);
    }
    res.redirect('/');
  });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    status: '500',
    title: 'something went wrong',
    message: 'the server had a moment. maybe try again?'
  });
});

app.use((req, res) => {
  res.status(404).render('error', {
    status: '404',
    title: 'got lost in thought',
    message: 'this page seems to have wandered off somewhere else.'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 