document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const templatePreview = document.getElementById('template-preview');
    const editBlogButton = document.getElementById('edit-blog-button');
    const downloadBlogButton = document.getElementById('download-blog-button');
    const blogDownloadDropdown = document.getElementById('blog-download-dropdown');
    const blogEditModal = document.getElementById('blog-edit-modal');
    const closeBlogEditModal = document.getElementById('close-blog-edit-modal');
    const cancelBlogEdit = document.getElementById('cancel-blog-edit');
    const saveBlogEdit = document.getElementById('save-blog-edit');
    const editBlogTemplateId = document.getElementById('edit-blog-template-id');
    const editBlogTitle = document.getElementById('edit-blog-title');
    const blogContentSections = document.getElementById('blog-content-sections');
    
    // Global variables
    let currentTemplate = null;
    
    // Initialize event listeners
    function initEventListeners() {
        // Only initialize if the elements exist (we're on the right page)
        if (!templatePreview) return;
        
        // Edit button
        if (editBlogButton) {
            editBlogButton.addEventListener('click', openBlogEditModal);
        }
        
        // Download button and options
        if (downloadBlogButton) {
            downloadBlogButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Download button clicked'); // Debug log
                toggleDownloadDropdown();
            });
        }
        
        // Download options
        if (blogDownloadDropdown) {
            blogDownloadDropdown.querySelectorAll('.download-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const format = this.dataset.format;
                    console.log('Download option clicked:', format); // Debug log
                    downloadBlog(format);
                    blogDownloadDropdown.classList.remove('active');
                });
            });
        }
        
        // Close modals
        if (closeBlogEditModal) {
            closeBlogEditModal.addEventListener('click', () => {
                blogEditModal.classList.remove('active');
            });
        }
        
        if (cancelBlogEdit) {
            cancelBlogEdit.addEventListener('click', () => {
                blogEditModal.classList.remove('active');
            });
        }
        
        // Save blog edits
        if (saveBlogEdit) {
            saveBlogEdit.addEventListener('click', saveBlogChanges);
        }
        
        // Close download dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#download-blog-button') && !e.target.closest('#blog-download-dropdown')) {
                if (blogDownloadDropdown) {
                    blogDownloadDropdown.classList.remove('active');
                }
            }
        });
    }
    
    // Toggle download dropdown
    function toggleDownloadDropdown() {
        if (blogDownloadDropdown) {
            blogDownloadDropdown.classList.toggle('active');
            console.log('Download dropdown toggled'); // Debug log
        }
    }
    
    // Handle template preview (hook into existing functionality)
    function setupTemplateListener() {
        // Check if we're on the right page with the template preview
        if (!templatePreview) return;
        
        // Template selection event - capture the template data
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style' && 
                    templatePreview.style.display !== 'none') {
                    // Template is being displayed, try to get the data
                    setTimeout(captureTemplateData, 500); // Give time for data to load
                }
            });
        });
        
        observer.observe(templatePreview, { attributes: true });
    }
    
    // Capture current template data
    function captureTemplateData() {
        console.log('Capturing template data...'); // Debug log
        
        try {
            const titleElement = document.getElementById('template-preview-title');
            const contentElement = document.getElementById('template-preview-content');
            
            if (!titleElement || !contentElement) {
                throw new Error('Required template elements not found');
            }
            
            console.log('Found template elements'); // Debug log
            
            // Basic template structure
            currentTemplate = {
                title: titleElement.textContent,
                content: []
            };
            
            // Parse content sections
            const sections = contentElement.querySelectorAll('.blog-section');
            console.log('Found sections:', sections.length); // Debug log
            
            sections.forEach(section => {
                const type = section.dataset.sectionType || 'text';
                let sectionData = { type };
                
                if (type === 'heading') {
                    const heading = section.querySelector('h2, h3, h4, h5, h6');
                    sectionData.content = heading ? heading.textContent : '';
                } else if (type === 'text') {
                    const paragraph = section.querySelector('p');
                    sectionData.content = paragraph ? paragraph.textContent : '';
                } else if (type === 'image') {
                    const img = section.querySelector('img');
                    sectionData.url = img ? img.src : '';
                    sectionData.alt = img ? img.alt : '';
                } else if (type === 'quote') {
                    const quote = section.querySelector('blockquote');
                    sectionData.content = quote ? quote.textContent : '';
                }
                
                currentTemplate.content.push(sectionData);
            });
            
            console.log('Template data captured:', currentTemplate); // Debug log
        } catch (error) {
            console.error('Error capturing template data:', error);
            throw error;
        }
    }
    
    // Open the blog edit modal
    function openBlogEditModal(postCard) {
        // If postCard is provided, extract the title from the card
        if (postCard) {
            const titleElem = postCard.querySelector('.post-header h3, .post-title');
            if (titleElem) {
                editBlogTitle.value = titleElem.textContent.trim();
            }
        } else if (currentTemplate && currentTemplate.title) {
            editBlogTitle.value = currentTemplate.title;
        } else {
            editBlogTitle.value = '';
        }
        
        if (!currentTemplate) {
            captureTemplateData();
        }
        
        if (!currentTemplate) {
            alert('No template data available to edit');
            return;
        }
        
        // Set template ID
        editBlogTemplateId.value = currentTemplate.id || '';
        
        // Set title
        editBlogTitle.value = currentTemplate.title || '';
        
        // Clear existing sections
        blogContentSections.innerHTML = '';
        
        // Add content sections
        if (currentTemplate.content && Array.isArray(currentTemplate.content)) {
            currentTemplate.content.forEach((section, index) => {
                addSectionToEditor(section, index);
            });
        }
        
        // Add "Add Section" button
        const addButton = document.createElement('button');
        addButton.className = 'add-section-button';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add New Section';
        addButton.addEventListener('click', showSectionTypeDropdown);
        blogContentSections.appendChild(addButton);
        
        // Show the modal
        blogEditModal.classList.add('active');
    }
    
    // Add a section to the editor
    function addSectionToEditor(section, index) {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'blog-content-section';
        sectionElement.dataset.sectionIndex = index;
        sectionElement.dataset.sectionType = section.type;
        
        // Section header
        const headerHtml = `
            <div class="blog-content-section-header">
                <span class="blog-section-type">${section.type}</span>
                <div class="blog-section-actions">
                    <button class="blog-section-action blog-section-move-up" title="Move Up">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="blog-section-action blog-section-move-down" title="Move Down">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="blog-section-action blog-section-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Section content based on type
        let contentHtml = '';
        
        switch (section.type) {
            case 'heading':
                contentHtml = `
                    <div class="edit-form-group">
                        <label>Heading Text</label>
                        <input type="text" class="section-content-input" value="${section.content || ''}">
                    </div>
                `;
                break;
                
            case 'text':
                contentHtml = `
                    <div class="edit-form-group">
                        <label>Text Content</label>
                        <textarea class="section-content-input" rows="4">${section.content || ''}</textarea>
                    </div>
                `;
                break;
                
            case 'image':
                contentHtml = `
                    <div class="edit-form-group">
                        <label>Image URL</label>
                        <input type="text" class="section-image-url" value="${section.url || ''}">
                    </div>
                    <div class="edit-form-group">
                        <label>Image Alt Text</label>
                        <input type="text" class="section-image-alt" value="${section.alt || ''}">
                    </div>
                    ${section.url ? `<img src="${section.url}" alt="${section.alt || ''}" style="max-width: 100%; height: auto; margin-top: 10px;">` : ''}
                `;
                break;
                
            case 'quote':
                contentHtml = `
                    <div class="edit-form-group">
                        <label>Quote Text</label>
                        <textarea class="section-content-input" rows="3">${section.content || ''}</textarea>
                    </div>
                `;
                break;
        }
        
        // Combine everything
        sectionElement.innerHTML = headerHtml + contentHtml;
        
        // Add event listeners for section actions
        sectionElement.querySelector('.blog-section-move-up').addEventListener('click', () => moveSectionUp(index));
        sectionElement.querySelector('.blog-section-move-down').addEventListener('click', () => moveSectionDown(index));
        sectionElement.querySelector('.blog-section-delete').addEventListener('click', () => deleteSection(index));
        
        // Add to the editor
        blogContentSections.appendChild(sectionElement);
    }
    
    // Show dropdown for adding new section
    function showSectionTypeDropdown() {
        // Remove existing dropdown if any
        const existingDropdown = document.querySelector('.section-type-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'section-type-dropdown';
        
        const options = [
            { type: 'heading', label: 'Heading' },
            { type: 'text', label: 'Text Paragraph' },
            { type: 'image', label: 'Image' },
            { type: 'quote', label: 'Quote' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'section-type-option';
            optionElement.textContent = option.label;
            optionElement.addEventListener('click', () => {
                addNewSection(option.type);
                dropdown.remove();
            });
            dropdown.appendChild(optionElement);
        });
        
        // Insert before the add button
        const addButton = document.querySelector('.add-section-button');
        addButton.parentNode.insertBefore(dropdown, addButton);
        dropdown.style.display = 'block';
    }
    
    // Add a new empty section
    function addNewSection(type) {
        const newSection = { type };
        
        // Add default content based on type
        switch (type) {
            case 'heading':
                newSection.content = 'New Heading';
                break;
            case 'text':
                newSection.content = 'Enter your paragraph text here...';
                break;
            case 'image':
                newSection.url = '';
                newSection.alt = 'Image description';
                break;
            case 'quote':
                newSection.content = 'Enter a quote here...';
                break;
        }
        
        // Calculate new index
        const sectionCount = document.querySelectorAll('.blog-content-section').length;
        
        // Add to current template
        if (!currentTemplate.content) currentTemplate.content = [];
        currentTemplate.content.push(newSection);
        
        // Add to editor
        addSectionToEditor(newSection, sectionCount);
    }
    
    // Move a section up
    function moveSectionUp(index) {
        if (index === 0) return; // Already at the top
        
        // Update currentTemplate
        const temp = currentTemplate.content[index];
        currentTemplate.content[index] = currentTemplate.content[index - 1];
        currentTemplate.content[index - 1] = temp;
        
        // Refresh all sections
        refreshSections();
    }
    
    // Move a section down
    function moveSectionDown(index) {
        if (index >= currentTemplate.content.length - 1) return; // Already at the bottom
        
        // Update currentTemplate
        const temp = currentTemplate.content[index];
        currentTemplate.content[index] = currentTemplate.content[index + 1];
        currentTemplate.content[index + 1] = temp;
        
        // Refresh all sections
        refreshSections();
    }
    
    // Delete a section
    function deleteSection(index) {
        if (confirm('Are you sure you want to delete this section?')) {
            // Remove from currentTemplate
            currentTemplate.content.splice(index, 1);
            
            // Refresh all sections
            refreshSections();
        }
    }
    
    // Refresh all sections in the editor
    function refreshSections() {
        // Save add button
        const addButton = document.querySelector('.add-section-button');
        
        // Clear content
        blogContentSections.innerHTML = '';
        
        // Re-add all sections
        currentTemplate.content.forEach((section, index) => {
            addSectionToEditor(section, index);
        });
        
        // Re-add the add button
        blogContentSections.appendChild(addButton);
    }
    
    // Save blog changes
    function saveBlogChanges() {
        // Update title
        currentTemplate.title = editBlogTitle.value;
        
        // Update content from form inputs
        const sections = document.querySelectorAll('.blog-content-section');
        sections.forEach((section, index) => {
            const type = section.dataset.sectionType;
            
            switch (type) {
                case 'heading':
                case 'text':
                case 'quote':
                    // Get content from input/textarea
                    const contentInput = section.querySelector('.section-content-input');
                    if (contentInput) {
                        currentTemplate.content[index].content = contentInput.value;
                    }
                    break;
                    
                case 'image':
                    // Get image URL and alt text
                    const urlInput = section.querySelector('.section-image-url');
                    const altInput = section.querySelector('.section-image-alt');
                    if (urlInput) {
                        currentTemplate.content[index].url = urlInput.value;
                    }
                    if (altInput) {
                        currentTemplate.content[index].alt = altInput.value;
                    }
                    break;
            }
        });
        
        // Update preview with new content
        updateTemplatePreview();
        
        // Close modal
        blogEditModal.classList.remove('active');
    }
    
    // Update the template preview with edited content
    function updateTemplatePreview() {
        // Update title
        const titleElement = document.getElementById('template-preview-title');
        if (titleElement && currentTemplate.title) {
            titleElement.textContent = currentTemplate.title;
        }
        
        // Update content
        const contentElement = document.getElementById('template-preview-content');
        if (contentElement && currentTemplate.content) {
            // Clear current content
            contentElement.innerHTML = '';
            
            // Add each section
            currentTemplate.content.forEach(section => {
                const sectionElement = document.createElement('div');
                sectionElement.className = 'blog-section';
                sectionElement.dataset.sectionType = section.type;
                
                switch (section.type) {
                    case 'heading':
                        sectionElement.innerHTML = `<h2>${section.content}</h2>`;
                        break;
                        
                    case 'text':
                        sectionElement.innerHTML = `<p>${section.content}</p>`;
                        break;
                        
                    case 'image':
                        if (section.url) {
                            sectionElement.innerHTML = `<img src="${section.url}" alt="${section.alt || ''}" style="max-width: 100%; height: auto;">`;
                        }
                        break;
                        
                    case 'quote':
                        sectionElement.innerHTML = `<blockquote>${section.content}</blockquote>`;
                        break;
                }
                
                contentElement.appendChild(sectionElement);
            });
        }
        
        // Save to window object for other scripts
        window.currentTemplateData = currentTemplate;
        
        // If there's an API endpoint to save the template, call it here
        saveTemplateToServer();
    }
    
    // Save template to server
    function saveTemplateToServer() {
        // Only proceed if we have template ID and a proper template
        if (!currentTemplate || !currentTemplate.id) return;
        
        // Send to server (uses fetch API)
        fetch('/save_template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ templateId: currentTemplate.id, content: currentTemplate.content })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Template saved successfully:', data);
            alert('Template saved successfully');
        })
        .catch(error => {
            console.error('Error saving template:', error);
            alert('Error saving template. Please try again.');
        });
    }
    
    // Public methods (for external access if needed)
    window.blogEditor = {
        openBlogEditModal,
        saveBlogChanges,
        downloadBlog
    };
    
    // Initialize event listeners on DOM ready
    initEventListeners();
    setupTemplateListener();
});