/*
  Copyright © 2025  MUHAMMAD ISMAYIL 
  All rights reserved.
  Unauthorized copying or distribution is strictly prohibited.
*/

        $(document).ready(function() {
            // Theme toggle
            const themeToggle = $('#theme-toggle');
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Check for saved theme preference or use OS preference
            const currentTheme = localStorage.getItem('theme') || 
                                (prefersDarkScheme.matches ? 'dark' : 'light');
            if (currentTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
            }
            
            themeToggle.on('click', function() {
                const currentTheme = document.body.getAttribute('data-theme');
                if (currentTheme === 'dark') {
                    document.body.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                } else {
                    document.body.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                }
            });
            
            // Tab switching
            $('.tab').on('click', function() {
                const tabId = $(this).data('tab');
                $('.tab').removeClass('active');
                $(this).addClass('active');
                $('.tab-content').removeClass('active');
                $(`#${tabId}-tab`).addClass('active');
                resetErrors();
            });
            
            // Advanced options toggle
            const advancedOptions = $('#advanced-options');
            const toggleAdvanced = $('#toggle-advanced');
            
            advancedOptions.hide();
            toggleAdvanced.addClass('collapsed');
            
            toggleAdvanced.on('click', function() {
                advancedOptions.slideToggle();
                toggleAdvanced.toggleClass('collapsed');
            });
            
            // Color pickers sync with text inputs
            $('#fg-color').on('input', function() {
                $('#fg-color-text').val($(this).val());
            });
            
            $('#bg-color').on('input', function() {
                $('#bg-color-text').val($(this).val());
            });
            
            $('#fg-color-text').on('input', function() {
                const color = $(this).val();
                if (isValidColor(color)) {
                    $('#fg-color').val(color);
                }
            });
            
            $('#bg-color-text').on('input', function() {
                const color = $(this).val();
                if (isValidColor(color)) {
                    $('#bg-color').val(color);
                }
            });
            
            // Generate QR code
            $('#generate-btn').on('click', generateQRCode);
            
            // Download QR code
            $('#download-btn').on('click', downloadQRCode);
            
            // Reset form
            $('#reset-btn').on('click', resetForm);
            
            // Auto-generate when size changes
            $('#size-input').on('change', function() {
                if ($('#download-btn').prop('disabled') === false) {
                    generateQRCode();
                }
            });
            
            // Helper function to validate color
            function isValidColor(color) {
                const s = new Option().style;
                s.color = color;
                return s.color !== '';
            }
            
            // Helper function to validate URL
            function isValidUrl(string) {
                try {
                    new URL(string);
                    return true;
                } catch (_) {
                    return false;
                }
            }
            
            // Helper function to validate email
            function isValidEmail(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            }
            
            // Helper function to reset error messages
            function resetErrors() {
                $('.error').hide();
            }
            
            // Function to generate QR code
            function generateQRCode() {
                resetErrors();
                
                let qrContent = '';
                const activeTab = $('.tab.active').data('tab');
                
                // Validate input based on active tab
                if (activeTab === 'url') {
                    const url = $('#url-input').val().trim();
                    if (!url) {
                        $('#url-error').text('Please enter a URL').show();
                        return;
                    }
                    if (!isValidUrl(url) && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
                        $('#url-error').text('Please enter a valid URL (e.g., https://example.com)').show();
                        return;
                    }
                    qrContent = url;
                } 
                else if (activeTab === 'text') {
                    const text = $('#text-input').val().trim();
                    if (!text) {
                        $('#text-error').show();
                        return;
                    }
                    qrContent = text;
                } 
                else if (activeTab === 'contact') {
                    const name = $('#name-input').val().trim();
                    const phone = $('#phone-input').val().trim();
                    const email = $('#email-input').val().trim();
                    
                    if (!name && !phone && !email) {
                        $('#email-error').text('Please enter at least one contact detail').show();
                        return;
                    }
                    
                    if (email && !isValidEmail(email)) {
                        $('#email-error').text('Please enter a valid email address').show();
                        return;
                    }
                    
                    // Format as vCard
                    qrContent = 'BEGIN:VCARD\nVERSION:3.0\n';
                    if (name) qrContent += `FN:${name}\nN:${name.split(' ').reverse().join(';')};;;\n`;
                    if (phone) qrContent += `TEL:${phone}\n`;
                    if (email) qrContent += `EMAIL:${email}\n`;
                    qrContent += 'END:VCARD';
                }
                
                // Get other parameters
                const label = $('#label-input').val().trim();
                const size = parseInt($('#size-input').val());
                const fgColor = $('#fg-color').val();
                const bgColor = $('#bg-color').val();
                const errorCorrection = $('#error-correction').val();
                
                // Display label
                $('#qr-label-display').text(label).toggle(!!label);
                
                // Clear previous QR code
                $('#qrcode').empty();
                $('#qr-placeholder').hide();
                
                // Generate new QR code
                new QRCode(document.getElementById('qrcode'), {
                    text: qrContent,
                    width: size,
                    height: size,
                    colorDark: fgColor,
                    colorLight: bgColor,
                    correctLevel: QRCode.CorrectLevel[errorCorrection]
                });
                
                // Enable download button
                $('#download-btn').prop('disabled', false);
            }
            
            // Function to download QR code
            function downloadQRCode() {
                const label = $('#label-input').val().trim();
                const fileName = label ? `QRCode-${label.replace(/\s+/g, '-')}.png` : 'QRCode.png';
                
                // Use html2canvas to capture the QR code with label
                html2canvas(document.querySelector('#qr-preview'), {
                    backgroundColor: $('#bg-color').val(),
                    scale: 2 // Higher quality
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            }
            
            // Function to reset form
            function resetForm() {
                $('input[type="text"], textarea').val('');
                $('#url-input').val('');
                $('#text-input').val('');
                $('#name-input').val('');
                $('#phone-input').val('');
                $('#email-input').val('');
                $('#label-input').val('');
                $('#size-input').val('256');
                $('#fg-color').val('#000000');
                $('#fg-color-text').val('#000000');
                $('#bg-color').val('#ffffff');
                $('#bg-color-text').val('#ffffff');
                $('#error-correction').val('M');
                $('#qr-label-display').text('').hide();
                $('#qrcode').empty();
                $('#qr-placeholder').show();
                $('#download-btn').prop('disabled', true);
                resetErrors();
                $('.tab').removeClass('active');
                $('.tab[data-tab="url"]').addClass('active');
                $('.tab-content').removeClass('active');
                $('#url-tab').addClass('active');
            }
            
            // Initialize with first tab active
            $('.tab[data-tab="url"]').addClass('active');
            $('#url-tab').addClass('active');
        });
