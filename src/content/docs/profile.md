---
title: Curriculum Vitae
tableOfContents: false
template: doc
wide: true
---

<iframe
    id="cv-iframe" 
    src="https://www.alea.net/cv/"
    style="width: 100%; border: none; overflow: hidden;" 
    scrolling="no">
</iframe>

<script>
window.addEventListener('message', function(e) {
    if (e.data.type === 'cv-height') {
        const iframe = document.getElementById('cv-iframe');
        if (iframe) {
            iframe.style.height = e.data.height + 'px';
        }
    }
    }); 
window.addEventListener('scroll', function() {
    const iframe = document.getElementById('cv-iframe');
    if (!iframe) return;

    // If your parent page has a fixed header, set its height here
    // Example: if your parent website's header is 60px tall, set this to 60.
    const PARENT_HEADER_HEIGHT = window.matchMedia('(max-width: 50rem)').matches ? 56 : 64;
    
    // Use requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
        const iframeRect = iframe.getBoundingClientRect();
        let offset = 0;
        
        // If the iframe's top boundary goes above the parent's header
        if (iframeRect.top < PARENT_HEADER_HEIGHT) {
            offset = PARENT_HEADER_HEIGHT - iframeRect.top;
        }
        
        iframe.contentWindow.postMessage({ type: 'cv-offset', offset: offset }, '*');
    });
}, { passive: true });
</script>