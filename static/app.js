document.addEventListener('DOMContentLoaded', () => {
    // Image Upload
    const imageInput = document.getElementById('image-input');
    const imageDrop = document.getElementById('image-drop');
    const browseLink = document.getElementById('browse-link');
    const imagePreviewList = document.getElementById('image-preview-list');
    const previewImage = document.querySelector('.preview-image');

    let selectedImages = [];
    let currentPreviewIndex = 0;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    browseLink.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', handleFiles);

    imageDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDrop.classList.add('dragover');
    });

    imageDrop.addEventListener('dragleave', () => imageDrop.classList.remove('dragover'));

    imageDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFiles({ target: { files: e.dataTransfer.files } });
        imageDrop.classList.remove('dragover');
    });

    function handleFiles(e) {
        const files = Array.from(e.target.files).slice(0, 5 - selectedImages.length);
        files.forEach(file => {
            if (selectedImages.length < 5) {
                selectedImages.push(file);
            }
        });
        renderImagePreview();
    }

    function renderImagePreview() {
        imagePreviewList.innerHTML = '';

        selectedImages.forEach((file, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-preview-item';

            const img = document.createElement('img');
            img.className = 'image-preview';

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                img.src = imageUrl;
                file.previewUrl = imageUrl;

                if (idx === selectedImages.length - 1) {
                    updatePreviewImage(selectedImages.length - 1);
                }
            };
            reader.readAsDataURL(file);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove image';
            removeBtn.onclick = () => {
                selectedImages.splice(idx, 1);
                if (currentPreviewIndex >= selectedImages.length) {
                    currentPreviewIndex = Math.max(0, selectedImages.length - 1);
                }
                renderImagePreview();
            };

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            imagePreviewList.appendChild(wrapper);
        });

        if (selectedImages.length === 0) {
            // Remove preview image if no images selected
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    }

    function updatePreviewImage(index) {
        currentPreviewIndex = index;
        const image = selectedImages[currentPreviewIndex];
        if (image && image.previewUrl) {
            // Update preview area instead of specific preview image
            const previewArea = document.getElementById('preview-area');
            if (previewArea) {
                previewArea.style.backgroundImage = `url('${image.previewUrl}')`;
                previewArea.style.backgroundSize = 'cover';
                previewArea.style.backgroundPosition = 'center';
            }
        }

        // Only update navigation buttons if they exist
        if (prevBtn) prevBtn.style.display = currentPreviewIndex > 0 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = currentPreviewIndex < selectedImages.length - 1 ? 'block' : 'none';
    }

    // Only add event listeners if buttons exist
    if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentPreviewIndex > 0) {
            updatePreviewImage(currentPreviewIndex - 1);
        }
    });
    }

    if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentPreviewIndex < selectedImages.length - 1) {
            updatePreviewImage(currentPreviewIndex + 1);
        }
    });
    }

    // Platform selection
    const platformCheckboxes = document.querySelectorAll('.platform-btn');
    const aspectRatioSelect = document.getElementById('aspect-ratio');

    platformCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedPlatforms = Array.from(platformCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.dataset.platform);
            
            updateInteractionBar(selectedPlatforms[0] || 'instagram');
            updatePreviewStyle(selectedPlatforms[0] || 'instagram');
        });
    });

    function updateInteractionBar(platform) {
        const interactionBar = document.getElementById('platform-interaction-bar');
        if (!interactionBar) return;

        const platformIcons = {
            instagram: '❤️ 💬 🔄 📤',
            facebook: '👍 💬 🔄 📤',
            linkedin: '👍 💬 🔄 📤',
            twitter: '❤️ 🔄 📤 💬',
            blog: '📖 💬 🔗 📤'
        };

        interactionBar.innerHTML = platformIcons[platform] || platformIcons.instagram;
        interactionBar.className = `interaction-bar ${platform}-style`;
    }

    function updatePreviewStyle(platform) {
        const previewArea = document.getElementById('preview-area');
        if (!previewArea) return;

        const platformStyles = {
            instagram: 'instagram-preview',
            facebook: 'facebook-preview',
            linkedin: 'linkedin-preview',
            twitter: 'twitter-preview',
            blog: 'blog-preview'
        };

        // Remove existing platform classes
        previewArea.className = 'preview-area';
        previewArea.classList.add(platformStyles[platform] || 'instagram-preview');
    }

    aspectRatioSelect.addEventListener('change', () => {
        const ratio = aspectRatioSelect.value;
        updateAspectRatio(ratio);
    });

    function updateAspectRatio(ratio) {
        const previewImage = document.querySelector('.preview-image');
        if (previewImage) {
            previewImage.style.aspectRatio = ratio;
        }
    }

    // Description generation from topic
    const descriptionInput = document.getElementById('description');
    const titleInput = document.getElementById('title');

    // Auto-generate description when user types a topic
    descriptionInput.addEventListener('input', debounce(async (e) => {
        const topic = e.target.value.trim();
        if (topic.length > 10 && !topic.includes('\n')) {
            // Only generate if it looks like a topic (not a full description)
            await generateDescriptionFromTopic(topic);
        }
    }, 1000));

    async function generateDescriptionFromTopic(topic) {
        try {
            const response = await fetch('/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            });
            const data = await response.json();
            if (data.description) {
                descriptionInput.value = data.description;
                updatePreview();
            }
        } catch (err) {
            console.error('Error generating description:', err);
        }
    }

    // Title generation
    const generateTitleBtn = document.getElementById('generate-title');

    generateTitleBtn.addEventListener('click', async () => {
        const description = descriptionInput.value.trim();
        if (!description) {
            alert('Please enter a description or topic first.');
            return;
        }
        try {
            const response = await fetch('/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            const data = await response.json();
            if (data.title) {
                titleInput.value = data.title;
                updatePreview();
            } else {
                alert(data.error || 'Failed to generate title.');
            }
        } catch (err) {
            alert('Error generating title.');
        }
    });

    // Refine description
    const refineBtn = document.getElementById('refine-description');

    refineBtn.addEventListener('click', async () => {
        const userInput = descriptionInput.value.trim();
        if (!userInput) {
            alert('Please enter a topic or description first.');
            return;
        }
        // If input is short (likely a topic), generate a description
        if (userInput.length < 60 && !userInput.includes('\n')) {
            try {
                const response = await fetch('/generate-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: userInput })
                });
                const data = await response.json();
                if (data.description) {
                    descriptionInput.value = data.description;
                    updatePreview();
                    // Auto-generate title for the new description
                    await generateTitleForDescription(data.description);
                } else {
                    alert(data.error || 'Failed to generate description.');
                }
            } catch (err) {
                alert('Error generating description.');
            }
        } else {
            // Otherwise, refine the description
            try {
                const response = await fetch('/refine-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: userInput })
                });
                const data = await response.json();
                if (data.refined_description) {
                    descriptionInput.value = data.refined_description;
                    updatePreview();
                    // Auto-generate title for the refined description
                    await generateTitleForDescription(data.refined_description);
                } else {
                    alert(data.error || 'Failed to refine description.');
                }
            } catch (err) {
                alert('Error refining description.');
            }
        }
    });

    async function generateTitleForDescription(description) {
        try {
            const response = await fetch('/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            const data = await response.json();
            if (data.title) {
                titleInput.value = data.title;
                updatePreview();
            }
        } catch (err) {
            // Silent fail
        }
    }

    // Content generation
    const applyChangesBtn = document.getElementById('apply-changes');
    const generatedContent = document.getElementById('generated-content');
    const suggestedHashtags = document.getElementById('suggested-hashtags');

    if (applyChangesBtn) {
    applyChangesBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const selectedPlatforms = Array.from(platformCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.platform);

        if (!title || !description) {
            alert('Please generate both title and description first.');
            return;
        }

        try {
            const response = await fetch('/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    platform: selectedPlatforms[0] || 'instagram' 
                })
            });

            const data = await response.json();
                if (data.content && generatedContent) {
                generatedContent.textContent = data.content;
                    if (data.hashtags && data.hashtags.length > 0 && suggestedHashtags) {
                    suggestedHashtags.innerHTML = data.hashtags
                        .map(tag => `<span class="hashtag">${tag}</span>`)
                        .join('');
                }
                updatePreview();
            } else {
                alert(data.error || 'Failed to generate content.');
            }
        } catch (err) {
            alert('Error generating content.');
        }
    });
    }

    // Update preview
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewHashtags = document.getElementById('preview-hashtags');

    function updatePreview() {
        if (previewTitle) previewTitle.textContent = titleInput.value;
        if (previewDescription) previewDescription.textContent = descriptionInput.value;
        if (previewHashtags) previewHashtags.textContent = '#lifestyle #inspiration #creativity #photooftheday #amazing';
        
        // Show uploaded image in preview area
        const previewArea = document.getElementById('preview-area');
        if (selectedImages.length > 0 && previewArea) {
            previewArea.style.backgroundImage = `url('${selectedImages[0].previewUrl}')`;
            previewArea.style.backgroundSize = 'cover';
            previewArea.style.backgroundPosition = 'center';
        } else if (previewArea) {
            previewArea.style.backgroundImage = '';
        }
    }

    // Action buttons
    const copyBtn = document.getElementById('copy-btn');
    const scheduleBtn = document.getElementById('schedule-btn');
    const publishBtn = document.getElementById('publish-btn');

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const content = generatedContent ? generatedContent.textContent : '';
        if (content) {
            navigator.clipboard.writeText(content);
            alert('Content copied to clipboard!');
        } else {
            alert('No content to copy. Generate content first.');
        }
    });
    }

    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
        alert('Schedule functionality to be integrated with backend.');
    });
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
        alert('Publish functionality to be integrated with backend.');
    });
    }

    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Blog template modal logic
    const blogCheckbox = document.querySelector('.platform-btn[data-platform="blog"]');
    const blogTemplateModal = document.getElementById('blog-template-modal');
    const closeBlogTemplateModal = document.getElementById('close-blog-template-modal');
    const blogEditorSection = document.getElementById('blog-editor-section');
    const blogTitleInput = document.getElementById('blog-title');
    const blogContentTextarea = document.getElementById('blog-content');

    let selectedTemplate = null;
    let isBlogMode = false;

    console.log('Blog checkbox found:', blogCheckbox);
    console.log('Blog template modal found:', blogTemplateModal);
    console.log('Close button found:', closeBlogTemplateModal);

    if (blogCheckbox && blogTemplateModal && closeBlogTemplateModal) {
        console.log('All elements found, setting up event listeners');
        
        blogCheckbox.addEventListener('change', async () => {
            console.log('Blog checkbox changed, checked:', blogCheckbox.checked);
            if (blogCheckbox.checked) {
                console.log('Blog checkbox is checked, fetching templates...');
                await showTemplateModal();
            } else {
                console.log('Blog checkbox unchecked, hiding modal and exiting blog mode');
                hideTemplateModal();
                exitBlogMode();
            }
        });
        
        closeBlogTemplateModal.addEventListener('click', () => {
            console.log('Close button clicked');
            hideTemplateModal();
            blogCheckbox.checked = false;
            exitBlogMode();
        });
        
        // Close modal when clicking outside
        blogTemplateModal.addEventListener('click', (e) => {
            if (e.target === blogTemplateModal) {
                console.log('Clicked outside modal, closing');
                hideTemplateModal();
                blogCheckbox.checked = false;
                exitBlogMode();
            }
        });
    } else {
        console.error('Missing elements:', {
            blogCheckbox: !!blogCheckbox,
            blogTemplateModal: !!blogTemplateModal,
            closeBlogTemplateModal: !!closeBlogTemplateModal
        });
    }

    async function showTemplateModal() {
        try {
                const res = await fetch('/api/templates/list');
            console.log('API response status:', res.status);
                const data = await res.json();
            console.log('Templates data:', data);
            
                const templateList = document.getElementById('blog-template-list');
                templateList.innerHTML = '';
            
                if (data.templates && data.templates.length > 0) {
                console.log('Creating template cards for:', data.templates.length, 'templates');
                    data.templates.forEach(folder => {
                        const coverUrlJpg = `/static/templates/${folder}/cover.jpg`;
                        const coverUrlPng = `/static/templates/${folder}/cover.png`;
                    
                        const card = document.createElement('div');
                        card.className = 'template-card';
                    card.dataset.template = folder;
                    
                        const img = document.createElement('img');
                        img.src = coverUrlJpg;
                        img.alt = folder;
                    img.onerror = function() { 
                        this.onerror = null; 
                        this.src = coverUrlPng; 
                    };
                    
                        const name = document.createElement('div');
                        name.textContent = folder.replace(/_/g, ' ');
                    name.style.fontSize = '0.85em';
                    name.style.fontWeight = '500';
                    name.style.marginBottom = '10px';
                    
                    // Create button container
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.gap = '8px';
                    buttonContainer.style.marginTop = 'auto';
                    
                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'template-action-btn view-btn';
                    viewBtn.textContent = '👁️ View';
                    viewBtn.style.flex = '1';
                    viewBtn.onclick = (e) => {
                        e.stopPropagation();
                        showTemplateInNewWindow(folder);
                    };

                    const selectBtn = document.createElement('button');
                    selectBtn.className = 'template-action-btn select-btn';
                    selectBtn.textContent = '✅ Select';
                    selectBtn.style.flex = '1';
                    selectBtn.onclick = (e) => {
                        e.stopPropagation();
                        selectTemplateCard(folder, card);
                    };
                    
                    buttonContainer.appendChild(viewBtn);
                    buttonContainer.appendChild(selectBtn);
                    
                        card.appendChild(img);
                        card.appendChild(name);
                    card.appendChild(buttonContainer);
                    
                        templateList.appendChild(card);
                    });
                } else {
                templateList.innerHTML = '<div style="color:#aaa; text-align: center; padding: 20px;">No templates found.</div>';
            }
            
            console.log('Showing modal');
            blogTemplateModal.classList.add('show');
        } catch (error) {
            console.error('Error fetching templates:', error);
            const templateList = document.getElementById('blog-template-list');
            templateList.innerHTML = '<div style="color:#ff6b6b; text-align: center; padding: 20px;">Error loading templates. Please try again.</div>';
            blogTemplateModal.classList.add('show');
        }
    }

    function hideTemplateModal() {
        blogTemplateModal.classList.remove('show');
        selectedTemplate = null;
        if (blogEditorSection) blogEditorSection.style.display = 'none';
        if (blogTitleInput) blogTitleInput.value = '';
        if (blogContentTextarea) blogContentTextarea.value = '';
        if (blogContentTextarea) blogContentTextarea.dataset.fullHtml = null;
    }

    function selectTemplateCard(templateName, cardElement) {
        // Remove previous selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select current card
        cardElement.classList.add('selected');
        selectedTemplate = templateName;
        
        console.log('Template selected:', templateName);
        
        // Directly enter blog mode
        hideTemplateModal();
        enterBlogMode(templateName);
    }

    function showTemplateInNewWindow(templateName) {
        // Fetch template and show in new window
        fetch(`/template_html/${templateName}`)
            .then(response => response.json())
            .then(data => {
                if (data.template_html) {
                    // Create a full preview with template-specific sample content
                    let fullHtml = data.template_html;
                    
                    // Template-specific sample content
                    if (templateName === 'one_line_story') {
                        fullHtml = fullHtml
                            .replace(/{{title}}/g, '🌟 My Internship Journey at Evolve Robotics Lab')
                            .replace(/{{content}}/g, `<p>Hello, I'm Joel Mathew from Christ University, Faculty of Engineering and Technology. Currently, I'm pursuing a degree in Computer Science and Engineering, and I've just completed my third year.</p>
                            
                            <h2>About Evolve Robotics Lab</h2>
                            <p>Evolve Robotics Lab is a leading center for robotics and AI research, known for its hands-on approach and innovative projects. The lab's mission is to bridge academic knowledge with real-world applications, fostering creativity and impactful research.</p>
                            
                            <h2>Onboarding Experience</h2>
                            <p>My onboarding process was smooth and welcoming. I was introduced to my mentors and team members, given an overview of ongoing projects, and helped set up my development environment. The team was incredibly supportive from day one.</p>
                            
                            <h2>Key Projects & Responsibilities</h2>
                            <p>During my internship, I worked on several exciting projects including machine learning model development, API integration, and chatbot architecture. Each project provided hands-on experience with cutting-edge AI technologies.</p>
                            
                            <p>This internship has been a transformative experience, allowing me to learn AI and machine learning in a practical, hands-on way. I've gained invaluable knowledge and skills that will serve me well in my future career.</p>`);
            } else {
                        // Generic sample content for other templates
                        fullHtml = fullHtml
                            .replace(/{{title}}/g, 'Sample Blog Title')
                            .replace(/{{content}}/g, 'This is a sample preview of how your blog content will look in this template. The actual content will be generated based on your input.')
                            .replace(/{{description}}/g, 'Sample description for preview purposes.');
                    }
                    
                    // Open in new window
                    const previewWindow = window.open('', '_blank');
                    previewWindow.document.write(fullHtml);
                    previewWindow.document.title = `${templateName.replace(/_/g, ' ')} - Template Preview`;
                    previewWindow.document.close();
                } else {
                    alert('Template not found or could not be loaded.');
                }
            })
            .catch(error => {
                console.error('Error loading template:', error);
                alert('Error loading template. Please try again.');
            });
    }

    function enterBlogMode(templateName) {
        isBlogMode = true;
        selectedTemplate = templateName;
        
        // Hide preview section and show blog editor
        const previewSection = document.querySelector('.preview-section');
        const contentGenerator = document.querySelector('.content-generator');
        
        if (previewSection) previewSection.style.display = 'none';
        if (contentGenerator) contentGenerator.style.display = 'none';
        if (blogEditorSection) blogEditorSection.style.display = 'block';
        
        // Add blog mode styling to middle panel
        const middlePanel = document.querySelector('.middle-panel');
        if (middlePanel) middlePanel.classList.add('blog-template-mode');
        
        // Update description to indicate blog mode
        const descriptionInput = document.getElementById('description');
        if (descriptionInput) {
            descriptionInput.placeholder = `Describe your blog content for ${templateName.replace(/_/g, ' ')} template...`;
        }
        
        // Update template info
        const templateNameSpan = document.getElementById('current-template-name');
        if (templateNameSpan) {
            templateNameSpan.textContent = templateName.replace(/_/g, ' ');
        }
        
        // Show template preview
        // showTemplatePreview(templateName); // This function is no longer needed
    }

    // Add regenerate functionality
    const regenerateBlogBtn = document.getElementById('regenerate-blog');
    if (regenerateBlogBtn) {
        regenerateBlogBtn.addEventListener('click', async () => {
            if (!selectedTemplate) {
                alert('No template selected. Please select a template first.');
                return;
            }
            
            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            
            if (!title || !description) {
                alert('Please enter both title and description to regenerate content.');
                return;
            }
            
            // Show loading state
            regenerateBlogBtn.textContent = '🔄 Generating...';
            regenerateBlogBtn.disabled = true;
            
            try {
                await generateBlogContent();
            } finally {
                // Reset button
                regenerateBlogBtn.textContent = '🔄 Regenerate';
                regenerateBlogBtn.disabled = false;
            }
        });
    }

    function exitBlogMode() {
        isBlogMode = false;
        selectedTemplate = null;
        
        // Show preview section and hide blog editor
        const previewSection = document.querySelector('.preview-section');
        const contentGenerator = document.querySelector('.content-generator');
        
        if (previewSection) previewSection.style.display = 'block';
        if (contentGenerator) contentGenerator.style.display = 'block';
        if (blogEditorSection) blogEditorSection.style.display = 'none';
        
        // Remove blog mode styling
        const middlePanel = document.querySelector('.middle-panel');
        if (middlePanel) middlePanel.classList.remove('blog-template-mode');
        
        // Reset description placeholder
        const descriptionInput = document.getElementById('description');
        if (descriptionInput) {
            descriptionInput.placeholder = 'Describe your content, mood, or message you want to convey...';
        }
        
        console.log('Exited blog mode');
    }

    // Override the apply changes button for blog mode
    if (applyChangesBtn) {
        const originalApplyChanges = applyChangesBtn.onclick;
        applyChangesBtn.addEventListener('click', async (e) => {
            if (isBlogMode && selectedTemplate) {
                e.preventDefault();
                await generateBlogContent();
            } else {
                // Original functionality for other platforms
                if (originalApplyChanges) originalApplyChanges.call(this, e);
            }
        });
    }

    async function generateBlogContent() {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!title || !description) {
            alert('Please enter both title and description for your blog.');
            return;
        }

        try {
            console.log('Generating blog content for template:', selectedTemplate);
            
            // First, get the template HTML structure
            const templateResponse = await fetch(`/template_html/${selectedTemplate}`);
            const templateData = await templateResponse.json();
            
            if (!templateData.template_html) {
                alert('Template not found. Please try another template.');
                return;
            }
            
            // Generate blog content using the backend with uploaded files
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('template_id', selectedTemplate);
            
            // Add uploaded images
            if (selectedImages && selectedImages.length > 0) {
                selectedImages.forEach((image, index) => {
                    formData.append('images', image);
                });
            }
            
            // Add uploaded content files (if any)
            const contentFiles = document.querySelectorAll('input[type="file"]:not([id="image-input"])');
            contentFiles.forEach(fileInput => {
                if (fileInput.files && fileInput.files.length > 0) {
                    Array.from(fileInput.files).forEach(file => {
                        formData.append('content_files', file);
                    });
                }
            });
            
            const response = await fetch('/generate_blog', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
                            if (data.html_content) {
                    // Update blog editor with template-based content
                    if (blogTitleInput) blogTitleInput.value = title;
                    if (blogContentTextarea) {
                        // Insert the generated content into the template structure
                        let templateHtml = templateData.template_html;
                        
                        // Replace template placeholders with generated content
                        templateHtml = templateHtml.replace(/{{title}}/g, title);
                        templateHtml = templateHtml.replace(/{{content}}/g, data.html_content);
                        templateHtml = templateHtml.replace(/{{description}}/g, description);
                        
                        // Store the full HTML for export/preview
                        blogContentTextarea.dataset.fullHtml = templateHtml;
                        
                        // Show the template-based content in the textarea
                        blogContentTextarea.value = data.html_content;
                    }
                    
                    // Show success message with uploaded content info
                    let successMessage = 'Blog content generated with template!';
                    if (selectedImages && selectedImages.length > 0) {
                        successMessage += ` (${selectedImages.length} image(s) integrated)`;
                    }
                    successMessage += ' You can now edit it in the blog editor.';
                    
                    console.log('Blog content generated successfully with template and uploaded content');
                    alert(successMessage);
                } else {
                    alert(data.error || 'Failed to generate blog content.');
                }
        } catch (err) {
            console.error('Error generating blog content:', err);
            alert('Error generating blog content. Please try again.');
        }
    }

    // Add blog editor functionality
    const saveBlogBtn = document.getElementById('save-blog');
    const exportBlogBtn = document.getElementById('export-blog');
    const previewBlogBtn = document.getElementById('preview-blog');

    if (saveBlogBtn) {
        saveBlogBtn.addEventListener('click', () => {
            const title = blogTitleInput ? blogTitleInput.value : '';
            const content = blogContentTextarea ? blogContentTextarea.value : '';
            
            if (!title || !content) {
                alert('Please enter both title and content to save.');
                return;
            }
            
            // Save to localStorage for now (can be extended to backend)
            const blogData = {
                title,
                content,
                template: selectedTemplate,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('savedBlog', JSON.stringify(blogData));
            alert('Blog saved successfully!');
        });
    }

    if (exportBlogBtn) {
        exportBlogBtn.addEventListener('click', () => {
            const title = blogTitleInput ? blogTitleInput.value : '';
            const content = blogContentTextarea ? blogContentTextarea.value : '';
            const fullHtml = blogContentTextarea ? blogContentTextarea.dataset.fullHtml : '';
            
            if (!title || !content) {
                alert('Please enter both title and content to export.');
                return;
            }
            
            // Use the full template HTML if available, otherwise create basic HTML
            const htmlContent = fullHtml || `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #333; }
        .content { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="content">
        <h1>${title}</h1>
        <div>${content.replace(/\n/g, '<br>')}</div>
    </div>
</body>
</html>`;
            
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Blog exported as HTML file with template design!');
        });
    }

    if (previewBlogBtn) {
        previewBlogBtn.addEventListener('click', () => {
            const title = blogTitleInput ? blogTitleInput.value : '';
            const content = blogContentTextarea ? blogContentTextarea.value : '';
            const fullHtml = blogContentTextarea ? blogContentTextarea.dataset.fullHtml : '';
            
            if (!title || !content) {
                alert('Please enter both title and content to preview.');
                return;
            }
            
            // Use the full template HTML if available, otherwise create basic preview
            const htmlContent = fullHtml || `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
        .content { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
    </div>
</body>
</html>`;
            
            // Open preview in new window
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(htmlContent);
            previewWindow.document.close();
        });
    }

    // Add live preview functionality
    function showLivePreview() {
        const title = blogTitleInput ? blogTitleInput.value : '';
        const content = blogContentTextarea ? blogContentTextarea.value : '';
        const fullHtml = blogContentTextarea ? blogContentTextarea.dataset.fullHtml : '';
        
        if (!title || !content) {
            alert('Please enter both title and content to preview.');
            return;
        }
        
        // Ask user how many images they want in the blog
        const numImages = prompt('How many images would you like to add to your blog? (Enter a number between 1-10):', '3');
        const imageCount = parseInt(numImages) || 3;
        
        // Create a new window with the blog preview and image upload areas
        const previewWindow = window.open('', '_blank');
        
        // Create the HTML content with image upload areas
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Live Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
            color: #e8eaed;
            margin: 0;
            padding: 20px 0 60px 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: linear-gradient(145deg, #1e2328 0%, #252a31 100%);
            border-radius: 24px;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 8px 25px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            padding: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            position: relative;
        }
        
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4f8cff 0%, #7c3aed 50%, #06b6d4 100%);
        }
        
        h1 {
            font-family: 'Playfair Display', Georgia, serif;
            color: #ffffff;
            font-size: 3.2rem;
            font-weight: 700;
            margin-bottom: 30px;
            line-height: 1.2;
            text-align: center;
            background: linear-gradient(135deg, #4f8cff 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            position: relative;
        }
        
        h1::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, #4f8cff 0%, #7c3aed 100%);
            border-radius: 2px;
        }
        
        .blog-section {
            margin-bottom: 35px;
        }
        
        .blog-section h2 {
            font-family: 'Playfair Display', Georgia, serif;
            color: #ffffff;
            font-size: 2.2rem;
            font-weight: 600;
            margin-top: 45px;
            line-height: 1.3;
            position: relative;
            padding-left: 20px;
        }
        
        .blog-section h2::before {
            content: '';
            position: absolute;
            left: 0;
            top: 5px;
            width: 4px;
            height: 35px;
            background: linear-gradient(135deg, #4f8cff 0%, #7c3aed 100%);
            border-radius: 2px;
        }
        
        .blog-section p {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #d1d5db;
            margin-bottom: 20px;
            text-align: justify;
            font-weight: 400;
            letter-spacing: 0.01em;
        }
        
        .image-upload-container {
            margin: 45px 0;
            text-align: center;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 20px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .image-upload-placeholder {
            border: 2px dashed #4f8cff;
            border-radius: 12px;
            padding: 40px 20px;
            background: linear-gradient(145deg, #1a1f2e 0%, #252a31 100%);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            user-select: none;
        }
        
        .image-upload-placeholder:hover {
            border-color: #7c3aed;
            background: linear-gradient(145deg, #252a31 0%, #2a2f36 100%);
            transform: translateY(-2px);
        }
        
        .image-upload-placeholder:focus {
            outline: 2px solid #4f8cff;
            outline-offset: 2px;
        }
        
        .file-input {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            opacity: 0 !important;
            cursor: pointer !important;
            z-index: 10 !important;
            display: block !important;
            font-size: 0 !important;
        }
        
        .image-upload-placeholder {
            position: relative !important;
            cursor: pointer !important;
        }
        
        .image-upload-placeholder:hover {
            border-color: #7c3aed;
            background: linear-gradient(145deg, #252a31 0%, #2a2f36 100%);
            transform: translateY(-2px);
        }
        
        .upload-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.7;
        }
        
        .upload-text {
            font-size: 1.1rem;
            font-weight: 500;
            color: #4f8cff;
            margin-bottom: 8px;
        }
        
        .upload-hint {
            font-size: 0.85rem;
            color: #a0a0a0;
        }
        
        .image-preview {
            position: relative;
            display: inline-block;
        }
        
        .uploaded-image {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            width: auto;
            max-height: 500px;
            border-radius: 16px;
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.3),
                0 12px 25px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .remove-image-btn {
            position: absolute;
            top: -10px;
            right: -10px;
            background: #ff4757;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
            transition: all 0.3s ease;
        }
        
        .remove-image-btn:hover {
            background: #ff3742;
            transform: scale(1.1);
        }
        
        .preview-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .preview-header h2 {
            color: #4f8cff;
            font-size: 1.8rem;
            margin-bottom: 10px;
        }
        
        .preview-header p {
            color: #a0a0a0;
            font-size: 1rem;
        }
    </style>
</head>
<body>
            <div class="container">
            <div class="preview-header">
                <h2>📝 Live Blog Preview</h2>
                <p>Click on the upload areas below to add images to your blog</p>
                <button onclick="testUploadFunction()" style="background: #4f8cff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Test Upload Function</button>
                <button onclick="manualFileSelect()" style="background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; margin-left: 10px;">Manual File Select</button>
                <button onclick="createVisibleFileInput()" style="background: #06b6d4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; margin-left: 10px;">Create Visible File Input</button>
                <button onclick="createSimpleUpload()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; margin-left: 10px;">Simple Upload</button>
            </div>
        
        <h1>${title}</h1>
        
        ${content.split('\\n').map(paragraph => {
            if (paragraph.trim()) {
                return `<div class="blog-section"><p>${paragraph}</p></div>`;
            }
            return '';
        }).join('')}
        
        <!-- Image upload areas will be inserted here by JavaScript -->
        <div id="image-upload-areas"></div>
    </div>
    
    <script>
        // Add image upload areas where images should appear
        function addImageUploadAreas() {
            const paragraphs = document.querySelectorAll('.blog-section p');
            const totalParagraphs = paragraphs.length;
            const imageCount = ${imageCount};
            
            console.log('Creating upload areas:', imageCount, 'images for', totalParagraphs, 'paragraphs');
            
            // Calculate spacing to distribute images evenly
            const spacing = Math.max(1, Math.floor(totalParagraphs / imageCount));
            
            // Add upload areas based on user's requested count
            for (let i = 0; i < imageCount && i * spacing < totalParagraphs; i++) {
                const paragraphIndex = (i + 1) * spacing;
                if (paragraphIndex < totalParagraphs) {
                    const paragraph = paragraphs[paragraphIndex];
                    const uploadArea = document.createElement('div');
                    uploadArea.className = 'image-upload-container';
                    uploadArea.innerHTML = \`
                        <div class="image-upload-placeholder" role="button" tabindex="0" aria-label="Upload image">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Click to upload image</div>
                            <div class="upload-hint">Recommended: 800x400px or larger</div>
                            <input type="file" accept="image/*" class="file-input" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10;" onchange="handleFileInputChange(this)">
                        </div>
                        <div class="image-preview" style="display: none;">
                            <img src="" alt="Uploaded image" class="uploaded-image">
                            <button type="button" class="remove-image-btn" onclick="removeImage(this.parentElement)" aria-label="Remove image">✕</button>
                        </div>
                    \`;
                    
                    // Insert after the current paragraph
                    paragraph.parentElement.after(uploadArea);
                    console.log('Added upload area', i + 1, 'after paragraph', paragraphIndex);
                }
            }
            
            // Add event listeners after creating elements
            addUploadEventListeners();
        }
        
        // Add event listeners for upload functionality
        function addUploadEventListeners() {
            // Add click and keyboard support for accessibility
            document.querySelectorAll('.image-upload-placeholder').forEach(placeholder => {
                // Click handler
                placeholder.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Upload placeholder clicked');
                    const input = this.querySelector('.file-input');
                    if (input) {
                        console.log('File input found, triggering click');
                        input.click();
                    } else {
                        console.error('File input not found');
                        alert('Upload input not found. Please refresh the page.');
                    }
                });
                
                // Keyboard support
                placeholder.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const input = this.querySelector('.file-input');
                        if (input) {
                            input.click();
                        }
                    }
                });
                
                // Also add mousedown event as backup
                placeholder.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    const input = this.querySelector('.file-input');
                    if (input) {
                        input.click();
                    }
                });
                
                // Add touch events for mobile
                placeholder.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    const input = this.querySelector('.file-input');
                    if (input) {
                        input.click();
                    }
                });
            });
            
            console.log('Upload event listeners added');
        }
        
        function handleImageUpload(input, container) {
            console.log('handleImageUpload called');
            const file = input.files[0];
            
            if (!file) {
                alert('No file selected. Please choose an image file.');
                return;
            }
            
            console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPG, PNG, GIF, etc.)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image file is too large. Please select an image smaller than 5MB.');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                console.log('File read successfully');
                const placeholder = container.querySelector('.image-upload-placeholder');
                const preview = container.querySelector('.image-preview');
                const img = preview.querySelector('.uploaded-image');
                
                if (!placeholder || !preview || !img) {
                    alert('Error: Upload elements not found. Please refresh the page.');
                    return;
                }
                
                img.src = e.target.result;
                img.alt = file.name;
                
                placeholder.style.display = 'none';
                preview.style.display = 'block';
                
                // Show success message
                alert('Image uploaded successfully: ' + file.name);
                console.log('Image displayed successfully');
            };
            
            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading the image file. Please try again.');
            };
            
            reader.readAsDataURL(file);
        }
        
        function removeImage(container) {
            const placeholder = container.querySelector('.image-upload-placeholder');
            const preview = container.querySelector('.image-preview');
            const input = container.querySelector('input[type="file"]');
            
            placeholder.style.display = 'block';
            preview.style.display = 'none';
            input.value = '';
            
            alert('Image removed successfully');
        }
        
        // Function to handle file input changes (called directly by onchange)
        function handleFileInputChange(input) {
            console.log('File input change detected');
            const container = input.closest('.image-upload-container');
            if (container) {
                handleImageUpload(input, container);
            } else {
                console.error('Container not found for file input');
                alert('Error: Upload container not found. Please refresh the page.');
            }
        }
        
        // Initialize upload areas when page loads
        window.onload = function() {
            setTimeout(function() {
                addImageUploadAreas();
                console.log('Image upload areas initialized');
            }, 500);
        };
        
        // Also try to initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                addImageUploadAreas();
                console.log('Image upload areas initialized (DOM ready)');
            }, 500);
        });
        
        // Additional initialization with retry mechanism
        function initializeUploadAreas() {
            const uploadAreas = document.querySelectorAll('.image-upload-container');
            if (uploadAreas.length === 0) {
                console.log('No upload areas found, retrying...');
                setTimeout(initializeUploadAreas, 1000);
                return;
            }
            
            console.log('Found', uploadAreas.length, 'upload areas');
            addUploadEventListeners();
            
            // Test each upload area
            uploadAreas.forEach((area, index) => {
                const input = area.querySelector('.file-input');
                const placeholder = area.querySelector('.image-upload-placeholder');
                if (input && placeholder) {
                    console.log('Upload area', index + 1, 'is properly initialized');
                } else {
                    console.error('Upload area', index + 1, 'has missing elements');
                }
            });
        }
        
        // Call initialization with retry
        setTimeout(initializeUploadAreas, 1000);
        
        // Add a test function to check if upload areas are working
        function testUploadAreas() {
            const uploadAreas = document.querySelectorAll('.image-upload-container');
            console.log('Found', uploadAreas.length, 'upload areas');
            uploadAreas.forEach((area, index) => {
                const input = area.querySelector('input[type="file"]');
                const placeholder = area.querySelector('.image-upload-placeholder');
                console.log('Upload area', index + 1, ':', input ? 'Has input' : 'Missing input', placeholder ? 'Has placeholder' : 'Missing placeholder');
            });
        }
        
        // Test upload areas after a delay
        setTimeout(testUploadAreas, 1000);
        
        // Manual file select function for debugging
        function manualFileSelect() {
            console.log('Manual file select triggered');
            const uploadAreas = document.querySelectorAll('.image-upload-container');
            if (uploadAreas.length > 0) {
                const firstArea = uploadAreas[0];
                const input = firstArea.querySelector('.file-input');
                if (input) {
                    console.log('Manually triggering file input');
                    input.click();
                } else {
                    console.error('No file input found for manual selection');
                    alert('No file input found. Please refresh the page.');
                }
            } else {
                alert('No upload areas found. Please refresh the page.');
            }
        }
        
        // Create a visible file input button
        function createVisibleFileInput() {
            console.log('Creating visible file input');
            const uploadAreas = document.querySelectorAll('.image-upload-container');
            if (uploadAreas.length > 0) {
                const firstArea = uploadAreas[0];
                const placeholder = firstArea.querySelector('.image-upload-placeholder');
                
                // Create a visible file input button
                const visibleInput = document.createElement('input');
                visibleInput.type = 'file';
                visibleInput.accept = 'image/*';
                visibleInput.style.cssText = 'display: block; margin: 10px auto; padding: 10px; border: 2px solid #4f8cff; border-radius: 5px; background: #1a1f2e; color: white; cursor: pointer;';
                visibleInput.onchange = function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        console.log('File selected via visible input:', file.name);
                        // Handle the file upload
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const preview = firstArea.querySelector('.image-preview');
                            const img = preview.querySelector('.uploaded-image');
                            const placeholderDiv = firstArea.querySelector('.image-upload-placeholder');
                            
                            img.src = e.target.result;
                            img.alt = file.name;
                            
                            placeholderDiv.style.display = 'none';
                            preview.style.display = 'block';
                            
                            alert('Image uploaded successfully: ' + file.name);
                        };
                        reader.readAsDataURL(file);
                    }
                };
                
                // Insert the visible input after the placeholder
                placeholder.parentNode.insertBefore(visibleInput, placeholder.nextSibling);
                alert('Visible file input created! Click the button above to select an image.');
            } else {
                alert('No upload areas found. Please refresh the page.');
            }
        }
        
        // Simple upload function for users who have issues with the main upload
        function createSimpleUpload() {
            console.log('Creating simple upload interface');
            const container = document.querySelector('.container');
            
            // Create a simple file input
            const simpleInput = document.createElement('input');
            simpleInput.type = 'file';
            simpleInput.accept = 'image/*';
            simpleInput.multiple = true;
            simpleInput.style.cssText = 'display: block; margin: 20px auto; padding: 15px; border: 2px dashed #4f8cff; border-radius: 10px; background: #1a1f2e; color: white; cursor: pointer; width: 80%; max-width: 400px; text-align: center;';
            simpleInput.innerHTML = '📁 Click here to select images';
            
            simpleInput.onchange = function(e) {
                const files = Array.from(e.target.files);
                console.log('Files selected:', files.length);
                
                files.forEach((file, index) => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // Create image display
                            const imgContainer = document.createElement('div');
                            imgContainer.style.cssText = 'margin: 20px 0; text-align: center;';
                            
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.alt = file.name;
                            img.style.cssText = 'max-width: 100%; max-height: 400px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);';
                            
                            const fileName = document.createElement('p');
                            fileName.textContent = file.name;
                            fileName.style.cssText = 'color: #4f8cff; margin-top: 10px; font-size: 0.9em;';
                            
                            imgContainer.appendChild(img);
                            imgContainer.appendChild(fileName);
                            
                            // Insert after the simple input
                            simpleInput.parentNode.insertBefore(imgContainer, simpleInput.nextSibling);
                            
                            alert('Image uploaded successfully: ' + file.name);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert('Please select only image files.');
                    }
                });
            };
            
            // Insert the simple input at the top of the container
            container.insertBefore(simpleInput, container.firstChild);
            alert('Simple upload interface created! Click the file input above to select images.');
        }
        
        // Test function for upload functionality
        function testUploadFunction() {
            console.log('Testing upload function...');
            const uploadAreas = document.querySelectorAll('.image-upload-container');
            console.log('Found', uploadAreas.length, 'upload areas');
            
            if (uploadAreas.length > 0) {
                const firstArea = uploadAreas[0];
                const input = firstArea.querySelector('.file-input');
                const placeholder = firstArea.querySelector('.image-upload-placeholder');
                
                console.log('First upload area:', {
                    hasInput: !!input,
                    hasPlaceholder: !!placeholder,
                    inputType: input ? input.type : 'none',
                    accept: input ? input.accept : 'none',
                    inputStyle: input ? input.style.cssText : 'none'
                });
                
                if (input && placeholder) {
                    // Test if we can trigger the file input
                    try {
                        input.click();
                        console.log('File input click triggered successfully');
                        alert('Upload functionality is ready! File dialog should open.');
                    } catch (error) {
                        console.error('Error triggering file input:', error);
                        alert('Upload functionality found but may not work. Please try clicking the upload area.');
                    }
                } else {
                    alert('Upload functionality not found. Please refresh the page.');
                }
            } else {
                alert('No upload areas found. Please refresh the page.');
            }
        }
    </script>
</body>
</html>`;
        
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
    }

    // Add live preview button to blog editor
    if (previewBlogBtn) {
        previewBlogBtn.addEventListener('click', showLivePreview);
    }

    // Add image upload functionality for blog content
    function setupImageUploads() {
        // Handle image upload placeholders
        document.addEventListener('click', (e) => {
            if (e.target.closest('.image-upload-placeholder')) {
                const placeholder = e.target.closest('.image-upload-placeholder');
                const input = placeholder.querySelector('.image-upload-input');
                input.click();
            }
        });

        // Handle file selection
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('image-upload-input')) {
                const file = e.target.files[0];
                const imageId = e.target.dataset.imageId;
                const container = document.querySelector(`[data-image-id="${imageId}"]`);
                
                if (file && container) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const placeholder = container.querySelector('.image-upload-placeholder');
                        const preview = container.querySelector('.image-preview');
                        const img = preview.querySelector('.uploaded-image');
                        
                        img.src = e.target.result;
                        img.alt = file.name;
                        
                        placeholder.style.display = 'none';
                        preview.style.display = 'block';
                        
                        // Add the uploaded image to selectedBlogImages for form submission
                        file.previewUrl = e.target.result;
                        selectedBlogImages.push(file);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });

        // Handle remove image button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-image-btn')) {
                const imageId = e.target.dataset.imageId;
                const container = document.querySelector(`[data-image-id="${imageId}"]`);
                
                if (container) {
                    const placeholder = container.querySelector('.image-upload-placeholder');
                    const preview = container.querySelector('.image-preview');
                    const input = container.querySelector('.image-upload-input');
                    
                    placeholder.style.display = 'block';
                    preview.style.display = 'none';
                    input.value = '';
                    
                    // Remove the image from selectedBlogImages
                    const img = preview.querySelector('.uploaded-image');
                    const index = selectedBlogImages.findIndex(img => img.previewUrl === img.src);
                    if (index > -1) {
                        selectedBlogImages.splice(index, 1);
                    }
                }
            }
        });
    }

    // Setup image uploads when blog content is generated
    function setupBlogImageUploads() {
        // Wait a bit for the content to be rendered
        setTimeout(() => {
            setupImageUploads();
        }, 100);
    }

    // Override the generateBlogContent function to setup image uploads
    const originalGenerateBlogContent = generateBlogContent;
    generateBlogContent = async function() {
        await originalGenerateBlogContent();
        setupBlogImageUploads();
    };

    // Remove debug button functionality
    // const debugBtn = document.getElementById('debug-modal-btn');
    // if (debugBtn) {
    //     debugBtn.addEventListener('click', testModal);
    // }
}); 