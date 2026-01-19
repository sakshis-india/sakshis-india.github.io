// Blog reader page logic

function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

function parseFrontmatter(markdown) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);

    if (!match) {
        // No frontmatter found
        return {
            metadata: {},
            content: markdown
        };
    }

    const frontmatterText = match[1];
    const content = match[2];

    // Parse frontmatter (simple key: value format)
    const metadata = {};
    frontmatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            metadata[key] = value;
        }
    });

    return { metadata, content };
}

function renderBlogPost(slug) {
    const articleContent = document.getElementById('article-content');

    // Fetch the markdown file
    fetch(`blogs/${slug}.md`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Blog post not found');
            }
            return response.text();
        })
        .then(markdown => {
            // Parse frontmatter and content
            const { metadata, content } = parseFrontmatter(markdown);

            // Convert markdown to HTML using marked.js
            const htmlContent = marked.parse(content);

            // Format date
            let dateString = '';
            if (metadata.date) {
                const date = new Date(metadata.date);
                dateString = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            // Build the article HTML
            let html = `
                <h1>${metadata.title || 'Untitled'}</h1>
                <div class="article-meta">
                    ${dateString ? `<p>${dateString}</p>` : ''}
                    ${metadata.tags ? `<p>Tags: ${metadata.tags}</p>` : ''}
                </div>
                <div class="article-body">
                    ${htmlContent}
                </div>
            `;

            articleContent.innerHTML = html;

            // Update page title
            if (metadata.title) {
                document.title = `${metadata.title} | Sakshi Sharma`;
            }
        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            articleContent.innerHTML = `
                <h1>Error</h1>
                <p class="error">Failed to load blog post. It may not exist or there was a problem loading it.</p>
                <a href="blogs.html" class="btn btn-primary" style="margin-top: 2rem;">Back to all blogs</a>
            `;
        });
}

// Load blog post on page load
document.addEventListener('DOMContentLoaded', () => {
    const slug = getSlugFromUrl();

    if (!slug) {
        document.getElementById('article-content').innerHTML = `
            <h1>No blog post specified</h1>
            <p class="error">Please select a blog post from the blog listing page.</p>
            <a href="blogs.html" class="btn btn-primary" style="margin-top: 2rem;">View all blogs</a>
        `;
        return;
    }

    renderBlogPost(slug);
});
