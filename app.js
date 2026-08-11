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