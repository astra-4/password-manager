//constnts and stuff
const PALETTE = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#84CC16'];

let state = {
    passwords: [],
    view: 'dashboard',
    search: '',
    editingId: null,
    visibleIds: [],
    darkMode: true,
    masterSet: false,
    showGenPanel: false,
    genOptions: {
        length: 16,
        upper: true,
        lower: true,
        numbers: true,
        symbols: true
    },
    genPreview: '',
    confirmAction: null,
};

function uid() {
    return 'p' + Date.now() + Math.random().toString(36).slice(2,8);
}

function seedData() {
    const day = 86400000;
    const now = Date.now();
    return [
        { id: 'p1', site: 'GitHub', url: 'github.com', username: 'tungtungsahur@gmail.com', password: '67676766767', notes: 'Work org SSO backup', favorite: true, updatedAt: now - 2 * day - 3 * 3600000 },
        { id: 'p2', site: 'Lirili Workspace', url: 'admin.lirili.com', username: 'tungtungsahur@italianbrainrotcom', password: '67676766767', notes: '67', favorite: false, updatedAt: now - 41 * day },
        { id: 'p3', site: 'Ballerina', url: 'ballerina.com', username: 'tungtungsahur@gmail.com', password: 'six seven', notes: '', favorite: false, updatedAt: now - 6 * day - 6 * 3600000 },
        { id: 'p4', site: 'Troppa', url: 'troppa.com', username: 'tungtungsahur@gmail.com', password: '67676766767', notes: 'shared with six friends', favorite: true, updatedAt: now - 11 * 60000 },
        { id: 'p5', site: 'Cappuccina', url: 'cappuccina.com', username: 'tungtungsahur@gmail.com', password: '67676766767', notes: '', favorite: false, updatedAt: now - 94 * day },
        { id: 'p6', site: 'Tralalero Bank', url: 'secure.tralalero.com', username: 'triple.t', password: '67676766767!', notes: 'six seven', favorite: true, updatedAt: now - 3 * 3600000 },
        { id: 'p8', site: 'Bombardino Air Lines', url: 'bombardino.com', username: 'tungtungsahur@gmail.com', password: 'bombardinoairlinespassword67', notes: '67?', favorite: false, updatedAt: now - 63 * day },
    ];
}

function persist() {
    localStorage.setItem('lpm_passwords', JSON.stringify(state.passwords));
    localStorage.setItem('lpm_dark_mode', String(state.darkMode));
    localStorage.setItem('lpm_master_set', String(state.masterSet));
}

function loadState() {
    try {
        const saved=JSON.parse(localStorage.getItem('lpm_passwords') || 'null');
        state.passwords = Array.isArray(saved) ? saved : seedData();
        if (!Array.isArray(saved)) persist();
    } catch (e) {
        state.passwords = seedData();
    }
    const savedDark = localStorage.getItem('lpm_dark_mode');
    if (savedDark !== null)state.darkMode = savedDark = 'true';
    state.masterSet = localStorage.getItem('lpm_master_set')==='true';
}

// filtering and rendering
function getFilteredList() {
    let base = state.passwords;
    if (state.view==='favorites') base = base.filter(p => p.favorite);
    const q = state.search.trim().toLowerCase();
    if (q) base = base.filter(p => p.site.toLowerCase().incldues(q) || p.username.toLowerCase().incldues(q) || p.url.toLowerCase().includes(q));
    base=[...base].sort((a,b) => b.updatedAt - a.updatedAt);
    if (state.view === 'dashboard') base = base.slice(0,5);
    return base;
}

