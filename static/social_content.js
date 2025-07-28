// Facebook posting functions - defined at top level for immediate availability
function postToFacebook(pageId, message) {
    alert('[DEBUG] postToFacebook called with pageId: ' + pageId + ', message length: ' + message.length);
    
    fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: pageId, message: message })
    })
    .then(res => {
        alert('[DEBUG] API response status: ' + res.status);
        return res.json();
    })
    .then(data => {
        alert('[DEBUG] API response data: ' + JSON.stringify(data));
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Posted to Facebook! Post ID: ' + data.id);
        }
    })
    .catch(err => {
        alert('[DEBUG] Network error: ' + err);
        alert('Network error: ' + err);
    });
}

// Function to handle Facebook posting with data from button
function postToFacebookWithData(button) {
    console.log('=== FACEBOOK POST DEBUG START ===');
    console.log('Button clicked at:', new Date().toISOString());
    
    // Debug all button attributes first
    console.log('=== BUTTON ATTRIBUTES ===');
    console.log('data-title:', button.getAttribute('data-title') || 'NOT SET');
    console.log('data-description:', button.getAttribute('data-description') || 'NOT SET');
    console.log('data-hashtags:', button.getAttribute('data-hashtags') || 'NOT SET');
    console.log('data-image-url:', button.getAttribute('data-image-url') || 'NOT SET');
    
    // Show all attributes for debugging
    console.log('All button attributes:');
    for (let i = 0; i < button.attributes.length; i++) {
        console.log('  ' + button.attributes[i].name + '=' + button.attributes[i].value);
    }
    
    const title = button.getAttribute('data-title') || '';
    const description = button.getAttribute('data-description') || '';
    const hashtags = button.getAttribute('data-hashtags') || '';
    let imageUrl = button.getAttribute('data-image-url') || '';
    
    console.log('=== EXTRACTED DATA ===');
    console.log('Title:', title);
    console.log('Description:', description.substring(0, 100) + '...');
    console.log('Hashtags:', hashtags);
    console.log('Image URL from button:', imageUrl);
    
    // Additional debugging for empty image URL
    if (!imageUrl) {
        console.log('=== IMAGE URL IS EMPTY - DEBUGGING ===');
        console.log('Button element:', button);
        console.log('All button attributes:');
        for (let i = 0; i < button.attributes.length; i++) {
            const attr = button.attributes[i];
            console.log(`  ${attr.name}: "${attr.value}"`);
        }
        console.log('Specific data-image-url check:', button.hasAttribute('data-image-url'));
        console.log('getAttribute result:', button.getAttribute('data-image-url'));
        console.log('Direct property access:', button.dataset.imageUrl);
    }
    
    // If no image URL from button, try to find post card and extract from carousel
    if (!imageUrl) {
        console.log('=== SEARCHING FOR POST CARD ===');
        
        // Try to find post card
        let postCard = button.closest('.post-card');
        console.log('Found with closest():', !!postCard);
        
        if (!postCard) {
            // Try finding by data-platform
            const facebookElements = document.querySelectorAll('[data-platform="facebook"]');
            console.log('Found', facebookElements.length, 'elements with data-platform="facebook"');
            
            if (facebookElements.length > 0) {
                postCard = facebookElements[facebookElements.length - 1];
                console.log('Using last Facebook element as post card');
            }
        }
        
        if (postCard) {
            console.log('Post card found, searching for images...');
            
            // Look for carousel images
            const carouselItems = postCard.querySelectorAll('.carousel-item');
            console.log('Found', carouselItems.length, 'carousel items');
            
            for (let item of carouselItems) {
                const bgImage = item.style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (match) {
                        imageUrl = match[1];
                        console.log('Found image URL in carousel:', imageUrl);
                        break;
                    }
                }
            }
            
            // If still no image, look for img tags
            if (!imageUrl) {
                const imgs = postCard.querySelectorAll('img');
                console.log('Found', imgs.length, 'img tags');
                for (let img of imgs) {
                    if (img.src && !img.src.includes('platform-icons')) {
                        imageUrl = img.src;
                        console.log('Found image URL in img tag:', imageUrl);
                        break;
                    }
                }
            }
        } else {
            console.log('No post card found!');
        }
        
        // If still no image, try to find from the stored fullPost data
        if (!imageUrl) {
            console.log('=== SEARCHING IN STORED DATA ===');
            
            // Try to get the full post HTML from the grid container
            const gridContainer = button.closest('.image-grid-container');
            if (gridContainer) {
                const postsGrid = document.getElementById('postsGrid');
                if (postsGrid) {
                    const allPostCards = postsGrid.querySelectorAll('.post-card[data-platform="facebook"]');
                    console.log('Found', allPostCards.length, 'Facebook post cards in posts grid');
                    
                    for (let card of allPostCards) {
                        const fullPost = card.getAttribute('data-full-post');
                        if (fullPost) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = fullPost;
                            const facebookBtn = tempDiv.querySelector('.facebook-post-btn');
                            if (facebookBtn) {
                                const storedImageUrl = facebookBtn.getAttribute('data-image-url');
                                if (storedImageUrl) {
                                    imageUrl = storedImageUrl;
                                    console.log('Found image URL in stored data:', imageUrl);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    console.log('=== FINAL RESULT ===');
    console.log('Final image URL:', imageUrl || 'NONE');
    
    // Combine message
    let message = '';
    if (title) message += title + '\n\n';
    if (description) message += description + '\n\n';
    if (hashtags) message += hashtags;
    
    console.log('Final message length:', message.length);
    console.log('Message preview:', message.substring(0, 200) + '...');
    
    // Facebook Page ID will be fetched from environment variables on backend
    console.log('Facebook Page ID will be fetched from .env file on backend');
    
    // Update button state
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    button.disabled = true;
    
    console.log('=== MAKING API CALL ===');
    console.log('Has image:', !!imageUrl);
    
    // Make the API call (page_id will be fetched from .env on backend)
    const postData = { 
        message: message.trim()
    };
    
    if (imageUrl) {
        postData.image_url = imageUrl;
    }
    
    console.log('API request data:', postData);
    
    fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(res => {
        console.log('API response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('API response data:', data);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
        
        if (data.error) {
            alert('Error posting to Facebook: ' + data.error);
            console.error('Facebook API error:', data.error);
        } else {
            alert('Successfully posted to Facebook! Post ID: ' + (data.id || 'Unknown'));
            console.log('Success! Post ID:', data.id);
        }
    })
    .catch(err => {
        console.error('Network error:', err);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
        
        alert('Network error occurred: ' + err.message);
    });
    
    console.log('=== FACEBOOK POST DEBUG END ===');
}

// Instagram posting functions
function postToInstagram(userId, caption, imageUrl) {
    alert('[DEBUG] postToInstagram called with userId: ' + userId + ', caption length: ' + caption.length);
    
    fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, caption: caption, image_url: imageUrl })
    })
    .then(res => {
        alert('[DEBUG] API response status: ' + res.status);
        return res.json();
    })
    .then(data => {
        alert('[DEBUG] API response data: ' + JSON.stringify(data));
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Posted to Instagram! Post ID: ' + data.id);
        }
    })
    .catch(err => {
        alert('[DEBUG] Network error: ' + err);
        alert('Network error: ' + err);
    });
}

// Function to handle Instagram posting with data from button
function postToInstagramWithData(button) {
    console.log('=== INSTAGRAM POST DEBUG START ===');
    console.log('Button clicked at:', new Date().toISOString());
    
    // Debug all button attributes first
    console.log('=== BUTTON ATTRIBUTES ===');
    console.log('data-title:', button.getAttribute('data-title') || 'NOT SET');
    console.log('data-description:', button.getAttribute('data-description') || 'NOT SET');
    console.log('data-hashtags:', button.getAttribute('data-hashtags') || 'NOT SET');
    console.log('data-image-url:', button.getAttribute('data-image-url') || 'NOT SET');
    
    const title = button.getAttribute('data-title') || '';
    const description = button.getAttribute('data-description') || '';
    const hashtags = button.getAttribute('data-hashtags') || '';
    let imageUrl = button.getAttribute('data-image-url') || '';
    
    console.log('=== EXTRACTED DATA ===');
    console.log('Title:', title);
    console.log('Description:', description.substring(0, 100) + '...');
    console.log('Hashtags:', hashtags);
    console.log('Image URL from button:', imageUrl);
    
    // If no image URL from button, try to find post card and extract from carousel
    if (!imageUrl) {
        console.log('=== SEARCHING FOR POST CARD ===');
        
        let postCard = button.closest('.post-card');
        console.log('Found with closest():', !!postCard);
        
        if (!postCard) {
            const instagramElements = document.querySelectorAll('[data-platform="instagram"]');
            console.log('Found', instagramElements.length, 'elements with data-platform="instagram"');
            
            if (instagramElements.length > 0) {
                postCard = instagramElements[instagramElements.length - 1];
                console.log('Using last Instagram element as post card');
            }
        }
        
        if (postCard) {
            console.log('Post card found, searching for images...');
            
            // Look for carousel images
            const carouselItems = postCard.querySelectorAll('.carousel-item');
            console.log('Found', carouselItems.length, 'carousel items');
            
            for (let item of carouselItems) {
                const bgImage = item.style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (match) {
                        imageUrl = match[1];
                        console.log('Found image URL in carousel:', imageUrl);
                        break;
                    }
                }
            }
            
            // If still no image, look for img tags
            if (!imageUrl) {
                const imgs = postCard.querySelectorAll('img');
                console.log('Found', imgs.length, 'img tags');
                for (let img of imgs) {
                    if (img.src && !img.src.includes('platform-icons')) {
                        imageUrl = img.src;
                        console.log('Found image URL in img tag:', imageUrl);
                        break;
                    }
                }
            }
        }
    }
    
    console.log('=== FINAL RESULT ===');
    console.log('Final image URL:', imageUrl || 'NONE');
    
    // Combine caption (Instagram combines title, description, and hashtags)
    let caption = '';
    if (title) caption += title + '\n\n';
    if (description) caption += description + '\n\n';
    if (hashtags) caption += hashtags;
    
    console.log('Final caption length:', caption.length);
    console.log('Caption preview:', caption.substring(0, 200) + '...');
    
    // Instagram requires an image
    if (!imageUrl) {
        alert('Instagram requires an image to post. Please make sure your post has an image.');
        return;
    }
    
    // Instagram User ID will be fetched from environment variables on backend
    console.log('Instagram User ID will be fetched from .env file on backend');
    
    // Update button state
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    button.disabled = true;
    
    console.log('=== MAKING API CALL ===');
    console.log('Has image:', !!imageUrl);
    
    // Make the API call (user_id will be fetched from .env on backend)
    const postData = { 
        caption: caption.trim(),
        image_url: imageUrl
    };
    
    console.log('API request data:', postData);
    
    fetch('/api/instagram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(res => {
        console.log('API response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('API response data:', data);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
        
        if (data.error) {
            alert('Error posting to Instagram: ' + data.error);
            console.error('Instagram API error:', data.error);
        } else {
            alert('Successfully posted to Instagram! Post ID: ' + (data.id || 'Unknown'));
            console.log('Success! Post ID:', data.id);
        }
    })
    .catch(err => {
        console.error('Network error:', err);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
        
        alert('Network error occurred: ' + err.message);
    });
    
    console.log('=== INSTAGRAM POST DEBUG END ===');
}

// LinkedIn posting functions
function postToLinkedIn(userId, text, imageUrl) {
    alert('[DEBUG] postToLinkedIn called with userId: ' + userId + ', text length: ' + text.length);
    
    fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, text: text, image_url: imageUrl })
    })
    .then(res => {
        alert('[DEBUG] API response status: ' + res.status);
        return res.json();
    })
    .then(data => {
        alert('[DEBUG] API response data: ' + JSON.stringify(data));
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Posted to LinkedIn! Post ID: ' + data.id);
        }
    })
    .catch(err => {
        alert('[DEBUG] Network error: ' + err);
        alert('Network error: ' + err);
    });
}

