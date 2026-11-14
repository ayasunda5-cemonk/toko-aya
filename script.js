let produkList = [];

// Saat halaman dimuat, ambil data JSON dan update badge keranjang
document.addEventListener("DOMContentLoaded", () => {
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) throw new Error("Gagal memuat file JSON");
            return response.json();
        })
        .then(data => {
            produkList = data;
            
            // Jika berada di halaman index.html (ada elemen product-list)
            if (document.getElementById('product-list')) {
                tampilkanProduk(produkList);
            }
            
            // Jika berada di halaman keranjang.html (ada elemen cart-container)
            if (document.getElementById('cart-container')) {
                tampilkanKeranjang();
            }

            updateBadgeKeranjang();
        })
        .catch(error => console.error('Error:', error));
});

// Fungsi menampilkan produk di halaman utama
function tampilkanProduk( produkArray ) {
    const container = document.getElementById('product-list');
    container.innerHTML = "";

    produkArray.forEach(produk => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${produk.gambar}" alt="${produk.nama}" onerror="this.src='https://via.placeholder.com/150'">
                <span class="category">${produk.kategori.toUpperCase()}</span>
                <h4>${produk.nama}</h4>
                <p class="price">Rp ${parseInt(produk.harga).toLocaleString('id-ID')}</p>
                <p class="desc">${produk.deskripsi}</p>
                <button onclick="tambahKeKeranjang('${produk.id}')" class="btn-primary">+ Keranjang</button>
            </div>
        `;
    });
}

// Fungsi tambah produk ke keranjang (localStorage)
function tambahKeKeranjang(idProduk) {
    let produk = produkList.find(p => p.id === idProduk);
    if (!produk) return;

    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];

    let index = keranjang.findIndex(p => p.id === idProduk);
    if (index !== -1) {
        keranjang[index].jumlah = (keranjang[index].jumlah || 1) + 1;
    } else {
        keranjang.push({ ...produk, jumlah: 1 });
    }

    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    updateBadgeKeranjang();
    alert(`"${produk.nama}" berhasil ditambahkan ke keranjang!`);
}

// Update angka pada badge keranjang di navbar
function updateBadgeKeranjang() {
    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
    let totalItem = keranjang.reduce((sum, item) => sum + (item.jumlah || 1), 0);
    
    document.querySelectorAll('#cart-count').forEach(el => {
        el.innerText = totalItem;
    });
}

// Fungsi menampilkan isi keranjang di keranjang.html
function tampilkanKeranjang() {
    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
    let container = document.getElementById('cart-container');
    let totalHargaElem = document.getElementById('total-harga');
    let checkoutContainer = document.getElementById('checkout-container');

    if (keranjang.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">Keranjang belanja masih kosong. <a href="index.html" style="color: #10b981;">Belanja sekarang</a></p>`;
        totalHargaElem.innerText = "Rp 0";
        checkoutContainer.innerHTML = "";
        return;
    }

    let html = "";
    let totalBelanja = 0;

    keranjang.forEach((item, index) => {
        let subtotal = parseInt(item.harga) * item.jumlah;
        totalBelanja += subtotal;

        html += `
            <div class="cart-item">
                <div class="cart-info">
                    <h4>${item.nama}</h4>
                    <p>Rp ${parseInt(item.harga).toLocaleString('id-ID')} x ${item.jumlah}</p>
                    <strong>Subtotal: Rp ${subtotal.toLocaleString('id-ID')}</strong>
                </div>
                <div class="cart-actions">
                    <button onclick="ubahJumlah(${index}, -1)">-</button>
                    <span>${item.jumlah}</span>
                    <button onclick="ubahJumlah(${index}, 1)">+</button>
                    <button onclick="hapusItem(${index})" class="btn-danger">Hapus</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalHargaElem.innerText = "Rp " + totalBelanja.toLocaleString('id-ID');

    // Munculkan tombol checkout WhatsApp
    checkoutContainer.innerHTML = `
        <button onclick="checkoutWhatsApp()" class="btn-whatsapp">
            Checkout via WhatsApp
        </button>
    `;
}

// Ubah jumlah quantity (+ / -)
function ubahJumlah(index, aksi) {
    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
    keranjang[index].jumlah += aksi;

    if (keranjang[index].jumlah <= 0) {
        keranjang.splice(index, 1);
    }

    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    tampilkanKeranjang();
    updateBadgeKeranjang();
}

// Hapus item dari keranjang
function hapusItem(index) {
    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
    keranjang.splice(index, 1);
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    tampilkanKeranjang();
    updateBadgeKeranjang();
}

// Kirim pesanan langsung ke WhatsApp
function checkoutWhatsApp() {
    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
    if (keranjang.length === 0) return;

    let pesan = "Halo Toko-aya, saya ingin memesan:%0A%0A";
    let total = 0;

    keranjang.forEach((item, i) => {
        let subtotal = parseInt(item.harga) * item.jumlah;
        pesan += `${i + 1}. ${item.nama} (${item.jumlah}x) - Rp ${subtotal.toLocaleString('id-ID')}%0A`;
        total += subtotal;
    });

    pesan += `%0A*Total Belanja: Rp ${total.toLocaleString('id-ID')}*`;
    
    // Nomor WhatsApp tujuan (Format internasional tanpa angka 0 di depan)
    let nomorWA = "6285156116154"; 
    
    window.open(`https://wa.me/${nomorWA}?text=${pesan}`, '_blank');
}
// Fungsi untuk menampilkan info QRIS jika dipilih
function cekMetodePembayaran() {
    let select = document.getElementById('metode-pembayaran');
    let infoQris = document.getElementById('info-qris');
    
    if (select && infoQris) {
        if (select.value.includes("QRIS")) {
            infoQris.style.display = "block";
        } else {
            infoQris.style.display = "none";
        }
    }
}

// Perbarui fungsi checkoutWhatsApp untuk menyertakan metode pembayaran
function checkoutWhatsApp() {
    let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
    if (keranjang.length === 0) return;

    // Ambil pilihan metode pembayaran dari dropdown
    let selectMetode = document.getElementById('metode-pembayaran');
    let metodePilihan = selectMetode ? selectMetode.value : "Konfirmasi via WhatsApp";

    let pesan = "Halo Toko-aya, saya ingin memesan:%0A%0A";
    let total = 0;

    keranjang.forEach((item, i) => {
        let subtotal = parseInt(item.harga) * item.jumlah;
        pesan += `${i + 1}. ${item.nama} (${item.jumlah}x) - Rp ${subtotal.toLocaleString('id-ID')}%0A`;
        total += subtotal;
    });

    pesan += `%0A*Total Belanja: Rp ${total.toLocaleString('id-ID')}*`;
    pesan += `%0A*Metode Pembayaran: ${metodePilihan}*`;
    pesan += `%0A%0ATolong info selanjutnya ya, terima kasih!`;
    
    // Nomor WhatsApp tujuan
    let nomorWA = "6285156116154"; 
    
    window.open(`https://wa.me/${nomorWA}?text=${pesan}`, '_blank');
}