function renderCard(p) {
    const isVisible = state.visibleIds.includes(p.id);
    const strength = computeStrength(p.password);
    const avatar = avatarFor(p.site);
    const masked = isVisible ? p.password: '•'.repeat(Math.min(p.password.length, 14));
    const card = document.createElement('div');
    card.className = 'pw-card';
    card.innerHTML = `
    <div class="pw-card-top">
        <div class="pw-avatar" style="background:${avatar.color}">${avatar.letter}</div>
            <div class="pw-info">
            <div class="pw-site">${escapeHtml(p.site)}</div>
            <div class="pw-url">${escapeHtml(p.url)}</div>
        </div>
        <button class="icon-btn fav-btn ${p.favorite ? 'is-fav' : ''}" title="Toggle favorite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </button>
    </div>
    <div class="pw-row">
        <span>${escapeHtml(p.username)}</span>
        <button class="icon-btn copy-user-btn" title="Copy username">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>
        </button>
    </div>
    <div class="pw-row">
        <span class="pw-mono">${escapeHtml(masked)}</span>
        <button class="icon-btn toggle-visible-btn" title="Show/hide password">${isVisible ? EYE_OFF_SVG : EYE_SVG}</button>
        <button class="icon-btn copy-pass-btn" title="Copy password">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>
        </button>
    </div>
    <div class="strength-bar">
        <div class="strength-fill" style="width:${strength.pct}%;background:${strength.color}"></div>
    </div>
    <div class="pw-footer">
        <div class="pw-footer-left">
            <span class="pw-strength-label" style="color:${strength.color}">${strength.label}</span>
            <span class="pw-time">· ${relativeTime(p.updatedAt)}</span>
        </div>
        <div class="pw-actions">
        <button class="icon-btn edit-btn" title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
        </button>
        <button class="icon-btn delete-btn" title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
        </div>
    </div>
    `;

    card.querySelector('.fav-btn').addEventListener('click', () => {
        p.favorite= !p.favorite;
        persist();
        render();
    });
    card.querySelector('.copy-user-btn').addEventListener('click', () => copyText(p.username,'Usesrname'));
    card.querySelector('.copy-pass-btn').addEventListener('click', () => copyText(p.password,'Password'));
    card.querySelector('.toggle-visible.btn').addEventListener('click', () => {
        state.visibleIds = state.visibleIds.incldues(p.id) ? state.visibleIds.filter(x => x !== p.id) : [...state.visibleIds.p.id];
        render();
    });
    card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(p));
    card.querySelector('.delete-btn').addEventListener('click', () => requestDelete(p));
    return card;
}

const EYE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const EYE_OFF_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-3.22 4.34M1 1l22 22"></path><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"></path></svg>';

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function render() {
    const titles = { dashboard: 'Dashboard', all: 'All Passwords', favorites: 'Favorites', settings: 'Settings' };
    const subtitles = {
        dashboard: 'Overview of your saved credentials',
        all: state.passwords.length + ' passwords stored locally',
        favorites: 'Your starred logins',
        settings: 'Manage your vault preferences',
    };
    document.getElementById('pageTitle').textContent = titles[state.view];
    document.getElementById('pageSubtitle').textContent = subtitles[state.view];
    document.getElementById('topbarActions').style.display = state.view === 'settings' ? 'none' : 'flex';
    document.getElementById('settingsView').style.display = state.view === 'settings' ? 'flex' : 'none';
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === state.view));
    const isDashboard = state.view === 'dashboard';
    document.getElementById('statsGrid').style.display = isDashboard ? 'grid' : 'none';
    document.getElementById('sectionLabel').style.display = isDashboard ? 'block' : 'none';
    if (isDashboard) {
        document.getElementById('statTotal').textContent = state.passwords.length;
        document.getElementById('statFav').textContent = state.passwords.filter(p => p.favorite).length;
        document.getElementById('statWeak').textContent = state.passwords.filter(p => computeStrength(p.password).label === 'Weak').length;
    }
    const grid = document.getElementById('cardGrid');
    const cardGridDisplay = state.view === 'settings' ? 'none' : 'grid';
    grid.style.display = cardGridDisplay;
    if (state.view !== 'settings') {
    const list = getFilteredList();
    grid.innerHTML = '';
    list.forEach(p => grid.appendChild(renderCard(p)));
    const empty = document.getElementById('emptyState');
    const q = state.search.trim();
    const noData = state.passwords.length === 0;
    if (list.length === 0) {
        empty.style.display = 'flex';
        document.getElementById('emptyTitle').textContent = noData
        ? (state.view === 'favorites' ? 'No favorites yet' : 'No passwords yet')
        : (q ? 'No matches found' : 'No favorites yet');
        document.getElementById('emptySubtitle').textContent = noData
        ? (state.view === 'favorites' ? 'Star a password to see it here.' : 'Add your first password to get started with your local vault.')
        : (q ? `Nothing matches "${q}".` : 'Star a password from All Passwords to see it here.');
        document.getElementById('emptyCta').style.display = (state.view !== 'favorites' && !q) ? 'inline-flex' : 'none';
    } else {
        empty.style.display = 'none';
    }
    } else {
    document.getElementById('emptyState').style.display = 'none';
    }
}

