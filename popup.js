document.addEventListener('DOMContentLoaded', () => {
  const termList = document.getElementById('termList');
  const newTermInput = document.getElementById('newTerm');
  const addBtn = document.getElementById('addBtn');

  // The default terms requested
  const defaultTerms = {
    "ramps": true,
    "morels": true,
    "wild carrot": true,
    "wild garlic": true
  };

  // Load terms from Chrome sync storage
  chrome.storage.sync.get({ blockedTerms: defaultTerms }, (data) => {
    renderTerms(data.blockedTerms);
  });

  function renderTerms(terms) {
    termList.innerHTML = '';
    for (const [term, isActive] of Object.entries(terms)) {
      const li = document.createElement('li');
      li.className = 'term-item';
      
      const label = document.createElement('label');
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isActive;
      checkbox.addEventListener('change', (e) => {
        terms[term] = e.target.checked;
        saveTerms(terms);
      });

      const span = document.createElement('span');
      span.textContent = term;

      label.appendChild(checkbox);
      label.appendChild(span);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'X';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        delete terms[term];
        saveTerms(terms);
        renderTerms(terms);
      });

      li.appendChild(label);
      li.appendChild(deleteBtn);
      termList.appendChild(li);
    }
  }

  function saveTerms(terms) {
    chrome.storage.sync.set({ blockedTerms: terms });
  }

  // Handle adding a new term
  addBtn.addEventListener('click', () => {
    const term = newTermInput.value.trim().toLowerCase();
    if (term) {
      chrome.storage.sync.get({ blockedTerms: defaultTerms }, (data) => {
        const terms = data.blockedTerms;
        if (!terms.hasOwnProperty(term)) {
          terms[term] = true;
          saveTerms(terms);
          renderTerms(terms);
        }
        newTermInput.value = '';
      });
    }
  });

  // Allow pressing Enter to add
  newTermInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });
});