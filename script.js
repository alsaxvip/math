document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs-RK5zrgpKBUJAKD6pCXmLAfqWgHDSyzY9rgAJMFnvzyO-iyyFRlqVKnhUQQlzJp_pPAAbJFQljX_/pub?gid=1829383988&single=true&output=csv';
    let studentData = [];
    let csvHeaders = []; // To store the actual headers from the CSV

    const loadingElement = document.getElementById('loading');
    const loginSection = document.getElementById('login-section');
    const nisnInput = document.getElementById('nisn-input');
    const loginButton = document.getElementById('login-button');
    const studentInfoSection = document.getElementById('student-info');
    const namaLengkapSpan = document.getElementById('nama-lengkap');
    const nisnSpan = document.getElementById('nisn');
    const kelasSpan = document.getElementById('kelas');
    const predikatSpan = document.getElementById('predikat');
    const gradesTableContainer = document.getElementById('grades-table-container');
    const gradesTableBody = document.getElementById('grades-table-body');

    const aspectMapping = [
        "LKS BAB 1", "LKS BAB 2", "LKS BAB 3",
        "CATATAN TUGAS BAB 1", "CATATAN TUGAS BAB 2", "CATATAN TUGAS BAB 3",
        "KETERAMPILAN BAB 1", "KETERAMPILAN BAB 2", "KETERAMPILAN BAB 3",
        "ATS LKS", "ATS ASLI", "ATS PERBAIKAN 25 SOAL",
        "AAS LKS", "AAS ASLI",
        "PENILAIAN HARIAN", "NILAI AKHIR ATS", "NILAI AKHIR AAS"
    ];

    const highlightYellowRows = ["PENILAIAN HARIAN", "NILAI AKHIR ATS", "NILAI AKHIR AAS"];

    // Function to parse CSV data
    async function fetchAndParseCSV() {
        // Tampilkan loading saat mulai mengambil data
        loginSection.classList.add('hidden'); // Sembunyikan form login sementara
        loadingElement.classList.remove('hidden'); // Tampilkan pesan loading

        try {
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            if (lines.length < 2) {
                console.error("CSV data is too short or malformed.");
                loadingElement.textContent = "Gagal memuat data: Data tidak ditemukan atau tidak valid.";
                loadingElement.style.color = 'var(--red)';
                return;
            }

            // Capture actual CSV headers
            csvHeaders = lines[0].split(',').map(header => header.trim());
            
            studentData = lines.slice(1).map(line => {
                const values = line.split(',');
                let row = {};
                csvHeaders.forEach((header, index) => {
                    row[header] = values[index] ? values[index].trim() : '';
                });
                return row;
            });
            
            console.log("CSV Headers:", csvHeaders); // Debugging
            console.log("Parsed Student Data:", studentData); // Debugging

            loadingElement.classList.add('hidden'); // Sembunyikan loading
            loginSection.classList.remove('hidden'); // Tampilkan kembali form login

        } catch (error) {
            console.error("Error fetching or parsing CSV:", error);
            loadingElement.textContent = `Gagal memuat data: ${error.message}. Mohon coba lagi.`;
            loadingElement.style.color = 'var(--red)';
        }
    }

    // Login functionality
    loginButton.addEventListener('click', () => {
        const nisn = nisnInput.value.trim();
        if (nisn) {
            displayStudentGrades(nisn);
        } else {
            alert('Harap masukkan NISN Anda.');
        }
    });

    function displayStudentGrades(nisn) {
        // Pastikan studentData sudah dimuat sebelum mencari
        if (studentData.length === 0) {
            alert('Data nilai belum dimuat. Mohon tunggu sebentar lalu coba lagi.');
            return;
        }

        const student = studentData.find(s => s.NISN === nisn);

        if (student) {
            // Sembunyikan login, tampilkan info siswa dan nilai
            loginSection.classList.add('hidden');
            studentInfoSection.classList.remove('hidden');
            gradesTableContainer.classList.remove('hidden');

            namaLengkapSpan.textContent = student['NAMA LENGKAP'] || '-';
            nisnSpan.textContent = student.NISN || '-';
            kelasSpan.textContent = student.KELAS || '-';
            predikatSpan.textContent = student.PREDIKAT || '-';

            gradesTableBody.innerHTML = ''; // Hapus data sebelumnya

            aspectMapping.forEach(aspect => {
                const row = gradesTableBody.insertRow();
                const aspectCell = row.insertCell(0);
                const valueCell = row.insertCell(1);

                aspectCell.textContent = aspect;

                let gradeValue = '';
                // Asumsi: Header kolom di CSV persis sama dengan `aspectMapping`
                // Atau, jika tidak, kita perlu indeks kolom yang akurat dari `csvHeaders`
                gradeValue = student[aspect]; 
                
                if (gradeValue !== undefined && gradeValue !== null && gradeValue !== '') {
                    const parsedValue = parseFloat(gradeValue);
                    if (!isNaN(parsedValue)) {
                        valueCell.textContent = Math.round(parsedValue);
                    } else {
                        valueCell.textContent = '-'; // Bukan angka, tampilkan sebagai kosong
                        row.classList.add('incorrect-row'); // Highlight jika nilai tidak valid
                    }
                } else {
                    valueCell.textContent = '-'; // Tampilkan '-' untuk nilai yang kosong
                    row.classList.add('incorrect-row'); // Highlight jika nilai hilang
                }

                if (highlightYellowRows.includes(aspect)) {
                    row.classList.add('highlight-yellow');
                }
            });

        } else {
            alert('NISN tidak ditemukan. Harap periksa kembali.');
        }
    }

    // Panggil fungsi pengambilan data saat halaman dimuat
    fetchAndParseCSV();
});
