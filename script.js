const app = document.getElementById("app");

const judul = document.createElement("h2");
judul.textContent = "Selamat datang di DailyBoard!";
app.appendChild(judul);

judul.style.color = "#070d1a";

const dashboard = document.createElement("div");
dashboard.className = "dashboard";

const kolomKanan = document.createElement("div");
kolomKanan.className = "kolomkanan";

const kolomKiri = document.createElement("div");
kolomKiri.className = "kolomkiri";

app.appendChild(dashboard);

dashboard.appendChild(kolomKanan);
dashboard.appendChild(kolomKiri);

const tugas = document.createElement("section");
tugas.textContent = "Tugas";
kolomKiri.appendChild(tugas);

const cariTugas = document.createElement("input");
cariTugas.placeholder = "Cari tugas...";
tugas.appendChild(cariTugas);

const input = document.createElement("input");
input.placeholder = "Masukkan nama tugas";
tugas.appendChild(input);

const tombol = document.createElement("button");
tombol.textContent = "Tambah";
tugas.appendChild(tombol);

const tombolSemua = document.createElement("button");
tombolSemua.textContent = "Semua";
tugas.appendChild(tombolSemua);

const tombolSelesai = document.createElement("button");
tombolSelesai.textContent = "Selesai";
tugas.appendChild(tombolSelesai);

const tombolBelum = document.createElement("button");
tombolBelum.textContent = "Belum Selesai";
tugas.appendChild(tombolBelum);

const list = document.createElement("ul");
list.id = "daftar-tugas";
tugas.appendChild(list);

let daftarTugas = [
    { id: 1, nama: "Belajar JavaScript", selesai: false },
    { id: 2, nama: "Olahraga pagi", selesai: false }
];

let nextId = 3;

function validasiInput(nilai) {
    if (nilai.trim() === "") {
        alert("Input tidak boleh kosong!");
        return false;
    }

    if (nilai.length > 100) {
        alert("Input maksimal 100 karakter!");
        return false;
    }

    return true;
}

function simpanKeStorage() {
    localStorage.setItem("daftarTugas", JSON.stringify(daftarTugas));
}

function muatDariStorage() {
    const data = localStorage.getItem("daftarTugas");

    if (data) {
        daftarTugas = JSON.parse(data);

        if (daftarTugas.length > 0) {
            nextId = Math.max(...daftarTugas.map((t) => t.id)) + 1;
        }
    }
}

function tambahTugas(nama) {
    if (!validasiInput(nama)) {
        return;
    }

    daftarTugas.push({
        id: nextId++,
        nama: nama.trim(),
        selesai: false
    });

    simpanKeStorage();
    renderTugas();
}

function editTugas(id, namaBaru) {
    if (!validasiInput(namaBaru)) {
        return;
    }

    daftarTugas = daftarTugas.map((t) =>
        t.id === id
            ? { ...t, nama: namaBaru.trim() }
            : t
    );

    simpanKeStorage();
    renderTugas();
}

function hapusTugas(id) {
    daftarTugas = daftarTugas.filter((t) => t.id !== id);

    simpanKeStorage();
    renderTugas();
}

function toggleSelesai(id) {
    daftarTugas = daftarTugas.map((t) =>
        t.id === id
            ? { ...t, selesai: !t.selesai }
            : t
    );

    simpanKeStorage();
    renderTugas();
}

function aktifkanDragDrop() {
    const items = document.querySelectorAll(".tugas-item");

    items.forEach((item) => {
        item.setAttribute("draggable", true);

        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", item.dataset.id);
        });

        item.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        item.addEventListener("drop", (e) => {
            e.preventDefault();

            const idDipindahkan = Number(
                e.dataTransfer.getData("text/plain")
            );

            const idTujuan = Number(item.dataset.id);

            if (idDipindahkan === idTujuan) {
                return;
            }

            const indexAsal = daftarTugas.findIndex(
                (t) => t.id === idDipindahkan
            );

            const indexTujuan = daftarTugas.findIndex(
                (t) => t.id === idTujuan
            );

            if (indexAsal !== -1 && indexTujuan !== -1) {
                const [tugasDipindahkan] = daftarTugas.splice(
                    indexAsal,
                    1
                );

                daftarTugas.splice(
                    indexTujuan,
                    0,
                    tugasDipindahkan
                );

                simpanKeStorage();
                renderTugas();
            }
        });
    });
}

