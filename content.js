let activeBlockedTerms =[];

// Fetch the currently active terms from storage
function updateTerms() {
  chrome.storage.sync.get(['blockedTerms'], (data) => {
    const termsObj = data.blockedTerms || { "ramps": true, "ramp": true, "morels": true, "morel": true, "wild carrot": true, "wild garlic": true };
    // Filter to only include terms that are toggled ON
    activeBlockedTerms = Object.keys(termsObj).filter(term => termsObj[term]);
    filterPosts();
  });
}

// Initial pull of terms
updateTerms();

// Listen for updates from the popup menu
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedTerms) {
    updateTerms();
  }
});

function filterPosts() {
  // Selectors for posts across Reddit's various UI versions (Newest, Previous New, and Old Reddit)
  const postSelectors = ['shreddit-post', '.Post', '.thing'];
  const posts = document.querySelectorAll(postSelectors.join(', '));

  posts.forEach(post => {
    let isForaging = false;
    const postText = post.innerText.toLowerCase();
    
    // Check if the post belongs to r/foraging
    if (post.tagName.toLowerCase() === 'shreddit-post') {
      // Newest Reddit UI uses a special web component attribute
      if (post.getAttribute('subreddit-prefixed-name')?.toLowerCase() === 'r/foraging') {
        isForaging = true;
      }
    } else if (postText.includes('r/foraging')) {
      isForaging = true;
    }

    if (!isForaging) return; // Skip posts that aren't from r/foraging

    // Check if the post contains any of the active blocked terms
    const shouldBlock = activeBlockedTerms.some(term => postText.includes(term.toLowerCase()));

    if (shouldBlock) {
      post.style.display = 'none'; // Hide the post
    } else {
      post.style.display = '';     // Restore visibility if a term is toggled off
    }
  });
}

// Reddit is an infinite scrolling site, so we need a MutationObserver 
// to automatically run the filter every time new content loads.
const observer = new MutationObserver((mutations) => {
  let hasNewNodes = false;
  for (let mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      hasNewNodes = true;
      break;
    }
  }
  if (hasNewNodes) {
    filterPosts();
  }
});

// Start observing the page for infinite scroll loads
observer.observe(document.body, { childList: true, subtree: true });