// Function to handle LinkedIn posting with data from button
function postToLinkedInWithData(button) {
    console.log('=== LINKEDIN POST DEBUG START ===');
    console.log('Button clicked at:', new Date().toISOString());
    
    // Debug all button attributes first
    console.log('=== BUTTON ATTRIBUTES ===');
    console.log('data-title:', button.getAttribute('data-title') || 'NOT SET');
    console.log('data-description:', button.getAttribute('data-description') || 'NOT SET');
    console.log('data-hashtags:', button.getAttribute('data-hashtags') || 'NOT SET');
    console.log('data-image-url:', button.getAttribute('data-image-url') || 'NOT SET');
    
    const title = button.getAttribute('data-title') || '';
    const description = button.getAttribute('data-description') || '';
    const hashtags = button.getAttribute('data-hashtags') || '';
    let imageUrl = button.getAttribute('data-image-url') || '';
    
    console.log('=== EXTRACTED DATA ===');
    console.log('Title:', title);
    console.log('Description:', description.substring(0, 100) + '...');
    console.log('Hashtags:', hashtags);
    console.log('Image URL from button:', imageUrl);
    
    // If no image URL from button, try to find post card and extract from carousel
    if (!imageUrl) {
        console.log('=== SEARCHING FOR POST CARD ===');
        
        let postCard = button.closest('.post-card');
        console.log('Found with closest():', !!postCard);
        
        if (!postCard) {
            const linkedinElements = document.querySelectorAll('[data-platform="linkedin"]');
            console.log('Found', linkedinElements.length, 'elements with data-platform="linkedin"');
            
            if (linkedinElements.length > 0) {
                postCard = linkedinElements[linkedinElements.length - 1];
                console.log('Using last LinkedIn element as post card');
            }
        }
        
        if (postCard) {
            console.log('Post card found, searching for images...');
            
            // Look for carousel images
            const carouselItems = postCard.querySelectorAll('.carousel-item');
            console.log('Found', carouselItems.length, 'carousel items');
            
            for (let item of carouselItems) {
                const bgImage = item.style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (match) {
                        imageUrl = match[1];
                        console.log('Found image URL in carousel:', imageUrl);
                        break;
                    }
                }
            }
            
            // If still no image, look for img tags
            if (!imageUrl) {
                const imgs = postCard.querySelectorAll('img');
                console.log('Found', imgs.length, 'img tags');
                for (let img of imgs) {
                    if (img.src && !img.src.includes('platform-icons')) {
                        imageUrl = img.src;
                        console.log('Found image URL in img tag:', imageUrl);
                        break;
                    }
                }
            }
        }
    }
    
    console.log('=== FINAL RESULT ===');
    console.log('Final image URL:', imageUrl || 'NONE');
    
    // Combine text (LinkedIn combines title, description, and hashtags)
    let text = '';
    if (title) text += title + '\n\n';
    if (description) text += description + '\n\n';
    if (hashtags) text += hashtags;
    
    console.log('Final text length:', text.length);
    console.log('Text preview:', text.substring(0, 200) + '...');
    
    // LinkedIn requires text content
    if (!text.trim()) {
        alert('LinkedIn requires text content for posts. Please add a title or description.');
        return;
    }
    
    // LinkedIn User ID will be fetched from environment variables on backend
    console.log('LinkedIn User ID will be fetched from .env file on backend');
    
    // Update button state
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    button.disabled = true;
    
    console.log('=== MAKING API CALL ===');
    console.log('Has image:', !!imageUrl);
    
    // Get LinkedIn access token from localStorage or try backend
    let accessToken = localStorage.getItem('linkedin_access_token');
    
    // If no token in localStorage, try to get it from backend environment variables
    // We'll send the request without access_token and let backend handle it
    console.log('LinkedIn access token from localStorage:', accessToken ? 'Found' : 'Not found');
    
    // Make the API call (user_id will be fetched from .env on backend)
    const postData = { 
        text: text.trim()
    };
    
    // Only include access_token if we have one from localStorage
    // If not, backend will use environment variable
    if (accessToken) {
        postData.access_token = accessToken;
    }
    
    if (imageUrl) {
        postData.image_url = imageUrl;
    }
    
    console.log('API request data:', postData);
    
    fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
    .then(res => {
        console.log('API response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('API response data:', data);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
        
        if (data.error) {
            alert('Error posting to LinkedIn: ' + data.error);
            console.error('LinkedIn API error:', data.error);
        } else {
            alert('Successfully posted to LinkedIn! Post ID: ' + (data.id || 'Unknown'));
            console.log('Success! Post ID:', data.id);
        }
    })
    .catch(err => {
        console.error('Network error:', err);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
        
        alert('Network error occurred: ' + err.message);
    });
    
    console.log('=== LINKEDIN POST DEBUG END ===');
}

