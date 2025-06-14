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
            
            // console.log("CSV Headers:", csvHeaders); // For debugging
            // console.log("Parsed Student Data:", studentData); // For debugging

            loadingElement.classList.add('hidden');
            loginSection.classList.remove('hidden'); // Show login section after data is loaded

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
        const student = studentData.find(s => s.NISN === nisn);

        if (student) {
            // Hide login, show student info and grades
            loginSection.classList.add('hidden');
            studentInfoSection.classList.remove('hidden');
            gradesTableContainer.classList.remove('hidden');

            namaLengkapSpan.textContent = student['NAMA LENGKAP'] || '-';
            nisnSpan.textContent = student.NISN || '-';
            kelasSpan.textContent = student.KELAS || '-';
            predikatSpan.textContent = student.PREDIKAT || '-';

            gradesTableBody.innerHTML = ''; // Clear previous data

            // Find the starting index for grade values (column E is index 4 in 0-indexed array)
            // Assuming the order of columns after 'PREDIKAT' directly maps to `aspectMapping`
            const firstGradeColumnIndex = csvHeaders.indexOf('LKS BAB 1'); // Assuming 'LKS BAB 1' is the first grade column. Adjust if different.
            if (firstGradeColumnIndex === -1) {
                // Fallback: If 'LKS BAB 1' not found as a header, assume it starts after the first 4 fixed columns
                // This is less robust but might work if headers are not exact match but order is fixed.
                console.warn("Header 'LKS BAB 1' not found. Assuming grade data starts from 5th column.");
                // This means the index 4 (E) is LKS BAB 1, 5 (F) is LKS BAB 2, etc.
                // We will use `aspectMapping` to get the value by position in `student` object (which is an object of key-value pairs).
                // It's better to rely on actual CSV headers. Let's make sure the `csvHeaders` capture the exact names.
            }

            aspectMapping.forEach((aspect, index) => {
                const row = gradesTableBody.insertRow();
                const aspectCell = row.insertCell(0);
                const valueCell = row.insertCell(1);

                aspectCell.textContent = aspect;

                let gradeValue = '';
                // Get the actual CSV header name for this aspect
                // This assumes the order of `aspectMapping` matches the order of grade columns in CSV.
                // If CSV headers are exactly like `aspectMapping` items, we can directly use `student[aspect]`.
                // If not, we need to map the `aspectMapping` items to specific CSV column names.
                // Given the prompt, let's assume the CSV headers *are* the aspect names provided.
                
                gradeValue = student[aspect]; // Direct lookup by aspect name (assuming exact header match)

                if (gradeValue !== undefined && gradeValue !== null && gradeValue !== '') {
                    const parsedValue = parseFloat(gradeValue);
                    if (!isNaN(parsedValue)) {
                        valueCell.textContent = Math.round(parsedValue);
                    } else {
                        valueCell.textContent = '-'; // Not a number, display as empty
                        row.classList.add('incorrect-row'); // Highlight if value is not a valid number
                    }
                } else {
                    valueCell.textContent = '-'; // Display '-' for empty values
                    row.classList.add('incorrect-row'); // Highlight if value is missing
                }

                if (highlightYellowRows.includes(aspect)) {
                    row.classList.add('highlight-yellow');
                }
            });

        } else {
            alert('NISN tidak ditemukan. Harap periksa kembali.');
        }
    }

    // Initial data fetch when the page loads
    fetchAndParseCSV();
});
