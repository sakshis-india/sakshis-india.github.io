// Blog listing page logic

function groupBlogsByYearAndMonth(blogs) {
    const grouped = {};

    blogs.forEach(blog => {
        const date = new Date(blog.date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });

        if (!grouped[year]) {
            grouped[year] = {};
        }
        if (!grouped[year][month]) {
            grouped[year][month] = [];
        }

        grouped[year][month].push(blog);
    });

    return grouped;
}

function renderBlogs(blogs) {
    const container = document.getElementById('blogs-container');

    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p class="error">No blog posts found.</p>';
        return;
    }

    // Sort blogs by date (newest first)
    blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group by year and month
    const grouped = groupBlogsByYearAndMonth(blogs);

    let html = '';

    // Sort years in descending order
    const years = Object.keys(grouped).sort((a, b) => b - a);

    years.forEach(year => {
        html += `<div class="blog-year-group">`;
        html += `<h2>${year}</h2>`;

        // Get months for this year
        const months = grouped[year];
        const monthOrder = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Sort months in reverse chronological order
        const sortedMonths = Object.keys(months).sort((a, b) => {
            return monthOrder.indexOf(b) - monthOrder.indexOf(a);
        });

        sortedMonths.forEach(month => {
            html += `<div class="blog-month-group">`;
            html += `<h3>${month}</h3>`;

            // Sort blogs within month by date (newest first)
            months[month].sort((a, b) => new Date(b.date) - new Date(a.date));

            months[month].forEach(blog => {
                const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                html += `
                    <div class="blog-item" onclick="window.location.href='blog.html?slug=${blog.slug}'">
                        <h4>${blog.title}</h4>
                        <p class="blog-date">${formattedDate}</p>
                        <p class="blog-description">${blog.description}</p>
                    </div>
                `;
            });

            html += `</div>`; // Close blog-month-group
        });

        html += `</div>`; // Close blog-year-group
    });

    container.innerHTML = html;
}

// Load blog index
fetch('blogs/blog-index.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load blog index');
        }
        return response.json();
    })
    .then(blogs => renderBlogs(blogs))
    .catch(error => {
        console.error('Error loading blogs:', error);
        document.getElementById('blogs-container').innerHTML =
            '<p class="error">Failed to load blog posts. Please try again later.</p>';
    });
