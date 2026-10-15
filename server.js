const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'travel_db',
    password: process.env.DB_PASSWORD || '12345', 
    port: process.env.DB_PORT || 5432,
});

pool.connect()
    .then(() => console.log('✅ PostgreSQL Veritabanına uğurla bağlandı.'))
    .catch(err => console.error('❌ Veritabanı bağlantı xətası:', err.stack));

// Base64 Şifrə Çözmə (UTF-8 dəstəyi ilə)
function decodeBase64(encodedString) {
    if (!encodedString) return '';
    try {
        return Buffer.from(encodedString, 'base64').toString('utf8');
    } catch(e) {
        return 'Xəta: Keçərsiz Base64';
    }
}

app.get('/api/places', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM places ORDER BY id DESC');
        
        const decodedPlaces = result.rows.map(place => ({
            ...place,
            decoded_secret: decodeBase64(place.secret_code)
        }));

        res.json(decodedPlaces);
    } catch (err) {
        console.error('Veritabanı sorğu xətası:', err.message);
        res.status(500).json({ error: 'Server xətası baş verdi' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server işləyir: http://localhost:${PORT}`);
});