// Make functions globally available immediately
window.postToFacebookWithData = postToFacebookWithData;
window.postToFacebook = postToFacebook;
window.postToInstagramWithData = postToInstagramWithData;
window.postToInstagram = postToInstagram;
window.postToLinkedInWithData = postToLinkedInWithData;
window.postToLinkedIn = postToLinkedIn;

// Test function
window.testFacebookFunction = function() {
    if (typeof window.postToFacebookWithData === 'function') {
        alert('[DEBUG] Test function called - Facebook function IS available!');
    } else {
        alert('[DEBUG] Test function called - Facebook function NOT available!');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded at:', new Date().toISOString());
    
    // Test if our function is available
    alert('[DEBUG] social_content.js loaded successfully!');
    
    // Elements
    const platformButtons = document.querySelectorAll('.platform-btn');
    const platformCheckboxes = document.querySelectorAll('.platform-checkbox');
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const generatePostBtn = document.querySelector('.generate-post-btn');
    const postsGrid = document.getElementById('postsGrid');
    let uploadedFiles = []; // Changed from single file to array
    
    // Initialize carousels for all posts
    function initializeCarousels() {
        const carousels = document.querySelectorAll('.post-carousel');
        carousels.forEach(carousel => {
            const container = carousel.querySelector('.carousel-container');
            const items = container.querySelectorAll('.carousel-item');
            const indicators = container.querySelectorAll('.carousel-indicator');
            const prevBtn = container.querySelector('.carousel-prev');
            const nextBtn = container.querySelector('.carousel-next');
            let currentIndex = 0;

            // Function to show a specific slide
            function showSlide(index) {
                items.forEach(item => item.classList.remove('active'));
                indicators.forEach(indicator => indicator.classList.remove('active'));
                
                items[index].classList.add('active');
                if (indicators[index]) {
                    indicators[index].classList.add('active');
                }
                currentIndex = index;
            }

            // Initialize first slide
            if (items.length > 0) {
                showSlide(0);
            }

            // Add click handlers for indicators
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => showSlide(index));
            });

            // Add click handlers for prev/next buttons
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    const newIndex = (currentIndex - 1 + items.length) % items.length;
                    showSlide(newIndex);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const newIndex = (currentIndex + 1) % items.length;
                    showSlide(newIndex);
                });
            }
        });
    }

    // Add action buttons to posts
    function addActionButtonsToPosts() {
        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            // Initialize carousel if present
            const carousel = card.querySelector('.post-carousel');
            if (carousel) {
                initializeCarousels();
            }

            // Add click handlers for action buttons
            const editBtn = card.querySelector('.edit-btn');
            const downloadBtn = card.querySelector('.download-btn');
            const deleteBtn = card.querySelector('.delete-btn');

            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Your existing edit button logic
                });
            }

            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Your existing download button logic
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this post?')) {
                        card.remove();
                        // Update localStorage
                        const postsData = JSON.parse(localStorage.getItem('savedSocialPosts'));
                        if (postsData) {
                            postsData.html = document.getElementById('postsGrid').innerHTML;
                            localStorage.setItem('savedSocialPosts', JSON.stringify(postsData));
                        }
                    }
                });
            }
        });
    }

    // Initialize carousels for any existing posts on page load
    initializeCarousels();
    addActionButtonsToPosts();

    console.log('Found elements:', {
        platformButtons: platformButtons.length,
        platformCheckboxes: platformCheckboxes.length,
        uploadBox: !!uploadBox,
        fileInput: !!fileInput,
        generatePostBtn: !!generatePostBtn,
        postsGrid: !!postsGrid
    });
    
    // Clear any existing template or blog images that might be in memory
    // This ensures no accidental use of blog/template images in social posts
    function clearTemplateImages() {
        // Remove any template-related URLs from localStorage
        const storageKeys = Object.keys(localStorage);
        storageKeys.forEach(key => {
            if (key.includes('template') || key.includes('blog')) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Call on page load to clear any template/blog image references
    clearTemplateImages();
    
    // Load saved posts from localStorage on page load
    loadSavedPosts();
    
    // Simplified platform selection approach
    platformButtons.forEach(button => {
        const checkbox = button.querySelector('input[type="checkbox"]');
        
        // Initial state
        updateButtonState(button, checkbox.checked);
        
        // Handle clicks on the label part of the button
        button.addEventListener('click', function(e) {
            // Only toggle if we clicked the label itself, not the checkbox
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                updateButtonState(button, checkbox.checked);
                console.log('Platform toggled by button:', button.dataset.platform, checkbox.checked);
            }
        });
        
        // Handle direct checkbox changes
        checkbox.addEventListener('change', function() {
            updateButtonState(button, checkbox.checked);
            console.log('Platform toggled by checkbox:', button.dataset.platform, checkbox.checked);
        });
    });
    
    // Helper function to update button visual state
    function updateButtonState(button, isChecked) {
        if (isChecked) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }

    // File upload handling - strictly enforce image uploads only
    uploadBox.addEventListener('click', () => fileInput.click());
    
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#ffb67c';
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '#ddd';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#ddd';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    // Updated to handle multiple files
    function handleFiles(files) {
        if (files && files.length > 0) {
            let validImages = [];
            
            // Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Strict check for image files only
                if (file && file.type.startsWith('image/')) {
                    validImages.push(file);
                    // Limit to maximum 5 images
                    if (validImages.length >= 5) {
                        if (files.length > 5) {
                            alert('Maximum 5 images allowed. Only the first 5 valid images will be used.');
                        }
                        break;
                    }
                }
            }
            
            if (validImages.length === 0) {
                alert('Please upload image files only (JPG, PNG, GIF, etc.)');
                return;
            }
            
            // Store files for use in social posts
            uploadedFiles = validImages;
            console.log('Files uploaded:', uploadedFiles.length);
            
            // Display an upload confirmation with previews of the user's images
            const uploadBox = document.getElementById('uploadBox');
            const originalContent = uploadBox.innerHTML;
            
            let previewsHTML = '';
            uploadedFiles.forEach((file, index) => {
                // Create an object URL from each file for preview
                const objectUrl = URL.createObjectURL(file);
                file.objectUrl = objectUrl; // Store URL with file for easy reference
                
                previewsHTML += `
                    <div class="image-preview" data-index="${index}">
                        <img src="${objectUrl}" alt="Preview ${index+1}" 
                             style="max-width: 100%; max-height: 150px; object-fit: contain; border-radius: 8px; margin-bottom: 0.5rem;" />
                        <span class="image-name">${file.name}</span>
                    </div>
                `;
            });
            
            // Change upload box to show previews and success message
            uploadBox.innerHTML = `
                <div class="upload-success">
                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3>Files uploaded successfully!</h3>
                    <p>${uploadedFiles.length} image${uploadedFiles.length !== 1 ? 's' : ''} ready for your post</p>
                    <div class="image-previews-container" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 1rem 0;">
                        ${previewsHTML}
                    </div>
                    <button class="remove-upload-btn" style="margin-top: 1rem; background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Remove All
                    </button>
                </div>
            `;
            
            // Upload each file to the server
            uploadedFiles.forEach(file => {
                const formData = new FormData();
                formData.append('file', file);
                
                fetch('/social_post_image', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Store the server URL for use in posts
                        file.serverUrl = data.image_url;
                        console.log('Image uploaded to server:', data.image_url);
                    }
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                    // Continue using local file even if server upload fails
                });
            });
            
            // Add event listener to the remove button
            const removeBtn = uploadBox.querySelector('.remove-upload-btn');
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Revoke all object URLs to free up memory
                uploadedFiles.forEach(file => {
                    if (file.objectUrl) URL.revokeObjectURL(file.objectUrl);
                });
                uploadedFiles = [];
                uploadBox.innerHTML = originalContent;
            });
        } else {
            // If no valid files, show error
            alert('Please upload at least one image file (JPG, PNG, GIF, etc.)');
        }
    }

    // Add a document file input for RAG (if not present)
    let docFileInput = document.getElementById('docFileInput');
    if (!docFileInput) {
        docFileInput = document.createElement('input');
        docFileInput.type = 'file';
        docFileInput.id = 'docFileInput';
        docFileInput.accept = '.pdf,.docx,.txt,.md';
        docFileInput.style.display = 'block';
        docFileInput.style.margin = '1rem 0';
        // Insert before the uploadBox
        const uploadBox = document.getElementById('uploadBox');
        if (uploadBox && uploadBox.parentNode) {
            uploadBox.parentNode.insertBefore(docFileInput, uploadBox);
        }
    }
    let uploadedDocFile = null;
    docFileInput.addEventListener('change', (e) => {
        uploadedDocFile = e.target.files[0] || null;
        if (uploadedDocFile) {
            // Optionally show filename
            let docLabel = document.getElementById('docFileLabel');
            if (!docLabel) {
                docLabel = document.createElement('div');
                docLabel.id = 'docFileLabel';
                docFileInput.parentNode.insertBefore(docLabel, docFileInput.nextSibling);
            }
            docLabel.textContent = `Document selected: ${uploadedDocFile.name}`;
        } else {
            const docLabel = document.getElementById('docFileLabel');
            if (docLabel) docLabel.textContent = '';
        }
    });

    // Generate posts
    generatePostBtn.addEventListener('click', async function() {
        console.log('Generate button clicked at:', new Date().toISOString());
        // Get form data
        const title = document.getElementById('contentTitle').value;
        const description = document.getElementById('contentDescription').value;
        const hashtags = document.getElementById('contentHashtags').value;
        const generateByAi = document.getElementById('generateByAiCheckbox')?.checked;
        // Get selected platforms directly
        const selectedPlatforms = Array.from(platformCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.closest('.platform-btn').dataset.platform);
        // If blog is selected, get template id
        let templateId = null;
        if (selectedPlatforms.includes('blog')) {
            const templateSelect = document.getElementById('template-select');
            if (templateSelect) {
                templateId = templateSelect.value;
                if (!templateId && generateByAi) {
                    alert('Please select a blog template.');
                    return;
                }
            }
        }
        // Validation
        if (!title || !description) {
            alert('Please fill in the title and description fields');
            return;
        }
        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform');
            return;
        }
        if (uploadedFiles.length === 0 && !uploadedDocFile) {
            alert('Please upload at least one image or a document for your posts');
            return;
        }
        // Always use backend for post generation (AI or not)
        try {
            // Show loading spinner on button
            generatePostBtn.disabled = true;
            const originalBtnHtml = generatePostBtn.innerHTML;
            generatePostBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            // Prepare form data for backend
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('hashtags', hashtags);
            formData.append('generate_by_ai', generateByAi ? 'true' : 'false');
            formData.append('platforms', JSON.stringify(selectedPlatforms));
            if (templateId) {
                formData.append('template_id', templateId);
            }
            for (let i = 0; i < uploadedFiles.length; i++) {
                formData.append('images', uploadedFiles[i]);
            }
            if (uploadedDocFile) {
                formData.append('file', uploadedDocFile);
            }
            // Send to backend endpoint (always)
            const resp = await fetch('/generate_social_posts', {
                method: 'POST',
                body: formData
            });
            if (!resp.ok) throw new Error('Failed to generate posts');
            const data = await resp.json();
            if (data && data.posts_html) {
                postsGrid.innerHTML = data.posts_html;
                addActionButtonsToPosts();
                alert('Posts generated successfully!');
            } else {
                alert('Post generation failed. Please try again.');
            }
        } catch (error) {
            alert('Post generation failed. Please try again.');
            console.error('Post generation error:', error);
        } finally {
            generatePostBtn.disabled = false;
            generatePostBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Posts';
        }
    });

    // Function to save posts to localStorage
    function savePosts(title, description, hashtags, platforms, imageUrls) {
        const postsData = {
            title,
            description,
            hashtags,
            platforms,
            hasImages: imageUrls.length > 0,
            imageUrls: imageUrls, // Store all image URLs
            html: postsGrid.innerHTML,
            timestamp: new Date().toISOString(),
            type: 'social_posts'
        };
        
        localStorage.setItem('savedSocialPosts', JSON.stringify(postsData));
    }
    
    // Function to load saved posts from localStorage
    function loadSavedPosts() {
        const savedPostsData = localStorage.getItem('savedSocialPosts');
        
        if (savedPostsData) {
            try {
                const postsData = JSON.parse(savedPostsData);
                
                // Check if we have HTML to restore and it contains actual posts
                if (postsData.html && postsData.html.trim() !== '') {
                    postsGrid.innerHTML = postsData.html;
                    console.log('Restored saved posts from localStorage');
                    
                    // Initialize carousels for the restored posts
                    initializeCarousels();
                    
                    // Add event listeners to restored posts
                    attachEventListenersToRestoredPosts();
                }
            } catch (error) {
                console.error('Error loading saved posts:', error);
            }
        }
    }
    
    // Function to attach event listeners to restored posts
    function attachEventListenersToRestoredPosts() {
        const deleteButtons = postsGrid.querySelectorAll('.delete-btn');
        const editButtons = postsGrid.querySelectorAll('.edit-btn');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const postCard = this.closest('.post-card');
                if (postCard && confirm('Are you sure you want to delete this post?')) {
                    postCard.remove();
                    
                    // Update localStorage when a post is deleted
                    if (postsGrid.children.length === 0) {
                        localStorage.removeItem('savedSocialPosts');
                    } else {
                        const postsData = JSON.parse(localStorage.getItem('savedSocialPosts'));
                        if (postsData) {
                            postsData.html = postsGrid.innerHTML;
                            localStorage.setItem('savedSocialPosts', JSON.stringify(postsData));
                        }
                    }
                }
            });
        });
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                alert('Edit functionality coming soon!');
            });
        });
    }

    // Post creation functions - modified to handle multiple images in a carousel
    function createInstagramPoster(title, description, hashtags, imageUrls) {
        const hashtagsFormatted = formatHashtags(hashtags);
        const iconPath = getPlatformIcon('instagram');
        
        // Create carousel HTML
        let carouselHTML = '';
        if (imageUrls && imageUrls.length > 0) {
            let carouselItems = '';
            let indicators = '';
            
            imageUrls.forEach((url, index) => {
                // For Instagram, use object-fit: cover to maintain aspect ratio but fill the space
                carouselItems += `<div class="carousel-item ${index === 0 ? 'active' : ''}" style="background-image: url('${url}'); background-size: cover; background-position: center;"></div>`;
                indicators += `<span class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
            });
            
            carouselHTML = `
                <div class="post-carousel">
                    <div class="carousel-container">
                        ${carouselItems}
                        ${imageUrls.length > 1 ? `
                            <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
                            <div class="carousel-indicators">${indicators}</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="post-card instagram" data-platform="instagram">
                <img src="${iconPath}" alt="Instagram icon" class="platform-icon-img" />
                <div class="post-header">
                    <div class="platform-icon" style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);">
                        <i class="fab fa-instagram" style="color: white;"></i>
                    </div>
                    <div class="account-info">
                        <span class="account-name">Your Instagram</span>
                        <span class="post-time">Just now</span>
                    </div>
                    <div class="post-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                ${carouselHTML}
                <div class="post-content">
                    <div class="post-caption">
                        <span class="account-name">Your Instagram</span>
                        <span class="caption-text">${description}</span>
                    </div>
                    <div class="post-hashtags">${hashtagsFormatted}</div>
                </div>
            </div>
        `;
    }

    function createFacebookPoster(title, description, hashtags, imageUrls) {
        const hashtagsFormatted = formatHashtags(hashtags);
        const iconPath = getPlatformIcon('facebook');
        
        // Create carousel HTML
        let carouselHTML = '';
        if (imageUrls && imageUrls.length > 0) {
            let carouselItems = '';
            let indicators = '';
            
            imageUrls.forEach((url, index) => {
                // Facebook has contain for images to not crop them
                carouselItems += `<div class="carousel-item ${index === 0 ? 'active' : ''}" style="background-image: url('${url}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`;
                indicators += `<span class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
            });
            
            carouselHTML = `
                <div class="post-carousel">
                    <div class="carousel-container">
                        ${carouselItems}
                        ${imageUrls.length > 1 ? `
                            <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
                            <div class="carousel-indicators">${indicators}</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="post-card facebook" data-platform="facebook">
                <img src="${iconPath}" alt="Facebook icon" class="platform-icon-img" />
                <div class="post-header">
                    <div class="platform-icon" style="background-color: #1877f2;">
                        <i class="fab fa-facebook-f" style="color: white;"></i>
                    </div>
                    <div class="account-info">
                        <span class="account-name">Your Facebook</span>
                        <span class="post-time">Just now</span>
                    </div>
                    <div class="post-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                <div class="post-content">
                    <h3 class="post-title">${title}</h3>
                    <p class="post-text">${description}</p>
                    ${carouselHTML}
                    <div class="post-hashtags">${hashtagsFormatted}</div>
                </div>
            </div>
        `;
    }

    function createTwitterPoster(title, description, hashtags, imageUrls) {
        const hashtagsFormatted = formatHashtags(hashtags);
        const iconPath = getPlatformIcon('twitter');
        
        // Create carousel HTML
        let carouselHTML = '';
        if (imageUrls && imageUrls.length > 0) {
            let carouselItems = '';
            let indicators = '';
            
            imageUrls.forEach((url, index) => {
                // Twitter uses cover but maintains aspect ratio better
                carouselItems += `<div class="carousel-item ${index === 0 ? 'active' : ''}" style="background-image: url('${url}'); background-size: cover; background-position: center;"></div>`;
                indicators += `<span class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
            });
            
            carouselHTML = `
                <div class="post-carousel">
                    <div class="carousel-container">
                        ${carouselItems}
                        ${imageUrls.length > 1 ? `
                            <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
                            <div class="carousel-indicators">${indicators}</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="post-card twitter" data-platform="twitter">
                <img src="${iconPath}" alt="Twitter icon" class="platform-icon-img" />
                <div class="post-header">
                    <div class="platform-icon" style="background-color: #1da1f2;">
                        <i class="fab fa-twitter" style="color: white;"></i>
                    </div>
                    <div class="account-info">
                        <span class="account-name">Your Twitter</span>
                        <span class="twitter-handle">@yourhandle</span>
                        <span class="post-time">· Just now</span>
                    </div>
                    <div class="post-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                <div class="post-content twitter-content">
                    <p class="tweet-text">${description}</p>
                    ${carouselHTML}
                    <div class="post-hashtags twitter-tags">${hashtagsFormatted}</div>
                </div>
            </div>
        `;
    }

    function createLinkedInPoster(title, description, hashtags, imageUrls) {
        const hashtagsFormatted = formatHashtags(hashtags);
        const iconPath = getPlatformIcon('linkedin');
        
        // Create carousel HTML
        let carouselHTML = '';
        if (imageUrls && imageUrls.length > 0) {
            let carouselItems = '';
            let indicators = '';
            
            imageUrls.forEach((url, index) => {
                // LinkedIn uses contain for professional look
                carouselItems += `<div class="carousel-item ${index === 0 ? 'active' : ''}" style="background-image: url('${url}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`;
                indicators += `<span class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
            });
            
            carouselHTML = `
                <div class="post-carousel">
                    <div class="carousel-container">
                        ${carouselItems}
                        ${imageUrls.length > 1 ? `
                            <button class="carousel-prev"><i class="fas fa-chevron-left"></i></button>
                            <button class="carousel-next"><i class="fas fa-chevron-right"></i></button>
                            <div class="carousel-indicators">${indicators}</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="post-card linkedin" data-platform="linkedin">
                <img src="${iconPath}" alt="LinkedIn icon" class="platform-icon-img" />
                <div class="post-header">
                    <div class="platform-icon" style="background-color: #0077b5;">
                        <i class="fab fa-linkedin-in" style="color: white;"></i>
                    </div>
                    <div class="account-info">
                        <span class="account-name">Your Name</span>
                        <span class="post-time">Just now</span>
                    </div>
                    <div class="post-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                <div class="post-content linkedin-content">
                    <h3 class="post-title">${title}</h3>
                    <p class="post-description">${description}</p>
                    ${carouselHTML}
                    <div class="post-hashtags linkedin-tags">${hashtagsFormatted}</div>
                </div>
            </div>
        `;
    }

    function formatHashtags(hashtags) {
        if (!hashtags) return '';
        return hashtags
            .split(' ')
            .map(tag => tag.startsWith('#') ? `<span class="hashtag">${tag}</span>` : `<span class="hashtag">#${tag}</span>`)
            .join(' ');
    }

    // At the top, after DOMContentLoaded
    let postGridClickListenerAdded = false;

    // Post action handlers
    postsGrid.addEventListener('click', function(e) {
        // Delete post
        if (e.target.classList.contains('delete-btn')) {
            const postCard = e.target.closest('.post-card');
            if (postCard && confirm('Are you sure you want to delete this post?')) {
                postCard.remove();
                
                // Update localStorage when a post is deleted
                if (postsGrid.children.length === 0) {
                    localStorage.removeItem('savedSocialPosts');
                } else {
                    const postsData = JSON.parse(localStorage.getItem('savedSocialPosts'));
                    if (postsData) {
                        postsData.html = postsGrid.innerHTML;
                        localStorage.setItem('savedSocialPosts', JSON.stringify(postsData));
                    }
                }
            }
        } 
        // Edit post
        else if (e.target.classList.contains('edit-btn')) {
            const postCard = e.target.closest('.post-card');
            const postId = e.target.dataset.postId;
            const platform = postCard.dataset.platform;
            
            // Set up the edit modal with current post data
            openEditModal(postCard, postId, platform);
        }
        // Download post
        else if (e.target.classList.contains('download-btn')) {
            const postCard = e.target.closest('.post-card');
            if (!window.html2canvas) {
                alert('Image download failed: html2canvas not loaded.');
                return;
            }
            // Wait for all images to load
            const images = postCard.querySelectorAll('img');
            const promises = Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = img.onerror = resolve;
                });
            });
            Promise.all(promises).then(async () => {
                // Remove action buttons for download
                const clone = postCard.cloneNode(true);
                const actions = clone.querySelector('.post-actions');
                if (actions) actions.remove();
                clone.style.background = 'linear-gradient(135deg,#23272a 60%,#23263a 100%)';
                clone.style.color = '#e3e6ea';
                clone.style.position = 'absolute';
                clone.style.left = '-9999px';
                document.body.appendChild(clone);
                await window.html2canvas(clone, {backgroundColor: null, scale: 2, useCORS: true}).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'post.png';
                    link.href = canvas.toDataURL();
                    link.click();
                });
                document.body.removeChild(clone);
            });
        }
    });
    
    // Add debug logging
    alert('[DEBUG] social_content.js fully loaded!');
    alert('[DEBUG] social_content.js script loaded and postToFacebookWithData function is available');

    // Add click event listener as backup in case onclick doesn't work
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('facebook-post-btn')) {
            alert('[DEBUG] Facebook button clicked via event listener!');
            postToFacebookWithData(e.target);
        }
        if (e.target && e.target.classList.contains('instagram-post-btn')) {
            alert('[DEBUG] Instagram button clicked via event listener!');
            postToInstagramWithData(e.target);
        }
        if (e.target && e.target.classList.contains('linkedin-post-btn')) {
            alert('[DEBUG] LinkedIn button clicked via event listener!');
            postToLinkedInWithData(e.target);
        }
    });
});