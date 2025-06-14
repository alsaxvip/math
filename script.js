document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'https://docs.google.com/sheets/d/e/2PACX-1vRs-RK5zrgpKBUJAKD6pCXmLAfqWgHDSyzY9rgAJMFnvzyO-iyyFRlqVKnhUQQlzJp_pPAAbJFQljX_/pub?gid=1829383988&single=true&output=csv';
    let studentData = [];
    let csvHeaders = [];

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

    async function fetchAndParseCSV() {
        loginSection.classList.add('hidden');
        loadingElement.classList.remove('hidden');
        loadingElement.textContent = "Memuat data..."; // Pastikan teks loading muncul

        try {
            const response = await fetch(csvUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            console.log("--- DEBUG: RAW CSV TEXT ---");
            console.log(text.substring(0, 500) + '...'); // Log hanya 500 karakter pertama
            console.log("--- END RAW CSV TEXT ---");
            
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            if (lines.length < 2) {
                console.error("CSV data is too short or malformed.");
                loadingElement.textContent = "Gagal memuat data: Data tidak ditemukan atau tidak valid.";
                loadingElement.style.color = 'var(--red)';
                return;
            }

            // Capture actual CSV headers and ensure trimming
            csvHeaders = lines[0].split(',').map(header => header.trim());
            console.log("--- DEBUG: Parsed CSV Headers ---");
            console.log(csvHeaders); // Log semua header
            console.log("--- END Parsed CSV Headers ---");
            
            studentData = lines.slice(1).map(line => {
                const values = line.split(',');
                let row = {};
                csvHeaders.forEach((header, index) => {
                    // Ensure values are also trimmed
                    row[header] = values[index] ? values[index].trim() : '';
                });
                return row;
            });
            
            console.log("--- DEBUG: Sample Student Data (first 3) ---");
            console.log(studentData.slice(0, 3)); // Log 3 data siswa pertama
            console.log("Total students loaded:", studentData.length);
            console.log("--- END Sample Student Data ---");

            loadingElement.classList.add('hidden');
            loginSection.classList.remove('hidden');

        } catch (error) {
            console.error("Error fetching or parsing CSV:", error);
            loadingElement.textContent = `Gagal memuat data: ${error.message}. Mohon coba lagi.`;
            loadingElement.style.color = 'var(--red)';
        }
    }

    loginButton.addEventListener('click', () => {
        const nisn = nisnInput.value.trim();
        console.log("--- DEBUG: NISN entered by user ---");
        console.log(`'${nisn}' (length: ${nisn.length})`); // Log NISN yang dimasukkan dan panjangnya
        console.log("--- END NISN entered ---");

        if (nisn) {
            displayStudentGrades(nisn);
        } else {
            alert('Harap masukkan NISN Anda.');
        }
    });

    function displayStudentGrades(nisn) {
        if (studentData.length === 0) {
            alert('Data nilai belum dimuat. Mohon tunggu sebentar lalu coba lagi.');
            return;
        }
        
        let studentFound = false;
        let foundStudent = null;

        for (const student of studentData) {
            // Ini akan membandingkan string. Pastikan tidak ada karakter tak terlihat.
            if (student.NISN === nisn) {
                studentFound = true;
                foundStudent = student;
                break; // Hentikan pencarian jika sudah ditemukan
            }
        }
        
        console.log("--- DEBUG: Student find result ---");
        console.log("Student found (true/false):", studentFound);
        console.log("Found student object (or null):", foundStudent);
        console.log("--- END Student find result ---");


        if (studentFound) {
            loginSection.classList.add('hidden');
            studentInfoSection.classList.remove('hidden');
            gradesTableContainer.classList.remove('hidden');

            namaLengkapSpan.textContent = foundStudent['NAMA LENGKAP'] || '-';
            nisnSpan.textContent = foundStudent.NISN || '-';
            kelasSpan.textContent = foundStudent.KELAS || '-';
            predikatSpan.textContent = foundStudent.PREDIKAT || '-';

            gradesTableBody.innerHTML = '';

            aspectMapping.forEach(aspect => {
                const row = gradesTableBody.insertRow();
                const aspectCell = row.insertCell(0);
                const valueCell = row.insertCell(1);

                aspectCell.textContent = aspect;

                let gradeValue = foundStudent[aspect]; 
                
                if (gradeValue !== undefined && gradeValue !== null && gradeValue !== '') {
                    const parsedValue = parseFloat(gradeValue);
                    if (!isNaN(parsedValue)) {
                        valueCell.textContent = Math.round(parsedValue);
                    } else {
                        valueCell.textContent = '-';
                        row.classList.add('incorrect-row');
                    }
                } else {
                    valueCell.textContent = '-';
                    row.classList.add('incorrect-row');
                }

                if (highlight
