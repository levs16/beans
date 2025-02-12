# beans.
A quiet corner of the internet for sharing thoughts.

## About
beans is a minimalist blogging platform designed for thoughtful expression. No likes, no comments, no notifications—just words finding their way from one mind to another.

## Features
- 🌓 Automatic dark/light theme based on system preferences
- 🎨 Clean, minimalist design focused on readability
- 🔒 Simple authentication system
- 📱 Fully responsive across all devices
- ✨ Smooth page transitions
- 👥 Anonymous visitor tracking
- 🔔 Elegant notification system

## Tech Stack
- Node.js & Express
- EJS templating
- Vanilla JavaScript
- CSS3 with custom properties
- File-based session storage
- JSON for data persistence

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm
- sudo/administrator privileges (for port 80)

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/beans.git
cd beans
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
# On Linux/Mac
sudo npm start

# On Windows (Run as Administrator)
npm start
```

For development with auto-reload:
```bash
# On Linux/Mac
sudo npm run dev

# On Windows (Run as Administrator)
npm run dev
```

The application will be available at `http://yourdomain.com` or `http://localhost`

Note: Running on port 80 requires elevated privileges. If you get a permission error, either:
- Run with sudo (Linux/Mac)
- Run as Administrator (Windows)
- Or use a reverse proxy like nginx (recommended for production)

### Default Login
- Username: default
- Password: default

## Project Structure
```
beans/
├── data/               # JSON data storage
├── public/             # Static assets
│   ├── css/           # Stylesheets
│   └── js/            # Client-side scripts
├── views/             # EJS templates
├── server.js          # Main application file
└── package.json
```

## Contributing
This is a personal project, but if you find any bugs or have suggestions, feel free to open an issue.

## License
This project is private and not licensed for public use.