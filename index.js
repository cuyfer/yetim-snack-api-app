const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const app = express();
const port = 3300;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(cors());
require('dotenv').config();



const jamSekarang = new Date().getHours();
let waktuSekarang;

if (jamSekarang < 12) {
    waktuSekarang = "Pagi";
} else if (jamSekarang < 15) {
    waktuSekarang = "Siang";
} else if (jamSekarang < 18) {
    waktuSekarang = "Sore";
} else {
    waktuSekarang = "Malam";
}


// Inisialisasi client WhatsApp dengan LocalAuth untuk menyimpan sesi
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Tampilkan QR code di terminal
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('OK sudah konek Whatsapp!');
});
// Route untuk mendapatkan data user dengan metode POST
app.post('/user', (req, res) => {
    try {
        const { nomorTelepon, PrivateKey } = req.body;

        // Dekripsi nomor telepon dan private key
        const PrivateKeyAsli = PrivateKey;
        const nomorTeleponAsli = nomorTelepon; // Hati-hati, jika nomor telepon tidak dienkripsi dengan metode ini

        const data = {
            pesan: "Batur Yetim 📢 Maaci ya udah jadi *Yetim Seller* Kamu Dapet Kiriman Kunci Nih, Jangan Kasih Tau Siapa Siapa 🤫 yaa, \nLangsung copy aja Private Key:👇",
            key: PrivateKeyAsli,
            nomor: nomorTeleponAsli
        };

        // Mengirim pesan WhatsApp berdasarkan data dari request
        const number = `${nomorTeleponAsli}@c.us`; // Pastikan format nomor WhatsApp benar
        const pesan = `${data.pesan}`;
        const privateKey = `${data.key}`;

        client.sendMessage(number, pesan).then(response => {
            console.log('Pesan terkirim:', response);
            client.sendMessage(number, privateKey).then(response => {
                console.log('Private Key terkirim:', response);
                res.status(200).json({ message: 'Pesan dan Private Key WhatsApp terkirim.', response });
            }).catch(err => {
                console.error('Error saat mengirim Private Key:', err);
                res.status(500).json({ error: 'Gagal mengirim Private Key WhatsApp.', detail: err.message });
            });
        }).catch(err => {
            console.error('Error saat mengirim pesan:', err);
            res.status(500).json({ error: 'Gagal mengirim pesan WhatsApp.', detail: err.message });
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Ada Masalah Dalam Server. Cek Lebih Lanjut: ' + error);
    }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '/upload/bukti');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload/bukti', upload.single('foto'), (req, res) => {
    console.log('sudah di akses!!')
  try {
    res.status(200).json({ message: 'Foto berhasil diupload' });
  } catch (error) {
    console.log(error);
    res.status(500).send('Ada Masalah Dalam Server. Cek Lebih Lanjut: ' + error);
  }
});

app.get('/ambil-bukti-reseller', (req, res) => {
  try {
    const uploadPath = path.join(__dirname, '/upload/bukti');
    const files = fs.readdirSync(uploadPath);
    const fotoList = files.map(file => {
      return {
        filename: file,
        filepath: `${uploadPath}/${file}`
      };
    });
    res.status(200).json(fotoList);
  } catch (error) {
    console.log(error);
    res.status(500).send('Ada Masalah Dalam Server. Cek Lebih Lanjut: ' + error);
  }
});

// Listener pesan dari WhatsApp
client.on('message', async (message) => {
    console.log(`Ada Yang Chat: ${message.body} [dari nomor ${message.from} dengan status: ${message.isStatus ? 'Status' : 'Pesan'}]`);

    if (message.body === 'cape') {
        message.reply(`Hay Selamat ${waktuSekarang} saya adalah bot, jika kamu butuh bantuan silakan ke Google saja yaa (: sambil nyari solusi dari sebuah masalah kamu bisa sambil makan jajanan *Yetim Snack* lohh!, jika kamu cape lihatlah orang di depan kalian dia lebih cape di banding kalian, #Kata-kata hari-ini`);
    } 
});







client.initialize();

app.listen(port, () => {
    console.log("Server berjalan di http://localhost:" + port);
});