function renderTugas(filter = "semua", pencarian = "") {
    list.innerHTML = "";

    const tugasTersaring = daftarTugas.filter((t) => {
        if (filter === "selesai" && !t.selesai) {
            return false;
        }

        if (filter === "belum" && t.selesai) {
            return false;
        }

        if (
            pencarian &&
            !t.nama.toLowerCase().includes(pencarian.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    tugasTersaring.forEach((tugas) => {
        const li = document.createElement("li");
        li.className = "tugas-item";
        li.dataset.id = tugas.id;

        const nama = document.createElement("span");
        nama.textContent = tugas.nama;

        li.appendChild(nama);

        li.addEventListener("dblclick", (event) => {
            if (event.target.tagName === "BUTTON") {
                return;
            }

            const namaBaru = prompt(
                "Edit nama tugas:",
                tugas.nama
            );

            if (namaBaru !== null) {
                editTugas(tugas.id, namaBaru);
            }
        });

        const tombolSelesaiItem = document.createElement("button");
        tombolSelesaiItem.textContent = tugas.selesai
            ? "Batal Selesai"
            : "Selesai";

        tombolSelesaiItem.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleSelesai(tugas.id);
        });

        li.style.textDecoration = tugas.selesai
            ? "line-through"
            : "none";

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";

        tombolHapus.addEventListener("click", (event) => {
            event.stopPropagation();
            hapusTugas(tugas.id);
        });

        li.appendChild(tombolSelesaiItem);
        li.appendChild(tombolHapus);
        list.appendChild(li);
    });

    aktifkanDragDrop();
}

tombol.addEventListener("click", () => {
    const namaTugas = input.value;

    if (validasiInput(namaTugas)) {
        tambahTugas(namaTugas);
        input.value = "";
    }
});

tombolSemua.addEventListener("click", () => {
    renderTugas("semua", cariTugas.value);
});

tombolSelesai.addEventListener("click", () => {
    renderTugas("selesai", cariTugas.value);
});

tombolBelum.addEventListener("click", () => {
    renderTugas("belum", cariTugas.value);
});

cariTugas.addEventListener("input", () => {
    renderTugas("semua", cariTugas.value);
});

const catatan = document.createElement("section");
catatan.textContent = "Catatan";
kolomKiri.appendChild(catatan);

const textarea = document.createElement("textarea");
textarea.placeholder = "Tulis catatan cepat...";
catatan.appendChild(textarea);

const tombolCatatan = document.createElement("button");
tombolCatatan.textContent = "Tambah Catatan";
catatan.appendChild(tombolCatatan);

const containerCatatan = document.createElement("div");
containerCatatan.id = "daftar-catatan";
catatan.appendChild(containerCatatan);

let daftarCatatan = [];

function simpanCatatanKeStorage() {
    localStorage.setItem(
        "daftarCatatan",
        JSON.stringify(daftarCatatan)
    );
}

function muatCatatanDariStorage() {
    const data = localStorage.getItem("daftarCatatan");

    if (data) {
        daftarCatatan = JSON.parse(data);
    }
}

function tambahCatatan(isi) {
    if (!validasiInput(isi)) {
        return;
    }

    daftarCatatan.push({
        id: Date.now(),
        isi: isi.trim(),
        tanggal: new Date().toLocaleDateString()
    });

    simpanCatatanKeStorage();
    renderCatatan();
}

function editCatatan(id, isiBaru) {
    if (!validasiInput(isiBaru)) {
        return;
    }

    daftarCatatan = daftarCatatan.map((catatan) =>
        catatan.id === id
            ? { ...catatan, isi: isiBaru.trim() }
            : catatan
    );

    simpanCatatanKeStorage();
    renderCatatan();
}

function hapusCatatan(id) {
    daftarCatatan = daftarCatatan.filter(
        (catatan) => catatan.id !== id
    );

    simpanCatatanKeStorage();
    renderCatatan();
}

function renderCatatan() {
    containerCatatan.innerHTML = "";

    daftarCatatan.forEach((catatan) => {
        const div = document.createElement("div");
        div.className = "catatan-item";

        const isi = document.createElement("p");
        isi.textContent = catatan.isi;

        const tanggal = document.createElement("small");
        tanggal.textContent = catatan.tanggal;

        const tombolHapusCatatan =
            document.createElement("button");

        tombolHapusCatatan.textContent = "Hapus";

        tombolHapusCatatan.addEventListener("click", (event) => {
            event.stopPropagation();
            hapusCatatan(catatan.id);
        });

        div.appendChild(isi);
        div.appendChild(tanggal);
        div.appendChild(tombolHapusCatatan);

        div.addEventListener("dblclick", () => {
            const isiBaru = prompt(
                "Edit catatan:",
                catatan.isi
            );

            if (isiBaru !== null) {
                editCatatan(catatan.id, isiBaru);
            }
        });

        containerCatatan.appendChild(div);
    });
}

tombolCatatan.addEventListener("click", () => {
    const isiCatatan = textarea.value;

    if (validasiInput(isiCatatan)) {
        tambahCatatan(isiCatatan);
        textarea.value = "";
    }
});

const cuaca = document.createElement("section");

const judulCuaca = document.createElement("h3");
judulCuaca.textContent = "Cuaca Hari Ini";
cuaca.appendChild(judulCuaca);

const inputKota = document.createElement("input");
inputKota.placeholder = "Masukkan nama kota";
cuaca.appendChild(inputKota);

const tombolCuaca = document.createElement("button");
tombolCuaca.textContent = "Cek Cuaca";
cuaca.appendChild(tombolCuaca);

const infoCuaca = document.createElement("div");
infoCuaca.id = "info-cuaca";
cuaca.appendChild(infoCuaca);

kolomKanan.appendChild(cuaca);

async function ambilCuaca(kota) {
    const apiKey = "f2851a2fcf52fea1056c47b3603cff1b";

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(kota)}&appid=${apiKey}&units=metric&lang=id`;

    infoCuaca.textContent = "Memuat data cuaca...";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Kota tidak ditemukan atau API Key tidak valid."
            );
        }

        const data = await response.json();

        infoCuaca.innerHTML = `
            <p><strong>${data.name}</strong></p>
            <p>Suhu: ${data.main.temp}°C</p>
            <p>${data.weather[0].description}</p>
        `;
    } catch (error) {
        infoCuaca.textContent = error.message;
    }
}

tombolCuaca.addEventListener("click", () => {
    const kota = inputKota.value.trim();

    if (kota === "") {
        infoCuaca.textContent =
            "Silakan masukkan nama kota.";
        return;
    }

    ambilCuaca(kota);
});

const kutipan = document.createElement("div");
kutipan.id = "kutipan-harian";

const judulKutipan = document.createElement("h3");
judulKutipan.textContent = "Kutipan Hari Ini";

const isiKutipan = document.createElement("p");
isiKutipan.textContent = "Memuat kutipan...";

const tombolKutipan = document.createElement("button");
tombolKutipan.textContent = "Ganti kutipan";

kutipan.appendChild(judulKutipan);
kutipan.appendChild(isiKutipan);
kutipan.appendChild(tombolKutipan);

cuaca.appendChild(kutipan);

async function ambilKutipan() {
    try {
        const response = await fetch(
            "https://dummyjson.com/quotes/random"
        );

        if (!response.ok) {
            throw new Error("Gagal mengambil kutipan.");
        }

        const data = await response.json();

        isiKutipan.textContent = `"${data.quote}"`;
    } catch (error) {
        isiKutipan.textContent =
            "Kutipan gagal dimuat.";
    }
}

tombolKutipan.addEventListener(
    "click",
    ambilKutipan
);

const toggleTema = document.createElement("button");
toggleTema.id = "toggle-tema";
toggleTema.textContent = "Dark Mode";

document.querySelector("header").appendChild(toggleTema);

toggleTema.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const modeAktif =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "tema",
        modeAktif ? "gelap" : "terang"
    );

    toggleTema.textContent = modeAktif
        ? "Light Mode"
        : "Dark Mode";
});

function muatTema() {
    if (localStorage.getItem("tema") === "gelap") {
        document.body.classList.add("dark-mode");
        toggleTema.textContent = "Light Mode";
    }
}

muatDariStorage();
renderTugas();

muatCatatanDariStorage();
renderCatatan();

muatTema();
ambilKutipan();
