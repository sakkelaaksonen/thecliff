# Build script

## Project Structure

```
/
├── src/                    # Source files for compilation
│   └── source.css         # Tailwind CSS source
├── htdocs/                # Static assets & build target
│   ├── index.html         # Static HTML files
│   ├── 404.html
│   ├── assets/            # Static assets
│   ├── .htaccess          # Server configuration
│   └── robots.txt         # SEO files
├── build.js               # Build & deploy script
└── package.json
```

## Development

```bash
npm run dev
```

- Watches src/source.css and rebuilds htdocs/main.css on changes
- For local development

## Build:prod

```bash
npm run build:prod
```

- Build CSS from src/source.css to htdocs/main.css (minified)
- Generate sitemap.xml in htdocs/
- Process any additional source files from src/
- Verify all required files exist in htdocs/
- Show complete directory listing of htdocs/

## Build:deploy

```bash
npm run build:deploy
```

- Run complete production build
- Deploy htdocs/ directory to hosting company via SFTP
- Uses credentials from keys.json file only (no interactive input)

### Credentials Management:

Create a `keys.json` file in the project root:

```json
{
  "sftp": {
    "host": "ftp-fr3.arkku.net",
    "port": 2201,
    "username": "ftp@thecliff.fi",
    "password": "your_password",
    "remoteDir": "/htdocs"
  }
}
```

**Required Fields:**
- `host`: SFTP server hostname (no protocol, just hostname)
- `port`: SFTP port number
- `username`: Your SFTP username
- `password`: Your SFTP password
- `remoteDir`: Remote directory path where files should be uploaded

**⚠️ Security Warning:** 
- Never commit `keys.json` to version control
- The file is already excluded in `.gitignore`
- Use strong passwords and consider changing them regularly

### Prerequisites for deployment:

- **sshpass** must be installed for password authentication:
  - macOS: `brew install hudochenkov/sshpass/sshpass`
  - Ubuntu/Debian: `sudo apt-get install sshpass`
  - CentOS/RHEL: `sudo yum install sshpass`

- **OpenSSH client** (usually pre-installed):
  - macOS: Already included with system
  - Ubuntu/Debian: `sudo apt-get install openssh-client`
  - CentOS/RHEL: `sudo yum install openssh-clients`

### Deployment process:

1. Builds production files in htdocs/
2. Reads SFTP credentials from keys.json
3. Connects to hosting server via SFTP with password authentication
4. Uploads htdocs/ directory contents to remote server
5. Confirms successful deployment

### Security notes:

- Uses SFTP (SSH File Transfer Protocol) for secure file transfer
- Credentials stored in keys.json (excluded from version control)
- All data transfer is encrypted
- Uses `StrictHostKeyChecking=no` for easier connections

## Folder Structure Benefits:

- ✅ **Clean separation**: Source files in `/src`, static assets in `/htdocs`
- ✅ **Build target**: htdocs/ is ready for direct deployment
- ✅ **Future-proof**: Easy to add JS compilation, template processing, etc.
- ✅ **No file copying**: Static assets stay in place, only compiled files are generated

```bash
npm run build:prod
```



- build css from src/source.css to htdocs/main.css
- build sitemap.xml to htdocs/sitemap.xml
<!-- - build robots.txt to htdocs/robots.txt -->
<!-- - build 404.html to htdocs/404.html -->
<!-- - build index.html to htdocs/index.html-->

## Build:deploy

```bash
run build:prod
deploy to local hosting company via ftp
copy content of htdocs to remote htdocs folder of hosting company via ftp
Prompt user for username and password


```
