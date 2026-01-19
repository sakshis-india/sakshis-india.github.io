# Sakshi Sharma - Personal Website

A modern, minimal personal branding website built with pure HTML, CSS, and Vanilla JavaScript. Fully compatible with GitHub Pages hosting.

## Features

- **Dark Cybersecurity Theme**: Professional aesthetic with cyan/teal accents
- **Typing Animation**: Dynamic hero section with rotating quotes
- **Static Blog System**: Markdown-based blog with no build tools required
- **Responsive Design**: Works seamlessly on all devices
- **Zero Dependencies**: No frameworks, just vanilla web technologies

## Folder Structure

```
/
├── index.html              # Home page with typing animation
├── about.html              # About page with resume
├── blogs.html              # Blog listing page
├── blog.html               # Blog reader page
│
├── css/
│   └── styles.css          # All styling
│
├── js/
│   ├── typing.js           # Typing animation logic
│   ├── blogs.js            # Blog listing logic
│   └── blog-reader.js      # Blog reader logic
│
├── blogs/
│   ├── blog-index.json     # Manual index of all blogs
│   ├── 2025-01-15-zero-trust-explained.md
│   └── 2025-02-02-cloud-security-basics.md
│
├── data/
│   └── resume.json         # Resume data
│
├── public/
│   └── resume.pdf          # Downloadable resume (add your PDF here)
│
└── libs/
    └── marked.min.js       # Markdown parser library
```

## How to Add a New Blog Post

Adding a blog requires **only two steps** and **no code changes**:

### Step 1: Create the Markdown File

Create a new file in the `blogs/` folder with the naming format:

```
YYYY-MM-DD-title-slug.md
```

**Example**: `2025-03-10-security-automation-tips.md`

### Step 2: Add Frontmatter

At the top of your markdown file, add the required metadata:

```markdown
---
title: Your Blog Title
date: 2025-03-10
tags: security, automation, devops
description: A short description of your blog post.
---

## Your Content Here

Write your blog content using standard Markdown syntax...
```

### Step 3: Update the Blog Index

Add an entry to `blogs/blog-index.json`:

```json
{
  "slug": "2025-03-10-security-automation-tips",
  "title": "Security Automation Tips",
  "date": "2025-03-10",
  "description": "A short description of your blog post."
}
```

That's it! Your blog post is now live.

## Customization Guide

### Update Personal Information

1. **Name and Role**: Edit `index.html` (lines with `<h1 class="name">` and `<h2 class="role">`)
2. **LinkedIn URL**: Update the LinkedIn link in `index.html`
3. **About Page Content**: Edit the intro text in `about.html`
4. **Resume Data**: Modify `data/resume.json` with your experience, skills, certifications, and education

### Customize Typing Animation

Edit `js/typing.js` and update the `quotes` array:

```javascript
const quotes = [
    "Your custom quote here.",
    "Another inspiring message.",
    "Add as many as you want."
];
```

### Change Theme Colors

Edit `css/styles.css` and modify the CSS variables:

```css
:root {
    --bg-primary: #0a0e27;        /* Main background */
    --accent-primary: #00d9ff;     /* Accent color */
    /* ... other colors ... */
}
```

## Local Development

### Method 1: Python Simple HTTP Server

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

### Method 2: Node.js HTTP Server

If you have Node.js installed:

```bash
npx http-server -p 8000
```

Then open: http://localhost:8000

### Method 3: VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Deploying to GitHub Pages

### Step 1: Create a GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/sakshis-india/sakshis-india.github.io.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **main** branch
4. Click **Save**

Your site will be live at: `https://sakshis-india.github.io`

### Step 3: Custom Domain (Optional)

To use a custom domain like `sakshisharma.com`:

1. Add a file named `CNAME` in the root with your domain:
   ```
   sakshisharma.com
   ```
2. Configure DNS with your domain provider:
   - Add an A record pointing to GitHub Pages IPs
   - Or add a CNAME record pointing to `sakshis-india.github.io`

## Adding Your Resume PDF

1. Create or export your resume as a PDF
2. Save it as `public/resume.pdf`
3. Commit and push to GitHub

The download button will automatically work.

## Editing Content Without Code

All content is stored in easily editable files:

- **Typing quotes**: `js/typing.js` (JavaScript array)
- **Resume**: `data/resume.json` (JSON format)
- **About page intro**: `about.html` (HTML)
- **Blog posts**: `blogs/*.md` (Markdown files)

You can edit these files directly on GitHub's web interface without cloning the repository.

## Browser Compatibility

This site works on all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

This site follows web accessibility best practices:

- Semantic HTML
- ARIA labels for icons
- Keyboard navigation support
- High contrast colors
- Responsive text sizing

## License

This website template is open source. Feel free to use it for your own personal website.

## Support

For issues or questions about this website:

1. Check this README first
2. Review the code comments
3. Test in your browser's developer console

## Future Enhancements

Potential additions you might consider:

- RSS feed for blog posts
- Dark/light theme toggle
- Search functionality for blogs
- Tags/categories filtering
- Comment system (via external service)
- Contact form
- Newsletter signup

## Credits

- **Markdown Parser**: [Marked.js](https://marked.js.org/)
- **Icons**: Inline SVG (no external dependencies)
- **Fonts**: System font stack for maximum performance

---

**Built for GitHub Pages | Zero Build Tools | 100% Static**
