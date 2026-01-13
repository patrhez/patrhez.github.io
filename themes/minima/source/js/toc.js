// Table of Contents active section highlighting and toggle functionality
(function() {
  'use strict';
  
  var tocLinks = document.querySelectorAll('#post-toc .toc-link');
  var tocWrapper = document.querySelector('.toc-wrapper');
  var postToc = document.querySelector('#post-toc');
  var tocToggle = document.getElementById('toc-toggle');
  var tocClose = document.getElementById('toc-close');
  var postContent = document.querySelector('.post-content');
  var headers = [];
  
  if (!postToc || !tocWrapper || !postContent) return;
  
  // Check saved state
  var tocState = localStorage.getItem('toc-expanded');
  var isExpanded = tocState === null ? true : tocState === 'true';
  
  // Initialize TOC state
  function initTOCState() {
    if (isExpanded) {
      expandTOC();
    } else {
      collapseTOC();
    }
  }
  
  function expandTOC() {
    postToc.classList.remove('toc-collapsed');
    if (tocToggle) tocToggle.classList.add('hidden');
    localStorage.setItem('toc-expanded', 'true');
    isExpanded = true;
  }
  
  function collapseTOC() {
    postToc.classList.add('toc-collapsed');
    if (tocToggle) tocToggle.classList.remove('hidden');
    localStorage.setItem('toc-expanded', 'false');
    isExpanded = false;
  }
  
  // Toggle button event
  if (tocToggle) {
    tocToggle.addEventListener('click', function() {
      expandTOC();
    });
  }
  
  // Close button event
  if (tocClose) {
    tocClose.addEventListener('click', function() {
      collapseTOC();
    });
  }
  
  // Initialize state
  initTOCState();
  
  if (tocLinks.length === 0) return;
  
  // Get all header elements that have IDs
  tocLinks.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var id = href.substring(1);
      var header = document.getElementById(id);
      if (header) {
        headers.push({
          id: id,
          link: link,
          element: header
        });
      }
    }
  });
  
  if (headers.length === 0) return;
  
  var postContentTop = postContent.offsetTop;
  var postContentBottom = postContentTop + postContent.offsetHeight;
  var tocHeight = tocWrapper.offsetHeight;
  var viewportHeight = window.innerHeight;
  
  function updateTOCPosition() {
    if (!isExpanded) return;
    
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollBottom = scrollTop + viewportHeight;
    
    // Calculate center position
    var centerY = scrollTop + viewportHeight / 2;
    var tocHalfHeight = tocHeight / 2;
    var tocTop = centerY - tocHalfHeight;
    var tocBottom = tocTop + tocHeight;
    
    // If TOC would go below post content, adjust it
    if (tocBottom > postContentBottom) {
      tocTop = Math.max(postContentBottom - tocHeight, postContentTop);
    }
    
    // Ensure TOC doesn't go above post content start
    if (tocTop < postContentTop) {
      tocTop = postContentTop;
    }
    
    // Update TOC position (centered vertically)
    var centerPosition = tocTop + tocHalfHeight;
    tocWrapper.style.top = centerPosition + 'px';
    tocWrapper.style.transform = 'translateY(-50%)';
    
    // Update toggle button position to match
    if (tocToggle) {
      tocToggle.style.top = centerPosition + 'px';
      tocToggle.style.transform = 'translateY(-50%)';
    }
  }
  
  function updateActiveTOC() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var offset = 100; // Offset from top
    
    // Remove all active classes
    tocLinks.forEach(function(link) {
      link.classList.remove('active');
    });
    
    // Find the current section
    for (var i = headers.length - 1; i >= 0; i--) {
      var header = headers[i];
      var headerTop = header.element.offsetTop;
      
      if (scrollTop + offset >= headerTop) {
        header.link.classList.add('active');
        // Scroll active item into view if needed
        var linkRect = header.link.getBoundingClientRect();
        var tocRect = tocWrapper.getBoundingClientRect();
        if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
          header.link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        break;
      }
    }
  }
  
  // Throttle scroll events
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateTOCPosition();
        updateActiveTOC();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    postContentTop = postContent.offsetTop;
    postContentBottom = postContentTop + postContent.offsetHeight;
    tocHeight = tocWrapper.offsetHeight;
    viewportHeight = window.innerHeight;
    updateTOCPosition();
    // Update toggle button position
    if (tocToggle && !isExpanded) {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var centerY = scrollTop + viewportHeight / 2;
      tocToggle.style.top = centerY + 'px';
      tocToggle.style.transform = 'translateY(-50%)';
    }
  });
  
  // Initial update
  updateTOCPosition();
  updateActiveTOC();
  
  // Update toggle button position on scroll when collapsed
  if (tocToggle) {
    var tickingToggle = false;
    window.addEventListener('scroll', function() {
      if (!isExpanded && !tickingToggle) {
        window.requestAnimationFrame(function() {
          var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          var centerY = scrollTop + viewportHeight / 2;
          tocToggle.style.top = centerY + 'px';
          tocToggle.style.transform = 'translateY(-50%)';
          tickingToggle = false;
        });
        tickingToggle = true;
      }
    });
  }
})();