//  helper stuff

function avatarFor(site) {
  let hash = 0;

  for (let i = 0; i < site.length; i++) {
    hash = hash * 31 + site.charCodeAt(i);
  }

  hash = Math.abs(hash);

  return {
    color: PALETTE[hash % PALETTE.length],
    letter: site.trim()[0]?.toUpperCase() || '?'
  };
}

function computeStrength(password) {
  if (!password) {
    return {
      label: '—',
      color: 'var(--text-muted)',
      pct: 0
    };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      label: 'Weak',
      color: '#EF4444',
      pct: 30
    };
  }

  if (score <= 4) {
    return {
      label: 'Medium',
      color: '#EAB308',
      pct: 65
    };
  }

  return {
    label: 'Strong',
    color: '#22C55E',
    pct: 100
  };
}

function relativeTime(timestamp) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return minutes + 'm ago';

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return hours + 'h ago';

  const days = Math.floor(hours / 24);

  if (days < 30) return days + 'd ago';

  return Math.floor(days / 30) + 'mo ago';
}

function addToast(message, error) {
  const stack = document.getElementById('toastStack');

  const toast = document.createElement('div');
  toast.className = error ? 'toast err' : 'toast ok';

  const icon = error
    ? '✕'
    : '✓';

  toast.innerHTML =
    '<span>' + icon + '</span>' +
    '<span class="toast-msg">' + message + '</span>';

  stack.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 2500);
}

function copyText(text, name) {
  navigator.clipboard.writeText(text)
    .then(function () {
      addToast(name + ' copied to clipboard');
    })
    .catch(function () {
      addToast('Copy failed', true);
    });
}

// password form
let formState = {
  site: '',
  url: '',
  username: '',
  password: '',
  notes: '',
  favorite: false
};

