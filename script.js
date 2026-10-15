// Şifrə Gösterme/Gizleme (Giriş ekranı - Qətiyyən toxunulmur)
function togglePassword() {
    const pwdInput = document.getElementById('password');
    const icon = document.getElementById('toggle-eye');
    if (!pwdInput) return;

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        pwdInput.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pwdInput = document.getElementById('password');
    if (pwdInput) {
        pwdInput.addEventListener('input', validatePasswordLive);
    }
});

function validatePasswordLive() {
    const pwdInput = document.getElementById('password');
    if (!pwdInput) return false;

    const password = pwdInput.value;

    const reqs = {
        len: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^a-zA-Z0-9]/.test(password)
    };

    updateRequirementUI('req-len', reqs.len);
    updateRequirementUI('req-upper', reqs.upper);
    updateRequirementUI('req-lower', reqs.lower);
    updateRequirementUI('req-num', reqs.number);
    updateRequirementUI('req-spec', reqs.special);

    return reqs.len && reqs.upper && reqs.lower && reqs.number && reqs.special;
}

function updateRequirementUI(elementId, isValid) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (isValid) {
        el.classList.add('valid');
        el.classList.remove('invalid');
        el.querySelector('i').className = 'fa-solid fa-circle-check';
    } else {
        el.classList.add('invalid');
        el.classList.remove('valid');
        el.querySelector('i').className = 'fa-solid fa-circle-xmark';
    }
}

function handleLogin(event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();

    if (!email.includes('@') || email.indexOf('@') === 0) {
        showError("Düzgün e-poçt ünvanı daxil edin!");
        return;
    }

    if (!validatePasswordLive()) {
        showError("Şifrə bütün 5 təhlükəsizlik şərtini ödəməlidir!");
        return;
    }

    hideError();
    localStorage.setItem('user_email', email);
    showMainApp(email);
}

function showError(msg) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerText = msg;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.classList.add('hidden');
}

function showMainApp(email) {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.classList.remove('hidden');
        mainApp.style.display = 'block';
    }
    
    const displayEmail = document.getElementById('user-display-email');
    if (displayEmail) displayEmail.innerText = email;
    
    fetchPlaces();
}

function logout() {
    localStorage.removeItem('user_email');
    location.reload();
}

window.onload = function() {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
        showMainApp(savedEmail);
    }
};

let allPlaces = [];

async function fetchPlaces() {
    const container = document.getElementById('places-list');
    if (!container) return;

    try {
        const response = await fetch('/api/places');
        const places = await response.json();
        allPlaces = places;

        renderPlaces(allPlaces);
    } catch (error) {
        console.error('Data xətası:', error);
        container.innerHTML = `
            <div class="no-data">
                <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger);"></i>
                <h3>Məlumatları yükləyərkən xəta baş verdi</h3>
                <p>Zəhmət olmasa PostgreSQL serverinin işlədiyini yoxlayın.</p>
            </div>`;
    }
}

// Burada yalnız Base64 kodu göstərilir, "Çözülmüş" hissəsi tamamilə yoxdur
function renderPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    if (!places || places.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fa-solid fa-plane-slash"></i>
                <h3>Heç bir məkan tapılmadı</h3>
                <p>Axtarışınıza uyğun nəticə mövcud deyil.</p>
            </div>`;
        return;
    }

    container.innerHTML = places.map(place => {
        const imgUrl = place.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
        
        return `
        <div class="card">
            <div class="card-img-wrapper">
                <span class="card-badge">Şifrələnmiş Məkan</span>
                <img src="${imgUrl}" alt="Turistik Məkan">
            </div>
            <div class="card-content">
                <h3 class="card-title" style="font-family: monospace; font-size: 1.1rem; color: var(--primary);">🔒 ${place.title}</h3>
                <p class="card-desc">${place.description || 'Bu məkan üçün əlavə məlumat yoxdur.'}</p>
                
                <div class="crypto-box">
                    <div class="crypto-row">
                        <span class="crypto-label"><i class="fa-solid fa-shield-halved" style="color: var(--primary);"></i> Base64 Kodu:</span>
                        <span class="crypto-code">${place.secret_code || 'Yoxdur'}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function filterPlaces() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = allPlaces.filter(place => 
        place.title.toLowerCase().includes(query) || 
        (place.description && place.description.toLowerCase().includes(query))
    );
    renderPlaces(filtered);
}