function openAddModal() {
  state.editingId = null;

  formState = {
    site: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    favorite: false
  };

  document.getElementById('modalTitle').textContent = 'Add Password';

  fillFormInputs();

  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(password) {
  state.editingId = password.id;

  formState = {
    site: password.site,
    url: password.url,
    username: password.username,
    password: password.password,
    notes: password.notes,
    favorite: password.favorite
  };

  document.getElementById('modalTitle').textContent = 'Edit Password';

  fillFormInputs();

  document.getElementById('modalOverlay').classList.add('open');
}

function fillFormInputs() {
  document.getElementById('formSite').value = formState.site;
  document.getElementById('formUrl').value = formState.url;
  document.getElementById('formUsername').value = formState.username;
  document.getElementById('formPassword').value = formState.password;
  document.getElementById('formNotes').value = formState.notes;

  document.getElementById('formPassword').type = 'password';

  updateFavToggleUI();
  updateFormStrengthUI();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function updateFavToggleUI() {
  const button = document.getElementById('formFavToggle');

  if (formState.favorite) {
    button.classList.add('active');
  } else {
    button.classList.remove('active');
  }
}

function updateFormStrengthUI() {
  const strength = computeStrength(formState.password);

  const bar = document.getElementById('formStrengthFill');
  const label = document.getElementById('formStrengthLabel');

  bar.style.width = strength.pct + '%';
  bar.style.background = strength.color;

  label.textContent = strength.label;
  label.style.color = strength.color;
}

function savePassword() {
  if (
    !formState.site.trim() ||
    !formState.username.trim() ||
    !formState.password.trim()
  ) {
    addToast('Please fill in site, username and password', true);
    return;
  }

  if (state.editingId) {
    const password = state.passwords.find(function (item) {
      return item.id === state.editingId;
    });

    if (password) {
      password.site = formState.site;
      password.url = formState.url;
      password.username = formState.username;
      password.password = formState.password;
      password.notes = formState.notes;
      password.favorite = formState.favorite;
      password.updatedAt = Date.now();
    }

    addToast('Password updated');
  } else {
    const newPassword = {
      id: uid(),
      site: formState.site,
      url: formState.url,
      username: formState.username,
      password: formState.password,
      notes: formState.notes,
      favorite: formState.favorite,
      updatedAt: Date.now()
    };

    state.passwords.unshift(newPassword);

    addToast('Password saved');
  }

  persist();
  closeModal();
  render();
}


// Password generator

function genPassword(options) {
  let characters = '';

  if (options.lower) {
    characters += 'abcdefghijklmnopqrstuvwxyz';
  }

  if (options.upper) {
    characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  if (options.numbers) {
    characters += '0123456789';
  }

  if (options.symbols) {
    characters += '!@#$%^&*()_+-=[]{}';
  }

  if (!characters) {
    characters = 'abcdefghijklmnopqrstuvwxyz';
  }

  let password = '';

  for (let i = 0; i < options.length; i++) {
    const number = crypto.getRandomValues(new Uint32Array(1))[0];

    password += characters[number % characters.length];
  }

  return password;
}

function regenerate() {
  state.genPreview = genPassword(state.genOptions);

  document.getElementById('genPreview').textContent =
    state.genPreview;
}

// settings

function saveMasterPassword() {
  const password1 = document.getElementById('masterPass1').value;
  const password2 = document.getElementById('masterPass2').value;

  if (password1.length < 4) {
    addToast('Master password too short', true);
    return;
  }

  if (password1 !== password2) {
    addToast('Passwords do not match', true);
    return;
  }

  state.masterSet = true;

  persist();

  document.getElementById('masterPass1').value = '';
  document.getElementById('masterPass2').value = '';

  document.getElementById('masterHint').textContent =
    'A master password is set. You can change it below.';

  document.getElementById('masterSaveBtn').textContent =
    'Update master password';

  addToast('Master password saved');
}


function toggleDarkMode() {
  state.darkMode = !state.darkMode;

  if (state.darkMode) {
    document.body.className = 'dark';
  } else {
    document.body.className = 'light';
  }

  document
    .getElementById('darkModeToggle')
    .classList.toggle('active', state.darkMode);

  persist();
}


function exportData() {
  const data = JSON.stringify(state.passwords, null, 2);

  const blob = new Blob([data], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = 'passwords-export.json';

  link.click();

  URL.revokeObjectURL(url);

  addToast('Export downloaded');
}


function importFile(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);

      if (!Array.isArray(data)) {
        throw new Error('Not an array');
      }

      const passwords = [];

      data.forEach(function (item) {
        passwords.push({
          id: item.id || uid(),
          site: item.site || 'Untitled',
          url: item.url || '',
          username: item.username || '',
          password: item.password || '',
          notes: item.notes || '',
          favorite: !!item.favorite,
          updatedAt: item.updatedAt || Date.now()
        });
      });

      state.passwords = passwords.concat(state.passwords);

      persist();

      addToast('Imported ' + passwords.length + ' passwords');

      render();
    } catch (error) {
      addToast('Invalid JSON file', true);
    }
  };

  reader.readAsText(file);
}


// delete confirmation

function requestDelete(password) {
  state.confirmAction = {
    type: 'delete',
    id: password.id,
    site: password.site
  };

  document.getElementById('confirmTitle').textContent =
    'Delete password?';

  document.getElementById('confirmMessage').textContent =
    'This will permanently delete the saved login for "' +
    password.site +
    '".';

  document.getElementById('confirmYesBtn').textContent = 'Delete';

  document.getElementById('confirmOverlay').classList.add('open');
}


function requestClearAll() {
  state.confirmAction = {
    type: 'clearAll'
  };

  document.getElementById('confirmTitle').textContent =
    'Clear all data?';

  document.getElementById('confirmMessage').textContent =
    'This permanently removes every saved password from this device.';

  document.getElementById('confirmYesBtn').textContent =
    'Clear all';

  document.getElementById('confirmOverlay').classList.add('open');
}


function cancelConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');

  state.confirmAction = null;
}


function confirmYes() {
  const action = state.confirmAction;

  if (!action) {
    return;
  }

  if (action.type === 'delete') {
    state.passwords = state.passwords.filter(function (password) {
      return password.id !== action.id;
    });

    addToast('Password deleted');
  }

  if (action.type === 'clearAll') {
    state.passwords = [];

    addToast('All data cleared');
  }

  persist();

  cancelConfirm();

  render();
} 